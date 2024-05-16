import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import ProcessingTreeNodeDetailsTypeFilter from "@/components/processing_tree/ProcessingTreeNodeDetailsTypeFilter.vue";
import Tornado from "@/store/tornado";
import i18n from "@/utils/i18n";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

const mock = jest.spyOn(i18n, "tc");
mock.mockImplementation((a) => a);

const factory = (propsData: Record<string, unknown>) => {
  return mount(ProcessingTreeNodeDetailsTypeFilter, {
    propsData: {
      ...propsData,
    },
    localVue,
    mocks: {
      $tc: (a: string) => a,
    },
    computed: {},
  });
};

describe("ProcessingTreeNodeDetailsTypeFilter.vue", () => {
  it("renders a ProcessingTreeNodeDetailsTypeFilter", () => {
    const details = {
      type: "Filter",
      name: "root",
      description: "Root description",
      active: true,
      filter: null,
    };

    const wrapper = factory({ details: details, parentNodePath: [] });

    expect(wrapper.find(".properties-grid").exists()).toBe(true);

    expect(wrapper.find(".properties-grid .name").text()).toBe(details.name);

    expect(wrapper.find(".properties-grid .description").text()).toBe(
      details.description
    );

    expect(wrapper.find(".properties-grid .active").exists()).toBe(true);
  });

  it("renders a loading ProcessingTreeNodeDetailsTypeFilter", () => {
    const wrapper = factory({ details: undefined, parentNodePath: undefined });

    expect(wrapper.find(".properties-grid .bx--skeleton").exists()).toBe(true);
  });

  it("renders the where tab", () => {
    const details = {
      type: "Filter",
      name: "root",
      description: "Root description",
      active: true,
      filter: null,
    };

    const wrapper = factory({ details: details, parentNodePath: [] });
    expect(wrapper.find(".where-editor").exists()).toBe(true);
  });

  it("the filter's properties in edit mode - focus but no changes", async () => {
    const details = {
      type: "Filter",
      name: "root",
      description: "Root description",
      active: true,
      filter: null,
    };

    const wrapper = factory({ details: details, parentNodePath: ["parent"] });

    Tornado.setCurrentEditMode(true);

    await wrapper.vm.$nextTick();

    wrapper
      .find(".properties-grid .left-side .filter-name .bx--text-input")
      .trigger("click");

    await wrapper.vm.$nextTick();

    wrapper.find(".filter-details-container").trigger("click");

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update-details")).toBe(undefined);
  });

  it("renders the filter's properties in edit mode - non-root node - check on the name", async () => {
    const details = {
      type: "Filter",
      name: "root",
      description: "Root description",
      active: true,
      filter: null,
    };

    const wrapper = factory({ details: details, parentNodePath: ["parent"] });

    Tornado.setCurrentEditMode(true);

    await wrapper.vm.$nextTick();

    expect(
      wrapper.find(".properties-grid .left-side .filter-name").exists()
    ).toBeTruthy();
    expect(
      wrapper.find(".properties-grid .left-side .filter-description").exists()
    ).toBeTruthy();

    const nameInput = wrapper.find(
      ".properties-grid .left-side .filter-name input"
    );

    await nameInput.setValue("root with spaces");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".properties-grid .left-side .filter-name .bx--text-input--invalid"
        )
        .exists()
    ).toBeTruthy();
  });

  it("renders the filter's properties in edit mode - root node", async () => {
    const details = {
      type: "Filter",
      name: "root",
      description: "Root description",
      active: true,
      filter: null,
    };

    const wrapper = factory({ details: details, parentNodePath: [] });

    Tornado.setCurrentEditMode(true);

    await wrapper.vm.$nextTick();

    expect(
      wrapper.find(".properties-grid .left-side .name").exists()
    ).toBeTruthy();
    expect(
      wrapper.find(".properties-grid .left-side .description").exists()
    ).toBeTruthy();

    expect(
      wrapper.find(".properties-grid .left-side .filter-name").exists()
    ).toBeFalsy();
    expect(
      wrapper.find(".properties-grid .left-side .filter-description").exists()
    ).toBeFalsy();

    expect(
      wrapper.find(".properties-grid .active.filter-active").exists()
    ).toBeTruthy();
    expect(
      wrapper
        .find(".properties-grid .active.filter-active.editable-toggle")
        .exists()
    ).toBeFalsy();

    expect(
      wrapper
        .find(".properties-grid .active.filter-active .bx--toggle-input")
        .attributes("aria-checked")
    ).toMatch("true");

    wrapper
      .find(".properties-grid .active.filter-active .bx--toggle-input")
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(".properties-grid .active.filter-active .bx--toggle-input")
        .attributes("aria-checked")
    ).toMatch("true");
  });

  it("updates the filter's properties with validity check", async () => {
    const details = {
      type: "Filter",
      name: "root",
      description: "Root description",
      active: true,
      filter: null,
    };

    const wrapper = factory({ details: details, parentNodePath: ["parent"] });

    Tornado.setCurrentEditMode(true);

    await wrapper.vm.$nextTick();

    expect(
      wrapper.find(".properties-grid .left-side .filter-name").exists()
    ).toBeTruthy();
    expect(
      wrapper.find(".properties-grid .left-side .filter-description").exists()
    ).toBeTruthy();

    const nameInput = wrapper.find(
      ".properties-grid .left-side .filter-name input"
    );

    const descriptionInput = wrapper.find(
      ".properties-grid .left-side .filter-description input"
    );

    await nameInput.setValue("new root");

    await descriptionInput.setValue("Root new description");

    await wrapper.vm.$nextTick();

    (wrapper.vm as any).updateDetails();

    let emittedEvents = wrapper.emitted("update-details");
    expect(emittedEvents).toBeUndefined();

    await nameInput.setValue("new_root");
    (wrapper.vm as any).updateDetails();

    emittedEvents = wrapper.emitted("update-details");
    expect(emittedEvents).toBeTruthy();
    if (emittedEvents) {
      expect(emittedEvents.length).toBe(1);
      expect(emittedEvents[0][0].name).toBe("new_root");
    } else {
      fail("update-details not found");
    }
  });
});
