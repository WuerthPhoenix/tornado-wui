import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import TrimModifier from "@/components/modifiers/TrimModifier.vue";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("TrimModifier.vue", () => {
  it("render a TrimModifier", async () => {
    const wrapper = mount(TrimModifier, {
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
      "editor.modifiers.trim"
    );
    expect(wrapper.find(".modifier-footer .modifier-description").text()).toBe(
      "editor.modifiers.descriptions.trim"
    );
  });
});
