import { createLocalVue, mount } from "@vue/test-utils";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("ConfirmationModal.vue", () => {
  it("renders an opened Confirmation Modal", async () => {
    const wrapper = mount(ConfirmationModal, {
      mocks: {
        $tc: (a: string) => a,
      },
      localVue,
      propsData: {
        title: "Test Title",
        content: "Sample Content",
        secondaryButtonText: "Secondary Button",
        primaryButtonText: "Primary Button",
      },
    });

    (wrapper.vm as any).showModal();

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
    ).toMatch("Secondary Button");
    expect(
      wrapper
        .find(
          ".cv-button-set.bx--btn-set.bx--modal-footer .cv-button.bx--btn.bx--btn--primary"
        )
        .text()
    ).toMatch("Primary Button");

    wrapper
      .find(
        ".cv-button-set.bx--btn-set.bx--modal-footer .cv-button.bx--btn.bx--btn--secondary"
      )
      .trigger("click");

    expect(wrapper.emitted("secondaryBtnClick")).toBeTruthy();

    wrapper
      .find(
        ".cv-button-set.bx--btn-set.bx--modal-footer .cv-button.bx--btn.bx--btn--primary"
      )
      .trigger("click");
    expect(wrapper.emitted("primaryBtnClick")).toBeTruthy();
  });

  it("renders an opened Confirmation Modal with only primary button", async () => {
    const wrapper = mount(ConfirmationModal, {
      mocks: {
        $tc: (a: string) => a,
      },
      localVue,
      propsData: {
        title: "Test Title",
        content: "Sample Content",
        primaryButtonText: "Primary Button",
      },
    });

    (wrapper.vm as any).showModal();

    await wrapper.vm.$nextTick();

    expect(
      wrapper.find(".cv-modal.bx--modal.is-visible").exists()
    ).toBeTruthy();
    expect(
      wrapper
        .find(
          ".cv-button-set.bx--btn-set.bx--modal-footer .cv-button.bx--btn.bx--btn--secondary"
        )
        .exists()
    ).toBe(false);
    expect(
      wrapper
        .find(
          ".cv-button-set.bx--btn-set.bx--modal-footer .cv-button.bx--btn.bx--btn--primary"
        )
        .text()
    ).toMatch("Primary Button");
  });
});
