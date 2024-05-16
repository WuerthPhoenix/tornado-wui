import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import i18n from "@/utils/i18n";
import { ActionFactory } from "@/core/Action/ActionFactory";
import DirectorAction from "@/components/editor/actions/DirectorAction.vue";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("DirectorAction.vue", () => {
  const mock = jest.spyOn(i18n, "tc");
  mock.mockImplementation((a) => a);

  it("renders a Action director editable", () => {
    const action = {
      id: "director",
      payload: {
        action_name: "",
        action_payload: {},
        icinga2_live_creation: "true",
      },
    };

    const act = ActionFactory.createActionFromDTO(action);

    const wrapper = mount(DirectorAction, {
      propsData: {
        action: act,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    // Type
    expect(wrapper.find(".action .group-header .action-type").text()).toBe(
      action.id
    );

    // Properties
    const properties = Object.keys(action.payload);
    for (let i = 0; i < properties.length; ++i) {
      const prop = properties[i];

      expect(
        wrapper
          .find(
            ".action .payload-property-container:nth-child(" +
              (i + 1) +
              ") .payload-property-label"
          )
          .text()
      ).toBe(prop);
    }

    expect(
      wrapper
        .find(
          ".action .payload-property-container:nth-child(1) .payload-property-value"
        )
        .text()
    ).toBe(action.payload.action_name);

    expect(
      wrapper
        .find(
          ".action .payload-property-container:nth-child(2) .payload-property-value.json"
        )
        .text()
    ).toBe(JSON.stringify(action.payload.action_payload));

    expect(
      wrapper
        .find(
          ".action .payload-property-container:nth-child(3) .payload-property-value"
        )
        .text()
    ).toBe(action.payload.icinga2_live_creation);
  });
});
