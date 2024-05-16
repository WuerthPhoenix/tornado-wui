import { ProcessingTreeNodeDto, RuleCompleteDto } from "@/store/tornado";
import i18n from "@/utils/i18n";

export function getNodeByPath(
  nodes: ProcessingTreeNodeDto[],
  nodePath: string[] = []
): ProcessingTreeNodeDto | undefined {
  let node;
  for (const nodeName of nodePath) {
    node = getNodeByNameFromNodes(nodeName, nodes);
    if (!node) {
      return undefined;
    }
    if (node.child_nodes) {
      nodes = node.child_nodes;
    } else {
      nodes = [];
    }
  }

  return node;
}

export function getNodeByNameFromNodes(
  nodeName: string,
  nodes: ProcessingTreeNodeDto[]
): ProcessingTreeNodeDto | undefined {
  for (const node of nodes) {
    if (node.name === nodeName) {
      return node;
    }
  }
}

export function getRuleByName(
  rules: RuleCompleteDto[],
  ruleName: string
): RuleCompleteDto | undefined {
  for (const rule of rules) {
    if (rule.name === ruleName) {
      return rule;
    }
  }
  return;
}

export function arrayIndexInMatrix(
  nodePath: string[],
  searchArray: string[][]
): number {
  for (let i = 0; i < searchArray.length; i++) {
    const path = searchArray[i];
    if (path.length === nodePath.length) {
      let equalPaths = true;
      for (let j = 0; j < path.length; j++) {
        if (path[j] !== nodePath[j]) {
          equalPaths = false;
          break;
        }
      }
      if (equalPaths) {
        return i;
      }
    }
  }
  return -1;
}

export function removeArrayFromMatrix(
  nodePath: string[],
  searchArray: string[][]
): string[][] {
  const filteredArray: string[][] = [];
  for (let i = 0; i < searchArray.length; i++) {
    const path = searchArray[i];
    let equalPaths = false;
    if (path.length === nodePath.length) {
      equalPaths = true;
      for (let j = 0; j < path.length; j++) {
        if (path[j] !== nodePath[j]) {
          equalPaths = false;
          break;
        }
      }
    }
    if (!equalPaths) {
      filteredArray.push(path);
    }
  }
  return filteredArray;
}

const objectNameRegex = /^[a-zA-Z0-9_]+$/;

export function isObjectNameValidMatch(objectName: string): boolean {
  return objectNameRegex.test(objectName);
}

export function validateObjectName(
  objectName: string,
  nameCharacterLimit: number
): string {
  if (objectName.length > nameCharacterLimit) {
    return i18n.tc("errors.name_too_long", 0, { limit: nameCharacterLimit });
  }

  if (!isObjectNameValidMatch(objectName)) {
    return i18n.tc("errors.invalid_name");
  }

  return "";
}

export function sortNodesByName(nodes: ProcessingTreeNodeDto[]): void {
  nodes.sort(function (
    nodeA: ProcessingTreeNodeDto,
    nodeB: ProcessingTreeNodeDto
  ) {
    if (nodeA.name < nodeB.name) {
      return -1;
    } else if (nodeA.name < nodeB.name) {
      return 1;
    }
    return 0;
  });
}
