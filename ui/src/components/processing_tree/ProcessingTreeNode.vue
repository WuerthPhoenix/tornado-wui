<template>
  <div
    class="processing-tree-node-container"
    :class="{
      matched: !isNotMatched,
      'sibling-matched': hasNextSiblingMatched,
      collapsed: isCollapsedView,
    }"
  >
    <div class="space"></div>
    <div class="node-content-container">
      <div class="line-container">
        <div class="curved-line"></div>
        <div class="straight-line"></div>
      </div>
      <cv-tile class="content" :class="{ 'details-expanded': areDetailsOpen }">
        <div
          class="content-overview"
          v-if="!areDetailsOpen"
          :class="{ disabled: isFilter && !node.active }"
        >
          <cv-tile
            class="node-overview"
            :kind="isClickable ? 'clickable' : 'standard'"
            :class="{
              'has-children': hasChildren,
              'no-children': !hasChildren,
            }"
            @click="onClickNode"
          >
            <div class="overview-container">
              <div class="overview-icons" v-if="!isLoading">
                <Filter20 v-if="isFilter" class="filter-icon" />
                <Rule20 class="ruleset-icon" v-else />
              </div>
              <div class="overview-content">
                <cv-skeleton-text
                  v-if="isLoading"
                  width="105px"
                ></cv-skeleton-text>
                <div class="title" v-else>
                  <div class="name-container">
                    <div class="name">
                      {{ node.name }}
                    </div>
                    <cv-tag
                      v-if="isFilter && !node.active"
                      :label="$tc('views.processing_tree.disabled')"
                      size="sm"
                      kind="gray"
                      class="disable-tag"
                    ></cv-tag>
                  </div>
                  <div class="right-icons-container">
                    <div class="test-matched">
                      <cv-tooltip
                        direction="right"
                        :tip="showTip()"
                        v-if="partiallyMatched"
                      >
                        <Flash20 class="test-match-icon" />
                      </cv-tooltip>
                      <cv-tooltip
                        direction="right"
                        :tip="showTip()"
                        v-else-if="fullMatched"
                      >
                        <FlashFilled20 class="test-match-icon" />
                      </cv-tooltip>
                    </div>
                    <ArrowRight20
                      v-if="
                        (tornadoModule.addNodeSelectParentMode ||
                          tornadoModule.importNodeMode ===
                            importNodeMode.childrenWithSelectParentPanel) &&
                        isFilter
                      "
                      class="select-parent-icon"
                    />
                  </div>
                  <ComboButton
                    class="node-menu"
                    @click.native.prevent="stopParentClickNodeEventPropagation"
                    v-if="editMode && !tornadoModule.addNodeSelectParentMode"
                    :icon-only="true"
                    kind="ghost"
                  >
                    <cv-overflow-menu-item
                      class="node-menu-item"
                      v-if="isFilter"
                      @click="addNode(addNodeProcessModeTypes.filter)"
                      >{{ $tc("views.processing_tree.add_filter_node") }}
                    </cv-overflow-menu-item>
                    <cv-overflow-menu-item
                      class="node-menu-item"
                      v-if="isFilter"
                      @click="addNode(addNodeProcessModeTypes.ruleset)"
                      >{{ $tc("views.processing_tree.add_ruleset_node") }}
                    </cv-overflow-menu-item>
                    <cv-overflow-menu-item
                      class="node-menu-item import-node"
                      @click="checkIfDraftIsSaved(importNodeMode.replace)"
                      >{{ $tc("views.processing_tree.import_node") }}
                    </cv-overflow-menu-item>
                    <cv-overflow-menu-item
                      class="node-menu-item export-node"
                      @click="checkIfDraftIsSaved(importNodeMode.export)"
                      >{{ $tc("views.processing_tree.export_node") }}
                    </cv-overflow-menu-item>
                    <cv-overflow-menu-item
                      danger
                      v-if="!isRootNode"
                      class="node-menu-item delete-node"
                      @click="openDeleteNodeConfirmationModal"
                      >{{ $tc("views.processing_tree.delete") }}
                    </cv-overflow-menu-item>
                    <template v-slot:icon>
                      <OverflowMenuVertical20 class="overflow-button-icon" />
                    </template>
                  </ComboButton>
                </div>
                <div class="description">
                  <cv-skeleton-text
                    v-if="isLoading"
                    width="287px"
                  ></cv-skeleton-text>
                  <div v-else>
                    <div>
                      {{ node.rules_count }}
                      {{ $tc("views.processing_tree.rules") }}
                    </div>
                    <div v-if="hasDescription" class="description-text">
                      &nbsp;/
                      {{ node.description }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </cv-tile>
          <cv-tile
            class="node-handle"
            :class="{ 'node-handle--opened': childNodesExpanded }"
            :kind="hasChildren ? 'clickable' : 'standard'"
            @click="toggleExpand"
            v-if="hasChildren"
          >
            <span class="icons-container">
              <span
                class="expand-icon"
                :class="{ 'child-nodes-expanded': childNodesExpanded }"
                v-if="hasChildren"
              >
                <ChevronDown20 />
              </span>
            </span>
          </cv-tile>
        </div>
        <div class="content-details" v-else>
          <ProcessingTreeNodeDetails
            :node="node"
            :parentNodePath="parentNodePath"
            @close="closeDetails"
            :event-result="eventResult"
            @delete="openDeleteNodeConfirmationModal"
            @exportNode="checkIfDraftIsSaved"
            @showImportModal="checkIfDraftIsSaved"
          />
        </div>
      </cv-tile>
    </div>
    <div
      class="child-node-container"
      v-if="!isLoading"
      :class="{ 'child-nodes-expanded': childNodesExpanded }"
      :style="{
        overflow: childNodeContainerOverflow,
      }"
    >
      <div ref="child_container" :style="childContainerStyle()">
        <div v-if="!node.child_nodes">
          <ProcessingTreeNode
            v-for="(el, index) in node.child_nodes"
            :key="index"
            :parent-node-path="nodePath"
            :show-import-modal="isImportModalOpen"
          ></ProcessingTreeNode>
        </div>
        <ProcessingTreeNode
          v-for="node in node.child_nodes"
          :key="node.name"
          :node="node"
          :parent-node-path="nodePath"
          :default-expanded="nodePathIsExpanded(getChildNodePath(node))"
          :event-result="getEventResultForChild(node.name)"
          :has-next-sibling-matched="getHasNextSiblingMatched(node.name)"
          :isCollapsedView="isCollapsedView"
          :show-import-modal="isImportModalOpen"
          ref="childNodeComponents"
        ></ProcessingTreeNode>
      </div>
    </div>
    <ConfirmationModal
      class="delete-node-confirmation-modal"
      ref="deleteNodeConfirmationModal"
      :title="
        isFilter
          ? $tc('views.processing_tree.delete_filter_confirmation_title', 0, {
              name: nodeName,
            })
          : $tc('views.processing_tree.delete_ruleset_confirmation_title', 0, {
              name: nodeName,
            })
      "
      :content="
        isFilter
          ? $tc('views.processing_tree.delete_filter_confirmation_content')
          : $tc('views.processing_tree.delete_ruleset_confirmation_content')
      "
      :primaryButtonText="$tc('views.processing_tree.delete')"
      :secondaryButtonText="$tc('test_window.cancel')"
      @primaryBtnClick="deleteNode"
    />

    <ImportNodeModal
      :show="isImportModalOpen"
      :show-warning="tornadoModule.importNodeMode === importNodeMode.replace"
      :title="
        tornadoModule.importNodeMode === importNodeMode.replace
          ? $tc('views.processing_tree.import_node')
          : $tc('views.processing_tree.import_child')
      "
      :content="
        tornadoModule.importNodeMode === importNodeMode.replace
          ? $tc('views.processing_tree.import_node_modal_description')
          : $tc('views.processing_tree.import_children_modal_description')
      "
      @importFileLoaded="importNode"
      @closeImportModal="isImportModalOpen = false"
    />

    <OverwriteModal
      :show="isOverwriteModalOpen"
      class="overwrite"
      ref="overwriteModal"
      :content="$tc('views.processing_tree.import_overwrite_content')"
      :content-highlight="
        $tc('views.processing_tree.import_overwrite_content_strong')
      "
      :title="$tc('views.processing_tree.import_overwrite_title')"
      :primaryButtonText="$tc('views.processing_tree.replace')"
      :secondaryButtonText="$tc('test_window.cancel')"
      @primaryBtnClick="confirmOverwriteNode"
      @closeImportModal="isOverwriteModalOpen = false"
    />

    <HaltModal
      :show="isHaltModalOpen"
      class="halt"
      ref="haltModal"
      :content="$tc('views.processing_tree.halt_import_content')"
      :title="$tc('views.processing_tree.halt_import_title')"
      :primaryButtonText="$tc('test_window.cancel')"
      @primaryBtnClick="isHaltModalOpen = false"
      @closeHaltModal="isHaltModalOpen = false"
    />

    <ConfirmationModal
      class="save-to-continue-modal"
      ref="saveToContinueModal"
      :title="$tc('edit_mode.save_to_import_modal.title')"
      :content="$tc('edit_mode.save_to_import_modal.content')"
      :primaryButtonText="$tc('test_window.save')"
      :secondaryButtonText="$tc('test_window.cancel')"
      @primaryBtnClick="triggerSaveDraft"
      @secondaryBtnClick="resetImportExportNodeMode"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Tornado, {
  AddNodeProcessMode,
  ImportNodeMode,
  ImportValidationError,
  ProcessingTreeNodeDto,
} from "@/store/tornado";
// @ts-ignore
import Filter20 from "@carbon/icons-vue/es/filter/20";
// @ts-ignore
import Flash20 from "@carbon/icons-vue/es/flash/20";
// @ts-ignore
import FlashFilled20 from "@carbon/icons-vue/es/flash--filled/20";
// @ts-ignore
import ChevronDown20 from "@carbon/icons-vue/es/chevron--down/20";
// @ts-ignore
import Rule20 from "@carbon/icons-vue/es/rule/20";
// @ts-ignore
import ArrowRight20 from "@carbon/icons-vue/es/arrow--right/20";
// @ts-ignore
import OverflowMenuVertical20 from "@carbon/icons-vue/es/overflow-menu--vertical/20";
import ProcessingTreeNodeDetails from "./ProcessingTreeNodeDetails.vue";
import { ProcessedNodeDto } from "tornado-backend-dto";
import {
  ProcessedFilterStatusDto,
  ProcessedRuleStatusDto,
} from "@/utils/TornadoDtoEnum";
import { arrayIndexInMatrix } from "@/utils/processingTreeUtils";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import OverwriteModal from "@/components/OverwriteModal.vue";
import HaltModal from "@/components/HaltModal.vue";
import ComboButton from "@/components/ComboButton.vue";
import i18n from "@/utils/i18n";
import ImportNodeModal from "@/components/processing_tree/ImportNodeModal.vue";
import Notification from "@/store/notification";

