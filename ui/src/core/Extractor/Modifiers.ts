export class Modifier {
  type: string;
  details: ModifierDetails | null;

  constructor(type: string, details: ModifierDetails | null) {
    this.type = type;
    this.details = details;
  }
}
export abstract class ModifierDetails {}
export class LowercaseDetails extends ModifierDetails {
  type = "Lowercase";
}
export class ToNumberDetails extends ModifierDetails {
  type = "ToNumber";
}
export class TrimDetails extends ModifierDetails {
  type = "Trim";
}

export class MapValue {
  public key: string;
  public value: string;
  public keyErrorMessage: string;

  constructor(key: string, value: string) {
    this.key = key;
    this.value = value;
    this.keyErrorMessage = "";
  }
}

export class MapDetails extends ModifierDetails {
  type = "Map";
  mapping: MapValue[];
  defaultValue: string | null;

  constructor(mapping: MapValue[], defaultValue: string | null) {
    super();
    this.mapping = mapping;
    this.defaultValue = defaultValue;
  }
}

export const DEFAULT_TIME_ZONE = "Europe/Rome";
export class DateAndTimeDetails extends ModifierDetails {
  type = "DateAndTime";
  timezone: string;

  constructor(timezone: string) {
    super();
    this.timezone = timezone;
  }
}

export class ReplaceAllDetails extends ModifierDetails {
  type = "ReplaceAll";
  find: string;
  replace: string;
  isRegex: boolean;

  constructor(find: string, replace: string, isRegex: boolean) {
    super();
    this.find = find;
    this.replace = replace;
    this.isRegex = isRegex;
  }
}
