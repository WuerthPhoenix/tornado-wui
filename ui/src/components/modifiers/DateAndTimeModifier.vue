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
      <EventSchedule />
    </template>
    <template v-slot:modifier-specific-ui>
      <div class="date-and-time">
        <div class="modifier-input-row">
          <div class="modifier-input-label">
            {{ $tc("editor.modifiers.DateAndTime.timezone") }}
          </div>
          <div class="modifier-input">
            <cv-select
              label="timezone"
              v-model="editableData.timezone"
              :disabled="!editMode"
              @blur="updateModifier"
              :light="true"
            >
              <option disabled value="">
                {{ $tc("editor.modifiers.DateAndTime.select") }}
              </option>
              <option
                v-for="timezone in timezones"
                :key="timezone"
                :value="timezone"
              >
                {{ timezone }}
              </option>
            </cv-select>
          </div>
        </div>
      </div>
    </template>
  </Modifier>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import Modifier from "@/components/modifiers/Modifier.vue";
import { cloneDeep } from "lodash";
import Tornado from "@/store/tornado";
import { DateAndTimeDetails } from "@/core/Extractor/Modifiers";
// @ts-ignore
import EventSchedule from "@carbon/icons-vue/es/event--schedule/16";
import { getTimezones } from "@/utils/timezoneHelper";
import User from "@/store/user";

// @ts-ignore
import { CvSelect } from "@carbon/vue/src/components/cv-select";

@Component({
  components: { Modifier, EventSchedule, CvSelect },
})
export default class DateAndTimeModifier extends Vue {
  private title = "editor.modifiers.DateAndTime.DateAndTime";
  private description = "editor.modifiers.descriptions.DateAndTime";
  private className = "date-and-time-modifier";
  @Prop() private data!: DateAndTimeDetails;
  @Prop() private selected!: boolean;
  @Prop() public hasNext!: boolean;
  @Prop() public hasPrev!: boolean;

  private editableData = cloneDeep(this.data);

  @Watch("data", { immediate: true, deep: true })
  onPropertyChanges(newData: DateAndTimeDetails): void {
    this.editableData = cloneDeep(newData);
  }

  private mounted() {
    if (this.editableData == null) {
      return;
    }

    this.autocompileTimezone();
  }

  private autocompileTimezone() {
    // if we got data from response do nothing.
    if (!this.isNew()) {
      return;
    }
    if (
      User.info != null &&
      User.info.preferences.timezone != null &&
      User.info.preferences.timezone != "UTC"
    ) {
      // Set timezone from user preferences
      this.editableData.timezone = User.info?.preferences.timezone;
    } else {
      // Set default browser timezone
      this.editableData.timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    this.$emit("update", this.editableData);
  }

  private isNew() {
    /* new modifier always has empty timezone */
    return this.data.timezone === "";
  }

  updateModifier(): void {
    if (this.editMode) {
      this.$emit("update", this.editableData);
    }
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }

  get timezones(): string[] {
    return getTimezones();
  }

  private handleToggleClick(e: PointerEvent): void {
    if (!this.editMode) {
      e.preventDefault();
    }
  }
}
</script>

<style lang="scss" scoped>
.modifier-input-row {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-bottom: 16px;

  .modifier-input-label {
    font-family: IBM Plex Sans;
    font-size: 12px;
    font-weight: 400;
    padding: 4px 16px;
    min-width: 98px;
    color: $text-00;
  }

  .modifier-input {
    padding: 4px 16px;
  }
}
</style>

<style lang="scss">
.date-and-time-modifier .date-and-time .modifier-input-row {
  .modifier-input {
    .bx--label {
      display: none;
    }

    .bx--text-input {
      background: $ui-input;
      border-bottom: 1px solid $ui-input-border !important;
      height: 1.875rem;
      font-family: IBM Plex Sans;
      font-size: 14px;
      font-weight: 400;
      padding-right: 0.5rem;
      padding-left: 0.5rem;
      max-width: 153px;
    }
  }

  .bx--toggle__switch {
    font-family: IBM Plex Sans;
    margin: 0 !important;
  }
}
</style>
