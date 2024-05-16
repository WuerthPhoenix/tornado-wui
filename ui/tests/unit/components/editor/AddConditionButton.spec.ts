import { createLocalVue, mount } from "@vue/test-utils";
import AddConditionButton from "@/components/editor/AddConditionButton.vue";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import { filterWhereConditions } from "@/utils/editorUtils";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("AddConditionButton.vue", () => {
  it("renders an AddConditionButton with the icon", () => {
    const value = "Label";
    const wrapper = mount(AddConditionButton, {
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

  it("renders an AddConditionButton without the icon", () => {
    const value = "Label";
    const wrapper = mount(AddConditionButton, {
      propsData: {
        value: value,
        size: "small",
        kind: "secondary",
        textOnly: true,
      },
      localVue,
    });

    expect(wrapper.find(".combo-button").exists()).toBe(true);
    expect(wrapper.find(".combo-button").text()).toBe(value);
    expect(wrapper.find(".combo-button svg").exists()).toBe(false);
  });

  it("renders an AddConditionButton and checks the menu items", async () => {
    const value = "Label";
    const wrapper = mount(AddConditionButton, {
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
    expect(allMenuItems.length).toBe(filterWhereConditions.length);

    for (let i = 0; i < filterWhereConditions.length; i++) {
      expect(allMenuItems.at(i).text()).toBe(filterWhereConditions[i]);
    }
  });
});
