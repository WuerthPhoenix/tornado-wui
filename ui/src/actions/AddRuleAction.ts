import { DraftAction } from "@/actions/base/DraftAction";
import { addRule } from "@/api/api";
import { AxiosResponse } from "axios";
import { RuleDto } from "tornado-backend-dto";

export class AddRuleAction extends DraftAction {
  private readonly addedRule: RuleDto;
  private readonly nodePath: string[];

  constructor(addedRule: RuleDto, nodePath: string[]) {
    super("add", "rule");
    this.addedRule = addedRule;
    this.nodePath = nodePath;
  }

  execute(userTenant: string, draftId: string): Promise<AxiosResponse<string>> {
    return addRule(userTenant, draftId, this.nodePath, this.addedRule);
  }
}
