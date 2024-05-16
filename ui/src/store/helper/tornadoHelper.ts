import Notification from "../notification";
import i18n from "../../utils/i18n";
import {
  ProcessingTreeNodeDto,
  ExtractorType,
  RuleCompleteDto,
  OperatorType,
} from "../tornado";
import {
  ActionDto,
  ExtractorDto,
  OperatorDto,
  RuleDto,
} from "tornado-backend-dto";
import Extractor from "@/core/Extractor/Extractor";
import { ExtractorFactory } from "@/core/Extractor/ExtractorFactory";
import { RegexDetails } from "@/core/Extractor/Regex";
import { BaseAction } from "@/core/Action/Actions";
import { ActionFactory } from "@/core/Action/ActionFactory";

export function notifyNodeNotFound(nodePath: string[]): void {
  Notification.addError({
    title: i18n.tc("errors.error"),
    message: i18n.tc("errors.node_not_found", 0, {
      path: nodePath.join("/"),
    }),
  });
}
export function notifyNodeNotInRuleSet(nodePath: string[]): void {
  Notification.addError({
    title: i18n.tc("errors.error"),
    message: i18n.tc("errors.node_is_not_a_ruleset", 0, {
      path: nodePath.join("/"),
    }),
  });
}

function toExtractorDTO(array: Extractor[]): {
  [key: string]: ExtractorDto;
} {
  return array.reduce((obj, item) => {
    obj[item.variable] = ExtractorFactory.createDtoFromExtractor(item);
    return obj;
  }, {} as { [key: string]: ExtractorDto });
}

export function toExtractorArray(obj: Record<string, any>): Extractor[] {
  return Object.keys(obj)
    .map((key) => ExtractorFactory.createExtractorFromDto(key, obj[key]))
    .sort((a, b) => a.variable.localeCompare(b.variable));
}

export function toActionArray(data: any[]): BaseAction[] {
  return data
    .map((obj) => ActionFactory.createActionFromDTO(obj))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function toActionDTO(array: BaseAction[]): ActionDto[] {
  return array.map((action) => action.toDTO() as ActionDto);
}

export function toOperatorType(dto: OperatorDto): OperatorType {
  switch (dto.type) {
    case "regex":
      return {
        type: "regex",
        first: dto.target,
        second: dto.regex,
      };
    case "AND":
    case "OR":
      return {
        type: dto.type,
        operators: dto.operators.map(toOperatorType),
      };
    case "NOT":
      return {
        type: "NOT",
        operator: toOperatorType(dto.operator),
      };
    default:
      return dto as unknown as OperatorType;
  }
}

export function toOperatorDTO(type: OperatorType): OperatorDto {
  switch (type.type) {
    case "regex":
      return {
        type: "regex",
        regex: type.second,
        target: type.first,
      };
    case "AND":
    case "OR":
      return {
        type: type.type,
        operators: type.operators.map(toOperatorDTO),
      };
    case "NOT":
      return {
        type: "NOT",
        operator: toOperatorDTO(type.operator),
      };
    default:
      return type as unknown as OperatorDto;
  }
}

export function generateUniqueNameForExtractor(
  arr: Array<ExtractorType>,
  name: string
): string {
  let suffix = 1;
  const names = new Set(arr.map((item) => item.variable));
  while (names.has(`${name}_${suffix}`)) {
    suffix++;
  }
  return `${name}_${suffix}`;
}
export function notifyRuleNotFound(ruleName: string, nodePath: string[]): void {
  Notification.addError({
    title: i18n.tc("errors.error"),
    message: i18n.tc("errors.rule_not_found", 0, {
      path: nodePath.join("/") + "/" + ruleName,
    }),
  });
}

export function createRuleDtoFromRuleCompleteDto(
  rule: RuleCompleteDto
): RuleDto {
  let whereFilter: OperatorDto | null = null;
  let withExtractor: { [key: string]: ExtractorDto } = {};
  let actions: ActionDto[] = [];

  if (rule.operators_extractors_actions) {
    whereFilter = rule.operators_extractors_actions.where
      ? toOperatorDTO(rule.operators_extractors_actions.where)
      : null;
    withExtractor = toExtractorDTO(
      rule.operators_extractors_actions.with.map((item: ExtractorType) =>
        ExtractorFactory.createExtractorFromType(item)
      )
    );
    actions = toActionDTO(rule.operators_extractors_actions.actions);
  }

  const newRule = {
    name: rule.name,
    description: rule.description,
    continue: rule.continue,
    active: rule.active,
    constraint: {
      WHERE: whereFilter,
      WITH: withExtractor,
    },
    actions: actions,
  };
  return newRule;
}

export function moveItemPositionByIndex<T>(
  arr: T[],
  oldIndex: number,
  newIndex: number
): T[] {
  // Remove the item from its old position
  const item = arr.splice(oldIndex, 1)[0];

  // Insert the item at its new position
  arr.splice(newIndex, 0, item);

  return arr;
}

export function isRuleset(
  node: ProcessingTreeNodeDto
): node is ProcessingTreeNodeDto & {
  details: { type: "Ruleset"; name: string; rules: RuleCompleteDto[] };
} {
  return node.details != undefined && node.details.type === "Ruleset";
}

export function getExtractorRegexDefaultValuesByRegexType(
  type: "Regex" | "RegexNamedGroups" | "KeyRegex",
  extractor: Extractor | null = null
): RegexDetails {
  if (extractor != null) {
    if (extractor.isRegexDetailsStandard) {
      return ExtractorFactory.createDefaultRegexDetails(type);
    } else if (extractor.isRegexDetailsNamedGroups) {
      return ExtractorFactory.createDefaultRegexDetails(type);
    } else {
      return ExtractorFactory.createDefaultRegexDetails(type);
    }
  }
  return ExtractorFactory.createDefaultRegexDetails(type);
}

export function findRuleIndexByRuleName(
  rules: RuleCompleteDto[],
  ruleName: string
): number {
  const ruleIndex = rules.findIndex((rule: RuleCompleteDto) => {
    return rule.name === ruleName;
  });
  return ruleIndex;
}
