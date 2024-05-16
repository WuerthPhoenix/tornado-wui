<template>
  <div class="tool-bar">
    <div class="tenant-selector-container">
      <cv-dropdown
        :value="selectedTenant"
        :inline="true"
        :label="$tc('app.current_tenant')"
        @change="tenantSelected"
        v-if="isUserLoaded"
        :disabled="isEditModeActive && draftHasPendingChanges"
        class="tenant-dropdown"
      >
        <cv-dropdown-item
          v-for="tenant in tenants"
          :key="'tenant_' + tenant"
          :value="tenant"
          >{{ tenant }}</cv-dropdown-item
        >
      </cv-dropdown>
      <cv-dropdown-skeleton class="tenant-loading" v-else />
    </div>
    <div
      class="edit-mode-options"
      v-if="userHasEditPermissionAndProcessingTreeIsOpen"
    >
      <DraftChangesStatus
        v-if="isEditModeActive"
        :state="draftChangesState"
        :error-message="draftChangesErrorMessage"
      />
      <cv-tooltip
        alignment="center"
        direction="bottom"
        :tip="$tc('edit_mode.draft_status.save_changes')"
        v-if="showSaveDraftButton"
      >
        <cv-button
          kind="ghost"
          size="sm"
          class="edit-mode-button save-draft"
          @click="saveDraftChanges"
          :disabled="isSavingDraft"
        >
          <Save20 />
        </cv-button>
      </cv-tooltip>
      <cv-tooltip
        alignment="center"
        direction="bottom"
        :tip="$tc('edit_mode.draft_status.deploy_changes')"
        v-if="isEditModeActive"
      >
        <cv-button
          kind="ghost"
          size="sm"
          class="edit-mode-button deploy-draft"
          @click="askForDeployConfirmation"
          :disabled="isSavingDraft"
        >
          <Deploy20 />
        </cv-button>
      </cv-tooltip>
      <cv-tooltip
        alignment="center"
        direction="bottom"
        :tip="$tc('edit_mode.draft_status.delete_draft')"
        v-if="isEditModeActive"
      >
        <cv-button
          kind="ghost"
          size="sm"
          class="edit-mode-button left-margin-button delete-draft-confirmation"
          @click="openDeleteDraftConfirmationModal"
          :disabled="isSavingDraft"
        >
          <TrashCan20 />
        </cv-button>
      </cv-tooltip>

      <div class="edit-mode-switch-container">
        <span class="edit-mode-text">{{ $tc("edit_mode.edit_mode") }}</span>
        <span class="on-off-label" v-if="isEditModeActive">{{
          $tc("edit_mode.on")
        }}</span>
        <span class="on-off-label" v-else>{{ $tc("edit_mode.off") }}</span>
        <cv-toggle
          value="true"
          :checked="isEditModeActive"
          class="edit-mode-switch"
          @click.native.prevent="editModeChange"
          v-if="isUserLoaded"
          :hide-label="true"
          :disabled="isSavingDraft"
        >
        </cv-toggle>
        <cv-toggle-skeleton v-else />
      </div>

      <cv-tooltip
        alignment="center"
        direction="bottom"
        data-wp-direction="bottom-right"
        :tip="$tc('test_window.trigger_tooltip')"
      >
        <cv-button
          kind="ghost"
          size="sm"
          class="test-window-button"
          :class="
            testWindowOpened
              ? 'test-window-button--off'
              : 'test-window-button--on'
          "
          @click="toggleTestWindow"
        >
          <template v-if="!testWindowOpened">
            <span>{{ $tc("test_window.test_panel") }}</span>
            <Flash20 />
          </template>
          <template v-else>
            <ChevronRight20 />
          </template>
        </cv-button>
      </cv-tooltip>

      <confirmation-modal
        ref="deployConfirmationModal"
        class="confirm-draft-deploy-modal"
        :title="$tc('edit_mode.confirm_deploy_modal.title')"
        :content="$tc('edit_mode.confirm_deploy_modal.content')"
        :primaryButtonText="$tc('edit_mode.confirm_deploy_modal.deploy_draft')"
        :secondaryButtonText="$tc('test_window.cancel')"
        @primaryBtnClick="deployDraft"
      />
      <confirmation-modal
        class="delete-draft-confirmation-modal"
        ref="deleteDraftConfirmationModal"
        :title="$tc('edit_mode.delete_draft_confirmation_modal.title')"
        :content="$tc('edit_mode.delete_draft_confirmation_modal.content')"
        :primaryButtonText="$tc('views.processing_tree.delete')"
        :secondaryButtonText="$tc('test_window.cancel')"
        @primaryBtnClick="confirmDeleteDraft"
      />
      <confirmation-modal
        class="takeover-draft-confirmation-modal"
        ref="takeoverDraftConfirmationModal"
        :title="$tc('edit_mode.takeover_draft_confirmation_modal.title')"
        :content="$tc('edit_mode.takeover_draft_confirmation_modal.content')"
        :primaryButtonText="$tc('views.processing_tree.continue')"
        :secondaryButtonText="$tc('test_window.cancel')"
        @primaryBtnClick="confirmTakeoverDraft"
        @secondaryBtnClick="stopTakeoverDraft"
        @closeBtnClick="stopTakeoverDraft"
      />
      <confirmation-modal
        class="unsaved-changes-modal"
        ref="unsavedChangesModal"
        :title="$tc('edit_mode.unsaved_changes_modal.title')"
        :content="$tc('edit_mode.unsaved_changes_modal.content')"
        :primaryButtonText="$tc('views.processing_tree.continue')"
        :secondaryButtonText="$tc('test_window.cancel')"
        @primaryBtnClick="confirmDiscardUnsavedChanges"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Tornado, { AddNodeProcessMode } from "@/store/tornado";
