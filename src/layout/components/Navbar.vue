<template>
  <el-row class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb class="breadcrumb-container" />
    <el-tag
      v-if="getSetting('navbar_notice').length > 0 && !getSetting('close_navbar_notice') && showNotice(getSetting('navbar_notice'))"
      class="notice-setting"
      type="warning"
      closable
      :disable-transitions="false"
      @close="closeNavBarNotice"
    >{{ getSetting('navbar_notice') }}</el-tag>
    <div class="right-content">
      <!-- 切换系统 -->
      <el-dropdown trigger="click">
        <i class="oms-icon-toggle icon right-item" circle />
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="(modules, index) in modulesList"
            :key="modules.name"
            :icon="modules.icon"
            :divided="index > 0"
            :class="{'disabled': moduleName === modules.name, 'modulesItem': true}"
            @click.native="goto(modules.indexUrl)"
          >{{ modules.label || modules.name }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <div>
        <el-popover
          placement="bottom"
          width="400"
          trigger="click"
          @show="showPopover"
        >
          <el-badge slot="reference" class="right-item" :is-dot="has_new_message">
            <i class="el-icon-bell icon" circle />
          </el-badge>
          <export-task :poll-request="getSetting('open_export') === 1" :request-export="showExportPop" />
        </el-popover>
      </div>
      <el-dropdown class="right-item" trigger="click">
        <div class="user-info">
          <img :src="avatar" class="user-avatar" alt="头像">
          <span class="user-name">{{ name }}</span>
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <el-dropdown-item icon="oms-icon-index" @click.native="$router.push('/')">首页</el-dropdown-item>
          <el-dropdown-item divided icon="el-icon-switch-button" @click.native="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import ExportTask from '@/components/ExportTask'
import { showEleByClassName } from '@/utils'
import Cache from '@/utils/cache'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    ExportTask
  },
  data() {
    return {
      showExportPop: false,
      modulesList: this.getSetting('system_module')
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'name',
      'has_new_message',
      'open_export'
    ]),
    moduleName: function() {
      return this.$store.state.app.moduleName
    }
  },
  mounted() {
    showEleByClassName('el-submenu is-active')
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    getSetting(name) {
      return this.$store.state.settings[name]
    },
    async closeNavBarNotice() {
      await this.$store.dispatch('settings/closeNavBarNotice')
      this.closeNotice(this.getSetting('navbar_notice'))
    },
    showPopover() {
      this.showExportPop = true
    },
    goto(url) {
      location.href = url
    },
    showNotice(text) {
      const key = 'dismiss:navbar_notice:' + text
      if (!Cache.exist(key)) {
        return true
      }
      return Cache.get(key) === null
    },
    closeNotice(text) {
      const key = 'dismiss:navbar_notice:' + text
      Cache.set(key, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
  .navbar {
    height: 50px;
    overflow: hidden;
    position: relative;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

    .hamburger-container {
      line-height: 50px;
      height: 100%;
      float: left;
      cursor: pointer;
      transition: background .3s;
      -webkit-tap-highlight-color: transparent;

      &:hover {
        background: rgba(0, 0, 0, .025)
      }
    }

    .breadcrumb-container {
      float: left;
    }
  }
.notice-setting {
  left: 50%;
  top: 50%;
  position: absolute;
  transform: translate(-50%, -50%);
}
.right-content{
  float: right;
  height: 100%;
  padding-right: 20px;
  color: rgba(0, 0, 0, .65);
  display: flex;

  .icon{
    font-size: 18px;
    &:focus{
      outline: none;
    }
  }

  .right-item{
    padding: 0 12px;
    // margin: 0 12px;
    height: 100%;
    transition: all .3s;
    cursor: pointer;
    display: flex;
    align-items: center;

    &:hover{
      background: rgba(0, 0, 0, .025);
    }
  }

  .user-info{
    height: 50px;
    line-height: 50px;
  }
  .user-avatar {
    width: 24px;
    height: 24px;
    line-height: 24px;
    border-radius: 50%;
    margin: 0 10px 0 0;
    color: #1890ff;
    vertical-align: middle;
    background: hsla(0,0%,100%,.85);
  }
  .user-name {
    vertical-align: middle;
  }
}
.modulesItem {
  &.disabled{
    color: #ccc;
    cursor: not-allowed;
    &:hover{
      background: #fff;
    }
  }
}
</style>
