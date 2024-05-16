import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import i18n from "@/utils/i18n";
import { Value } from "tornado-backend-dto";
import { ActionFactory } from "@/core/Action/ActionFactory";
import ArchiveAction from "@/components/editor/actions/ArchiveAction.vue";
import Icinga2Action from "@/components/editor/actions/Icinga2Action.vue";
import LoggerAction from "@/components/editor/actions/LoggerAction.vue";
import SmartMonitoringCheckResultAction from "@/components/editor/actions/SmartMonitoringCheckResultAction.vue";
import ScriptAction from "@/components/editor/actions/ScriptAction.vue";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("Action.vue", () => {
  const mock = jest.spyOn(i18n, "tc");
  mock.mockImplementation((a) => a);

  it("renders a Action archive", () => {
    const action = {
      id: "archive",
      payload: {
        event: "event1",
        archive_type: "all",
      },
    };
    const act = ActionFactory.createActionFromDTO(action);

    const wrapper = mount(ArchiveAction, {
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
      const value: Value = (action.payload as Value)[prop];

      expect(
        wrapper
          .find(
            ".action .payload-property-container:nth-child(" +
              (i + 1) +
              ") .payload-property-label"
          )
          .text()
      ).toBe(prop);
      expect(
        wrapper
          .find(
            ".action .payload-property-container:nth-child(" +
              (i + 1) +
              ") .payload-property-value"
          )
          .text()
      ).toBe(value);
    }
  });

  it("renders a Action icinga2", () => {
    const action = {
      id: "icinga2",
      payload: {
        icinga2_action_name: "deploy",
        icinga2_action_payload: {
          exit_status: "0|1|2|3",
        },
      },
    };
    const act = ActionFactory.createActionFromDTO(action);
    const wrapper = mount(Icinga2Action, {
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

    expect(
      wrapper
        .find(
          ".action .payload-property-container:nth-child(1) .payload-property-label"
        )
        .text()
    ).toBe("icinga2_action_name");
    expect(
      wrapper
        .find(
          ".action .payload-property-container:nth-child(1) .payload-property-value"
        )
        .text()
    ).toBe((action.payload as Value)["icinga2_action_name"]);

    expect(
      wrapper
        .find(
          ".action .payload-property-container:nth-child(2) .payload-property-label"
        )
        .text()
    ).toBe("icinga2_action_payload");
    expect(
      wrapper
        .find(
          ".action .payload-property-container:nth-child(2) .payload-property-value"
        )
        .text()
    ).toBe("{\n" + '  "exit_status": "0|1|2|3"\n' + "}");
  });

  it("renders a Action logger", () => {
    const action = {
      id: "icinga2",
      payload: {},
    };

    const act = ActionFactory.createActionFromDTO(action);

    const wrapper = mount(LoggerAction, {
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
      const value: Value = (action.payload as Value)[prop];

      expect(
        wrapper
          .find(
            ".action .payload-property-container:nth-child(" +
              (i + 1) +
              ") .payload-property-label"
          )
          .text()
      ).toBe("#" + prop);
      expect(
        wrapper
          .find(
            ".action .payload-property-container:nth-child(" +
              (i + 1) +
              ") .payload-property-value"
          )
          .text()
      ).toBe(value);
    }
  });

  it("renders a Action smart_monitoring_check_result", () => {
    const action = {
      id: "smart_monitoring_check_result",
      payload: {
        check_result: {},
        host: {},
        service: {},
      },
    };

    const act = ActionFactory.createActionFromDTO(action);

    const wrapper = mount(SmartMonitoringCheckResultAction, {
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
      const value: Value = (action.payload as Value)[prop];

      expect(
        wrapper
          .find(
            ".action .payload-property-container:nth-child(" +
              (i + 1) +
              ") .payload-property-label"
          )
          .text()
      ).toBe(prop);
      expect(
        wrapper
          .find(
            ".action .payload-property-container:nth-child(" +
              (i + 1) +
              ") .payload-property-value"
          )
          .text()
      ).toBe(JSON.stringify(value));
    }
  });

  it("renders a Action script", () => {
    const action = {
      id: "script",
      payload: {
        script: "my_script",
        args: ["my_args", "my_arg_2"],
      },
    };
    const act = ActionFactory.createActionFromDTO(action);

    const wrapper = mount(ScriptAction, {
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
      const param = wrapper.find(
        ".action .action-properties-container .payload-property-container:nth-child(2) .params .params__param:nth-child(" +
          (i + 1) +
          ") .resizable__input"
      ).element as HTMLInputElement;

      expect(
        wrapper
          .find(
            ".action .payload-property-container:nth-child(" +
              (i + 1) +
              ") .payload-property-label"
          )
          .text()
      ).toBe(prop);
      expect(param.value).toBe(action.payload.args[i]);
    }
  });
});
