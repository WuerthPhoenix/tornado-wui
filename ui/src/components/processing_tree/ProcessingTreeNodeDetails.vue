<template>
  <div class="processing-tree-node-details-container">
    <div class="header">
      <div class="name-container">
        <Filter24 v-if="isFilter" class="filter-icon" />
        <Rule24 v-else class="ruleset-icon" />
        <span class="name">
          {{ node.name }}
          <span class="node-type">{{
            $tc("views.processing_tree." + node.type)
          }}</span>
        </span>
        <div class="test-matched">
          <cv-tooltip
            direction="right"
            :tip="showTip()"
            v-if="partiallyMatched"
          >
            <Flash24 class="test-match-icon" />
          </cv-tooltip>
          <cv-tooltip
            direction="right"
            :tip="showTip()"
            v-else-if="fullMatched"
          >
            <FlashFilled24 class="test-match-icon" />
          </cv-tooltip>
        </div>
      </div>
      <div class="actions-container">
        <cv-tooltip
          alignment="center"
          direction="bottom"
          :tip="$tc('views.processing_tree.import_node')"
          v-if="editMode"
        >
          <cv-button
            kind="ghost"
            size="sm"
            class="import-node-confirmation"
            @click="emitImportNode"
          >
            <CloudUpload20 />
          </cv-button>
        </cv-tooltip>

        <cv-tooltip
          alignment="center"
          direction="bottom"
          :tip="$tc('views.processing_tree.export_node')"
          v-if="editMode"
        >
          <cv-button
            kind="ghost"
            size="sm"
            class="export-node-confirmation"
            @click="exportNode"
          >
            <CloudDownload20 />
          </cv-button>
        </cv-tooltip>

        <cv-tooltip
          alignment="center"
          direction="bottom"
          :tip="$tc('views.processing_tree.delete')"
          v-if="editMode && !isRootNode"
        >
          <cv-button
            kind="ghost"
            size="sm"
            class="delete-node-confirmation"
            @click="emitDeleteNodeEvent"
          >
            <TrashCan20 />
          </cv-button>
        </cv-tooltip>
        <cv-button kind="ghost" size="sm" class="close-btn" @click="close">
          <Close20 />
        </cv-button>
      </div>
    </div>
    <ProcessingTreeNodeDetailsTypeFilter
      :details="node.details"
      :parentNodePath="parentNodePath"
      @update-details="onUpdateDetails"
      v-if="isFilter"
    />
    <ProcessingTreeNodeDetailsTypeRuleset
      :rulesCount="node.rules_count"
      :details="node.details"
      :event-processed-rules="eventProcessedRules"
      :parentNodePath="parentNodePath"
      @update-details="onUpdateDetails"
      v-else
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import Tornado, {
  ImportNodeMode,
  ProcessingTreeNodeDetailsDto,
  ProcessingTreeNodeDto,
} from "@/store/tornado";
// @ts-ignore
import Filter24 from "@carbon/icons-vue/es/filter/24";
// @ts-ignore
import Rule24 from "@carbon/icons-vue/es/rule/24";
// @ts-ignore
import Flash24 from "@carbon/icons-vue/es/flash/24";
// @ts-ignore
import FlashFilled24 from "@carbon/icons-vue/es/flash--filled/24";
// @ts-ignore
import Close20 from "@carbon/icons-vue/es/close/20";
// @ts-ignore
import CloudUpload20 from "@carbon/icons-vue/es/cloud--upload/20";
// @ts-ignore
import CloudDownload20 from "@carbon/icons-vue/es/cloud--download/20";
// @ts-ignore
import TrashCan20 from "@carbon/icons-vue/es/trash-can/20";
// @ts-ignore
import { CvButton } from "@carbon/vue/src/components/cv-button";
// @ts-ignore
import { CvGrid, CvRow, CvColumn } from "@carbon/vue/src/components/cv-grid";
// @ts-ignore
import { CvTooltip } from "@carbon/vue/src/components/cv-tooltip";
// @ts-ignore
import { CvDataTable } from "@carbon/vue/src/components/cv-data-table";
// @ts-ignore
import { CvTabs, CvTab } from "@carbon/vue/src/components/cv-tabs";
// @ts-ignore
import { CvSkeletonText } from "@carbon/vue/src/components/cv-skeleton-text";
import {
  CvNumberInput,
  CvNumberInputSkeleton,
  // @ts-ignore
} from "@carbon/vue/src/components/cv-number-input";

