<template>
  <cv-tabs class="filter-details-container" :container="true">
    <cv-tab :label="$tc('views.processing_tree.properties')">
      <cv-grid class="properties-grid">
        <cv-row v-if="isLoading">
          <cv-column class="left-side">
            <cv-number-input-skeleton></cv-number-input-skeleton>
            <cv-number-input-skeleton></cv-number-input-skeleton>
          </cv-column>
          <cv-column>
            <cv-toggle-skeleton></cv-toggle-skeleton>
          </cv-column>
        </cv-row>
        <cv-row v-else>
          <cv-column class="left-side">
            <div class="input-view-mode" v-if="!editMode || isRootNode">
              <label class="bx--label">
                {{ $tc("views.processing_tree.name") }}
              </label>
              <div class="bx--text-input__field-wrapper">
                <div class="name bx--text-input">
                  {{ details.name }}
                </div>
              </div>
            </div>
            <cv-text-input
              v-else
              :label="$tc('views.processing_tree.name')"
              v-model="editableDetails.name"
              :light="true"
              @input="validateFilterName"
              class="filter-name"
              :invalid-message="invalidFilterNameMessage"
              :helper-text="filterNameLengthMessage"
              ref="nameInput"
              @blur="updateDetails"
            >
            </cv-text-input>
            <div class="input-view-mode" v-if="!editMode || isRootNode">
              <label class="bx--label">
                {{ $tc("views.processing_tree.description") }}
              </label>
              <div class="bx--text-input__field-wrapper">
                <div class="description bx--text-input">
                  {{ details.description }}
                </div>
              </div>
            </div>
            <cv-text-input
              v-else
              :label="$tc('views.processing_tree.description')"
              v-model="editableDetails.description"
              :light="true"
              class="filter-description"
              @blur="updateDetails"
            ></cv-text-input>
          </cv-column>
          <cv-column>
            <cv-toggle
              class="active filter-active"
              :class="{ 'editable-toggle': editMode && !isRootNode }"
              v-model="editableDetails.active"
              :label="$tc('views.processing_tree.active')"
              value="true"
              @click="handleToggleClick"
              @change="updateDetails"
            />
          </cv-column>
        </cv-row>
      </cv-grid>
    </cv-tab>
    <cv-tab :label="$tc('views.processing_tree.where')">
      <div v-if="isLoading">
        <cv-skeleton-text :heading="true"></cv-skeleton-text>
        <cv-skeleton-text :heading="true"></cv-skeleton-text>
        <cv-skeleton-text :heading="true"></cv-skeleton-text>
      </div>
      <WhereEditor
        v-model="operator"
        @change="onWhereChanged"
        :is-editable="!isRootNode"
        v-else
      />
    </cv-tab>
  </cv-tabs>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import WhereEditor from "@/components/editor/WhereEditor.vue";
import { OperatorType, ProcessingTreeNodeDetailsDto } from "@/store/tornado";
import Tornado from "@/store/tornado";
import { validateObjectName, getNodeByPath } from "@/utils/processingTreeUtils";
import i18n from "@/utils/i18n";
import { cloneDeep } from "lodash";
import { toOperatorDTO, toOperatorType } from "@/store/helper/tornadoHelper";

// @ts-ignore
import { CvGrid, CvRow, CvColumn } from "@carbon/vue/src/components/cv-grid";
// @ts-ignore
import { CvTabs, CvTab } from "@carbon/vue/src/components/cv-tabs";
// @ts-ignore
import { CvSkeletonText } from "@carbon/vue/src/components/cv-skeleton-text";
// @ts-ignore
import { CvTextInput } from "@carbon/vue/src/components/cv-text-input";
import {
  CvToggle,
  CvToggleSkeleton,
  // @ts-ignore
} from "@carbon/vue/src/components/cv-toggle";
// @ts-ignore
import {
  CvNumberInput,
  CvNumberInputSkeleton,
  // @ts-ignore
} from "@carbon/vue/src/components/cv-number-input";

