import { ActionTargetObject, DraftAction } from "@/actions/base/DraftAction";
import { deleteNode } from "@/api/api";
import { AxiosResponse } from "axios";

export class DeleteNodeAction extends DraftAction {
  private readonly nodePath: string[];

  constructor(nodePath: string[], targetObject: ActionTargetObject) {
    super("delete", targetObject);
    this.nodePath = nodePath;
  }

  execute(userTenant: string, draftId: string): Promise<AxiosResponse<string>> {
    return deleteNode(userTenant, draftId, this.nodePath);
  }
}
