import { AxiosResponse } from "axios";

export type ActionType = "add" | "delete" | "edit" | "reorder";

export type ActionTargetObject = "filter" | "ruleset" | "rule";

export abstract class DraftAction {
  protected type: ActionType;
  protected targetObject: ActionTargetObject;

  protected constructor(type: ActionType, targetObject: ActionTargetObject) {
    this.type = type;
    this.targetObject = targetObject;
  }

  abstract execute(
    userTenant: string,
    draftId: string
  ): Promise<AxiosResponse<string>>;

  public getType(): ActionType {
    return this.type;
  }

  public getTargetObject(): ActionTargetObject {
    return this.targetObject;
  }
}
