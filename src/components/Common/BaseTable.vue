<template>
  <div
    v-infinite-scroll="infiniteScrollHandle"
    :infinite-scroll-disabled="infiniteScrollDisabled"
    :infinite-scroll-distance="infiniteScrollDistance"
    :class="infiniteCls"
  >
    <el-row v-if="selectionAble" style="margin-bottom: 5px;">
      <template v-for="(item, index) in options.batchButtons">
        <template v-if="whereFilter(getBaseData(), item.when)">
          <super-button-group
            v-if="item[0] !== undefined"
            :key="index"
            :btn-text="item[0].text"
            :group="item"
            :after-action="(btn, err) => afterButtonSubmit(btn, err)"
            :pre-check="(btn) => batchActionPreCheck(btn)"
            :inject-data="() => getSelected()"
            :base-data="getBaseData()"
          />
          <super-button
            v-else
            :key="item.text + '-' + index"
            :type="item.type"
            :target="item.target"
            :props="{type: item.props.type || '', icon: item.props.icon || '', circle: item.props.circle || false, size: 'mini', text: item.text || item.props.text}"
            :form-options="item.rules || {}"
            :method="item.method"
            :select-filter="item.selectFilter || []"
            :after-action="(btn, err) => afterButtonSubmit(btn,err)"
            :pre-check="(btn) => batchActionPreCheck(btn)"
            :inject-data="() => getSelected()"
            :base-data="getBaseData()"
          />
        </template>
      </template>
    </el-row>
    <slot
      name="list"
      :table-data="tableData"
      :loading="tableLoading"
    >
      <div v-if="options.tableOptions !== undefined && options.tableOptions.style === 'card'">
        <template v-if="tableData.length > 0">
          <el-card
            v-for="(item, index) in tableData"
            :key="`card-row_${index}`"
            shadow="hover"
            class="table-card-row"
          >
            <el-row :gutter="15">
              <el-col
                v-for="(g, i) in options.tableOptions.group"
                :key="`card-row-col_${index}-${i}`"
                class="card-row-col"
                :span="g.layout.span || 24"
              >
                <div class="card-row-col-title">{{ g.title }}</div>
                <div v-for="(field,ind) in g.fields" :key="`${index}-${i}-${ind}`" class="card-row-col-list">
                  <span
                    v-show="getFieldLabel(field)"
                    class="card-row-col-list-label label--shrink"
                  >{{ getFieldLabel(field) }}：</span>
                  <clumn-render
                    v-if="showTableHeader.indexOf(field) !== -1"
                    class="card-row-col-list-value"
                    :item="getHeader(field)"
                    :scope-data="{row:item}"
                    @row-change="rowChange"
                  />
                </div>
              </el-col>
            </el-row>
          </el-card>
        </template>
        <template v-else>
          <el-row>
            <el-col class="no-more-data">{{ tableLoading ? loadingText : noMoreDataText }}</el-col>
          </el-row>
        </template>
      </div>
      <el-table
        v-else
        ref="table"
        v-loading="paginationEnable && tableLoading"
        :data="tableData"
        style="width: 100%;"
        :header-cell-style="{background:'#EFEFEF'}"
        border
        :stripe="true"
        size="small"
        row-key="id"
        lazy
        :load="childsLoad"
        :empty-text="emptyText"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        @selection-change="handleSelectionChange"
        @sort-change="sortChange"
      >
        <el-table-column v-if="selectionAble" fixed type="selection" width="55" />
        <el-table-column v-if="actions.length > 0" fixed="right" :width="actionColumnWidth()">
          <template slot="header">
            <span>操作</span>
            <i class="el-icon-setting" @click="openConfigModel" />
          </template>
          <template slot-scope="scope">
            <div class="operate-flex">
              <template v-for="(item, index) in actions">
                <template v-if="whereFilter(scope.row, item.when)">
                  <template v-if="item[0] !== undefined">
                    <super-button-group
                      v-if="item[0] !== undefined"
                      :key="index"
                      btn-text="操作"
                      :group="item"
                      :base-data="scope.row"
                      :after-action="(btn, err) => afterButtonSubmit(btn, err, scope.row)"
                      :inject-data="scope.row"
                    />
                  </template>
                  <template v-else>
                    <super-button
                      :key="item.type + '-' + index"
                      :type="item.type"
                      :target="item.target"
                      :props="{...item.props, type: item.props.type, icon: item.props.icon, circle: item.props.circle, size: 'mini', text: item.text}"
                      :base-data="scope.row"
                      :form-options="item.rules || []"
                      :method="item.method"
                      :after-action="(btn, err) => afterButtonSubmit(btn, err, scope.row)"
                      :inject-data="scope.row"
                    />
                  </template>
                </template>
              </template>
            </div>
          </template>
        </el-table-column>
        <template v-for="item in header">
          <el-table-column
            v-if="showTableHeader.indexOf(item.field) !== -1"
            :key="item.field"
            v-bind="item.props || {}"
            :prop="item.field"
            :label="item.title"
            :sortable="item.sortable"
            :width="item.width"
            :render-header="(h, data) => renderHeaderMethods(h, data, item)"
          >
            <template slot-scope="scope">
              <column-render
                v-if="showTableHeader.indexOf(item.field) !== -1"
                :item="item"
                :scope-data="scope"
                @row-change="rowChange"
              />
            </template>
          </el-table-column>
        </template>
      </el-table>
    </slot>
    <el-row v-if="paginationEnable && !infiniteScrollMode" class="table-page">
      <el-pagination
        :key="paginationKey"
        background
        :page-size="page.pageSize"
        :page-sizes="page.sizes"
        :current-page="page.currentPage"
        layout="total, sizes, prev, pager, next"
        :total="page.total"
        @size-change="pageSizesChange"
        @current-change="currentPageChange"
      />
    </el-row>
    <el-dialog title="列设置" :visible.sync="tableConfig">
      <el-transfer
        v-model="showTableHeader"
        :titles="['未显示列', '已显示列']"
        :data="sourceTableHeader"
      />
    </el-dialog>
    <el-row v-if="infiniteScrollMode" class="loading-status">
      <p v-if="tableLoading" v-loading="tableLoading">{{ loadingText }}</p>
      <p v-if="noMoreData">{{ noMoreDataText }}</p>
    </el-row>
  </div>
