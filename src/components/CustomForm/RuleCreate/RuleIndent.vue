<template>
  <div class="_ruleIndent">
    <div v-if="hasChild" class="child-line" />
    <template v-if="level > 1">
      <span class="indent" :class="{ last }">
        <!-- 递归组件 -->
        <RuleIndent
          v-model="logicValue"
          class="_ruleIndent_child"
          :level="level - 1"
          v-bind="{first, last, totalLevel, hasChild, root: false}"
          @change="changeRecursive"
        />
      </span>
    </template>
    <template v-else>
      <LogicSelect
        v-model="logicValue"
        v-bind="{first, last, root}"
        :show-logic="!(first && root)"
        @change="change"
      />
    </template>
  </div>
</template>
<script>
import LogicSelect from './LogicSelect'
export default {
  name: 'RuleIndent',
  components: {
    LogicSelect,
    // 递归组件
    RuleIndent: () => import('@/components/CustomForm/RuleCreate/RuleIndent.vue')
  },
  props: {
    // 是否根节点
    root: { type: Boolean, default: true },
    value: { type: String, default: '&&' },
    // 层级
    level: { type: Number, default: _ => 1 },
    // 一共层级
    totalLevel: { type: Number, default: _ => 1 },
    // 是否有child
    hasChild: { type: Boolean, default: false },
    // 是否是首节点
    first: { type: Boolean, default: false },
    // 是否是末尾节点
    last: { type: Boolean, default: false }
  },
  data() {
    const logicList = [
      { label: 'and', value: '&&' },
      { label: 'or', value: '||' }
    ]
    return {
      logicList,
      logicValue: ''
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
  methods: {
    changeRecursive(val) {
      // 递归组件的change 同change方法，为区分，暂时分开
      this.$emit('input', val)
      this.$emit('change', val)
    },
    change(val) {
      console.warn('change', val)
      this.$emit('input', val)
      this.$emit('change', val)
    }
  }
}
</script>
<style scoped lang="less">
._ruleIndent {
  position: relative;
  height: 52px;
  display: inline-block;
  width: 190px;
  vertical-align: middle;
  overflow: hidden;
  line-height: initial;
  // 下拉指向自己child的线
  .child-line {
    height: 100%;
    width: 1px;
    border-left: 1px dashed #999;
    position: absolute;
    left: 65px;
    top: 50%;
  }
  // 缩进
  .indent {
    display: inline-block;
    padding-left: 58px;
    margin-left: 3px;
    height: 100%;
    border-left: 1px #999 dashed;
  }
}
</style>
