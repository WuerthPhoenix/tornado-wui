import { DraftAction } from "@/actions/base/DraftAction";
import { reorderRule } from "@/api/api";
import { AxiosResponse } from "axios";
import { RulePositionDto } from "tornado-backend-dto";

export class ReorderRuleAction extends DraftAction {
  private readonly name: string;
  private readonly newIndex: RulePositionDto;
  private readonly nodePath: string[];

  constructor(name: string, newIndex: number, nodePath: string[]) {
    super("reorder", "rule");
    this.name = name;
    this.nodePath = nodePath;
    this.newIndex = { position: newIndex };
  }

  execute(userTenant: string, draftId: string): Promise<AxiosResponse<string>> {
    return reorderRule(
      userTenant,
      draftId,
      this.nodePath,
      this.name,
      this.newIndex
    );
  }
}
