<template>
  <div class="extrator-groups-idx-input-field">
    <cv-number-input
      class="editable-operator-value"
      :light="true"
      v-model="editableValue"
      :placeholder="$tc('editor.group_match_idx_empty')"
      @beforeinput="blockInvalidChar"
      @input="onChangeGroupMatchIdx"
      @blur="updateInput"
      :disabled="disabled"
    ></cv-number-input>
    <div
      class="to-allgroups"
      :class="{ 'to-allgroups--null': isGroupIdxValueNull }"
    >
      <cv-tooltip
        :tip="$tc('editor.group_match_idx_empty')"
        direction="left"
        v-if="!isGroupIdxValueNull && !disabled"
      >
        <cv-button @click="setGroupIDxNull">
          <CollapseAll16 />
        </cv-button>
      </cv-tooltip>

      <cv-button v-else disabled="true">
        <CollapseAll16 />
      </cv-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
// @ts-ignore
import CollapseAll16 from "@carbon/icons-vue/es/collapse-all/16";

// @ts-ignore
import { CvTooltip } from "@carbon/vue/src/components/cv-tooltip";
// @ts-ignore
import { CvButton } from "@carbon/vue/src/components/cv-button";
// @ts-ignore
import { CvNumberInput } from "@carbon/vue/src/components/cv-number-input";

import { isEqual } from "lodash";
@Component({
  components: {
    CollapseAll16,
    CvTooltip,
    CvButton,
    CvNumberInput,
  },
})
export default class ExtractorGroupsIdxInputField extends Vue {
  @Prop({ default: null }) public value!: number | null;
  @Prop({ default: false }) public disabled!: boolean;

  private editableValue!: number | null;
  private isGroupIdxValueNull = true;

  @Watch("value", { deep: true, immediate: true })
  onValueChanged(value: number | null): void {
    this.editableValue = value;
    this.onChangeGroupMatchIdx(value);
  }

  private blockInvalidChar(e: InputEvent): void {
    if (e.data !== null && e.data.match(/^\d+$/) === null) {
      e.preventDefault();
    }
  }
  private onChangeGroupMatchIdx(value: number | null) {
    if (value === null || isNaN(value)) {
      this.isGroupIdxValueNull = true;
      this.editableValue = null;
    } else {
      this.isGroupIdxValueNull = false;
      this.editableValue = Number(value);
    }
  }

  private setGroupIDxNull(): void {
    if (this.isGroupIdxValueNull) {
      return;
    }
    this.isGroupIdxValueNull = true;
    this.editableValue = null;
    this.updateInput();
  }

  private updateInput() {
    if (isEqual(this.editableValue, this.value)) {
      return;
    }
    this.$emit("update", this.editableValue);
  }
}
</script>

<style scoped lang="scss">
.extrator-groups-idx-input-field {
  display: flex;
}
.to-allgroups {
  width: 30px;
  height: 30px;
  background-color: $ui-02;
  margin-left: 2px;
  button {
    min-height: 1.875rem;
    width: 1.875rem;
    height: 1.875rem;
    padding: 0;
    justify-content: center;
    border: $ui-01 0.125rem;
    background-color: transparent;
    &:hover {
      background: $decorative-01;
    }
  }
}
.dark {
  .to-allgroups {
    button {
      color: white;
      svg {
        fill: #f4f4f4;
      }
    }
    &--null {
      button {
        svg {
          fill: #6f6f6f;
        }
      }
    }
  }
}

.light {
  .to-allgroups {
    button {
      color: black;
    }
  }
}
</style>
