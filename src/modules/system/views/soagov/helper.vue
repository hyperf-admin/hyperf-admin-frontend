<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-date" />sdk获取</span>
        <v-table
          :key="sdkTable.key"
          :table-header="sdkTable.tableHeader"
          :table-data="sdkTable.tableData"
          :filter-rule="sdkTable.filterRule"
          :row-actions="sdkTable.rowActions"
          :selection-able="true"
          :options="sdkTable.options"
          :list-api="sdkTable.listApi"
        />
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="el-icon-date" />日志查询</span>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import request from '@/utils/request'
import VTable from '@/components/scaffold/VTable.vue'
export default {
  components: { VTable },
  data() {
    return {
      serviceName: '',
      editTabModel: false,
      tabs: [],
      tabLoading: false,
      tabCell: {},
      sdkTable: {
        listApi: '/soagov-helper/sdk',
        tableData: [],
        tableHeader: [
          { field: 'lang', title: '语言' }
        ],
        rowActions: [
          {
            type: 'action',
            target: '/sdk/download?lang={lang}',
            text: '下载'
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
  created() {
    request({
      url: '/soagov-helper/sdk'
    }).then(res => {
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
