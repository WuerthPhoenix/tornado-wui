import { DraftAction } from "@/actions/base/DraftAction";
import { editRule } from "@/api/api";
import { AxiosResponse } from "axios";
import { RuleDto } from "tornado-backend-dto";
import { RuleCompleteDto } from "@/store/tornado";

export class EditRuleAction extends DraftAction {
  private readonly editedRule: RuleDto;
  private readonly oldRule: RuleCompleteDto;
  private readonly nodePath: string[];

  constructor(
    addedRule: RuleDto,
    oldRule: RuleCompleteDto,
    nodePath: string[]
  ) {
    super("edit", "rule");
    this.editedRule = addedRule;
    this.nodePath = nodePath;
    this.oldRule = oldRule;
  }

  execute(userTenant: string, draftId: string): Promise<AxiosResponse<string>> {
    return editRule(
      userTenant,
      draftId,
      this.nodePath,
      this.editedRule,
      this.oldRule
    );
  }
}
