import { ActionTargetObject, DraftAction } from "@/actions/base/DraftAction";
import { ProcessingTreeNodeDetailsDto } from "@/store/tornado";
import { addNode } from "@/api/api";
import { AxiosResponse } from "axios";

export class AddNodeAction extends DraftAction {
  private readonly addedNode: ProcessingTreeNodeDetailsDto;
  private readonly nodePath: string[];

  constructor(addedNode: ProcessingTreeNodeDetailsDto, nodePath: string[]) {
    let targetObject: ActionTargetObject;
    if (addedNode.type === "Filter") {
      targetObject = "filter";
    } else {
      targetObject = "ruleset";
    }

    super("add", targetObject);
    this.addedNode = addedNode;
    this.nodePath = nodePath;
  }

  execute(userTenant: string, draftId: string): Promise<AxiosResponse<string>> {
    return addNode(userTenant, draftId, this.nodePath, this.addedNode);
  }
}
