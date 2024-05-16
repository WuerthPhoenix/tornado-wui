import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import i18n from "@/utils/i18n";
import ActionJsonEditor from "@/components/editor/ActionJsonEditor.vue";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("ActionJsonEditor.vue", () => {
  const mock = jest.spyOn(i18n, "tc");
  mock.mockImplementation((a) => a);

  it("renders a ActionJsonEditor", async () => {
    const wrapper = mount(ActionJsonEditor, {
      propsData: {
        value: {},
        isEditable: true,
      },
    });

    // Click on editor
    wrapper.find(".json-readonly-mode").trigger("click");
    await wrapper.vm.$nextTick();

    // Check that edit mode is enabled
    expect(wrapper.find(".action-json-editor").exists()).toBeTruthy();
  });
});
