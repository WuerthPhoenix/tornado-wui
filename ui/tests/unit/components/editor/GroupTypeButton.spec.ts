import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import GroupTypeButton from "@/components/editor/GroupTypeButton.vue";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("GroupTypeButton.vue", () => {
  it("renders a GroupTypeButton", async () => {
    const wrapper = mount(GroupTypeButton, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        value: "Add",
      },
    });

    // Check value
    expect(
      wrapper
        .find(".combo-button-container .button-content .button-value")
        .text()
    ).toBe("Add");

    // Check icon
    expect(
      wrapper.find(".combo-button-container .button-content svg").exists()
    ).toBeTruthy();

    // Click to expand menu
    wrapper.find(".combo-button").trigger("click");
    await wrapper.vm.$nextTick();

    // Check AND item
    expect(
      wrapper
        .find(
          ".overflow-menu li:nth-child(1) .bx--overflow-menu-options__option-content"
        )
        .text()
    ).toBe("AND");

    // Check OR item
    expect(
      wrapper
        .find(
          ".overflow-menu li:nth-child(2) .bx--overflow-menu-options__option-content"
        )
        .text()
    ).toBe("OR");

    // Check NOT item
    expect(
      wrapper
        .find(
          ".overflow-menu li:nth-child(3) .bx--overflow-menu-options__option-content"
        )
        .text()
    ).toBe("NOT");

    // Click AND
    wrapper
      .find(
        ".overflow-menu li:nth-child(1) .bx--overflow-menu-options__option-content"
      )
      .trigger("click");

    // Click OR
    wrapper
      .find(
        ".overflow-menu li:nth-child(2) .bx--overflow-menu-options__option-content"
      )
      .trigger("click");

    // Click NOT
    wrapper
      .find(
        ".overflow-menu li:nth-child(3) .bx--overflow-menu-options__option-content"
      )
      .trigger("click");

    // Check emitted events
    const emittedEvents = wrapper.emitted("select-group");
    expect(emittedEvents).toBeTruthy();
    if (emittedEvents) {
      expect(emittedEvents.length).toBe(3);
      expect(emittedEvents[0]).toEqual(["AND"]);
      expect(emittedEvents[1]).toEqual(["OR"]);
      expect(emittedEvents[2]).toEqual(["NOT"]);
    }
  });

  it("renders a GroupTypeButton with text only", async () => {
    const wrapper = mount(GroupTypeButton, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        value: "Add",
        textOnly: true,
      },
    });

    // Check value
    expect(
      wrapper
        .find(".combo-button-container .button-content .button-value")
        .text()
    ).toBe("Add");

    // Check icon
    expect(
      wrapper.find(".combo-button-container .button-content svg").exists()
    ).toBeFalsy();
  });

  it("renders a GroupTypeButton without NOT item", async () => {
    const wrapper = mount(GroupTypeButton, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        value: "Add",
        showNot: false,
      },
    });

    // Click to expand menu
    wrapper.find(".combo-button").trigger("click");
    await wrapper.vm.$nextTick();

    // Check AND item
    expect(
      wrapper
        .find(
          ".overflow-menu li:nth-child(1) .bx--overflow-menu-options__option-content"
        )
        .text()
    ).toBe("AND");

    // Check OR item
    expect(
      wrapper
        .find(
          ".overflow-menu li:nth-child(2) .bx--overflow-menu-options__option-content"
        )
        .text()
    ).toBe("OR");

    // Check NOT item
    expect(
      wrapper
        .find(
          ".overflow-menu li:nth-child(3) .bx--overflow-menu-options__option-content"
        )
        .exists()
    ).toBeFalsy();
  });
});
