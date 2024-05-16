<template>
  <Modifier
    :title="title"
    :description="description"
    :selected="selected"
    v-on="$listeners"
    :has-next="hasNext"
    :has-prev="hasPrev"
    :class-name="className"
  >
    <template v-slot:icon>
      <Cut />
    </template>
  </Modifier>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import Modifier from "@/components/modifiers/Modifier.vue";
// @ts-ignore
import Cut from "@carbon/icons-vue/es/cut/16";
import { TrimDetails } from "@/core/Extractor/Modifiers";

@Component({
  components: { Modifier, Cut },
})
export default class TrimModifier extends Vue {
  private title = "editor.modifiers.trim";
  private description = "editor.modifiers.descriptions.trim";
  private className = "trim";
  @Prop() private data!: TrimDetails;
  @Prop() private selected!: boolean;
  @Prop() public hasNext!: boolean;
  @Prop() public hasPrev!: boolean;
}
</script>

<style scoped lang="scss" />
