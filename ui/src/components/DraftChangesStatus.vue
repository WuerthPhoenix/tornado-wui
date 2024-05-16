<template>
  <div class="draft-changes-status" :class="state">
    <cv-tooltip alignment="center" direction="bottom" :tip="tipMessage">
      <div class="status-message">{{ statusMessage }}</div>
      <div class="icon">
        <CheckmarkFilled v-if="state === 'saved'" />
        <ErrorFilled v-if="state === 'error'" />
        <PendingFilled v-if="state === 'saving' || state === 'unsaved'" />
      </div>
    </cv-tooltip>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
// @ts-ignore
import CheckmarkFilled from "@carbon/icons-vue/es/checkmark--filled/16";
// @ts-ignore
import ErrorFilled from "@carbon/icons-vue/es/error--filled/16";
// @ts-ignore
import PendingFilled from "@carbon/icons-vue/es/pending--filled/16";
import i18n from "@/utils/i18n";

// @ts-ignore
import { CvTooltip } from "@carbon/vue/src/components/cv-tooltip";

export type DraftChangesState = "saving" | "error" | "saved" | "unsaved";

@Component({
  components: {
    CheckmarkFilled,
    ErrorFilled,
    PendingFilled,
    CvTooltip,
  },
})
export default class DraftChangesStatus extends Vue {
  @Prop({ default: "saved" }) state!: DraftChangesState;
  @Prop() errorMessage!: string;

  get statusMessage(): string {
    switch (this.state) {
      case "saving":
        return i18n.tc("edit_mode.draft_status.saving");
      case "error":
        return i18n.tc("edit_mode.draft_status.error");
      case "saved":
        return i18n.tc("edit_mode.draft_status.saved");
      case "unsaved":
        return i18n.tc("edit_mode.draft_status.unsaved_changes");
    }
    return "";
  }

  get tipMessage(): string {
    switch (this.state) {
      case "saving":
        return i18n.tc("edit_mode.draft_status.saving_in_progress");
      case "error":
        return this.errorMessage;
      case "saved":
        return i18n.tc("edit_mode.draft_status.all_changes_saved");
      case "unsaved":
        return i18n.tc("edit_mode.draft_status.there_are_unsaved_changes");
    }
    return "";
  }
}
</script>

<style lang="scss" scoped>
.draft-changes-status {
  display: flex;
  margin-right: $spacing-05;
  align-items: center;
}

.status-message {
  color: $text-05;
  font-size: 14px;
  margin-right: $spacing-03;
}

.icon {
  align-items: center;
  display: flex;
}

.saved {
  .icon svg {
    fill: $icon-green;
  }
}

.error {
  .icon svg {
    fill: #fa4d56;
  }
}

.unsaved {
  .icon svg {
    fill: #e2b100;
  }
}

.saving {
  .icon svg {
    fill: #e2b100;
  }
}
</style>
