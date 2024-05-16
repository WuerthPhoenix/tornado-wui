export abstract class RegexDetails {}

export class RegexDetailsStandard extends RegexDetails {
  type: "Regex" = "Regex";
  match: string;
  groupMatchIdx: number | null;
  allMatches: boolean;

  constructor(
    match: string,
    groupMatchIdx: number | null,
    allMatches: boolean
  ) {
    super();
    this.match = match;
    this.groupMatchIdx = groupMatchIdx;
    this.allMatches = allMatches;
  }
}

export class RegexDetailsNamedGroups extends RegexDetails {
  type: "RegexNamedGroups" = "RegexNamedGroups";
  namedMatch: string;
  allMatches: boolean;

  constructor(namedMatch: string, allMatches: boolean) {
    super();
    this.namedMatch = namedMatch;
    this.allMatches = allMatches;
  }
}

export class RegexDetailsKey extends RegexDetails {
  type: "KeyRegex" = "KeyRegex";
  singleKeyMatch: string;

  constructor(singleKeyMatch: string) {
    super();
    this.singleKeyMatch = singleKeyMatch;
  }
}
