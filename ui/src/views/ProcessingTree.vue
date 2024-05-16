<template>
  <div class="processing-tree-main-container">
    <cv-loading :active="treeIsLoading" :overlay="true"></cv-loading>
    <div
      class="feedback-banner-processing-tree-container"
      :class="{
        'feedback-banner-processing-tree-container-shrink': testWindowOpened,
      }"
    >
      <cv-column class="top-bar">
        <h3 class="title" :class="{ 'title-edit-mode': currentEditMode }">
          <cv-button
            kind="ghost"
            size="sm"
            class="back-button"
            v-show="!currentEditMode"
            @click="goToDashboard"
          >
            <ChevronLeft32 />
          </cv-button>
          {{ $tc("views.processing_tree.processing_tree") }}
          <span class="subtitle">
            {{ subTitle }}
          </span>
        </h3>
      </cv-column>

      <div class="right-buttons-container">
        <cv-tooltip
          alignment="center"
          direction="bottom"
          data-wp-direction="bottom-right"
          :tip="
            isCollapsedView
              ? $tc('views.processing_tree.toFullView')
              : $tc('views.processing_tree.toCollapsedView')
          "
        >
          <cv-button
            kind="ghost"
            size="sm"
            class="toggle-view"
            @click="toggleView"
          >
            <CollapsedViewIcon :is-collapsed="isCollapsedView" />
          </cv-button>
        </cv-tooltip>
        <ComboButton
          class="add-node-btn"
          v-if="currentEditMode"
          :value="$tc('views.processing_tree.add')"
        >
          <cv-overflow-menu-item
            @click="addNodeSelectParentNode(addNodeProcessModeTypes.filter)"
          >
            {{ $tc("views.processing_tree.new_filter_node") }}
          </cv-overflow-menu-item>

          <cv-overflow-menu-item
            @click="addNodeSelectParentNode(addNodeProcessModeTypes.ruleset)"
          >
            {{ $tc("views.processing_tree.new_ruleset_node") }}
          </cv-overflow-menu-item>

          <cv-overflow-menu-item
            class="node-menu-item"
            @click="checkIfUnsavedChanges"
            >{{ $tc("views.processing_tree.import_child") }}
          </cv-overflow-menu-item>
        </ComboButton>
      </div>

      <div class="processing-tree">
        <cv-grid full-width>
          <cv-row kind="narrow" class="sticky-banner">
            <div v-if="isAddNodeSelectParent" class="select-parent-banner">
              <div
                class="message"
                v-if="isAddNodeSelectParent === addNodeProcessModeTypes.filter"
              >
                {{
                  $tc("views.processing_tree.select_parent_node_for_new_filter")
                }}
              </div>
              <div class="message" v-else>
                {{
                  $tc(
                    "views.processing_tree.select_parent_node_for_new_ruleset"
                  )
                }}
              </div>
              <div class="action">
                |
                <cv-button
                  kind="primary"
                  size="field"
                  @click="cancelAddNodeSelectParentNode"
                  >{{ $tc("views.processing_tree.cancel") }}
                </cv-button>
              </div>
            </div>

            <div
              v-else-if="
                importNodeMode ===
                importNodeModeTypes.childrenWithSelectParentPanel
              "
              class="select-parent-banner"
            >
              <div class="message">
                {{
                  $tc("views.processing_tree.select_parent_node_for_new_import")
                }}
              </div>
              <div class="action">
                |
                <cv-button
                  kind="primary"
                  size="field"
                  @click="cancelImportNodeSelectParentNode"
                  >{{ $tc("views.processing_tree.cancel") }}
                </cv-button>
              </div>
            </div>
          </cv-row>
          <cv-row kind="narrow">
            <cv-column class="processing-tree-container">
              <ProcessingTreeNode
                v-for="node in tornadoModule.visibleTree"
                :key="node.name"
                :node="node"
                :parent-node-path="[]"
                :default-expanded="true"
                :event-result="eventResult"
                :has-next-sibling-matched="false"
                :isCollapsedView="isCollapsedView"
                ref="processingTreeNode"
              ></ProcessingTreeNode>
            </cv-column>
          </cv-row>
        </cv-grid>
      </div>
    </div>

    <confirmation-modal
      class="save-to-continue-modal"
      ref="saveToContinueModalParent"
      :title="$tc('edit_mode.save_to_import_modal.title')"
      :content="$tc('edit_mode.save_to_import_modal.content')"
      :primaryButtonText="$tc('test_window.save')"
      :secondaryButtonText="$tc('test_window.cancel')"
      @primaryBtnClick="triggerSaveDraft"
      @secondaryBtnClick="cancelImportNodeSelectParentNode"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
