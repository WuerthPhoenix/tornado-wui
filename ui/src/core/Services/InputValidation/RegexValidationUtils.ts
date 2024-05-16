import { RegexValidationResult, RegexError } from "tornado-input-validation";
import { InputValidationWrapper } from "./InputValidation";
import i18n from "@/utils/i18n";

export function validateRegex(regex: string): RegexValidationResult {
  return InputValidationWrapper.getWasmModule().validate_regex(regex);
}

export function renderRegexErrorMessage(
  regex: string,
  error: RegexError
): string {
  const regexError = i18n.tc("errors.regex_validation_error", 0, {
    segment: regex.substr(error.span.start.offset, error.span.end.offset),
  });
  return (
    `${regexError} ` +
    i18n.tc(`errors.regex_validation_error_type.${error.kind}`)
  );
}
