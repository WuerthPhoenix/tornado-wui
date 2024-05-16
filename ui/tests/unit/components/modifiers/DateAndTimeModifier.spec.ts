import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import { DateAndTimeDetails } from "@/core/Extractor/Modifiers";
import Tornado from "@/store/tornado";
import { ExtractorFactory } from "@/core/Extractor/ExtractorFactory";
import DateAndTimeModifier from "@/components/modifiers/DateAndTimeModifier.vue";
import { cloneDeep } from "lodash";
import User, { PermissionsDto, ThemeDto } from "@/store/user";
jest.mock("@/utils/timezoneHelper", () => ({
  getTimezones: jest.fn(() => ["Mocked/TimeZone1", "Mocked/TimeZone2"]),
}));
const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("DateAndTime.vue", () => {
  it("render a DateAndTime with user filled timezone", async () => {
    User.setInfo({
      user: "test_user",
      preferences: {
        language: "en_US",
        theme: ThemeDto.dark,
        timezone: "Mocked/TimeZone1",
        processing_tree_collapsed_view_mode: false,
      },
      user_tenants: {
        tenantA: [PermissionsDto.view],
      },
      system_available_tenants: ["tenantA"],
    });

    const modifier = ExtractorFactory.buildDateTimeModifier();
    const details = modifier.details as DateAndTimeDetails;

    const wrapper = mount(DateAndTimeModifier, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        data: details,
        selected: true,
        hasNext: false,
        hasPrev: false,
      },
    });

    Tornado.setCurrentEditMode(false);
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".modifier-header .modifier-title").text()).toBe(
      "editor.modifiers.DateAndTime.DateAndTime"
    );
    expect(wrapper.find(".modifier-footer .modifier-description").text()).toBe(
      "editor.modifiers.descriptions.DateAndTime"
    );
    const select = wrapper.find(".modifier .modifier-input select");
    const element = select.element as any;

    expect(element.value).toBe("Mocked/TimeZone1");

    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    select.setValue("Mocked/TimeZone2");
    select.trigger("blur");
    await wrapper.vm.$nextTick();

    const emittedChange = wrapper.emitted("update");
    if (!emittedChange || emittedChange.length != 2) {
      fail("No events triggered");
    }

    const edited = cloneDeep(details);
    edited.timezone = "Mocked/TimeZone2";
    expect(emittedChange[0].pop()).toStrictEqual(edited);
  });
  it("render a DateAndTime with user filled timezone: UTC", async () => {
    User.setInfo({
      user: "test_user",
      preferences: {
        language: "en_US",
        theme: ThemeDto.dark,
        timezone: "UTC",
        processing_tree_collapsed_view_mode: false,
      },
      user_tenants: {
        tenantA: [PermissionsDto.view],
      },
      system_available_tenants: ["tenantA"],
    });

    const modifier = ExtractorFactory.buildDateTimeModifier();
    const details = modifier.details as DateAndTimeDetails;

    const wrapper = mount(DateAndTimeModifier, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        data: details,
        selected: true,
        hasNext: false,
        hasPrev: false,
      },
    });

    Tornado.setCurrentEditMode(false);
    await wrapper.vm.$nextTick();
    const select = wrapper.find(".modifier .modifier-input select");
    const element = select.element as any;

    expect(element.value).toBe("");
  });
  it("render a DateAndTime with user filled timezone: NULL", async () => {
    User.setInfo({
      user: "test_user",
      preferences: {
        language: "en_US",
        theme: ThemeDto.dark,
        timezone: null,
        processing_tree_collapsed_view_mode: false,
      },
      user_tenants: {
        tenantA: [PermissionsDto.view],
      },
      system_available_tenants: ["tenantA"],
    });

    const modifier = ExtractorFactory.buildDateTimeModifier();
    const details = modifier.details as DateAndTimeDetails;

    const wrapper = mount(DateAndTimeModifier, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        data: details,
        selected: true,
        hasNext: false,
        hasPrev: false,
      },
    });

    Tornado.setCurrentEditMode(false);
    await wrapper.vm.$nextTick();
    const select = wrapper.find(".modifier .modifier-input select");
    const element = select.element as any;

    expect(element.value).toBe("");
  });
});
