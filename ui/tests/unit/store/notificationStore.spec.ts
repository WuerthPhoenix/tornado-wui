import NotificationStore from "@/store/notification";

describe("Mutations", () => {
  it("add error notification", () => {
    NotificationStore.addError({
      title: "Test title",
      message: "Test message",
    });
    expect(NotificationStore.notifications.length).toBe(1);
    expect(NotificationStore.notifications[0].kind).toBe("error");
    expect(NotificationStore.notifications[0].title).toBe("Test title");
    expect(NotificationStore.notifications[0].message).toBe("Test message");
  });

  it("add multiple notifications", () => {
    NotificationStore.addError({
      title: "Test title2",
      message: "Test message2",
    });
    expect(NotificationStore.notifications.length).toBe(2);
  });

  it("add success notification", () => {
    NotificationStore.addSuccess({
      title: "Test title",
      message: "Test message",
    });
    expect(NotificationStore.notifications.length).toBe(3);
    expect(NotificationStore.notifications[2].kind).toBe("success");
    expect(NotificationStore.notifications[2].title).toBe("Test title");
    expect(NotificationStore.notifications[2].message).toBe("Test message");
  });
});
