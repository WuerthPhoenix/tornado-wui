import { createLocalVue, mount } from "@vue/test-utils";
import WhereEditor from "@/components/editor/WhereEditor.vue";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import Tornado from "@/store/tornado";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("WhereEditor.vue", () => {
  it("renders a WhereEditor with a contains condition", () => {
    const wrapper = mount(WhereEditor, {
      propsData: {
        where: {
          type: "contains",
          first: "foo",
          second: "bar",
        },
        isEditable: true,
      },
      localVue,
    });

    expect(wrapper.find(".where-editor .where-operator").exists()).toBe(true);
  });

  it("renders a WhereEditor with no condition and not in edit mode", () => {
    const wrapper = mount(WhereEditor, {
      propsData: {
        where: null,
        isEditable: true,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(wrapper.find(".where-editor").text()).toMatch(
      "editor.no_condition_found"
    );

    expect(
      wrapper
        .find(".where-editor .combo-button-container .button-value")
        .exists()
    ).toBeFalsy();
  });

  it("renders a WhereEditor with no condition in edit mode", async () => {
    const wrapper = mount(WhereEditor, {
      propsData: {
        where: null,
        isEditable: true,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    expect(
      wrapper.find(".where-editor .combo-button-container .button-value").text()
    ).toMatch("editor.add_group");

    expect(wrapper.find(".where-editor").text()).toMatch(
      "editor.no_condition_found"
    );
  });

  it("renders a WhereEditor with a group and in edit mode", async () => {
    const wrapper = mount(WhereEditor, {
      propsData: {
        where: {
          type: "AND",
          operators: [],
        },
        isEditable: true,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".where-editor .where-operator .group-header .combo-button-container .button-value"
        )
        .text()
    ).toBe("AND");
    expect(
      wrapper
        .find(
          ".where-editor .where-operator .group-header .right-actions-container .overflow-menu-container .icon-only"
        )
        .exists()
    ).toBeTruthy();

    wrapper
      .find(
        ".where-editor .where-operator .group-header .right-actions-container .overflow-menu-container .combo-button"
      )
      .trigger("click");
    await wrapper.vm.$nextTick();

    expect(
      wrapper.findAll(
        ".where-editor .where-operator .group-header .right-actions-container .overflow-menu li"
      ).length
    ).toBe(1);
    expect(
      wrapper
        .find(
          ".where-editor .where-operator .group-header .right-actions-container .overflow-menu li .bx--overflow-menu-options__option-content"
        )
        .text()
    ).toBe("editor.delete_row");
  });

  it("renders the WhereEditor of the root node in edit mode", async () => {
    const wrapper = mount(WhereEditor, {
      propsData: {
        where: null,
        isEditable: false,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".where-editor").text()).toMatch(
      "editor.no_condition_found"
    );

    expect(
      wrapper
        .find(".where-editor .combo-button-container.add-group-btn")
        .exists()
    ).toBeFalsy();
  });
});
