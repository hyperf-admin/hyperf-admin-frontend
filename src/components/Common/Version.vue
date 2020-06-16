<template>
  <div class="c_version" :class="{is_version: show}">
    <el-card v-if="show">
      <div slot="header">
        <el-dropdown placement="bottom-start" @command="handleCommand">
          <span class="el-dropdown-link">
            历史版本<i class="el-icon-arrow-down el-icon--right" />
          </span>
          <el-dropdown-menu slot="dropdown" style="width: 500px;">
            <el-dropdown-item v-for="(item, index) in versions" :key="index" :command="item" :class="{current_v: item.id === (value||versions[0].id)}">
              <span style="marginRight: 10px">{{ `${item.create_at||''}` }}</span>
              {{ `${item.username||''} 修改了:${getModifyLabels(item.modify_fields)}` }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <slot />
    </el-card>
    <slot v-else />
  </div>
</template>
<script>
import request from '@/utils/request'

export default {
  props: {
    // 版本值
    value: {
      type: [String, Number],
      default: ''
    },
    // 版本列表
    versions: {
      type: Array,
      default: _ => []
    },
    // 是否展示版本管理
    show: {
      type: Boolean,
      default: false
    },
    rule: {
      type: Array,
      default: _ => []
    }
  },
  data() {
    return {
      newVersionWatcher: null
    }
  },
  watch: {
    show: {
      handler: function(val) {
        if (val) {
          this.checkNewVersion()
        } else {
          this.newVersionWatcher && clearInterval(this.newVersionWatcher)
        }
      },
      immediate: true
    }
  },
  beforeDestroy() {
    clearInterval(this.newVersionWatcher)
  },
  methods: {
    handleCommand(item) {
      this.$emit('input', item.id)
      this.$emit('change', item.id)
    },
    getModifyLabels(modify_field_keys) {
      if (modify_field_keys && modify_field_keys.length > 0) {
        const labels = []
        this.rule.forEach(item => {
          if (modify_field_keys.indexOf(item.field) > -1) {
            labels.push(item.title)
          }
        })
        return labels.join(',')
      } else {
        return ''
      }
    },
    checkNewVersion() {
      if (!this.newVersionWatcher) {
        this.newVersionWatcher = setInterval(() => {
          const last_ver_id = this.versions.length ? this.versions[0].id : 0
          request({
            url: '/' + this.getSubject() + '/newversion/' + this.$route.params.id + '/' + last_ver_id
          }).then(response => {
            console.log(response)
            if (response.payload.has_new_version) {
              clearInterval(this.newVersionWatcher)
              this.$alert(response.payload.message, '提示', {
                confirmButtonText: '刷新',
                showClose: false,
                callback: action => {
                  location.reload()
                }
              })
            }
          }).catch(err => {
            console.error(err)
            clearInterval(this.newVersionWatcher)
          })
        }, 5000)
      }
    },
    getSubject() {
      return this.$route.path.split('/')[1]
    }
  }
}
</script>
<style lang="less" scoped>
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.current_v {
  border-left:#409EFF 3px solid;
  color: #409EFF;
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>
