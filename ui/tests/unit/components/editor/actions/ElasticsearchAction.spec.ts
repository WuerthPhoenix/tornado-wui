import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import i18n from "@/utils/i18n";
import { ActionFactory } from "@/core/Action/ActionFactory";
import ElasticsearchAction from "@/components/editor/actions/ElasticsearchAction.vue";
import Tornado from "@/store/tornado";
import { cloneDeep } from "lodash";
import { ElasticsearchPayload } from "@/core/Action/Payload";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("Elasticsearch.vue", () => {
  const mock = jest.spyOn(i18n, "tc");
  mock.mockImplementation((a) => a);

  it("renders an elasticsearch Action", () => {
    const action = {
      id: "elasticsearch",
      payload: {
        endpoint: "endpoint1",
        index: "0",
        data: { id: 2 },
        auth: { jwt: "" },
      },
    };
    const act = ActionFactory.createActionFromDTO(action);

    const wrapper = mount(ElasticsearchAction, {
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
    ).toBe(action.payload.endpoint);

    expect(
      wrapper
        .find(
          ".action .payload-property-container:nth-child(2) .payload-property-value"
        )
        .text()
    ).toBe(action.payload.index);

    expect(
      wrapper
        .find(
          ".action .payload-property-container:nth-child(3) .payload-property-value"
        )
        .text()
        .replace(/(\r\n\s|\s|\r|\n)/g, "")
    ).toBe(
      JSON.stringify(action.payload.data, null, 2).replace(
        /(\r\n\s|\s|\r|\n)/g,
        ""
      )
    );

    expect(
      wrapper
        .find(
          ".action .payload-property-container:nth-child(4) .payload-property-value"
        )
        .text()
        .replace(/(\r\n\s|\s|\r|\n)/g, "")
    ).toBe(
      JSON.stringify(action.payload.auth).replace(/(\r\n\s|\s|\r|\n)/g, "")
    );
  });

  it("edits the index of an elasticsearch action", async () => {
    const action = {
      id: "elasticsearch",
      payload: {
        endpoint: "endpoint1",
        index: "0",
        data: {},
        auth: {},
      },
    };
    const elasticsearchAction = ActionFactory.createActionFromDTO(action);

    const wrapper = mount(ElasticsearchAction, {
      propsData: {
        action: elasticsearchAction,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    const editableContainer = wrapper.find(
      ".action .action-properties-container .payload-property-container:nth-child(2) .editable"
    );
    expect(editableContainer.exists()).toBeTruthy();
    editableContainer.trigger("click");
    await wrapper.vm.$nextTick();
    const input = wrapper.find(
      ".action .action-properties-container .payload-property-container:nth-child(2) textarea"
    );
    expect(input.exists()).toBeTruthy();
    input.setValue("6");
    input.trigger("blur");
    await wrapper.vm.$nextTick();

    const emittedChange = wrapper.emitted("update");
    if (!emittedChange || emittedChange.length != 1) {
      fail("No events triggered");
    }

    const editedAction = cloneDeep(elasticsearchAction);
    (editedAction.payload as ElasticsearchPayload).index = 6;
    expect(emittedChange[0].pop()).toStrictEqual(editedAction);
  });
});
