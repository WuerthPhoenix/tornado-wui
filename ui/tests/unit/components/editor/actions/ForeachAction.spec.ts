import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import i18n from "@/utils/i18n";
import { ActionFactory } from "@/core/Action/ActionFactory";
import ForeachAction from "@/components/editor/actions/ForeachAction.vue";
import Tornado from "@/store/tornado";
import { cloneDeep } from "lodash";
import { ForeachPayload } from "@/core/Action/Payload";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("ForeachAction.vue", () => {
  const mock = jest.spyOn(i18n, "tc");
  mock.mockImplementation((a) => a);

  it("renders a foreach action", () => {
    const action = {
      id: "foreach",
      payload: {
        target: "my_target",
        actions: [
          {
            id: "logger",
            payload: {},
          },
        ],
      },
    };
    const act = ActionFactory.createActionFromDTO(action);

    const wrapper = mount(ForeachAction, {
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

    // Target
    expect(
      wrapper
        .find(
          ".action .action-properties-container .target-container .target-label"
        )
        .text()
    ).toBe("editor.target");
    expect(
      wrapper
        .find(
          ".action .action-properties-container .target-container .target-value span"
        )
        .text()
    ).toBe(action.payload.target);
  });

  it("edits the target of a foreach action", async () => {
    const action = {
      id: "foreach",
      payload: {
        target: "my_target",
        actions: [],
      },
    };
    const foreachAction = ActionFactory.createActionFromDTO(action);

    const wrapper = mount(ForeachAction, {
      propsData: {
        action: foreachAction,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();
    const editableContainer = wrapper.find(".operator-value.editable");
    expect(editableContainer.exists()).toBeTruthy();
    editableContainer.trigger("click");
    await wrapper.vm.$nextTick();
    const input = wrapper.find("textarea");
    expect(input.exists()).toBeTruthy();
    input.setValue("edited_target");
    input.trigger("blur");
    await wrapper.vm.$nextTick();

    const emittedChange = wrapper.emitted("update");
    if (!emittedChange || emittedChange.length != 1) {
      fail("No events triggered");
    }

    const editedAction = cloneDeep(foreachAction);
    (editedAction.payload as ForeachPayload).target = "edited_target";
    expect(emittedChange[0].pop()).toStrictEqual(editedAction);
  });
});
