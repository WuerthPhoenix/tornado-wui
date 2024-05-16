import axios, { AxiosResponse } from "axios";
import { LocaleMessageObject } from "vue-i18n";
import {
  ProcessedEventDto,
  ProcessingTreeNodeEditDto,
  RuleDto,
  SendEventRequestDto,
  TreeInfoDto,
  Id,
  RulePositionDto,
} from "tornado-backend-dto";
import { UserInfoDto } from "@/store/user";
import {
  ProcessingTreeNodeDetailsDto,
  ProcessingTreeNodeDto,
  RuleCompleteDto,
} from "@/store/tornado";
import Notification from "@/store/notification";
import i18n from "@/utils/i18n";

const axiosInstance = axios.create({
  baseURL: (axios.defaults.baseURL = process.env.VUE_APP_API_BASE_PATH),
  timeout: 120_000,
});

const TRANSLATIONS_API = "/user/translation";
const USER_INFO_API = "/user/info";
const TORNADO_BASE_API_URL = "/backend/api/";
const TORNADO_BASE_API_V2_URL = `${TORNADO_BASE_API_URL}v2_beta/`;
const TORNADO_BASE_API_V2_ACTIVE_TREE_CONFIGURATION_URL = `${TORNADO_BASE_API_V2_URL}config/active/tree/`;
const TORNADO_BASE_API_V2_ACTIVE_TREE_INFO_URL = `${TORNADO_BASE_API_V2_ACTIVE_TREE_CONFIGURATION_URL}info/`;
const TORNADO_BASE_API_V2_ACTIVE_TREE_CHILDREN_URL = `${TORNADO_BASE_API_V2_ACTIVE_TREE_CONFIGURATION_URL}children/`;
const TORNADO_BASE_API_V2_ACTIVE_TREE_NODE_DETAILS_URL = `${TORNADO_BASE_API_V2_ACTIVE_TREE_CONFIGURATION_URL}details/`;
const TORNADO_BASE_API_V2_ACTIVE_RULE_URL = `${TORNADO_BASE_API_V2_URL}config/active/rule/`;
const TORNADO_BASE_API_V2_ACTIVE_RULE_DETAILS_URL = `${TORNADO_BASE_API_V2_ACTIVE_RULE_URL}details/`;
const TORNADO_BASE_API_V2_SEND_EVENT_URL = `${TORNADO_BASE_API_V2_URL}event/`;
const TORNADO_BASE_API_V2_SEND_EVENT_ACTIVE_URL = `${TORNADO_BASE_API_V2_SEND_EVENT_URL}active/`;
const TORNADO_BASE_API_V2_DRAFTS_URL = `${TORNADO_BASE_API_V2_URL}config/drafts/`;
const TORNADO_BASE_API_V2_DRAFT_URL = `${TORNADO_BASE_API_V2_URL}config/draft/`;
const TORNADO_BASE_API_V2_DRAFT_TREE_CHILDREN_URL = `${TORNADO_BASE_API_V2_DRAFT_URL}tree/children/`;
const TORNADO_BASE_API_V2_DRAFT_NODE_DETAILS_URL = `${TORNADO_BASE_API_V2_DRAFT_URL}tree/details/`;
const TORNADO_BASE_API_V2_DRAFT_RULE_URL = `${TORNADO_BASE_API_V2_URL}config/draft/rule/`;
const TORNADO_BASE_API_V2_DRAFT_RULE_MOVE_URL = `${TORNADO_BASE_API_V2_URL}config/draft/rule/move/`;
const TORNADO_BASE_API_V2_DRAFT_RULE_DETAILS_URL = `${TORNADO_BASE_API_V2_DRAFT_RULE_URL}details/`;
const TORNADO_BASE_API_V2_SEND_EVENT_DRAFT_URL = `${TORNADO_BASE_API_V2_SEND_EVENT_URL}drafts/`;
const TORNADO_BASE_API_V2_IMPORT_NODE_URL = `${TORNADO_BASE_API_V2_DRAFT_URL}tree/import/`;
const TORNADO_BASE_API_V2_EXPORT_NODE_URL = `${TORNADO_BASE_API_V2_DRAFT_URL}tree/export/`;

