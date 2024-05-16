import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import ActionOverflowMenu from "@/components/editor/ActionOverflowMenu.vue";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("ActionOverflowMeni.vue", () => {
  it("renders a ActionOverflowMenu", async () => {
    const wrapper = mount(ActionOverflowMenu, {
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
    ).toBe("editor.add_action_below");

    // Click delete
    wrapper
      .find(
        ".overflow-menu li:nth-child(2) .bx--overflow-menu-options__option-content"
      )
      .trigger("click");

    // Check emitted events
    const emittedEvents = wrapper.emitted();
    expect(emittedEvents).toBeTruthy();
    if (!emittedEvents) {
      fail("No events emitted");
      return;
    }

    expect(emittedEvents["delete"]).toBeTruthy();
  });
});
