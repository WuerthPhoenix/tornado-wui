import { createLocalVue, mount } from "@vue/test-utils";
import ProcessingTree from "@/views/ProcessingTree.vue";
import Tornado, { AddNodeProcessMode } from "@/store/tornado";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("ProcessingTree", () => {
  it("It should render the title and subtitle", () => {
    const wrapper = mount(ProcessingTree, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    const title = wrapper.find(".top-bar .title");
    expect(title.exists()).toBe(true);

    const backButton = wrapper.find(".top-bar .title .back-button");
    expect(backButton.exists()).toBe(true);

    expect(wrapper.html()).toContain("processing_tree");

    expect(wrapper.find(".top-bar .title .subtitle").text()).toMatch(
      "views.processing_tree.live"
    );
  });

  it("It renders the editing in progress subtitle", async () => {
    const wrapper = mount(ProcessingTree, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    const title = wrapper.find(".top-bar .title");
    expect(title.exists()).toBe(true);

    expect(wrapper.find(".top-bar .title .subtitle").text()).toMatch(
      "views.processing_tree.live"
    );

    Tornado.setCurrentEditMode(true);

    await wrapper.vm.$nextTick();

    expect(wrapper.find(".top-bar .title .subtitle").text()).toMatch(
      "views.processing_tree.edit_in_progress"
    );
  });

  it("It renders a loading tree animation", async () => {
    const wrapper = mount(ProcessingTree, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {
        isEdit() {
          return true;
        },
      },
    });

    expect(
      wrapper
        .find(
          ".processing-tree-main-container .bx--loading-overlay--stop.cv-loading"
        )
        .exists()
    ).toBeTruthy();

    expect(
      wrapper
        .find(".processing-tree-main-container .bx--loading-overlay.cv-loading")
        .exists()
    ).toBeFalsy();

    Tornado.setTreeIsLoading(true);

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".processing-tree-main-container .bx--loading-overlay--stop.cv-loading"
        )
        .exists()
    ).toBeFalsy();
    expect(
      wrapper
        .find(".processing-tree-main-container .bx--loading-overlay.cv-loading")
        .exists()
    ).toBeTruthy();
  });

  it("should render the add node button", async () => {
    const wrapper = mount(ProcessingTree, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {
        isEdit() {
          return true;
        },
      },
    });

    expect(Tornado.addNodeSelectParentMode).toBe(AddNodeProcessMode.none);
    expect(wrapper.find(".add-node-btn .button-value").text()).toBe(
      "views.processing_tree.add"
    );

    // Test add new filter
    wrapper.find(".add-node-btn button").trigger("click");
    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(".add-node-btn .cv-overflow-menu-item:nth-child(1) span")
        .text()
    ).toBe("views.processing_tree.new_filter_node");

    wrapper
      .find(".add-node-btn .cv-overflow-menu-item:nth-child(1) button")
      .trigger("click");
    await wrapper.vm.$nextTick();

    expect(Tornado.addNodeSelectParentMode).toBe(AddNodeProcessMode.filter);
    expect(wrapper.find(".select-parent-banner .message").text()).toBe(
      "views.processing_tree.select_parent_node_for_new_filter"
    );

    // Test add new ruleset
    wrapper.find(".add-node-btn button").trigger("click");
    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(".add-node-btn .cv-overflow-menu-item:nth-child(2) span")
        .text()
    ).toBe("views.processing_tree.new_ruleset_node");

    wrapper
      .find(".add-node-btn .cv-overflow-menu-item:nth-child(2) button")
      .trigger("click");
    await wrapper.vm.$nextTick();

    expect(Tornado.addNodeSelectParentMode).toBe(AddNodeProcessMode.ruleset);
    expect(wrapper.find(".select-parent-banner .message").text()).toBe(
      "views.processing_tree.select_parent_node_for_new_ruleset"
    );
  });
});
