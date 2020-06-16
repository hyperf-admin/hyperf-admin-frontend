<template>
  <el-table :data="msgs" :height="getMaxHeight()" :row-class-name="tableRowClassName">
    <el-table-column v-for="(each, index) in headers" :key="index" :label="each">
      <template slot-scope="scope">
        <span>{{ scope.row[each] }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { showEleByClassName } from '@/utils'
let buffer = []
export default {
  name: 'SocketList',
  props: {
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      ws: null,
      headers: [],
      msgs: []
    }
  },
  beforeCreate() {
  },
  created() {
    console.log('SocketList', this.$props)
    this.ws = new WebSocket(this.$props.url)
    this.ws.onopen = _ => this.ws.send(1111)
    this.ws.onmessage = this.onMessage
    console.log('SocketList', this.ws, this.$props.url)
    const interval = setInterval(() => {
      if (buffer.length > 0) {
        this.msgs = this.msgs.concat(buffer)
      }
      // if (this.msgs.length > 10) {
      //   this.msgs = this.msgs.splice(0, this.msgs.length - 5)
      // }
      buffer = []
      showEleByClassName('socket-list', 'center', 'instant', 'last')
    }, 1000)
    this.$on('destroyed', () => {
      clearInterval(interval)
    })
  },
  mounted() {
  },
  beforeDestroy() {
    this.ws.close()
    this.ws = null
    this.msgs = []
  },
  methods: {
    onMessage(messageEvent) {
      const { type, data } = JSON.parse(messageEvent.data)
      if (type === 'header') {
        this.headers = data
      }
      if (type === 'msg') {
        buffer.push(data)
      }
    },
    getMaxHeight() {
      return document.body.clientHeight - document.body.clientHeight * 0.2
    },
    tableRowClassName({ row, rowIndex }) {
      const prefix = 'socket-list'
      if (rowIndex % 2 === 0) {
        return `${prefix} warning-row`
      } else if (rowIndex % 2 === 1) {
        return `${prefix} success-row`
      }
      return `${prefix}`
    }
  }
}
</script>

<style>
  .el-table .warning-row {
    background: oldlace;
  }

  .el-table .success-row {
    background: #f0f9eb;
  }
</style>
