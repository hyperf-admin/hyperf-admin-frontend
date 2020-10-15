<template>
  <div>
    <el-alert>{{ countdown }}秒后刷新</el-alert>
    <el-table
      v-loading="loading"
      :data="tasks"
      size="mini"
      style="width: 100%"
      max-height="550"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <el-table-column width="100" property="name" label="导出任务名" />
      <el-table-column label="任务状态" width="110">
        <template slot-scope="scope">
          <el-link v-if="scope.row.status === 2" :href="getUrl(scope.row.download_url)" type="primary">点我下载</el-link>
          <el-progress v-else :percentage="Math.round((scope.row.current_page / scope.row.total_pages) * 100)" :status="getStatus(scope.row.status)" />
        </template>
      </el-table-column>
      <el-table-column label="" width="40">
        <template slot-scope="scope">
          <i v-if="scope.row.status === 2 || scope.row.status === 3" class="el-icon-refresh-right change-pointer" title="重新下载" @click="retryExport(scope.row.id)" />
        </template>
      </el-table-column>
      <el-table-column width="135" label="创建时间" property="create_at" />
    </el-table>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'ExportTask',
  props: {
    pollRequest: {
      type: Boolean,
      default: false
    },
    requestExport: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      taskInterval: null,
      downInterval: null,
      tasks: [],
      loading: false,
      countdown: 10
    }
  },
  watch: {
    requestExport: function(nv, ov) {
      if (nv) {
        this.getExports()
      }
    }
  },
  created: function() {
    if (this.$props.pollRequest) {
      this.taskInterval = setInterval(() => {
        this.getExports()
      }, 10000)
      this.downInterval = setInterval(() => {
        if (this.countdown === 0) {
          this.countdown = 10
        } else {
          this.countdown--
        }
      }, 1000)
    } else {
      this.getExports()
    }
  },
  beforeDestroy() {
    clearInterval(this.taskInterval)
    clearInterval(this.downInterval)
  },
  methods: {
    getExports() {
      this.loading = true
      request({
        url: '/user/exports',
        method: 'get'
      }).then(res => {
        console.log(res)
        this.tasks = res.payload.list
        this.loading = false
      })
    },
    retryExport(id) {
      request({
        url: '/user/exports/retry/' + id,
        method: 'post'
      }).then(res => {
        console.log(res)
        this.getExports()
      })
    },
    getStatus(status) {
      if (status === 3) {
        return 'exception'
      }
      return null
    },
    getUrl(url) {
      return location.origin + this.$store.state.settings['baseAPI'] + '/upload/ossprivateurl?key=' + url
    }
  }
}
</script>

<style scoped>
.change-pointer {
  cursor: pointer;
}
</style>
