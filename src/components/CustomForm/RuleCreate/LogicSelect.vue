<template>
  <div class="_logicSelect">
    <span class="parentFlag" />
    <span class="line-horizontal" />
    <span class="line-vertical" :class="{ first, last, child: !root }" />
    <div v-show="showLogic" class="logic-content">
      <el-select
        v-model="logicValue"
        style="width: 70px"
        size="mini"
        placeholder=""
        @change="change"
      >
        <el-option
          v-for="item in logicList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    root: { type: Boolean, default: false },
    value: { type: String, default: '&&' },
    showLogic: { type: Boolean, default: true },
    first: { type: Boolean, default: false },
    last: { type: Boolean, default: false }
  },
  data() {
    const logicList = [
      { label: 'and', value: '&&' },
      { label: 'or', value: '||' }
    ]
    return {
      logicValue: '',
      logicList
    }
  },
  watch: {
    value: {
      handler(val) {
        this.logicValue = val
      },
      immediate: true
    }
  },
  mounted() {},
  methods: {
    change(val) {
      this.$emit('input', val)
      this.$emit('change', val)
    }
  }
}
</script>
<style scoped lang="less">
._logicSelect {
  position: relative;
  height: 100%;
  display: inline-block;
  width: 100%;
  vertical-align: middle;
  line-height: initial;

  .parentFlag{
    // 圆点
    &::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 6px;
      left: 0px;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: #999;
      display: inline-block;
      z-index: 2;
    }
  }
  .line-horizontal {
    width: 100%;
    height: 1px;
    border-bottom: 1px dashed #999;
    position: absolute;
    transform: translateY(-50%) ;
    left: 0;
    top: 50%;
    z-index: -1;
  }
  .line-vertical {
    width: 1px;
    height: 100%;
    display: inline-block;
    border-left: 1px #999 dashed;
    left: 3px;
    position: absolute;
    &.first {
      transform: translateY(50%);

      &.child {
        transform: translateY(0%);

        &.last {
          display: inline-block;
          transform: translateY(-50%);
        }
      }
      &.last {
        display: none;
      }
    }
    &.last {
      transform: translateY(-50%);
    }
  }
  .logic-content {
    position: absolute;
    left: 30px;
    top: 50%;
    transform: translate(0, -50%) ;
  }
}
</style>
