import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";
import {
  ProcessedEventDto,
  TreeInfoDto,
  ProcessingTreeNodeConfigDto,
  SendEventRequestDto,
  ProcessedNodeDto,
  Value,
  OperatorDto,
  RuleDetailsDto,
  ProcessedRuleDto,
} from "tornado-backend-dto";
import { getModule } from "vuex-module-decorators";
import store from "@/store";
import {
  getTornadoActiveConfigurationTree,
  getTornadoActiveConfigurationTreeNodeDetails,
  sendEvent,
  getTornadoCurrentConfigurationInfo,
  getTornadoActiveConfigurationRuleDetails,
  deleteDraft,
  getListOfDrafts,
  createNewDraft,
  getDraftConfigurationTree,
  getDraftConfigurationTreeNodeDetails,
  getDraftConfigurationRuleDetails,
  deployDraft,
  takeoverDraft,
  sendEventDraft,
  ImportNodeFromDraft,
  exportNodeFromDraft,
} from "@/api/api";
import {
  getNodeByPath,
  getRuleByName,
  arrayIndexInMatrix,
  removeArrayFromMatrix,
  sortNodesByName,
} from "@/utils/processingTreeUtils";
import Vue from "vue";
import Notification from "@/store/notification";
import i18n from "@/utils/i18n";
import User from "@/store/user";
import { ActionsQueue } from "@/actions/ActionsQueue";
import { DeleteNodeAction } from "@/actions/DeleteNodeAction";
import { AddNodeAction } from "@/actions/AddNodeAction";
import { AxiosResponse } from "axios";
import { EditNodeAction } from "@/actions/EditNodeAction";
import { AddRuleAction } from "@/actions/AddRuleAction";
import { DeleteRuleAction } from "@/actions/DeleteRuleAction";
import { cloneDeep } from "lodash";
import { ReorderRuleAction } from "@/actions/ReorderRuleAction";
import { EditRuleAction } from "@/actions/EditRuleAction";
import {
  createRuleDtoFromRuleCompleteDto,
  findRuleIndexByRuleName,
  isRuleset,
  notifyNodeNotFound,
  notifyNodeNotInRuleSet,
  notifyRuleNotFound,
  moveItemPositionByIndex,
  toExtractorArray,
  toOperatorType,
  toActionArray,
} from "./helper/tornadoHelper";
import { Modifier } from "@/core/Extractor/Modifiers";
import { RegexDetails } from "@/core/Extractor/Regex";
import { BaseAction } from "@/core/Action/Actions";
import { ProcessedRuleStatusDto } from "@/utils/TornadoDtoEnum";
import { SmartMonitoringCheckResultPayload } from "@/core/Action/Payload";

export enum AddNodeProcessMode {
  none = 0,
  filter,
  ruleset,
}

export enum ImportNodeMode {
  none = 0,
  replace = 1,
  childrenWithSelectParentPanel = 2,
  children = 3,
  export = 4,
}

export enum ImportValidationError {
  validationError = "VALIDATION_ERROR",
}

export type ExtractedVariableDto = {
  rule: string;
  variable: string;
  value: Value;
};

export type TriggeredActionDto = {
  rule: string;
  action: string;
  value: Value;
  is_expanded: boolean;
};

export type ExtractorType = {
  variable: string;
  from: string;
  regexDetails: RegexDetails;
  postModifiers: Modifier[];
};

export type OperatorGroup =
  | { type: "AND"; operators: OperatorType[] }
  | { type: "OR"; operators: OperatorType[] };

export type OperatorNested =
  | OperatorGroup
  | { type: "NOT"; operator: OperatorType };

export type OperatorCondition =
  | { type: "contains"; first: Value; second: Value }
  | { type: "containsIgnoreCase"; first: Value; second: Value }
  | { type: "equals"; first: Value; second: Value }
  | { type: "equalsIgnoreCase"; first: Value; second: Value }
  | { type: "ge"; first: Value; second: Value }
  | { type: "gt"; first: Value; second: Value }
  | { type: "le"; first: Value; second: Value }
  | { type: "lt"; first: Value; second: Value }
  | { type: "ne"; first: Value; second: Value }
  | { type: "regex"; first: string; second: string };

export type OperatorType = OperatorNested | OperatorCondition;

export type ProcessingTreeNodeDto = ProcessingTreeNodeConfigDto & {
  child_nodes: ProcessingTreeNodeDto[] | undefined;
  details: ProcessingTreeNodeDetailsDto | undefined;
};

export type ProcessingTreeNodeDetailsDto =
  | {
      type: "Filter";
      name: string;
      description: string;
      active: boolean;
      filter: OperatorDto | null;
    }
  | { type: "Ruleset"; name: string; rules: RuleCompleteDto[] };

export type RuleCompleteDto = RuleDetailsDto & {
  operators_extractors_actions: RuleOperatorsExtractorsActions | undefined;
};

