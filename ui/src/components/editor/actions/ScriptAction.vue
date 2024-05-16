<template>
  <Action :action="action" v-on="$listeners" class="script-action">
    <slot>
      <div class="payload-property-container">
        <div class="payload-property-label">script</div>
        <div class="payload-property-value" v-if="!editMode">
          {{ payload.script }}
        </div>
        <OperatorValue
          v-else
          class="editable-operator-value"
          :light="true"
          v-model="payload.script"
          @change="update"
          input-type="accessor"
        />
      </div>
      <div class="payload-property-container">
        <div class="payload-property-label">args</div>
        <MultiTagInput
          @change="change"
          :items="payload.args"
          :disabled="!editMode"
        />
      </div>
    </slot>
  </Action>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
// @ts-ignore
import Action from "@/components/editor/actions/Action.vue";
import { ScriptAction as ScriptActionType } from "@/core/Action/Actions";
import { cloneDeep, isEqual } from "lodash";
import Tornado from "@/store/tornado";
import { ScriptPayload } from "@/core/Action/Payload";
import MultiTagInput from "@/components/common/input/MultiTagInput.vue";
import OperatorValue from "@/components/editor/OperatorValue.vue";

@Component({ components: { OperatorValue, MultiTagInput, Action } })
export default class ScriptAction extends Vue {
  @Prop() public action!: ScriptActionType;

  private editableAction: ScriptActionType = cloneDeep(this.action);

  get payload(): ScriptPayload {
    if (this.editMode) return this.editableAction.payload as ScriptPayload;
    return this.action.payload as ScriptPayload;
  }

  @Watch("action", { immediate: true, deep: true })
  private actionUpdated(action: ScriptActionType): void {
    this.editableAction = cloneDeep(action);
  }

  update(): void {
    if (isEqual(this.editableAction, this.action)) {
      return;
    }
    this.$emit("update", this.editableAction);
  }

  change(params: string[]): void {
    (this.editableAction.payload as ScriptPayload).args = params;
    this.update();
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }
}
</script>
<style lang="scss">
.script-action {
  label {
    display: none;
  }

  .bx--text-input__field-wrapper {
    height: 30px;
  }

  input {
    border: 0;
    height: 30px;
    padding: $spacing-03;
  }
}
</style>