// @ts-ignore
import { CvTile } from "@carbon/vue/src/components/cv-tile";
// @ts-ignore
import { CvSkeletonText } from "@carbon/vue/src/components/cv-skeleton-text";
// @ts-ignore
import { CvOverflowMenuItem } from "@carbon/vue/src/components/cv-overflow-menu";
// @ts-ignore
import { CvTooltip } from "@carbon/vue/src/components/cv-tooltip";
// @ts-ignore
import { CvTag } from "@carbon/vue/src/components/cv-tag";

export enum NodeMatchEventStatus {
  Matched = "Matched",
  PartiallyMatched = "PartiallyMatched",
  NotMatched = "NotMatched",
}

@Component({
  name: "ProcessingTreeNode",
  components: {
    OverwriteModal,
    HaltModal,
    ImportNodeModal,
    ComboButton,
    ProcessingTreeNodeDetails,
    ProcessingTreeNode,
    Filter20,
    ChevronDown20,
    Rule20,
    Flash20,
    FlashFilled20,
    ArrowRight20,
    ConfirmationModal,
    OverflowMenuVertical20,
    CvTile,
    CvSkeletonText,
    CvTooltip,
    CvOverflowMenuItem,
    CvTag,
  },
})
export default class ProcessingTreeNode extends Vue {
  @Prop({ default: null }) public node!: ProcessingTreeNodeDto;
  @Prop({ default: [] }) public parentNodePath!: string[];
  @Prop({ default: false }) public defaultExpanded!: boolean;
  @Prop({ default: null }) public eventResult!: ProcessedNodeDto | null;
  @Prop({ default: false }) public hasNextSiblingMatched!: boolean;
  @Prop({ default: true }) public isCollapsedView!: boolean;

