import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import OperatorOverflowMenu from "@/components/editor/OperatorOverflowMenu.vue";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("OperatorOverflowMenu.vue", () => {
  it("renders a GroupTypeButton", async () => {
    const wrapper = mount(OperatorOverflowMenu, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(
      wrapper.findAll(
        ".overflow-menu-container .combo-button-container.icon-only .button-content svg circle"
      ).length
    ).toBe(3);

    wrapper.find(".combo-button").trigger("click");
    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".overflow-menu li:nth-child(1) .bx--overflow-menu-options__option-content"
        )
        .text()
    ).toBe("editor.add_group_below");
    expect(
      wrapper
        .find(
          ".overflow-menu li:nth-child(2) .bx--overflow-menu-options__option-content"
        )
        .text()
    ).toBe("editor.add_condition_below");
    expect(
      wrapper
        .find(
          ".overflow-menu li:nth-child(3) .bx--overflow-menu-options__option-content"
        )
        .text()
    ).toBe("editor.delete_row");

    // Click add group below
    wrapper
      .find(
        ".overflow-menu li:nth-child(1) .bx--overflow-menu-options__option-content"
      )
      .trigger("click");

    // Click add condition below
    wrapper
      .find(
        ".overflow-menu li:nth-child(2) .bx--overflow-menu-options__option-content"
      )
      .trigger("click");

    // Click delete
    wrapper
      .find(
        ".overflow-menu li:nth-child(3) .bx--overflow-menu-options__option-content"
      )
      .trigger("click");

    // Check emitted events
    const emittedEvents = wrapper.emitted();
    expect(emittedEvents).toBeTruthy();
    if (emittedEvents) {
      expect(emittedEvents["add-group-below"]).toBeTruthy();
      expect(emittedEvents["delete"]).toBeTruthy();
      expect(emittedEvents["add-condition-below"]).toBeTruthy();
    }
  });

  it("renders a GroupTypeButton without add group", async () => {
    const wrapper = mount(OperatorOverflowMenu, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        hideAddGroup: true,
      },
    });

    wrapper.find(".combo-button").trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".overflow-menu li").length).toBe(1);
    expect(
      wrapper
        .find(
          ".overflow-menu li:nth-child(1) .bx--overflow-menu-options__option-content"
        )
        .text()
    ).toBe("editor.delete_row");
  });
});
