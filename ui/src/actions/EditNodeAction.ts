import { ActionTargetObject, DraftAction } from "@/actions/base/DraftAction";
import { ProcessingTreeNodeDetailsDto } from "@/store/tornado";
import { editNode } from "@/api/api";
import { AxiosResponse } from "axios";

export class EditNodeAction extends DraftAction {
  private readonly editedNode: ProcessingTreeNodeDetailsDto;
  private readonly nodePath: string[];

  constructor(editedNode: ProcessingTreeNodeDetailsDto, nodePath: string[]) {
    let targetObjectType: ActionTargetObject;
    if (editedNode.type === "Filter") {
      targetObjectType = "filter";
    } else {
      targetObjectType = "ruleset";
    }
    super("edit", targetObjectType);
    this.editedNode = editedNode;
    this.nodePath = nodePath;
  }

  execute(userTenant: string, draftId: string): Promise<AxiosResponse<string>> {
    return editNode(userTenant, draftId, this.nodePath, this.editedNode);
  }
}
