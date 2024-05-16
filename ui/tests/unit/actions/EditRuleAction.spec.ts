import { RuleCompleteDto } from "@/store/tornado";
import * as api from "@/api/api";
import { AxiosResponse } from "axios";
import { EditRuleAction } from "@/actions/EditRuleAction";
import { RuleDto } from "tornado-backend-dto";

describe("EditRuleAction.ts", () => {
  const oldRule: RuleCompleteDto = {
    name: "rule",
    description: "This is a rule",
    continue: true,
    active: true,
    actions: [],
    operators_extractors_actions: {
      where: {
        type: "AND",
        operators: [
          {
            type: "equals",
            first: "foo",
            second: "bar",
          },
        ],
      },
      with: [],
      actions: [],
    },
  };
  const editedRule: RuleDto = {
    name: "rule1",
    description: "This is a rule",
    continue: true,
    active: true,
    constraint: {
      WHERE: null,
      WITH: {},
    },
    actions: [],
  };
  const nodePath = ["root", "ruleset1"];
  const tenant = "root";
  const draftId = "draft_001";

  it("Creates an edit rule action", () => {
    //Create edit action
    const editAction = new EditRuleAction(editedRule, oldRule, nodePath);

    expect(editAction.getType()).toStrictEqual("edit");
    expect(editAction.getTargetObject()).toStrictEqual("rule");
  });

  it("Executes an edit rule action", async () => {
    //Spy and mock API call
    const editNodeApiCall = jest
      .spyOn(api, "editRule")
      .mockImplementation((): Promise<AxiosResponse<string>> => {
        const resp: AxiosResponse<string> = {
          data: "",
          status: 200,
          statusText: "OK",
          headers: "",
          config: {},
        };
        return Promise.resolve(resp);
      });
    //Create edit action
    const editAction = new EditRuleAction(editedRule, oldRule, nodePath);
    //execute the action
    await editAction.execute(tenant, draftId);
    //Checks the API call was performed with the correct parameters
    expect(editNodeApiCall).toHaveBeenCalledWith(
      tenant,
      draftId,
      nodePath,
      editedRule,
      oldRule
    );
  });
});
