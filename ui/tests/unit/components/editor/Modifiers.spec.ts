import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";

import { ModifierDto } from "tornado-backend-dto";
import Modifiers from "@/components/editor/Modifiers.vue";
import Tornado from "@/store/tornado";
import LowercaseModifier from "@/components/modifiers/LowercaseModifier.vue";
import { ExtractorFactory } from "@/core/Extractor/ExtractorFactory";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

const modifiers: ModifierDto[] = [
  { type: "Lowercase" },
  { type: "ToNumber" },
  { type: "Trim" },
];

describe("Modifier.vue", () => {
  it("render one closed modifier", () => {
    const wrapper = mount(LowercaseModifier, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        selected: false,
        hasNext: false,
        hasPrev: false,
      },
    });

    expect(wrapper.findAll(".modifier-selector").length).toBe(1);
    expect(wrapper.findAll(".modifier-content").length).toBe(0);
  });

  it("render one open modifier", () => {
    const wrapper = mount(LowercaseModifier, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        selected: true,
        hasNext: false,
        hasPrev: false,
      },
    });

    expect(wrapper.findAll(".modifier-selector").length).toBe(1);
    expect(wrapper.find(".modifier-selector").classes()).toContain(
      "modifier-selected"
    );
    expect(wrapper.findAll(".modifier-modal").length).toBe(1);
    expect(wrapper.findAll(".close-modifier-button").length).toBe(1);
    expect(wrapper.findAll(".delete-modifier-button").length).toBe(0);
    expect(wrapper.findAll(".move-modifier-button").length).toBe(0);
    expect(wrapper.find(".modifier-title").text()).toBe(
      "editor.modifiers.lowercase"
    );
  });

  it("render one not selected modifier", () => {
    const wrapper = mount(LowercaseModifier, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        selected: false,
        hasNext: true,
        hasPrev: false,
      },
    });

    expect(wrapper.findAll(".modifier-selector").length).toBe(1);
    expect(wrapper.find(".modifier-selector").classes()).not.toContain(
      "modifier-selected"
    );
    expect(wrapper.findAll(".modifier-modal").length).toBe(0);
  });

  it("render first selected modifier in edit mode", async () => {
    const wrapper = mount(LowercaseModifier, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        selected: true,
        hasNext: true,
        hasPrev: false,
      },
    });

    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".modifier-selector").length).toBe(1);
    expect(wrapper.find(".modifier-selector").classes()).toContain(
      "modifier-selected"
    );
    expect(wrapper.findAll(".modifier-modal").length).toBe(1);
    expect(wrapper.findAll(".close-modifier-button").length).toBe(1);
    expect(wrapper.findAll(".delete-modifier-button").length).toBe(1);
    expect(wrapper.findAll(".move-modifier-button").length).toBe(2);
    expect(
      wrapper.find(".move-modifier-button:nth-child(1)").classes()
    ).toContain("disabled");
    expect(
      wrapper.find(".move-modifier-button:nth-child(2)").classes()
    ).not.toContain("disabled");
    expect(wrapper.find(".modifier-title").text()).toBe(
      "editor.modifiers.lowercase"
    );
  });

  it("render last selected modifier in edit mode", async () => {
    const wrapper = mount(LowercaseModifier, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        selected: true,
        hasNext: false,
        hasPrev: true,
      },
    });

    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".modifier-selector").length).toBe(1);
    expect(wrapper.find(".modifier-selector").classes()).toContain(
      "modifier-selected"
    );
    expect(wrapper.findAll(".modifier-modal").length).toBe(1);
    expect(wrapper.findAll(".close-modifier-button").length).toBe(1);
    expect(wrapper.findAll(".delete-modifier-button").length).toBe(1);
    expect(wrapper.findAll(".move-modifier-button").length).toBe(2);
    expect(
      wrapper.find(".move-modifier-button:nth-child(1)").classes()
    ).not.toContain("disabled");
    expect(
      wrapper.find(".move-modifier-button:nth-child(2)").classes()
    ).toContain("disabled");
    expect(wrapper.find(".modifier-title").text()).toBe(
      "editor.modifiers.lowercase"
    );
  });

  it("renders a list of modifiers.", () => {
    const wrapper = mount(Modifiers, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        modifiers: modifiers,
      },
    });

    expect(wrapper.findAll(".modifier-selector").length).toBe(3);
    expect(wrapper.findAll(".modifier-content").length).toBe(0);
  });

  it("opens a modal for a modifier without edit-mode.", async () => {
    const wrapper = mount(Modifiers, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        modifiers: modifiers,
      },
    });

    Tornado.setCurrentEditMode(false);
    await wrapper.vm.$nextTick();
    wrapper.find(".modifier-selector:nth-child(1)").trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".modifier-selected").length).toBe(1);
    expect(wrapper.find(".modifier-selector:nth-child(1)").classes()).toContain(
      "modifier-selected"
    );
    expect(wrapper.findAll(".modifier-modal").length).toBe(1);
    expect(wrapper.findAll(".move-modifier-button").length).toBe(0);
    expect(wrapper.findAll(".delete-modifier-button").length).toBe(0);
    expect(wrapper.find(".modifier-modal .modifier-title").text()).toBe(
      "editor.modifiers.lowercase"
    );
    expect(wrapper.find(".modifier-modal .modifier-description").text()).toBe(
      "editor.modifiers.descriptions.lowercase"
    );
    expect(wrapper.find(".modifier-specific-ui").text()).toBe("");
  });

  it("moves a modifier to the right", async () => {
    // Arrange
    const wrapper = mount(Modifiers, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        modifiers: modifiers,
      },
    });

    // Act
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();
    wrapper.find(".modifier-selector:nth-child(1)").trigger("click");
    await wrapper.vm.$nextTick();
    wrapper.find(".move-modifier-button:not(.disabled)").trigger("click");
    await wrapper.vm.$nextTick();

    // Assert
    expect(wrapper.findAll(".modifier-selected").length).toBe(1);
    expect(wrapper.findAll(".modifier-selector").at(1).classes()).toContain(
      "modifier-selected"
    );
    expect(wrapper.findAll(".modifier-modal").length).toBe(1);
    expect(wrapper.findAll(".move-modifier-button").length).toBe(2);
    expect(wrapper.findAll(".delete-modifier-button").length).toBe(1);
    expect(wrapper.find(".modifier-modal .modifier-title").text()).toBe(
      "editor.modifiers.lowercase"
    );
    expect(wrapper.find(".modifier-modal .modifier-description").text()).toBe(
      "editor.modifiers.descriptions.lowercase"
    );
    expect(wrapper.find(".modifier-modal .modifier-specific-ui").text()).toBe(
      ""
    );
  });

  it("deletes modifier", async () => {
    // Arrange
    const wrapper = mount(Modifiers, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        modifiers: modifiers,
      },
    });

    // Act
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();
    wrapper.find(".modifier-selector:nth-child(1)").trigger("click");
    await wrapper.vm.$nextTick();
    wrapper.find(".delete-modifier-button").trigger("click");
    await wrapper.vm.$nextTick();

    // Assert
    expect(wrapper.findAll(".modifier-selector").length).toBe(2);
    expect(wrapper.findAll(".modifier-selector").at(0).classes()).toContain(
      "modifier-selected"
    );
    expect(wrapper.findAll(".modifier-selected").length).toBe(1);
    expect(wrapper.findAll(".modifier-modal").length).toBe(1);
    expect(wrapper.find(".modifier-modal .modifier-title").text()).toBe(
      "editor.modifiers.to_number"
    );
    expect(wrapper.find(".modifier-modal .modifier-description").text()).toBe(
      "editor.modifiers.descriptions.to_number"
    );
  });

  it("adds modifier", async () => {
    // Arrange
    const wrapper = mount(Modifiers, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        modifiers: modifiers,
      },
    });

    // Act
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();
    wrapper.findAll(".modifier-selector").at(1).trigger("click");
    await wrapper.vm.$nextTick();
    wrapper.find(".add-modifiers button").trigger("click");
    await wrapper.vm.$nextTick();
    wrapper
      .find(".modifiers-available .available-modifier-add:nth-child(1)")
      .trigger("click");
    await wrapper.vm.$nextTick();

    // Assert
    expect(wrapper.findAll(".modifier-selector").length).toBe(4);
    expect(wrapper.find(".modifier-list.scroll .fade").exists()).toBeFalsy();
  });

  it("shows scroll", async () => {
    const modifier = ExtractorFactory.buildMapModifier([], "default");

    // Arrange
    const wrapper = mount(Modifiers, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        modifiers: [
          modifier,
          modifier,
          modifier,
          modifier,
          modifier,
          modifier,
          modifier,
        ],
      },
    });

    // Act
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Assert
    expect(wrapper.find(".modifier-list.scroll .fade").exists()).toBeTruthy();
  });
});
