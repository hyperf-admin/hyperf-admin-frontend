<template>
  <div>
    <v-form
      :key="formKey"
      v-model="fApi"
      :p-key="formKey"
      :rules="filterRule"
      :option="option"
      @mounted="onMounted"
    />
  </div>
</template>

<script>
import VForm from '@/components/scaffold/VForm'
import { type } from '@/utils/index'
export default {
  name: 'FilterForm',
  components: {
    VForm
  },
  props: {
    rules: {
      type: Array,
      default: function() {
        return []
      }
    },
    activeTab: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      fApi: {},
      filterRule: [],
      btnRule: {
        type: 'el-form-item',
        field: '',
        children: [
          {
            type: 'el-button',
            on: {
              click: (form) => this.onSubmit(form.$f.formData())
            },
            col: {
              span: 3,
              push: 1
            },
            props: {
              type: 'primary',
              icon: 'el-icon-search'
            },
            children: ['搜索']
          },
          {
            type: 'el-button',
            col: {
              span: 3,
              push: 1
            },
            on: {
              click: (form) => this.onReset(form.$f)
            },
            children: ['清空']
          }
        ]
      },
      option: {
        form: {
          inline: true,
          labelPosition: 'left',
          labelWidth: 'auto',
          size: 'small'
        },
        submitBtn: false,
        resetBtn: false
      }
    }
  },
  computed: {
    tabId: function() {
      return this.$route.query.tab_id || this.$props.activeTab
    },
    formKey: function() {
      return 'filter_form_' + this.tabId
    }
  },
  watch: {
    tabId: function(val) {
      this.filterFormRule(val)
    }
  },
  created() {
    this.filterFormRule(this.$props.activeTab)
  },
  methods: {
    filterFormRule: function(tabId) {
      const rules = []
      const query = this.$route.query
      this.$props.rules.forEach((item) => {
        const rule = this._.cloneDeep(item)
        if (query[rule.field]) {
          rule.value = query[item.field]
        }
        if (!rule.depend || !rule.depend.tab || rule.depend.tab.indexOf(tabId) !== -1) {
          rules.push(rule)
        }
      })

      if (rules.length > 0) {
        rules.push(this.btnRule)
      }

      this.filterRule = this._.cloneDeep(rules)
    },
    onSubmit: function(formData) {
      this.sync2query()
    },
    onReset: function(formCreate) {
      const formCreateData = formCreate.formData()
      Object.keys(formCreateData).forEach(key => {
        if (formCreateData[key] !== '') {
          formCreate.setValue(key, null)
        }
      })
      const formData = {}
      if (this.tabId.length > 0) {
        formData.tab_id = this.tabId
      }
      this.$router.push({
        query: formData
      })
    },
    onMounted($f) {
      console.log('FilterForm', $f)
      // this.sync2query()
    },
    sync2query($f) {
      const fApi = $f || this.fApi
      const formData = fApi.formData()
      Object.keys(formData).forEach(key => {
        console.log('FilterForm sync2query', key, formData[key])
        if (formData[key] === '') {
          delete formData[key]
        }
        if (type(formData[key]) === 'array') {
          const real = formData[key].filter(item => item !== '')
          if (real.length === 0) {
            delete formData[key]
          }
        }
      })
      if (this.tabId.length > 0) {
        formData.tab_id = this.tabId
      }
      this.$router.push({
        query: formData
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-form-item--small.el-form-item {
  margin-bottom: 10px;
}
</style>
