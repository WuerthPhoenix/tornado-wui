import { DraftAction } from "@/actions/base/DraftAction";
import { deleteRule } from "@/api/api";
import { AxiosResponse } from "axios";

export class DeleteRuleAction extends DraftAction {
  private readonly ruleNameToDelete: string;
  private readonly nodePath: string[];

  constructor(ruleName: string, nodePath: string[]) {
    super("delete", "rule");
    this.ruleNameToDelete = ruleName;
    this.nodePath = nodePath;
  }

  execute(userTenant: string, draftId: string): Promise<AxiosResponse<string>> {
    return deleteRule(
      userTenant,
      draftId,
      this.nodePath,
      this.ruleNameToDelete
    );
  }
}
