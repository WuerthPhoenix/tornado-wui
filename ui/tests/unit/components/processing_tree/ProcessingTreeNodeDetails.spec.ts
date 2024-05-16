import { createLocalVue, mount } from "@vue/test-utils";
import ProcessingTreeNodeDetails from "@/components/processing_tree/ProcessingTreeNodeDetails.vue";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import i18n from "@/utils/i18n";
import Tornado from "@/store/tornado";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("ProcessingTreeNodeDetails.vue", () => {
  it("renders a ProcessingTreeNodeDetails with filter details", () => {
    const node = {
      type: "Filter",
      name: "root",
      child_nodes: [],
      children_count: 1,
      rules_count: 5,
      description: "Root description",
    };

    const wrapper = mount(ProcessingTreeNodeDetails, {
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

    expect(
      wrapper.find(".processing-tree-node-details-container .name").text()
    ).toMatch(node.name);

    expect(
      wrapper.find(".processing-tree-node-details-container .node-type").text()
    ).toMatch(node.type);

    expect(
      wrapper
        .find(
          ".processing-tree-node-details-container .filter-details-container"
        )
        .exists()
    ).toBe(true);
  });

  it("renders a ProcessingTreeNodeDetails with ruleset details", () => {
    const mock = jest.spyOn(i18n, "tc");
    mock.mockImplementation((a) => a);

    const node = {
      type: "Ruleset",
      name: "root",
      child_nodes: [],
      children_count: 1,
      rules_count: 5,
      description: "Root description",
    };

    const wrapper = mount(ProcessingTreeNodeDetails, {
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

    expect(
      wrapper.find(".processing-tree-node-details-container .name").text()
    ).toMatch(node.name);

    expect(
      wrapper.find(".processing-tree-node-details-container .node-type").text()
    ).toMatch(node.type);

    expect(
      wrapper
        .find(
          ".processing-tree-node-details-container .ruleset-details-container"
        )
        .exists()
    ).toBe(true);
  });

  it("hide delete button on root node description: Edit mode", async () => {
    const mock = jest.spyOn(i18n, "tc");
    mock.mockImplementation((a) => a);

    const node = {
      type: "Filter",
      name: "root",
      child_nodes: [],
      children_count: 2,
      rules_count: 5,
      description: "Root description",
    };

    const wrapper = mount(ProcessingTreeNodeDetails, {
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

    expect(
      wrapper.find(".processing-tree-node-details-container .name").text()
    ).toMatch(node.name);

    expect(
      wrapper.find(".processing-tree-node-details-container .node-type").text()
    ).toMatch(node.type);

    expect(wrapper.find(".cv-button.delete-node-confirmation").exists()).toBe(
      false
    );
  });

  it("hide delete button on ruleset node description: Edit mode", async () => {
    const mock = jest.spyOn(i18n, "tc");
    mock.mockImplementation((a) => a);

    const node = {
      type: "Ruleset",
      name: "root",
      child_nodes: [],
      children_count: 2,
      rules_count: 5,
      description: "Root description",
    };

    const wrapper = mount(ProcessingTreeNodeDetails, {
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

    expect(
      wrapper.find(".processing-tree-node-details-container .name").text()
    ).toMatch(node.name);

    expect(
      wrapper.find(".processing-tree-node-details-container .node-type").text()
    ).toMatch(node.type);

    expect(wrapper.find(".cv-button.delete-node-confirmation").exists()).toBe(
      false
    );
  });

  it("render delete button on non-root node description: Edit mode", async () => {
    const mock = jest.spyOn(i18n, "tc");
    mock.mockImplementation((a) => a);

    const node = {
      type: "Filter",
      name: "filter1",
      child_nodes: [],
      children_count: 2,
      rules_count: 5,
      description: "filter1 description",
    };

    const wrapper = mount(ProcessingTreeNodeDetails, {
      propsData: {
        node,
        parentNodePath: ["root"],
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

    expect(
      wrapper.find(".processing-tree-node-details-container .name").text()
    ).toMatch(node.name);

    expect(
      wrapper.find(".processing-tree-node-details-container .node-type").text()
    ).toMatch(node.type);

    expect(wrapper.find(".cv-button.delete-node-confirmation").exists()).toBe(
      true
    );
  });

  it("renders an import icon button on non-root node description: Edit mode", async () => {
    const node = {
      type: "Filter",
      name: "root",
      child_nodes: [],
      children_count: 1,
      rules_count: 5,
      description: "Root description",
    };

    const wrapper = mount(ProcessingTreeNodeDetails, {
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

    expect(
      wrapper
        .find(
          ".processing-tree-node-details-container .actions-container .import-node-confirmation"
        )
        .exists()
    ).toBe(true);
  });

  it("renders an export icon button on non-root node description: Edit mode", async () => {
    const node = {
      type: "Filter",
      name: "root",
      child_nodes: [],
      children_count: 1,
      rules_count: 5,
      description: "Root description",
    };

    const wrapper = mount(ProcessingTreeNodeDetails, {
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

    expect(
      wrapper
        .find(
          ".processing-tree-node-details-container .actions-container .export-node-confirmation"
        )
        .exists()
    ).toBe(true);
  });
});
