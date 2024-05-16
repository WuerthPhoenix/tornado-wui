import Tornado, {
  ProcessingTreeNodeDto,
  getCurrentTenantEventResponse,
  ProcessingTreeNodeDetailsDto,
  RuleCompleteDto,
  RuleOperatorsExtractorsActions,
  getRuleFromNode,
  AddNodeProcessMode,
  UnsavedEditedPath,
  currentUnsavedEditedPathToOriginalPath,
} from "@/store/tornado";
import { TreeInfoDto, ProcessedEventDto } from "tornado-backend-dto";
import { ProcessedFilterStatusDto } from "@/utils/TornadoDtoEnum";
import i18n from "@/utils/i18n";
import { isRuleset } from "@/store/helper/tornadoHelper";

const treeInfo: TreeInfoDto = {
  rules_count: 970,
  filters_count: 32,
};

const mock = jest.spyOn(i18n, "tc");
mock.mockImplementation((a) => a);

describe("Mutations", () => {
  it("assign null treeInfo", () => {
    Tornado.setTreeInfo(null);
    expect(Tornado.treeInfo).toBe(null);
  });

  it("assign not null treeInfo", () => {
    Tornado.setTreeInfo(treeInfo);
    expect(Tornado.treeInfo).toBe(treeInfo);
  });

  it("assign root node to processing tree", () => {
    const rootNode: ProcessingTreeNodeDto = {
      type: "Filter",
      name: "root",
      rules_count: 100,
      children_count: 2,
      description: "This is the root node",
      child_nodes: undefined,
      details: undefined,
      active: true,
    };
    Tornado.initializeCurrentTree([rootNode]);
    expect(Tornado.visibleTree).toStrictEqual([rootNode]);
  });

  it("assign child nodes to root node", () => {
    const rootNode: ProcessingTreeNodeDto = {
      type: "Filter",
      name: "root",
      rules_count: 100,
      children_count: 2,
      description: "This is the root node",
      child_nodes: undefined,
      details: undefined,
      active: true,
    };

    const childNodes: ProcessingTreeNodeDto[] = [
      {
        type: "Filter",
        name: "filter1",
        rules_count: 50,
        children_count: 1,
        description: "This is a child node",
        child_nodes: undefined,
        details: undefined,
        active: true,
      },
      {
        type: "Filter",
        name: "filter2",
        rules_count: 50,
        children_count: 1,
        description: "This is a child node",
        child_nodes: undefined,
        details: undefined,
        active: true,
      },
    ];

    Tornado.initializeCurrentTree([rootNode]);
    Tornado.setChildNodes({
      nodes: childNodes,
      nodePath: ["root"],
      targetTree: Tornado.visibleTree,
    });
    expect(Tornado.visibleTree[0].child_nodes).toStrictEqual(childNodes);
  });

  it("assign node details to node", () => {
    const rootNode: ProcessingTreeNodeDto = {
      type: "Filter",
      name: "root",
      rules_count: 100,
      children_count: 2,
      description: "This is the root node",
      child_nodes: undefined,
      details: undefined,
      active: true,
    };

    const nodeDetails: ProcessingTreeNodeDetailsDto = {
      type: "Filter",
      name: "root",
      description: "This is the root node",
      active: true,
      filter: null,
    };

    Tornado.initializeCurrentTree([rootNode]);

    Tornado.setNodeDetails({
      details: nodeDetails,
      nodePath: ["root"],
      targetTree: Tornado.visibleTree,
    });
    expect(Tornado.visibleTree[0].details).toStrictEqual(nodeDetails);
  });

  it("assign node details to node - draft mode", () => {
    const rootNode: ProcessingTreeNodeDto = {
      type: "Filter",
      name: "root",
      rules_count: 100,
      children_count: 2,
      description: "This is the root node",
      child_nodes: undefined,
      details: undefined,
      active: true,
    };

    const nodeDetails: ProcessingTreeNodeDetailsDto = {
      type: "Filter",
      name: "root",
      description: "This is the root node",
      active: true,
      filter: null,
    };

    Tornado.initializeDraftTree([rootNode]);

    Tornado.setNodeDetails({
      details: nodeDetails,
      nodePath: ["root"],
      targetTree: Tornado.draftTree,
    });
    expect(Tornado.draftTree[0].details).toStrictEqual(nodeDetails);
  });

  it("updates the node details and checks the re-ordering", async () => {
    Tornado.actionsQueue.empty();

    const rootNode: ProcessingTreeNodeDto = {
      type: "Filter",
      name: "root",
      rules_count: 100,
      children_count: 2,
      description: "This is the root node",
      child_nodes: undefined,
      details: undefined,
      active: true,
    };

    const childNodes: ProcessingTreeNodeDto[] = [
      {
        type: "Filter",
        name: "filter1",
        rules_count: 50,
        children_count: 1,
        description: "This is the first child node",
        child_nodes: undefined,
        details: undefined,
        active: true,
      },
      {
        type: "Filter",
        name: "filter2",
        rules_count: 50,
        children_count: 1,
        description: "This is the second child node",
        child_nodes: undefined,
        details: undefined,
        active: true,
      },
    ];

    const filter1Details: ProcessingTreeNodeDetailsDto = {
      type: "Filter",
      name: "filter1",
      description: "This is the first child node",
      active: true,
      filter: null,
    };

    const filter2Details: ProcessingTreeNodeDetailsDto = {
      type: "Filter",
      name: "filter2",
      description: "This is the second child node",
      active: true,
      filter: null,
    };

    const filter1DetailsUpdated: ProcessingTreeNodeDetailsDto = {
      type: "Filter",
      name: "filter3",
      description: "This is now the second child node",
      active: true,
      filter: null,
    };

    Tornado.initializeCurrentTree([rootNode]);

    Tornado.setChildNodes({
      nodes: childNodes,
      nodePath: ["root"],
      targetTree: Tornado.visibleTree,
    });

    Tornado.setNodeDetails({
      details: filter1Details,
      nodePath: ["root", "filter1"],
      targetTree: Tornado.visibleTree,
    });

    Tornado.setNodeDetails({
      details: filter2Details,
      nodePath: ["root", "filter2"],
      targetTree: Tornado.visibleTree,
    });
    if (Tornado.visibleTree[0].child_nodes) {
      expect(Tornado.visibleTree[0].child_nodes[0].details).toStrictEqual(
        filter1Details
      );
      expect(Tornado.visibleTree[0].child_nodes[1].details).toStrictEqual(
        filter2Details
      );

      Tornado.updateNodeDetails({
        details: filter1DetailsUpdated,
        nodePath: ["root", "filter1"],
        targetTree: Tornado.visibleTree,
      });

      expect(Tornado.visibleTree[0].child_nodes[0].details).toStrictEqual(
        filter2Details
      );
      expect(Tornado.visibleTree[0].child_nodes[1].details).toStrictEqual(
        filter1DetailsUpdated
      );
      expect(Tornado.actionsQueue.isEmpty()).toBeFalsy();
      const editAction = Tornado.actionsQueue.getFirstAction();
      if (editAction) {
        expect(editAction.getType()).toStrictEqual("edit");
        expect(editAction.getTargetObject()).toStrictEqual("filter");
        Tornado.actionsQueue.empty();
      } else {
        fail("No edit action was added to the queue");
      }
    } else {
      fail("Child nodes are not present");
    }
  });

  it("set opened node", () => {
    const nodePath = ["root"];
    Tornado.setOpenedNodeDetails(nodePath);
    expect(Tornado.openedNodeDetailsPath).toStrictEqual(nodePath);
  });

  it("reset opened node", () => {
    const nodePath: string[] = [];
    Tornado.setOpenedNodeDetails(nodePath);
    expect(Tornado.openedNodeDetailsPath).toStrictEqual(nodePath);
  });

  it("opens the node details in two different nodes", async () => {
    const rootPath = ["root"];
    const filter1Path = ["root", "filter1"];

    Tornado.setOpenedNodeDetails(rootPath);

    expect(Tornado.openedNodeDetailsPath).toBe(rootPath);

    Tornado.setOpenedNodeDetails(filter1Path);

    expect(Tornado.openedNodeDetailsPath).toBe(filter1Path);
  });

  it("set rule operators_executors_actions", () => {
    const rule: RuleCompleteDto = {
      name: "Rule1",
      description: "Description",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: undefined,
    };

    const ruleOperatorsExtractorsActions: RuleOperatorsExtractorsActions = {
      where: null,
      with: [],
      actions: [],
    };

    Tornado.setRuleOperatorsExtractorsActions({
      rule,
      ruleOperatorsExtractorsActions,
    });

    expect(rule.operators_extractors_actions).toStrictEqual(
      ruleOperatorsExtractorsActions
    );
  });

  it("set the current draft id", async () => {
    const draftId = "draft_001";

    Tornado.setCurrentDraftId(draftId);

    expect(Tornado.draftId).toStrictEqual(draftId);
  });

  it("cache current active configuration", async () => {
    Tornado.cacheCurrentActiveConfiguration();

    expect(Tornado.processingTreeCached).toStrictEqual(Tornado.visibleTree);
  });

  it("restore current active configuration", async () => {
    await Tornado.restoreCurrentActiveConfiguration();

    expect(Tornado.visibleTree).toStrictEqual(Tornado.processingTreeCached);
  });

  it("initialize the draft tree", async () => {
    const rootNode: ProcessingTreeNodeDto = {
      type: "Filter",
      name: "root",
      rules_count: 100,
      children_count: 2,
      description: "This is the root node test",
      child_nodes: undefined,
      details: undefined,
      active: true,
    };

    await Tornado.initializeDraftTree([rootNode]);

    expect(Tornado.draftTree).toStrictEqual([rootNode]);
  });

  it("set additional nodes to the draft tree", async () => {
    const rootNode: ProcessingTreeNodeDto = {
      type: "Filter",
      name: "root",
      rules_count: 100,
      children_count: 3,
      description: "This is the root node test",
      child_nodes: undefined,
      details: undefined,
      active: true,
    };

    const childNodes: ProcessingTreeNodeDto[] = [
      {
        type: "Filter",
        name: "filter1",
        rules_count: 50,
        children_count: 1,
        description: "This is a child node",
        child_nodes: undefined,
        details: undefined,
        active: true,
      },
      {
        type: "Filter",
        name: "filter2",
        rules_count: 20,
        children_count: 2,
        description: "This is a child node",
        child_nodes: [
          {
            type: "Ruleset",
            name: "ruleset1",
            rules_count: 5,
            child_nodes: undefined,
            details: undefined,
          },
          {
            type: "Ruleset",
            name: "ruleset2",
            rules_count: 15,
            child_nodes: undefined,
            details: undefined,
          },
        ],
        details: undefined,
        active: true,
      },
      {
        type: "Filter",
        name: "filter3",
        rules_count: 30,
        children_count: 1,
        description: "This is a child node",
        child_nodes: undefined,
        details: undefined,
        active: true,
      },
    ];

    Tornado.initializeDraftTree([rootNode]);

    Tornado.setChildNodes({
      nodes: childNodes,
      nodePath: ["root"],
      targetTree: Tornado.draftTree,
    });

    expect(Tornado.draftTree[0].child_nodes).toStrictEqual(childNodes);
  });

  it("delete node - filter", async () => {
    Tornado.enableDraftConfiguration();

    if (Tornado.draftTree[0].type === "Filter") {
      expect(Tornado.draftTree[0].children_count).toBe(3);
      Tornado.deleteNode({ nodePath: ["root", "filter3"], isFilter: true });
      expect(Tornado.draftTree[0].children_count).toBe(2);
      expect(Tornado.draftTree[0].rules_count).toBe(70);
      const deleteAction = Tornado.actionsQueue.getFirstAction();
      if (deleteAction) {
        expect(deleteAction.getType()).toStrictEqual("delete");
        expect(deleteAction.getTargetObject()).toStrictEqual("filter");
        Tornado.actionsQueue.empty();
      } else {
        fail("Delete action is not present");
      }
    }
  });

  it("delete node - ruleset", async () => {
    Tornado.enableDraftConfiguration();

    if (
      Tornado.draftTree[0].type === "Filter" &&
      Tornado.draftTree[0].child_nodes &&
      Tornado.draftTree[0].child_nodes[1].type === "Filter"
    ) {
      expect(Tornado.draftTree[0].children_count).toBe(2);
      expect(Tornado.draftTree[0].child_nodes[1].children_count).toBe(2);
      Tornado.deleteNode({
        nodePath: ["root", "filter2", "ruleset1"],
        isFilter: false,
      });
      expect(Tornado.draftTree[0].children_count).toBe(2);
      expect(Tornado.draftTree[0].child_nodes[1].children_count).toBe(1);
      expect(Tornado.draftTree[0].child_nodes[1].rules_count).toBe(15);
      expect(Tornado.draftTree[0].rules_count).toBe(65);
      const deleteAction = Tornado.actionsQueue.getFirstAction();
      if (deleteAction) {
        expect(deleteAction.getType()).toStrictEqual("delete");
        expect(deleteAction.getTargetObject()).toStrictEqual("ruleset");
      } else {
        fail("Delete action is not present");
      }
    }
  });

  it("set draft tree", async () => {
    const rootNode: ProcessingTreeNodeDto = {
      type: "Filter",
      name: "root",
      rules_count: 100,
      children_count: 3,
      description: "This is the root node test",
      child_nodes: undefined,
      details: undefined,
      active: true,
    };

    Tornado.setDraftTree([rootNode]);

    expect(Tornado.draftTree).toStrictEqual([rootNode]);
  });

  it("enable draft configuration", async () => {
    Tornado.enableDraftConfiguration();

    expect(Tornado.visibleTree).toStrictEqual(Tornado.draftTree);
  });

  it("set expanded path", async () => {
    const nodePath = [["root"]];

    // Set expanded path
    Tornado.setExpandedPaths(nodePath);

    expect(Tornado.expandedPaths.length).toBe(1);
    expect(Tornado.expandedPaths).toStrictEqual(nodePath);
  });

  it("add expanded node path", async () => {
    const nodePath = ["root", "Test"];

    // Add expanded path
    Tornado.addExpandedNodePath(nodePath);

    expect(Tornado.expandedPaths.length).toBe(2);
    expect(Tornado.expandedPaths).toStrictEqual([["root"], ["root", "Test"]]);
  });

  it("remove expanded node path", async () => {
    const nodePath = ["root", "Test"];

    // Remove expanded path
    Tornado.removeExpandedNodePath(nodePath);

    expect(Tornado.expandedPaths.length).toBe(1);
    expect(Tornado.expandedPaths).toStrictEqual([["root"]]);
  });

  it("set the current selected rule name", async () => {
    const ruleName = "rule_001";

    Tornado.setSelectedRuleName(ruleName);

    expect(Tornado.selectedRuleName).toStrictEqual(ruleName);
  });

  it("set the selected rule reload status", async () => {
    const selectedRuleReload = true;

    Tornado.setSelectedRuleReload(selectedRuleReload);

    expect(Tornado.selectedRuleReload).toStrictEqual(selectedRuleReload);
  });

  it("set current edit mode", async () => {
    const currentEditMode = true;

    Tornado.setCurrentEditMode(currentEditMode);

    expect(Tornado.editMode).toStrictEqual(currentEditMode);
  });

  it("set tree is loading", async () => {
    const treeIsLoading = true;

    Tornado.setTreeIsLoading(treeIsLoading);

    expect(Tornado.treeIsLoading).toStrictEqual(treeIsLoading);
  });
});

