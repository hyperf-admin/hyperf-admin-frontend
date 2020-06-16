<template>
  <div>
    <el-cascader
      v-model="data"
      :options="options"
      filterable
      :show-all-levels="true"
      size="small"
      :props="props"
      @change="handleChange"
    />
  </div>
</template>

<script>
import axios from 'axios'
import request from '@/utils/request'
export default {
  name: 'Category',
  props: {
    api: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      data: [],
      options: [],
      props: {
        multiple: true,
        checkStrictly: true
      }
    }
  },
  created() {
    console.log(this.$props)
    if (this.$props.api) {
      request({ url: this.$props.api }).then(res => {
        this.options = res.payload
      })
    } else {
      axios.get('http://qupinapptest.oss-cn-beijing.aliyuncs.com/common/category/20191212/staple_13_1576161056.json').then(res => {
        this.options = res.data
      })
    }
    this.data = this.$attrs.value
  },
  methods: {
    handleChange: function() {
      this.$emit('input', this.data)
      this.$emit('change', this.data)
    }
  }
}
</script>

<style scoped>

</style>
