import { createLocalVue, mount } from "@vue/test-utils";
import JsonEditor from "@/components/JsonEditor.vue";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("JsonEditor.vue", () => {
  it("renders a JsonEditor", () => {
    const wrapper = mount(JsonEditor, {
      localVue,
    });
    expect(
      wrapper
        .find(
          ".jsoneditor-container .jsoneditor-box .jsoneditor.jsoneditor-mode-code"
        )
        .exists()
    ).toBeTruthy();
  });
});
