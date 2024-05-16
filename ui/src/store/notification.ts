import { Module, VuexModule, Mutation } from "vuex-module-decorators";
import { getModule } from "vuex-module-decorators";
import store from "@/store";

export type NotificationDto = {
  title: string;
  message: string;
  kind: "error" | "info" | "success" | "warning";
  id: number;
};

@Module({ dynamic: true, store: store, name: "NotificationStore" })
class NotificationStore extends VuexModule {
  public notifications: NotificationDto[] = [];
  private uniqueId = 0;
  public isPreviewFeedbackBannerVisible = true;

  @Mutation
  addError(notification: { title: string; message: string }) {
    moduleInstance.incrementUniqueID();

    moduleInstance.addNotification({
      title: notification.title,
      message: notification.message,
      kind: "error",
      id: this.uniqueId,
    });
  }

  @Mutation
  addSuccess(notification: { title: string; message: string }) {
    moduleInstance.incrementUniqueID();

    moduleInstance.addNotification({
      title: notification.title,
      message: notification.message,
      kind: "success",
      id: this.uniqueId,
    });
  }

  @Mutation
  addInfo(notification: { title: string; message: string }) {
    moduleInstance.incrementUniqueID();

    moduleInstance.addNotification({
      title: notification.title,
      message: notification.message,
      kind: "info",
      id: this.uniqueId,
    });
  }

  @Mutation
  addNotification(notification: NotificationDto) {
    this.notifications.push(notification);
  }

  @Mutation
  removeNotification(notification: NotificationDto) {
    this.notifications = this.notifications.filter((notificationFromList) => {
      return notificationFromList.id !== notification.id;
    });
  }

  @Mutation
  private incrementUniqueID() {
    this.uniqueId++;
  }

  @Mutation
  hidePreviewFeedbackBanner() {
    this.isPreviewFeedbackBannerVisible = false;
  }
}

const moduleInstance = getModule(NotificationStore);
export default moduleInstance;
