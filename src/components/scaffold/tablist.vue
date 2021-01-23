<template>
  <div>
    <Alert :notice-able="options.noticeAble" :rule-api="listApi" @click-btn="clickAlertBtn" />
    <!--topActions-->
    <page-header
      :key="'page_header_' + unique"
      :title="options.pageTitle"
      :actions="options.topActions"
      :form-path="options.form_path"
      :create-able="options.createAble"
      :import-able="options.importAble"
      :export-able="options.exportAble || false"
      :tabs="tableTabs"
      :active-tab="activeTabIndex"
      :export-total="total"
      :inject-data="$props"
      @after-button-submit="afterTopAction"
    >
      <template v-slot:actions>
        <slot name="actions" />
      </template>
    </page-header>
    <div class="list-content-wrapper">
      <!--数据表统计-->
      <slot name="statistics" />
      <!--搜索表单-->
      <div v-if="(options.showFilter === undefined ? true : options.showFilter) && filterRule.length" class="list-filter-wrapper">
        <filter-form
          :rules="filterRule"
          :active-tab="activeTab"
        />
      </div>
      <!--列表内容区-->
      <base-table
        v-if="tableHeader.length"
        ref="table"
        :list-api="$props.listApi"
        :header="tableHeader"
        :actions="rowActions"
        :options="options"
        :active-tab="activeTab"
        :selection-able="selectionAble"
        :pagination-enable="showPageBar"
        :refresh-floop="refreshFloop"
        :filter-with-query="$props.filterWithQuery"
        :infinite-scroll="infiniteScroll"
        @total_page_changed="totalPageChanged"
        @table_data_changed="tableDataChanged"
        @after-btn-submit="afterRowAction"
      >
        <template v-slot:list="listProps">
          <slot
            name="list"
            :table-header="tableHeader"
            :title-group="titleGroup"
            :table-data="listProps.tableData"
            :loading="listProps.loading"
          />
        </template>
      </base-table>
    </div>
  </div>
</template>
<script>
import { uniqueId } from '@form-create/utils'
import request from '@/utils/request'
import Emitter from '@/mixins/emitter'
import PageHeader from '@/components/Common/PageHeader'
import FilterForm from '@/components/Common/FilterForm'
import BaseTable from '@/components/Common/BaseTable'
import Alert from '@/components/Common/Alert/Alert'

export default {
  name: 'TabList',
  components: {
    PageHeader,
    FilterForm,
    BaseTable,
    Alert
  },
  mixins: [Emitter],
  props: {
    listApi: {
      type: String,
      default: function() {
        return this.$route.path
      }
    },
    infoApi: {
      type: String,
      default: function() {
        const part = this.$route.path.split('/')
        part[part.length - 1] = 'info'
        return part.join('/')
      }
    },
    listOptions: {
      type: Object,
      default: _ => {}
    },
    paginationEnable: {
      type: Boolean,
      default: true
    },
    // 下拉滚动加载 开启将隐藏分页
    infiniteScroll: {
      type: Boolean,
      default: false
    },
    // 循环触发刷新
    refreshFloop: {
      type: Boolean,
      default: false
    },
    filterWithQuery: {
      type: Boolean,
      default: true
    },
    cellClassName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tableTabs: [],
      filterRule: [],
      tableHeader: [],
      titleGroup: [],
      rowActions: [],
      selectionAble: false,
      options: Object.assign({
        form_path: '',
        importAble: false,
        createAble: false,
        exportAble: false,
        pageTitle: '',
        topActions: [],
        batchButtons: [],
        defaultList: false,
        showFilter: true,
        // 是否开启查询通知消息开关
        noticeAble: false
      }, this.$props.listOptions),
      unique: uniqueId(),
      total: 0,
      showPageBar: true
    }
  },
  computed: {
    activeTabIndex: function() {
      const tabId = this.$route.query.tab_id
      const index = this._.findIndex(this.tableTabs, function(o) {
        return o.value === tabId
      })
      return (index > 0 ? index : 0).toString()
    },
    activeTab: function() {
      if (this.$route.query.tab_id) {
        return this.$route.query.tab_id
      }
      if (this.tableTabs.length > 0) {
        return this.tableTabs[0].value
      }
      return ''
    }
  },
  created() {
    this.init()
    this.$on('baseTable.getList', this.handleBaseTableGetList)
    this.showPageBar = this.paginationEnable
  },
  methods: {
    handleBaseTableGetList(data) {
      console.log('🏀-----🏀', data)
      this.broadcast('BaseTable', 'baseTable.getList', data)
    },
    init: function() {
      const query = this.$route.query
      request({
        url: this.$props.infoApi,
        method: 'get',
        params: query
      }).then((res) => {
        const { tableTabs = [], tableHeader = [], options = {}} = res.payload || {}
        if (tableTabs.length > 0) {
          this.tableTabs = tableTabs
        }
        this.filterRule = res.payload.filterRule || []
        this.tableHeader = tableHeader.map(item => ({ ...item, className: this.cellClassName }))
        this.titleGroup = res.payload.title_group
        this.rowActions = res.payload.rowActions
        if (options.batchButtons && options.batchButtons.length > 0) {
          this.selectionAble = true
        }
        this.options = Object.assign(options, this.$props.listOptions)
        if (options.hasOwnProperty('paginationEnable')) {
          // 接口下发配置大于props配置
          this.showPageBar = options.paginationEnable
        }
        this.unique = uniqueId()
      })
    },
    totalPageChanged(total) {
      this.total = total

      this.$emit('total_badge_changed', total)
    },
    tableDataChanged(tableData) {
      this.$emit('table_data_changed', tableData)
    },
    afterRowAction(row, btn) {
      console.log(row, btn)
      this.$emit('on-row-action', row, btn)
      if (row === undefined && btn.injectData !== undefined) {
        this.$emit('on-batch-action', btn.injectData().selected || [], btn)
      }
    },
    afterTopAction(btn, queryData) {
      this.$emit('on-top-action', btn)
      this.$refs.table.getList(queryData)
    },
    updateRow(row) {
      this.$refs.table.updateRow(row)
    },
    clickAlertBtn(data) {
      this.$emit('click-alert-btn', data)
    }
  }
}
</script>

<style scoped lang="less">
/deep/ .el-table__header-wrapper{
  position: sticky;
  top: 0;
  z-index: 2;
}
/deep/ .el-table{
  overflow: unset;
}
</style>
