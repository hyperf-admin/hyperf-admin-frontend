<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <v-table
          ref="refTable"
          :key="table.key"
          :table-header="table.tableHeader"
          :table-data="table.tableData"
          :filter-rule="table.filterRule"
          :row-actions="table.rowActions"
          :selection-able="true"
          :options="table.options"
          :list-api="table.listApi"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import request from '@/utils/request'
import { clone } from '@/utils/index'
import VTable from '@/components/scaffold/VTable.vue'
export default {
  components: { VTable },
  data() {
    return {
      editTabModel: false,
      tabs: [],
      fullTabs: [],
      tabLoading: false,
      tableHeader: [
        { field: 'name', title: '名称' },
        { field: 'health', title: '状态', type: 'switch' }
      ],
      tabCell: {},
      table: {
        listApi: '/soagov/services',
        tableData: [],
        tableHeader: [
          { field: 'name', title: '名称' },
          { field: 'health', title: '状态', type: 'switch' }
        ],
        rowActions: [
          {
            type: 'info',
            target: '/soagov/service/detail/{name}',
            text: '详情'
          }
        ],
        options: {
          createAble: false,
          exportAble: false,
          filterSyncToQuery: true
        },
        key: 0
      }
    }
  },
  create() {
    request({
      url: '/soagov/services'
    }).then(res => {
      this.fullTabs = clone(res.payload.list)
    })
  },
  methods: {
    test: function() {
    }
  }
}
</script>

<style scoped>

</style>
