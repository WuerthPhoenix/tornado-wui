<template>
  <div class="action-json-editor-wrapper">
    <div v-if="!editing" @click="onEditing" class="json-readonly-mode">
      <span style="white-space: pre-line">
        {{ JSON.stringify(editableValue, null, "&nbsp;&nbsp;") }}
      </span>
    </div>
    <div v-if="editing" class="action-json-editor-container edit-mode">
      <WpJsoneditor
        class="action-json-editor"
        @input="setValidValue"
        @error="setInvalidValue"
        v-model="editableValue"
      ></WpJsoneditor>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import WpJsoneditor from "@/components/JsonEditor.vue";
import { cloneDeep, isEqual } from "lodash";

@Component({
  name: "ActionJsonEditor",
  components: {
    WpJsoneditor,
  },
})
export default class ActionJsonEditor extends Vue {
  @Prop() value!: any;
  @Prop() isEditable!: boolean;

  private editing = false;

  private valueIsValid = true;
  private editableValue = {};

  @Watch("value", { immediate: true, deep: true })
  private actionUpdated(value: any): void {
    this.editableValue = cloneDeep(value);
  }

  private mounted(): void {
    this.editableValue = cloneDeep(this.value);
    // @ts-ignore
    document.body.addEventListener("click", this.clickOut, true);
    document.body.addEventListener("keydown", this.clickEscape);
  }

  private beforeDestroy() {
    // @ts-ignore
    document.body.removeEventListener("click", this.clickOut, true);
    document.body.removeEventListener("keydown", this.clickEscape);
  }

  clickOut(e: Event): void {
    // check that click is not inside the component
    if (
      this.$el &&
      !(this.$el == e.target || this.$el.contains(e.target as Node))
    ) {
      this.onNotEditing();
    }
  }

  clickEscape(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      this.onNotEditing();
    }
  }

  private setInvalidValue() {
    this.valueIsValid = false;
  }

  private setValidValue() {
    this.valueIsValid = true;
  }

  private onEditing() {
    this.editing = this.isEditable;
  }

  private onNotEditing() {
    this.editing = false;
    if (this.valueIsValid && !isEqual(this.editableValue, this.value)) {
      this.$emit("json-updated", this.editableValue);
    }
  }

  @Watch("isEditable", { deep: true })
  // eslint-disable-next-line
  onEditModeChanged(isEditable: boolean): void {
    this.editing = this.isEditable;
  }
}
</script>

<style lang="scss" scoped>
.json-readonly-mode {
  padding: 8px;
  max-height: 160px;
  overflow-y: auto;
  font-family: "IBM Plex Mono";
  font-size: 12px;
}

.action-json-editor-wrapper {
  margin: -8px;
  position: relative;
}

.action-json-editor-container {
  display: contents;
  height: auto;
  min-height: 30px;
  max-height: 160px;

  &.edit-mode {
    height: 320px;
    max-height: 320px;
    position: absolute;
    width: 100%;
    z-index: 9;
    display: block;
    outline: 2px solid $focus;
    outline-offset: -2px;
    padding: 2px;
  }
}
</style>

<style lang="scss">
.action-json-editor-container .jsoneditor-container.action-json-editor {
  height: 100%;
}

.action-json-editor {
  .space-container {
    display: none;
  }

  .ace_scrollbar {
    display: none;
  }

  .ace_fold-widget {
    left: 3px;
  }

  .ace_scroller {
    width: 100%;
    left: 37px !important;
    padding-top: 5px;
  }

  .ace_line_group {
    .ace_line {
      height: 18px !important;
    }
  }

  .ace_gutter {
    width: 37px !important;
    padding-top: 5px;

    .ace_gutter-layer {
      width: auto !important;

      .ace_gutter-cell {
        padding-right: 16px !important;
        padding-left: 8px !important;
        height: 18px !important;
      }
    }
  }

  .ace_gutter-cell {
    padding: 0 !important;
    font-size: 12px;
    font-family: "IBM Plex Mono";
  }

  .ace_gutter-cell.ace_error {
    background-size: 10px !important;
    background-position-x: 93%;
  }

  .ace_editor.ace_hidpi.ace-jsoneditor {
    font-size: 12px !important;
  }

  textarea.jsoneditor-text.ace_editor,
  .ace-jsoneditor.ace_editor {
    font-family: "IBM Plex Mono";
  }

  .jsoneditor-box {
    height: 100% !important;
  }
}

.dark .action-json-editor {
  .ace_constant.ace_numeric {
    color: #3190ff !important;
  }

  .ace-jsoneditor .ace_constant .ace_language .ace_boolean {
    color: #9975ff !important;
  }

  .ace_variable {
    color: $icon-green !important;
  }

  .ace_string {
    color: $text-01 !important;
  }

  .ace_active-line {
    background-color: $carbon--gray-90 !important;
  }

  .ace_line.ace_error {
    background-color: #7e51ff !important;
  }

  .ace_gutter {
    background-color: $carbon--gray-80 !important;
  }

  .ace_gutter-cell {
    color: $carbon--gray-60 !important;
  }

  .ace_gutter-active-line {
    background-color: $carbon--gray-90 !important;
    color: white !important;
  }
}

.light .action-json-editor {
  .ace-jsoneditor .ace_constant.ace_numeric {
    color: #3190ff !important;
  }

  .ace-jsoneditor .ace_constant .ace_language .ace_boolean {
    color: #7e51ff !important;
  }

  .ace_variable {
    color: #0a9d81 !important;
  }

  .ace_string {
    color: $text-01 !important;
  }

  .ace_active-line {
    background-color: $carbon--gray-10 !important;
  }

  .ace_gutter {
    background-color: $carbon--gray-10 !important;
  }

  .ace_gutter-cell {
    color: black !important;
  }

  .ace_gutter-active-line {
    background-color: $clickable-background-light !important;
  }
}
</style>
