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
      <TextSmallCaps />
    </template>
  </Modifier>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import Modifier from "@/components/modifiers/Modifier.vue";
// @ts-ignore
import TextSmallCaps from "@carbon/icons-vue/es/text--small-caps/16";
import { LowercaseDetails } from "@/core/Extractor/Modifiers";

@Component({
  components: { Modifier, TextSmallCaps },
})
export default class LowercaseModifier extends Vue {
  private title = "editor.modifiers.lowercase";
  private description = "editor.modifiers.descriptions.lowercase";
  private className = "lowercase";
  @Prop() private data!: LowercaseDetails;
  @Prop() private selected!: boolean;
  @Prop() public hasNext!: boolean;
  @Prop() public hasPrev!: boolean;
}
</script>

<style scoped lang="scss" />