export type RuleWithProcessedStatusDto = RuleCompleteDto & {
  processedStatus: ProcessedRuleDto | null;
};

export type UnsavedEditedPath = {
  currentPath: string;
  originalPath: string;
  children: UnsavedEditedPath[];
};

export type RuleOperatorsExtractorsActions = {
  where: OperatorType | null;
  with: ExtractorType[];
  actions: BaseAction[];
};

function getProcessedNode(
  processedNodes: ProcessedNodeDto[],
  nodePath: string[]
): ProcessedNodeDto | null {
  const searchNodeName = nodePath.shift();

  for (const processedNode of processedNodes) {
    if (processedNode.name === searchNodeName) {
      if (nodePath.length === 0) {
        return processedNode;
      } else if (processedNode.type === "Filter") {
        return getProcessedNode(processedNode.nodes, nodePath);
      }
    }
  }

  return null;
}

export function getCurrentTenantEventResponse(
  full_event: ProcessedEventDto,
  processingTree: ProcessingTreeNodeDto[]
): ProcessedEventDto | null {
  const nodes_queue = [full_event.result];
  const currentTenantEventResponse = {
    event: full_event.event,
    result: full_event.result,
  };

  while (nodes_queue.length > 0) {
    const current_node = nodes_queue.shift();

    if (current_node) {
      if (current_node.name == processingTree[0].name) {
        currentTenantEventResponse.result = current_node;

        return currentTenantEventResponse;
      } else if (current_node.type === "Filter") {
        nodes_queue.push(...current_node.nodes);
      }
    }
  }

  return null;
}

export function getRuleFromNode(
  node: ProcessingTreeNodeDto | undefined,
  nodePath: string[],
  ruleName: string
): RuleCompleteDto | null {
  if (!node) {
    notifyNodeNotFound(nodePath);
    return null;
  }

  if (!node.details) {
    Notification.addError({
      title: i18n.tc("errors.error"),
      message: i18n.tc("store.tornado.node_details_not_loaded", 0, {
        path: nodePath.join("/"),
      }),
    });
    return null;
  }

  if (node.type !== "Ruleset" || node.details.type !== "Ruleset") {
    notifyNodeNotInRuleSet(nodePath);
    return null;
  }

  const rule = getRuleByName(node.details.rules, ruleName);

  if (!rule) {
    notifyRuleNotFound(ruleName, nodePath);
    return null;
  }

  return rule;
}

// Convert an unsaved path with the original one.
// This function is used on GET draft methods (get child nodes and get node details)
export function currentUnsavedEditedPathToOriginalPath(
  currentPath: string[]
): string[] {
  const originalPath = [...currentPath];
  let nodes = [moduleInstance.unsavedEditedRootPath];
  let curPathLevel = 0;
  while (nodes.length > 0) {
    const node = nodes.shift();
    const path = currentPath[curPathLevel];
    if (node !== undefined && node.currentPath === path) {
      originalPath[curPathLevel] = node.originalPath;
      nodes = [...node.children];
      curPathLevel++;
    }
  }

  return originalPath;
}

// traverse the unsaved edited path structure and rename the last node of 'path' with 'newLeafPath'
export function addUnsavedEditedPath(
  path: string[],
  newPathSegment: string,
  node: UnsavedEditedPath
): void {
  // we are on the node that needs to be renamed
  if (path.length === 0) {
    node.currentPath = newPathSegment;
    return;
  }

  // otherwise we are in a parent node so
  // check if next child is already there
  let nodeIndex = -1;
  for (let i = 0; i < node.children.length; ++i) {
    if (node.children[i].currentPath === path[0]) {
      nodeIndex = i;
      break;
    }
  }

  // create the node if it doesn't exist
  if (nodeIndex === -1) {
    const newNode: UnsavedEditedPath = {
      currentPath: path[0],
      originalPath: path[0],
      children: [],
    };
    node.children.push(newNode);
    nodeIndex = node.children.length - 1;
  }

  // check next path on the next level of the structure
  path.shift();
  addUnsavedEditedPath(path, newPathSegment, node.children[nodeIndex]);
}

@Module({ dynamic: true, store: store, name: "Tornado" })
class Tornado extends VuexModule {
  public treeInfo: TreeInfoDto | null = null;

  public visibleTree: ProcessingTreeNodeDto[] = [];
  public processedEvent: ProcessedEventDto | null = null;
  public eventIsRunning = false;

  public openedNodeDetailsPath: string[] = [];
  public extractedVariables: ExtractedVariableDto[] = [];
  public triggeredActions: TriggeredActionDto[] = [];
  public selectedRuleName = "";

  public expandedPaths: string[][] = [];

  public editMode = false;
  public treeIsLoading = false;
  public draftId: string | null = null;
  public draftTree: ProcessingTreeNodeDto[] = [];
  public selectedRuleReload = false;

  public processingTreeCached: ProcessingTreeNodeDto[] = [];

