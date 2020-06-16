<template>
  <div>
    <el-row :gutter="12">
      <el-row>
        <form-create
          :ref="'filter' + key"
          :key="key"
          v-model="form"
          :rule="rule"
          :option="defaultOptions.filterFormOption"
          class="info-form"
        />
      </el-row>
      <el-row>
        <template v-for="(item, index) in options.batchButtons">
          <template v-if="whereFilter(getBaseData(), item.when)">
            <super-button-group
              v-if="item[0] !== undefined"
              :key="index"
              :group="item"
              :after-action="(btn) => afterButtonSubmit(btn)"
              :pre-check="() => batchActionPreCheck()"
              :inject-data="() => getSelected()"
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
              :after-action="() => afterButtonSubmit(item)"
              :pre-check="() => batchActionPreCheck()"
              :inject-data="() => getSelected()"
              :base-data="getBaseData()"
            />
          </template>
        </template>
      </el-row>
      <div class="divider" />
      <el-row>
        <el-table
          v-loading="tableLoading"
          :data="tableData"
          style="width: 100%;"
          border
          :stripe="true"
          size="small"
          row-key="id"
          lazy
          :load="childsLoad"
          :header-cell-style="getRowClass"
          :empty-text="emptyText"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          @selection-change="handleSelectionChange"
          @sort-change="sortChange"
        >
          <el-table-column v-if="selectionAble" type="selection" width="55" />
          <template v-for="item in tableHeader">
            <template>
              <el-table-column
                v-if="showTableHeader.indexOf(item.field) !== -1"
                :key="item.field"
                :prop="item.field"
                :label="item.title"
                :sortable="item.sortable"
                :width="item.width"
                :render-header="(h, data) => renderHeaderMethods(h, data, item)"
              >
                <template slot-scope="scope">
                  <template v-if="item.edit && whereFilter(scope.row, item.when)">
                    <template v-if="item.type === 'number'">
                      <el-input-number
                        v-model="scope.row[item.field]"
                        size="mini"
                        @change="() => rowChange(scope.row, item.field, scope.row[item.field])"
                      />
                    </template>
                    <template v-else-if="item.type === 'switch'">
                      <el-tooltip
                        :content="scope.row[item.field] === 1 ? '启用' : '禁用'"
                        placement="top"
                      >
                        <el-switch
                          v-model="scope.row[item.field]"
                          active-color="#13ce66"
                          inactive-color="#ff4949"
                          :active-value="1"
                          size="small"
                          :inactive-value="0"
                          @change="() => rowChange(scope.row, item.field, scope.row[item.field])"
                        />
                      </el-tooltip>
                    </template>
                    <template v-else>
                      <el-input
                        v-model="scope.row[item.field]"
                        size="small"
                        @change="() => rowChange(scope.row, item.field, scope.row[item.field])"
                      />
                    </template>
                  </template>
                  <template v-else>
                    <cell-render :value="scope.row[item.field]" :options="item" :data="scope.row" />
                  </template>
                </template>
              </el-table-column>
            </template>
          </template>
          <el-table-column v-if="rowActions.length > 0" fixed="right" :width="actionColumnWidth()" label="操作">
            <template slot="header">
              <span>操作</span>
              <i class="el-icon-setting" @click="openConfigModel" />
            </template>
            <template slot-scope="scope">
              <div class="operate-flex">
                <template v-for="(item, index) in rowActions">
                  <template v-if="whereFilter(scope.row, item.when || [])">
                    <super-button-group
                      v-if="item[0] !== undefined"
                      :key="index"
                      :group="item"
                      :base-data="scope.row"
                      :after-action="(btn) => afterButtonSubmit(btn)"
                      :inject-data="scope.row"
                    />
                    <super-button
                      v-else
                      :key="item.type + '-' + index"
                      :type="item.type"
                      :target="item.target"
                      :props="{type: item.props ? item.props.type : '', icon: item.props ? item.props.icon : '', circle: item.props ? item.props.circle : false, size: 'mini', text: item.text || item.props.text}"
                      :base-data="scope.row"
                      :form-options="item.rules || []"
                      :method="item.method"
                      :after-action="() => afterButtonSubmit(item)"
                      :inject-data="scope.row"
                    />
                  </template>
                </template>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
      <el-row v-if="defaultOptions.paginationEnable" class="table-page">
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
    </el-row>
  </div>
</template>

<script>

import formCreate from '@form-create/element-ui'
import request from '@/utils/request'
import { strVarReplace, whereFilter } from '@/utils/index'
import { maker } from '@/utils/form-maker'
import { Message } from 'element-ui'
import CellRender from '@/components/Common/CellRender'
import SuperButton from '@/components/Common/SuperButton'
import SuperButtonGroup from '@/components/Common/SuperButtonGroup'
import VInput from '@/components/CustomForm/VInput'
formCreate.component('v-input', VInput)