  public showImportModal!: boolean;
  private childContainerMarginTop: number | null = null;
  private tornadoModule = Tornado;
  private childNodeContainerOverflow = "hidden";
  private addNodeProcessModeTypes = AddNodeProcessMode;
  private isOverwriteModalOpen = false;
  private isHaltModalOpen = false;
  private isImportModalOpen = false;
  private importNodeMode = ImportNodeMode;

  get nodePath(): string[] {
    const copyParentPathNode: string[] = [...this.parentNodePath];
    copyParentPathNode.push(this.node.name);
    return copyParentPathNode;
  }

  get nodePathAsString(): string {
    return this.nodePath.join("/");
  }

  get nodeName(): string {
    if (!this.isLoading) {
      return this.node.name;
    }
    return "";
  }

  get isLoading(): boolean {
    return !this.node;
  }

  get isFilter(): boolean {
    return this.node && this.node.type === "Filter";
  }

  get hasChildren(): boolean {
    return (
      this.node && this.node.type === "Filter" && this.node.children_count > 0
    );
  }

  get hasDescription(): boolean {
    return (
      this.node &&
      this.node.type === "Filter" &&
      this.node.description.length > 0
    );
  }

  get partiallyMatched(): boolean {
    return this.matchStatus == NodeMatchEventStatus.PartiallyMatched;
  }

