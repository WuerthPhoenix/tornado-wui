<template>
  <Action :action="action" v-on="$listeners"> </Action>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
// @ts-ignore
import Action from "@/components/editor/actions/Action.vue";
import { LoggerAction as LoggerActionType } from "@/core/Action/Actions";

@Component({
  components: { Action },
})
export default class LoggerAction extends Vue {
  @Prop() public action!: LoggerActionType;
}
</script>

<style scoped lang="scss" />
