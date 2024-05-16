import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import WithExtractor from "@/components/editor/WithExtractor.vue";
import i18n from "@/utils/i18n";
import { ExtractorFactory } from "@/core/Extractor/ExtractorFactory";
import Extractor from "@/core/Extractor/Extractor";
import {
  RegexDetailsKey,
  RegexDetailsNamedGroups,
  RegexDetailsStandard,
} from "@/core/Extractor/Regex";
import Tornado from "@/store/tornado";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("WithExtractor.vue", () => {
  const mock = jest.spyOn(i18n, "tc");
  mock.mockImplementation((a) => a);

  it("renders a WithExtractor with a regex type Regex in Edit mode", async () => {
    const regex = ExtractorFactory.createDefaultRegexDetails();
    const fromDTO: Extractor = ExtractorFactory.buildDefault(regex);

    const wrapper = mount(WithExtractor, {
      propsData: {
        extractor: fromDTO,
        itemIndex: 0,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Container
    expect(wrapper.find(".with-extractor-container").exists()).toBeTruthy();

    // Variable
    expect(
      (
        wrapper.find(".with-extractor-container .variable textarea")
          .element as HTMLInputElement
      ).value
    ).toBe(fromDTO.variable);

    // From
    expect(
      (
        wrapper.find(".with-extractor-container .from textarea")
          .element as HTMLInputElement
      ).value
    ).toBe(fromDTO.from);

    // Regex
    expect(
      (
        wrapper.find(
          ".regex-expression--editable .editable-operator-value input"
        ).element as HTMLInputElement
      ).value
    ).toBe((fromDTO.regexDetails as RegexDetailsStandard).match);

    // Group match idx
    expect(
      (
        wrapper.find(
          ".with-extractor-container .group-match-idx-container .group-match-idx-value input"
        ).element as HTMLInputElement
      ).getAttribute("placeholder")
    ).toBe("editor.group_match_idx_empty");
    expect(
      (
        wrapper.find(
          ".with-extractor-container .group-match-idx-container .group-match-idx-value input"
        ).element as HTMLInputElement
      ).getAttribute("disabled")
    ).toBeFalsy();

    Tornado.setCurrentEditMode(false);
    await wrapper.vm.$nextTick();
  });
  it("renders a WithExtractor with a regex type RegexNamedGroups in Edit mode", async () => {
    const regex =
      ExtractorFactory.createDefaultRegexDetails("RegexNamedGroups");
    const fromDTO: Extractor = ExtractorFactory.buildDefault(regex);

    const wrapper = mount(WithExtractor, {
      propsData: {
        extractor: fromDTO,
        itemIndex: 0,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Regex
    expect(
      (
        wrapper.find(
          ".regex-expression--editable .editable-operator-value input"
        ).element as HTMLInputElement
      ).value
    ).toBe((fromDTO.regexDetails as RegexDetailsNamedGroups).namedMatch);

    Tornado.setCurrentEditMode(false);
    await wrapper.vm.$nextTick();
  });
  it("renders a WithExtractor with a regex type KeyRegex in Edit mode", async () => {
    const regex = ExtractorFactory.createDefaultRegexDetails("KeyRegex");
    const fromDTO: Extractor = ExtractorFactory.buildDefault(regex);

    const wrapper = mount(WithExtractor, {
      propsData: {
        extractor: fromDTO,
        itemIndex: 0,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Regex
    expect(
      (
        wrapper.find(
          ".regex-expression--editable .editable-operator-value input"
        ).element as HTMLInputElement
      ).value
    ).toBe((fromDTO.regexDetails as RegexDetailsKey).singleKeyMatch);

    Tornado.setCurrentEditMode(false);
    await wrapper.vm.$nextTick();
  });
});
