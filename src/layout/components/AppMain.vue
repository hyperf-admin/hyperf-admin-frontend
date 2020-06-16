<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <router-view :key="key" />
    </transition>
    <el-backtop :bottom="50" />
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    key() {
      return this.$route.path
    }
  }
}
</script>

<style scoped>
.app-main {
  /*50 = navbar  */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  padding: 20px;
}
.fixed-header+.app-main {
  padding-top: 50px;
}
</style>

<style lang="scss">
  .text-align-right {
    text-align: right;
  }

  // fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}

// from label 两端对齐
/*.el-form-item label:after {*/
/*  content: " ";*/
/*  display: inline-block;*/
/*  width: 100%;*/
/*}*/

/*.el-form-item__label {*/
/*  text-align: justify*/
/*}*/
/*!* 这里去除必选字段的*,这个符号会造成一定影响,去掉之后我用了li列表进行定位,在前面加上" * ". *!*/
/*.el-form-item.is-required .el-form-item__label:before {*/
/*  content: none !important;*/
/*}*/
</style>
