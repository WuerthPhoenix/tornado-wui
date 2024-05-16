import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import ReplaceAllModifier from "@/components/modifiers/ReplaceAllModifier.vue";
import Tornado from "@/store/tornado";
import { ExtractorFactory } from "@/core/Extractor/ExtractorFactory";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("ReplaceAllModifier.vue", () => {
  it("render a ReplaceAllModifier", async () => {
    const wrapper = mount(ReplaceAllModifier, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        data: ExtractorFactory.buildReplaceAllDetails(
          "Find this substring",
          "Replace with this String",
          false
        ),
        selected: true,
        hasNext: false,
        hasPrev: false,
      },
    });

    expect(wrapper.find(".modifier-header .modifier-title").text()).toBe(
      "editor.modifiers.replace_all.replace_all"
    );
    expect(wrapper.find(".modifier-footer .modifier-description").text()).toBe(
      "editor.modifiers.descriptions.replace_all"
    );
  });

  it("not edit a field when not in edit mode.", async () => {
    const wrapper = mount(ReplaceAllModifier, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        data: ExtractorFactory.buildReplaceAllDetails(
          "Find this substring",
          "Replace with this String",
          false
        ),
        selected: true,
        hasNext: false,
        hasPrev: false,
      },
    });

    wrapper
      .find(".replace-all-data .modifier-input .bx--toggle__switch")
      .trigger("click");
    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(".replace-all-data .modifier-input .bx--toggle-input")
        .attributes()["aria-checked"]
    ).toBe("false");

    const textInputFields = wrapper.findAll(
      ".replace-all-data .modifier-input .bx--text-input"
    );
    for (let i = 0; i < textInputFields.length; i++) {
      expect(textInputFields.at(i).attributes()["readonly"]).toBe("readonly");
    }
  });

  it("edit a field when in edit mode.", async () => {
    const wrapper = mount(ReplaceAllModifier, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        data: ExtractorFactory.buildReplaceAllDetails(
          "Find this substring",
          "Replace with this String",
          false
        ),
        selected: true,
        hasNext: false,
        hasPrev: false,
      },
    });

    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();
    wrapper
      .find(".replace-all-data .modifier-input .bx--toggle-input")
      .trigger("click");
    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(".replace-all-data .modifier-input .bx--toggle-input")
        .attributes()["aria-checked"]
    ).toBe("true");

    const textInputFields = wrapper.findAll(
      ".replace-all-data .modifier-input .bx--text-input"
    );
    for (let i = 0; i < textInputFields.length; i++) {
      expect(textInputFields.at(i).attributes()).not.toContain("readonly");
    }
  });
});