  get fullMatched(): boolean {
    return this.matchStatus == NodeMatchEventStatus.Matched;
  }

  private showTip(): string {
    if (this.fullMatched) {
      return i18n.tc("views.processing_tree.matched");
    }
    return i18n.tc("views.processing_tree.partially-matched");
  }

  private getEventResultForChild(childName: string): ProcessedNodeDto | null {
    if (!this.matchStatus) {
      return null;
    }

    if (this.eventResult !== null) {
      if (this.eventResult.type === "Filter") {
        const children = this.eventResult.nodes;
        for (const child of children) {
          if (child.name === childName) {
            return child;
          }
        }
      }
    }

    return null;
  }

  private getHasNextSiblingMatched(childName: string): boolean {
    if (!this.matchStatus) {
      return false;
    }

    if (this.eventResult === null) {
      return false;
    }

    if (this.eventResult.type !== "Filter") {
      return false;
    }

    const children = this.eventResult.nodes;
    for (let i = children.length - 1; i >= 0; --i) {
      const child = children[i];
      if (child.name === childName) {
        break;
      }

      if (
        ProcessingTreeNode.eventResultIsMatched(child) !==
        NodeMatchEventStatus.NotMatched
      ) {
        return true;
      }
    }

    return false;
  }

  get matchStatus(): NodeMatchEventStatus {
    return ProcessingTreeNode.eventResultIsMatched(this.eventResult);
  }

  get isNotMatched(): boolean {
    return this.matchStatus === NodeMatchEventStatus.NotMatched;
  }

  get areDetailsOpen(): boolean {
    return (
      this.node &&
      Tornado.openedNodeDetailsPath.join("/") == this.nodePathAsString
    );
  }

  public static eventResultIsMatched(
    eventResult: ProcessedNodeDto | null
  ): NodeMatchEventStatus {
    if (eventResult !== null) {
      if (eventResult.type === "Filter") {
        if (eventResult.filter.status === ProcessedFilterStatusDto.Matched) {
          return NodeMatchEventStatus.Matched;
        }
      } else if (eventResult.type === "Ruleset") {
        for (const rule of eventResult.rules.rules) {
          if (rule.status === ProcessedRuleStatusDto.Matched) {
            return NodeMatchEventStatus.Matched;
          }
        }

        return NodeMatchEventStatus.PartiallyMatched;
      }
    }

    return NodeMatchEventStatus.NotMatched;
  }

  public childContainerStyle(): Record<string, string> {
    return this.childContainerMarginTop !== null
      ? { "margin-top": this.childContainerMarginTop + "px" }
      : {};
  }

  public collapseChildren(): void {
    this.childNodeContainerOverflow = "hidden";
    this.childContainerMarginTop =
      -(this.$refs["child_container"] as Element).clientHeight - 1;
    if (this.$refs.childNodeComponents) {
      for (const childNodeComponent of this.$refs
        .childNodeComponents as ProcessingTreeNode[]) {
        childNodeComponent.collapseChildren();
        if (childNodeComponent.areDetailsOpen) {
          childNodeComponent.closeDetails();
        }
      }
    }
    Tornado.removeExpandedNodePath(this.nodePath);
  }

  private toggleExpand(): void {
    if (!this.isFilter || !this.hasChildren) {
      return;
    }
    this.loadChildNodes();
    if (this.childNodesExpanded) {
      this.collapseChildren();
    } else {
      this.childContainerMarginTop = 0;
      Tornado.addExpandedNodePath(this.nodePath);
      this.$nextTick(() => {
        setTimeout(() => {
          this.childNodeContainerOverflow = "visible";
        }, 75);
      });
    }
  }

  private async loadChildNodes() {
    if (this.node.child_nodes) {
      return;
    }
    if (Tornado.editMode) {
      await Tornado.getDraftChildNodes({
        nodePath: this.nodePath,
        targetTree: Tornado.visibleTree,
      });
    } else {
      await Tornado.getCurrentTreeChildNodes(this.nodePath);
    }
  }

