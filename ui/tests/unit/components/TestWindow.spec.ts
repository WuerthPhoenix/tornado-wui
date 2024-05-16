import { createLocalVue, mount } from "@vue/test-utils";
import TestWindow from "@/components/TestWindow.vue";

// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";

import User, { PermissionsDto, ThemeDto } from "@/store/user";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("TestWindow.vue", () => {
  it("renders an opened TestWindow with tenant root", () => {
    User.setInfo({
      user: "root",
      preferences: {
        language: "en_US",
        theme: ThemeDto.dark,
        timezone: "Europe/Rome",
        processing_tree_collapsed_view_mode: false,
      },
      user_tenants: {
        root: [
          PermissionsDto.view,
          PermissionsDto.edit,
          PermissionsDto.test_event_execute_actions,
        ],
      },
      system_available_tenants: ["root"],
    });

    User.setSelectedTenant(User.ROOT_TENANT);

    const wrapper = mount(TestWindow, {
      mocks: {
        $tc: (a: string) => a,
      },
      localVue,
    });

    expect(wrapper.find(".test-window")).toBeTruthy();

    expect(wrapper.find(".test-window .test-window-tabs")).toBeTruthy();

    expect(wrapper.find(".test-window .test-window-form")).toBeTruthy();

    expect(wrapper.find(".test-window .no-rule-selected")).toBeTruthy();
  });
});
