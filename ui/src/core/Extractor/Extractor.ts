import {
  RegexDetails,
  RegexDetailsKey,
  RegexDetailsNamedGroups,
  RegexDetailsStandard,
} from "@/core/Extractor/Regex";
import { Modifier } from "@/core/Extractor/Modifiers";
import { ExtractorType } from "@/store/tornado";

export default class Extractor {
  private _variable: string;
  private _from: string;
  private _regexDetails: RegexDetails;
  private _postModifiers: Modifier[];

  constructor(data: ExtractorType) {
    this._variable = data.variable;
    this._regexDetails = data.regexDetails;
    this._postModifiers = data.postModifiers;
    this._from = data.from;
  }

  get variable(): string {
    return this._variable;
  }

  set variable(variable: string) {
    this._variable = variable;
  }

  get from(): string {
    return this._from;
  }
  set from(from: string) {
    this._from = from;
  }

  get postModifiers(): Modifier[] {
    return this._postModifiers;
  }

  set postModifiers(postModifiers: Modifier[]) {
    this._postModifiers = postModifiers;
  }

  get expression(): string {
    if (this.isRegexDetailsStandard) {
      return (this._regexDetails as RegexDetailsStandard).match;
    } else if (this.isRegexDetailsKey) {
      return (this._regexDetails as RegexDetailsKey).singleKeyMatch;
    } else if (this.isRegexDetailsNamedGroups) {
      return (this._regexDetails as RegexDetailsNamedGroups).namedMatch;
    } else {
      return "";
    }
  }
  set expression(expression: string) {
    if (this.isRegexDetailsStandard) {
      (this._regexDetails as RegexDetailsStandard).match = expression;
    } else if (this.isRegexDetailsKey) {
      (this._regexDetails as RegexDetailsKey).singleKeyMatch = expression;
    } else if (this.isRegexDetailsNamedGroups) {
      (this._regexDetails as RegexDetailsNamedGroups).namedMatch = expression;
    }
  }

  get allMatches(): boolean | undefined {
    if (!this.isAllMatches) {
      return false;
    }
    const details = this._regexDetails as
      | RegexDetailsStandard
      | RegexDetailsNamedGroups;
    return details.allMatches;
  }

  get groupMatchIdx(): number | null {
    if (!this.isRegexDetailsStandard) {
      return null;
    }
    const details = this.regexDetails as RegexDetailsStandard;
    return details.groupMatchIdx;
  }

  get regexDetails(): RegexDetails {
    if (this.isRegexDetailsKey) {
      return this._regexDetails as RegexDetailsKey;
    } else if (this.isRegexDetailsNamedGroups) {
      return this._regexDetails as RegexDetailsNamedGroups;
    }
    return this._regexDetails as RegexDetailsStandard;
  }

  set regexDetails(regexDetails: RegexDetails) {
    this._regexDetails = regexDetails;
  }

  get isAllMatches(): boolean {
    return this.isRegexDetailsStandard || this.isRegexDetailsNamedGroups;
  }

  get isRegexDetailsKey(): boolean {
    return this._regexDetails instanceof RegexDetailsKey;
  }

  get isRegexDetailsNamedGroups(): boolean {
    return this._regexDetails instanceof RegexDetailsNamedGroups;
  }

  get isRegexDetailsStandard(): boolean {
    return this._regexDetails instanceof RegexDetailsStandard;
  }

  public switchAllMatches(): void {
    if (this.isAllMatches) {
      (
        this._regexDetails as RegexDetailsStandard | RegexDetailsNamedGroups
      ).allMatches = !(
        this._regexDetails as RegexDetailsStandard | RegexDetailsNamedGroups
      ).allMatches;
    }
  }
}
