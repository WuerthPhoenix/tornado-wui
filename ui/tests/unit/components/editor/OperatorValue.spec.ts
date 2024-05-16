import { createLocalVue, mount } from "@vue/test-utils";
import OperatorValue from "@/components/editor/OperatorValue.vue";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import Tornado from "@/store/tornado.ts";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("OperatorValue.vue", () => {
  it("renders a OperatorValue with a string", async () => {
    const wrapper = mount(OperatorValue, {
      propsData: {
        value: "foo.bar",
      },
      localVue,
    });
    await wrapper.vm.$nextTick();
    expect(
      wrapper
        .find(
          ".operator-value-container .operator-value:not(.number):not(.boolean)"
        )
        .text()
    ).toMatch("foo.bar");
  });

  it("renders a OperatorValue with a number", async () => {
    const wrapper = mount(OperatorValue, {
      propsData: {
        value: 25,
      },
      localVue,
    });
    await wrapper.vm.$nextTick();
    expect(
      wrapper
        .find(".operator-value-container .operator-value.number:not(.boolean)")
        .text()
    ).toMatch("25");
  });

  it("renders a OperatorValue with a boolean", async () => {
    const wrapper = mount(OperatorValue, {
      propsData: {
        value: true,
      },
      localVue,
    });
    await wrapper.vm.$nextTick();
    expect(
      wrapper
        .find(".operator-value-container .operator-value.boolean:not(.number)")
        .text()
    ).toMatch("true");
  });

  it("renders a OperatorValue in edit mode and enters edit operator mode - string case", async () => {
    const wrapper = mount(OperatorValue, {
      propsData: {
        value: "foo.bar",
      },
      localVue,
    });
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();
    const editableContainer = wrapper.find(".operator-value.editable");
    expect(editableContainer.exists()).toBeTruthy();
    editableContainer.trigger("click");
    await wrapper.vm.$nextTick();
    expect(
      wrapper
        .find(
          ".operator-value-container .editable-operator-value:not(.number):not(.boolean)"
        )
        .exists()
    ).toBeTruthy();
    const emittedChange = wrapper.emitted("operator-mode-change");
    expect(emittedChange).toBeTruthy();
    if (emittedChange) {
      expect(emittedChange[0]).toBeTruthy();
    }
  });

  it("renders a OperatorValue text area - number", async () => {
    const wrapper = mount(OperatorValue, {
      propsData: {
        value: 21,
      },
      localVue,
    });
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();
    const editableContainer = wrapper.find(".operator-value.editable");
    editableContainer.trigger("click");
    await wrapper.vm.$nextTick();
    expect(
      wrapper
        .find(
          ".operator-value-container .editable-operator-value.number:not(.boolean)"
        )
        .exists()
    ).toBeTruthy();
  });

  it("renders a OperatorValue text area - boolean", async () => {
    const wrapper = mount(OperatorValue, {
      propsData: {
        value: true,
      },
      localVue,
    });
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();
    const editableContainer = wrapper.find(".operator-value.editable");
    editableContainer.trigger("click");
    await wrapper.vm.$nextTick();
    expect(
      wrapper
        .find(
          ".operator-value-container .editable-operator-value.boolean:not(.number)"
        )
        .exists()
    ).toBeTruthy();
  });

  it("renders a OperatorValue text area, updates the value and lose focus", async () => {
    const wrapper = mount(OperatorValue, {
      propsData: {
        value: "foo.bar",
      },
      localVue,
    });
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();
    const editableContainer = wrapper.find(".operator-value.editable");
    editableContainer.trigger("click");
    await wrapper.vm.$nextTick();
    const newOperatorValue = "bar.foo";
    (wrapper.vm as any).editableValue = newOperatorValue;
    wrapper
      .find(".operator-value-container .editable-operator-value textarea")
      .trigger("blur");

    await wrapper.vm.$nextTick();

    const emittedChange = wrapper.emitted("change");
    expect(emittedChange).toBeTruthy();
    if (emittedChange) {
      expect(emittedChange[0]).toStrictEqual([newOperatorValue]);
    }
  });
});
