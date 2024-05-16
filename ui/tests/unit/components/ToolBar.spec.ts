import { createLocalVue, mount } from "@vue/test-utils";
import ToolBar from "@/components/ToolBar.vue";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import VueRouter from "vue-router";
import Tornado from "@/store/tornado";
import User, { PermissionsDto, ThemeDto } from "@/store/user";
import { AddNodeAction } from "@/actions/AddNodeAction";
import i18n from "@/utils/i18n";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);
localVue.use(VueRouter);

const router = new VueRouter();

const userInfo = {
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
};

const mock = jest.spyOn(i18n, "tc");
mock.mockImplementation((a) => a);

describe("ToolBar.vue", () => {
  router.push("/");

  it("renders a ToolBar in loading state", () => {
    const wrapper = mount(ToolBar, {
      localVue,
      router,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {
        isUserLoaded() {
          return false;
        },
      },
    });

    expect(
      wrapper
        .find(".tool-bar .tenant-selector-container .tenant-loading")
        .exists()
    ).toBeTruthy();

    expect(wrapper.find(".edit-mode-options").exists()).toBeFalsy();
  });

  it("renders a ToolBar with user loaded", () => {
    const wrapper = mount(ToolBar, {
      localVue,
      router,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {
        isUserLoaded() {
          return true;
        },
        tenants() {
          return ["admins", "tenantA"];
        },
        selectedRole() {
          return "admins";
        },
      },
    });

    expect(
      wrapper.find(".tool-bar .tenant-selector-container .bx--label").text()
    ).toMatch("app.current_tenant");

    expect(
      wrapper
        .find(".tool-bar .tenant-selector-container .bx--dropdown")
        .exists()
    ).toBeTruthy();

    expect(
      wrapper.findAll(
        ".tool-bar .tenant-selector-container .bx--dropdown .cv-dropdown-item"
      ).length
    ).toBe(2);

    expect(
      wrapper
        .find(
          ".tool-bar .tenant-selector-container .bx--dropdown .cv-dropdown-item[data-value='admins']"
        )
        .exists()
    ).toBeTruthy();

    expect(
      wrapper
        .find(
          ".tool-bar .tenant-selector-container .bx--dropdown .cv-dropdown-item[data-value='tenantA']"
        )
        .exists()
    ).toBeTruthy();

    expect(wrapper.find(".edit-mode-options").exists()).toBeFalsy();
  });

  router.push("/tree");

  it("renders a loaded ToolBar with the processing tree opened (no edit permission) ", () => {
    User.setInfo({
      user: "root",
      preferences: {
        language: "en_US",
        theme: ThemeDto.dark,
        timezone: "Europe/Rome",
        processing_tree_collapsed_view_mode: false,
      },
      user_tenants: {
        root: [PermissionsDto.view],
      },
      system_available_tenants: ["root"],
    });

    User.setSelectedTenant(User.ROOT_TENANT);

    const wrapper = mount(ToolBar, {
      localVue,
      router,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {
        isUserLoaded() {
          return true;
        },
        processingTreeIsOpen() {
          return true;
        },
      },
    });

    expect(wrapper.find(".edit-mode-options").exists()).toBeFalsy();
  });

  it("renders a loaded ToolBar with the processing tree opened (edit permission) ", async () => {
    User.setInfo(userInfo);

    await User.setSelectedTenant(User.ROOT_TENANT);

    const wrapper = mount(ToolBar, {
      localVue,
      router,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {
        isUserLoaded() {
          return true;
        },
        processingTreeIsOpen() {
          return true;
        },
      },
    });

    expect(wrapper.find(".edit-mode-options").exists()).toBeTruthy();

    expect(
      wrapper
        .find(
          ".tool-bar .edit-mode-options .edit-mode-switch-container .edit-mode-text"
        )
        .text()
    ).toContain("edit_mode.edit_mode");

    expect(
      wrapper
        .find(
          ".tool-bar .edit-mode-options .edit-mode-switch-container .on-off-label"
        )
        .text()
    ).toContain("edit_mode.off");

    expect(
      wrapper
        .find(
          ".tool-bar .edit-mode-options .edit-mode-switch-container .edit-mode-switch .bx--toggle-input"
        )
        .attributes("aria-checked")
    ).toMatch("false");

    expect(
      wrapper.findAll(".tool-bar .edit-mode-options .edit-mode-button")
    ).toHaveLength(0);

    const getDraftSpy = jest.spyOn(Tornado, "getDraft");

    wrapper
      .find(
        ".tool-bar .edit-mode-options .edit-mode-switch-container .edit-mode-switch .bx--toggle__switch"
      )
      .trigger("click");

    expect(getDraftSpy).toHaveBeenCalled();
    Tornado.setCurrentEditMode(true);

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".tool-bar .edit-mode-options .edit-mode-switch-container .edit-mode-switch .bx--toggle-input"
        )
        .attributes("aria-checked")
    ).toMatch("true");

    expect(
      wrapper
        .find(
          ".tool-bar .edit-mode-options .edit-mode-switch-container .on-off-label"
        )
        .text()
    ).toContain("edit_mode.on");

    expect(
      wrapper.findAll(".tool-bar .edit-mode-options .edit-mode-button")
    ).toHaveLength(2);

    expect(
      wrapper
        .find(
          ".tool-bar .tenant-selector-container .bx--dropdown__wrapper .bx--label:not(.bx--label--disabled)"
        )
        .exists()
    ).toBeTruthy();

    expect(
      wrapper
        .find(
          ".tool-bar .tenant-selector-container .bx--dropdown__wrapper .bx--dropdown:not(.bx--dropdown--disabled)"
        )
        .exists()
    ).toBeTruthy();

    expect(
      wrapper
        .find(
          ".tool-bar .edit-mode-options .draft-changes-status.saved .status-message"
        )
        .text()
    ).toStrictEqual("edit_mode.draft_status.saved");
  });

  it("renders a loaded toolbar in edit mode with unsaved changes", async () => {
    User.setInfo(userInfo);

    await User.setSelectedTenant(User.ROOT_TENANT);

    const wrapper = mount(ToolBar, {
      localVue,
      router,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {
        isUserLoaded() {
          return true;
        },
        processingTreeIsOpen() {
          return true;
        },
        draftHasPendingChanges() {
          return true;
        },
      },
    });

    Tornado.setCurrentEditMode(true);

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".tool-bar .tenant-selector-container .bx--dropdown__wrapper .bx--label.bx--label--disabled"
        )
        .exists()
    ).toBeTruthy();

    expect(
      wrapper
        .find(
          ".tool-bar .tenant-selector-container .bx--dropdown__wrapper .bx--dropdown.bx--dropdown--disabled"
        )
        .exists()
    ).toBeTruthy();

    expect(
      wrapper
        .find(
          ".tool-bar .edit-mode-options .draft-changes-status.unsaved .status-message"
        )
        .text()
    ).toStrictEqual("edit_mode.draft_status.unsaved_changes");
  });

  it("renders a loaded toolbar in edit mode with unsaved changes and exists edit mode - cancel action", async () => {
    User.setInfo(userInfo);

    await User.setSelectedTenant(User.ROOT_TENANT);

    const wrapper = mount(ToolBar, {
      localVue,
      router,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {
        isUserLoaded() {
          return true;
        },
        processingTreeIsOpen() {
          return true;
        },
      },
    });

    Tornado.setCurrentEditMode(true);
    Tornado.actionsQueue.addAction(
      new AddNodeAction(
        {
          type: "Filter",
          name: "newFilter",
          description: "test description",
          active: true,
          filter: null,
        },
        []
      )
    );

    const saveChangesSpy = jest.spyOn(
      wrapper.vm as ToolBar,
      // @ts-ignore
      "saveDraftChanges"
    );

    await wrapper.vm.$nextTick();

    wrapper
      .find(
        ".tool-bar .edit-mode-options .edit-mode-switch-container .edit-mode-switch .bx--toggle__switch"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper.find(".tool-bar .unsaved-changes-modal").exists()
    ).toBeTruthy();

    wrapper
      .find(".tool-bar .unsaved-changes-modal .bx--btn--secondary")
      .trigger("click");

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(saveChangesSpy).not.toHaveBeenCalled();

    expect(
      wrapper
        .find(
          ".tool-bar .edit-mode-options .edit-mode-switch-container .edit-mode-switch .bx--toggle-input"
        )
        .attributes("aria-checked")
    ).toMatch("true");

    saveChangesSpy.mockClear();
  });

  it("renders a loaded toolbar in edit mode with unsaved changes and exists edit mode - continue action", async () => {
    User.setInfo(userInfo);

    await User.setSelectedTenant(User.ROOT_TENANT);

    const wrapper = mount(ToolBar, {
      localVue,
      router,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {
        isUserLoaded() {
          return true;
        },
        processingTreeIsOpen() {
          return true;
        },
      },
    });

    Tornado.setCurrentEditMode(true);
    Tornado.setCurrentDraftId("draft_001");

    Tornado.actionsQueue.addAction(
      new AddNodeAction(
        {
          type: "Filter",
          name: "newFilter",
          description: "test description",
          active: true,
          filter: null,
        },
        []
      )
    );
    const saveChangesSpy = jest.spyOn(
      wrapper.vm as ToolBar,
      // @ts-ignore
      "saveDraftChanges"
    );

    await wrapper.vm.$nextTick();

    wrapper
      .find(
        ".tool-bar .edit-mode-options .edit-mode-switch-container .edit-mode-switch .bx--toggle__switch"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(".tool-bar .edit-mode-options .unsaved-changes-modal.is-visible")
        .exists()
    ).toBeTruthy();

    wrapper
      .find(
        ".tool-bar .edit-mode-options .unsaved-changes-modal .bx--btn--primary"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(".tool-bar .edit-mode-options .unsaved-changes-modal.is-visible")
        .exists()
    ).toBeFalsy();

    expect(saveChangesSpy).not.toHaveBeenCalled();

    expect(
      wrapper
        .find(
          ".tool-bar .edit-mode-options .edit-mode-switch-container .edit-mode-switch .bx--toggle-input"
        )
        .attributes("aria-checked")
    ).toMatch("false");
  });

  it("renders a loaded toolbar in edit mode and performs saving of changes - success", async () => {
    User.setInfo(userInfo);

    await User.setSelectedTenant(User.ROOT_TENANT);

    const wrapper = mount(ToolBar, {
      localVue,
      router,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {
        isUserLoaded() {
          return true;
        },
        processingTreeIsOpen() {
          return true;
        },
      },
    });

    const executeAllCall = jest
      .spyOn(Tornado.actionsQueue, "executeAll")
      .mockImplementation(async () => {
        await wrapper.vm.$nextTick();
        expect(
          wrapper
            .find(".tool-bar .edit-mode-options .draft-changes-status.saving")
            .exists()
        ).toBeTruthy();
        Tornado.actionsQueue.empty();
        return Promise.resolve();
      });

    Tornado.setCurrentEditMode(true);
    Tornado.setCurrentDraftId("draft_001");

    Tornado.actionsQueue.addAction(
      new AddNodeAction(
        {
          type: "Filter",
          name: "newFilter",
          description: "test description",
          active: true,
          filter: null,
        },
        []
      )
    );

    await wrapper.vm.$nextTick();

    expect(
      wrapper.find(".tool-bar .edit-mode-options .save-draft").exists()
    ).toBeTruthy();

    wrapper.find(".tool-bar .edit-mode-options .save-draft").trigger("click");

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(".tool-bar .edit-mode-options .draft-changes-status.saved")
        .exists()
    ).toBeTruthy();

    executeAllCall.mockRestore();
  });

  it("renders a loaded toolbar in edit mode and performs saving of changes - failure", async () => {
    User.setInfo(userInfo);

    await User.setSelectedTenant(User.ROOT_TENANT);

    const wrapper = mount(ToolBar, {
      localVue,
      router,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {
        isUserLoaded() {
          return true;
        },
        processingTreeIsOpen() {
          return true;
        },
      },
    });

    const executeAllCall = jest
      .spyOn(Tornado.actionsQueue, "executeAll")
      .mockImplementation(async () => {
        await wrapper.vm.$nextTick();
        expect(
          wrapper
            .find(".tool-bar .edit-mode-options .draft-changes-status.saving")
            .exists()
        ).toBeTruthy();
        return Promise.reject({ message: "Network error" });
      });

    Tornado.setCurrentEditMode(true);
    Tornado.setCurrentDraftId("draft_001");

    Tornado.actionsQueue.addAction(
      new AddNodeAction(
        {
          type: "Filter",
          name: "newFilter",
          description: "test description",
          active: true,
          filter: null,
        },
        []
      )
    );

    await wrapper.vm.$nextTick();

    expect(
      wrapper.find(".tool-bar .edit-mode-options .save-draft").exists()
    ).toBeTruthy();

    wrapper.find(".tool-bar .edit-mode-options .save-draft").trigger("click");

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(".tool-bar .edit-mode-options .draft-changes-status.error")
        .exists()
    ).toBeTruthy();

    executeAllCall.mockRestore();
  });

  it("renders a draft deploy", async () => {
    User.setInfo(userInfo);

    await User.setSelectedTenant(User.ROOT_TENANT);

    const wrapper = mount(ToolBar, {
      localVue,
      router,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {
        isUserLoaded() {
          return true;
        },
        processingTreeIsOpen() {
          return true;
        },
      },
    });

    expect(wrapper.find(".edit-mode-options").exists()).toBeTruthy();
    expect(
      wrapper
        .find(
          ".cv-button.edit-mode-button.deploy-draft.bx--btn.bx--btn--ghost.bx--btn--sm"
        )
        .exists()
    ).toBeTruthy;

    wrapper
      .find(
        ".cv-button.edit-mode-button.deploy-draft.bx--btn.bx--btn--ghost.bx--btn--sm"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(".confirm-draft-deploy-modal.cv-modal.bx--modal.is-visible")
        .exists()
    ).toBeTruthy();
    expect(
      wrapper
        .find(
          ".confirm-draft-deploy-modal .bx--modal-container.bx--modal-container--xs .bx--modal-header .bx--modal-header__heading"
        )
        .text()
    ).toMatch("edit_mode.confirm_deploy_modal.title");
    expect(
      wrapper
        .find(
          ".confirm-draft-deploy-modal .bx--modal-container.bx--modal-container--xs .bx--modal-content p"
        )
        .text()
    ).toMatch("edit_mode.confirm_deploy_modal.content");
    expect(
      wrapper
        .find(
          ".confirm-draft-deploy-modal .cv-button-set.bx--btn-set.bx--modal-footer .cv-button.bx--btn.bx--btn--secondary"
        )
        .text()
    ).toMatch("test_window.cancel");
    expect(
      wrapper
        .find(
          ".confirm-draft-deploy-modal .cv-button-set.bx--btn-set.bx--modal-footer .cv-button.bx--btn.bx--btn--primary"
        )
        .text()
    ).toMatch("edit_mode.confirm_deploy_modal.deploy_draft");

    const deployDraftSpy = jest.spyOn(Tornado, "deployDraft");
    const saveDraftChangesMock = jest
      // @ts-ignore
      .spyOn(wrapper.vm as ToolBar, "saveDraftChanges")
      .mockImplementation(() => {
        return Promise.resolve(true);
      });

    wrapper
      .find(".confirm-draft-deploy-modal .cv-button.bx--btn.bx--btn--primary")
      .trigger("click");

    await wrapper.vm.$nextTick();
    expect(deployDraftSpy).toHaveBeenCalled();

    saveDraftChangesMock.mockRestore();
  });

  it("renders a delete draft", async () => {
    User.setInfo(userInfo);

    await User.setSelectedTenant(User.ROOT_TENANT);

    const wrapper = mount(ToolBar, {
      localVue,
      router,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {
        isUserLoaded() {
          return true;
        },
        processingTreeIsOpen() {
          return true;
        },
      },
    });

    expect(wrapper.find(".edit-mode-options").exists()).toBeTruthy();
    expect(
      wrapper
        .find(
          ".cv-button.edit-mode-button.left-margin-button.delete-draft-confirmation.bx--btn.bx--btn--ghost.bx--btn--sm"
        )
        .exists()
    ).toBeTruthy;

    wrapper
      .find(
        ".cv-button.edit-mode-button.left-margin-button.delete-draft-confirmation.bx--btn.bx--btn--ghost.bx--btn--sm"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(".delete-draft-confirmation-modal.cv-modal.bx--modal.is-visible")
        .exists()
    ).toBeTruthy();
    expect(
      wrapper
        .find(
          ".delete-draft-confirmation-modal .bx--modal-container.bx--modal-container--xs .bx--modal-header .bx--modal-header__heading"
        )
        .text()
    ).toMatch("edit_mode.delete_draft_confirmation_modal.title");
    expect(
      wrapper
        .find(
          ".delete-draft-confirmation-modal .bx--modal-container.bx--modal-container--xs .bx--modal-content p"
        )
        .text()
    ).toMatch("edit_mode.delete_draft_confirmation_modal.content");
    expect(
      wrapper
        .find(
          ".delete-draft-confirmation-modal .cv-button-set.bx--btn-set.bx--modal-footer .cv-button.bx--btn.bx--btn--secondary"
        )
        .text()
    ).toMatch("test_window.cancel");
    expect(
      wrapper
        .find(
          ".delete-draft-confirmation-modal .cv-button-set.bx--btn-set.bx--modal-footer .cv-button.bx--btn.bx--btn--primary"
        )
        .text()
    ).toMatch("views.processing_tree.delete");

    const deleteDraftSpy = jest.spyOn(Tornado, "deleteDraft");

    wrapper
      .find(
        ".delete-draft-confirmation-modal .cv-button.bx--btn.bx--btn--primary"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(deleteDraftSpy).toHaveBeenCalled();
  });

  it("renders a takeover draft modal", async () => {
    User.setInfo(userInfo);

    await User.setSelectedTenant(User.ROOT_TENANT);

    const wrapper = mount(ToolBar, {
      localVue,
      router,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {
        isUserLoaded() {
          return true;
        },
        processingTreeIsOpen() {
          return true;
        },
      },
    });

    (wrapper.vm as any).showTakeoverModal();
    await wrapper.vm.$nextTick();
    expect(
      wrapper
        .find(
          ".takeover-draft-confirmation-modal.cv-modal.bx--modal.is-visible"
        )
        .exists()
    ).toBeTruthy();
    expect(
      wrapper
        .find(
          ".takeover-draft-confirmation-modal .bx--modal-container.bx--modal-container--xs .bx--modal-header .bx--modal-header__heading"
        )
        .text()
    ).toMatch("edit_mode.takeover_draft_confirmation_modal.title");
    expect(
      wrapper
        .find(
          ".takeover-draft-confirmation-modal .bx--modal-container.bx--modal-container--xs .bx--modal-content p"
        )
        .text()
    ).toMatch("edit_mode.takeover_draft_confirmation_modal.content");
    expect(
      wrapper
        .find(
          ".takeover-draft-confirmation-modal .cv-button-set.bx--btn-set.bx--modal-footer .cv-button.bx--btn.bx--btn--secondary"
        )
        .text()
    ).toMatch("test_window.cancel");
    expect(
      wrapper
        .find(
          ".takeover-draft-confirmation-modal .cv-button-set.bx--btn-set.bx--modal-footer .cv-button.bx--btn.bx--btn--primary"
        )
        .text()
    ).toMatch("views.processing_tree.continue");

    const takeoverDraftSpy = jest.spyOn(Tornado, "takeoverDraft");

    wrapper
      .find(
        ".takeover-draft-confirmation-modal .cv-button.bx--btn.bx--btn--primary"
      )
      .trigger("click");

    await wrapper.vm.$nextTick();

    expect(takeoverDraftSpy).toHaveBeenCalled();
  });
});
