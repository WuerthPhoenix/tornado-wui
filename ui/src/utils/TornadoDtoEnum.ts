/*
  TornadoDtoEnum.ts

  This file is a duplication of the enums exported by the Tornado's dto.ts, necessary since the inclusion of an
  exported enum throws an error during the testing phase of the components in which it is employed.
 */
export enum ProcessedRuleStatusDto {
  Matched = "Matched",
  PartiallyMatched = "PartiallyMatched",
  NotMatched = "NotMatched",
  NotProcessed = "NotProcessed",
}
export enum ProcessedFilterStatusDto {
  Matched = "Matched",
  NotMatched = "NotMatched",
  Inactive = "Inactive",
}
export enum ProcessType {
  Full = "Full",
  SkipActions = "SkipActions",
}
