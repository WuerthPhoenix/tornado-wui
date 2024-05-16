import { createLocalVue, mount } from "@vue/test-utils";
import WhereOperator from "@/components/editor/WhereOperator.vue";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import Tornado from "@/store/tornado";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("WhereOperator.vue", () => {
  it("renders a WhereOperator with an AND", () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "AND",
          operators: [
            {
              type: "equals",
              first: "foo",
              second: "bar",
            },
            {
              type: "lt",
              first: "baz",
              second: 5,
            },
          ],
        },
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(
      wrapper.find(".where-operator .group-header .group-type").text()
    ).toMatch("AND");

    expect(
      wrapper.findAll(
        ".where-operator .child-operators-container .scrollable-container .where-operator"
      ).length
    ).toBe(2);
  });

  it("renders a WhereOperator with an OR", () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "OR",
          operators: [
            {
              type: "equals",
              first: "foo",
              second: "bar",
            },
            {
              type: "lt",
              first: "baz",
              second: 5,
            },
          ],
        },
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(
      wrapper.find(".where-operator .group-header .group-type").text()
    ).toMatch("OR");

    expect(
      wrapper.findAll(
        ".where-operator .child-operators-container .scrollable-container .where-operator"
      ).length
    ).toBe(2);
  });

  it("renders a WhereOperator with a NOT", () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "NOT",
          operator: {
            type: "equals",
            first: "foo",
            second: "bar",
          },
        },
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(
      wrapper.find(".where-operator .group-header .group-type").text()
    ).toMatch("NOT");

    expect(
      wrapper.findAll(
        ".where-operator .child-operators-container .scrollable-container .where-operator"
      ).length
    ).toBe(1);
  });

  it("renders a WhereOperator with a Regex", () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "regex",
          regex: "foo",
          target: "bar",
        },
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(
      wrapper.findAll(".where-operator .operator-container .operator-value")
        .length
    ).toBe(2);

    expect(
      wrapper.findAll(".where-operator .operator-container .operator-condition")
        .length
    ).toBe(1);

    expect(
      wrapper
        .find(".where-operator .operator-container .operator-condition")
        .text()
    ).toMatch("regex");
  });

  it("renders a WhereOperator with a Contains", () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "contains",
          first: "foo",
          second: "bar",
        },
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(
      wrapper.findAll(".where-operator .operator-container .operator-value")
        .length
    ).toBe(2);

    expect(
      wrapper.findAll(".where-operator .operator-container .operator-condition")
        .length
    ).toBe(1);

    expect(
      wrapper
        .find(".where-operator .operator-container .operator-condition")
        .text()
    ).toMatch("contains");
  });

  it("renders a WhereOperator with an AND and tests the opened collapse", () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "AND",
          operators: [
            {
              type: "equals",
              first: "foo",
              second: "bar",
            },
            {
              type: "lt",
              first: "baz",
              second: 5,
            },
          ],
        },
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(wrapper.find(".scrollable-container").attributes("style")).toBe(
      "margin-top: 0px;"
    );

    expect(wrapper.find(".collapsed-element").exists()).toBeFalsy();
  });

  it("renders a WhereOperator with an AND in collapsed state", () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "AND",
          operators: [
            {
              type: "equals",
              first: "foo",
              second: "bar",
            },
            {
              type: "lt",
              first: "baz",
              second: 5,
            },
          ],
        },
      },
      localVue,
      data: () => {
        return {
          childrenExpanded: false,
        };
      },
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(wrapper.find(".collapsed-element").exists()).toBeTruthy();
  });

  it("changes group type", async () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "AND",
          operators: [],
        },
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
          ".where-operator .group-header .combo-button-container .button-value"
        )
        .text()
    ).toBe("AND");

    // Open menu
    wrapper
      .find(
        ".where-operator .group-header .combo-button-container .combo-button"
      )
      .trigger("click");
    await wrapper.vm.$nextTick();

    expect(
      wrapper.findAll(
        ".where-operator .group-header .change-operator-type-btn .overflow-menu li"
      ).length
    ).toBe(2);
    expect(
      wrapper
        .find(
          ".where-operator .group-header .change-operator-type-btn .overflow-menu li:nth-child(1)"
        )
        .text()
    ).toBe("AND");
    expect(
      wrapper
        .find(
          ".where-operator .group-header .change-operator-type-btn .overflow-menu li:nth-child(2)"
        )
        .text()
    ).toBe("OR");

    // Click OR
    wrapper
      .find(
        ".where-operator .group-header .change-operator-type-btn .overflow-menu li:nth-child(2) button"
      )
      .trigger("click");

    let emittedEvents = wrapper.emitted("change");
    expect(emittedEvents).toBeTruthy();
    if (emittedEvents) {
      expect(emittedEvents.length).toBe(1);
      expect(emittedEvents[0][0].type).toBe("OR");
    }

    // Click AND
    wrapper
      .find(
        ".where-operator .group-header .change-operator-type-btn .overflow-menu li:nth-child(1) button"
      )
      .trigger("click");

    emittedEvents = wrapper.emitted("change");
    expect(emittedEvents).toBeTruthy();
    if (emittedEvents) {
      expect(emittedEvents.length).toBe(2);
      expect(emittedEvents[1][0].type).toBe("AND");
    }
  });

  it("adds a group", async () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "AND",
          operators: [],
        },
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
          ".where-operator .add-operator-btn-container .combo-button-container .button-value"
        )
        .text()
    ).toBe("editor.add_group");

    // Open menu
    wrapper
      .find(
        ".where-operator .add-operator-btn-container .combo-button-container .combo-button"
      )
      .trigger("click");
    await wrapper.vm.$nextTick();

    expect(
      wrapper.findAll(
        ".where-operator .add-operator-btn-container .overflow-menu li"
      ).length
    ).toBe(3);
    expect(
      wrapper
        .find(
          ".where-operator .add-operator-btn-container .overflow-menu li:nth-child(1)"
        )
        .text()
    ).toBe("AND");
    expect(
      wrapper
        .find(
          ".where-operator .add-operator-btn-container .overflow-menu li:nth-child(2)"
        )
        .text()
    ).toBe("OR");
    expect(
      wrapper
        .find(
          ".where-operator .add-operator-btn-container .overflow-menu li:nth-child(3)"
        )
        .text()
    ).toBe("NOT");

    // Click NOT
    wrapper
      .find(
        ".where-operator .add-operator-btn-container .overflow-menu li:nth-child(3) button"
      )
      .trigger("click");

    const emittedEvents = wrapper.emitted("change");
    expect(emittedEvents).toBeTruthy();
    if (emittedEvents) {
      expect(emittedEvents.length).toBe(1);
      expect(emittedEvents[0][0]).toStrictEqual({
        type: "AND",
        operators: [
          {
            type: "NOT",
            operator: {
              first: "",
              type: "equals",
              second: "",
            },
          },
        ],
      });
    }
  });

  it("deletes a row", async () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "AND",
          operators: [],
        },
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
          ".where-operator .right-actions-container .overflow-menu-container .combo-button-container.icon-only"
        )
        .exists()
    ).toBeTruthy();

    // Open menu
    wrapper
      .find(
        ".where-operator .right-actions-container .overflow-menu-container .combo-button-container.icon-only .combo-button"
      )
      .trigger("click");
    await wrapper.vm.$nextTick();

    expect(
      wrapper.findAll(
        ".where-operator .right-actions-container .overflow-menu-container .combo-button-container .overflow-menu li"
      ).length
    ).toBe(3);
    expect(
      wrapper
        .find(
          ".where-operator .right-actions-container .overflow-menu-container .combo-button-container .overflow-menu li:nth-child(1)"
        )
        .text()
    ).toBe("editor.add_group_below");
    expect(
      wrapper
        .find(
          ".where-operator .right-actions-container .overflow-menu-container .combo-button-container .overflow-menu li:nth-child(2)"
        )
        .text()
    ).toBe("editor.add_condition_below");
    expect(
      wrapper
        .find(
          ".where-operator .right-actions-container .overflow-menu-container .combo-button-container .overflow-menu li:nth-child(3)"
        )
        .text()
    ).toBe("editor.delete_row");

    // Click delete row
    wrapper
      .find(
        ".where-operator .right-actions-container .overflow-menu-container .combo-button-container .overflow-menu li:nth-child(3) button"
      )
      .trigger("click");

    const emittedEvents = wrapper.emitted("delete");
    expect(emittedEvents).toBeTruthy();
    if (emittedEvents) {
      expect(emittedEvents.length).toBe(1);
    }
  });

  it("adds group below", async () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "OR",
          operators: [],
        },
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
          ".where-operator .right-actions-container .overflow-menu-container .combo-button-container.icon-only"
        )
        .exists()
    ).toBeTruthy();

    // Open menu
    wrapper
      .find(
        ".where-operator .right-actions-container .overflow-menu-container .combo-button-container.icon-only .combo-button"
      )
      .trigger("click");
    await wrapper.vm.$nextTick();

    expect(
      wrapper.findAll(
        ".where-operator .right-actions-container .overflow-menu-container .combo-button-container .overflow-menu li"
      ).length
    ).toBe(3);
    expect(
      wrapper
        .find(
          ".where-operator .right-actions-container .overflow-menu-container .combo-button-container .overflow-menu li:nth-child(1)"
        )
        .text()
    ).toBe("editor.add_group_below");
    expect(
      wrapper
        .find(
          ".where-operator .right-actions-container .overflow-menu-container .combo-button-container .overflow-menu li:nth-child(2)"
        )
        .text()
    ).toBe("editor.add_condition_below");
    expect(
      wrapper
        .find(
          ".where-operator .right-actions-container .overflow-menu-container .combo-button-container .overflow-menu li:nth-child(3)"
        )
        .text()
    ).toBe("editor.delete_row");

    // Click add group below
    wrapper
      .find(
        ".where-operator .right-actions-container .overflow-menu-container .combo-button-container .overflow-menu li:nth-child(1) button"
      )
      .trigger("click");
    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(".add-group-below-row .combo-button-container .button-value")
        .text()
    ).toBe("editor.choose_group_type");
    expect(wrapper.find(".add-group-below-row .cancel-btn").text()).toBe(
      "editor.cancel"
    );

    // Open choose group type menu
    wrapper
      .find(".add-group-below-row .combo-button-container .combo-button")
      .trigger("click");
    await wrapper.vm.$nextTick();

    expect(
      wrapper.findAll(
        ".add-group-below-row .combo-button-container .overflow-menu li"
      ).length
    ).toBe(3);
    expect(
      wrapper
        .find(
          ".add-group-below-row .combo-button-container .overflow-menu li:nth-child(1)"
        )
        .text()
    ).toBe("AND");
    expect(
      wrapper
        .find(
          ".add-group-below-row .combo-button-container .overflow-menu li:nth-child(2)"
        )
        .text()
    ).toBe("OR");
    expect(
      wrapper
        .find(
          ".add-group-below-row .combo-button-container .overflow-menu li:nth-child(3)"
        )
        .text()
    ).toBe("NOT");

    // Click AND
    wrapper
      .find(
        ".add-group-below-row .combo-button-container .overflow-menu li:nth-child(1) button"
      )
      .trigger("click");
    // Click OR
    wrapper
      .find(
        ".add-group-below-row .combo-button-container .overflow-menu li:nth-child(2) button"
      )
      .trigger("click");
    // Click NOT
    wrapper
      .find(
        ".add-group-below-row .combo-button-container .overflow-menu li:nth-child(3) button"
      )
      .trigger("click");

    const emittedEvents = wrapper.emitted("add-group-below");
    expect(emittedEvents).toBeTruthy();
    if (emittedEvents) {
      expect(emittedEvents.length).toBe(3);
      expect(emittedEvents[0][0]).toBe("AND");
      expect(emittedEvents[1][0]).toBe("OR");
      expect(emittedEvents[2][0]).toBe("NOT");
    }
  });

  it("renders a WhereOperator with an AND in collapsed state", () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "AND",
          operators: [
            {
              type: "equals",
              first: "foo",
              second: "bar",
            },
            {
              type: "lt",
              first: "baz",
              second: 5,
            },
          ],
        },
      },
      localVue,
      data: () => {
        return {
          childrenExpanded: false,
        };
      },
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(wrapper.find(".collapsed-element").exists()).toBeTruthy();
  });

  it("renders a WhereOperator in edit mode", async () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "AND",
          operators: [
            {
              type: "equals",
              first: "foo",
              second: "bar",
            },
            {
              type: "lt",
              first: "baz",
              second: 5,
            },
          ],
        },
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
        .find(".where-operator .group-header .change-operator-type-btn")
        .text()
    ).toMatch("AND");

    expect(
      wrapper
        .find(".where-operator .group-header .right-actions-container")
        .exists()
    ).toBeTruthy();

    expect(
      wrapper
        .find(
          ".where-operator .add-operator-btn-container .combo-button-container.add-condition-btn"
        )
        .text()
    ).toMatch("editor.add_condition");
  });

  it("renders a WhereOperator in edit mode and clicks on add condition below button", async () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "AND",
          operators: [
            {
              type: "equals",
              first: "foo",
              second: "bar",
            },
            {
              type: "lt",
              first: "baz",
              second: 5,
            },
          ],
        },
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    Tornado.setCurrentEditMode(true);

    await wrapper.vm.$nextTick();

    wrapper
      .find(
        ".where-operator .group-header .right-actions-container .overflow-menu-container .combo-button"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    wrapper
      .find(
        ".where-operator .group-header .right-actions-container .overflow-menu-container .overflow-menu li:nth-child(2) button"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(".where-operator .add-group-below-row .add-condition-below-btn")
        .text()
    ).toBe("editor.choose_condition_type");
  });

  it("renders a NOT WhereOperator and checks the absence of the inline menu", async () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "NOT",
          operator: {
            type: "equals",
            first: "foo",
            second: "bar",
          },
        },
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
          ".where-operator .child-operators-container .where-operator:first-child .operator-container .inline-add-below-container .overflow-menu-container"
        )
        .exists()
    ).toBeFalsy();

    wrapper
      .find(
        ".where-operator .child-operators-container .where-operator:first-child .operator-container"
      )
      .trigger("mouseover");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".where-operator .child-operators-container .where-operator:first-child .operator-container .inline-add-below-container .overflow-menu-container"
        )
        .exists()
    ).toBeFalsy();
  });

  it("renders a WhereOperator with the inline add below menu - add group below click", async () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "AND",
          operators: [
            {
              type: "equals",
              first: "foo",
              second: "bar",
            },
            {
              type: "lt",
              first: "baz",
              second: 5,
            },
          ],
        },
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
          ".where-operator .child-operators-container .where-operator:first-child .operator-container .inline-add-below-container .overflow-menu-container"
        )
        .exists()
    ).toBeFalsy();

    wrapper
      .find(
        ".where-operator .child-operators-container .where-operator:first-child .operator-container"
      )
      .trigger("mouseover");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".where-operator .child-operators-container .where-operator:first-child .operator-container .inline-add-below-container .overflow-menu-container"
        )
        .exists()
    ).toBeTruthy();

    wrapper
      .find(
        ".where-operator .child-operators-container .where-operator:first-child .operator-container .inline-add-below-container .overflow-menu-container .combo-button"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    wrapper
      .find(
        ".where-operator .child-operators-container .where-operator:first-child .operator-container .inline-add-below-container .overflow-menu-container .overflow-menu li:first-child button"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".where-operator .child-operators-container .where-operator:first-child .add-group-below-row .add-group-btn"
        )
        .text()
    ).toBe("editor.choose_group_type");
  });

  it("renders a WhereOperator with the inline add below menu - add condition below click", async () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "AND",
          operators: [
            {
              type: "equals",
              first: "foo",
              second: "bar",
            },
            {
              type: "lt",
              first: "baz",
              second: 5,
            },
          ],
        },
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    Tornado.setCurrentEditMode(true);

    wrapper
      .find(
        ".where-operator .child-operators-container .where-operator:first-child .operator-container"
      )
      .trigger("mouseover");

    await wrapper.vm.$nextTick();

    wrapper
      .find(
        ".where-operator .child-operators-container .where-operator:first-child .operator-container .inline-add-below-container .overflow-menu-container .combo-button"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    wrapper
      .find(
        ".where-operator .child-operators-container .where-operator:first-child .operator-container .inline-add-below-container .overflow-menu-container .overflow-menu li:nth-child(2) button"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".where-operator .child-operators-container .where-operator:first-child .add-group-below-row .add-condition-below-btn"
        )
        .text()
    ).toBe("editor.choose_condition_type");
  });

  it("renders a WhereOperator with the inline add below menu - delete row", async () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "AND",
          operators: [
            {
              type: "equals",
              first: "foo",
              second: "bar",
            },
            {
              type: "lt",
              first: "baz",
              second: 5,
            },
          ],
        },
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    Tornado.setCurrentEditMode(true);

    wrapper
      .find(
        ".where-operator .child-operators-container .where-operator:first-child .operator-container"
      )
      .trigger("mouseover");

    await wrapper.vm.$nextTick();

    expect(
      wrapper.findAll(
        ".where-operator .child-operators-container .where-operator"
      ).length
    ).toBe(2);

    wrapper
      .find(
        ".where-operator .child-operators-container .where-operator:first-child .operator-container .inline-add-below-container .overflow-menu-container .combo-button"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    wrapper
      .find(
        ".where-operator .child-operators-container .where-operator:first-child .operator-container .inline-add-below-container .overflow-menu-container .overflow-menu li:nth-child(3) button"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper.findAll(
        ".where-operator .child-operators-container .where-operator"
      ).length
    ).toBe(1);
    expect(
      wrapper
        .find(
          ".where-operator .child-operators-container .where-operator .operator-container .operator-condition-container"
        )
        .text()
    ).toBe("LT");
  });

  it("renders a WhereOperator with the inline add below menu - hide on operator edit", async () => {
    const wrapper = mount(WhereOperator, {
      propsData: {
        operator: {
          type: "AND",
          operators: [
            {
              type: "equals",
              first: "foo",
              second: "bar",
            },
            {
              type: "lt",
              first: "baz",
              second: 5,
            },
          ],
        },
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    Tornado.setCurrentEditMode(true);

    wrapper
      .find(
        ".where-operator .child-operators-container .where-operator:first-child .operator-container"
      )
      .trigger("mouseover");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".where-operator .child-operators-container .where-operator:first-child .operator-container .overflow-menu-container"
        )
        .exists()
    ).toBeTruthy();

    wrapper
      .find(
        ".where-operator .child-operators-container .where-operator:first-child .operator-container .first .operator-value"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".where-operator .child-operators-container .where-operator:first-child .operator-container .overflow-menu-container"
        )
        .exists()
    ).toBeFalsy();
  });
});
