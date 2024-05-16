import {
  MapDetails,
  ReplaceAllDetails,
  Modifier,
  LowercaseDetails,
  ToNumberDetails,
  TrimDetails,
  MapValue,
  DateAndTimeDetails,
} from "@/core/Extractor/Modifiers";
import Extractor from "@/core/Extractor/Extractor";
import {
  RegexDetails,
  RegexDetailsKey,
  RegexDetailsNamedGroups,
  RegexDetailsStandard,
} from "@/core/Extractor/Regex";
import {
  ExtractorDto,
  ModifierDto,
  ExtractorRegexDto,
} from "tornado-backend-dto";
import { ExtractorType } from "@/store/tornado";

export class ExtractorFactory {
  public static createNewDefaultExtractor(
    name = "subject",
    from = "${event.payload}"
  ): Extractor {
    return new Extractor({
      variable: name,
      from: from,
      regexDetails: ExtractorFactory.createDefaultRegexDetails("Regex"),
      postModifiers: [],
    });
  }

  public static createExtractorFromType(data: ExtractorType): Extractor {
    return new Extractor({
      variable: data.variable,
      from: data.from,
      regexDetails: data.regexDetails,
      postModifiers: data.postModifiers,
    });
  }

  public static createDtoFromExtractor(extractor: Extractor): ExtractorDto {
    let regex: ExtractorRegexDto | null;
    if (extractor.regexDetails instanceof RegexDetailsStandard) {
      regex = {
        type: extractor.regexDetails.type,
        match: extractor.regexDetails.match,
        group_match_idx: extractor.regexDetails.groupMatchIdx,
        all_matches: extractor.regexDetails.allMatches,
      };
    } else if (extractor.regexDetails instanceof RegexDetailsNamedGroups) {
      regex = {
        type: extractor.regexDetails.type,
        named_match: extractor.regexDetails.namedMatch,
        all_matches: extractor.regexDetails.allMatches,
      };
    } else {
      regex = {
        type: (extractor.regexDetails as RegexDetailsKey).type,
        single_key_match: (extractor.regexDetails as RegexDetailsKey)
          .singleKeyMatch,
      };
    }
    return {
      from: extractor.from,
      regex: regex,
      modifiers_post: extractor.postModifiers.map((modifier: Modifier) => {
        if (modifier.type === "Lowercase") {
          return { type: "Lowercase" };
        } else if (modifier.type === "ToNumber") {
          return { type: "ToNumber" };
        } else if (modifier.type === "Trim") {
          return { type: "Trim" };
        } else if (modifier.type === "ReplaceAll") {
          const details = modifier.details as ReplaceAllDetails;
          return {
            type: "ReplaceAll",
            replace: details.replace,
            find: details.find,
            is_regex: details.isRegex,
          };
        } else if (modifier.type === "DateAndTime") {
          const details = modifier.details as DateAndTimeDetails;
          return {
            type: "DateAndTime",
            timezone: details.timezone,
          };
        } else {
          const details = modifier.details as MapDetails;
          return {
            type: "Map",
            mapping: details.mapping.reduce((obj, item) => {
              obj[item.key] = item.value;
              return obj;
            }, {} as { [key: string]: string }),
            default_value: details.defaultValue,
          };
        }
      }),
    };
  }

  public static createExtractorFromDto(
    variable: string,
    dto: ExtractorDto
  ): Extractor {
    return new Extractor({
      variable: variable,
      from: dto.from,
      regexDetails: ExtractorFactory.createRegexDetailsFromDTO(dto.regex),
      postModifiers: ExtractorFactory.createModifiersFromDTO(
        dto.modifiers_post
      ),
    });
  }

  public static createDefaultModifiersList(): Modifier[] {
    return [
      new Modifier("Lowercase", new LowercaseDetails()),
      new Modifier("ToNumber", new ToNumberDetails()),
      new Modifier("Trim", new TrimDetails()),
      new Modifier("ReplaceAll", new ReplaceAllDetails("", "", false)),
      new Modifier("Map", new MapDetails([], "")),
      new Modifier("DateAndTime", new DateAndTimeDetails("")),
    ];
  }

