<template>
  <div>
    <v-table
      v-if="tableHeader.length > 0"
      :key="key"
      :table-header="tableHeader"
      :table-data="tableData"
      :filter-rule="filterRule"
      :row-actions="rowActions"
      :selection-able="true"
      :options="options"
    />
  </div>
</template>

<script>
import request from '@/utils/request'
import VTable from '@/components/scaffold/VTable.vue'
export default {
  components: {
    VTable
  },
  data() {
    return {
      filterRule: [],
      tableData: [],
      tableHeader: [],
      rowActions: [],
      options: {
        batchButtons: []
      },
      key: 0
    }
  },
  beforeCreate() { // 在创建视图之前拿到压面配置选项
    request({
      url: this.$route.path.replace('list', 'info'),
      method: 'get'
    }).then(res => {
      this.filterRule = res.payload.filterRule || []
      this.tableHeader = res.payload.tableHeader || []
      this.rowActions = res.payload.rowActions || []
      this.options = res.payload.options || []
      this.key = 1
    })
  }
}
</script>

<style scoped>
</style>

