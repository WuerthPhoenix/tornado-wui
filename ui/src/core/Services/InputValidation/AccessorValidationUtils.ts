import {
  AccessorValidationResult,
  AccessorError,
} from "tornado-input-validation";
import { InputValidationWrapper } from "./InputValidation";
import i18n from "@/utils/i18n";

export function validateAccessor(accessor: string): AccessorValidationResult {
  return InputValidationWrapper.getWasmModule().validate_accessor(accessor);
}

export function renderAccessorErrorMessage(error: AccessorError): string {
  const accessorError = i18n.tc("errors.accessor_validation_error");
  // We call the toJSON() function to retrieve an object
  // with all the properties initialized.
  // Otherwise, the properties are not accessible by the i18n.tc.
  // @ts-ignore : wasm bindgen does not expose the toJSON fn in the type definition
  error = error.toJSON();
  return (
    `${accessorError} ` +
    i18n.tc(`errors.accessor_validation_error_type.${error.kind}`, 0, error)
  );
}