  private scrollNodeIntoView(): void {
    setTimeout(() => {
      this.$el.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }

  private onClickNode() {
    if (Tornado.addNodeSelectParentMode !== AddNodeProcessMode.none) {
      this.addNode(Tornado.addNodeSelectParentMode);
    } else if (
      Tornado.importNodeMode ===
      this.importNodeMode.childrenWithSelectParentPanel
    ) {
      Tornado.setImportPath(this.nodePath);
      Tornado.setImportNodeMode(this.importNodeMode.children);
      this.openImportModal();
    } else {
      this.openDetails();
    }
  }

  private openDetails() {
    Tornado.setOpenedNodeDetails(this.nodePath);
    Tornado.setSelectedRuleName("");

    this.scrollNodeIntoView();

    this.loadDetails();
  }

  private closeDetails() {
    Tornado.setOpenedNodeDetails([]);
    Tornado.setSelectedRuleName("");
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }

  get expandedPaths(): string[][] {
    return Tornado.expandedPaths;
  }

  get isClickable(): boolean {
    if (
      Tornado.editMode &&
      (Tornado.addNodeSelectParentMode ||
        Tornado.importNodeMode ===
          this.importNodeMode.childrenWithSelectParentPanel)
    ) {
      return this.isFilter && !this.isLoading;
    }

    return !this.isLoading;
  }

  private getChildNodePath(child: ProcessingTreeNodeDto): string[] {
    if (child) {
      const path = [...this.nodePath];
      path.push(child.name);
      return path;
    }
    return [];
  }

  get childNodesExpanded(): boolean {
    return this.nodePathIsExpanded(this.nodePath) ?? false;
  }

  private nodePathIsExpanded(nodePath: string[]): boolean {
    return arrayIndexInMatrix(nodePath, Tornado.expandedPaths) > -1;
  }

  private loadDetails(): void {
    if (this.node.details) {
      return;
    }
    if (Tornado.editMode) {
      Tornado.loadDraftTreeNodeDetails({
        nodePath: this.nodePath,
        targetTree: Tornado.visibleTree,
      });
    } else {
      Tornado.loadActiveTreeNodeDetails(this.nodePath);
    }
  }

  private async addNode(
    nodeType: AddNodeProcessMode.filter | AddNodeProcessMode.ruleset
  ) {
    await this.loadChildNodes();

    const newNodeName = this.getNewNodeName();
    let node: ProcessingTreeNodeDto;
    if (nodeType === AddNodeProcessMode.filter) {
      node = {
        type: "Filter",
        name: newNodeName,
        rules_count: 0,
        children_count: 0,
        description: "",
        child_nodes: [],
        details: {
          type: "Filter",
          name: newNodeName,
          description: "",
          active: true,
          filter: null,
        },
        active: true,
      };
    } else {
      node = {
        type: "Ruleset",
        name: newNodeName,
        rules_count: 0,
        child_nodes: undefined,
        details: {
          type: "Ruleset",
          name: newNodeName,
          rules: [],
        },
      };
    }

    Tornado.addChildNode({ node, nodePath: this.nodePath });
    if (!this.childNodesExpanded) {
      this.toggleExpand();
    }

    Tornado.setAddNodeSelectParentMode(AddNodeProcessMode.none);

    const newNodePath = [...this.nodePath];
    newNodePath.push(newNodeName);
    Tornado.setOpenedNodeDetails(newNodePath);
  }

  private existsChildWithName(nodeName: string) {
    if (this.node && this.node.type === "Filter" && this.node.child_nodes) {
      for (const child of this.node.child_nodes) {
        if (child.name === nodeName) {
          return true;
        }
      }
    }
    return false;
  }

  private getNewNodeName(counter = 0): string {
    let newNodeName = "New_node";
    if (counter > 0) {
      newNodeName += "_" + counter;
    }

    if (this.existsChildWithName(newNodeName)) {
      newNodeName = this.getNewNodeName(++counter);
    }

    return newNodeName;
  }

  private checkIfDraftIsSaved(type: ImportNodeMode): void {
    if (type) {
      Tornado.setImportNodeMode(type);
    }
    if (!Tornado.actionsQueue.isEmpty()) {
      if (this.$refs.saveToContinueModal) {
        (this.$refs.saveToContinueModal as ConfirmationModal).showModal();
      }
      return;
    } else {
      this.sortImportExportProcedure();
    }
  }

  private openImportToReplaceModal(): void {
    Tornado.setImportNodeMode(ImportNodeMode.replace);
    Tornado.setImportNodeOverwrite(this.node.name);
    Tornado.setImportPath([...this.parentNodePath]);
    this.openImportModal();
  }

  sortImportExportProcedure(): void {
    switch (Tornado.importNodeMode) {
      case this.importNodeMode.replace:
        this.openImportToReplaceModal();
        break;
      case this.importNodeMode.export:
        this.exportNode();
        break;
      default:
        return;
    }
  }

  private openImportModal(): void {
    this.isImportModalOpen = true;
  }

  private closeImportModal(): void {
    this.isImportModalOpen = false;
    Tornado.setImportNodeMode(ImportNodeMode.none);
    Tornado.setImportPath([]);
  }

  private openOverwriteModal(): void {
    this.isOverwriteModalOpen = true;
  }

  private openHaltModal(): void {
    this.isHaltModalOpen = true;
  }

  private closeOverwriteModal(): void {
    this.isOverwriteModalOpen = false;
  }

  @Watch("showImportModal", { immediate: true })
  onPropertyChange(value: boolean): void {
    this.isImportModalOpen = value;
  }

  @Watch("editMode")
  // eslint-disable-next-line
  async onPropertyChanged(value: any) {
    if (this.node) {
      //load the children of this node if it was expanded
      if (this.isFilter && this.childNodesExpanded) {
        await this.loadChildNodes();
      } else {
        this.collapseChildren();
      }
      if (!this.editMode) {
        Tornado.setTreeIsLoading(false);
      }
      if (this.areDetailsOpen) {
        await this.loadDetails();
        //bring it into view
        this.scrollNodeIntoView();
      }
    }
  }

  private async mounted() {
    if (this.defaultExpanded) {
      this.toggleExpand();
    } else {
      if (this.$refs["child_container"] !== undefined) {
        this.collapseChildren();
      }
    }
    if (this.areDetailsOpen) {
      await this.loadDetails();
      this.scrollNodeIntoView();
    }
  }

  private stopParentClickNodeEventPropagation(event: PointerEvent): void {
    event.stopPropagation();
  }

  private async importNode(formData: FormData): Promise<void> {
    let overwrite = false;
    this.tornadoModule.setImportFormData(formData);
    let openedNodeDetailsMemo = false;
    if (Tornado.importNodeMode === ImportNodeMode.replace) {
      overwrite = true;
      // force close node details to avoid conflicts after re-fetching draft
      openedNodeDetailsMemo = this.areDetailsOpen;
      Tornado.setOpenedNodeDetails([]);
    }
    await Tornado.ImportNode({ formData, overwrite: overwrite }).then(
      async (response) => {
        try {
          if (response?.code === ImportValidationError.validationError) {
            if (Tornado.importNodeMode !== ImportNodeMode.replace) {
              // add current node name from response params in node path when you overwrite
              Tornado.setImportNodeOverwrite(response.params.NODE_NAME);
              this.openOverwriteModal();
              this.isImportModalOpen = false;
            } else {
              this.openHaltModal();
              this.isImportModalOpen = false;
            }
          } else if (response?.status && response.status === 200) {
            this.closeImportModal();
            // reset state variables
            this.tornadoModule.setTreeIsLoading(false);
            this.tornadoModule.setImportNodeMode(ImportNodeMode.none);
            this.tornadoModule.setImportFormData(new FormData());
            this.tornadoModule.setImportPath([]);
            this.tornadoModule.setImportNodeOverwrite(null);
            await Tornado.loadDraft().then(() => {
              if (overwrite && openedNodeDetailsMemo) {
                // restore only if it is a replacing import, in child import details are forcibly closed beforehand
                this.openDetails();
              } else {
                if (!this.childNodesExpanded) {
                  this.toggleExpand();
                }
              }
            });
          }
        } catch (error) {
          Notification.addError({
            title: i18n.tc("errors.error"),
            message: error.toString(),
          });
        }
      }
    );
  }

  private async confirmOverwriteNode(): Promise<void> {
    let formData = Tornado.importFormData;
    try {
      await Tornado.ImportNode({ formData, overwrite: true })
        .then(async (response) => {
          if (response?.status && response.status === 200) {
            // reset state variables
            this.closeOverwriteModal();
            this.tornadoModule.setTreeIsLoading(false);
            this.tornadoModule.setImportNodeMode(ImportNodeMode.none);
            this.tornadoModule.setImportFormData(new FormData());
            this.tornadoModule.setImportPath([]);
            this.tornadoModule.setImportNodeOverwrite(null);
            await Tornado.loadDraft().then(() => {
              //show imported child
              if (!this.childNodesExpanded) {
                this.toggleExpand();
              }
            });
          } else {
            Notification.addError({
              title: i18n.tc("errors.error"),
              message: i18n.tc("errors.import_generic"),
            });
          }
        })
        .catch((error) => {
          Notification.addError({
            title: i18n.tc("errors.error"),
            message: error.toString(),
          });
        });
    } catch (error) {
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: error.toString(),
      });
    }
  }

