<template>
  <div>
    <!--    <v-form-->
    <!--      v-if="filterRule"-->
    <!--      ref="filter"-->
    <!--      :rules="filterRule"-->
    <!--      :option="options"-->
    <!--      @change="onFormChange"-->
    <!--      @mounted="($f) => fApi = $f"-->
    <!--    />-->
    <el-scrollbar>
      <el-table
        size="small"
        :data="$props.data"
        class="data-table"
      >
        <el-table-column
          v-for="(item, index) in getTitle()"
          :key="index"
          :prop="item"
          :label="item"
        />
      </el-table>
    </el-scrollbar>
  </div>
</template>

<script>
// import VForm from '@/components/scaffold/VForm.vue'

export default {
  name: 'DataTable',
  components: {},
  props: {
    data: { type: Array, default: _ => [] },
    config: { type: Object, default: _ => {} }
  },
  inject: ['dataCard'],
  data() {
    return {
      fApi: {},
      filterRule: [],
      options: {
        form: {
          inline: true,
          labelWidth: 'auto',
          size: 'small'
        },
        submitBtn: false,
        resetBtn: false
      }
    }
  },
  watch: {
    config: {
      handler(config = {}) {
        const { filterRule } = config
        this.filterRule = filterRule || []
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    this.dataCard && (this.dataCard.handleRefresh = this.handleRefresh)
  },
  methods: {
    handleRefresh() {
      this.dataCard.refresh(this.fApi.formData())
    },
    getTitle() {
      return Object.keys(this.$props.data[0])
    },
    onFormChange(fApi) {
      // 刷新数据
      this.dataCard && this.handleRefresh
    }
  }
}
</script>

<style lang="less" scoped>
.data-table{
  max-height: 420px;
  width: 100%;
  overflow: initial;
  position: relative;
}
</style>
