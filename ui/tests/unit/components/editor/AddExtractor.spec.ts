import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import i18n from "@/utils/i18n";
import Tornado from "@/store/tornado";
import RuleDetails from "@/components/processing_tree/RuleDetails.vue";
import { ExtractorFactory } from "@/core/Extractor/ExtractorFactory";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("WithEditor.vue", () => {
  const mock = jest.spyOn(i18n, "tc");
  mock.mockImplementation((a) => a);

  it("renders a WithEditor with no extractors", async () => {
    const regex =
      ExtractorFactory.createDefaultRegexDetails("RegexNamedGroups");
    const extractor = ExtractorFactory.buildDefault(
      regex,
      [],
      "variable_1",
      "${event.payload.subject}"
    );
    const rule = {
      name: "rule1",
      description: "This is a rule",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: {
        where: {
          type: "AND",
          operators: [
            {
              type: "equals",
              first: "foo",
              second: "bar",
            },
          ],
        },
        with: [extractor],
        actions: [],
      },
    };

    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();
    const withTab = wrapper
      .findAll("button")
      .filter((button) => button.text() === "views.processing_tree.with");
    expect(withTab.exists()).toBe(true);
    await withTab.trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".with-editor").exists()).toBeTruthy();
    expect(wrapper.find(".with-editor__actions").exists()).toBeTruthy();
    wrapper.find(".with-editor__actions").trigger("click");
    await wrapper.vm.$nextTick();
    const extractorCount = wrapper.findAll(".with-extractor-container");
    expect(extractorCount.length).toBe(2);
    expect(
      (
        extractorCount.at(1).find(".editable-operator-value").find("textarea")
          .element as HTMLInputElement
      ).value
    ).toBe("variable_2");
  });
});
