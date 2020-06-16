<template>
  <div class="dashboard-container">
    <div class="dashboard-text">Hi {{ name }}, 欢迎来到 HyperfAdmin. </div>
    <el-row :gutter="20" class="moduleList">
      <el-col v-for="item in moduleList" :key="item.name" :xs="8" :sm="6" :md="4" :lg="3" :xl="2">
        <el-card class="moduleCard" shadow="hover" @click.native="gotoModule(item.name)">
          {{ item.label || item.name }}
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  data() {
    return {
      moduleList: this.getSetting('system_module')
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'roles'
    ]),
    moduleName: function() {
      console.log(this.$store.app)
      return this.$store.state.app.moduleName
    }
  },
  methods: {
    gotoModule(moduleName) {
      location.href = `${location.origin}/${moduleName}/#/dashboard`
    },
    getSetting(name) {
      return this.$store.state.settings[name]
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
.moduleList {
  margin-top: 20px;
  .moduleCard{
    cursor: pointer;
  }
}
</style>