@Component({
  components: {
    WhereEditor,
    CvNumberInput,
    CvNumberInputSkeleton,
    CvGrid,
    CvRow,
    CvColumn,
    CvTabs,
    CvTab,
    CvSkeletonText,
    CvTextInput,
    CvToggle,
    CvToggleSkeleton,
  },
})
export default class ProcessingTreeNodeDetailsTypeFilter extends Vue {
  @Prop() public details!: ProcessingTreeNodeDetailsDto;
  @Prop() public parentNodePath!: string[];

  private invalidFilterNameMessage = "";
  private filterNameLengthLimit = 200;
  private editableDetails: ProcessingTreeNodeDetailsDto = cloneDeep(
    this.details
  );
  private operator: OperatorType | null = null;

  @Watch("details", { immediate: true })
  onPropertyChanged(newDetails: ProcessingTreeNodeDetailsDto): void {
    this.editableDetails = cloneDeep(newDetails);
    if (this.isLoading) {
      return;
    }
    if (newDetails.type === "Filter" && newDetails.filter !== null) {
      this.operator = toOperatorType(newDetails.filter);
    }
  }
  get isLoading(): boolean {
    return !this.details;
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }

  get filterNameLengthMessage(): string {
    return this.filterNameLength + "/" + this.filterNameLengthLimit;
  }

  get filterNameLength(): number {
    return this.editableDetails.name.length;
  }

  get isRootNode(): boolean {
    return this.parentNodePath.length === 0;
  }

  get areDetailsChanged(): boolean {
    if (
      this.details.type === "Filter" &&
      this.editableDetails.type === "Filter"
    ) {
      return !(
        this.details.name === this.editableDetails.name &&
        this.details.description === this.editableDetails.description &&
        this.details.active === this.editableDetails.active &&
        this.details.filter === this.editableDetails.filter
      );
    }
    return false;
  }

  private handleToggleClick(e: PointerEvent): void {
    if (!this.editMode || this.isRootNode) {
      e.preventDefault();
    }
  }

  private validateFilterName(value: string): void {
    this.invalidFilterNameMessage = validateObjectName(
      value,
      this.filterNameLengthLimit
    );
    if (this.invalidFilterNameMessage === "" && value !== this.details.name) {
      let currentUpdatedPath = [...this.parentNodePath];
      currentUpdatedPath.push(value);
      this.invalidFilterNameMessage = getNodeByPath(
        Tornado.visibleTree,
        currentUpdatedPath
      )
        ? i18n.tc("errors.already_existing_node")
        : "";
    }
  }

  private updateDetails(): void {
    if (this.editableDetails.type === "Filter") {
      this.operator !== null
        ? (this.editableDetails.filter = toOperatorDTO(this.operator))
        : (this.editableDetails.filter = this.operator);
    }
    if (!this.invalidFilterNameMessage && this.areDetailsChanged) {
      this.$emit("update-details", this.editableDetails);
    }
  }

  onWhereChanged(): void {
    this.updateDetails();
  }
}
</script>

<style lang="scss" scoped>
.filter-name {
  position: relative;
}

.input-view-mode {
  .bx--text-input {
    line-height: 40px;
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    -ms-overflow-style: none;
    scrollbar-width: none;
    background-color: $ui-input;
    border-bottom: 1px solid $ui-input-border !important;
    &::-webkit-scrollbar {
      display: none;
    }
  }
}

.properties-grid {
  padding: 0 !important;

  .cv-row {
    margin: 0 !important;

    .cv-column > div {
      margin-top: $spacing-06;
    }
  }

  .left-side {
    padding-right: $spacing-07;
    max-width: 50%;
  }
}
</style>

<style lang="scss">
.filter-details-container {
  .filter-active:not(.editable-toggle) {
    .bx--toggle__switch {
      cursor: default;
    }
  }
}
</style>
