<template>
  <div :value="value">
    <el-upload
      class="avatar-uploader"
      :action="uploadApi"
      :accept="accept"
      :show-file-list="false"
      :on-success="handleAvatarSuccess"
      :on-remove="handleAvatarRemove"
      :before-upload="beforeAvatarUpload"
    >
      <div class="upload-slot">
        <img v-if="imageUrl" :src="imageUrl" class="avatar" alt="">
        <i v-else class="el-icon-plus avatar-uploader-icon" />
        <div v-if="imageUrl && remove" class="operator">
          <!-- <i class="el-icon-zoom-in"></i> -->
          <i class="el-icon-delete" @click.stop="handleAvatarRemove" />
        </div>
      </div>
    </el-upload>
  </div>
</template>

<script>
export default {
  name: 'UploadImage',
  props: {
    accept: {
      type: String,
      default: ''
    },
    imageRatio: {
      type: Number,
      default: 0
    },
    imageRatioMin: {
      type: Number,
      default: 0
    },
    limitSize: {
      type: String,
      default: ''
    },
    rowScope: {
      type: Object,
      default: null
    },
    limitHeight: {
      type: Number,
      default: 0
      // 限制高度
    },
    limitWidth: {
      // 限制宽
      type: Number,
      default: 0
    },
    keyImage: {
      // 生成url对应的key
      type: String,
      default: 'image'
    },
    keyRatio: {
      // 生成ratio对应的key
      type: String,
      default: ''
    },
    remove: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      value: '',
      imageUrl: '',
      uploadApi: process.env.VUE_APP_BASE_API + '/upload/image'
    }
  },
  watch: {
    'rowScope.row.image': {
      handler() {
        this.init()
      },
      deep: true
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      if (this.$attrs.value) {
        if (this.rowScope) {
          const { row = {}} = this.rowScope
          const { image } = row
          this.imageUrl = image
        } else {
          // rowScope存在时候 不是默认传递进来url而是为了方便改变rowScope内的对象
          if (this.$attrs.value.startsWith('http') || this.$attrs.value.startsWith('https')) {
            this.imageUrl = this.$attrs.value
          } else {
            this.imageUrl = process.env.VUE_APP_IMG_DSN + this.$attrs.value.replace('oss/', '')
          }
        }
      }
    },
    handleAvatarRemove() {
      if (this.$attrs.value) {
        if (this.rowScope) {
          const rowScope = {
            'scopeIndex': this.rowScope.$index
          }
          if (this.keyImage) {
            rowScope[this.keyImage] = ''
          }
          this.$emit('input', { ...this.rowScope.row, ...rowScope })
          this.$emit('change', { ...this.rowScope.row, ...rowScope })
          return
        } else {
          this.$emit('input', '')
          this.$emit('change', '')
        }
      }
    },
    handleAvatarSuccess(res, file) {
      if (this.limitHeight && this.limitWidth && res.payload.height && res.payload.width) {
        if (this.imageRatio && (res.payload.width / res.payload.height > this.imageRatio || res.payload.width / res.payload.height < this.imageRatioMin)) {
          this.$message.error(`上传图片宽高比范围：${this.imageRatioMin} ~ ${this.imageRatio}!`)
          return
        }
      }
      this.imageUrl = URL.createObjectURL(file.raw)
      if (this.rowScope) {
        const rowScope = {
          'scopeIndex': this.rowScope.$index
        }
        if (this.keyImage) {
          rowScope[this.keyImage] = res.payload.url
        }
        if (res.payload.width && res.payload.height) {
          rowScope[this.keyRatio] = (res.payload.width / res.payload.height).toFixed(1)
        }
        this.$emit('input', { ...this.rowScope.row, ...rowScope })
        this.$emit('change', { ...this.rowScope.row, ...rowScope })
        return
      }
      this.$emit('input', res.payload.path)
      this.$emit('change', res.payload.path)
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        // this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        // this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      // return isJPG && isLt2M
      //
      if (this.limitSize && this.limitSize.indexOf('k') > 0) {
        if (file.size / 1024 > parseInt(this.limitSize)) {
          this.$message.error(`文件大小不超过${this.limitSize}!`)
          return false
        }
      }
      return true
    }
  }
}
</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 80px;
    height: 80px;
    line-height: 80px;
    text-align: center;
  }
  .avatar {
    width: 80px;
    height: 80px;
    display: block;
  }
  .operator{
    display: none;
    position: absolute;
    width: 80px;
    height: 80px;
    left: 0;
    top: 0;
    cursor: default;
    text-align: center;
    color: #fff;
    opacity: 1;
    font-size: 20px;
    background-color: rgba(0,0,0,.5);
    transition: opacity .3s;
    text-align: center;
    vertical-align: middle;
    line-height: 80px;
  }
  .upload-slot:hover .operator{
    display: block;
  }
</style>
