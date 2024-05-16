import { createLocalVue, mount } from "@vue/test-utils";
import TestForm from "@/components/testing/TestForm.vue";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import User, { PermissionsDto, ThemeDto } from "@/store/user";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

const playIcon =
  "M3.5,14C3.2,14,3,13.8,3,13.5v-11c0-0.2,0.1-0.3,0.2-0.4C3.4,2,3.6,2,3.8,2.1l9.5,5.5c0.2,0.1,0.3,0.4,0.2,0.7\tc0,0.1-0.1,0.1-0.2,0.2l-9.5,5.5C3.7,14,3.6,14,3.5,14z M4,3.4v9.3L12,8L4,3.4z";
describe("TestForm.vue", () => {
  it("renders an opened TestForm with tenant root", () => {
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

    const wrapper = mount(TestForm, {
      mocks: {
        $tc: (a: string) => a,
      },
      localVue,
    });

    expect(wrapper.find(".event-type").text()).toMatch(
      "test_window.event_type"
    );

    expect(wrapper.find(".creation-time").text()).toMatch(
      "test_window.creation_time"
    );

    expect(wrapper.find(".tenant-id span").text()).toMatch(
      "test_window.tenant_id"
    );

    expect(wrapper.find(".tenant-id .bx--dropdown").exists()).toBeTruthy();

    expect(wrapper.find(".bx--toggle-input__label").text()).toMatch(
      "test_window.enable_execution_of_actions"
    );

    expect(wrapper.find(".bx--toggle-input")).toBeTruthy();

    expect(
      wrapper.find(".bx--toggle-input").attributes("aria-checked")
    ).toMatch("false");

    expect(wrapper.find(".payload-preview-container")).toBeTruthy();

    expect(wrapper.find(".clear-form").text()).toMatch(
      "test_window.clear_form"
    );

    expect(wrapper.find(".clear-result").text()).toMatch(
      "test_window.clear_result"
    );

    expect(wrapper.find(".run-test").text()).toMatch("test_window.run_test");

    expect(wrapper.find(".run-test svg path").attributes("d")).toMatch(
      playIcon
    );

    expect(
      wrapper.find(".form-buttons .cv-tooltip.inactive-tooltip").exists()
    ).toBeTruthy();

    expect(
      wrapper
        .find(".form-buttons .cv-tooltip.inactive-tooltip .bx--assistive-text")
        .text()
    ).toMatch("test_window.pending_unsaved_changes");

    expect(wrapper.find(".modal-payload.cv-modal").exists()).toBeTruthy();

    expect(wrapper.find(".bx--modal-header__heading").text()).toMatch(
      "test_window.edit_payload"
    );

    expect(
      wrapper.find(".modal-payload.cv-modal .jsoneditor").exists()
    ).toBeTruthy();
  });

  it("does not render the tenant id", () => {
    User.setInfo({
      user: "test_user",
      preferences: {
        language: "en_US",
        theme: ThemeDto.dark,
        timezone: "Europe/Rome",
        processing_tree_collapsed_view_mode: false,
      },
      user_tenants: {
        tenantA: [PermissionsDto.view],
      },
      system_available_tenants: ["tenantA"],
    });

    User.setSelectedTenant("tenantA");

    const wrapper = mount(TestForm, {
      mocks: {
        $tc: (a: string) => a,
      },
      localVue,
    });

    expect(wrapper.find(".tenant-id").exists()).toBeFalsy();
  });

  it("renders a closed TestForm", () => {
    const wrapper = mount(TestForm, {
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        open: false,
      },
      localVue,
    });

    expect(wrapper.find(".test-window.closed")).toBeTruthy();
  });

  it("renders an opened TestForm and opens the JsonEditor", async () => {
    const wrapper = mount(TestForm, {
      mocks: {
        $tc: (a: string) => a,
      },
      localVue,
    });

    expect(wrapper.find(".test-window-form").exists()).toBeTruthy();

    (wrapper.vm as any).editPayload();

    await wrapper.vm.$nextTick();

    expect(
      wrapper.find(".modal-payload.cv-modal.is-visible").exists()
    ).toBeTruthy();
  });

  it("renders an opened TestForm, writes in the fields and cleans all", () => {
    const wrapper = mount(TestForm, {
      mocks: {
        $tc: (a: string) => a,
      },
      localVue,
    });

    expect(wrapper.find(".test-window-form").exists()).toBeTruthy();

    wrapper.find(".creation-time input").setValue("test value");
    wrapper.find(".event-type input").setValue("test value");

    (wrapper.vm as any).clearForm();

    expect((wrapper.vm as any).type).toMatch("");

    expect((wrapper.vm as any).createdMs).toMatch("");
  });

  it("renders an opened TestForm, writes in the fields with autoconfig", async () => {
    const wrapper = mount(TestForm, {
      mocks: {
        $tc: (a: string) => a,
      },
      localVue,
    });
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
      system_available_tenants: ["root", "master"],
    });
    expect(wrapper.find(".test-window-form").exists()).toBeTruthy();
    const testData = {
      created_ms: 1668781208162,
      metadata: {
        tenant_id: "root",
        trace_context: {
          traceparent:
            "00-96864dd1602ad287135b5b35ba7c886b-bdd96d1fe4dd37af-00",
          tracestate: "",
        },
      },
      payload: {
        icinga2_event: {
          check_result: {
            active: false,
            check_source: "rneyenc3.sysmon-preprod.wcp.wuerth.com",
            command: null,
            execution_end: 1668781203.164192,
            execution_start: 1668781203.164192,
            exit_status: 0,
            output: "OK: 6/5/2",
            performance_data: ["WPSTA=6;5;2"],
            schedule_end: 1668781203.164192,
            schedule_start: 1668781203.164192,
            state: 0,
            ttl: 0,
            type: "CheckResult",
            vars_after: {
              attempt: 1,
              reachable: true,
              state: 0,
              state_type: 1,
            },
            vars_before: {
              attempt: 1,
              reachable: true,
              state: 1,
              state_type: 1,
            },
          },
          host: "DE9",
          service: "SAP DE9 WPSTA BATCH - AP781DE9",
          state: 0,
          state_type: 1,
          timestamp: 1668781203.164312,
          type: "StateChange",
        },
        source: "icinga2",
      },
      trace_id: null,
      type: "icinga2_event",
    };
    (wrapper.vm as any).payloadOnJSONEditor = testData;
    await wrapper.vm.$nextTick();
    expect(
      (wrapper.find(".creation-time input").element as HTMLInputElement).value
    ).toMatch("2022/11/18");
    expect(
      (wrapper.find(".event-type input").element as HTMLInputElement).value
    ).toMatch("icinga2_event");
    expect(wrapper.find(".tenant-id .bx--dropdown--selected").text()).toMatch(
      "root"
    );
    expect((wrapper.vm as any).payloadOnJSONEditor).toMatchObject(
      testData.payload
    );
  });
});
