import { Constructor } from "@/utils/types";
import { Vue } from "vue-property-decorator";
import { Modifier } from "@/core/Extractor/Modifiers";

export const filterWhereConditions = [
  "contains",
  "containsIgnoreCase",
  "equals",
  "equalsIgnoreCase",
  "ge",
  "gt",
  "le",
  "lt",
  "ne",
  "regex",
];

export const actionList = [
  "foreach",
  "archive",
  "director",
  "elasticsearch",
  "icinga2",
  "logger",
  "smart_monitoring_check_result",
  "script",
];

export type AvailableModifiers = {
  icon: Constructor<Vue>;
  title: string;
  data: Modifier;
};
