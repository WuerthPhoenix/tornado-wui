import { createLocalVue, mount } from "@vue/test-utils";

// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd";
import ScriptAction from "@/components/editor/actions/Icinga2Action.vue";
import i18n from "@/utils/i18n";
import { Icinga2Action as Icinga2ActionType } from "@/core/Action/Actions";
import { Icinga2Payload } from "@/core/Action/Payload";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("Icinga2Action.vue", () => {
  const mock = jest.spyOn(i18n, "tc");
  mock.mockImplementation((a) => a);

  it("renders a Icinga2Action", () => {
    const expectedIcinga2ActionName = "test-action";
    const expectedIcinga2ActionPayload =
      "{\n" + '  "exit_status": "0|1|2|3"\n' + "}";

    const action = new Icinga2ActionType(
      new Icinga2Payload(expectedIcinga2ActionName, {
        exit_status: "0|1|2|3",
      })
    );
    const wrapper = mount(ScriptAction, {
      propsData: {
        action: action,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(
      wrapper
        .find(
          ".payload-property-container:nth-child(1) .payload-property-label"
        )
        .text()
    ).toBe("icinga2_action_name");
    expect(
      wrapper
        .find(
          ".payload-property-container:nth-child(1) .payload-property-value"
        )
        .text()
    ).toBe(expectedIcinga2ActionName);
    expect(
      wrapper
        .find(
          ".payload-property-container:nth-child(2) .payload-property-label"
        )
        .text()
    ).toBe("icinga2_action_payload");
    expect(
      wrapper
        .find(
          ".payload-property-container:nth-child(2) .payload-property-value"
        )
        .text()
    ).toBe(expectedIcinga2ActionPayload);
  });
});