  public static createRegexDetailsFromDTO(
    regex: ExtractorRegexDto
  ): RegexDetails {
    if (regex.type === "Regex") {
      if (regex.group_match_idx === null || regex.all_matches === null) {
        return new RegexDetailsStandard(".*", null, false);
      }
      return new RegexDetailsStandard(
        regex.match,
        regex.group_match_idx,
        regex.all_matches
      );
    } else if (regex.type === "RegexNamedGroups") {
      if (regex.all_matches === null) {
        return new RegexDetailsStandard(".*", null, false);
      }
      return new RegexDetailsNamedGroups(regex.named_match, regex.all_matches);
    } else if (regex.type === "KeyRegex") {
      return new RegexDetailsKey(regex.single_key_match);
    } else {
      return new RegexDetailsStandard(".*", null, false);
    }
  }

  private static createModifiersFromDTO(modifiers_post: any): Modifier[] {
    return modifiers_post.map((modifier: ModifierDto) => {
      return ExtractorFactory.createModifierFromDTO(modifier);
    });
  }

  public static createModifierFromDTO(modifierDTO: ModifierDto): Modifier {
    const modifier = new Modifier(modifierDTO.type, null);
    switch (modifierDTO.type) {
      case "Lowercase":
        modifier.details = new LowercaseDetails();
        break;
      case "ToNumber":
        modifier.details = new ToNumberDetails();
        break;
      case "Trim":
        modifier.details = new TrimDetails();
        break;
      case "Map":
        modifier.details = new MapDetails(
          Object.keys(modifierDTO.mapping).map(
            (key) => new MapValue(key, modifierDTO.mapping[key])
          ),
          modifierDTO.default_value
        );
        break;
      case "DateAndTime":
        modifier.details = new DateAndTimeDetails(modifierDTO.timezone);
        break;
      case "ReplaceAll":
        modifier.details = new ReplaceAllDetails(
          modifierDTO.find,
          modifierDTO.replace,
          modifierDTO.is_regex
        );
        break;
      default:
        throw new Error(`Unknown modifier type`);
    }

    return modifier;
  }

  public static buildDefault(
    regex: RegexDetails,
    modifiers: Modifier[] = [],
    name = "subject",
    from = "${event.payload}"
  ): Extractor {
    return new Extractor({
      variable: name,
      from: from,
      regexDetails: regex,
      postModifiers: modifiers,
    });
  }

  public static createDefaultRegexDetails(
    type: "Regex" | "RegexNamedGroups" | "KeyRegex" = "Regex"
  ): RegexDetails {
    switch (type) {
      case "Regex":
        return ExtractorFactory.buildRegexDetails("Regex", ".*", false, null);
      case "RegexNamedGroups":
        return ExtractorFactory.buildRegexDetails(
          "RegexNamedGroups",
          "(?P<name>.*)",
          false
        );
      case "KeyRegex":
        return ExtractorFactory.buildRegexDetails("KeyRegex", ".*");
      default:
        throw new Error();
    }
  }

  public static buildRegexDetails(
    type: "Regex" | "RegexNamedGroups" | "KeyRegex",
    match: string,
    allMatches = false,
    groupMatchIdx: null | number = null
  ): RegexDetails {
    switch (type) {
      case "Regex":
        return new RegexDetailsStandard(match, groupMatchIdx, allMatches);
      case "RegexNamedGroups":
        return new RegexDetailsNamedGroups(match, allMatches);
      case "KeyRegex":
        return new RegexDetailsKey(match);
      default:
        throw new Error();
    }
  }

  public static buildMapModifier(
    mapping: { key: string; value: string }[],
    defaultValue: string
  ): Modifier {
    const mapDetails = new MapDetails(
      mapping.map((item) => new MapValue(item.key, item.value)),
      defaultValue
    );

    return new Modifier("Map", mapDetails);
  }

  public static buildDateTimeModifier(timezone = ""): Modifier {
    return new Modifier("DateAndTime", new DateAndTimeDetails(timezone));
  }

  public static createMapValue(item: { key: string; value: string }): MapValue {
    return new MapValue(item.key, item.value);
  }

  public static buildReplaceAllDetails(
    find = "",
    replace = "",
    isRegex = false
  ): ReplaceAllDetails {
    return new ReplaceAllDetails(find, replace, isRegex);
  }
}
