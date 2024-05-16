import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";
import { getModule } from "vuex-module-decorators";
import store from "@/store";
import { getUserInfo, setProcessingTreeView } from "@/api/api";
import Notification from "@/store/notification";
import i18n from "@/utils/i18n";
import Tornado from "@/store/tornado";

export enum ThemeDto {
  light = "light",
  dark = "dark",
  system = "system",
}

export enum PermissionsDto {
  view = "view",
  edit = "edit",
  test_event_execute_actions = "test_event_execute_actions",
}

export type UserPreferencesDto = {
  language: string;
  theme: ThemeDto;
  timezone: string | null;
  processing_tree_collapsed_view_mode: boolean;
};

export type UserInfoDto = {
  user: string;
  preferences: UserPreferencesDto;
  user_tenants: { [key: string]: PermissionsDto[] };
  system_available_tenants: string[];
};

@Module({ dynamic: true, store: store, name: "User" })
class User extends VuexModule {
  public ROOT_TENANT = "root";
  public info: UserInfoDto | null = null;
  public selectedTenant = "";

  @Mutation
  setInfo(info: UserInfoDto | null) {
    this.info = info;
    if (this.info !== null) {
      const tenants = Object.keys(this.info.user_tenants);
      if (tenants.length) {
        this.selectedTenant = tenants[0];
      }
    }
  }

  @Action
  async updateInfo() {
    let info = null;
    try {
      const response = await getUserInfo();
      if (response.status === 200) {
        info = response.data;
      } else {
        Notification.addError({
          title: response.status.toString(),
          message: response.statusText,
        });
      }
    } catch (error) {
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: error.toString(),
      });
    }

    this.setInfo(info);
  }

  @Action
  async updateProcessingTreeView(processingViewCollapsed: boolean) {
    try {
      const response = await setProcessingTreeView(processingViewCollapsed);
      if (response.status !== 200) {
        Notification.addError({
          title: response.status.toString(),
          message: response.statusText,
        });
      }
    } catch (error) {
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: error.toString(),
      });
    }
  }

  @Mutation
  async setSelectedTenant(tenant: string) {
    this.selectedTenant = tenant;
    Tornado.setProcessedEvent(null);
  }

  get userSelectedTenantPermissions(): string[] {
    if (this.info) {
      return this.info.user_tenants[this.selectedTenant];
    }
    return [];
  }

  get userHasEditPermissionInTenant(): boolean {
    return this.userSelectedTenantPermissions.includes(PermissionsDto.edit);
  }
}

const moduleInstance = getModule(User);
export default moduleInstance;