  public addNodeSelectParentMode: AddNodeProcessMode = AddNodeProcessMode.none;
  public importNodeMode: ImportNodeMode = ImportNodeMode.none;
  public importFormData: FormData = new FormData();
  public importPath: string[] = [];
  public importNodeOverwrite: string | null = null;
  public actionsQueue: ActionsQueue = new ActionsQueue();
  private triggerSavePopup = false;

  public unsavedEditedRootPath: UnsavedEditedPath = {
    currentPath: "root",
    originalPath: "root",
    children: [],
  };

  @Mutation
  setTreeInfo(treeInfo: TreeInfoDto | null) {
    this.treeInfo = treeInfo;
  }

  @Action
  async updateTreeInfo() {
    let treeInfo = null;
    try {
      const response = await getTornadoCurrentConfigurationInfo(
        User.selectedTenant
      );
      if (response.status === 200) {
        treeInfo = response.data;
      } else {
        Notification.addError({
          title: response.status.toString(),
          message: response.statusText,
        });
      }
    } catch (error) {
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: error.toString(),
      });
    }
    this.setTreeInfo(treeInfo);
  }

  @Action
  async getCurrentTreeChildNodes(nodePath: string[]) {
    try {
      const response = await getTornadoActiveConfigurationTree(
        User.selectedTenant,
        nodePath
      );
      if (nodePath.length === 0) {
        this.initializeCurrentTree(response.data);
      } else {
        this.setChildNodes({
          nodes: response.data,
          nodePath: nodePath,
          targetTree: this.visibleTree,
        });
      }
    } catch (error) {
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: error.toString(),
      });
    }
  }

  @Mutation
  initializeCurrentTree(nodes: ProcessingTreeNodeDto[]) {
    this.visibleTree = nodes;
  }

  @Mutation
  initializeDraftTree(nodes: ProcessingTreeNodeDto[]) {
    this.draftTree = nodes;
  }

  @Mutation
  setChildNodes(params: {
    nodes: ProcessingTreeNodeDto[];
    nodePath: string[];
    targetTree: ProcessingTreeNodeDto[];
  }) {
    const node = getNodeByPath(params.targetTree, params.nodePath);
    if (!node) {
      notifyNodeNotFound(params.nodePath);
      return;
    }
    Vue.set(node, "child_nodes", params.nodes);
  }

  @Mutation
  addChildNode(params: { node: ProcessingTreeNodeDto; nodePath: string[] }) {
    const parentNode = getNodeByPath(this.visibleTree, params.nodePath);
    if (!parentNode) {
      notifyNodeNotFound(params.nodePath);
      return;
    }

    if (parentNode.child_nodes) {
      parentNode.child_nodes.push(params.node);
      sortNodesByName(parentNode.child_nodes);
      Vue.set(parentNode, "child_nodes", parentNode.child_nodes);
    }

    if (parentNode.type === "Filter") {
      let count = parentNode.children_count;
      count++;
      Vue.set(parentNode, "children_count", count);
    }

    //Add event to actions queue
    if (params.node.details) {
      const childPath = [...params.nodePath];

      const addAction = new AddNodeAction(
        cloneDeep(params.node.details),
        childPath
      );
      this.actionsQueue.addAction(addAction);
    }
  }

  @Mutation
  deleteNode(params: { nodePath: string[]; isFilter: boolean }) {
    const node = getNodeByPath(this.visibleTree, params.nodePath);
    if (!node) {
      notifyNodeNotFound(params.nodePath);
      return;
    }

    const parentNodePath = params.nodePath.slice(0, -1);
    const parentNode = getNodeByPath(this.visibleTree, parentNodePath);

    if (parentNode && parentNode.child_nodes) {
      parentNode.child_nodes.splice(parentNode.child_nodes.indexOf(node), 1);
      Vue.set(parentNode, "child_nodes", parentNode.child_nodes);

      if (parentNode.type === "Filter") {
        let count = parentNode.children_count;
        count--;
        Vue.set(parentNode, "children_count", count);

        //update rules count in parent nodes, recursively
        const decrementFactor = -node.rules_count;
        moduleInstance.updateParentRulesCount({
          nodePath: parentNodePath,
          factor: decrementFactor,
        });
      }

      //add the delete action to the queue
      const deleteAction = new DeleteNodeAction(
        params.nodePath,
        params.isFilter ? "filter" : "ruleset"
      );
      this.actionsQueue.addAction(deleteAction);
    }
  }

  @Mutation
  updateParentRulesCount(params: { nodePath: string[]; factor: number }) {
    //if the path is empty we are done
    if (params.nodePath.length === 0) {
      return;
    }
    //otherwise get the parent node from the path
    const parentNode = getNodeByPath(this.visibleTree, params.nodePath);

    if (parentNode) {
      let parentNodeRulesCount = parentNode.rules_count;
      parentNodeRulesCount += params.factor;
      Vue.set(parentNode, "rules_count", parentNodeRulesCount);
      moduleInstance.updateParentRulesCount({
        nodePath: params.nodePath.slice(0, -1),
        factor: params.factor,
      });
    }
  }

  @Action({ rawError: true })
  async getDraftChildNodes(params: {
    nodePath: string[];
    targetTree: ProcessingTreeNodeDto[];
  }): Promise<void> {
    try {
      if (this.draftId === null) {
        return;
      }

      const response = await getDraftConfigurationTree(
        User.selectedTenant,
        this.draftId,
        currentUnsavedEditedPathToOriginalPath(params.nodePath)
      );
      if (params.nodePath.length === 0) {
        this.initializeDraftTree(response.data);
      } else {
        this.setChildNodes({
          nodes: response.data,
          nodePath: params.nodePath,
          targetTree: params.targetTree,
        });
      }
    } catch (error) {
      if (
        error.response.status === 403 &&
        error.response.data.code === "NOT_OWNER"
      ) {
        this.setTreeIsLoading(false);
        throw error;
      } else if (error.response.status === 404) {
        this.removeExpandedNodePath(params.nodePath);
      } else {
        Notification.addError({
          title: i18n.tc("errors.error"),
          message: error.toString(),
        });
      }
    }
  }

  @Action
  async loadActiveTreeNodeDetails(nodePath: string[]) {
    try {
      const response = await getTornadoActiveConfigurationTreeNodeDetails(
        User.selectedTenant,
        nodePath
      );

      this.setNodeDetails({
        details: response.data,
        nodePath: nodePath,
        targetTree: this.visibleTree,
      });
    } catch (error) {
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: error.toString(),
      });
    }
  }

  @Action
  async loadDraftTreeNodeDetails(params: {
    nodePath: string[];
    targetTree: ProcessingTreeNodeDto[];
  }) {
    try {
      if (this.draftId) {
        const response = await getDraftConfigurationTreeNodeDetails(
          User.selectedTenant,
          this.draftId,
          currentUnsavedEditedPathToOriginalPath(params.nodePath)
        );

        this.setNodeDetails({
          details: response.data,
          nodePath: params.nodePath,
          targetTree: params.targetTree,
        });
      }
    } catch (error) {
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: error.toString(),
      });
    }
  }

  @Mutation
  setNodeDetails(params: {
    details: ProcessingTreeNodeDetailsDto;
    nodePath: string[];
    targetTree: ProcessingTreeNodeDto[];
  }) {
    const node = getNodeByPath(params.targetTree, params.nodePath);
    if (!node) {
      notifyNodeNotFound(params.nodePath);
      return;
    }

    Vue.set(node, "details", params.details);
  }

  @Mutation
  updateNodeDetails(params: {
    details: ProcessingTreeNodeDetailsDto;
    nodePath: string[];
    targetTree: ProcessingTreeNodeDto[];
  }) {
    const node = getNodeByPath(params.targetTree, params.nodePath);
    if (!node) {
      notifyNodeNotFound(params.nodePath);
      return;
    }

    moduleInstance.setNodeDetails(params);

    Vue.set(node, "name", params.details.name);
    if (params.details.type === "Filter") {
      Vue.set(node, "description", params.details.description);
      Vue.set(node, "active", params.details.active);
    }
    //sort children
    const parentNode = getNodeByPath(
      params.targetTree,
      params.nodePath.slice(0, -1)
    );
    if (parentNode && parentNode.child_nodes) {
      sortNodesByName(parentNode.child_nodes);
    }

    //Add edit action to queue
    const editAction = new EditNodeAction(
      cloneDeep(params.details),
      params.nodePath
    );
    this.actionsQueue.addAction(editAction);
  }

  @Action
  async loadActiveTreeRuleDetails(params: {
    nodePath: string[];
    ruleName: string;
  }) {
    try {
      const node = getNodeByPath(this.visibleTree, params.nodePath);
      const rule = getRuleFromNode(node, params.nodePath, params.ruleName);

      if (rule === null) {
        return;
      }
      const response = await getTornadoActiveConfigurationRuleDetails(
        User.selectedTenant,
        params.nodePath,
        params.ruleName
      );

      const ruleOperatorsExtractorsActions: RuleOperatorsExtractorsActions = {
        where: response.data.constraint.WHERE
          ? toOperatorType(response.data.constraint.WHERE)
          : null,
        with: toExtractorArray(response.data.constraint.WITH),
        actions: toActionArray(response.data.actions),
      };

      this.setRuleOperatorsExtractorsActions({
        ruleOperatorsExtractorsActions,
        rule,
      });
    } catch (error) {
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: error.toString(),
      });
    }
  }

  @Action
  async loadDraftTreeRuleDetails(params: {
    nodePath: string[];
    ruleName: string;
    targetTree: ProcessingTreeNodeDto[];
  }) {
    try {
      if (this.draftId === null) {
        return;
      }
      const node = getNodeByPath(params.targetTree, params.nodePath);
      const rule = getRuleFromNode(node, params.nodePath, params.ruleName);

      if (rule === null) {
        return;
      }

      const response = await getDraftConfigurationRuleDetails(
        User.selectedTenant,
        this.draftId,
        params.nodePath,
        params.ruleName
      );

      const ruleOperatorsExtractorsActions: RuleOperatorsExtractorsActions = {
        where: response.data.constraint.WHERE
          ? toOperatorType(response.data.constraint.WHERE)
          : null,
        with: toExtractorArray(response.data.constraint.WITH),
        actions: toActionArray(response.data.actions),
      };

      this.setRuleOperatorsExtractorsActions({
        ruleOperatorsExtractorsActions,
        rule,
      });
    } catch (error) {
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: error.toString(),
      });
    }
  }

  @Mutation
  setRuleOperatorsExtractorsActions(params: {
    ruleOperatorsExtractorsActions: RuleOperatorsExtractorsActions;
    rule: RuleCompleteDto;
  }) {
    Vue.set(
      params.rule,
      "operators_extractors_actions",
      params.ruleOperatorsExtractorsActions
    );
  }

  @Action
  async sendEventDraft(testEvent: SendEventRequestDto) {
    this.setEventIsRunning(true);
    try {
      if (!this.draftId) {
        return;
      }
      const response = await sendEventDraft(
        User.selectedTenant,
        this.draftId,
        testEvent
      );

      this.processEventResponse(response);
    } catch (error) {
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: error.toString(),
      });
    }
    this.setEventIsRunning(false);
  }

  @Action
  async sendEvent(testEvent: SendEventRequestDto) {
    this.setEventIsRunning(true);
    try {
      const response = await sendEvent(User.selectedTenant, testEvent);

      this.processEventResponse(response);
    } catch (error) {
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: error.toString(),
      });
    }

    this.setEventIsRunning(false);
  }

  @Action
  processEventResponse(response: AxiosResponse<ProcessedEventDto>) {
    if (response.status === 200) {
      const currentTenantResponse = getCurrentTenantEventResponse(
        response.data,
        this.visibleTree
      );
      if (currentTenantResponse) {
        this.setProcessedEvent(currentTenantResponse);
      } else {
        Notification.addError({
          title: i18n.tc("test_window.tenant_not_found_error.title"),
          message: i18n.tc("test_window.tenant_not_found_error.text"),
        });
      }
    } else {
      Notification.addError({
        title: response.status.toString(),
        message: response.statusText,
      });
    }
  }

  @Mutation
  setEventIsRunning(eventIsRunning: boolean) {
    this.eventIsRunning = eventIsRunning;
  }

  @Mutation
  setProcessedEvent(processedEvent: ProcessedEventDto | null) {
    this.processedEvent = processedEvent;
    moduleInstance.updateTriggeredActionsAndVariables();
  }

  @Action
  updateTriggeredActionsAndVariables() {
    const extractedVariables: ExtractedVariableDto[] = [];
    const triggeredActions: TriggeredActionDto[] = [];
    if (this.openedNodeDetailsPath.length && this.processedEvent) {
      const processedNode = getProcessedNode(
        [this.processedEvent.result],
        [...this.openedNodeDetailsPath]
      );

      if (processedNode && processedNode.type === "Ruleset") {
        for (const ruleName in processedNode.rules.extracted_vars) {
          for (const variableName in processedNode.rules.extracted_vars[
            ruleName
          ]) {
            extractedVariables.push({
              rule: ruleName,
              variable: variableName,
              value: processedNode.rules.extracted_vars[ruleName][variableName],
            });
          }
        }

        processedNode.rules.rules.forEach((rule: ProcessedRuleDto) => {
          rule.actions.forEach(
            (action: {
              id: string;
              payload: SmartMonitoringCheckResultPayload;
            }) => {
              if (rule.status === ProcessedRuleStatusDto.Matched) {
                triggeredActions.push({
                  rule: rule.name,
                  action: action.id,
                  value: action.payload,
                  is_expanded: false,
                });
              }
            }
          );
        });
      }
    }
    this.setExtractedVariables(extractedVariables);
    this.setTriggeredActions(triggeredActions);
  }

  @Mutation
  setExtractedVariables(extractedVariables: ExtractedVariableDto[]) {
    this.extractedVariables = extractedVariables;
  }

  @Mutation
  setTriggeredActions(triggeredActions: TriggeredActionDto[]) {
    this.triggeredActions = triggeredActions;
  }

  @Mutation
  setOpenedNodeDetails(newOpenedNodePath: string[]) {
    this.openedNodeDetailsPath = newOpenedNodePath;
    moduleInstance.updateTriggeredActionsAndVariables();
  }

  @Mutation
  setSelectedRuleName(selectedRuleName: string) {
    this.selectedRuleName = selectedRuleName;
  }

  @Action
  async deleteDraft() {
    try {
      const response = await deleteDraft(User.selectedTenant, this.draftId);
      if (response.status === 200) {
        Notification.addSuccess({
          title: i18n.tc("edit_mode.delete_draft_title"),
          message: i18n.tc("edit_mode.delete_draft_message"),
        });
        this.setCurrentDraftId(null);
      } else {
        Notification.addError({
          title: response.status.toString(),
          message: response.statusText,
        });
      }
    } catch (error) {
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: error.toString(),
      });
    }
  }

  @Mutation
  setCurrentEditMode(currentEditMode: boolean) {
    this.editMode = currentEditMode;
  }

  @Action
  async getDraft(): Promise<boolean> {
    try {
      const response = await getListOfDrafts(User.selectedTenant);
      if (response.data.length > 0) {
        this.setCurrentDraftId(response.data[0]);
      } else {
        this.setCurrentDraftId(null);
      }
    } catch (error) {
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: error.toString(),
      });
      return false;
    }
    return true;
  }

  @Action
  async createDraft(): Promise<boolean> {
    try {
      const response = await createNewDraft(User.selectedTenant);
      this.setCurrentDraftId(response.data.id);
    } catch (error) {
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: error.toString(),
      });
      return false;
    }
    return true;
  }

  @Mutation
  setCurrentDraftId(currentDraftId: string | null) {
    this.draftId = currentDraftId;
  }

  @Mutation
  cacheCurrentActiveConfiguration() {
    this.processingTreeCached = cloneDeep(this.visibleTree);
  }

  @Mutation
  async restoreCurrentActiveConfiguration() {
    this.visibleTree = this.processingTreeCached;
    const expandedNodeDetails = getNodeByPath(
      this.visibleTree,
      this.openedNodeDetailsPath
    );
    if (!expandedNodeDetails) {
      this.openedNodeDetailsPath = [];
    }
  }

  @Mutation
  enableDraftConfiguration() {
    this.visibleTree = this.draftTree;
  }

  @Mutation
  setExpandedPaths(expandedPaths: string[][]) {
    this.expandedPaths = expandedPaths;
  }

  @Mutation
  setDraftTree(draftTree: ProcessingTreeNodeDto[]) {
    this.draftTree = draftTree;
  }

  @Action({ rawError: true })
  async loadDraft() {
    //cache current config
    this.cacheCurrentActiveConfiguration();

    await this.getDraftChildNodes({ nodePath: [], targetTree: this.draftTree });

    //set tree loading
    this.setTreeIsLoading(true);

    //for each of the expanded paths
    for (let i = 0; i < this.expandedPaths.length; i++) {
      const cur_expanded_path = this.expandedPaths[i];
      //if it is a direct child of the root (loaded by default) or the parent path exists in the draft
      if (
        cur_expanded_path.length === 1 ||
        getNodeByPath(this.draftTree, cur_expanded_path.slice(0, -1)) !==
          undefined
      ) {
        //load the children of that path
        await this.getDraftChildNodes({
          nodePath: cur_expanded_path,
          targetTree: this.draftTree,
        });
      }
    }
    //reload details of opened node, if any
    if (this.openedNodeDetailsPath.length > 0) {
      //if the opened path exists in the draft
      if (
        getNodeByPath(this.draftTree, this.openedNodeDetailsPath) !== undefined
      ) {
        await this.loadDraftTreeNodeDetails({
          nodePath: this.openedNodeDetailsPath,
          targetTree: this.draftTree,
        });

        //reload details of opened rule, if any
        if (this.selectedRuleName !== "") {
          await this.loadDraftTreeRuleDetails({
            nodePath: this.openedNodeDetailsPath,
            ruleName: this.selectedRuleName,
            targetTree: this.draftTree,
          });
          this.setSelectedRuleReload(true);
        }
      } else {
        //Show an error notification if it was not already thrown for that path because it was not existing
        Notification.addError({
          title: i18n.tc("errors.node_path_not_found_error.title"),
          message: i18n.tc("errors.opened_node_path_not_found_error", 1, {
            path: this.openedNodeDetailsPath.join(","),
          }),
        });
        this.setOpenedNodeDetails([]);
      }
    }

    //enable draft
    this.enableDraftConfiguration();
    this.setTreeIsLoading(false);
  }

  @Mutation
  addExpandedNodePath(nodePath: string[]) {
    if (arrayIndexInMatrix(nodePath, this.expandedPaths) === -1) {
      this.expandedPaths.push(nodePath);
    }
  }

  @Mutation
  removeExpandedNodePath(nodePath: string[]) {
    const nodePathIndex = arrayIndexInMatrix(nodePath, this.expandedPaths);
    if (nodePathIndex > -1) {
      this.expandedPaths = removeArrayFromMatrix(nodePath, this.expandedPaths);
    }
  }

  @Action
  async takeoverDraft() {
    if (this.draftId) {
      try {
        await takeoverDraft(User.selectedTenant, this.draftId);
        Notification.addSuccess({
          title: i18n.tc("edit_mode.takeover_draft_notification_success_title"),
          message: i18n.tc(
            "edit_mode.takeover_draft_notification_success_message"
          ),
        });
      } catch (error) {
        Notification.addError({
          title: i18n.tc("errors.error"),
          message: error.toString(),
        });
      }
    } else {
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: i18n.tc("errors.draft_takeover_generic"),
      });
    }
  }

  @Action
  async deployDraft() {
    if (this.draftId) {
      try {
        await deployDraft(User.selectedTenant, this.draftId);
        Notification.addSuccess({
          title: i18n.tc("edit_mode.draft_deploy_success_title"),
          message: i18n.tc("edit_mode.draft_deploy_success_message"),
        });
        this.setCurrentEditMode(false);
      } catch (error) {
        Notification.addError({
          title: i18n.tc("errors.error"),
          message: error.toString(),
        });
      }
    } else {
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: i18n.tc("errors.draft_deploy_generic"),
      });
    }
  }

  @Mutation
  setSelectedRuleReload(ruleReload: boolean) {
    this.selectedRuleReload = ruleReload;
  }

  @Mutation
  setTreeIsLoading(treeLoading: boolean) {
    this.treeIsLoading = treeLoading;
  }

  @Mutation
  setAddNodeSelectParentMode(addNodeSelectParentMode: AddNodeProcessMode) {
    this.addNodeSelectParentMode = addNodeSelectParentMode;
  }

  @Mutation
  setImportNodeMode(importNodeMode: ImportNodeMode) {
    this.importNodeMode = importNodeMode;
  }

  @Mutation
  setImportPath(importPath: string[]) {
    this.importPath = importPath;
  }

  @Mutation
  setImportFormData(formData: FormData) {
    this.importFormData = formData;
  }

  @Mutation
  setImportNodeOverwrite(node: string | null) {
    this.importNodeOverwrite = node;
  }

  @Mutation
  addUnsavedEditedPath(param: {
    originalPath: string[];
    newPathSegment: string;
  }): void {
    const pathWithoutRoot = [...param.originalPath];
    pathWithoutRoot.shift();
    addUnsavedEditedPath(
      pathWithoutRoot,
      param.newPathSegment,
      this.unsavedEditedRootPath
    );
  }

  @Mutation
  resetEditedNodes() {
    this.unsavedEditedRootPath.children = [];
  }

  @Mutation
  addRuleToRuleset(params: { rule: RuleCompleteDto; nodePath: string[] }) {
    // Find the node
    const rulesetNode = getNodeByPath(this.visibleTree, params.nodePath);
    if (!rulesetNode) {
      notifyNodeNotFound(params.nodePath);
      return;
    }

    // Check is node in ruleset
    if (!isRuleset(rulesetNode)) {
      notifyNodeNotInRuleSet(params.nodePath);
      return;
    }

    // Update the rule in store
    moduleInstance.updateParentRulesCount({
      nodePath: params.nodePath,
      factor: 1,
    });
    rulesetNode.details.rules.push(params.rule);
    Vue.set(rulesetNode.details, "rules", rulesetNode.details.rules);

    // Add event to actions queue
    const addAction = new AddRuleAction(
      cloneDeep(createRuleDtoFromRuleCompleteDto(params.rule)),
      params.nodePath
    );
    this.actionsQueue.addAction(addAction);
  }

  @Mutation
  updateRuleInRuleset(params: {
    newRule: RuleCompleteDto;
    oldRule: RuleCompleteDto;
    nodePath: string[];
  }) {
    // Find the node
    const rulesetNode = getNodeByPath(this.visibleTree, params.nodePath);
    if (!rulesetNode) {
      notifyNodeNotFound(params.nodePath);
      return;
    }

    // Check is node in ruleset
    if (!isRuleset(rulesetNode)) {
      notifyNodeNotInRuleSet(params.nodePath);
      return;
    }

    // Find rule index
    const ruleIndex = findRuleIndexByRuleName(
      rulesetNode.details.rules,
      params.oldRule.name
    );
    if (ruleIndex === -1) {
      notifyRuleNotFound(params.oldRule.name, params.nodePath);
      return;
    }

    // Update the rule in store
    Vue.set(rulesetNode.details.rules, ruleIndex, params.newRule);

    // Add event to actions queue
    const addAction = new EditRuleAction(
      cloneDeep(createRuleDtoFromRuleCompleteDto(params.newRule)),
      params.oldRule,
      params.nodePath
    );
    this.actionsQueue.addAction(addAction);
  }

  @Mutation
  deleteRuleFromRuleset(params: { rule: RuleCompleteDto; nodePath: string[] }) {
    const rulesetNode = getNodeByPath(this.visibleTree, params.nodePath);

    // Check if the ruleset node exists
    if (!rulesetNode) {
      notifyNodeNotFound(params.nodePath);
      return;
    }

    // Check if the node is a ruleset
    if (!isRuleset(rulesetNode)) {
      notifyNodeNotInRuleSet(params.nodePath);
      return;
    }

    // Find rule index
    const ruleIndex = findRuleIndexByRuleName(
      rulesetNode.details.rules,
      params.rule.name
    );
    if (ruleIndex === -1) {
      notifyRuleNotFound(params.rule.name, params.nodePath);
      return;
    }

    // Remove the rule
    moduleInstance.updateParentRulesCount({
      nodePath: params.nodePath,
      factor: -1,
    });
    rulesetNode.details.rules.splice(ruleIndex, 1);
    Vue.set(rulesetNode.details, "rules", rulesetNode.details.rules);

    // Add the delete rule action to the queue
    const deleteAction = new DeleteRuleAction(
      params.rule.name,
      params.nodePath
    );
    this.actionsQueue.addAction(deleteAction);
  }

  @Mutation
  reorderRuleInRuleset(params: {
    rule: RuleCompleteDto;
    nodePath: string[];
    newIndex: number;
    oldIndex: number;
  }) {
    const rulesetNode = getNodeByPath(this.visibleTree, params.nodePath);

    if (!rulesetNode) {
      notifyNodeNotFound(params.nodePath);
      return;
    }

    if (!isRuleset(rulesetNode)) {
      notifyNodeNotInRuleSet(params.nodePath);
      return;
    }

    const reorderedRules: RuleCompleteDto[] =
      moveItemPositionByIndex<RuleCompleteDto>(
        rulesetNode.details.rules,
        params.oldIndex,
        params.newIndex
      );
    // Update rules in store
    Vue.set(rulesetNode.details, "rules", reorderedRules);

    // Add event to actions queue
    const reorderAction = new ReorderRuleAction(
      params.rule.name,
      params.newIndex,
      params.nodePath
    );
    this.actionsQueue.addAction(reorderAction);
  }

  @Action
  async ImportNode(params: {
    formData: FormData;
    overwrite: boolean;
  }): Promise<any> {
    if (this.draftId) {
      try {
        //add node to overwrite to path
        if (params.overwrite && this.importNodeOverwrite) {
          this.setImportPath([...this.importPath, this.importNodeOverwrite]);
        }
        this.setTreeIsLoading(true);
        return await ImportNodeFromDraft(
          User.selectedTenant,
          this.draftId,
          this.importPath,
          params.formData,
          params.overwrite
        ).then((response) => {
          Notification.addSuccess({
            title: i18n.tc(
              "views.processing_tree.import_notification_success_title"
            ),
            message: i18n.tc(
              "views.processing_tree.import_notification_success_message"
            ),
          });
          return response;
        });
      } catch (error) {
        if (error.response.status !== 409) {
          Notification.addError({
            title: i18n.tc("errors.error"),
            message: error.toString(),
          });
        }
        this.setTreeIsLoading(false);
        return error.response.data;
      }
    } else {
      this.setTreeIsLoading(false);
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: i18n.tc("errors.import_generic"),
      });
    }
  }

  @Action
  async exportNode(params: { nodePath: string[] }) {
    if (this.draftId) {
      try {
        this.setTreeIsLoading(true);
        await exportNodeFromDraft(
          User.selectedTenant,
          this.draftId,
          params.nodePath
        ).then((response) => {
          const string = response.headers["content-disposition"];
          // regex to retrieve filename to assign to export file from response headers "Content-Disposition" parameter
          const regex = /"[^"]*"([^"]*([^"]*(?:[^\\"]|\\\\|\\")*)+)/i;
          const filename = string.match(regex)[0].replaceAll('"', "");

          let blob: Blob | undefined = new Blob(
            [JSON.stringify(response.data)],
            {
              type: "application/json",
            }
          );
          let link: HTMLAnchorElement | undefined = document.createElement("a");

          link.download = filename;
          link.href = window.URL.createObjectURL(blob);
          link.dataset.downloadurl = [
            "text/json",
            link.download,
            link.href,
          ].join(":");

          const evt = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
          });

          this.setTreeIsLoading(false);

          link.dispatchEvent(evt);
          link.remove();
          blob = undefined;
          link = undefined;
        });

        Notification.addSuccess({
          title: i18n.tc("edit_mode.export_success_title"),
          message: i18n.tc("edit_mode.export_success_message"),
        });
      } catch (error) {
        this.setTreeIsLoading(false);
        Notification.addError({
          title: i18n.tc("errors.error"),
          message: error.toString(),
        });
      }
    } else {
      this.setTreeIsLoading(false);
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: i18n.tc("errors.export_generic"),
      });
    }
  }
}

const moduleInstance = getModule(Tornado);
export default moduleInstance;
export type ExtractorRegex = {
  type: "Regex";
  match: string;
  group_match_idx: number | null;
  all_matches: boolean | null;
};
export type RegexNamedGroups = {
  type: "RegexNamedGroups";
  named_match: string;
  all_matches: boolean | null;
};
export type KeyRegex = { type: "KeyRegex"; single_key_match: string };
