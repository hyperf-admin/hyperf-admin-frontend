<template>
  <div class="page-header">
    <div class="header-row">
      <!--页面标题-->
      <div class="header-title">
        <el-divider direction="vertical" />
        {{ title }}
      </div>
      <!--顶部操作按钮-->
      <div class="header-action">
        <slot name="actions">
          <template v-if="topActions.length">
            <template v-for="(item, index) in topActions">
              <template v-if="whereFilter(getBaseData(), item.when || [])">
                <super-button-group
                  v-if="item[0] !== undefined"
                  :key="index"
                  :btn-text="item[0].text || '更多'"
                  :group="item"
                  :after-action="(btn, err) => afterButtonSubmit(btn, err)"
                  :inject-data="() => getBaseData()"
                  :base-data="getBaseData()"
                />
                <super-button
                  v-else
                  :key="item.text + '-' + index"
                  :type="item.type"
                  :target="item.target"
                  :props="{type: item.props.type || '', icon: item.props.icon || '', circle: item.props.circle || false, size: 'mini', text: item.text || item.props.text}"
                  :form-options="item.rules || []"
                  :method="item.method"
                  :after-action="(btn, err) => afterButtonSubmit(btn, err)"
                  :inject-data="() => getBaseData()"
                  :base-data="getBaseData()"
                />
              </template>
            </template>
          </template>
        </slot>
      </div>
    </div>
    <!--tabs-->
    <div class="header-tabs">
      <el-tabs v-if="tabs.length > 0" v-model="selectedTab" @tab-click="handleTabClick">
        <el-tab-pane
          v-for="(item, index) in tabs"
          :key="index"
          lazy
        >
          <span slot="label"><i v-if="item.icon" :class="item.icon" /> {{ item.label }}</span>
        </el-tab-pane>
      </el-tabs>
      <el-divider v-else class="header-divider" />
    </div>
    <el-dialog :title="title + '数据导入'" :visible.sync="showImportModal">
      <excel-upload :after-action="() => afterExeclUploaded()" />
    </el-dialog>
  </div>
</template>

<script>
import { whereFilter } from '@/utils/index'
import request from '@/utils/request'
import SuperButton from '@/components/Common/SuperButton'
import SuperButtonGroup from '@/components/Common/SuperButtonGroup'
import ExcelUpload from '@/components/Common/ExcelUpload'

export default {
  name: 'PageHeader',
  components: {
    SuperButton,
    SuperButtonGroup,
    ExcelUpload
  },
  props: {
    title: {
      type: String,
      default: function() {
        return this.$route.meta.title
      }
    },
    actions: {
      type: Array,
      default: function() {
        return []
      }
    },
    tabs: {
      type: Array,
      default: function() {
        return []
      }
    },
    activeTab: {
      type: String,
      default: ''
    },
    formPath: {
      type: String,
      default: ''
    },
    createAble: {
      type: Boolean,
      default: false
    },
    importAble: {
      type: Boolean,
      default: false
    },
    exportAble: {
      type: Boolean,
      default: false
    },
    exportTotal: {
      type: Number,
      default: 0
    },
    injectData: {
      type: Object,
      default: _ => {}
    }
  },
  data() {
    return {
      topActions: [],
      showImportModal: false,
      selectedTab: '0'
    }
  },
  watch: {
    activeTab: function(val) {
      this.selectedTab = val
    }
  },
  created() {
    this.init()
  },
  methods: {
    init: function() {
      this.selectedTab = this.$props.activeTab
      const topActions = this.$props.actions

      const baseActions = []
      if (this.$props.createAble) {
        const part = this.$route.path.split('/')
        part[part.length - 1] = 'form'
        let form_path = this.$props.formPath || part.join('/')
        if (this.$props.tabs.length > 0) {
          form_path = form_path + (form_path.indexOf('?') > -1 ? '&' : '?') + 'tab_id={tab_id}'
        }
        baseActions.push({
          text: '新建',
          type: 'jump',
          target: form_path,
          props: {
            type: 'success',
            icon: 'el-icon-plus'
          }
        })
      }
      if (this.$props.exportAble) {
        baseActions.push({
          text: '导出',
          type: 'click',
          target: () => this.exportAction(),
          props: {
            type: 'info',
            icon: 'el-icon-download'
          }
        })
      }
      if (this.$props.importAble) {
        baseActions.push({
          text: '导入',
          type: 'click',
          target: () => this.showExcelUploadModal(),
          props: {
            type: 'info',
            icon: 'el-icon-upload2'
          }
        })
      }
      if (baseActions.length === 1) {
        topActions.push(baseActions[0])
      } else if (baseActions.length > 1) {
        topActions.push(baseActions)
      }

      this.topActions = topActions
    },
    handleTabClick: function(tab) {
      const params = {}
      if (this.$props.tabs.length > 0) {
        params.tab_id = this.$props.tabs[this.selectedTab].value
      }
      this.$router.push({
        query: params
      })
    },
    showExcelUploadModal: function() {
      this.showImportModal = true
    },
    afterExeclUploaded() {
      location.reload()
    },
    exportAction: function() {
      const params = this.getBaseData()
      const list_api = this.$props.injectData.listApi || this.$route.path
      console.log('>>>>>>>>>>>>>>>', this.total)
      request({
        url: '/user/exportLimit',
        data: {
          url: list_api
        },
        method: 'get'
      }).then(r => {
        if (r.payload.max > -1 && this.total > r.payload.max) { // -1表示不限制
          this.$message({
            type: 'error',
            message: '已经超出最大导出限制(' + r.payload.max + '条)，请选择更为精准的筛选条件'
          })
          return
        }
        console.log('PageHeader export', this.$props.injectData)
        request({
          url: '/user/export',
          data: {
            name: this.$props.title,
            url: list_api,
            filters: params
          },
          method: 'POST'
        }).then(response => {
          this.$message(response.message)
        })
      })
    },
    whereFilter: function(obj, where) {
      return whereFilter(obj, where)
    },
    getBaseData() {
      const params = {}
      if (this.$props.tabs.length > 0) {
        params.tab_id = this.$props.tabs[this.selectedTab].value
      }
      return Object.assign({}, this.$route.query, params)
    },
    afterButtonSubmit(item, err) {
      if (err === undefined && ['form', 'api'].indexOf(item.type) > -1) {
        // location.reload()
      }

      this.$emit('after-button-submit', item, this.getBaseData())
    }
  }
}
</script>

<style scoped lang="scss">
.header-divider {
  margin: 10px 0;
}

.page-header {
  .header-row {
    width: 100%;
    position: relative;
    display: flex;
    justify-content: space-between;
  }
  .header-title {
    display:block;
    line-height: 24px;
    font-size: 18px;
    color: #303133;
    .el-divider {
      width: 3px;
      background-color:#409EFF;
    }
  }
  .header-tabs {
    width: 100%;
  }
}

.form-drawer {
  .form-drawer__content {
    padding: 0 20px 95px 20px;
  }
}
.el-scrollbar__wrap {
  overflow-y: hidden;
}

.el-divider--vertical {
  margin: 0 5px 0 0;
}
</style>
