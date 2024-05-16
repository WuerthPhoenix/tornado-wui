import { createLocalVue, mount } from "@vue/test-utils";
import ProcessingTreeNode from "@/components/processing_tree/ProcessingTreeNode.vue";
import Tornado, {
  AddNodeProcessMode,
  ProcessingTreeNodeDto,
} from "@/store/tornado";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import i18n from "@/utils/i18n";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("ProcessingTreeNode.vue", () => {
  const mock = jest.spyOn(i18n, "t");
  mock.mockImplementation((a) => a);
  it("renders a ProcessingTreeNode", () => {
    const wrapper = mount(ProcessingTreeNode, {
      propsData: {
        node: {
          type: "Filter",
          name: "root",
          child_nodes: [],
          children_count: 1,
          rules_count: 5,
          description: "Root description",
        },
        parentNodePath: [],
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    expect(
      wrapper
        .find(
          ".processing-tree-node-container .node-content-container .overview-container .title"
        )
        .text()
    ).toMatch("root");
  });

  it("renders a loading ProcessingTreeNode", () => {
    const wrapper = mount(ProcessingTreeNode, {
      propsData: {
        node: null,
        parentNodePath: [],
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    expect(
      wrapper
        .find(
          ".processing-tree-node-container .node-content-container .overview-container .bx--skeleton__text"
        )
        .exists()
    ).toBe(true);
  });

  it("opens the node details", async () => {
    const wrapper = mount(ProcessingTreeNode, {
      propsData: {
        node: {
          type: "Filter",
          name: "root",
          child_nodes: [],
          children_count: 1,
          rules_count: 5,
          description: "Root description",
          details: {
            type: "Filter",
            name: "root",
            description: "Root description",
            active: true,
            filter: null,
          },
        },
        parentNodePath: [],
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    Tornado.setOpenedNodeDetails(["root"]);

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".processing-tree-node-container .node-content-container .content-details"
        )
        .exists()
    ).toBe(true);
  });

  it("renders a default expanded ProcessingTreeNode", async () => {
    const wrapper = mount(ProcessingTreeNode, {
      propsData: {
        node: {
          type: "Filter",
          name: "root",
          child_nodes: [],
          children_count: 1,
          rules_count: 5,
          description: "Root description",
          details: {
            type: "Filter",
            name: "root",
            description: "Root description",
            active: true,
            filter: null,
          },
        },
        parentNodePath: [],
        defaultExpanded: true,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".processing-tree-node-container .child-node-container.child-nodes-expanded"
        )
        .exists()
    ).toBeTruthy();
    expect((wrapper.vm as any).nodePathIsExpanded(["root"])).toBeTruthy();
    expect(
      (wrapper.vm as any).nodePathIsExpanded(["root", "Test"])
    ).toBeFalsy();
  });

  it("render node menu bar", async () => {
    const wrapper = mount(ProcessingTreeNode, {
      propsData: {
        node: {
          type: "Filter",
          name: "root",
          child_nodes: [
            {
              type: "Ruleset",
              name: "ruleset",
              rules_count: 0,
              details: {
                type: "Ruleset",
                name: "ruleset",
                rules: [],
              },
            },
          ],
          children_count: 1,
          rules_count: 5,
          description: "Root description",
          details: {
            type: "Filter",
            name: "root",
            description: "Root description",
            active: true,
            filter: null,
          },
        },
        parentNodePath: [],
        defaultExpanded: true,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    Tornado.setCurrentEditMode(false);
    Tornado.setOpenedNodeDetails([]);

    await wrapper.vm.$nextTick();

    expect(
      wrapper.find(".processing-tree-node-container .node-menu").exists()
    ).toBe(false);

    expect(
      wrapper
        .find(
          ".processing-tree-node-container .processing-tree-node-container .node-menu"
        )
        .exists()
    ).toBe(false);

    Tornado.setCurrentEditMode(true);

    await wrapper.vm.$nextTick();

    expect(
      wrapper.find(".processing-tree-node-container .node-menu").exists()
    ).toBe(true);

    expect(
      wrapper
        .find(
          ".processing-tree-node-container .processing-tree-node-container .node-menu"
        )
        .exists()
    ).toBe(true);

    //click on filter menu
    wrapper
      .find(".processing-tree-node-container .node-menu .combo-button")
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".processing-tree-node-container .node-menu-item .bx--overflow-menu-options__option-content"
        )
        .text()
    ).toMatch("views.processing_tree.add_filter_node");

    //click on ruleset menu
    wrapper
      .find(
        ".processing-tree-node-container .processing-tree-node-container .node-menu .combo-button"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".processing-tree-node-container .processing-tree-node-container .node-menu-item .bx--overflow-menu-options__option-content"
        )
        .text()
    ).not.toMatch("views.processing_tree.add_filter_node");
  });

  it("filter is selectable as parent for a new node", async () => {
    const wrapper = mount(ProcessingTreeNode, {
      propsData: {
        node: {
          type: "Filter",
          name: "Parent",
          child_nodes: [],
          children_count: 0,
          rules_count: 0,
          description: "Parent node",
          details: {
            type: "Filter",
            name: "Parent",
            description: "Parent node",
            active: true,
            filter: null,
          },
        },
        parentNodePath: [],
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    Tornado.setAddNodeSelectParentMode(AddNodeProcessMode.filter);
    Tornado.setOpenedNodeDetails([]);

    await wrapper.vm.$nextTick();
    expect(
      wrapper.find(".right-icons-container .select-parent-icon").exists()
    ).toBeTruthy();
    expect(
      wrapper.find(".node-overview.bx--tile--clickable").exists()
    ).toBeTruthy();

    Tornado.setAddNodeSelectParentMode(AddNodeProcessMode.ruleset);

    await wrapper.vm.$nextTick();
    expect(
      wrapper.find(".right-icons-container .select-parent-icon").exists()
    ).toBeTruthy();
    expect(
      wrapper.find(".node-overview.bx--tile--clickable").exists()
    ).toBeTruthy();
  });

  it("ruleset is not selectable as parent for a new node", async () => {
    const wrapper = mount(ProcessingTreeNode, {
      propsData: {
        node: {
          type: "Ruleset",
          name: "ruleset",
          rules_count: 0,
          details: {
            type: "Ruleset",
            name: "ruleset",
            rules: [],
          },
        },
        parentNodePath: [],
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    Tornado.setCurrentEditMode(true);
    Tornado.setAddNodeSelectParentMode(AddNodeProcessMode.filter);
    Tornado.setOpenedNodeDetails([]);

    await wrapper.vm.$nextTick();
    expect(
      wrapper.find(".right-icons-container .select-parent-icon").exists()
    ).toBeFalsy();
    expect(
      wrapper.find(".node-overview:not(.bx--tile--clickable)").exists()
    ).toBeTruthy();

    Tornado.setAddNodeSelectParentMode(AddNodeProcessMode.ruleset);

    await wrapper.vm.$nextTick();
    expect(
      wrapper.find(".right-icons-container .select-parent-icon").exists()
    ).toBeFalsy();
    expect(
      wrapper.find(".node-overview:not(.bx--tile--clickable)").exists()
    ).toBeTruthy();
  });

  it("add multiple nodes", async () => {
    const node: ProcessingTreeNodeDto = {
      type: "Filter",
      name: "Parent",
      child_nodes: [],
      children_count: 0,
      rules_count: 0,
      description: "Parent node",
      details: {
        type: "Filter",
        name: "Parent",
        description: "Parent node",
        active: true,
        filter: null,
      },
      active: true,
    };

    const wrapper = mount(ProcessingTreeNode, {
      propsData: {
        node,
        parentNodePath: [],
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    Tornado.setDraftTree([node]);
    Tornado.enableDraftConfiguration();
    Tornado.setCurrentEditMode(true);
    Tornado.setAddNodeSelectParentMode(AddNodeProcessMode.filter);
    Tornado.setOpenedNodeDetails([]);

    wrapper.find("a.node-overview.bx--tile--clickable").trigger("click");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(
      wrapper.find(".child-node-container.child-nodes-expanded").exists()
    ).toBeTruthy();
    expect(
      wrapper.findAll(
        ".child-node-container.child-nodes-expanded .processing-tree-node-container"
      ).length
    ).toBe(1);
    expect(
      wrapper
        .find(
          ".child-node-container.child-nodes-expanded .processing-tree-node-container:nth-child(1) .name-container .name"
        )
        .text()
        .split(" ")[0]
        .trim()
    ).toBe("New_node");

    Tornado.enableDraftConfiguration();
    Tornado.setCurrentEditMode(true);
    Tornado.setAddNodeSelectParentMode(AddNodeProcessMode.filter);
    Tornado.setOpenedNodeDetails([]);
    wrapper.find("a.node-overview.bx--tile--clickable").trigger("click");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(
      wrapper.find(".child-node-container.child-nodes-expanded").exists()
    ).toBeTruthy();
    expect(
      wrapper.findAll(
        ".child-node-container.child-nodes-expanded .processing-tree-node-container"
      ).length
    ).toBe(2);
    expect(
      wrapper
        .find(
          ".child-node-container.child-nodes-expanded .processing-tree-node-container:nth-child(2) .name-container .name"
        )
        .text()
        .split(" ")[0]
        .trim()
    ).toBe("New_node_1");

    Tornado.enableDraftConfiguration();
    Tornado.setCurrentEditMode(true);
    Tornado.setAddNodeSelectParentMode(AddNodeProcessMode.ruleset);
    Tornado.setOpenedNodeDetails([]);
    wrapper.find("a.node-overview.bx--tile--clickable").trigger("click");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(
      wrapper.find(".child-node-container.child-nodes-expanded").exists()
    ).toBeTruthy();
    expect(
      wrapper.findAll(
        ".child-node-container.child-nodes-expanded .processing-tree-node-container"
      ).length
    ).toBe(3);
    expect(
      wrapper
        .find(
          ".child-node-container.child-nodes-expanded .processing-tree-node-container:nth-child(3) .name-container .name"
        )
        .text()
        .split(" ")[0]
        .trim()
    ).toBe("New_node_2");
  });

  it("render node menu delete option except root node", async () => {
    const wrapper = mount(ProcessingTreeNode, {
      propsData: {
        node: {
          type: "Filter",
          name: "root",
          child_nodes: [],
          children_count: 1,
          rules_count: 5,
          description: "Root description",
          details: {
            type: "Filter",
            name: "root",
            description: "Root description",
            active: true,
            filter: null,
          },
        },
        parentNodePath: [],
        defaultExpanded: true,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    Tornado.setCurrentEditMode(true);
    Tornado.enableDraftConfiguration();

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".processing-tree-node-container .node-menu .cv-button.combo-button"
        )
        .exists()
    ).toBe(true);

    wrapper
      .find(
        ".processing-tree-node-container .node-menu .cv-button.combo-button"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".node-menu-item.delete-node .bx--overflow-menu-options__option-content"
        )
        .exists()
    ).toBe(false);
  });

  it("render node menu delete option and open modals: non-root nodes", async () => {
    const childNodes = [
      {
        type: "Filter",
        name: "filter1",
        rules_count: 50,
        children_count: 1,
        description: "This is a child node",
        child_nodes: undefined,
        details: undefined,
      },
      {
        type: "Ruleset",
        name: "ruleset1",
        rules_count: 50,
        description: "This is a child node",
        child_nodes: undefined,
        details: undefined,
      },
    ];

    const node = {
      type: "Filter",
      name: "root",
      child_nodes: childNodes,
      children_count: 2,
      rules_count: 5,
      description: "Root description",
      details: {
        type: "Filter",
        name: "root",
        description: "Root description",
        active: true,
        filter: null,
      },
    };

    const wrapper = mount(ProcessingTreeNode, {
      propsData: {
        node,
        parentNodePath: [],
        defaultExpanded: true,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    const deleteNode = jest
      .spyOn(Tornado, "deleteNode")
      .mockImplementation(() => {
        return;
      });

    Tornado.setCurrentEditMode(true);
    Tornado.enableDraftConfiguration();

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".processing-tree-node-container .processing-tree-node-container:first-child .name"
        )
        .text()
    ).toMatch(node.child_nodes[0].name);

    expect(
      wrapper
        .find(
          ".processing-tree-node-container .processing-tree-node-container:nth-child(2) .name"
        )
        .text()
    ).toMatch(node.child_nodes[1].name);

    expect(
      wrapper
        .find(
          ".processing-tree-node-container .processing-tree-node-container:first-child .node-menu .cv-button.combo-button"
        )
        .exists()
    ).toBe(true);

    expect(
      wrapper
        .find(
          ".processing-tree-node-container .processing-tree-node-container:nth-child(2) .node-menu .cv-button.combo-button"
        )
        .exists()
    ).toBe(true);

    //open filter delete modal
    wrapper
      .find(
        ".processing-tree-node-container .processing-tree-node-container:first-child .node-menu .cv-button.combo-button"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".processing-tree-node-container .processing-tree-node-container:first-child .node-menu-item.delete-node .bx--overflow-menu-options__option-content"
        )
        .text()
    ).toMatch("views.processing_tree.delete");

    wrapper
      .find(
        ".processing-tree-node-container .processing-tree-node-container:first-child .node-menu-item.delete-node .bx--overflow-menu-options__option-content"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".processing-tree-node-container .processing-tree-node-container:first-child .delete-node-confirmation-modal.is-visible .bx--modal-header__heading"
        )
        .text()
    ).toBe("views.processing_tree.delete_filter_confirmation_title");
    expect(
      wrapper
        .find(
          ".processing-tree-node-container .processing-tree-node-container:first-child .delete-node-confirmation-modal.is-visible .bx--modal-content"
        )
        .text()
    ).toBe("views.processing_tree.delete_filter_confirmation_content");

    //click on delete
    wrapper
      .find(
        ".processing-tree-node-container .processing-tree-node-container:first-child .delete-node-confirmation-modal.is-visible .cv-button.bx--btn.bx--btn--primary"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(deleteNode).toHaveBeenNthCalledWith(1, {
      nodePath: ["root", "filter1"],
      isFilter: true,
    });

    //open ruleset delete modal
    wrapper
      .find(
        ".processing-tree-node-container .processing-tree-node-container:nth-child(2) .node-menu .cv-button.combo-button"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    wrapper
      .find(
        ".processing-tree-node-container .processing-tree-node-container:nth-child(2) .node-menu-item.delete-node .bx--overflow-menu-options__option-content"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".processing-tree-node-container .processing-tree-node-container:nth-child(2) .delete-node-confirmation-modal.is-visible .bx--modal-header__heading"
        )
        .text()
    ).toBe("views.processing_tree.delete_ruleset_confirmation_title");
    expect(
      wrapper
        .find(
          ".processing-tree-node-container .processing-tree-node-container:nth-child(2) .delete-node-confirmation-modal.is-visible .bx--modal-content"
        )
        .text()
    ).toBe("views.processing_tree.delete_ruleset_confirmation_content");

    //click on delete

    wrapper
      .find(
        ".processing-tree-node-container .processing-tree-node-container:nth-child(2) .delete-node-confirmation-modal.is-visible .cv-button.bx--btn.bx--btn--primary"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(deleteNode).toHaveBeenNthCalledWith(2, {
      nodePath: ["root", "ruleset1"],
      isFilter: false,
    });
  });

  it("render filter node menu new filter/ruleset option", async () => {
    const wrapper = mount(ProcessingTreeNode, {
      propsData: {
        node: {
          type: "Filter",
          name: "root",
          child_nodes: [
            {
              type: "Filter",
              name: "filter1",
              rules_count: 50,
              children_count: 1,
              description: "This is a child node",
              child_nodes: undefined,
              details: undefined,
            },
            {
              type: "Filter",
              name: "filter2",
              rules_count: 50,
              children_count: 1,
              description: "This is a child node",
              child_nodes: undefined,
              details: undefined,
            },
          ],
          children_count: 1,
          rules_count: 5,
          description: "Root description",
          details: {
            type: "Filter",
            name: "root",
            description: "Root description",
            active: true,
            filter: null,
          },
        },
        parentNodePath: [],
        defaultExpanded: true,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    Tornado.setCurrentEditMode(true);
    Tornado.enableDraftConfiguration();

    await wrapper.vm.$nextTick();

    wrapper
      .find(
        ".processing-tree-node-container:nth-child(2) .node-menu .cv-button.combo-button"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".node-menu-item:nth-child(1) .bx--overflow-menu-options__option-content"
        )
        .text()
    ).toBe("views.processing_tree.add_filter_node");

    expect(
      wrapper
        .find(
          ".node-menu-item:nth-child(2) .bx--overflow-menu-options__option-content"
        )
        .text()
    ).toBe("views.processing_tree.add_ruleset_node");
  });

  it("renders a disabled filter node", async () => {
    const wrapper = mount(ProcessingTreeNode, {
      propsData: {
        node: {
          type: "Filter",
          name: "root",
          child_nodes: [],
          children_count: 1,
          rules_count: 5,
          description: "Root description",
          details: {
            type: "Filter",
            name: "root",
            description: "Root description",
            active: false,
            filter: null,
          },
          active: false,
        },
        parentNodePath: [],
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(
      wrapper
        .find(".content-overview.disabled .disable-tag .bx--tag__label")
        .text()
    ).toBe("views.processing_tree.disabled");
  });

  it("renders an import icon button when node is expanded in edit mode", async () => {
    const childNodes = [
      {
        type: "Filter",
        name: "filter1",
        rules_count: 50,
        children_count: 1,
        description: "This is a child node",
        child_nodes: undefined,
        details: undefined,
      },
    ];

    const node = {
      type: "Filter",
      name: "root",
      child_nodes: childNodes,
      children_count: 2,
      rules_count: 5,
      description: "Root description",
      details: {
        type: "Filter",
        name: "root",
        description: "Root description",
        active: true,
        filter: null,
      },
    };

    const wrapper = mount(ProcessingTreeNode, {
      propsData: {
        node,
        parentNodePath: [],
        defaultExpanded: true,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    Tornado.setCurrentEditMode(true);
    Tornado.actionsQueue.empty();
    await wrapper.vm.$nextTick();

    // test import button inside combo button
    expect(
      wrapper
        .find(
          ".processing-tree-node-container .processing-tree-node-container:nth-of-type(1) .node-content-container .cv-button.combo-button"
        )
        .exists()
    ).toBe(true);

    // open filter import modal
    wrapper
      .find(
        ".processing-tree-node-container .processing-tree-node-container:nth-of-type(1) .node-content-container .cv-button.combo-button"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".processing-tree-node-container .processing-tree-node-container:nth-of-type(1) .node-menu-item.import-node .bx--overflow-menu-options__option-content"
        )
        .text()
    ).toMatch("views.processing_tree.import_node");

    wrapper
      .find(
        ".processing-tree-node-container .processing-tree-node-container:nth-of-type(1) .node-menu-item.import-node .bx--overflow-menu-options__option-content"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    // Check that import mode is set to replace
    expect(Tornado.importNodeMode).toBe(1);
    // Check override const
    expect(Tornado.importNodeOverwrite).toBe(childNodes[0].name);
    // Check that the import path is the filter1 "node path"
    const nodePath = ["root"];
    expect(JSON.stringify(Tornado.importPath)).toBe(JSON.stringify(nodePath));
  });

  it("renders an export icon button when node is expanded in edit mode", async () => {
    const childNodes = [
      {
        type: "Filter",
        name: "filter1",
        rules_count: 50,
        children_count: 1,
        description: "This is a child node",
        child_nodes: undefined,
        details: undefined,
      },
    ];

    const node = {
      type: "Filter",
      name: "root",
      child_nodes: childNodes,
      children_count: 2,
      rules_count: 5,
      description: "Root description",
      details: {
        type: "Filter",
        name: "root",
        description: "Root description",
        active: true,
        filter: null,
      },
    };

    const wrapper = mount(ProcessingTreeNode, {
      propsData: {
        node,
        parentNodePath: [],
        defaultExpanded: true,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // test export button inside combo button
    expect(
      wrapper
        .find(
          ".processing-tree-node-container .processing-tree-node-container:nth-of-type(1) .node-content-container .cv-button.combo-button"
        )
        .exists()
    ).toBe(true);

    // open filter export modal
    wrapper
      .find(
        ".processing-tree-node-container .processing-tree-node-container:nth-of-type(1) .node-content-container .cv-button.combo-button"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".processing-tree-node-container .processing-tree-node-container:nth-of-type(1) .node-menu-item.export-node .bx--overflow-menu-options__option-content"
        )
        .text()
    ).toMatch("views.processing_tree.export_node");

    wrapper
      .find(
        ".processing-tree-node-container .processing-tree-node-container:nth-of-type(1) .node-menu-item.export-node .bx--overflow-menu-options__option-content"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();
  });
});
