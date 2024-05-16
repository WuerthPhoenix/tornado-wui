import { createLocalVue, mount } from "@vue/test-utils";
import ProcessingTree from "@/views/ProcessingTree.vue";
import Tornado from "@/store/tornado";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import i18n from "@/utils/i18n";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("ProcessingTree.vue", () => {
  const mock = jest.spyOn(i18n, "t");
  mock.mockImplementation((a) => a);
  it("renders import and export buttons in combo button", async () => {
    const wrapper = mount(ProcessingTree, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    wrapper
      .find(
        "div.right-buttons-container .combo-button-container > .combo-button"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .findAll(
          "div.right-buttons-container .combo-button-container .bx--overflow-menu-options__btn"
        )
        .filter((el) => {
          return el.text() === "views.processing_tree.import_child";
        }).length
    ).toBe(1);
  });
});
