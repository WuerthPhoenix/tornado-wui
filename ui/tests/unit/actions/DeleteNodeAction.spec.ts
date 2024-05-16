import { DeleteNodeAction } from "@/actions/DeleteNodeAction";
import * as api from "@/api/api";
import { AxiosResponse } from "axios";

describe("DeleteNodeAction.ts", () => {
  const nodePath = ["root", "filter1"];
  const tenant = "root";
  const draftId = "draft_001";

  it("Creates a delete filter action", () => {
    //Create add action
    const addAction = new DeleteNodeAction(nodePath, "filter");

    expect(addAction.getType()).toStrictEqual("delete");
    expect(addAction.getTargetObject()).toStrictEqual("filter");
  });

  it("Executes a delete filter action", async () => {
    //Spy and mock API call
    const deleteNodeApiCall = jest
      .spyOn(api, "deleteNode")
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
    //Create delete action
    const deleteAction = new DeleteNodeAction(nodePath, "filter");
    //execute the action
    await deleteAction.execute(tenant, draftId);
    //Checks the API call was performed with the correct parameters
    expect(deleteNodeApiCall).toHaveBeenCalledWith(tenant, draftId, nodePath);
  });

  it("Creates a delete ruleset action", () => {
    //Create add action
    const addAction = new DeleteNodeAction(nodePath, "ruleset");

    expect(addAction.getType()).toStrictEqual("delete");
    expect(addAction.getTargetObject()).toStrictEqual("ruleset");
  });

  it("Executes a delete ruleset action", async () => {
    //Spy and mock API call
    const deleteNodeApiCall = jest
      .spyOn(api, "deleteNode")
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
    //Create delete action
    const deleteAction = new DeleteNodeAction(nodePath, "ruleset");
    //execute the action
    await deleteAction.execute(tenant, draftId);
    //Checks the API call was performed with the correct parameters
    expect(deleteNodeApiCall).toHaveBeenCalledWith(tenant, draftId, nodePath);
  });
});
