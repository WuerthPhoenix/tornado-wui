<template lang="html">
  <div class="jsoneditor-container">
    <div class="space-container">
      <div class="space-left"></div>
      <div class="space-right"></div>
    </div>
    <div ref="jsoneditor" class="jsoneditor-box"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
// @ts-ignore
import JSONEditor from "jsoneditor/dist/jsoneditor.min.js";
import { validateAccessor } from "@/core/Services/InputValidation/AccessorValidationUtils";

@Component({})
export default class WpJsonEditor extends Vue {
  // eslint-disable-next-line
  @Prop() public value!: any;

  // eslint-disable-next-line
  private editor: any | null = null;
  private internalChange = false;
  private options = {
    onChange: this.onChange,
    navigationBar: false,
    statusBar: false,
    mainMenuBar: false,
    modes: ["code"],
    mode: "code",
  };

  private onChange() {
    let error = false;
    let json = {};

    if (!this.editor) {
      error = true;
    } else {
      try {
        json = this.editor.get();
      } catch (err) {
        error = true;
      }
    }

    error = error || !this.isValid(json);

    if (error) {
      this.$emit("error", error);
    } else if (this.editor) {
      this.internalChange = true;
      this.$emit("input", json);
      this.$nextTick(() => {
        this.internalChange = false;
      });
    }
  }

  private isValid(json: any): boolean {
    if (json === null) {
      return true;
    }
    if (typeof json === "object") {
      let values = Object.values(json);
      for (const value of values) {
        if (!this.isValid(value)) {
          return false;
        }
      }
    } else if (typeof json === "string") {
      let validationResult = validateAccessor(json);
      if (!validationResult.is_valid && validationResult.error) {
        return false;
      }
    }
    return true;
  }

  private initView(): void {
    if (!this.editor) {
      const container = this.$refs.jsoneditor;
      this.editor = new JSONEditor(container, this.options);
    }
    if (this.value) {
      this.editor.set(this.value);
    }
  }

  private destroyView(): void {
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  }

  private mounted(): void {
    this.initView();
  }

  private beforeDestroy(): void {
    this.destroyView();
  }

  @Watch("value", { deep: true })
  // eslint-disable-next-line
  onPropertyChanged(value: any): void {
    if (this.editor && value && !this.internalChange) {
      this.editor.set(value);
    }
  }
}
</script>

<style lang="scss">
@import "~jsoneditor/dist/jsoneditor.min.css";

