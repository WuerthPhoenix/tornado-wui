<template>
  <div class="notification-container">
    <Notification
      name="notification-transition"
      v-for="notification in notifications"
      v-bind:key="notification.id + '_notification'"
      :notification="notification"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NotificationStore, { NotificationDto } from "@/store/notification";
import Notification from "./Notification.vue";
@Component({
  components: { Notification },
})
export default class NotificationContainer extends Vue {
  get notifications(): NotificationDto[] {
    return NotificationStore.notifications;
  }
}
</script>

<style lang="scss" scoped>
.notification-container {
  overflow: hidden;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9999;
}
</style>
