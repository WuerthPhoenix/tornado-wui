<template>
  <div class="actions-editor">
    <div v-if="isEmpty && showNoActionMessage">
      {{ $tc("editor.no_actions_found") }}
    </div>
    <div v-else>
      <component
        v-for="(action, index) in editableActions"
        :action="action"
        :is="getComponentByActionType(action.id)"
        :key="getActionKey(index)"
        @delete="deleteAction(index)"
        @update="updateAction(index, $event)"
        @action-selected="addAction(index, $event)"
        :data-self="`${action.id}-${index}`"
      />
    </div>
    <AddActionButton
      class="add-action-btn"
      :value="$tc('editor.add_action')"
      @action-selected="addAction(editableActions.length, $event)"
      v-if="editMode"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Constructor } from "@/utils/types";
import LoggerAction from "@/components/editor/actions/LoggerAction.vue";
import ForeachAction from "@/components/editor/actions/ForeachAction.vue";
import ArchiveAction from "@/components/editor/actions/ArchiveAction.vue";
import DirectorAction from "@/components/editor/actions/DirectorAction.vue";
import ElasticsearchAction from "@/components/editor/actions/ElasticsearchAction.vue";
import Icinga2Action from "@/components/editor/actions/Icinga2Action.vue";
import SmartMonitoringCheckResultAction from "@/components/editor/actions/SmartMonitoringCheckResultAction.vue";
import ScriptAction from "@/components/editor/actions/ScriptAction.vue";
import Action from "@/components/editor/actions/Action.vue";
import { cloneDeep } from "lodash";
import Tornado from "@/store/tornado";
import { BaseAction } from "@/core/Action/Actions";
import AddActionButton from "@/components/editor/AddActionButton.vue";
import { ActionFactory } from "@/core/Action/ActionFactory";

@Component({
  name: "ActionsEditor",
  components: { AddActionButton, LoggerAction, Icinga2Action, Action },
})
export default class ActionsEditor extends Vue {
  @Prop({ default: [] }) public actions!: BaseAction[];
  @Prop({ default: true }) public showNoActionMessage!: boolean;

  private editableActions: BaseAction[] = [];

  @Watch("actions", { immediate: true, deep: true })
  private actionsUpdated(actions: BaseAction[]): void {
    this.editableActions = cloneDeep(actions);
  }

  get isEmpty(): boolean {
    return this.editableActions.length === 0;
  }

  getComponentByActionType(actionType: string): Constructor<Vue> {
    switch (actionType) {
      case "logger":
        return LoggerAction;
      case "foreach":
        return ForeachAction;
      case "archive":
        return ArchiveAction;
      case "director":
        return DirectorAction;
      case "elasticsearch":
        return ElasticsearchAction;
      case "icinga2":
        return Icinga2Action;
      case "smart_monitoring_check_result":
        return SmartMonitoringCheckResultAction;
      case "script":
        return ScriptAction;
      default:
        return Action;
    }
  }

  getActionKey(index: number): string {
    return `${this.editableActions.length}-${index}-${this.editableActions[index].id}`;
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }

  private addAction(index: number, action: string) {
    const newAction = ActionFactory.buildDefaultActionById(action);
    this.editableActions.splice(index + 1, 0, newAction);
    this.$emit("update", this.editableActions);
  }

  private deleteAction(index: number) {
    this.editableActions.splice(index, 1);
    this.$emit("update", this.editableActions);
  }

  private updateAction(index: number, editedAction: BaseAction) {
    this.editableActions[index] = editedAction as BaseAction;
    this.$emit("update", this.editableActions);
  }
}
</script>
<style lang="scss">
.actions-editor {
  .bx--text-input {
    border-bottom: none;
  }
}
</style>