  private exportNode(): void {
    if (!this.node) {
      return;
    }
    let nodePath = [...this.parentNodePath, this.node.name];
    Tornado.exportNode({ nodePath: nodePath });
  }

  private deleteNode(): void {
    Tornado.deleteNode({ nodePath: this.nodePath, isFilter: this.isFilter });
    if (this.isFilter) {
      Tornado.removeExpandedNodePath(this.nodePath);
    }
    if (this.areDetailsOpen) {
      Tornado.setOpenedNodeDetails([]);
    }
  }

  private openDeleteNodeConfirmationModal() {
    if (this.$refs.deleteNodeConfirmationModal) {
      (this.$refs.deleteNodeConfirmationModal as ConfirmationModal).showModal();
    }
  }

  get isRootNode(): boolean {
    return this.parentNodePath.length === 0;
  }

  private triggerSaveDraft() {
    this.$root.$emit("saveChangesTreeNode");

    let interval: undefined | number = setInterval(() => {
      if (Tornado.actionsQueue.isEmpty()) {
        clearInterval(interval);
        interval = undefined;
        this.sortImportExportProcedure();
      }
    }, 100);

    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
      }
    }, 1000 * 30);
  }

  private resetImportExportNodeMode(): void {
    Tornado.setImportNodeMode(this.importNodeMode.none);
  }
}
</script>

