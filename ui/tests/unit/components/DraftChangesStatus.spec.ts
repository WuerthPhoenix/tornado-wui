import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import DraftChangesStatus from "@/components/DraftChangesStatus.vue";
import i18n from "@/utils/i18n";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("DraftChangesStatus.vue", () => {
  const mock = jest.spyOn(i18n, "tc");
  mock.mockImplementation((a) => a);

  it("renders a DraftChangesStatus with state = saved", async () => {
    const wrapper = mount(DraftChangesStatus, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        state: "saved",
      },
    });

    expect(wrapper.find(".draft-changes-status.saved").exists()).toBeTruthy();
    expect(wrapper.find(".status-message").text()).toBe(
      "edit_mode.draft_status.saved"
    );
    expect(wrapper.find(".bx--assistive-text").text()).toBe(
      "edit_mode.draft_status.all_changes_saved"
    );
  });

  it("renders a DraftChangesStatus with state = unsaved", async () => {
    const wrapper = mount(DraftChangesStatus, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        state: "unsaved",
      },
    });

    expect(wrapper.find(".draft-changes-status.unsaved").exists()).toBeTruthy();
    expect(wrapper.find(".status-message").text()).toBe(
      "edit_mode.draft_status.unsaved_changes"
    );
    expect(wrapper.find(".bx--assistive-text").text()).toBe(
      "edit_mode.draft_status.there_are_unsaved_changes"
    );
  });

  it("renders a DraftChangesStatus with state = saving", async () => {
    const wrapper = mount(DraftChangesStatus, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        state: "saving",
      },
    });

    expect(wrapper.find(".draft-changes-status.saving").exists()).toBeTruthy();
    expect(wrapper.find(".status-message").text()).toBe(
      "edit_mode.draft_status.saving"
    );
    expect(wrapper.find(".bx--assistive-text").text()).toBe(
      "edit_mode.draft_status.saving_in_progress"
    );
  });

  it("renders a DraftChangesStatus with state = error", async () => {
    const errorMessage = "Custom error message";
    const wrapper = mount(DraftChangesStatus, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        state: "error",
        errorMessage,
      },
    });

    expect(wrapper.find(".draft-changes-status.error").exists()).toBeTruthy();
    expect(wrapper.find(".status-message").text()).toBe(
      "edit_mode.draft_status.error"
    );
    expect(wrapper.find(".bx--assistive-text").text()).toBe(errorMessage);
  });
});
