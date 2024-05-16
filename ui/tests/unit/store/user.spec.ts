import User, { PermissionsDto, ThemeDto, UserInfoDto } from "@/store/user";

const viewUserInfo: UserInfoDto = {
  user: "TestUser",
  user_tenants: {
    tenantA: [PermissionsDto.view],
    tenantB: [PermissionsDto.view],
  },
  preferences: {
    language: "en_US",
    theme: ThemeDto.dark,
    timezone: "Europe/Rome",
    processing_tree_collapsed_view_mode: false,
  },
  system_available_tenants: ["tenantA", "tenantB"],
};
const editUserInfo: UserInfoDto = {
  user: "TestUser",
  user_tenants: {
    admin: [PermissionsDto.view, PermissionsDto.edit],
  },
  preferences: {
    language: "en_US",
    theme: ThemeDto.dark,
    timezone: "Europe/Rome",
    processing_tree_collapsed_view_mode: false,
  },
  system_available_tenants: ["admin"],
};

const viewAndEventsFullProcessUserInfo: UserInfoDto = {
  user: "TestUser",
  user_tenants: {
    admin: [PermissionsDto.view, PermissionsDto.test_event_execute_actions],
  },
  preferences: {
    language: "en_US",
    theme: ThemeDto.dark,
    timezone: "Europe/Rome",
    processing_tree_collapsed_view_mode: false,
  },
  system_available_tenants: ["admin"],
};

describe("Mutations", () => {
  it("assign null config to right property", () => {
    User.setInfo(null);
    expect(User.info).toBe(null);
  });
  it("assign view user to right property", () => {
    User.setInfo(viewUserInfo);
    expect(User.info).toBe(viewUserInfo);
  });
  it("assign view/edit user to right property", () => {
    User.setInfo(editUserInfo);
    expect(User.info).toBe(editUserInfo);
  });
  it("assign view and events full process user to right property", () => {
    User.setInfo(viewAndEventsFullProcessUserInfo);
    expect(User.info).toBe(viewAndEventsFullProcessUserInfo);
  });
});

describe("Helpers", () => {
  it("get user permissions with user not yet loaded", () => {
    User.setInfo(null);
    expect(User.userSelectedTenantPermissions).toStrictEqual([]);
  });
  it("get user permissions with user loaded", () => {
    User.setInfo(viewUserInfo);
    User.setSelectedTenant("tenantA");
    expect(User.userSelectedTenantPermissions).toStrictEqual([
      PermissionsDto.view,
    ]);
  });
  it("check user has edit permission with user not yet loaded", () => {
    User.setInfo(null);
    expect(User.userHasEditPermissionInTenant).toBeFalsy();
  });
  it("check user has edit permission with user loaded without permission", () => {
    User.setInfo(viewUserInfo);
    User.setSelectedTenant("tenantA");
    expect(User.userHasEditPermissionInTenant).toBeFalsy();
  });
  it("check user has edit permission with user loaded with permission", () => {
    User.setInfo(editUserInfo);
    User.setSelectedTenant("admin");
    expect(User.userHasEditPermissionInTenant).toBeTruthy();
  });
});
