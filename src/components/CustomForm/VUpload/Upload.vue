<template>
  <el-upload
    ref="upload"
    class="oms-upload"
    multiple
    list-type="picture-card"
    :accept="accept"
    :headers="headers"
    :limit="limit"
    :class="{hide:showUpload}"
    :action="action"
    :auto-upload="true"
    :before-upload="beforeUpload"
    :before-remove="beforeRemove"
    :on-success="handleSuccess"
    :on-change="handleChange"
    :on-exceed="onExceed"
  >
    <!-- 上传 -->
    <i slot="default" class="el-icon-upload2 upload-icon" :style="{ width: `${width - 2}px`, height: `${height - 2}px`, lineHeight: `${height - 2}px`}" />
    <div slot="tip"><slot name="tip" /></div>
    <!-- 自定义文件展示区 -->
    <div slot="file" slot-scope="{file}" class="file-slot" :style="{ width: `${width - 2}px`, height: `${height - 2}px`}">
      <el-image
        v-if="file.url"
        :ref="`image_${file.uid}`"
        class="el-upload-list__item-thumbnail"
        lazy
        :src="file.url"
        :preview-src-list="getImagePreviewList(value, file.url)"
      >
        <div slot="error" class="file-icon" :style="{lineHeight: `${height - 2}px`}">
          <i class="el-icon-document" />
        </div>
      </el-image>

      <el-progress
        v-if="file.percentage !== undefined && file.status !== 'success'"
        :width="width > height ? height - 2 : width - 2"
        :style="{ width: `${width}px`, height: `${height}px`}"
        class="progress"
        :type="'circle'"
        :stroke-width="6"
        :percentage="parsePercentage(file.percentage)"
      />
      <!-- 操作按钮组-->
      <span v-else class="el-upload-list__item-actions">
        <div class="actions">
          <i class="el-icon-zoom-in preview" @click="handlePreview(file)" />
          <i v-if="downloadable" class="el-icon-download download" @click="handleDownload(file)" />
          <i class="el-icon-delete delete" @click="removeFile(file)" />
        </div>
      </span>
    </div>
  </el-upload>
</template>
<script>

