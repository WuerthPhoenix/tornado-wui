import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import i18n from "@/utils/i18n";
import Tornado from "@/store/tornado";
import { ActionFactory } from "@/core/Action/ActionFactory";
import { Value } from "tornado-backend-dto";
import ElasticsearchAction from "@/components/editor/actions/ElasticsearchAction.vue";
import ArchiveAction from "@/components/editor/actions/ArchiveAction.vue";
import SmartMonitoringCheckResultAction from "@/components/editor/actions/SmartMonitoringCheckResultAction.vue";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("Action editable.vue", () => {
  const mock = jest.spyOn(i18n, "tc");
  mock.mockImplementation((a) => a);

  it("renders a Action elastic search editable", async () => {
    const action = {
      id: "elasticsearch",
      payload: {
        endpoint: "endpoint1",
        index: "0",
        data: { id: 2 },
        auth: { jwt: "" },
      },
    };
    const actionsClass = ActionFactory.createActionFromDTO(action);

    const wrapper = mount(ElasticsearchAction, {
      propsData: {
        action: actionsClass,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Type
    expect(wrapper.find(".action .group-header .action-type").text()).toBe(
      action.id
    );

    // Properties
    const properties = Object.keys(action.payload);
    for (let i = 0; i < 2; ++i) {
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
              ") .payload-property-value-editable .editable"
          )
          .text()
      ).toBe(value);
    }

    Tornado.setCurrentEditMode(false);
    await wrapper.vm.$nextTick();
  });
  it("renders a Action smart monitoring editable", async () => {
    const action = {
      id: "smart_monitoring_check_result",
      payload: {
        check_result: "1",
        host: "my_host",
        service: "my_service",
      },
    };

    const actionClass = ActionFactory.createActionFromDTO(action);

    const wrapper = mount(SmartMonitoringCheckResultAction, {
      propsData: {
        action: actionClass,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Type
    expect(wrapper.find(".action .group-header .action-type").text()).toBe(
      action.id
    );

    Tornado.setCurrentEditMode(false);
    await wrapper.vm.$nextTick();
  });

  it("renders a Action archive editable", async () => {
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

    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

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
              ") .payload-property-value-editable .editable"
          )
          .text()
      ).toBe(value);
    }
    Tornado.setCurrentEditMode(false);
    await wrapper.vm.$nextTick();
  });
});
