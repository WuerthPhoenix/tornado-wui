<template>
  <div
    id="app"
    class="shiftable"
    :class="{ 'shiftable--shifted-left': testWindowIsOpen }"
  >
    <ToolBar
      @toggleShift="toggleShift"
      class="shiftable"
      :class="{ 'shiftable--shifted-left': testWindowIsOpen }"
    />
    <TestWindow
      v-if="isProcessingTreeLoaded"
      @toggle="toggleTestWindow"
      :is-open="testWindowIsOpen"
    />
    <NotificationContainer />
    <router-view class="router-container" v-if="ready" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { setLocale } from "@/utils/i18n";
import User, { ThemeDto } from "@/store/user";
import NotificationContainer from "@/components/notifications/NotificationContainer.vue";
import ToolBar from "@/components/ToolBar.vue";
import Tornado from "@/store/tornado";
import TestWindow from "@/components/TestWindow.vue";

@Component({
  components: {
    TestWindow,
    ToolBar,
    NotificationContainer: NotificationContainer,
  },
})
export default class App extends Vue {
  private ready = false;
  private testWindowIsOpen = false;

  get isProcessingTreeLoaded(): boolean {
    return Tornado.treeInfo !== null;
  }

  get theme(): ThemeDto {
    let userTheme = ThemeDto.dark;

    if (User.info) {
      userTheme = User.info.preferences.theme;
      if (userTheme === ThemeDto.system) {
        if (
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
          userTheme = ThemeDto.dark;
        } else {
          userTheme = ThemeDto.light;
        }
      }
    }

    return userTheme;
  }

  public toggleTestWindow(): void {
    this.testWindowIsOpen = !this.testWindowIsOpen;
  }

  public async beforeMount(): Promise<void> {
    if (this.$store) {
      this.$store.subscribe((mutation) => {
        if (
          mutation.type === "setInfo" ||
          mutation.type === "setSelectedTenant"
        ) {
          Tornado.initializeCurrentTree([]);
          Tornado.setTreeInfo(null);
          Promise.all([
            Tornado.updateTreeInfo(),
            Tornado.getCurrentTreeChildNodes([]),
          ]);
        }
      });
    }
    await Promise.all([setLocale(), User.updateInfo()]).then(this.onReady);
  }

  public onReady(): void {
    this.ready = true;

    // Set theme class on body element
    const body = document.querySelector("body");
    if (body) {
      body.classList.remove(...[ThemeDto.dark, ThemeDto.light]);
      body.classList.add(this.theme);
    }
  }

  public toggleShift(status: boolean): void {
    if (status) {
      this.testWindowIsOpen = true;
      return;
    }
    this.testWindowIsOpen = false;
  }
}
</script>

<style lang="scss">
body,
html,
#app {
  height: 100%;
}

body.light {
  background-color: #efefef;
}

#app {
  max-width: 100vw;
  overflow-x: hidden;
}

.shiftable {
  max-width: 100%;
  transition-property: max-width;
  transition-timing-function: carbon--motion(standard, expressive);
  transition-duration: $moderate-01;

  &--shifted-left {
    max-width: calc(100% - 432px) !important;
  }
}

.cv-tooltip {
  &:before {
    z-index: 10000 !important;
  }
}

[data-wp-direction="bottom-right"] {
  &:before {
    left: initial !important;
    right: calc(50% - 0.6rem);
  }
  .bx--assistive-text {
    transform: translate(0%, 100%) !important;
    right: 0;
    left: initial !important;
  }
}

.cv-tooltip:not(:hover) {
  &:before {
    display: none !important;
  }
  .bx--assistive-text {
    display: none !important;
  }
}

.params__params-box {
  .resizable__input {
    width: 100%;
  }
}
</style>
