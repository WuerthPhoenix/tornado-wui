<template>
  <div class="dashboard-tile-processing-tree">
    <cv-tile class="dashboard-tile-content">
      <div class="header">
        <h5>{{ $tc("views.dashboard.tiles.processing_tree") }}</h5>
        <div class="tile-icon">
          <TornadoIcon />
        </div>
      </div>
      <div class="processing-tree-container">
        <div class="processing-tree-list">
          <div class="processing-tree-row rules">
            <div class="label">
              <Rule16 />
              {{ $tc("views.dashboard.tiles.rules") }}
            </div>
            <cv-skeleton-text
              v-if="isLoading"
              width="50px"
              class="value"
            ></cv-skeleton-text>
            <div v-else class="value">{{ rulesCount }}</div>
          </div>

          <div class="processing-tree-row filters">
            <div class="label">
              <Filter16 />
              {{ $tc("views.dashboard.tiles.filters") }}
            </div>
            <cv-skeleton-text
              v-if="isLoading"
              width="50px"
              class="value"
            ></cv-skeleton-text>
            <div v-else class="value">{{ filtersCount }}</div>
          </div>

          <div class="processing-tree-row last-edit">
            <div class="label">
              <RecentlyViewed16 />
              {{ $tc("views.dashboard.tiles.last_edit") }}
            </div>
            <div class="value">{{ lastEdit }}</div>
          </div>
        </div>

        <cv-button
          class="open-processing-tree-btn"
          kind="primary"
          size="lg"
          @click="openProcessingTree"
        >
          {{ $tc("views.dashboard.tiles.open_processing_tree") }}
        </cv-button>
      </div>
    </cv-tile>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Tornado from "@/store/tornado";
// @ts-ignore
import Rule16 from "@carbon/icons-vue/es/rule/16";
// @ts-ignore
import Filter16 from "@carbon/icons-vue/es/filter/16";
// @ts-ignore
import RecentlyViewed16 from "@carbon/icons-vue/es/recently-viewed/16";
import TornadoIcon from "@/components/icons/TornadoIcon.vue";

// @ts-ignore
import { CvTile } from "@carbon/vue/src/components/cv-tile";
// @ts-ignore
import { CvButton } from "@carbon/vue/src/components/cv-button";
// @ts-ignore
import { CvSkeletonText } from "@carbon/vue/src/components/cv-skeleton-text";

@Component({
  components: {
    TornadoIcon,
    Rule16,
    Filter16,
    RecentlyViewed16,
    CvTile,
    CvButton,
    CvSkeletonText,
  },
})
export default class DashboardTileProcessingTree extends Vue {
  get rulesCount(): string {
    if (Tornado.treeInfo) {
      return "" + Tornado.treeInfo.rules_count;
    }
    return "N/A";
  }

  get filtersCount(): string {
    if (Tornado.treeInfo) {
      return "" + Tornado.treeInfo.filters_count;
    }
    return "N/A";
  }

  get lastEdit(): string {
    return "N/A";
  }

  get isLoading(): boolean {
    return Tornado.treeInfo === null;
  }

  openProcessingTree(): void {
    this.$router.push(`/tree`);
  }
}
</script>

<style lang="scss" scoped>
.dashboard-tile-content {
  min-height: 350px !important;
  position: relative;
}

.header {
  display: flex;
  justify-content: space-between;
}

.processing-tree-container {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;

  .processing-tree-list {
    margin: 32px 16px;

    .processing-tree-row {
      padding: 8px 0;
      display: flex;
      justify-content: space-between;

      .label svg {
        position: relative;
        top: 3px;
      }

      .value {
        font-weight: 600;
        align-self: flex-end;
      }
    }
  }

  .open-processing-tree-btn {
    width: 100%;
    max-width: 100%;
  }
}

.dark {
  .processing-tree-row {
    border-top: 1px solid $carbon--gray-70;
  }
}

.light {
  .processing-tree-row {
    border-top: 1px solid $carbon--gray-20;
  }
}
</style>

<style lang="scss">
.dashboard-tile-processing-tree {
  .bx--skeleton__text {
    margin: 0;
  }
}
</style>
