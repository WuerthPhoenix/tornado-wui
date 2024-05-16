import { createLocalVue, mount } from "@vue/test-utils";
import DashboardTileProcessingTree from "@/components/dashboard/DashboardTileProcessingTree.vue";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import { TreeInfoDto } from "tornado-backend-dto";
import Tornado from "@/store/tornado";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

const treeInfo: TreeInfoDto = {
  rules_count: 970,
  filters_count: 32,
};

describe("DashboardTileProcessingTree.vue", () => {
  it("renders a DashboardTileProcessingTree", () => {
    Tornado.setTreeInfo(treeInfo);
    const wrapper = mount(DashboardTileProcessingTree, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(wrapper.find(".header h5").text()).toMatch(
      "views.dashboard.tiles.processing_tree"
    );
    expect(wrapper.find(".header .tile-icon").exists()).toBe(true);
    expect(wrapper.find(".processing-tree-row.rules svg").exists()).toBe(true);
    expect(wrapper.find(".processing-tree-row.filters svg").exists()).toBe(
      true
    );
    expect(wrapper.find(".processing-tree-row.last-edit svg").exists()).toBe(
      true
    );
    expect(wrapper.find(".processing-tree-row.rules .label").text()).toMatch(
      "views.dashboard.tiles.rules"
    );
    expect(wrapper.find(".processing-tree-row.filters .label").text()).toMatch(
      "views.dashboard.tiles.filters"
    );
    expect(
      wrapper.find(".processing-tree-row.last-edit .label").text()
    ).toMatch("views.dashboard.tiles.last_edit");
    expect(wrapper.find(".processing-tree-row.rules .value").text()).toMatch(
      "970"
    );
    expect(wrapper.find(".processing-tree-row.filters .value").text()).toMatch(
      "32"
    );
    expect(
      wrapper.find(".processing-tree-row.last-edit .value").text()
    ).toMatch("N/A");
  });

  it("renders a loading DashboardTileProcessingTree", () => {
    Tornado.setTreeInfo(null);
    const wrapper = mount(DashboardTileProcessingTree, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(
      wrapper.find(".processing-tree-container .filters .bx--skeleton__text")
    ).toBeTruthy();

    expect(
      wrapper.find(".processing-tree-container .rules .bx--skeleton__text")
    ).toBeTruthy();
  });
});
