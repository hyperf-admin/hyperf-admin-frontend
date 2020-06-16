<template>
  <el-select
    v-model="id"
    filterable
    remote
    reserve-keyword
    :size="size"
    :placeholder="placeholder"
    :remote-method="handleSelectRemote"
    :loading="loading"
    :disabled="disabled"
    value-key="value"
    @change="handleChange"
  >
    <el-option
      v-for="item in selectOptions"
      :key="item.value"
      :value="item"
      :label="item.label"
    />
  </el-select>
</template>
<script>
import request from '@/utils/request'

export default {
  name: 'BaseSelect',
  props: {
    remoteApi: {
      type: String,
      default: ''
    },
    keyWord: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'mini'
    },
    placeholder: {
      type: String,
      default: '请输入'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    rowScope: {
      // 如果需要改变的是表单的行的某些参数，需要将参数柴传递过来
      type: Object,
      default: null
    },
    keyId: {
      type: String,
      default: ''
    },
    keyValue: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      id: '',
      loading: false,
      selectOptions: []
    }
  },
  watch: {
    keyWord(e) {
      this.id = e
    }
  },
  created() {
    this.id = this.keyWord
    if (this.keyWord) {
      this.handleSelectRemote(this.keyword)
    }
  },
  methods: {
    handleSelectRemote(query) {
      if (this.remoteApi && query) {
        this.loading = true
        request({ url: `${this.remoteApi}?kw=${query}` }).then(res => {
          if (res.code === 0 && res.payload) {
            this.selectOptions = res.payload
          }
          this.loading = false
        })
      }
    },
    handleChange(e) {
      if (this.rowScope && this.keyId && this.keyValue) {
        const rowScope = {
          'scopeIndex': this.rowScope.$index
        }
        rowScope[this.keyId] = e.value
        rowScope[this.keyValue] = e.label
        this.$emit('change', { ...this.rowScope.row, ...rowScope })
        return
      }
      this.$emit('input', e)
      this.$emit('change', e)
    }
  }
}
</script>
