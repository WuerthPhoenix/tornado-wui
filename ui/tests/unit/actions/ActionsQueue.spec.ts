import { ProcessingTreeNodeDetailsDto } from "@/store/tornado";
import { ActionsQueue } from "@/actions/ActionsQueue";
import { AddNodeAction } from "@/actions/AddNodeAction";
import { AxiosResponse } from "axios";
import * as api from "@/api/api";

describe("ActionsQueue.ts", () => {
  const addedNode: ProcessingTreeNodeDetailsDto = {
    type: "Filter",
    name: "filter1",
    description: "filter1 description",
    active: true,
    filter: null,
  };
  const nodePath = ["root", "filter1"];
  const childNodePath = ["root", "filter1", "filter1"];
  const tenant = "root";
  const draftId = "draft_001";

  it("Creates an empty actions queue", async () => {
    const actionsQueue = new ActionsQueue();

    expect(actionsQueue.isEmpty()).toBeTruthy();
  });

  it("Retrieves the first action in the queue", async () => {
    const actionsQueue = new ActionsQueue();
    //Create add action
    const addAction = new AddNodeAction(addedNode, nodePath);

    actionsQueue.addAction(addAction);

    expect(actionsQueue.getFirstAction()).toStrictEqual(addAction);
  });

  it("Retrieves the first action in the queue - empty queue", async () => {
    const actionsQueue = new ActionsQueue();

    expect(actionsQueue.getFirstAction()).toBeNull();
  });

  it("Creates an empty actions queue, adds actions and executes them - successful execution", async () => {
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
    const actionsQueue = new ActionsQueue();
    //Create add action
    const addAction = new AddNodeAction(addedNode, nodePath);

    //Create second add action
    const addActionChild = new AddNodeAction(addedNode, childNodePath);

    actionsQueue.addAction(addAction);
    actionsQueue.addAction(addActionChild);

    await actionsQueue.executeAll(tenant, draftId);

    expect(actionsQueue.isEmpty()).toBeTruthy();
    expect(addNodeApiCall).toHaveBeenCalledTimes(2);

    addNodeApiCall.mockRestore();
  });

  it("Creates an empty actions queue, adds actions and executes them - unsuccessful execution", async () => {
    const resp: AxiosResponse<string> = {
      data: "",
      status: 404,
      statusText: "NOT FOUND",
      headers: "",
      config: {},
    };
    //Spy and mock API call
    const addNodeApiCall2 = jest
      .spyOn(api, "addNode")
      .mockImplementation((): Promise<AxiosResponse<string>> => {
        return Promise.reject(resp);
      });

    const actionsQueue = new ActionsQueue();
    //Create add action
    const addAction = new AddNodeAction(addedNode, nodePath);

    actionsQueue.addAction(addAction);

    //Create second add action
    const addActionChild = new AddNodeAction(addedNode, childNodePath);

    actionsQueue.addAction(addActionChild);

    try {
      await actionsQueue.executeAll(tenant, draftId);
    } catch (e: any) {
      expect(e).toStrictEqual(resp);
    }

    expect(actionsQueue.isEmpty()).toBeFalsy();
    expect(addNodeApiCall2).toHaveBeenCalledTimes(1);
  });
});
