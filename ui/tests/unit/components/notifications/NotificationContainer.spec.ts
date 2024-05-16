import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import NotificationContainer from "@/components/notifications/NotificationContainer.vue";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("NotificationContainer.vue", () => {
  it("renders a notification container", () => {
    const wrapper = mount(NotificationContainer, {
      propsData: {},
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    expect(wrapper.find(".notification-container").exists()).toBeTruthy();
  });
});