// @ts-ignore: Object is possibly 'null'.
describe("Helpers", () => {
  it("Search for current tenant in event response- ROOT node", () => {
    const rootNode: ProcessingTreeNodeDto = {
      type: "Filter",
      name: "root",
      rules_count: 100,
      children_count: 2,
      description: "This is the root node",
      child_nodes: undefined,
      details: undefined,
      active: true,
    };

    const eventResponse: ProcessedEventDto = {
      event: {
        type: "email",
        created_ms: 123456789,
        payload: {},
        metadata: {},
      },
      result: {
        type: "Filter",
        name: "root",
        filter: {
          status: ProcessedFilterStatusDto.Matched,
        },
        nodes: [],
      },
    };

    const currentTenantResponse = getCurrentTenantEventResponse(eventResponse, [
      rootNode,
    ]);

    if (currentTenantResponse !== null) {
      expect(currentTenantResponse.result.name).toBe(rootNode.name);
    } else {
      fail("Error in finding processed event: could not find tenant");
    }
  });

  it("Search for current tenant in event response - tenant node", () => {
    const rootNode: ProcessingTreeNodeDto = {
      type: "Filter",
      name: "filter2",
      rules_count: 100,
      children_count: 2,
      description: "This is the tenant node",
      child_nodes: undefined,
      details: undefined,
      active: true,
    };

    const eventResponse: ProcessedEventDto = {
      event: {
        type: "email",
        created_ms: 123456789,
        payload: {},
        metadata: {},
      },
      result: {
        type: "Filter",
        name: "root",
        filter: {
          status: ProcessedFilterStatusDto.Matched,
        },
        nodes: [
          {
            type: "Filter",
            name: "filter1",
            filter: {
              status: ProcessedFilterStatusDto.Matched,
            },
            nodes: [
              {
                type: "Filter",
                name: "filter2",
                filter: {
                  status: ProcessedFilterStatusDto.Matched,
                },
                nodes: [],
              },
            ],
          },
        ],
      },
    };

    const currentTenantResponse = getCurrentTenantEventResponse(eventResponse, [
      rootNode,
    ]);

    if (currentTenantResponse !== null) {
      expect(currentTenantResponse.result.name).toBe(rootNode.name);
    } else {
      fail("Error in finding processed event: could not find tenant");
    }
  });

  it("Search for current tenant in event response - node not found", () => {
    const rootNode: ProcessingTreeNodeDto = {
      type: "Filter",
      name: "root",
      rules_count: 100,
      children_count: 2,
      description: "This is the root node",
      child_nodes: undefined,
      details: undefined,
      active: true,
    };

    const eventResponse: ProcessedEventDto = {
      event: {
        type: "email",
        created_ms: 123456789,
        payload: {},
        metadata: {},
      },
      result: {
        type: "Filter",
        name: "filter1",
        filter: {
          status: ProcessedFilterStatusDto.Matched,
        },
        nodes: [],
      },
    };

    const currentTenantResponse = getCurrentTenantEventResponse(eventResponse, [
      rootNode,
    ]);

    expect(currentTenantResponse).toBeNull();
  });

  it("Get rule from node - invalid node", () => {
    const node = undefined;

    const rule = getRuleFromNode(node, ["root"], "rule_01");

    expect(rule).toBeNull();
  });

  it("Get rule from node - missing node details", () => {
    const node: ProcessingTreeNodeDto = {
      type: "Filter",
      name: "root",
      rules_count: 20,
      children_count: 10,
      description: "test_description",
      child_nodes: undefined,
      details: undefined,
      active: true,
    };

    const rule = getRuleFromNode(node, ["root"], "rule_01");

    expect(rule).toBeNull();
  });

  it("Get rule from node - not a ruleset", () => {
    const node: ProcessingTreeNodeDto = {
      type: "Filter",
      name: "root",
      rules_count: 20,
      children_count: 10,
      description: "test_description",
      child_nodes: undefined,
      details: {
        type: "Filter",
        name: "root",
        description: "test_description",
        active: true,
        filter: null,
      },
      active: true,
    };

    const rule = getRuleFromNode(node, ["root"], "rule_01");

    expect(rule).toBeNull();
  });

  it("Get rule from node - rule not present", () => {
    const node: ProcessingTreeNodeDto = {
      type: "Ruleset",
      name: "ruleset1",
      rules_count: 20,
      child_nodes: undefined,
      details: {
        type: "Ruleset",
        name: "ruleset1",
        rules: [
          {
            name: "rule_02",
            description: "test_rule",
            continue: true,
            active: true,
            actions: [],
            operators_extractors_actions: undefined,
          },
        ],
      },
    };

    const rule = getRuleFromNode(node, ["root", "ruleset1"], "rule_01");

    expect(rule).toBeNull();
  });

  it("Get rule from node - rule present", () => {
    const rule: RuleCompleteDto = {
      name: "rule_01",
      description: "test_rule",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: undefined,
    };
    const node: ProcessingTreeNodeDto = {
      type: "Ruleset",
      name: "ruleset1",
      rules_count: 20,
      child_nodes: undefined,
      details: {
        type: "Ruleset",
        name: "ruleset1",
        rules: [rule],
      },
    };

    const receivedRule = getRuleFromNode(node, ["root", "ruleset1"], "rule_01");

    expect(rule).toBe(receivedRule);
  });

  it("Test setAddNodeSelectParentMode", () => {
    Tornado.setAddNodeSelectParentMode(AddNodeProcessMode.filter);
    expect(Tornado.addNodeSelectParentMode).toBe(AddNodeProcessMode.filter);

    Tornado.setAddNodeSelectParentMode(AddNodeProcessMode.ruleset);
    expect(Tornado.addNodeSelectParentMode).toBe(AddNodeProcessMode.ruleset);

    Tornado.setAddNodeSelectParentMode(AddNodeProcessMode.none);
    expect(Tornado.addNodeSelectParentMode).toBe(AddNodeProcessMode.none);
  });

  it("Test addChildNode", () => {
    Tornado.actionsQueue.empty();
    const rootNode: ProcessingTreeNodeDto = {
      type: "Filter",
      name: "root",
      rules_count: 0,
      children_count: 0,
      description: "test_description",
      child_nodes: [],
      details: {
        type: "Filter",
        name: "root",
        description: "test_description",
        active: true,
        filter: null,
      },
      active: true,
    };

    const newNode: ProcessingTreeNodeDto = {
      type: "Filter",
      name: "New_node",
      rules_count: 0,
      children_count: 0,
      description: "test_description",
      child_nodes: [],
      details: {
        type: "Filter",
        name: "New_node",
        description: "test_description",
        active: true,
        filter: null,
      },
      active: true,
    };

    Tornado.setDraftTree([rootNode]);
    Tornado.enableDraftConfiguration();

    Tornado.addChildNode({
      node: newNode,
      nodePath: [rootNode.name],
    });

    const visibleTreeRootNode = Tornado.visibleTree[0];
    expect(visibleTreeRootNode.name).toBe(rootNode.name);
    expect(visibleTreeRootNode.type).toBe("Filter");
    if (visibleTreeRootNode.type === "Filter") {
      expect(visibleTreeRootNode.children_count).toBe(1);
    }
    expect(visibleTreeRootNode.child_nodes?.length).toBe(1);
    if (visibleTreeRootNode.child_nodes) {
      const visibleTreeChildNode = visibleTreeRootNode.child_nodes[0];
      expect(visibleTreeChildNode.name).toBe(newNode.name);
    }
    const addAction = Tornado.actionsQueue.getFirstAction();
    if (addAction) {
      expect(addAction.getType()).toStrictEqual("add");
      expect(addAction.getTargetObject()).toStrictEqual("filter");
      Tornado.actionsQueue.empty();
    } else {
      fail("No edit action was added to the queue");
    }
  });

  it("tests unsaved edited paths", () => {
    // Tests default state
    const rootNode: UnsavedEditedPath = {
      currentPath: "root",
      originalPath: "root",
      children: [],
    };

    Tornado.resetEditedNodes();
    expect(Tornado.unsavedEditedRootPath).toStrictEqual(rootNode);

    // Tests change root/A to root/Z
    rootNode.children.push({
      currentPath: "Z",
      originalPath: "A",
      children: [],
    });
    Tornado.addUnsavedEditedPath({
      originalPath: ["root", "A"],
      newPathSegment: "Z",
    });
    expect(currentUnsavedEditedPathToOriginalPath(["root", "Z"])).toStrictEqual(
      ["root", "A"]
    );
    expect(Tornado.unsavedEditedRootPath).toStrictEqual(rootNode);

    // Tests change root/B to root/W without removing root/Z
    rootNode.children.push({
      currentPath: "W",
      originalPath: "B",
      children: [],
    });
    Tornado.addUnsavedEditedPath({
      originalPath: ["root", "B"],
      newPathSegment: "W",
    });
    expect(currentUnsavedEditedPathToOriginalPath(["root", "W"])).toStrictEqual(
      ["root", "B"]
    );
    expect(Tornado.unsavedEditedRootPath).toStrictEqual(rootNode);

    // Tests if root/Z/C is converted to /root/A/C even if there is no C node in the structure
    expect(
      currentUnsavedEditedPathToOriginalPath(["root", "Z", "C"])
    ).toStrictEqual(["root", "A", "C"]);

    // Tests reset
    rootNode.children = [];
    Tornado.resetEditedNodes();
    expect(Tornado.unsavedEditedRootPath).toStrictEqual(rootNode);
  });

  it("Test addRule", () => {
    Tornado.actionsQueue.empty();

    const rule01: RuleCompleteDto = {
      name: "rule_01",
      description: "test_rule",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: undefined,
    };

    const ruleToAdd: RuleCompleteDto = {
      name: "rule_02",
      description: "test_rule",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: undefined,
    };

    const rootNode: ProcessingTreeNodeDto = {
      type: "Ruleset",
      name: "ruleset1",
      rules_count: 1,
      child_nodes: undefined,
      details: {
        type: "Ruleset",
        name: "ruleset1",
        rules: [rule01],
      },
    };

    Tornado.setDraftTree([rootNode]);
    Tornado.enableDraftConfiguration();

    Tornado.addRuleToRuleset({
      rule: ruleToAdd,
      nodePath: [rootNode.name],
    });

    const visibleTreeRootNode = Tornado.visibleTree[0];
    expect(visibleTreeRootNode.name).toBe(rootNode.name);

    if (!isRuleset(visibleTreeRootNode)) {
      fail("Should be a ruleset");
    }

    expect(visibleTreeRootNode.rules_count).toBe(2);
    const lastRule = visibleTreeRootNode.details.rules.pop();

    if (!lastRule) {
      fail("Rule should not be undefined");
    }
    expect(lastRule.name).toBe(ruleToAdd.name);

    const addAction = Tornado.actionsQueue.getFirstAction();
    if (addAction) {
      expect(addAction.getType()).toStrictEqual("add");
      expect(addAction.getTargetObject()).toStrictEqual("rule");
      Tornado.actionsQueue.empty();
    } else {
      fail("No add rule action was added to the queue");
    }
  });

  it("Test editRule", () => {
    Tornado.actionsQueue.empty();
    const rule01: RuleCompleteDto = {
      name: "rule_01",
      description: "test_rule",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: undefined,
    };
    const ruleEdited: RuleCompleteDto = {
      name: "rule_02",
      description: "test_rule_2",
      continue: false,
      active: false,
      actions: [],
      operators_extractors_actions: undefined,
    };
    const rootNode: ProcessingTreeNodeDto = {
      type: "Ruleset",
      name: "ruleset1",
      rules_count: 1,
      child_nodes: undefined,
      details: {
        type: "Ruleset",
        name: "ruleset1",
        rules: [rule01],
      },
    };
    Tornado.setDraftTree([rootNode]);
    Tornado.enableDraftConfiguration();
    const visibleTreeRootNode = Tornado.visibleTree[0];
    expect(visibleTreeRootNode.name).toBe(rootNode.name);
    Tornado.updateRuleInRuleset({
      newRule: ruleEdited,
      oldRule: rule01,
      nodePath: [rootNode.name],
    });
    if (!isRuleset(visibleTreeRootNode)) {
      fail("Should be a ruleset");
    }
    expect(visibleTreeRootNode.rules_count).toBe(1);
    const lastRule = visibleTreeRootNode.details.rules.pop();
    if (!lastRule) {
      fail("Rule should not be undefined");
    }
    expect(lastRule.name).toBe(ruleEdited.name);
    expect(lastRule.description).toBe(ruleEdited.description);
    expect(lastRule.active).toBeFalsy();
    expect(lastRule.continue).toBeFalsy();
    const editAction = Tornado.actionsQueue.getFirstAction();
    if (editAction) {
      expect(editAction.getType()).toStrictEqual("edit");
      expect(editAction.getTargetObject()).toStrictEqual("rule");
      Tornado.actionsQueue.empty();
    } else {
      fail("No edit rule action was added to the queue");
    }
  });

  it("Test deleteRule", () => {
    Tornado.actionsQueue.empty();

    const rule01: RuleCompleteDto = {
      name: "rule_01",
      description: "test_rule",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: undefined,
    };

    const ruleToDelete: RuleCompleteDto = {
      name: "rule_02",
      description: "test_rule",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: undefined,
    };

    const rootNode: ProcessingTreeNodeDto = {
      type: "Ruleset",
      name: "ruleset1",
      rules_count: 2,
      child_nodes: undefined,
      details: {
        type: "Ruleset",
        name: "ruleset1",
        rules: [ruleToDelete, rule01],
      },
    };

    Tornado.setDraftTree([rootNode]);
    Tornado.enableDraftConfiguration();

    const visibleTreeRootNode = Tornado.visibleTree[0];
    expect(visibleTreeRootNode.name).toBe(rootNode.name);

    Tornado.deleteRuleFromRuleset({
      rule: ruleToDelete,
      nodePath: [rootNode.name],
    });

    if (
      visibleTreeRootNode.type !== "Ruleset" ||
      !visibleTreeRootNode.details ||
      visibleTreeRootNode.details.type !== "Ruleset"
    ) {
      fail("Should be a ruleset");
    }

    expect(visibleTreeRootNode.rules_count).toBe(1);
    const lastRule = visibleTreeRootNode.details.rules.pop();

    if (!lastRule) {
      fail("Rule should not be undefined");
    }
    expect(lastRule.name).toBe(rule01.name);

    const deleteAction = Tornado.actionsQueue.getFirstAction();
    if (deleteAction) {
      expect(deleteAction.getType()).toStrictEqual("delete");
      expect(deleteAction.getTargetObject()).toStrictEqual("rule");
      Tornado.actionsQueue.empty();
    } else {
      fail("No delete rule action was added to the queue");
    }
  });
});
