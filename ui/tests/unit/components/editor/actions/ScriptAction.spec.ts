import { createLocalVue, mount } from "@vue/test-utils";

// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd";
import ScriptAction from "@/components/editor/actions/ScriptAction.vue";
import i18n from "@/utils/i18n";
import { ScriptAction as ScriptActionType } from "@/core/Action/Actions";
import { ScriptPayload } from "@/core/Action/Payload";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("ScriptAction.vue", () => {
  const mock = jest.spyOn(i18n, "tc");
  mock.mockImplementation((a) => a);

  it("renders a ScriptAction", () => {
    const expectedScript = "/usr/bin/cp";
    const expectedArgs = [
      "--recursive",
      "/folder/to/copy",
      "/destination/folder/",
    ];

    const action = new ScriptActionType(
      new ScriptPayload(expectedScript, expectedArgs)
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
    ).toBe("script");
    expect(
      wrapper
        .find(
          ".payload-property-container:nth-child(1) .payload-property-value"
        )
        .text()
    ).toBe(expectedScript);
    expect(
      wrapper
        .find(
          ".payload-property-container:nth-child(2) .payload-property-label"
        )
        .text()
    ).toBe("args");

    const params = wrapper.find(
      ".action .action-properties-container .payload-property-container:nth-child(2) .params"
    );
    const firstParam = params.find(
      ".params__param:nth-child(1) .resizable__input"
    ).element as HTMLInputElement;
    const secondParam = params.find(
      ".params__param:nth-child(2) .resizable__input"
    ).element as HTMLInputElement;
    const thirdParam = params.find(
      ".params__param:nth-child(3) .resizable__input"
    ).element as HTMLInputElement;

    expect(firstParam.value).toBe(expectedArgs[0]);
    expect(secondParam.value).toBe(expectedArgs[1]);
    expect(thirdParam.value).toBe(expectedArgs[2]);
  });
});