export default {
  name: 'VTable',
  components: {
    formCreate: formCreate.$form(),
    CellRender,
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
    tableHeader: {
      type: Array,
      default: function() {
        return []
      }
    },
    filterRule: {
      type: Array,
      default: function() {
        return []
      }
    },
    rowActions: {
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
    }
  },
  data() {
    return {
      tableSearch: '',
      excelDataSendUrl: '',
      btnImport: false,
      loading: true,
      key: 'table_filter',
      form: {},
      rule: [],
      tableData: [],
      tableLoading: false,
      tableConfig: false,
      showTableHeader: [],
      sourceTableHeader: [],
      selectedRow: [],
      selectionAble: false,
      defaultOptions: {
        filterSyncToQuery: true,
        createAble: true,
        exportAble: true,
        filterFormOption: {
          form: {
            inline: true,
            labelPosition: 'left',
            labelWidth: '80px',
            size: 'small'
          },
          submitBtn: false,
          defaultList: true
        },
        paginationEnable: true,
        topActions: []
      },
      page: {
        pageSize: 20,
        sizes: [20, 100, 200, 300, 400],
        currentPage: 1,
        total: 200
      },
      batchButtons: [],
      paginationKey: 0,
      showImportModal: false
    }
  },
  computed: {
    filter: function() {
      return Object.assign(this.form.formData(), { _page: this.page.currentPage, _size: this.page.pageSize })
    },
    emptyText: function() {
      if (this.defaultOptions.defaultList === false && Object.keys(this.$route.query).length === 0) {
        return '请输入条件, 然后查询😁'
      }
      return '暂无数据😁'
    }
  },
  beforeMount: function() {
    const searchBtn = {
      type: 'el-button',
      on: {
        click: this.onSubmit
      },
      children: ['查询'],
      props: {
        type: 'primary'
      }
    }
    const resetBtn = {
      type: 'el-button',
      on: {
        click: this.onReset
      },
      children: ['重置'],
      props: {
        type: 'info'
      }
    }
    const createBtn = {
      type: 'el-button',
      on: {
        click: this.gotoForm
      },
      children: ['新建'],
      props: {
        type: 'success'
      }
    }
    const importBtn = {
      type: 'el-button',
      on: {
        click: this.showExcelUploadModal
      },
      children: ['导入'],
      props: {
        type: 'info'
      }
    }
    const exportBtn = {
      type: 'el-button',
      on: {
        click: this.exportAction
      },
      children: ['导出'],
      props: {
        type: 'info'
      }
    }
    const commonBtns = [
    ]

    if (this.$props.filterRule.length > 0) {
      commonBtns.unshift(resetBtn)
      commonBtns.unshift(searchBtn)
    }

    this.defaultOptions = Object.assign(this.defaultOptions, this.$props.options)

    if (this.defaultOptions.exportAble) {
      commonBtns.push(exportBtn)
    }

    if (this.defaultOptions.createAble) {
      commonBtns.push(createBtn)
    }
    if (this.$props.options.importAble) {
      commonBtns.push(importBtn)
    }

    this.selectionAble = true

    const filterRule = []
    const self = this
    this.$props.filterRule.forEach(function(item) {
      const rule = maker(item)
      if (item.type === 'select' && item.props.remote === true) {
        rule.props.remoteMethod = self._.debounce((val) => self.selectRemote(item.field, val), 100)
      }
      filterRule.push(rule)
    })

    console.log('VTable filterRule', filterRule)

    this.rule = this._.cloneDeep([
      ...filterRule, ...commonBtns
    ])
    console.log('VTable filter rule', this.rule)
    this.$props.tableHeader.forEach((item) => {
      this.sourceTableHeader.push({
        key: item.field,
        label: item.title
      })
      this.showTableHeader.push(item.field)
    })
  },
  mounted: function() {
    const query = this.$route.query
    console.log('VTable mounted', query)
    if (query !== {}) {
      this.$props.filterRule.forEach((item) => {
        if (query[item.field]) {
          switch (typeof item.value) {
            case 'number':
              query[item.field] = Number(query[item.field])
              break
          }
        }
      })
      this.form && this.form.setValue(query)
    }
    this.getList(query)
  },
  methods: {
    openConfigModel: function() {
      this.tableConfig = true
    },
    gotoForm: function() {
      let path = this.defaultOptions.form_path
      if (!path) {
        path = this.$route.path.replace(/list/, 'form')
      }
      this.$router.push(path)
    },
    showExcelUploadModal: function() {
      console.log(this.showImportModal)
      this.showImportModal = true
    },
    onSubmit: function(e) {
      console.log(this.form.formData())
      // 查询操作，重置页码到第一页
      this.page.currentPage = 1
      if (this.defaultOptions.filterSyncToQuery) {
        this.$router.push({ query: this.form.formData() })
      }
      this.getList()
    },
    onReset: function() {
      this.$router.push({ query: {}})
      this.form.resetFields()
      this.getList()
    },
    getList: function(initFilter) {
      this.tableLoading = true
      let extra = { _page: this.page.currentPage, _size: this.page.pageSize }
      if (this.page.order !== undefined) {
        extra = Object.assign(extra, {
          _sort_type: this.page.order.orderType === 'descending' ? 'desc' : 'asc',
          _sort_column: this.page.order.orderColumn
        })
      }
      request({
        url: this.$props.listApi,
        method: 'get',
        params: Object.assign(this.form.formData(), extra, initFilter | {})
      }).then((res) => {
        if (res.payload.list.length > 20) {
          this.tableData = res.payload.list.slice(0, 20)
          setTimeout(() => {
            res.payload.list.slice(20).forEach((item) => {
              this.tableData.push(item)
            })
          }, 200)
        } else {
          this.tableData = res.payload.list
        }
        this.page.total = res.payload.total
        this.tableLoading = false
      })
      return true
    },
    getRowClass: function({ row, column, rowIndex, columnIndex }) {
      if (rowIndex === 0) {
        return 'background:#EFEFEF'
      } else {
        return ''
      }
    },
    selectRemote(field, keyWord) {
      this.form.model()[field].props.loading = true
      request({
        url: strVarReplace(this.form.model()[field].props.selectApi, this.form.formData()),
        method: 'get',
        params: { kw: keyWord }
      }).then(res => {
        if (res.payload.length > 0) {
          this.form.model()[field].options = res.payload
        }
        this.form.model()[field].props.loading = false
      })
    },
    handleSelectionChange: function(selectedRow) {
      this.selectedRow = selectedRow
    },
    currentPageChange: function(currentPage) {
      if (currentPage - this.page.currentPage > 100) {
        Message.warning('禁止大跨度翻页')
        this.paginationKey += 1
        return
      }
      console.log(this.page.currentPage, currentPage)
      this.page.currentPage = currentPage
      this.getList()
    },
    pageSizesChange: function(pageSize) {
      this.page.pageSize = pageSize
      this.getList()
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
    sortChange: function({ column, prop, order }) {
      this.page.order = {}
      this.page.order.orderColumn = prop
      this.page.order.orderType = order
      return this.getList()
    },
    imageLarge(imgUrl) {
      this.$alert('<img src="' + imgUrl + '" style="max-height: 500px;">', '', {
        showClose: false,
        dangerouslyUseHTMLString: true,
        showConfirmButton: false,
        closeOnClickModal: true
      })
    },
    rowChange: function(row, key, val) {
      console.log(row, key, val)
      const data = {}
      data[key] = val
      request({
        // todo
        url: strVarReplace(this.defaultOptions.rowChangeApi, row),
        method: 'POST',
        data: data
      }).then(res => {
        this.$message.success('保存成功')
      })
    },
    whereFilter: function(obj, where) {
      return whereFilter(obj, where)
    },
    renderHeaderMethods(h, { column }, header) {
      return (<span>
        {header.info ? <el-tooltip effect='dark' content={header.info} placement='top-start'>
          <span>
            {column.label}&nbsp;<i class='el-icon-info' style='color:#409eff;margin-left:5px;'></i>
          </span>
        </el-tooltip>
          : <span> {column.label} </span>}
      </span>)
    },
    actionColumnWidth: function() {
      let ratio = 0
      this.rowActions.forEach((item) => {
        ratio += item.text ? item.text.length : 3
      })
      return ratio * 10 + 130
    },
    varReplace: function(str, obj) {
      return strVarReplace(str, obj)
    },
    childsLoad: function(tree, treeNode, resolve) {
      console.log(tree, treeNode)
      request({
        url: strVarReplace(this.$props.childsLoadApi, tree)
      }).then(res => {
        console.log(res)
        resolve(res.payload.childs || [])
      })
    },
    getSubject() {
      return this.$route.path.split('/')[1]
    },
    exportAction: function() {
      request({
        url: '/user/export',
        data: {
          name: this.$route.meta.title,
          url: this.$props.listApi,
          filters: this.form.formData()
        },
        method: 'POST'
      }).then(response => {
        this.$message(response.message)
      })
    },
    getSelected() {
      return {
        selected: this.selectedRow
      }
    },
    getBaseData() {
      return Object.assign({}, this.$route.query)
    },
    batchActionPreCheck() {
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
    afterButtonSubmit(item) {
      ['form', 'api'].indexOf(item.type) > -1 && this.getList()
      this.$emit('after-btn-submit')
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
  .el-table .cell {
    white-space: pre-line;
  }
  .operate-flex{
    line-height: 35px;
    .el-button {
      margin-left: 10px;
    }
  }
}
</style>
