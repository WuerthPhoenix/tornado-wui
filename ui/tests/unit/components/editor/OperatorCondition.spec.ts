import { createLocalVue, mount } from "@vue/test-utils";
import OperatorCondition from "@/components/editor/OperatorCondition.vue";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import Tornado from "@/store/tornado.ts";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("OperatorCondition.vue", () => {
  it("renders an OperatorCondition not in edit mode", () => {
    const type = "CONTAINS";
    const wrapper = mount(OperatorCondition, {
      propsData: {
        type: type,
      },
      localVue,
    });

    expect(
      wrapper.find(".operator-condition-container .operator-condition").exists()
    ).toBe(true);
    expect(
      wrapper.find(".operator-condition-container .operator-condition").text()
    ).toBe(type);
  });

  it("renders an OperatorCondition in edit mode and checks event", async () => {
    const type = "CONTAINS";
    const wrapper = mount(OperatorCondition, {
      propsData: {
        type: type,
      },
      localVue,
    });

    Tornado.setCurrentEditMode(true);

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(".operator-condition-container .operator-condition-btn")
        .exists()
    ).toBe(true);
    expect(
      wrapper
        .find(
          ".operator-condition-container .operator-condition-btn .combo-button-container"
        )
        .exists()
    ).toBe(true);
    expect(
      wrapper
        .find(".operator-condition-container .operator-condition-btn")
        .text()
    ).toBe(type);

    const addConditionButton = wrapper.vm.$refs["addConditionButton"] as any;
    const newCondition = "EQUALS";
    if (addConditionButton)
      addConditionButton.$emit("condition-selected", newCondition);

    await wrapper.vm.$nextTick();

    const emittedChange = wrapper.emitted("change");
    expect(emittedChange).toBeTruthy();
    if (emittedChange) {
      expect(emittedChange[0]).toEqual([newCondition]);
    }
  });
});
