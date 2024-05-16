import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import { NotificationDto } from "@/store/notification";
import Notification from "@/components/notifications/Notification.vue";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("Notification.vue", () => {
  it("renders a notification", () => {
    const notification: NotificationDto = {
      title: "Error title",
      message: "Error message",
      kind: "error",
      id: 1,
    };

    const wrapper = mount(Notification, {
      propsData: {
        notification,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    expect(
      wrapper
        .find(".notification .cv-notification .bx--toast-notification__title")
        .text()
    ).toMatch(notification.title);

    expect(
      wrapper
        .find(".notification .cv-notification .bx--toast-notification__caption")
        .text()
    ).toMatch(notification.message);
  });

  it("renders a hidden notification", () => {
    const notification: NotificationDto = {
      title: "Error title",
      message: "Error message",
      kind: "error",
      id: 2,
    };

    const wrapper = mount(Notification, {
      propsData: {
        notification,
      },
      localVue,
      data() {
        return {
          isVisible: false,
        };
      },
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    expect(wrapper.find(".notification .cv-notifiation").exists()).toBeFalsy();
  });
});