import User from "@/store/user";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
// @ts-ignore
import Deploy20 from "@carbon/icons-vue/es/deploy/20";
// @ts-ignore
import Save20 from "@carbon/icons-vue/es/save/20";
// @ts-ignore
import Flash20 from "@carbon/icons-vue/es/flash/20";
// @ts-ignore
import ChevronRight20 from "@carbon/icons-vue/es/chevron--right/20";
// @ts-ignore
import TrashCan20 from "@carbon/icons-vue/es/trash-can/20";
import DraftChangesStatus, {
  DraftChangesState,
} from "@/components/DraftChangesStatus.vue";
import Notification from "@/store/notification";
import i18n from "@/utils/i18n";

import {
  CvDropdown,
  CvDropdownItem,
  CvDropdownSkeleton,
  // @ts-ignore
} from "@carbon/vue/src/components/cv-dropdown";
// @ts-ignore
import { CvTooltip } from "@carbon/vue/src/components/cv-tooltip";
// @ts-ignore
import { CvToggle } from "@carbon/vue/src/components/cv-toggle";
// @ts-ignore
import { CvButton } from "@carbon/vue/src/components/cv-button";

@Component({
  components: {
    DraftChangesStatus,
    Deploy20,
    Save20,
    Flash20,
    ChevronRight20,
    TrashCan20,
    ConfirmationModal,
    CvDropdown,
    CvDropdownItem,
    CvDropdownSkeleton,
    CvTooltip,
    CvToggle,
    CvButton,
  },
})
export default class ToolBar extends Vue {
  private isSavingDraft = false;
  private hasSaveDraftError = false;
  private draftChangesErrorMessage = "";
  private testWindowOpened = false;

  get isUserLoaded(): boolean {
    return User.info !== null;
  }

  get tenants(): string[] {
    let tenants: string[] = [];
    if (User.info) {
      tenants = Object.keys(User.info.user_tenants);
    }
    return tenants;
  }

  get processingTreeIsOpen(): boolean {
    return this.$route.fullPath === "/tree";
  }

  get userHasEditPermissionAndProcessingTreeIsOpen(): boolean {
    return this.processingTreeIsOpen && User.userHasEditPermissionInTenant;
  }

  get selectedTenant(): string {
    return User.selectedTenant;
  }

