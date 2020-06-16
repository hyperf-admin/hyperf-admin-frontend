import Vue from 'vue'
import _ from 'lodash'
import request from '@/utils/request'

const template = `
    <div class="group-checkbox">
        <el-button v-if="loadingText" type="text" style="color: #606266;" :loading="loading">{{ loadingText }}</el-button>
        <el-collapse>
          <el-collapse-item v-for="(group, groupIndex) in checkOptions" :key="groupIndex" :title="group.label" :name="groupIndex">
            <template slot="title">
              <span style="margin-right: 5px;"><strong>{{ group.label }}</strong></span>
              <el-checkbox v-model="group.checkAll" :label="group.value" :indeterminate="group.isIndeterminate" @change="handleCheckAll(group)">全选</el-checkbox>
            </template>
            <div v-if="onlyPid">
                <el-tag style="margin:16px 16px 0" v-for="(row, index) in group.options" :key="row.value" :label="row.value">{{ row.label }}</el-tag>
            </div>
            <el-checkbox-group v-else v-model="group.checkList">
              <el-checkbox v-for="(row, index) in group.options" :key="row.value" :label="row.value" @change="checked => handdleCheckOption(checked, group, row.value)">{{ row.label }}</el-checkbox>
            </el-checkbox-group>
          </el-collapse-item>
        </el-collapse>
    </div>
`

export default {
  type: 'template',
  name: 'gcheckbox',
  template: template,
  vm: new Vue({
    props: {
      disabled: Boolean,
      onlyPid: {
        type: Boolean,
        default: false
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
      noDataText: {
        type: String,
        default: '暂无数据'
      }
    },
    data() {
      return {
        loadingText: '拼命加载中',
        checkList: [],
        checkOptions: [],
        loading: true
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
        console.log(this.$props.remoteApi)
        if (this.$props.remoteApi === '') {
          this.closeLoading()
          return
        }
        // console.log(this.$props.formCreate.formData())
        request({
          url: this.$props.remoteApi,
          params: { 'id': this.$props.formCreate.formData().id }
        }).then(res => {
          if (typeof res.payload === 'undefined') {
            this.closeLoading(this.$props.noDataText)
            return
          }
          this.checkOptions = res.payload.map((item) => {
            this.checkList = _.concat(this.checkList, item.checkList)
            return item
          }) || []

          this.closeLoading()
          this.changeCheckList()
        }).catch(error => {
          console.log(error)
          this.closeLoading(this.$props.noDataText)
          return
        })
      },
      closeLoading: function(text) {
        this.loadingText = text
        this.loading = false
      },
      handleCheckAll: function(group) {
        const groupOptionValues = this.getOptionValues(group)
        group.checkList = group.checkAll ? _.without(groupOptionValues, group.value) : []
        if (group.checkAll) {
          this.checkList = _.uniq(_.concat(this.checkList, this.onlyPid ? [group.value] : groupOptionValues))
        } else {
          this.checkList = _.uniq(_.difference(this.checkList, this.onlyPid ? [group.value] : groupOptionValues))
        }
        console.log(group.checkAll, this.onlyPid ? [group.value] : groupOptionValues, this.checkList, this.onlyPid)
        group.isIndeterminate = false
        this.changeCheckList()
      },
      getOptionValues: function(group) {
        const values = []
        values.push(group.value)
        if (group.options !== undefined) {
          group.options.forEach(item => {
            values.push(item.value)
          })
        }
        return values
      },
      handdleCheckOption: function(checked, group, value) {
        const checkedCount = group.checkList.length
        const groupOptionsCount = this.getOptionValues(group).length - 1
        group.checkAll = checkedCount === groupOptionsCount
        group.isIndeterminate = checkedCount > 0 && checkedCount < groupOptionsCount
        if (checked) {
          this.checkList.push(value)
        } else {
          this.checkList = _.without(this.checkList, value)
        }
        if (group.checkAll) {
          this.checkList.push(group.value)
        } else if (checkedCount === 0) {
          this.checkList = _.without(this.checkList, group.value)
        }
        this.changeCheckList()
      },
      changeCheckList: function() {
        const checkedOptions = _.uniq(this.checkList)
        this.$emit('input', checkedOptions)
        this.$emit('change', checkedOptions)
        this.$props.formCreate.getRule(this.$props.field).on.change(checkedOptions)
      }
    }
  })
}