export async function postTranslations(
  translationJson: Record<string, unknown>
): Promise<AxiosResponse<LocaleMessageObject>> {
  const headers = {
    Accept: "application/json",
  };

  return axiosInstance.post<LocaleMessageObject>(
    TRANSLATIONS_API,
    translationJson,
    {
      headers,
    }
  );
}

export async function getUserInfo(): Promise<AxiosResponse<UserInfoDto>> {
  return axiosInstance.get<UserInfoDto>(USER_INFO_API);
}

export async function setProcessingTreeView(
  isProcessingTreeCollapsedView: boolean
): Promise<AxiosResponse<void>> {
  return axiosInstance.post<void>(USER_INFO_API, {
    processing_tree_collapsed_view_mode: isProcessingTreeCollapsedView,
  });
}

export async function getTornadoCurrentConfigurationInfo(
  userTenant: string
): Promise<AxiosResponse<TreeInfoDto>> {
  return axiosInstance.get<TreeInfoDto>(
    TORNADO_BASE_API_V2_ACTIVE_TREE_INFO_URL + userTenant
  );
}

export async function getTornadoActiveConfigurationTree(
  userTenant: string,
  nodePath: string[] = []
): Promise<AxiosResponse<ProcessingTreeNodeDto[]>> {
  let url = TORNADO_BASE_API_V2_ACTIVE_TREE_CHILDREN_URL + userTenant;
  if (nodePath.length) {
    url += `/${nodePath.join(",")}`;
  }
  return axiosInstance.get<ProcessingTreeNodeDto[]>(url);
}

export async function getTornadoActiveConfigurationTreeNodeDetails(
  userTenant: string,
  nodePath: string[] = []
): Promise<AxiosResponse<ProcessingTreeNodeDetailsDto>> {
  const url =
    TORNADO_BASE_API_V2_ACTIVE_TREE_NODE_DETAILS_URL +
    userTenant +
    `/${nodePath.join(",")}`;

  return axiosInstance.get<ProcessingTreeNodeDetailsDto>(url);
}

export async function getTornadoActiveConfigurationRuleDetails(
  userTenant: string,
  nodePath: string[],
  ruleName: string
): Promise<AxiosResponse<RuleDto>> {
  const url =
    TORNADO_BASE_API_V2_ACTIVE_RULE_DETAILS_URL +
    userTenant +
    `/${nodePath.join(",")}/${ruleName}`;

  return axiosInstance.get<RuleDto>(url);
}

export function sendEvent(
  userTenant: string,
  testEvent: SendEventRequestDto
): Promise<AxiosResponse<ProcessedEventDto>> {
  const url = TORNADO_BASE_API_V2_SEND_EVENT_ACTIVE_URL + userTenant;
  return axiosInstance.post<ProcessedEventDto>(url, testEvent);
}

function getDraftBaseURLWithTenant(
  baseURL: string,
  userTenant: string
): string {
  return baseURL + userTenant + "/";
}

export function getListOfDrafts(
  userTenant: string
): Promise<AxiosResponse<string[]>> {
  const url = getDraftBaseURLWithTenant(
    TORNADO_BASE_API_V2_DRAFTS_URL,
    userTenant
  );
  return axiosInstance.get<string[]>(url);
}

export function createNewDraft(
  userTenant: string
): Promise<AxiosResponse<Id<string>>> {
  const url = getDraftBaseURLWithTenant(
    TORNADO_BASE_API_V2_DRAFTS_URL,
    userTenant
  );
  return axiosInstance.post<Id<string>>(url);
}

