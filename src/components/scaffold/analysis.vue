<template>
  <div class="analysis-template">
    <div v-if="errors.length > 0">
      <el-alert
        v-for="(item, index) in errors"
        :key="index"
        :title="item"
        type="error"
      />
    </div>
    <el-row :gutter="20">
      <DataCard
        v-for="(item, index) in rule"
        :id="item.id"
        :key="`card_${index}`"
        v-slot:default="scope"
        :title="item.id"
        :col="item.col"
        :card-data="item.data"
        :refreshable="item.refreshable"
        :data-api="item.dataApi"
      >
        <template v-if="item.type !=='debug_dump'">
          <data-chart :name="item.id" :chart="item.chart" :data="scope.newData" />
          <data-table v-if="item.show_table || false" :data="scope.newData" :config="item.config" />
        </template>
        <template v-else>
          <template v-if="dev">
            <div v-for="(each, i) in item.data" :key="`debug_dump_${i}`">
              <div v-html="each" />
            </div>
          </template>
        </template>
      </DataCard>
    </el-row>
  </div>
</template>
<script>
import DataCard from '@/components/Charts/DataCard'
import DataChart from '@/components/Charts/DataChart'
import DataTable from '@/components/Charts/DataTable'
import request from '@/utils/request'
export default {
  name: 'Analysis',
  components: { DataChart, DataTable, DataCard },
  props: {
    id: {
      type: [Number, String],
      default: ''
    }
  },
  data() {
    return {
      rule: [],
      errors: [],
      dev: false
    }
  },
  created() {
    const id = this.id || this.$route.params.id
    if (!id) {
      return
    }
    this.dev = this.$route.query.dev !== undefined
    const dev = this.dev ? '?dev=true' : ''
    request({
      url: `/reports/execute/${id}${dev}`
    }).then(res => {
      const payload = res.payload
      console.log(payload)
      this.errors = payload.errors
      const rule = []
      payload.result.forEach(item => {
        if (this.dev === false) {
          if (item.type !== 'debug_dump') {
            rule.push(item)
          }
        } else {
          rule.push(item)
        }
      })
      this.rule = rule
    })
  },
  mounted() {
  },
  methods: {
  }
}
</script>
<style lang="less" scoped>
.analysis-template {
  min-height: calc(100vh - 50px);
  background: #f0f2f5;
  margin: -20px;
  padding: 20px 20px 0px;
  .value {
    font-size: 26px;
    margin: 20px 0 10px;
  }
}
</style>
