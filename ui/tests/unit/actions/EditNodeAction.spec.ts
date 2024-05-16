import { EditNodeAction } from "@/actions/EditNodeAction";
import { ProcessingTreeNodeDetailsDto } from "@/store/tornado";
import * as api from "@/api/api";
import { AxiosResponse } from "axios";

describe("EditNodeAction.ts", () => {
  const editedNode: ProcessingTreeNodeDetailsDto = {
    type: "Filter",
    name: "filter1",
    description: "filter1 new description",
    active: true,
    filter: null,
  };
  const nodePath = ["root", "filter1"];
  const tenant = "root";
  const draftId = "draft_001";

  it("Creates an edit filter action", () => {
    //Create edit action
    const editAction = new EditNodeAction(editedNode, nodePath);

    expect(editAction.getType()).toStrictEqual("edit");
    expect(editAction.getTargetObject()).toStrictEqual("filter");
  });

  it("Executes an edit filter action", async () => {
    //Spy and mock API call
    const editNodeApiCall = jest
      .spyOn(api, "editNode")
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
    const editAction = new EditNodeAction(editedNode, nodePath);
    //execute the action
    await editAction.execute(tenant, draftId);
    //Checks the API call was performed with the correct parameters
    expect(editNodeApiCall).toHaveBeenCalledWith(
      tenant,
      draftId,
      nodePath,
      editedNode
    );
  });
});