export function getDraftConfigurationTree(
  userTenant: string,
  draftId: string,
  nodePath: string[]
): Promise<AxiosResponse<ProcessingTreeNodeDto[]>> {
  let url =
    getDraftBaseURLWithTenant(
      TORNADO_BASE_API_V2_DRAFT_TREE_CHILDREN_URL,
      userTenant
    ) + draftId;
  if (nodePath.length) {
    url += `/${nodePath.join(",")}`;
  }
  return axiosInstance.get<ProcessingTreeNodeDto[]>(url);
}

export function getDraftConfigurationTreeNodeDetails(
  userTenant: string,
  draftId: string,
  nodePath: string[]
): Promise<AxiosResponse<ProcessingTreeNodeDetailsDto>> {
  let url =
    getDraftBaseURLWithTenant(
      TORNADO_BASE_API_V2_DRAFT_NODE_DETAILS_URL,
      userTenant
    ) + draftId;
  if (nodePath.length) {
    url += `/${nodePath.join(",")}`;
  }
  return axiosInstance.get<ProcessingTreeNodeDetailsDto>(url);
}

export async function getDraftConfigurationRuleDetails(
  userTenant: string,
  draftId: string,
  nodePath: string[],
  ruleName: string
): Promise<AxiosResponse<RuleDto>> {
  let url =
    getDraftBaseURLWithTenant(
      TORNADO_BASE_API_V2_DRAFT_RULE_DETAILS_URL,
      userTenant
    ) + draftId;
  if (nodePath.length) {
    url += `/${nodePath.join(",")}/${ruleName}`;
  }

  return axiosInstance.get<RuleDto>(url);
}

export function deleteDraft(
  userTenant: string,
  draftId: string | null
): Promise<AxiosResponse<void>> {
  const url =
    getDraftBaseURLWithTenant(TORNADO_BASE_API_V2_DRAFTS_URL, userTenant) +
    draftId;
  return axiosInstance.delete<void>(url);
}

export function deployDraft(
  userTenant: string,
  draftId: string
): Promise<AxiosResponse<string>> {
  const url =
    getDraftBaseURLWithTenant(TORNADO_BASE_API_V2_DRAFTS_URL, userTenant) +
    draftId +
    "/deploy";
  return axiosInstance.post<string>(url);
}

export function takeoverDraft(
  userTenant: string,
  draftId: string
): Promise<AxiosResponse<string>> {
  const url =
    getDraftBaseURLWithTenant(TORNADO_BASE_API_V2_DRAFTS_URL, userTenant) +
    draftId +
    "/takeover";
  return axiosInstance.post<string>(url);
}

export function deleteNode(
  userTenant: string,
  draftId: string,
  nodePath: string[]
): Promise<AxiosResponse<string>> {
  let url =
    getDraftBaseURLWithTenant(
      TORNADO_BASE_API_V2_DRAFT_NODE_DETAILS_URL,
      userTenant
    ) + draftId;

  if (nodePath.length) {
    url += `/${nodePath.join(",")}`;
  }

  return axiosInstance.delete<string>(url);
}

export function sendEventDraft(
  userTenant: string,
  draftId: string,
  testEvent: SendEventRequestDto
): Promise<AxiosResponse<ProcessedEventDto>> {
  const url =
    getDraftBaseURLWithTenant(
      TORNADO_BASE_API_V2_SEND_EVENT_DRAFT_URL,
      userTenant
    ) + draftId;
  return axiosInstance.post<ProcessedEventDto>(url, testEvent);
}

function processingTreeNodeDetailsToEditDto(
  node: ProcessingTreeNodeDetailsDto
): ProcessingTreeNodeEditDto {
  if (node.type == "Filter") {
    return {
      type: node.type,
      name: node.name,
      description: node.description,
      active: node.active,
      filter: node.filter,
    };
  } else {
    return {
      type: node.type,
      name: node.name,
    };
  }
}

