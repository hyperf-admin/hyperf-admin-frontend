<template>
  <div class="login-container">
    <h3 class="title" />
    <div class="login-content">
      <el-tabs v-model="activeName">
        <el-tab-pane label="密码登录" name="local">
          <el-form ref="loginForm" class="login-form" :model="loginForm" :rules="loginRules" auto-complete="on" label-position="left">
            <el-form-item prop="username">
              <span class="svg-container">
                <svg-icon icon-class="user" />
              </span>
              <el-input
                ref="username"
                v-model="loginForm.username"
                placeholder="请输入用户名"
                name="username"
                type="text"
                tabindex="1"
                auto-complete="on"
              />
            </el-form-item>

            <el-form-item prop="password">
              <span class="svg-container">
                <svg-icon icon-class="password" />
              </span>
              <el-input
                :key="passwordType"
                ref="password"
                v-model="loginForm.password"
                :type="passwordType"
                placeholder="请输入用户密码"
                name="password"
                tabindex="2"
                auto-complete="on"
                @keyup.enter.native="handleLogin"
              />
              <span class="show-pwd" @click="showPwd">
                <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
              </span>
            </el-form-item>
            <div class="login-tip" />
            <el-button :loading="loading" type="primary" class="login-btn" @click.native.prevent="handleLogin">登录</el-button>
          </el-form>
        </el-tab-pane>
        <el-tab-pane :label="ssoType === 'workwechat' ? '企业微信':'钉钉登录'" name="sso">
          <div v-show="ssoType === 'ddtalk'" id="dingding" class="ddlogin" />
          <div v-show="ssoType === 'workwechat'" id="wechat" class="wechatlogin" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { obj2Param } from '@/utils/index'
import { DDLogin, WwLogin } from './login'
import defaultSetting from '@/settings'

export default {
  name: 'Login',
  data() {
    return {
      activeName: this.$store.state.settings['authType'],
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [{ required: true, trigger: ['blur', 'change'], message: '请输入账号' }],
        password: [{ required: true, trigger: ['blur', 'change'], message: '请输入密码' }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      ssoType: ''
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  mounted() {
    this.ssoType = defaultSetting.ssoType
    this.ssoType === 'workwechat' ? this.WwLoginInit() : this.DDLoginInit()
  },
  methods: {
    WwLoginInit() {
      const redirect_url = encodeURIComponent(location.origin + location.pathname + '#' + this.redirect)
      WwLogin({
        id: 'wechat',
        appid: defaultSetting.appid,
        agentid: '1000060',
        state: '',
        height: '300',
        // 生成方式见wechat.css
        href: 'data:text/css;base64,LmltcG93ZXJCb3ggLnRpdGxlew0KICBkaXNwbGF5OiBub25lOw0KfQ0KLmltcG93ZXJCb3ggLnN0YXR1c3sNCiAgY29sb3I6ICNmZmY7DQp9DQouaW1wb3dlckJveCAucXJjb2Rlew0KICB3aWR0aDogMjAwcHg7DQp9',
        redirect_uri: encodeURIComponent(defaultSetting.ssoCallback + redirect_url)
      })
    },
    DDLoginInit() {
      const redirect_url = encodeURIComponent(location.origin + location.pathname + '#' + this.redirect)
      const params = {
        appid: defaultSetting.appid,
        response_type: 'code',
        scope: 'snsapi_login',
        state: '',
        redirect_uri: defaultSetting.ssoCallback + redirect_url
      }
      const gotoUrl = 'https://oapi.dingtalk.com/connect/oauth2/sns_authorize?' + obj2Param(params)
      DDLogin({
        id: 'dingding',
        goto: encodeURIComponent(gotoUrl),
        style: 'border:none;',
        width: '280',
        height: '320'
      })
      const handleMessage = function(event) {
        const { origin, data } = event
        if (origin === 'https://login.dingtalk.com') {
          params.loginTmpCode = data
          params.redirect_uri = ''
          window.location.href = 'https://oapi.dingtalk.com/connect/oauth2/sns_authorize?' + obj2Param(params)
        }
      }
      if (typeof window.addEventListener !== 'undefined') {
        window.addEventListener('message', handleMessage, false)
      } else if (typeof window.attachEvent !== 'undefined') {
        window.attachEvent('onmessage', handleMessage)
      }
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm).then(() => {
            this.$router.push({ path: this.redirect || '/' })
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: $bg;
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

/deep/ {
  .el-tabs__nav-scroll{
    text-align: center;
    .el-tabs__nav{
      float: none;
      display: inline-block;
    }
  }
  .el-tabs__nav-wrap{
    &::after{
      background-color: none;
    }
  }
  .el-tabs__item{
    color: #fff;
    &.is-active{
      color: #409EFF;
    }
  }
  .el-tabs__content{
    color: #fff;
  }
}
/deep/ .el-tabs__nav{
  text-align: center;
}
.login-container {
  min-height: 100%;
  width: 100%;
  background-image: url(https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg);
  background-repeat: no-repeat;
  background-position: center 110px;
  background-size: 100%;
  background-color: $bg;
  overflow: hidden;
  padding: 6% 0 0;

  .login-content {
    position: relative;
    width: 365px;
    max-width: 100%;
    margin: 0 auto;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding-top: 5px;

    .login-form {
      padding: 20px 20px 40px;

      .login-tip{
        color: #C0C4CC;
        text-align: right;
        font-size: 12px;
        margin-top: -18px;
        margin-right: 5px;
      }
      .login-btn{
         width:100%;
         margin-top:50px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

    .title {
      background: url('http://oms.mengtuiapp.com/img/logo-small.png') center center no-repeat;
      height: 40px;
      margin: 0px auto 30px auto;
      text-align: center;
      font-weight: bold;
    }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
.ddlogin{
  text-align: center;
  padding-top: 20px;
}
.wechatlogin{
  text-align: center;
}
/deep/ .login_qrcode_text{
  margin-bottom: 20px;
}
</style>
