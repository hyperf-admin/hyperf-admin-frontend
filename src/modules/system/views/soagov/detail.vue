<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-date" />节点</span>
        <v-table
          :key="nodeTable.key"
          :table-header="nodeTable.tableHeader"
          :table-data="nodeTable.tableData"
          :row-actions="nodeTable.rowActions"
          :selection-able="true"
          :options="nodeTable.options"
          :list-api="nodeTable.listApi"
        />
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="el-icon-date" />路由</span>
        <v-table
          :key="routeTable.key"
          :table-header="routeTable.tableHeader"
          :table-data="routeTable.tableData"
          :row-actions="routeTable.rowActions"
          :filter-rule="routeTable.filterRule"
          :selection-able="true"
          :options="routeTable.options"
          :list-api="routeTable.listApi"
        />
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="el-icon-date" />数据</span>
        <p>总数：{{ state.total }}</p>
        <el-divider />
        <el-row :gutter="20">
          <el-col :span="4">
            <div class="grid-content ">
              <p>1. 可用性</p>
              <el-table
                :data="state.httpCode"
                :default-sort="{prop: 'cnt', order: 'descending'}"
                max-height="550"
                style="width: 100%"
              >
                <el-table-column prop="httpCode" label="http code" width="100" />
                <el-table-column prop="cnt" label="cnt" sortable width="80" />
              </el-table>
              <el-table
                :data="state.costTime"
                :default-sort="{prop: 'cnt', order: 'descending'}"
                max-height="550"
                style="width: 100%"
              >
                <el-table-column prop="costTime" label="cost time" width="100" />
                <el-table-column prop="cnt" label="cnt" sortable width="80" />
              </el-table>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="grid-content ">
              <p>2. 来路</p>
              <el-table
                :data="state.refer"
                :default-sort="{prop: 'cnt', order: 'descending'}"
                max-height="550"
                style="width: 100%"
              >
                <el-table-column prop="refer" label="app" width="200" />
                <el-table-column prop="cnt" label="cnt" sortable width="80" />
              </el-table>
            </div>
          </el-col>
          <el-col :span="14">
            <div class="grid-content ">
              <p>3. 路由</p>
              <el-table
                :data="state.route.filter(data => !routeSearch || data.route.toLowerCase().includes(routeSearch.toLowerCase()))"
                :default-sort="{prop: 'cnt', order: 'descending'}"
                max-height="550"
                style="width: 100%"
              >
                <el-table-column prop="route" label="route" width="420" />
                <el-table-column prop="cnt" label="cnt" sortable width="80" />
                <el-table-column align="right">
                  <template slot="header" :data="scope">
                    <el-input v-model="routeSearch" size="mini" placeholder="输入关键字搜索" />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-col>
        </el-row>
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
      serviceName: '',
      editTabModel: false,
      tabs: [],
      state: [],
      routeSearch: '',
      tabLoading: false,
      tableHeader: [
        { field: 'name', title: '名称' },
        { field: 'health', title: '状态', type: 'switch' }
      ],
      tabCell: {},
      nodeTable: {
        listApi: '/soagov/service/detail/' + this.$route.params.name + '/nodes',
        tableData: [],
        tableHeader: [
          { field: 'ServiceID', title: '名称' },
          { field: 'ServiceAddress', title: '地址' },
          { field: 'ServicePort', title: '端口' },
          { field: 'ServiceTags', title: '标签' },
          { field: 'health', title: '状态', type: 'switch' }
        ],
        options: {
          createAble: false,
          exportAble: false
        },
        key: 0
      },
      routeTable: {
        listApi: '/soagov/service/detail/' + this.$route.params.name + '/routes',
        tableData: [],
        filterRule: [
          { field: 'search_kw', title: '' }
        ],
        tableHeader: [
          { field: 'type', title: '类型' },
          { field: 'method', title: '方法' },
          { field: 'route', title: '路由' },
          { field: 'available', title: '可用' }
        ],
        rowActions: [
          {
            type: 'api',
            target: '/soagov/service/detail/' + this.$route.params.name + '/routeunable?type={type}&method={method}&route={route}',
            text: '设置不可用',
            props: {
              type: 'danger'
            }
          }
        ],
        options: {
          createAble: false,
          exportAble: false,
          filterSyncToQuery: true
        },
        key: 0
      },
      stateTable: {
        listApi: '/soagov/service/detail/' + this.$route.params.name + '/state',
        tableData: [],
        tableHeader: [
          { field: 'total', title: '总数' },
          { field: 'http_code', title: '状态码' },
          { field: 'refer', title: '来路' },
          { field: 'route', title: '路由' }
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
      url: '/soagov/service/detail/' + this.$route.params.name + '/state'
    }).then(res => {
      this.state = clone(res.payload.list)
      this.routeSearch = ''
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
