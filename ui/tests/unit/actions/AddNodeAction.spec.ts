import { AddNodeAction } from "@/actions/AddNodeAction";
import { ProcessingTreeNodeDetailsDto } from "@/store/tornado";
import * as api from "@/api/api";
import { AxiosResponse } from "axios";

describe("AddNodeAction.ts", () => {
  const addedNode: ProcessingTreeNodeDetailsDto = {
    type: "Filter",
    name: "filter1",
    description: "filter1 description",
    active: true,
    filter: null,
  };
  const nodePath = ["root", "filter1"];
  const tenant = "root";
  const draftId = "draft_001";

  it("Creates an add node action", () => {
    //Create add action
    const addAction = new AddNodeAction(addedNode, nodePath);

    expect(addAction.getType()).toStrictEqual("add");
    expect(addAction.getTargetObject()).toStrictEqual("filter");
  });

  it("Executes an add node action", async () => {
    //Spy and mock API call
    const addNodeApiCall = jest
      .spyOn(api, "addNode")
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
    //Create add action
    const addAction = new AddNodeAction(addedNode, nodePath);
    //execute the action
    await addAction.execute(tenant, draftId);
    //Checks the API call was performed with the correct parameters
    expect(addNodeApiCall).toHaveBeenCalledWith(
      tenant,
      draftId,
      nodePath,
      addedNode
    );
  });
});
