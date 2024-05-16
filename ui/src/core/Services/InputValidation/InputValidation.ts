import {
  RegexValidationResult,
  AccessorValidationResult,
} from "tornado-input-validation";

export type InputValidationWasmModule = {
  validate_regex: (input: string) => RegexValidationResult;
  validate_accessor: (input: string) => AccessorValidationResult;
};

export class InputValidationWrapper {
  private static _instance = new InputValidationWrapper();
  private wasmModule?: InputValidationWasmModule;

  private constructor() {
    this.initializeWasmModule();
  }

  private async initializeWasmModule(): Promise<void> {
    this.wasmModule = await import("tornado-input-validation");
  }

  static getWasmModule(): InputValidationWasmModule {
    if (!this._instance.wasmModule) {
      throw new Error("WebAssembly module is not yet initialized.");
    }
    return this._instance.wasmModule;
  }
}
