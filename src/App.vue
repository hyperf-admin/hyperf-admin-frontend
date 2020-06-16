<template>
  <div
    id="app"
    @click="handleAppAction"
    @mousedown="handleAppAction"
    @touchstart="handleAppAction"
    @mousemove="handleAppAction"
    @touchmove.prevent="handleAppAction"
  >
    <drag-locker v-if="getSetting('open_screen_lock', 0) === 1" :dragger-show="draggerShow" @change="handleDraggerChange" />
    <router-view />
  </div>
</template>

<script>
import DragLocker from '@/components/Common/DragLocker'
export default {
  name: 'App',
  components: { DragLocker },
  data() {
    return {
      draggerShow: false,
      timer: null,
      timeDown: this.getSetting('screen_autho_lock_time', 3600) * 1000, // ms
      defaultTimeDown: this.getSetting('screen_autho_lock_time', 3600) * 1000
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  },
  methods: {
    handleDraggerChange(e) {
      this.draggerShow = e
      this.handleRestart()
    },
    handleAppAction() {
      if (this.getSetting('open_screen_lock', 0) === 1) {
        // console.log(this.timeDown)
        if (this.timeDown <= 0) {
          this.draggerShow = true
          return
        } else {
          this.defaultTimeDown = this.getSetting('screen_autho_lock_time', 3600) * 1000
          this.handleRestart()
        }
      }
    },
    handleRestart() {
      clearTimeout(this.timer)
      this.timeDown = this.defaultTimeDown
      this.timer = setTimeout(() => {
        if (this.timeDown > 0) {
          this.timeDown = 0
          clearTimeout(this.timer)
        }
      }, this.defaultTimeDown)
    },
    getSetting(name, defaultValue) {
      return this.$store.state.settings[name] || defaultValue
    }
  }
}
</script>
<style lang="less" scoped>
.remind{
  color: #6f6f6f;
  font-size: 18px;
  font-weight: bold;
}
</style>
