import Vue from 'vue'
import request from '@/utils/request'
import { strVarReplace } from '@/utils/index'
const template = `
    <div class="el-select">
        <el-select
                v-model="selected"
                :key="key"
                style="width: 100%;"
                :multiple="multiple"
                :multiple-limit="multipleLimit"
                filterable="filterable"
                clearable
                remote
                reserve-keyword
                :size="size"
                :placeholder="placeholder"
                :remote-method="remoteMethod"
                :allow-create="allowCreate"
                @change="onChange"
                :loading="loading"
                :no-data-text="noDataText">
            <el-option
                    v-for="item in selectOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
            </el-option>
        </el-select>
    </div>
`

export default {
  name: 'select_remote',
  template: template,
  vm: new Vue({
    props: {
      disabled: Boolean,
      value: {
        type: String | Array | Number,
        default: ''
      },
      size: {
        type: String,
        default: 'small'
      },
      placeholder: {
        type: String,
        default: '请输入关键词'
      },
      remoteApi: {
        type: String,
        default: ''
      },
      multiple: {
        type: Boolean,
        default: false
      },
      multipleLimit: {
        type: Number,
        default: 0
      },
      filterable: {
        type: Boolean,
        default: false
      },
      allowCreate: {
        type: Boolean,
        default: false
      },
      change: {
        type: Function,
        default: function() {

        }
      },
      noDataText: {
        type: String,
        default: '无数据'
      },
      field: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        selected: undefined,
        selectOptions: [],
        loading: false,
        key: 0
      }
    },
    watch: {
      value: {
        handler: function(now, old) {
          this.selected = parseInt(now)
        },
        immediate: true
      }
    },
    beforeCreate: function() {
    },
    created: function() {
      this._.delay(() => this.init(), 200)
    },
    methods: {
      init: function() {
        const pk = (typeof this.value !== 'object') ? this.value : this.value.join(',')
        this.getList({ id: pk })
      },
      remoteMethod: function(query) {
        if (query !== '' && query.length >= 1) {
          this._.debounce(() => this.getList({ kw: query }), 100)
        } else {
          this.selectOptions = []
        }
      },
      getList: function(filter) {
        request({
          url: strVarReplace(this.$props.remoteApi, this.$props.formCreate.formData()),
          params: filter
        }).then(res => {
          if (typeof res.payload === 'undefined') {
            return
          }
          this.selectOptions = res.payload.map((item) => {
            // item.id = parseInt(item.id);
            return item
          }) || []
        }).catch(error => {
          console.log(error)
        })
      },
      onChange: function() {
        const newValue = this.selected
        this.change(newValue, newValue)
        this.$emit('input', newValue)
        this.$emit('change', newValue)
        console.log(this.$props.field)
        this.$props.formCreate.getRule(this.$props.field).on.change(newValue)
      }
    }
  })
}