function toArray(value) {
  return Array.isArray(value)
    ? value
    : ((value === undefined || value === null || value === '' ? [] : [value])
    )
}
export default {
  props: {
    value: { type: [Array, String], default: '' },
    width: { type: Number, default: 70 },
    height: { type: Number, default: 70 },
    headers: { type: Object, default: _ => {} },
    action: { type: String, default: process.env.VUE_APP_BASE_API + '/upload/image' },
    // 是否可下载
    downloadable: { type: Boolean, default: false },
    // 删除前二次确认
    removeConfirm: { type: Boolean, default: false },
    // 删除前二次确认提示文本
    removeConfirmText: { type: String, default: '此操作将删除该文件, 是否继续?' },
    // 上传数量
    limit: { type: Number, default: 1 },
    accept: { type: String, default: '' },
    format: { type: Array, default: _ => [] },
    maxSize: { type: Number, default: 0 },
    // 删除前置钩子
    beforeRemove: { type: Function, default: () => {} }
  },
  data() {
    return {
      tempIndex: 1,
      uploadList: []
    }
  },
  computed: {
    showUpload() {
      return this.uploadList.length >= this.limit
    }
  },
  watch: {
    value: {
      handler(value) {
        if (this.$refs.upload.uploadFiles.every(file => {
          return !file.status || file.status === 'success'
        })) {
          // 当所有的文件上传完成后更新文件列表
          this.$refs.upload.uploadFiles = toArray(value).map(this.parseFile)
          this.uploadList = this.$refs.upload.uploadFiles
        }
      },
      deep: true
    }
  },
  mounted() {
    // 初始化
    this.$refs.upload.uploadFiles = toArray(this.value).map(this.parseFile)
    this.uploadList = this.$refs.upload.uploadFiles
  },
  methods: {
    parseFile(file = '', index) {
      let uid = ''
      if (this.uploadList[index] && this.uploadList[index].url === file) {
        // 如果文件没变化  id不变 避免重绘
        uid = this.uploadList[index].uid || Date.now() + this.tempIndex++
      }
      return {
        url: file,
        name: file.split('/').pop(),
        status: 'success',
        uid: uid || (Date.now() + this.tempIndex++)
      }
    },
    updateValue() {
      if (this.$refs.upload.uploadFiles.every(file => {
        return file.status !== 'uploading'
      })) {
        const files = this.$refs.upload.uploadFiles.map((file) => file.url).filter((url) => url !== undefined)
        const value = this.limit === 1 ? (files[0] || '') : files
        this.$emit('input', value)
        this.$emit('change', value)
      }
    },
    beforeUpload(file) {
      const { format, maxSize } = { format: this.format, maxSize: this.maxSize }
      const { name, size } = file
      if (format && format.length > 0 && format.indexOf(name.split('.').reverse()[0]) === -1) {
        this.$message.warning(`格式错误，仅支持后缀名为 ${format.join('、')} 的文件!`)
        return false
      }
      if (maxSize && maxSize < size / 1024) {
        this.$message.warning(`文件大小不能超过 ${maxSize}KB !`)
        return false
      }
    },
    // 点击 remove 操作
    removeFile(file) {
      // 删除二次确认
      if (this.removeConfirm) {
        this.$confirm(this.removeConfirmText, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: false
        }).then(() => {
          // handleRemove 里会调用 beforeRemove 钩子
          this.$refs.upload.handleRemove(file)
          this.updateValue()
        }).catch(() => {
        })
      } else {
        this.$refs.upload.handleRemove(file)
        this.updateValue()
      }
    },
    // 预览操作
    handlePreview(file) {
      if (this.$refs[`image_${file.uid}`].error) {
        // 如果不是image  预览时打开文件
        location.href = file.url
      } else {
        this.$refs[`image_${file.uid}`].clickHandler()
      }
    },
    // 下载操作
    handleDownload(file) {
      if (this.$refs[`image_${file.uid}`].error) {
        // 如果是图片  新窗口下载
        location.href = file.url
      } else {
        window.open(file.url)
      }
    },
    // 成功操作
    handleSuccess(response, file, fileList) {
      if (response.code !== 0) {
        this.$notify.error({
          title: response.message || '上传失败',
          message: file.name
        })
        return
      }
      const url = response.payload.url
      this.$emit('success', response.payload)
      this.$notify.success({
        title: '上传成功',
        message: file.name
      })
      file.url = url
    },
    onExceed() {
      this.$message.warning(`最多只能上传${this.limit}个`)
    },
    // 值发生变化回调 添加文件、上传成功和上传失败时都会被调用
    handleChange(file, fileList) {
      if (file.status === 'fail' || file.status === 'success') {
        this.updateValue()
      }
    },
    parsePercentage(val = 0) {
      return parseInt(val, 10)
    },
    // 将当前图片的 index 设为0
    getImagePreviewList(value, currentImg) {
      const imgList = toArray(value)
      let pervFlag = true; const pervArr = []; const nextArr = []
      imgList.map(img => {
        if (img !== currentImg && pervFlag) {
          pervArr.push(img)
        } else {
          if (img === currentImg) {
            pervFlag = false
          }
          nextArr.push(img)
        }
      })
      return [...nextArr, ...pervArr]
    }
  }
}
</script>
<style lang="scss" scoped>
.oms-upload {
  line-height: normal;

  i{
    vertical-align: middle;
  }
  .upload-icon{
    font-size: 20px;
    color: #333;
  }
  .el-upload-list__item-actions{
    line-height: normal;
  }

  .actions{
    position: absolute;
    left: 50%;
    top: 50%;
    width: 100%;
    transform: translate(-50%, -50%);
    font-size: 0px;

    i{
      margin: 5px 5px;
      font-size: 20px;
      cursor: pointer;
    }
  }
  .progress{
    background: #fff;

    padding: 2px;
  }
  .file-slot{
    line-height: initial;
    vertical-align: middle;
  }
}
/deep/ {
  .el-upload-list--picture-card .el-upload-list__item,
  .el-upload--picture-card{
    width: auto;
    height: auto;
    line-height: initial;
    margin-bottom: 8px;
  }
  .el-upload-list--picture-card{
    line-height: 0;
  }
  .el-upload-list--picture-card .el-upload-list__item-actions span+span {
    margin-left: 5px;
  }
  .el-upload--picture-card{
    background: #fff;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, .1);
  }
  .el-upload-list__item{
    // 关掉动画 避免闪动
    transition: none;
    &.el-list-enter,&.el-list-leave-active{-webkit-transform:translateY(0px);transform:translateY(0px)}

    // 去除取消删除之后的外边框线
    &.focusing {
      outline-width:0
    }
  }

  .file-icon{
    font-size: 20px;
    text-align: center;
  }
  // 垂直居中 等比缩放
  .el-image__inner{
    width: auto;
    height: auto;
    max-height: 100%;
    max-width: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
.hide/deep/ .el-upload {
  display: none;
}
// 使进度条环 居中
/deep/ .el-progress-circle{
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
