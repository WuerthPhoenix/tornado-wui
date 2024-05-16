<template>
  <div class="params">
    <div class="params__content">
      <div class="params__box" :class="{ error: hasError }">
        <div
          class="params__param"
          v-for="(param, index) in editableParams"
          :key="index"
        >
          <div
            :class="errorParamIndex === index && 'error'"
            class="params__params-box"
          >
            <div class="resizable">
              <span class="resizable__text"> {{ param }} </span>
              <input
                type="text"
                class="resizable__input"
                v-model="editableParams[index]"
                placeholder="Write value"
                :readonly="disabled"
                @blur="update"
              />
            </div>
            <Close
              @click="removeParam(index)"
              class="params__remove"
              v-if="!disabled"
            />
          </div>
        </div>
        <div class="params__error-icon">
          <WarningFilled16
            v-if="error !== null"
            :class="`bx--text-area__invalid-icon`"
          />
        </div>
        <div class="bx--form-requirement" v-if="error !== null">
          {{ error }}
        </div>
      </div>
      <div class="params__add-box" @click="addParam" v-if="!disabled">
        <Add class="params__add" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
// @ts-ignore
import Add from "@carbon/icons-vue/es/add/20";
// @ts-ignore
import Close from "@carbon/icons-vue/es/close/16";
// @ts-ignore
import WarningFilled16 from "@carbon/icons-vue/es/warning--filled/16";
import { cloneDeep } from "lodash";
import {
  renderAccessorErrorMessage,
  validateAccessor,
} from "@/core/Services/InputValidation/AccessorValidationUtils";
@Component({ components: { Add, Close, WarningFilled16 } })
export default class MultiTagInput extends Vue {
  @Prop({ default: Array }) readonly items!: string[];
  @Prop({ default: true }) readonly disabled!: boolean;

  private editableParams: string[] = cloneDeep(this.items);
  private error: string | null = null;
  errorParamIndex: number | null = null;

  @Watch("items", { deep: true })
  private onUpdated(items: string[]): void {
    this.editableParams = cloneDeep(items);
  }

  public addParam(): void {
    this.editableParams.push("");
    this.$emit("change", this.editableParams);
  }
  public removeParam(index: number): void {
    this.editableParams.splice(index, 1);
    if (this.isValid()) {
      this.$emit("change", this.editableParams);
    }
  }
  public update(): void {
    if (this.isValid()) {
      this.$emit("change", this.editableParams);
    }
  }

  private isValid(): boolean {
    this.error = this.errorParamIndex = null;
    this.editableParams.forEach((param, index) => {
      let validationResult = validateAccessor(param);
      if (!validationResult.is_valid && validationResult.error) {
        this.error = renderAccessorErrorMessage(validationResult.error);
        this.errorParamIndex = index;
        return false;
      }
    });
    return true;
  }

  get hasError(): boolean {
    return this.error !== null;
  }
}
</script>

<style scoped lang="scss">
.resizable {
  display: inline-block;
  position: relative;
  height: 20px;
  &__text,
  &__input {
    height: 20px !important;
    color: $multitag-text;
    font-size: 12px;
    line-height: 12px;
    background: transparent;
    padding-top: 5px;
    padding-bottom: 4px;
    padding-right: 6px;
    padding-left: 6px;
    letter-spacing: normal;
  }

  &__text {
    display: inline-block;
    visibility: hidden;
    min-width: 74px;
    max-width: 300px;
  }

  &__input {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    &::placeholder {
      color: $multitag-text-02;
    }
  }
}
.params {
  width: 100%;
  &__content {
    display: flex;
    align-items: stretch;
    min-height: 30px;
    &--disabled .params__add {
      pointer-events: none;
    }
    &--disabled .params__remove {
      pointer-events: none;
    }
    &--disabled .params__input {
      pointer-events: none;
    }
  }
  &__box {
    position: relative;
    width: 100%;
    height: inherit;
    display: flex;
    flex-wrap: wrap;
    background-color: $ui-02;
    min-height: 30px;
    .params__error-icon {
      position: absolute;
      right: 7px;
      transform: translateY(-50%);
      top: 50%;
      display: flex;
      svg.bx--text-area__invalid-icon {
        position: relative;
        right: initial;
        top: initial;
      }
    }
    &.error {
      box-shadow: inset 0 0 0 2px var(--cds-support-01);
    }
  }
  &__params-box {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    height: inherit;
    background-color: $multitag-bg !important;
    border-radius: 20px;
    &.error {
      background-color: var(--cds-support-01) !important;
    }
  }
  &__param {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 4px;
  }

  &__remove {
    position: relative;
    right: 2px;
    &:hover {
      cursor: pointer;
    }
  }
  &__add-box {
    margin-left: 2px;
    width: 30px;
    height: inherit;
    display: flex;
    background-color: $ui-02;
    min-height: 30px;
    align-items: center;
    justify-content: center;
    &:hover {
      cursor: pointer;
      background-color: $ui-03;
    }
  }
  &__add {
  }
}
</style>
<style lang="scss">
.light .params__add-box:hover {
  background-color: $ui-03;
}
.dark .params__add-box:hover {
  background-color: $decorative-01;
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
</style>
