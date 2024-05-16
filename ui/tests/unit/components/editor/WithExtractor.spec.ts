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

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("WithExtractor.vue", () => {
  const mock = jest.spyOn(i18n, "tc");
  mock.mockImplementation((a) => a);

  it("renders a WithExtractor with a regex type Regex", () => {
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

    // Container
    expect(wrapper.find(".with-extractor-container").exists()).toBeTruthy();

    // Variable
    expect(wrapper.find(".with-extractor-container .variable").text()).toBe(
      "@" + fromDTO.variable
    );

    // From
    expect(wrapper.find(".with-extractor-container .from").text()).toBe(
      "editor.from " + fromDTO.from
    );

    // Regex
    expect(
      wrapper
        .find(".with-extractor-container .regex-container .regex-type")
        .text()
    ).toBe("editor.match");
    expect(
      wrapper
        .find(".with-extractor-container .regex-container .regex-expression")
        .text()
    ).toBe((fromDTO.regexDetails as RegexDetailsStandard).match);

    // All matches
    expect(
      wrapper
        .find(
          ".with-extractor-container .all-matches-container .all-matches-label"
        )
        .text()
    ).toBe("editor.all_matches");
    expect(
      wrapper
        .find(
          ".with-extractor-container .all-matches-container .all-matches-value"
        )
        .text()
    ).toBe("" + (fromDTO.regexDetails as RegexDetailsStandard).allMatches);

    // Group match idx
    expect(
      wrapper
        .find(
          ".with-extractor-container .group-match-idx-container .group-match-idx-label"
        )
        .text()
    ).toBe("editor.group_match_idx");

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
    ).toBeTruthy();
  });
  it("renders a WithExtractor with a regex type RegexNamedGroups", () => {
    const regex =
      ExtractorFactory.createDefaultRegexDetails("RegexNamedGroups");
    const fromDTO: Extractor = ExtractorFactory.buildDefault(
      regex,
      [],
      "subject",
      "${event.payload.subject}"
    );

    const wrapper = mount(WithExtractor, {
      propsData: {
        extractor: fromDTO,
        itemIndex: 0,
      },
      mocks: {
        $tc: (a: string) => a,
      },
    });

    // Container
    expect(wrapper.find(".with-extractor-container").exists()).toBeTruthy();

    // Variable
    expect(wrapper.find(".with-extractor-container .variable").text()).toBe(
      "@" + fromDTO.variable
    );

    // From
    expect(wrapper.find(".with-extractor-container .from").text()).toBe(
      "editor.from " + fromDTO.from
    );

    // Regex
    expect(
      wrapper
        .find(".with-extractor-container .regex-container .regex-type")
        .text()
    ).toBe("editor.named_match");
    expect(
      wrapper
        .find(".with-extractor-container .regex-container .regex-expression")
        .text()
    ).toBe((fromDTO.regexDetails as RegexDetailsNamedGroups).namedMatch);

    // All matches
    expect(
      wrapper
        .find(
          ".with-extractor-container .all-matches-container .all-matches-label"
        )
        .text()
    ).toBe("editor.all_matches");
    expect(
      wrapper
        .find(
          ".with-extractor-container .all-matches-container .all-matches-value"
        )
        .text()
    ).toBe("" + (fromDTO.regexDetails as RegexDetailsNamedGroups).allMatches);
  });
  it("renders a WithExtractor with a regex type KeyRegex", () => {
    const regex = ExtractorFactory.createDefaultRegexDetails("KeyRegex");
    const fromDTO: Extractor = ExtractorFactory.buildDefault(
      regex,
      [],
      "subject",
      "${event.payload.subject}"
    );

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

    // Container
    expect(wrapper.find(".with-extractor-container").exists()).toBeTruthy();

    // Variable
    expect(wrapper.find(".with-extractor-container .variable").text()).toBe(
      "@" + fromDTO.variable
    );

    // From
    expect(wrapper.find(".with-extractor-container .from").text()).toBe(
      "editor.from " + fromDTO.from
    );

    // Regex
    expect(
      wrapper
        .find(".with-extractor-container .regex-container .regex-type")
        .text()
    ).toBe("editor.single_key_match");
    expect(
      wrapper
        .find(".with-extractor-container .regex-container .regex-expression")
        .text()
    ).toBe((fromDTO.regexDetails as RegexDetailsKey).singleKeyMatch);
  });
  it("renders a WithExtractor with no modifiers", () => {
    const regex = ExtractorFactory.createDefaultRegexDetails("KeyRegex");
    const fromDTO: Extractor = ExtractorFactory.buildDefault(
      regex,
      [],
      "subject",
      "${event.payload.subject}"
    );

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

    expect(
      wrapper
        .find(".with-extractor-container .modifier-container .empty-modifier")
        .text()
    ).toBe("editor.no_modifiers_applied");
  });
  it("renders a WithExtractor with modifiers", () => {
    const regex = ExtractorFactory.createDefaultRegexDetails("KeyRegex");
    const modifiers = ExtractorFactory.createDefaultModifiersList();
    const fromDTO: Extractor = ExtractorFactory.buildDefault(
      regex,
      modifiers,
      "${event.payload.subject}"
    );

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

    expect(
      wrapper
        .find(
          ".with-extractor-container .modifier-container .modifier-list > .lowercase"
        )
        .exists()
    ).toBeTruthy();
    expect(
      wrapper
        .find(
          ".with-extractor-container .modifier-container .modifier-list > .toNumber"
        )
        .exists()
    ).toBeTruthy();
    expect(
      wrapper
        .find(
          ".with-extractor-container .modifier-container .modifier-list > .trim"
        )
        .exists()
    ).toBeTruthy();
  });
});