</template>

<script>
import { strVarReplace, whereFilter } from '@/utils/index'
import request from '@/utils/request'
import { Message } from 'element-ui'
import ColumnRender from '@/components/Common/ColumnRender'
import SuperButton from '@/components/Common/SuperButton'
import SuperButtonGroup from '@/components/Common/SuperButtonGroup'

export default {
  name: 'BaseTable',
  components: {
    ColumnRender,
    SuperButton,
    SuperButtonGroup
  },
  props: {
    listApi: {
      type: String,
      default: function() {
        return this.$route.path
      }
    },
    childsLoadApi: {
      type: String,
      default: function() {
        return this.$route.path.replace('list', 'childs/{id}')
      }
    },
    rowChangeApi: {
      type: String,
      default: function() {
        return this.$route.path.replace('list', 'rowChangeApi/{id}')
      }
    },
    header: {
      type: Array,
      default: function() {
        return []
      }
    },
    actions: {
      type: Array,
      default: function() {
        return []
      }
    },
    options: {
      type: Object,
      default: function() {
        return {}
      }
    },
    activeTab: {
      type: String,
      default: function() {
        return ''
      }
    },
    selectionAble: {
      type: Boolean,
      default: false
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
    refreshFloop: {
      type: Boolean,
      default: false
    },
    filterWithQuery: {
      type: Boolean,
      default: true
    }
  },
  data() {
    console.log('BaseTable', this.$slots)
    return {
      loading: true,
      tableData: [],
      tableLoading: false,
      tableConfig: false,
      selectedRow: [],
      showTableHeader: [],
      sourceTableHeader: [],
      page: {
        pageSize: this.$props.options.pageSize !== undefined ? this.$props.options.pageSize : 20,
        sizes: this.$props.options.page.sizes !== undefined ? this.$props.options.page.sizes : [20, 100, 200, 300, 400],
        currentPage: 1,
        total: 200
      },
      batchButtons: [],
      baseButtons: [],
      paginationKey: 0,
      infiniteScrollDistance: 180,
      noMoreData: false,
      loadingText: '加载中😁...',
      noMoreDataText: '没有更多数据了😁',
      preventInfiniteScrollError: false
    }
  },
  computed: {
    filterData: function() {
      return this.$route.query || {}
    },
    emptyText: function() {
      if (this.$props.options.defaultList === false && Object.keys(this.$route.query).length === 0) {
        return '请输入条件, 然后查询😁'
      }
      return '暂无数据😁'
    },
    infiniteScrollMode: function() {
      // TODO:修改无限滚动配置方式，后续需要优化
      return this.infiniteScroll
      // return !this.paginationEnable
    },
    infiniteScrollDisabled: function() {
      return this.preventInfiniteScrollError || !this.infiniteScrollMode || this.noMoreData || this.tableLoading
    },
    infiniteCls: function() {
      return this.infiniteScrollMode ? 'infinite-list-wrapper' : 'default-table-wrapper'
    }
  },
  watch: {
    activeTab: function(val) {
      this.setTableHeader(val)
    },
    filterData: function(queryObj) {
      console.log('BaseTable filterData', this.filterData)
      this.page.currentPage = 1
      this.page.pageSize = 20
      this.page.order = {}
      this.resetData()
      this.getList(queryObj)
    },
    refreshFloop: {
      handler() {
        console.log('BaseTable refreshFloop', this.filterData)
        this.resetData()
        this.getList(this.filterData)
      }
    }
  },
  mounted() {
    if (this.$props.tab === this.$props.activeTab) {
      let params = {}
      if (this.$props.activeTab.length > 0) {
        params = { tab_id: this.$props.activeTab, ...this.getOriginalFormData(this.$props.activeTab) }
      } else {
        params = { ...this.getOriginalFormData() }
      }
      console.log('BaseTable mounted', this.getOriginalFormData())
      setTimeout(() => {
        this.getList(params)
      }, 20)
    }
  },
  created() {
    this.setTableHeader(this.$props.activeTab)
    if (this.$props.options.defaultList || Object.keys(this.$route.query).length) {
      this.getList(this.filterData)
    }
    this.$on('baseTable.getList', this.getList)
  },
  methods: {
    handleSelectable(row, index) {
      return row && !row.selectDisable
    },
    setTableHeader: function(tabId) {
      const headers = []
      const showHeaders = []
      this.$props.header.forEach((item) => {
        if (!item.depend || !item.depend.tab || item.depend.tab.indexOf(tabId) !== -1) {
          headers.push({
            key: item.field,
            label: item.title
          })
          showHeaders.push(item.field)
        }
      })
      this.sourceTableHeader = this._.cloneDeep(headers)
      this.showTableHeader = this._.cloneDeep(showHeaders)
    },
    getOriginalFormData(tab_id) {
      const formData = {}
      const query = this.$route.query
      this.filterRule && this.filterRule.map(item => {
        if (item.value) {
          if (tab_id && item.depend && item.depend.tab && item.depend.tab.indexOf(tab_id) === -1) {
            // 判断字段是否当前tab所需
          } else {
            formData[item.field] = item.value
          }
          if (query[item.field]) {
            if (typeof item.value === 'number') {
              formData[item.field] = Number(query[item.field])
            } else {
              formData[item.field] = query[item.field]
            }
          }
        }
      })
    },
    getList: function(filterData) {
      // 滚动加载模式下，已有接口请求发出，处于未完成状态
      if (this.infiniteScrollMode && this.tableLoading) return

      this.tableLoading = true
      const filter = Object.assign({}, filterData)
      if (!this.$props.filterWithQuery) {
        Object.keys(this.$route.query).forEach(key => {
          delete filter[key]
        })
      }
      if (this.activeTab.length > 0) {
        filter['tab_id'] = this.activeTab
      }
      request({
        url: this.$props.listApi,
        method: 'get',
        params: filter
      }).then((res) => {
        const payload = res.payload
        const payloadListSize = payload.list.length
        if (this.infiniteScrollMode) {
          this.tableData = [...this.tableData, ...payload.list]

          this.noMoreData = payloadListSize < this.page.pageSize || this.tableData.length === payload.total
        } else {
          if (payloadListSize > 20) {
            this.tableData = payload.list.slice(0, 20)
            setTimeout(() => {
              payload.list.slice(20).forEach((item) => {
                this.tableData.push(item)
              })
            }, 200)
          } else {
            this.tableData = payload.list
          }
        }
        this.page.total = payload.total
        this.$emit('total_page_changed', this.page.total)
        this.$emit('table_data_changed', this.tableData)
        this.tableLoading = false
      }).catch(() => {
        this.tableLoading = false

        if (this.infiniteScrollMode) {
          this.preventInfiniteScrollError = true
          this.noMoreData = true
        }
      })
    },
    getQueryDataWithExtra: function() {
      let extra = { _page: this.page.currentPage, _size: this.page.pageSize }
      if (this.page.order !== undefined) {
        extra = Object.assign(extra, {
          _sort_type: this.page.order.orderType === 'descending' ? 'desc' : 'asc',
          _sort_column: this.page.order.orderColumn
        })
      }
      return Object.assign(this.filterData, extra)
    },
    fullscreenLoading: function(options) {
      options = options || {}
      return this.$loading(Object.assign({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      }, options))
    },
    currentPageChange: function(currentPage) {
      if (currentPage - this.page.currentPage > 100) {
        Message.warning('禁止大跨度翻页')
        this.paginationKey += 1
        return
      }
      this.page.currentPage = currentPage
      this.getList(this.getQueryDataWithExtra())
    },
    pageSizesChange: function(pageSize) {
      this.page.pageSize = pageSize
      this.getList(this.getQueryDataWithExtra())
    },
    sortChange: function({ column, prop, order }) {
      this.page.order = {}
      this.page.order.orderColumn = prop
      this.page.order.orderType = order
      this.getList(this.getQueryDataWithExtra())
    },
    rowChange: function({ row, key, val }) {
      const data = {}
      data[key] = val
      request({
        // todo
        url: strVarReplace(this.$props.options.rowChangeApi, row),
        method: 'POST',
        data: data
      }).then(res => {
        this.$message.success('保存成功')
      })
    },
    actionColumnWidth: function() {
      let ratio = 0
      this.$props.actions.forEach((item) => {
        ratio += item.text ? item.text.length : 3
      })
      return ratio * 10 + 130
    },
    whereFilter: function(obj, where) {
      return whereFilter(obj, where)
    },
    openConfigModel: function() {
      this.tableConfig = true
    },
    handleSelectionChange: function(selectedRow) {
      this.selectedRow = selectedRow
    },
    childsLoad: function(tree, treeNode, resolve) {
      let params = {}
      if (this.$props.activeTab.length > 0) {
        params = { tab_id: this.$props.activeTab }
      }
      request({
        url: strVarReplace(this.$props.childsLoadApi, tree),
        params
      }).then(res => {
        resolve(res.payload.childs || [])
      })
    },
    getSelected() {
      let params = {}
      if (this.$props.activeTab.length > 0) {
        params = { tab_id: this.$props.activeTab }
      }
      params.selected = this.selectedRow
      return params
    },
    getBaseData() {
      return Object.assign({}, this.$route.query)
    },
    batchActionPreCheck(btn) {
      const when = btn.selectFilter || []
      if (when.length > 0) {
        const selectedRow = this._.cloneDeep(this.selectedRow)
        // 首先清除选中项
        this.$refs.table.clearSelection()
        selectedRow.forEach((item, index) => {
          if (!whereFilter(item, when)) {
            this.selectedRow.splice(index, 1)
          } else {
            const tableRowIndex = this._.findIndex(this.tableData, function(o) { return o.id === item.id })
            this.$refs.table.toggleRowSelection(this.tableData[tableRowIndex], true)
          }
        })
      }

      if (this.selectedRow.length === 0) {
        Message({
          message: '请勾选数据',
          type: 'warning',
          duration: 5 * 1000
        })
        return false
      }
      return this.selectedRow
    },
    afterButtonSubmit(item, err, row) {
      if (err === undefined && ['form', 'api'].indexOf(item.type) > -1 && item.target.length > 0) {
        this.resetData()
        this.getList(this.getQueryDataWithExtra())
      }
      this.$emit('after-btn-submit', row, item)
    },
    renderHeaderMethods(h, data, header) {
      const { column } = data
      return (<span>
        {header.info ? <el-tooltip effect='dark' content={header.info} placement='top-start'>
          <span>
            {column.label}&nbsp;<i class='el-icon-info' style='color:#409eff;margin-left:5px;'></i>
          </span>
        </el-tooltip>
          : <span> {column.label} </span>}
      </span>)
    },
    infiniteScrollHandle() {
      const nextPage = this.page.currentPage + 1
      this.currentPageChange(nextPage)
    },
    resetData() {
      if (this.infiniteScrollMode) {
        this.tableData = []
        this.noMoreData = false
      }
    },
    updateRow(row) {
      const index = this._.findIndex(this.tableData, { id: row.id })
      this.tableData[index] = Object.assign(this.tableData[index], row)
    },
    getFieldLabel(field) {
      const index = this._.findIndex(this.header, { field })
      return index > -1 ? this.header[index]['title'] : ''
    },
    getHeader(field) {
      const index = this._.findIndex(this.header, { field })
      return index > -1 ? this.header[index] : []
    }
  }
}
</script>

<style lang="scss" scoped>
  .divider {
    display: block;
    height: 1px;
    width: 100%;
    margin: 12px 0;
    background-color: #dcdfe6;
    position: relative;
  }
  .table-page {
    padding: 5px 0;
    text-align: right;
  }
  /deep/ {
    .el-message-box {
      width: auto;
    }
    .operate-flex{
      line-height: 35px;
      .el-button {
        margin-left: 10px;
      }
    }
    .el-dropdown {
      .el-button {
        margin-left: 0;
      }
    }
  }

  .infinite-list-wrapper {
    height: 80vh;
    overflow: auto;

    .loading-status {
      padding: 10px 0;
      text-align: center;
      color: #606266;
      line-height: 20px;
      font-size: 12px;
    }
  }

  .default-table-wrapper {
    height: auto;
    overflow: auto;
  }
  .table-card-row {

    & + .table-card-row{
      margin-top: 10px;
    }
    .card-row-col {
      margin: 5px 0;
      font-size: 14px;
      &-title{
        font-weight: bold;
        margin-bottom: 10px;
      }
      &-list{
        margin-top: 5px;
        display: flex;
        flex-wrap: nowrap;

        &-label{
          color:rgba(0,0,0,.45);
          &.label--shrink{
            flex-shrink: 0;
          }
        }

        &-value{
          width: 100%;
          line-height: 1.4;
          vertical-align: text-top;
        }
      }
    }
  }
  .no-more-data {
    text-align: center;
    color: lightslategrey;
    font-size: 14px;
    line-height: 400px;
    min-height: 400px;
  }
</style>