.jsoneditor-container {
  .jsoneditor-box {
    height: calc(100% - 16px);

    .jsoneditor {
      background: $ui-02 !important;
      border: 0 !important;

      &:hover {
        cursor: pointer;
        background: $decorative-01 !important;
      }

      .jsoneditor-tree {
        background: unset;

        .jsoneditor-expandable {
          .jsoneditor-button {
            background-position: center;
            background-repeat: no-repeat;
            background-size: 40%;
            &.jsoneditor-expanded {
              background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/PjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ5MC42NTYgNDkwLjY1NiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDkwLjY1NiA0OTAuNjU2OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+PGc+PHBhdGggZD0iTTQ4Ny41MzYsMTIwLjQ0NWMtNC4xNi00LjE2LTEwLjkyMy00LjE2LTE1LjA4MywwTDI0NS4zMzksMzQ3LjU4MUwxOC4yMDMsMTIwLjQ2N2MtNC4xNi00LjE2LTEwLjkyMy00LjE2LTE1LjA4MywwYy00LjE2LDQuMTYtNC4xNiwxMC45MjMsMCwxNS4wODNsMjM0LjY2NywyMzQuNjY3YzIuMDkxLDIuMDY5LDQuODIxLDMuMTE1LDcuNTUyLDMuMTE1czUuNDYxLTEuMDQ1LDcuNTMxLTMuMTM2bDIzNC42NjctMjM0LjY2N0M0OTEuNjk2LDEzMS4zNjgsNDkxLjY5NiwxMjQuNjA1LDQ4Ny41MzYsMTIwLjQ0NXoiLz48L2c+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjwvc3ZnPg==");
            }
            &.jsoneditor-collapsed {
              background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/PjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ5MC42NTEgNDkwLjY1MSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDkwLjY1MSA0OTAuNjUxOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+PGc+PHBhdGggZD0iTTM3MC4yLDIzNy43ODdMMTM1LjUzMywzLjEyYy00LjE2LTQuMTYtMTAuOTIzLTQuMTYtMTUuMDgzLDBjLTQuMTYsNC4xNi00LjE2LDEwLjkyMywwLDE1LjA4M2wyMjcuMTM2LDIyNy4xMTVMMTIwLjQ1MSw0NzIuNDUzYy00LjE2LDQuMTYtNC4xNiwxMC45MjMsMCwxNS4wODNjMi4wOTEsMi4wNjksNC44MjEsMy4xMTUsNy41NTIsMy4xMTVzNS40NjEtMS4wNDUsNy41MzEtMy4xMTVMMzcwLjIsMjUyLjg2OUMzNzQuMzYsMjQ4LjcwOSwzNzQuMzYsMjQxLjk0NywzNzAuMiwyMzcuNzg3eiIvPjwvZz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PC9zdmc+");
            }
          }
        }
      }
    }
    .ace_cursor {
      border-color: $text-01;
    }
  }

  .ace_editor.ace_hidpi.ace-jsoneditor {
    font-size: 14px !important;
  }

  .ace_scroller {
    left: 65px !important;
    background: $ui-01 !important;
  }

  .ace_gutter {
    width: 65px !important;
  }

  .ace_gutter-cell {
    padding-left: $spacing-06;
    padding-right: $spacing-06;
    text-align: left;
  }

  .ace_gutter-layer {
    width: 65px !important;
  }

  .ace_content {
    background-color: $ui-01;
  }

  .ace_indent-guide {
    background: none;
  }

  .space-container {
    display: flex;
    height: 16px;

    .space-left {
      width: 65px;
    }

    .space-right {
      width: calc(100% - 65px);
      background-color: $ui-01;
    }
  }

  .ace-jsoneditor .ace_variable {
    color: $text-01;
  }

  .ace_gutter-cell.ace_error {
    background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTguMDAwMTMgMC45OTk5MkM3LjA3OTI5IDAuOTk0MjExIDYuMTY2NDcgMS4xNzEzNyA1LjMxNDYxIDEuNTIxMTNDNC40NjI3NSAxLjg3MDkgMy42ODg4MSAyLjM4NjI5IDMuMDM3NjYgMy4wMzc0NEMyLjM4NjUxIDMuNjg4NiAxLjg3MTExIDQuNDYyNTQgMS41MjEzNSA1LjMxNDRDMS4xNzE1OSA2LjE2NjI1IDAuOTk0NDI0IDcuMDc5MDcgMS4wMDAxMyA3Ljk5OTkyQzAuOTk0NDI0IDguOTIwNzcgMS4xNzE1OSA5LjgzMzU5IDEuNTIxMzUgMTAuNjg1NEMxLjg3MTExIDExLjUzNzMgMi4zODY1MSAxMi4zMTEyIDMuMDM3NjYgMTIuOTYyNEMzLjY4ODgxIDEzLjYxMzUgNC40NjI3NSAxNC4xMjg5IDUuMzE0NjEgMTQuNDc4N0M2LjE2NjQ3IDE0LjgyODUgNy4wNzkyOSAxNS4wMDU2IDguMDAwMTMgMTQuOTk5OUM4LjkyMDk4IDE1LjAwNTYgOS44MzM4IDE0LjgyODUgMTAuNjg1NyAxNC40Nzg3QzExLjUzNzUgMTQuMTI4OSAxMi4zMTE1IDEzLjYxMzUgMTIuOTYyNiAxMi45NjI0QzEzLjYxMzggMTIuMzExMiAxNC4xMjkyIDExLjUzNzMgMTQuNDc4OSAxMC42ODU0QzE0LjgyODcgOS44MzM1OSAxNS4wMDU4IDguOTIwNzcgMTUuMDAwMSA3Ljk5OTkyQzE1LjAwNTggNy4wNzkwNyAxNC44Mjg3IDYuMTY2MjUgMTQuNDc4OSA1LjMxNDRDMTQuMTI5MiA0LjQ2MjU0IDEzLjYxMzggMy42ODg2IDEyLjk2MjYgMy4wMzc0NEMxMi4zMTE1IDIuMzg2MjkgMTEuNTM3NSAxLjg3MDkgMTAuNjg1NyAxLjUyMTEzQzkuODMzOCAxLjE3MTM3IDguOTIwOTggMC45OTQyMTEgOC4wMDAxMyAwLjk5OTkyWk0xMC43MjI2IDExLjQ5OTlMNC41MDAxMyA1LjI3Nzc3TDUuMjc3OTggNC40OTk5MkwxMS41MDAxIDEwLjcyMjNMMTAuNzIyNiAxMS40OTk5WiIgZmlsbD0iI0ZBNEQ1NiIvPgo8L3N2Zz4K");
    background-size: 14px;
    background-position-x: 6.25%;
  }

  .ace_line .ace_fold {
    background-color: $ui-01;
    background-size: 28px 14px;
    border-radius: 20px;
    border: none;
    position: relative;
    top: 1px;
  }

  .ace_fold-widget {
    background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01IDYuMDAwMDJMMCAxLjAwMDAyTDAuNyAwLjMwMDAxOEw1IDQuNjAwMDJMOS4zIDAuMzAwMDE4TDEwIDEuMDAwMDJMNSA2LjAwMDAyWiIgZmlsbD0iI0Y0RjRGNCIvPgo8L3N2Zz4K");
    width: 10px;
    height: 5.7px !important;
    position: relative;
    top: 5.3px;
    left: 7px;
  }

  .ace_fold-widget.ace_closed {
    transform: rotate(-90deg);
  }

  .ace_marker-layer .ace_selection {
    background: rgba(11, 183, 152, 0.2);
  }
}