export function addNode(
  userTenant: string,
  draftId: string,
  nodePath: string[],
  node: ProcessingTreeNodeDetailsDto
): Promise<AxiosResponse<string>> {
  let url =
    getDraftBaseURLWithTenant(
      TORNADO_BASE_API_V2_DRAFT_NODE_DETAILS_URL,
      userTenant
    ) + draftId;

  if (nodePath.length) {
    url += `/${nodePath.join(",")}`;
  }

  return axiosInstance.post<string>(
    url,
    processingTreeNodeDetailsToEditDto(node)
  );
}
export function editNode(
  userTenant: string,
  draftId: string,
  nodePath: string[],
  node: ProcessingTreeNodeDetailsDto
): Promise<AxiosResponse<string>> {
  let url =
    getDraftBaseURLWithTenant(
      TORNADO_BASE_API_V2_DRAFT_NODE_DETAILS_URL,
      userTenant
    ) + draftId;

  if (nodePath.length) {
    url += `/${nodePath.join(",")}`;
  }

  return axiosInstance.put<string>(
    url,
    processingTreeNodeDetailsToEditDto(node)
  );
}

export function addRule(
  userTenant: string,
  draftId: string,
  nodePath: string[],
  rule: RuleDto
): Promise<AxiosResponse<string>> {
  let url =
    getDraftBaseURLWithTenant(
      TORNADO_BASE_API_V2_DRAFT_RULE_DETAILS_URL,
      userTenant
    ) + draftId;

  if (nodePath.length) {
    url += `/${nodePath.join(",")}`;
  }
  return axiosInstance.post<string>(url, rule);
}

export function deleteRule(
  userTenant: string,
  draftId: string,
  nodePath: string[],
  ruleName: string
): Promise<AxiosResponse<string>> {
  let url =
    getDraftBaseURLWithTenant(
      TORNADO_BASE_API_V2_DRAFT_RULE_DETAILS_URL,
      userTenant
    ) + draftId;
  url += `/${nodePath.join(",")}/${ruleName}`;

  return axiosInstance.delete<string>(url);
}

export function editRule(
  userTenant: string,
  draftId: string,
  nodePath: string[],
  rule: RuleDto,
  oldRule: RuleCompleteDto
): Promise<AxiosResponse<string>> {
  let url =
    getDraftBaseURLWithTenant(
      TORNADO_BASE_API_V2_DRAFT_RULE_DETAILS_URL,
      userTenant
    ) + draftId;

  if (nodePath.length) {
    url += `/${nodePath.join(",")}`;
  }
  url += "/" + oldRule.name;

  return axiosInstance.put<string>(url, rule);
}

export function reorderRule(
  userTenant: string,
  draftId: string,
  nodePath: string[],
  name: string,
  newIndex: RulePositionDto
): Promise<AxiosResponse<string>> {
  let url =
    getDraftBaseURLWithTenant(
      TORNADO_BASE_API_V2_DRAFT_RULE_MOVE_URL,
      userTenant
    ) + draftId;

  if (nodePath.length) {
    url += `/${nodePath.join(",")}`;
  }

  url += "/" + name;
  return axiosInstance.put<string>(url, newIndex);
}

export function exportNodeFromDraft(
  userTenant: string,
  draftId: string,
  nodePath: string[]
): Promise<AxiosResponse<string>> {
  let url =
    getDraftBaseURLWithTenant(TORNADO_BASE_API_V2_EXPORT_NODE_URL, userTenant) +
    draftId;

  if (nodePath.length) {
    url += `/${nodePath.join(",")}`;
  }
  return axiosInstance.get<string>(url);
}

export function ImportNodeFromDraft(
  userTenant: string,
  draftId: string,
  nodePath: string[] | null,
  formData: FormData,
  overwrite: boolean
): Promise<AxiosResponse<string>> {
  let url =
    getDraftBaseURLWithTenant(TORNADO_BASE_API_V2_IMPORT_NODE_URL, userTenant) +
    draftId;
  if (nodePath?.length) {
    url += `/${nodePath.join(",")}`;
  } else {
    Notification.addError({
      title: i18n.tc("errors.error"),
      message: i18n.tc("errors.error.node_not_found"),
    });
  }
  if (!overwrite) {
    return axiosInstance.post<string>(url, formData);
  }
  return axiosInstance.put<string>(url, formData);
}