import ProcessingTreeNodeDetailsTypeFilter from "./ProcessingTreeNodeDetailsTypeFilter.vue";
import ProcessingTreeNodeDetailsTypeRuleset from "./ProcessingTreeNodeDetailsTypeRuleset.vue";
import { ProcessedNodeDto, ProcessedRulesDto } from "tornado-backend-dto";
import ProcessingTreeNode, {
  NodeMatchEventStatus,
} from "@/components/processing_tree/ProcessingTreeNode.vue";
import i18n from "@/utils/i18n";

@Component({
  components: {
    ProcessingTreeNodeDetailsTypeFilter,
    ProcessingTreeNodeDetailsTypeRuleset,
    Filter24,
    Rule24,
    Close20,
    Flash24,
    FlashFilled24,
    TrashCan20,
    CloudDownload20,
    CloudUpload20,
    CvTooltip,
    CvGrid,
    CvRow,
    CvColumn,
    CvButton,
    CvDataTable,
    CvNumberInput,
    CvNumberInputSkeleton,
    CvTab,
    CvTabs,
    CvSkeletonText,
  },
})
export default class ProcessingTreeNodeDetails extends Vue {
  @Prop() public node!: ProcessingTreeNodeDto;
  @Prop() public parentNodePath!: string[];
  @Prop({ default: null }) public eventResult!: ProcessedNodeDto | null;

  get isFilter(): boolean {
    return this.node.type === "Filter";
  }

  private close(): void {
    this.$emit("close");
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }

  get isMatched(): NodeMatchEventStatus {
    return ProcessingTreeNode.eventResultIsMatched(this.eventResult);
  }

  get partiallyMatched(): boolean {
    return this.isMatched == NodeMatchEventStatus.PartiallyMatched;
  }

  private showTip(): string {
    if (this.fullMatched) {
      return i18n.tc("views.processing_tree.matched");
    }
    return i18n.tc("views.processing_tree.partially-matched");
  }

  get fullMatched(): boolean {
    return this.isMatched == NodeMatchEventStatus.Matched;
  }

  get eventProcessedRules(): ProcessedRulesDto | null {
    if (this.eventResult !== null && this.eventResult.type === "Ruleset") {
      return this.eventResult.rules;
    }

    return null;
  }

  private emitDeleteNodeEvent(): void {
    this.$emit("delete");
  }

  private emitImportNode(): void {
    this.$emit("showImportModal", ImportNodeMode.replace);
  }

  private exportNode(): void {
    this.$emit("exportNode", ImportNodeMode.export);
  }

  get isRootNode(): boolean {
    return this.parentNodePath.length === 0;
  }

  private onUpdateDetails(editedDetails: ProcessingTreeNodeDetailsDto): void {
    if (!this.node.details) {
      return;
    }

    //compose original path for update
    let originalPath = [...this.parentNodePath];
    originalPath.push(this.node.details.name);
    //Close the node if we are changing the name, we will open the new one
    if (editedDetails.name !== this.node.details.name) {
      let newPath = [...this.parentNodePath];
      newPath.push(editedDetails.name);
      Tornado.addUnsavedEditedPath({
        originalPath,
        newPathSegment: editedDetails.name,
      });

      Tornado.setOpenedNodeDetails([]);
    }
    //Update the details
    Tornado.updateNodeDetails({
      details: editedDetails,
      nodePath: originalPath,
      targetTree: Tornado.visibleTree,
    });
    //Compose the new path and set the node as opened
    let newPath = [...this.parentNodePath];
    newPath.push(editedDetails.name);
    Tornado.setOpenedNodeDetails(newPath);
  }
}
</script>

<style lang="scss" scoped>
.ruleset-icon {
  fill: $icon-green;
}
.filter-icon {
  fill: $icon-orange;
}
.processing-tree-node-details-container {
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: $spacing-09;
    opacity: 0.95;
    position: sticky;
    top: -2rem;
    background: $ui-11;
    z-index: 10;
    border-bottom: 1px solid $ui-background;
    .actions-container {
      display: flex;
      height: 40px;

      .close-btn {
        padding: $spacing-04;
        font-size: 14px;
        display: flex;
        align-items: flex-end;
        min-height: 0;
        min-width: 0;

        .icon {
          margin-left: $spacing-03;
        }
      }
    }

    .name-container {
      padding: $spacing-05;
      display: flex;
      align-items: flex-end;

      .name {
        margin-left: $spacing-03;
        font-size: 28px;

        .node-type {
          margin-left: $spacing-03;
          color: $text-05;
        }
      }

      .test-matched {
        margin-left: 14px;

        .test-match-icon path {
          fill: #ffbf1a;
        }
      }
    }
  }

  .import-node-confirmation,
  .export-node-confirmation,
  .delete-node-confirmation,
  .close-btn {
    color: $icon-01 !important;
    padding: 10px !important;
    height: 40px;
    width: 40px;
  }
}
</style>