  get isEditModeActive(): boolean {
    return Tornado.editMode;
  }

  get showSaveDraftButton(): boolean {
    return (
      this.isEditModeActive &&
      this.draftHasPendingChanges &&
      this.draftChangesState !== "saving"
    );
  }

  get draftChangesState(): DraftChangesState {
    if (!this.draftHasPendingChanges) {
      return "saved";
    } else if (this.isSavingDraft) {
      return "saving";
    } else if (this.hasSaveDraftError) {
      return "error";
    } else {
      return "unsaved";
    }
  }

  get draftHasPendingChanges(): boolean {
    return !Tornado.actionsQueue.isEmpty();
  }

  private toggleTestWindow(): void {
    this.testWindowOpened = !this.testWindowOpened;
    this.$emit("toggleShift", this.testWindowOpened);
  }

  async tenantSelected(tenant: string): Promise<void> {
    await User.setSelectedTenant(tenant);
  }

  private openDeleteDraftConfirmationModal() {
    if (this.$refs.deleteDraftConfirmationModal) {
      (
        this.$refs.deleteDraftConfirmationModal as ConfirmationModal
      ).showModal();
    }
  }

  private async confirmDeleteDraft(): Promise<void> {
    await Tornado.deleteDraft();
    if (Tornado.draftId === null) {
      Tornado.actionsQueue.empty();
      Tornado.resetEditedNodes();
      Tornado.setCurrentEditMode(false);
      Tornado.setAddNodeSelectParentMode(AddNodeProcessMode.none);
    }
  }

  private async editModeChange(): Promise<void> {
    if (this.draftHasPendingChanges) {
      this.openUnsavedChangesModal();
      return;
    }

    // Reset draft changes status
    this.isSavingDraft = false;
    this.hasSaveDraftError = false;
    Tornado.actionsQueue.empty();
    Tornado.resetEditedNodes();

    //flip edit mode value to intended one
    let editModeNewValue = !this.isEditModeActive;

    //if we would like to enter edit mode
    if (editModeNewValue) {
      //get the list of drafts
      if (!(await Tornado.getDraft())) {
        return;
      }

      //if there is no draft try to create one
      if (Tornado.draftId === null && !(await Tornado.createDraft())) {
        return;
      }

      //try to load the draft
      try {
        await Tornado.loadDraft();
        //if we managed to have a valid draft id
        Tornado.setCurrentEditMode(true);
        Tornado.setProcessedEvent(null);
      } catch (error) {
        if (
          error.response.status === 403 &&
          error.response.data.code === "NOT_OWNER"
        ) {
          this.showTakeoverModal();
          return;
        }
      }
    } else {
      //set loading tree
      Tornado.setTreeIsLoading(true);

      Tornado.setCurrentDraftId(null);
      Tornado.setDraftTree([]);
      Tornado.setProcessedEvent(null);

      //Swap back the original tree
      await Tornado.restoreCurrentActiveConfiguration();
      Tornado.setCurrentEditMode(false);
      Tornado.setAddNodeSelectParentMode(AddNodeProcessMode.none);
    }
  }

  private askForDeployConfirmation(): void {
    if (this.$refs.deployConfirmationModal) {
      (this.$refs.deployConfirmationModal as ConfirmationModal).showModal();
    }
  }

  private async deployDraft(): Promise<void> {
    const changesAreSaved = await this.saveDraftChanges();
    if (changesAreSaved) {
      await Tornado.deployDraft();
    }
  }

  private showTakeoverModal() {
    if (this.$refs.takeoverDraftConfirmationModal) {
      (
        this.$refs.takeoverDraftConfirmationModal as ConfirmationModal
      ).showModal();
    }
  }

  private async confirmTakeoverDraft() {
    await Tornado.takeoverDraft();
    await Tornado.loadDraft();
    Tornado.setCurrentEditMode(true);
  }

  private async stopTakeoverDraft() {
    Tornado.setCurrentEditMode(false);
    Tornado.setAddNodeSelectParentMode(AddNodeProcessMode.none);
  }

