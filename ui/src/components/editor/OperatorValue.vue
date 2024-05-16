<template>
  <div class="operator-value-container">
    <div
      class="operator-value"
      :class="{
        number: this.isNumber(this.value),
        boolean: this.isBoolean(this.value),
        editable: editMode,
      }"
      @click="enableOperatorEditing"
      v-if="!editOperator && !error"
    >
      {{ this.editableValue }}
    </div>
    <cv-text-area
      v-else
      ref="operatorValueTextarea"
      class="editable-operator-value"
      :class="{
        number: this.isNumber(this.editableValue),
        boolean: this.isBoolean(this.editableValue),
        error: error,
      }"
      :light="true"
      v-model="editableValue"
      @blur="updateOperator"
      @input="updateTextAreaHeight"
      :style="{ height: this.textAreaHeight }"
      :invalid-message="error"
    ></cv-text-area>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Model, Watch, Prop } from "vue-property-decorator";
import { Value } from "tornado-backend-dto";
import Tornado from "@/store/tornado";
import {
  renderRegexErrorMessage,
  validateRegex,
} from "@/core/Services/InputValidation/RegexValidationUtils";
import {
  validateAccessor,
  renderAccessorErrorMessage,
} from "@/core/Services/InputValidation/AccessorValidationUtils";

// @ts-ignore
import { CvTextArea } from "@carbon/vue/src/components/cv-text-area";

@Component({
  components: {
    CvTextArea,
  },
})
export default class OperatorValue extends Vue {
  @Model("change") public value!: Value;
  private error: string | null = null;
  @Prop() public inputType!: "accessor" | "regex";
  private editableValue = "";
  private editOperator = false;
  private textAreaHeight = "30px !important";

  private isNumber(value: Value): boolean {
    return (
      value !== "" &&
      (typeof value === "number" ||
        (!isNaN(Number(value)) && !this.isBoolean(value)))
    );
  }

  private isBoolean(value: Value): boolean {
    return (
      value !== "" &&
      (typeof value === "boolean" || this.isBooleanString(value))
    );
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }

  get valueToString(): string {
    return String(this.value);
  }

  private isBooleanString(candidateString: string): boolean {
    return candidateString === "true" || candidateString === "false";
  }

  private updateOperator() {
    if (!this.isValid()) {
      return;
    }
    let updatedOperator: Value = this.editableValue;
    if (this.isNumber(this.editableValue)) {
      updatedOperator = Number(this.editableValue);
    } else if (this.isBoolean(this.editableValue)) {
      updatedOperator = this.editableValue === "true";
    }
    this.$emit("change", updatedOperator);
    this.editOperator = false;
    //the following timeout is used to delay the emit of the close event,
    //in order to ensure that, if the user clicked on the other textarea of the same row,
    //it has the time to emit its mode change before the following exit, avoid the flashing of the inline menu
    setTimeout(() => {
      this.$emit("operator-mode-change", false);
    }, 150);
  }

  private enableOperatorEditing() {
    if (this.editMode) {
      this.editOperator = true;
      this.$emit("operator-mode-change", true);
      Vue.nextTick(() => {
        const textArea = (
          this.$refs["operatorValueTextarea"] as Vue
        ).$el.querySelector("textarea");
        if (textArea) {
          textArea.focus();
          this.updateTextAreaHeight();
        }
      });
    }
  }

  private updateTextAreaHeight(): void {
    this.textAreaHeight = "30px !important";
    Vue.nextTick(() => {
      const textArea = (
        this.$refs["operatorValueTextarea"] as Vue
      ).$el.querySelector("textarea");
      if (textArea) {
        this.textAreaHeight = textArea.scrollHeight + "px !important";
      }
    });
  }

  public isEditingInProgress(): boolean {
    return this.editOperator;
  }

  private mounted(): void {
    this.editableValue = String(this.value);
  }

  private isValid(): boolean {
    this.error = null;
    if (this.inputType === "regex") {
      let validationResult = validateRegex(this.editableValue);
      if (!validationResult.is_valid && validationResult.error) {
        this.error = renderRegexErrorMessage(
          this.editableValue,
          validationResult.error
        );
        return false;
      }
    } else {
      let validationResult = validateAccessor(this.editableValue);
      if (!validationResult.is_valid && validationResult.error) {
        this.error = renderAccessorErrorMessage(validationResult.error);
        return false;
      }
    }
    return true;
  }

  @Watch("value")
  onPropertyChanges(newValue: Value): void {
    this.editableValue = String(newValue);
  }
}
</script>

<style lang="scss" scoped>
.operator-value-container {
  background: $ui-input;
  display: flex;
  flex-grow: 1;
  flex-basis: 0;
  &.first {
    width: 50% !important;
    flex: 0 0 auto;
  }
}
.operator-value {
  width: 100%;
  min-height: 30px;
  font-size: 14px;
  line-height: 18px;
  padding: 6px 8px;
  color: $ui-05;
  word-break: break-word;
  font-family: "IBM Plex Mono";
}

.editable {
  cursor: pointer;
}

.editable-operator-value {
  background: $field-02;
  color: $ui-05;
}

.number {
  color: #2f9bff;
}

.boolean {
  color: #b265ff;
}
</style>

<style lang="scss">
.editable-operator-value {
  width: 100%;
  height: 100%;
  position: relative;
  .bx--label {
    margin-bottom: 0;
  }
  .bx--text-area,
  .bx--text-area:focus,
  .bx--text-area:active {
    outline: none;
  }
  .bx--text-area {
    padding: 6px 8px;
    height: 100% !important;
    font-size: 14px;
    line-height: 18px;
    font-family: "IBM Plex Mono";
    color: $ui-05;
    cursor: auto;
    resize: none;
    overflow-y: hidden;
    display: block;
    min-height: 30px !important;
    border: none;
  }
  .bx--text-area__wrapper {
    height: 100%;
  }

  div.bx--form-requirement {
    display: block;
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    padding: 8px 24px 8px 16px;
    background: $ui-05;
    color: $inverse-01 !important;
    z-index: 9999;
    border-radius: 3px;
    width: max-content;
    word-wrap: break-word;
    max-width: 100%;
    max-height: revert;
    font-family: "IBM Plex Sans";
    font-size: 14px;
    overflow: visible;
    &:after {
      content: "";
      background: $ui-05;
      display: block;
      width: 18px;
      height: 18px;
      position: absolute;
      transform: rotate(45deg);
      right: 6px;
      top: -3px;
      z-index: 9999;
    }
  }
  & svg {
    top: 7px;
    right: 7px;
  }
}

.editable-operator-value.boolean {
  .bx--text-area {
    color: #b265ff;
  }
}

.editable-operator-value.number {
  .bx--text-area {
    color: #2f9bff;
  }
}
</style>