div.jsoneditor-tree button.jsoneditor-button {
  width: 18px;
  height: 18px;
}

div.jsoneditor-field,
div.jsoneditor-value,
div.jsoneditor td,
div.jsoneditor th,
div.jsoneditor textarea,
pre.jsoneditor-preview,
.jsoneditor-schema-error,
.jsoneditor-popover {
  font-size: 12px !important;
}

.jsoneditor-container:hover .max-btn {
  display: block;
}

.dark {
  .jsoneditor-container {
    .ace_gutter {
      background-color: #414141;
    }

    .ace_gutter-cell {
      color: #a8a8a8;
    }

    .ace_gutter-cell.ace_gutter-active-line {
      background-color: #4a4a4a;
    }

    .ace-jsoneditor .ace_string,
    .ace-jsoneditor .ace_string.ace_regex {
      color: $icon-green;
    }

    .ace-jsoneditor .ace_constant.ace_numeric {
      color: #9975ff;
    }

    .ace-jsoneditor .ace_constant .ace_language .ace_boolean {
      color: #e2a123;
    }

    .ace_line {
      color: #8d8d8d;
    }

    .ace-jsoneditor .ace_marker-layer .ace_active-line {
      background: #333333;
    }

    .ace_line .ace_fold {
      background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAzMCAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04IDFDNC4xMzQwMSAxIDEgNC4xMzQwMSAxIDhDMSAxMS44NjYgNC4xMzQwMSAxNSA4IDE1SDIyQzI1Ljg2NiAxNSAyOSAxMS44NjYgMjkgOEMyOSA0LjEzNDAxIDI1Ljg2NiAxIDIyIDFIOFpNNSA4TDEwIDNMMTAuNyAzLjdMNi40IDhMMTAuNyAxMi4zTDEwIDEzTDUgOFpNMjQuNzAwOCA4TDE5LjcwMDggMTNMMTkuMDAwOCAxMi4zTDIzLjMwMDggOEwxOS4wMDA4IDMuN0wxOS43MDA4IDNMMjQuNzAwOCA4WiIgZmlsbD0iIzhEOEQ4RCIvPgo8L3N2Zz4K");
    }

    .ace_fold-widget {
      background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01IDYuMDAwMDJMMCAxLjAwMDAyTDAuNyAwLjMwMDAxOEw1IDQuNjAwMDJMOS4zIDAuMzAwMDE4TDEwIDEuMDAwMDJMNSA2LjAwMDAyWiIgZmlsbD0iI0Y0RjRGNCIvPgo8L3N2Zz4K");
    }

    .space-left {
      background-color: #414141;
    }
  }
}

.light {
  .jsoneditor-container {
    .ace_gutter {
      background-color: #eaeaea;
    }

    .ace_gutter-cell {
      color: #6f6f6f;
    }

    .ace_gutter-cell.ace_gutter-active-line {
      background-color: #dedede;
    }

    .ace-jsoneditor .ace_string,
    .ace-jsoneditor .ace_string.ace_regex {
      color: #0a9d81;
    }

    .ace-jsoneditor .ace_constant.ace_numeric {
      color: #7e51ff;
    }

    .ace-jsoneditor .ace_constant .ace_language .ace_boolean {
      color: #e39600;
    }
    .ace_line {
      color: #262626;
    }

    .ace-jsoneditor .ace_marker-layer .ace_active-line {
      background: #e8e8e8;
    }

    .ace_line .ace_fold {
      background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAyOCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik03IDBDMy4xMzQwMSAwIDAgMy4xMzQwMSAwIDdDMCAxMC44NjYgMy4xMzQwMSAxNCA3IDE0SDIxQzI0Ljg2NiAxNCAyOCAxMC44NjYgMjggN0MyOCAzLjEzNDAxIDI0Ljg2NiAwIDIxIDBIN1pNNCA3TDkgMkw5LjcgMi43TDUuNCA3TDkuNyAxMS4zTDkgMTJMNCA3Wk0yMy43MDA4IDdMMTguNzAwOCAxMkwxOC4wMDA4IDExLjNMMjIuMzAwOCA3TDE4LjAwMDggMi43TDE4LjcwMDggMkwyMy43MDA4IDdaIiBmaWxsPSIjOEQ4RDhEIi8+Cjwvc3ZnPgo=");
    }

    .ace_fold-widget {
      background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01IDYuMDAwMDVMMCAxLjAwMDA1TDAuNyAwLjMwMDA0OUw1IDQuNjAwMDVMOS4zIDAuMzAwMDQ5TDEwIDEuMDAwMDVMNSA2LjAwMDA1WiIgZmlsbD0iIzI2MjYyNiIvPgo8L3N2Zz4K");
    }

    .space-left {
      background-color: #eaeaea;
    }
  }
}
</style>
