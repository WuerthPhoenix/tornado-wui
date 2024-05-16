import { createLocalVue, mount } from "@vue/test-utils";
import AddActionButton from "@/components/editor/AddActionButton.vue";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import { actionList } from "@/utils/editorUtils";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("AddActionButton.vue", () => {
  it("renders an AddActionButton with the icon", () => {
    const value = "Label";
    const wrapper = mount(AddActionButton, {
      propsData: {
        value: value,
        size: "small",
        kind: "secondary",
      },
      localVue,
    });

    expect(wrapper.find(".combo-button").exists()).toBe(true);
    expect(wrapper.find(".combo-button").text()).toBe(value);
    expect(wrapper.find(".combo-button svg").exists()).toBe(true);
  });

  it("renders an AddActionButton and checks the menu items", async () => {
    const value = "Label";
    const wrapper = mount(AddActionButton, {
      propsData: {
        value: value,
        size: "small",
        kind: "secondary",
        textOnly: true,
      },
      localVue,
    });

    expect(wrapper.find(".combo-button").exists()).toBe(true);
    wrapper.find(".combo-button").trigger("click");
    await wrapper.vm.$nextTick();
    const allMenuItems = wrapper.findAll(
      ".combo-button-container .overflow-menu .cv-overflow-menu-item"
    );
    expect(allMenuItems.length).toBe(actionList.length);

    for (let i = 0; i < actionList.length; i++) {
      expect(allMenuItems.at(i).text()).toBe(actionList[i]);
    }
  });
});
