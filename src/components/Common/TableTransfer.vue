<template>
  <div class="table-tansfer">
    <el-row :gutter="12" style="margin: 0 0 5px 0;">
      <el-col :span="12" style="padding-left:0px;">
        <el-input v-model="searchfilter" clearable size="mini" placeholder="请输入">
          <el-button slot="append" icon="el-icon-search" />
        </el-input>
      </el-col>
      <el-col :span="12">
        <el-button size="mini" @click.native="addRows">加入</el-button>
        <el-button size="mini" type="danger" @click.native="removeRows">移除</el-button>
      </el-col>
    </el-row>
    <el-row :gutter="12">
      <el-col :span="12">
        <el-table
          ref="multipleTable"
          :data="leftData"
          border
          size="mini"
          max-height="350"
          highlight-current-row
          row-key="id"
          :header-cell-style="getRowClass"
          :empty-text="emptyText"
          style="width: 100%;"
          @selection-change="(selection) => handleSelectionChange(selection, 1)"
        >
          <el-table-column
            type="selection"
            width="40"
          />
          <template v-for="item in tableHeader">
            <template>
              <el-table-column :key="item.field" :prop="item.field" :label="item.title" :with="item.with" />
            </template>
          </template>
        </el-table>
      </el-col>
      <el-col :span="12">
        <el-table-draggable>
          <el-table
            :data="rightData"
            border
            size="mini"
            :header-cell-style="getRowClass"
            :empty-text="emptyText"
            max-height="350"
            style="width: 100%;"
            @selection-change="(selection) => handleSelectionChange(selection, 2)"
          >
            <el-table-column
              type="selection"
              width="40"
            />
            <template v-for="item in tableHeader">
              <template>
                <el-table-column :key="item.field" :prop="item.field" :label="item.title" :with="item.with" />
              </template>
            </template>
          </el-table>
        </el-table-draggable>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import _ from 'lodash'
import request from '@/utils/request'
import { strVarReplace } from '@/utils/index'
import ElTableDraggable from 'element-ui-el-table-draggable'
import { Message } from 'element-ui'

export default {
  name: 'TableTransfer',
  components: { ElTableDraggable },
  props: {
    disabled: Boolean,
    value: {
      type: [Array, String, Number],
      default: () => ([])
    },
    title: {
      type: String,
      default: ''
    },
    remoteApi: {
      type: String,
      default: ''
    },
    field: {
      type: String,
      default: ''
    },
    tableHeader: {
      type: Array,
      default: function() {
        return [
          {
            title: 'path',
            field: 'uri'
          },
          {
            title: '请求方式',
            field: 'http_method'
          },
          {
            title: '别名',
            field: 'name'
          }
        ]
      }
    }
  },
  data() {
    return {
      emptyText: '暂无数据',
      leftSelectionData: [],
      rightSelectionData: [],
      searchfilter: '',
      tableData: [],
      leftData: [],
      rightData: []
    }
  },
  watch: {
    searchfilter: function(val) {
      const _self = this
      this.leftData = this.tableData.filter((data) => this.filterMethod(data, val), _self)
    },
    rightData: function() {
      this.updateValue()
    }
  },
  beforeCreate: function() {
  },
  created: function() {
    this._.delay(() => this.init(), 200)
  },
  methods: {
    init: function() {
      this.getList()
    },
    getList: function() {
      if (this.$props.remoteApi === '') {
        return
      }
      const params = {
        id: this.$props.value
      }
      request({
        url: strVarReplace(this.$props.remoteApi, params)
      }).then(res => {
        if (typeof res.payload.left === 'undefined') {
          return
        }
        this.tableData = res.payload.left.map((item) => {
          return item
        }) || []
        this.leftData = this.tableData
        this.rightData = res.payload.right.map((item) => {
          return item
        }) || []
      }).catch(error => {
        console.log(error)
        return
      })
    },
    filterMethod(data, val) {
      let result = !val
      this.tableHeader.forEach(item => {
        if (result === false) {
          result = data[item.field].toLowerCase().includes(val.toLowerCase())
        }
      })
      return result
    },
    getRowClass: function({ row, column, rowIndex, columnIndex }) {
      if (rowIndex === 0) {
        return 'line-height:20px;background:#fafafa;'
      } else {
        return ''
      }
    },
    addRows: function() {
      if (this.leftSelectionData.length === 0) {
        Message({
          message: '请勾选左侧数据',
          type: 'warning',
          duration: 5 * 1000
        })
        return
      }
      this.tableData = _.differenceBy(this.tableData, this.leftSelectionData, 'id')
      this.leftData = this.tableData
      this.rightData = _.uniqBy(_.concat(this.rightData, this.leftSelectionData), 'id')
    },
    removeRows: function() {
      if (this.rightSelectionData.length === 0) {
        Message({
          message: '请勾选右侧数据',
          type: 'warning',
          duration: 5 * 1000
        })
        return
      }
      this.rightData = _.differenceBy(this.rightData, this.rightSelectionData, 'id')
      this.tableData = _.uniqBy(_.concat(this.tableData, this.rightSelectionData), 'id')
      this.leftData = this.tableData
    },
    updateValue: function() {
      let value = []
      if (this.rightData.length > 0) {
        this.rightData.forEach(item => {
          value.push(item.id)
        })
        value = _.uniq(value)
      }
      this.$emit('input', value)
      this.$emit('change', value)
    },
    handleSelectionChange: function(selection, type) {
      if (type === 1) {
        this.leftSelectionData = selection
      } else {
        this.rightSelectionData = selection
      }
    }
  }
}
</script>

<style scoped>

</style>