<style lang="scss">
.bx--tile--clickable {
  &:hover {
    background: none !important;
  }
}
.node-menu {
  &:focus,
  &:hover {
    background-color: $ui-12;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  & .cv-button {
    &:hover {
      background-color: $ui-12;
    }
    &:focus {
      background-color: $ui-12;
      border: none;
      box-shadow: none;
    }
  }
}
.overflow-button-icon {
  fill: $icon-primary;
}
.processing-tree-container > .processing-tree-node-container:first-child {
  & > .space {
    display: none;
  }

  & > .node-content-container {
    width: 540px !important;

    & > .line-container {
      display: none;
    }
  }

  & > .child-node-container {
    padding-left: 16px !important;
    border: none;

    &.child-nodes-expanded {
      padding-bottom: 285px;
    }
  }
}

.processing-tree-node-container {
  &:last-child {
    & > .child-node-container {
      border-color: transparent !important;
    }

    & > .node-content-container > .line-container {
      border-color: transparent !important;
    }
  }
}

.node-menu-item {
  .bx--overflow-menu-options__btn:focus {
    outline: none;
    outline-offset: 0;
  }
}

.select-parent-icon {
  margin-top: 10px;
  margin-right: 10px;
}

.node-menu-item.delete-node {
  border-top: 1px solid $divider-primary;
}

.delete-node-confirmation-modal {
  .cv-button.bx--btn.bx--btn--primary {
    background-color: #fa4d56;
  }
}
</style>
<style lang="scss">
.collapsed {
  .bx--tile {
    min-height: 32px !important;
  }
  .overview-content {
    height: 32px !important;
    .title {
      justify-content: flex-start !important;
    }
    .name {
      margin-right: 12px;
    }
    .description {
      display: none !important;
    }
  }
  .space {
    height: 4px !important;
  }
  .line-container {
    .curved-line {
      height: 18px !important;
    }
  }
  .node-content-container {
    min-height: 32px !important;
  }
  .node-handle {
    border-left: none !important;
    background-color: $ui-01 !important;
    justify-content: center !important;
    &:hover {
      background-color: $ui-02 !important;
    }
    &--opened {
      background-color: $ui-01 !important;
    }
    .icons-container {
      height: 20px !important;
      .expand-icon {
        height: 20px !important;
      }
    }
  }
  .has-children {
    width: 502px !important;
  }
  .no-children {
    width: 538px !important;
  }
  .node-menu {
    margin-left: auto;
  }
}
</style>
<style lang="scss" scoped>
.child-node-container.child-nodes-expanded {
  //overflow: visible !important;
}
.processing-tree-node-container {
  display: flex;
  flex-flow: column;

  .space {
    height: 16px;
    border-left: solid 2px var(--cds-disabled-02);
  }

  .node-content-container {
    display: flex;
    flex-flow: row;
    min-height: 73px;

    .line-container {
      z-index: -1;
      position: relative;
      border-left: solid 2px var(--cds-disabled-02);
      width: 23px;

      .curved-line {
        height: 38px;
        width: 100%;
        border-bottom: solid 2px var(--cds-disabled-02);
        border-left: solid 2px var(--cds-disabled-02);
        border-radius: 0 0 0 12px;
        margin-left: -2px;
      }

      .straight-line {
        height: 38px;
        width: 0;
        top: 0;
        position: absolute;
        left: -2px;
        border-left: solid 2px var(--cds-disabled-02);
        display: none;
      }
    }

    .content {
      min-width: 477px;
      padding: 0;
      transition-property: min-width;
      transition-timing-function: carbon--motion(standard, productive);
      transition-duration: $moderate-01;

      &.details-expanded {
        min-width: 945px;
        max-width: 945px;
      }

      .content-overview {
        display: flex;
        width: 100%;
        max-width: 540px;
      }
      .overview-icons {
        path {
          fill: $ui-04;
        }
        .ruleset-icon path {
          fill: $icon-green;
        }

        .filter-icon path {
          fill: $icon-orange;
        }
      }
      .node-handle {
        min-width: 35px;
        padding: 8px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border-left: 2px solid $ui-background;

        .icons-container {
          height: 100%;
          display: flex;
          justify-content: space-between;
          flex-direction: column;
        }

        .expand-icon {
          transition-property: transform;
          transition-timing-function: carbon--motion(standard, productive);
          transition-duration: $fast-01;

          &.child-nodes-expanded {
            transform: rotate(180deg);
          }
        }
      }

      .node-overview {
        padding: 0;
        width: 500px;
        .overview-content {
          height: 77px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          max-width: 464px;
          width: 100%;
        }
        .overview-icons {
          padding: 8px;
        }
        .overview-container {
          display: flex;
          flex-direction: row;

          .disable-tag {
            min-width: 77px;
            margin-left: $spacing-03;
            margin-top: 1px;
            height: 18px;
            background-color: $tag-01;
            color: $tag-text-01;
          }

          .title {
            font-style: normal;
            font-weight: normal;
            font-size: 16px;
            line-height: 20px;
            text-overflow: ellipsis;
            overflow: visible;
            white-space: nowrap;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;

            & > div:first-child {
              padding-top: 8px;
              padding-left: 8px;
            }

            .right-icons-container {
              display: flex;
              flex-grow: 1;
            }

            .name-container {
              max-width: calc(100% - 72px);
              display: flex;

              .name {
                overflow: hidden;
                text-overflow: ellipsis;
                margin-right: 12px;
              }
            }
          }

          .description {
            display: flex;
            font-size: 12px;
            line-height: 15px;
            color: $text-05;
            padding-left: 8px;
            padding-bottom: 8px;

            div {
              display: inherit;
              white-space: nowrap;

              &:last-child {
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }

            .description-text {
              display: block;
            }
          }
        }
      }
    }
  }

  .child-node-container {
    padding-left: 36px;
    border-left: solid 2px var(--cds-disabled-02);
    overflow: hidden;

    & > div {
      margin-top: -10000px;
      transition-property: margin-top;
      transition-timing-function: carbon--motion(standard, productive);
      transition-duration: $fast-01;
    }
  }
}

.processing-tree-node-container.matched {
  & > .node-content-container > .line-container .curved-line,
  & > .space {
    border-color: #ffbf1a !important;
  }
}

.processing-tree-node-container.sibling-matched {
  & > .node-content-container > .line-container,
  & > .node-content-container > .line-container .straight-line,
  & > .space,
  & > .child-node-container {
    border-color: #ffbf1a !important;
    display: block;
  }
}

.test-matched {
  margin: 10px 10px 0 0;

  .test-match-icon path {
    fill: #ffbf1a;
  }
}

.dark {
  .content {
    box-shadow: $ui-background -8px 0px 10px;
  }

  .content-overview.disabled {
    .node-overview,
    .node-handle {
      background-color: $ui-11-disabled;
    }
  }
  .node-handle {
    background-color: #353535;
    &--opened {
      background-color: #1e1e1e;
    }
  }
}

.light {
  .content {
    box-shadow: $button-separator -8px 0px 10px;
  }

  .content-overview.disabled {
    .node-overview,
    .node-handle {
      background-color: $ui-11-disabled;
    }
  }
}
</style>
