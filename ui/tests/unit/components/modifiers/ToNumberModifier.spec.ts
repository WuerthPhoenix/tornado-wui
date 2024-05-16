import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import ToNumberModifier from "@/components/modifiers/ToNumberModifier.vue";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("ToNumberModifier.vue", () => {
  it("render a ToNumberModifier", async () => {
    const wrapper = mount(ToNumberModifier, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        selected: true,
        hasNext: false,
        hasPrev: false,
      },
    });

    expect(wrapper.find(".modifier-header .modifier-title").text()).toBe(
      "editor.modifiers.to_number"
    );
    expect(wrapper.find(".modifier-footer .modifier-description").text()).toBe(
      "editor.modifiers.descriptions.to_number"
    );
  });
});
