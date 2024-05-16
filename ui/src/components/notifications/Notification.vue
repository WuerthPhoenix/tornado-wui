<template>
  <div class="notification">
    <transition name="animation" v-on:after-leave="onAnimationEnded">
      <cv-toast-notification
        v-if="isVisible"
        :kind="notification.kind"
        :caption="notification.message"
        :title="notification.title"
        @close="hide()"
      ></cv-toast-notification>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import NotificationStore, { NotificationDto } from "@/store/notification";

// @ts-ignore
import { CvToastNotification } from "@carbon/vue/src/components/cv-toast-notification";

@Component({
  components: {
    CvToastNotification,
  },
})
export default class Notification extends Vue {
  @Prop() notification!: NotificationDto;

  private isVisible = true;

  private hide() {
    this.isVisible = false;
  }

  private onAnimationEnded(): void {
    NotificationStore.removeNotification(this.notification);
  }

  mounted(): void {
    this.$nextTick(function () {
      setTimeout(() => {
        this.isVisible = false;
      }, 5000);
    });
  }
}
</script>

<style lang="scss" scoped>
.cv-notification {
  position: relative;
  right: 0;
  max-height: 999px;
  z-index: 9999;
}

.animation-enter-active,
.animation-leave-active {
  transition-timing-function: carbon--motion(standard, expressive);
  transition: right $moderate-01, max-height $moderate-01 $moderate-01;
}

.animation-enter,
.animation-leave-to {
  right: -100%;
  max-height: 0;
}
</style>
