import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import WithEditor from "@/components/editor/WithEditor.vue";
import i18n from "@/utils/i18n";
import { ExtractorFactory } from "@/core/Extractor/ExtractorFactory";
import Extractor from "@/core/Extractor/Extractor";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("WithEditor.vue", () => {
  const mock = jest.spyOn(i18n, "tc");
  mock.mockImplementation((a) => a);

  it("renders a WithEditor with no extractors", () => {
    const wrapper = mount(WithEditor, {
      propsData: {
        with: [],
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(wrapper.find(".with-editor").text()).toMatch(
      "editor.no_extractor_found"
    );
  });

  it("renders a WithEditor with an extractor", () => {
    const regex = ExtractorFactory.createDefaultRegexDetails();
    const modifiers = ExtractorFactory.createDefaultModifiersList();
    const fromDTO: Extractor = ExtractorFactory.buildDefault(
      regex,
      modifiers,
      "subject",
      "${event.payload.subject}"
    );

    const wrapper = mount(WithEditor, {
      propsData: {
        with: [fromDTO],
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(
      wrapper.find(".with-editor .with-extractor-container").exists()
    ).toBeTruthy();
  });
});
