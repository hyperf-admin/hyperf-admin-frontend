<template>
  <div v-if="rules && rules.length > 0" class="alert-content">
    <div
      v-for="(ruleItem, ruleIndex) in rules"
      v-show="!ruleItem.hide && (ruleItem.actions || ruleItem.message)"
      :key="`alert_ruleRow_${ruleIndex}`"
      class="rock-alert mini"
      :class="[`rock-alert-${ruleItem.type}`]"
    >
      <div class="alert-title">
        <span v-if="ruleItem.showIcon" :class="`el-icon-${ruleItem.type}`" />
        <span class="message" v-html="ruleItem.message" />
        <div v-if="ruleItem.actions && ruleItem.actions.length > 0" class="actions" :class="[ruleItem.actionsPlacement]">
          <!-- 调用superBtn的规则 -->
          <SuperButton
            v-for="(action,index) in ruleItem.actions"
            :key="`alert_superBtn_${index}`"
            :type="action.type || 'text'"
            :target="action.target"
            :props="{
              text: action.text || action.props,
              size: 'mini',
              ...action.props,
            }"
            :form-options="action.rules || {}"
            :method="action.method"
            :after-action="(btn, err) => afterButtonSubmit(btn, err)"
            @click="clickBtn"
          />
        </div>
      </div>
      <div v-if="ruleItem.description" class="alert-description" v-html="ruleItem.description" />
      <span v-if="ruleItem.closable" class="alert-close el-icon-close" @click="close(ruleItem)" />
    </div>
  </div>
</template>
<script>
import request from '@/utils/request'

export default {
  components: {
    // 可能包含递归引用关系
    SuperButton: () => import('@/components/Common/SuperButton')
  },
  props: {
    // 开关
    noticeAble: { type: Boolean, default: false },
    // 自动获取alert的api地址，触发时间：路由变化
    ruleApi: { type: String, default: '' },
    // 配置信息,多条用array
    config: { type: [Object, Array], default: _ => {} }
  },
  data() {
    return {
      defaultConfig: {
        type: 'info',
        // 显示主内容
        message: '',
        // 详情
        description: '',
        // 是否可关闭 默认不可关闭
        closable: false,
        // 是否展示icon 默认不展示
        showIcon: false,
        // 是否需要边框 默认需要
        border: true,
        // icon自定义 一期暂不支持
        icon: '',
        // 动作按钮放置的位置：目前可支持right
        actionsPlacement: '',
        // 操作按钮，引用superBtn的配置
        actions: []
      },
      rules: []
    }
  },
  computed: {
  },
  watch: {
    noticeAble: {
      handler(noticeAble) {
        // 立即执行一次
        if (noticeAble) {
          this.getAlert()
        }
      }
    },
    $route: {
      handler(router) {
        if (this.noticeAble) {
          this.getAlert()
        }
      },
      immediate: true
    },
    config: {
      handler(rule = {}) {
        if (JSON.stringify(rule) !== '{}') {
          this.setRule(rule)
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    setRule(rule = {}) {
      const rules = Array.isArray(rule) ? rule : [rule]
      rules.forEach(item => {
        const { actions = [] } = item
        // 如果单个配置 转换成数组
        const actionsList = Array.isArray(actions) ? actions : [actions]
        item = Object.assign(this.defaultConfig, rule, { actions: actionsList })
      })
      this.rules = rules
    },
    // 获取alert信息
    getAlert() {
      if (this.ruleApi) {
        request({
          url: this.ruleApi.replace('list', 'notice'),
          method: 'get',
          params: this.$route.query
        }).then((res) => {
          const { list = [] } = res.payload
          if (list.length > 0) {
            this.setRule(list)
          }
        })
      }
    },
    afterButtonSubmit(item, err, row) {
      this.$emit('after-btn-submit', row, item)
    },
    close(ruleItem) {
      this.$set(ruleItem, 'hide', true)
    },
    clickBtn(data) {
      this.$emit('click-btn', data)
    }
  }
}
</script>
<style lang="less" scoped>
.rock-alert{
  position: relative;
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  padding: 8px 15px;
  margin-bottom: 16px;
  border-radius: 4px;

  &-info{
    background-color: #e6f7ff;
    border: 1px solid #91d5ff;
    [class*=" el-icon-"], [class^=el-icon-] {
      color: #1890ff;
    }
  }
  &-success{
    background-color: #f6ffed;
    border: 1px solid #b7eb8f;
    [class*=" el-icon-"], [class^=el-icon-] {
      color: #52c41a;
    }
  }
  &-warning{
    background-color: #fffbe6;
    border: 1px solid #ffe58f;
    [class*=" el-icon-"], [class^=el-icon-] {
      color: #faad14;
    }
  }
  &-error {
    background-color: #fff2f0;
    border: 1px solid #ffccc7;
    [class*=" el-icon-"], [class^=el-icon-] {
      color: #ff4d4f;
    }
  }

  .actions {
    padding: 0 10px;
    display: inline-block;

    &.right{
      float: right;
    }
  }

  .message{
    font-size: 14px;
    line-height: 28px;
  }
  .alert-description{
    font-size: 12px;
    margin-top: 6px;
    line-height: 18px;
  }
  .alert-close{
    color: rgba(0,0,0,.45);
    position: absolute;
    top: 13px;
    right: 7px;
    cursor: pointer;
    line-height: 18px;
    font-size: 14px;
  }
}
</style>
