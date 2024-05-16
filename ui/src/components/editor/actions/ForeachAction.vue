<template>
  <Action :action="action" v-on="$listeners" class="foreach-action">
    <slot>
      <div class="target-container">
        <div class="target-label">{{ $tc("editor.target") }}</div>
        <div class="target-value">
          <span v-if="!editMode">{{ payload.target }}</span>
          <OperatorValue
            v-else
            class="target-input"
            :light="true"
            v-model="payload.target"
            @change="targetUpdated"
            input-type="accessor"
          />
        </div>
      </div>

      <ActionsEditor
        :actions="nestedActions"
        :showNoActionMessage="false"
        @update="updateNestedActions"
      ></ActionsEditor>
    </slot>
  </Action>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
// @ts-ignore
import Action from "@/components/editor/actions/Action.vue";
import {
  BaseAction,
  ForeachAction as ForeachActionType,
} from "@/core/Action/Actions";
import { ForeachPayload } from "@/core/Action/Payload";
import { cloneDeep } from "lodash";
import Tornado from "@/store/tornado";
import OperatorValue from "@/components/editor/OperatorValue.vue";

@Component({
  name: "ForeachAction",
  components: {
    OperatorValue,
    ActionsEditor: () => import("../ActionsEditor.vue"),
    Action,
  },
})
export default class ForeachAction extends Vue {
  @Prop() public action!: ForeachActionType;

  private editableAction: ForeachActionType = cloneDeep(this.action);
  @Watch("action", { immediate: true, deep: true })
  private actionUpdated(action: ForeachActionType): void {
    this.editableAction = cloneDeep(action);
  }

  get nestedActions(): ForeachActionType[] {
    return this.payload.actions;
  }

  get payload(): ForeachPayload {
    return this.editableAction.payload as ForeachPayload;
  }

  updateNestedActions(editedActions: BaseAction[]): void {
    this.payload.actions = editedActions;
    this.$emit("update", this.editableAction);
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }

  targetUpdated(): void {
    this.$emit("update", this.editableAction);
  }
}
</script>

<style scoped lang="scss">
.target-container {
  display: flex;
  padding-top: 2px;

  .target-label {
    color: $icon-green;
    text-transform: uppercase;
  }

  .target-label {
    margin-right: 2px;
    padding: $spacing-03;
  }

  .target-value {
    width: 100%;
    background-color: $ui-02;

    span {
      padding: $spacing-03;
      display: block;
    }
  }
}
</style>

<style lang="scss">
.foreach-action {
  .target-input {
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
}
</style>
