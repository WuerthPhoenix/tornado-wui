import { createLocalVue, mount } from "@vue/test-utils";
import ImportNodeModal from "@/components/processing_tree/ImportNodeModal.vue";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("ImportNodeModal.vue", () => {
  it("renders an opened Import Node Modal", async () => {
    const wrapper = mount(ImportNodeModal, {
      mocks: {
        $tc: (a: string) => a,
      },
      localVue,
      propsData: {
        title: "Test Title",
        content: "Sample Content",
        showWarning: true,
      },
    });

    (wrapper.vm as any).onPropertyChange(true);

    await wrapper.vm.$nextTick();

    expect(
      wrapper.find(".cv-modal.bx--modal.is-visible").exists()
    ).toBeTruthy();
    expect(
      wrapper.find(".bx--modal-container.bx--modal-container--xs").exists()
    ).toBeTruthy();
    expect(
      wrapper
        .find(
          ".bx--modal-container.bx--modal-container--xs .bx--modal-header .bx--modal-header__heading"
        )
        .text()
    ).toMatch("Test Title");
    expect(
      wrapper.find(
        ".bx--modal-container.bx--modal-container--xs .bx--modal-content .warning-icon"
      )
    ).toBeDefined();
    expect(
      wrapper
        .find(
          ".bx--modal-container.bx--modal-container--xs .bx--modal-content p"
        )
        .text()
    ).toMatch("Sample Content");
    expect(
      wrapper
        .find(
          ".cv-button-set.bx--btn-set.bx--modal-footer .cv-button.bx--btn.bx--btn--secondary"
        )
        .text()
    ).toMatch("test_window.cancel");
    expect(
      wrapper
        .find(
          ".cv-button-set.bx--btn-set.bx--modal-footer .cv-button.bx--btn.bx--btn--primary"
        )
        .text()
    ).toMatch("views.processing_tree.import_modal_add_file_button");
    expect(
      wrapper
        .find(
          ".cv-button-set.bx--btn-set.bx--modal-footer .cv-button.bx--btn.bx--btn--primary"
        )
        .attributes("disabled")
    ).toBeDefined();
  });

  it("renders an Import Node Modal with loaded files", async () => {
    const wrapper = mount(ImportNodeModal, {
      mocks: {
        $tc: (a: string) => a,
      },
      localVue,
      propsData: {
        title: "Test Title",
        content: "Sample Content",
        showWarning: true,
      },
    });

    (wrapper.vm as any).onPropertyChange(true);

    const str = JSON.stringify([{ name: "test user" }]);
    const blob = new Blob([str]);
    const file = new File([blob], "values.json", {
      type: "application/JSON",
    });

    await wrapper.vm.$nextTick();

    (wrapper.vm.$refs.fileUploader as any).addFiles([file]);

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".cv-button-set.bx--btn-set.bx--modal-footer .cv-button.bx--btn.bx--btn--primary"
        )
        .text()
    ).toMatch("views.processing_tree.import_modal_import_file_button");

    expect(
      wrapper
        .find(
          ".cv-button-set.bx--btn-set.bx--modal-footer .cv-button.bx--btn.bx--btn--primary"
        )
        .attributes("disabled")
    ).toBeFalsy();
  });
});