// @ts-ignore
import { CvButton } from "@carbon/vue/src/components/cv-button";
// @ts-ignore
import { CvGrid, CvRow, CvColumn } from "@carbon/vue/src/components/cv-grid";
// @ts-ignore
import { CvOverflowMenuItem } from "@carbon/vue/src/components/cv-overflow-menu";
// @ts-ignore
import { CvTooltip } from "@carbon/vue/src/components/cv-tooltip";
// @ts-ignore
import { CvLoading } from "@carbon/vue/src/components/cv-loading";

import ProcessingTreeNode from "@/components/processing_tree/ProcessingTreeNode.vue";
import Tornado, {
  AddNodeProcessMode,
  ImportNodeMode,
  ProcessingTreeNodeDto,
} from "@/store/tornado";
// @ts-ignore
import ChevronLeft32 from "@carbon/icons-vue/es/chevron--left/32";
// @ts-ignore
import Flash20 from "@carbon/icons-vue/es/flash/20";
import CollapsedViewIcon from "@/components/icons/CollapsedViewIcon.vue";
// @ts-ignore
import { ProcessedNodeDto } from "tornado-backend-dto";
import i18n from "@/utils/i18n";
import ComboButton from "@/components/ComboButton.vue";
import User from "@/store/user";
import ConfirmationModal from "@/components/ConfirmationModal.vue";

@Component({
  components: {
    ConfirmationModal,
    ComboButton,
    ProcessingTreeNode,
    ChevronLeft32,
    Flash20,
    CollapsedViewIcon,
    CvButton,
    CvGrid,
    CvRow,
    CvColumn,
    CvOverflowMenuItem,
    CvTooltip,
    CvLoading,
  },
})
export default class ProcessingTree extends Vue {
  private tornadoModule = Tornado;
  private isCollapsedView = true;
  private addNodeProcessModeTypes = AddNodeProcessMode;
  private importNodeModeTypes = ImportNodeMode;
  private testWindowOpened = false;

  mounted(): void {
    if (
      User.info?.preferences.processing_tree_collapsed_view_mode !== undefined
    ) {
      this.isCollapsedView =
        User.info?.preferences.processing_tree_collapsed_view_mode;
    }
  }
  get subTitle(): string {
    return Tornado.editMode
      ? i18n.tc("views.processing_tree.edit_in_progress")
      : i18n.tc("views.processing_tree.live");
  }

  private goToDashboard(): void {
    Tornado.setExpandedPaths([]);
    this.$router.push(`/`);
  }

  private toggleTestWindow(): void {
    this.testWindowOpened = !this.testWindowOpened;
  }

  private toggleView(): void {
    this.isCollapsedView = !this.isCollapsedView;
    User.updateProcessingTreeView(this.isCollapsedView);
  }

  private closeTestWindow(): void {
    this.testWindowOpened = false;
  }

  get eventResult(): ProcessedNodeDto | null {
    if (Tornado.processedEvent !== null) {
      return Tornado.processedEvent.result;
    }

    return null;
  }

  get currentEditMode(): boolean {
    return Tornado.editMode;
  }

  get draftId(): string | null {
    return Tornado.draftId;
  }

  get processingTree(): ProcessingTreeNodeDto[] {
    return Tornado.visibleTree;
  }

  get treeIsLoading(): boolean {
    return Tornado.treeIsLoading;
  }

  get isAddNodeSelectParent(): AddNodeProcessMode {
    return Tornado.addNodeSelectParentMode;
  }

  get importNodeMode(): ImportNodeMode {
    return Tornado.importNodeMode;
  }

