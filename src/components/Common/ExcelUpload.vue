<template>
  <div style="text-align: center">
    <el-upload
      :before-upload="readFile"
      class="upload-demo"
      drag
      accept=".xls, .xlsx, .csv"
      action="#"
      :show-file-list="showFileList"
      :http-request="preventDefaultAction"
      multiple
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div slot="tip" class="el-upload__tip">只能上传xls/xlsx/csv文件, 大小不要超过2M</div>
    </el-upload>
  </div>
</template>
<script>
import excel from '@/utils/excel'
import { Message } from 'element-ui'
import request from '@/utils/request'
export default {
  name: 'ExcelUpload',
  props: {
    afterAction: {
      type: Function,
      default: _ => {}
    }
  },
  data() {
    return {
      showFileList: true,
      autoUpload: false,
      uploadLoading: false,
      showProgress: false,
      progressPercent: 0,
      excelData: []
    }
  },
  methods: {
    // 读取文件
    readFile(file) {
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onloadstart = e => {
        this.uploadLoading = true
        this.showProgress = true
      }
      reader.onprogress = e => {
        this.progressPercent = Math.round(e.loaded / e.total * 100)
      }
      reader.onerror = e => {
        Message({
          message: e.message || '文件上传出错',
          type: 'alert',
          duration: 2 * 1000
        })
      }
      reader.onload = e => {
        const data = e.target.result
        const { results } = excel.read(data, 'array')
        this.excelData = results
        this.sendExcelData()
      }
    },
    sendExcelData() {
      request.post(this.$route.path.replace(/list/, 'import'), { 'payload': this.excelData }).then(res => {
        Message({
          message: res.message || '文件上传成功',
          type: 'success',
          duration: 2 * 1000
        })
        this.$props.afterAction()
      })
    },
    preventDefaultAction() {
      console.log('采用自定义请求动作')
    }
  }
}
</script>
