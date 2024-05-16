<template>
  <div class="dashboard">
    <cv-grid full-width>
      <cv-row kind="narrow">
        <cv-column>
          <h3 class="dashboard-title">
            {{ $tc("views.dashboard.dashboard") }}
          </h3>
        </cv-column>
      </cv-row>
      <cv-row kind="narrow">
        <cv-column :sm="12" :md="12" :lg="3" :xlg="3" :max="3">
          <dashboard-tile-processing-tree></dashboard-tile-processing-tree>
        </cv-column>
        <cv-column :sm="12" :md="12" :lg="6" :xlg="6" :max="6"></cv-column>
        <cv-column :sm="12" :md="12" :lg="3" :xlg="3" :max="3"></cv-column>
      </cv-row>
    </cv-grid>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import DashboardTileProcessingTree from "@/components/dashboard/DashboardTileProcessingTree.vue";
// @ts-ignore
import { CvGrid, CvRow, CvColumn } from "@carbon/vue/src/components/cv-grid";

@Component({
  components: { DashboardTileProcessingTree, CvGrid, CvRow, CvColumn },
})
export default class Dashboard extends Vue {}
</script>

<style lang="scss">
.dashboard {
  padding-top: calc(#{$spacing-07} + 56px);
}
.dashboard-title {
  margin-bottom: $spacing-05;
}
</style>