  private addNodeSelectParentNode(
    nodeType: AddNodeProcessMode.filter | AddNodeProcessMode.ruleset
  ): void {
    Tornado.setAddNodeSelectParentMode(nodeType);
    Tornado.setOpenedNodeDetails([]);
  }

  private cancelAddNodeSelectParentNode(): void {
    Tornado.setAddNodeSelectParentMode(AddNodeProcessMode.none);
  }

  private importNodeSelectParentNode(): void {
    Tornado.setOpenedNodeDetails([]);
    Tornado.setImportNodeMode(ImportNodeMode.childrenWithSelectParentPanel);
  }

  private cancelImportNodeSelectParentNode(): void {
    Tornado.setImportNodeMode(ImportNodeMode.none);
  }

  checkIfUnsavedChanges(): void {
    if (!Tornado.actionsQueue.isEmpty()) {
      if (this.$refs.saveToContinueModalParent) {
        (this.$refs.saveToContinueModalParent as ConfirmationModal).showModal();
      }
    } else {
      Tornado.setOpenedNodeDetails([]);
      Tornado.setImportNodeMode(ImportNodeMode.childrenWithSelectParentPanel);
    }
  }

  private triggerSaveDraft() {
    this.$root.$emit("saveChanges");
  }

  created(): void {
    this.$root.$on("changesAreSaved", () => {
      Tornado.setOpenedNodeDetails([]);
      Tornado.setImportNodeMode(ImportNodeMode.childrenWithSelectParentPanel);
      if (this.$refs.saveToContinueModalParent) {
        (this.$refs.saveToContinueModalParent as ConfirmationModal).hideModal();
      }
    });
  }

  beforeDestroy(): void {
    this.$root.$off("changesAreSaved");
  }
}
</script>

<style lang="scss" scoped>
.sticky-banner {
  position: sticky;
  top: 28px;
  z-index: 1;
}
.message {
  color: #ffffff;
}
.processing-tree-main-container {
  display: flex;
  width: 100%;
}
.feedback-banner-processing-tree-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  height: calc(100vh - 48px);
  overflow-y: auto;
  overflow-x: hidden;
  transition-property: width;
  transition-timing-function: carbon--motion(standard, expressive);
  transition-duration: $moderate-01;
  top: 48px;
  padding-top: $spacing-07;
}
.feedback-banner-processing-tree-container-shrink {
  width: calc(100% - 432px);
}
.processing-tree {
  display: flex;
  padding-bottom: 48px;

  & > .cv-grid {
    width: 100%;
  }
}

.top-bar {
  display: flex;
  justify-content: space-between;
  z-index: 2;
  width: calc(100% - 250px);
  flex-grow: 0;
}

.title {
  margin-bottom: $spacing-05;
  display: flex;

  .back-button {
    color: unset;
    padding: 0;
    margin-right: $spacing-03;
  }

  .subtitle {
    margin-left: $spacing-03;
    color: $text-03;
  }
}

.title-edit-mode {
  margin-left: 42px;
}

.toggle-view {
  color: unset !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 40px;
  background: $ui-background;
}

.processing-tree-container {
  margin-top: $spacing-09;
}

.select-parent-banner {
  margin-top: $spacing-07;
  margin-right: $spacing-05;
  background-color: $interactive-01;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding-left: $spacing-05;

  .message,
  .action {
    color: #ffffff;
    display: flex;
    align-items: center;
  }
}

.add-node-btn {
  margin-left: $spacing-05;
}

.right-buttons-container {
  margin-top: -48px;
  width: auto;
  display: flex;
  justify-content: flex-end;
  position: sticky;
  top: 0.2rem;
  padding-right: 2rem;
  z-index: 20;
  margin-left: calc(100% - 221px);
  transition-property: margin-left;
  transition-timing-function: carbon--motion(standard, expressive);
  transition-duration: $moderate-01;
}
</style>

<style lang="scss">
.select-parent-banner {
  .action button {
    padding-right: $spacing-04 !important;
  }
}
.toggle-view {
  .bx--tooltip--bottom::before {
    bottom: 0 !important;
  }
  .bx--assistive-text {
    bottom: -0.3125rem !important;
  }
}
.add-node-btn {
  .bx--overflow-menu-options {
    right: 0;
  }
}
</style>
