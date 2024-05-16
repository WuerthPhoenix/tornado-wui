import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import ComboButton from "@/components/ComboButton.vue";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("ComboButton.vue", () => {
  it("renders a ComboButton", async () => {
    const wrapper = mount(ComboButton, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        value: "Add",
      },
      slots: {
        default: [
          "<cv-overflow-menu-item>Item1</cv-overflow-menu-item><cv-overflow-menu-item>Item2</cv-overflow-menu-item>",
        ],
      },
      attachTo: document.body,
    });

    expect(wrapper.find(".button-content .button-value").text()).toBe("Add");
    expect(wrapper.find(".overflow-menu").exists()).toBeFalsy();

    wrapper.find(".combo-button").trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".overflow-menu").exists()).toBeTruthy();

    expect(
      wrapper
        .find(
          ".overflow-menu li:first-child .bx--overflow-menu-options__option-content"
        )
        .text()
    ).toBe("Item1");
    expect(
      wrapper
        .find(
          ".overflow-menu li:nth-child(2) .bx--overflow-menu-options__option-content"
        )
        .text()
    ).toBe("Item2");
  });

  it("renders with iconOnly", async () => {
    const wrapper = mount(ComboButton, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        value: "Add",
        iconOnly: true,
      },
      slots: {
        icon: ["<div class='my-icon'>MY ICON</div>"],
        default: [
          "<cv-overflow-menu-item>Item1</cv-overflow-menu-item><cv-overflow-menu-item>Item2</cv-overflow-menu-item>",
        ],
      },
      attachTo: document.body,
    });

    expect(wrapper.find(".button-content .button-value").exists()).toBeFalsy();
    expect(wrapper.find(".button-content .my-icon").exists()).toBeTruthy();
  });

  it("renders with textOnly", async () => {
    const wrapper = mount(ComboButton, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        value: "Text only",
        textOnly: true,
      },
      slots: {
        icon: ["<div class='my-icon'>MY ICON</div>"],
        default: [
          "<cv-overflow-menu-item>Item1</cv-overflow-menu-item><cv-overflow-menu-item>Item2</cv-overflow-menu-item>",
        ],
      },
      attachTo: document.body,
    });

    expect(wrapper.find(".button-content .button-value").text()).toBe(
      "Text only"
    );
    expect(wrapper.find(".button-content .my-icon").exists()).toBeFalsy();
  });

  it("closes a ComboButton menu and checks emitted event", async () => {
    const wrapper = mount(ComboButton, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        value: "Add",
      },
      slots: {
        default: [
          "<cv-overflow-menu-item>Item1</cv-overflow-menu-item><cv-overflow-menu-item>Item2</cv-overflow-menu-item>",
        ],
      },
      attachTo: document.body,
    });

    expect(wrapper.find(".overflow-menu").exists()).toBeFalsy();

    wrapper.find(".combo-button").trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".overflow-menu").exists()).toBeTruthy();

    wrapper.find(".combo-button").trigger("click");
    await wrapper.vm.$nextTick();

    const emittedChange = wrapper.emitted("close-menu");
    expect(emittedChange).toBeTruthy();
  });
});