  private async saveDraftChanges(): Promise<boolean> {
    if (Tornado.draftId) {
      this.isSavingDraft = true;
      try {
        await Tornado.actionsQueue.executeAll(
          User.selectedTenant,
          Tornado.draftId
        );
        this.isSavingDraft = false;
        Tornado.resetEditedNodes();
      } catch (e) {
        this.isSavingDraft = false;
        this.hasSaveDraftError = true;

        this.draftChangesErrorMessage = i18n.tc(
          "edit_mode.an_error_occurred_while_saving_the_draft"
        );
        const actionFailed = Tornado.actionsQueue.getFirstAction();
        if (actionFailed) {
          this.draftChangesErrorMessage +=
            " " +
            i18n.tc("edit_mode.action") +
            ": " +
            actionFailed.getType() +
            " " +
            actionFailed.getTargetObject();
        }
        this.draftChangesErrorMessage += ". " + e.message;

        Notification.addError({
          title: i18n.tc("errors.error"),
          message: this.draftChangesErrorMessage,
        });

        return false;
      }
    }

    return true;
  }

  created(): void {
    this.$root.$on("saveChanges", async () => {
      await this.saveDraftChanges().then(() => {
        this.$root.$emit("changesAreSaved");
      });
    });

    this.$root.$on("saveChangesTreeNode", () => {
      this.saveDraftChanges();
    });
  }

  private openUnsavedChangesModal() {
    if (this.$refs.unsavedChangesModal) {
      (this.$refs.unsavedChangesModal as ConfirmationModal).showModal();
    }
  }

  private confirmDiscardUnsavedChanges() {
    Tornado.actionsQueue.empty();
    this.editModeChange();
  }

  beforeDestroy(): void {
    this.$root.$off("saveChanges");
    this.$root.$off("saveChangesTreeNode");
  }
}
</script>

<style lang="scss" scoped>
.tool-bar {
  background: $ui-background;
  height: 3rem;
  padding: 0 0 0 $spacing-06;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 50;
  border-bottom: 2px solid $ui-00;

  .tenant-selector-container {
    display: flex;
    align-items: center;
    color: $text-00;
    .tenant-loading {
      min-width: 150px;
    }
  }

  .edit-mode-options {
    display: flex;
    align-items: center;
    .edit-mode-button {
      color: $icon-01 !important;
      padding: 10px !important;
      height: 40px;
      width: 40px;
    }
    .left-margin-button {
      margin-left: $spacing-02;
    }
    .edit-mode-switch-container {
      color: $text-02;
      display: flex;
      align-items: center;
      margin-left: $spacing-05;
      padding-right: $spacing-06;
      border-right: 2px solid $ui-00;
      height: 3rem;
      .edit-mode-switch {
        padding-left: $spacing-03;
      }

      .on-off-label {
        margin-left: $spacing-02;
      }
    }
  }
}

.test-window-button {
  height: 46px;
  width: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0 0.8rem;

  &--on {
    padding: 0 0.8rem 0 1.2rem !important;

    svg {
      height: 1rem;
    }
  }

  &--off {
    padding: 0 !important;
    aspect-ratio: 1/1;

    svg {
      width: 1.1rem;
      fill: $text-02 !important;
      position: relative;
      right: -1px;
    }
  }

  span {
    color: $text-02;
  }
}
</style>

<style lang="scss">
.bx--toast-notification--info {
  h3 {
    margin-bottom: 1rem;
  }

  p {
    display: none !important;
  }
}

.tool-bar {
  .tenant-selector-container {
    .bx--dropdown {
      z-index: 99;
    }
  }

  .edit-mode-switch {
    .bx--toggle__switch {
      margin: 0 !important;
    }
  }

  .edit-mode-switch-container .bx--toggle__text--off,
  .edit-mode-switch-container .bx--toggle__text--on {
    visibility: hidden;
  }
}
.tenant-dropdown {
  height: 46px;

  .bx--list-box {
    max-height: 46px;
  }

  & > div {
    height: 100%;
  }

  span + div {
    height: 46px;
  }

  button {
    height: 100%;
  }
}
</style>
