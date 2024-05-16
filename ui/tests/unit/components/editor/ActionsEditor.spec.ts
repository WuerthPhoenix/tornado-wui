import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import i18n from "@/utils/i18n";
import ActionsEditor from "@/components/editor/ActionsEditor.vue";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("ActionsEditor.vue", () => {
  const mock = jest.spyOn(i18n, "tc");
  mock.mockImplementation((a) => a);

  it("renders a ActionsEditor with no actions", () => {
    const wrapper = mount(ActionsEditor, {
      propsData: {
        actions: [],
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(wrapper.find(".actions-editor").text()).toMatch(
      "editor.no_actions_found"
    );
  });

  it("renders a ActionsEditor with an action", () => {
    const wrapper = mount(ActionsEditor, {
      propsData: {
        actions: [
          {
            id: "foreach",
            payload: {
              actions: [],
            },
          },
        ],
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(wrapper.find(".actions-editor .action").exists()).toBeTruthy();
  });
});
