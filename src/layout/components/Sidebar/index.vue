<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-popover
      v-if="menuFilter && !isCollapse"
      placement="bottom-start"
      trigger="click"
      width="210"
      offset="-5"
    >
      <el-scrollbar>
        <el-tree
          v-if="routesTree.length > 0"
          ref="tree"
          class="filter-tree"
          :data="routesTree"
          :props="defaultProps"
          default-expand-all
          :filter-node-method="filterNode"
          @node-click="nodeClick"
        />
      </el-scrollbar>
      <el-input slot="reference" v-model="filterText" placeholder="🔍  搜索菜单" class="filter-input" :clearable="true" />
    </el-popover>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in permission_routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import { getParent, treeSearch } from '@/utils'
import variables from '@/styles/variables.scss'

export default {
  components: { SidebarItem, Logo },
  data() {
    return {
      filterText: '',
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  computed: {
    ...mapGetters([
      'permission_routes',
      'sidebar'
    ]),
    routesTree() {
      // if (this.filterText === '') {
      //   return []
      // }
      const routes = this.permission_routes
      const tree = []
      for (const key in routes) {
        if (routes[key].meta !== undefined) {
          let tmp = {}
          tmp = {
            label: routes[key].meta.title,
            path: routes[key].path,
            children: []
          }
          routes[key].children.forEach((each) => {
            if (each.meta !== undefined && each.hidden === false && each.meta.title.indexOf(this.filterText) !== -1) {
              tmp.children.push({
                label: each.meta.title,
                path: each.path
              })
            }
          })
          if (tmp.children.length > 0 || routes[key].meta.title.indexOf(this.filterText) !== -1) {
            tree.push(tmp)
          }
        }
      }
      return tree
    },
    activeMenu() {
      const routes = this.permission_routes.filter(item => item.id)
      const route = treeSearch(routes, this.$route.matched[this.$route.matched.length - 1].path, 'path')
      const tree = route ? [...getParent(this.permission_routes, route.id)] : []
      let path = ''
      tree.forEach(item => {
        if (item.hidden === false) {
          path = item.path
        }
      })
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    menuFilter() {
      return this.$store.state.settings.menuFilter
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  methods: {
    filterNode: function(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    nodeClick: function(node) {
      if (/^\//.test(node.path)) {
        this.$router.push(node.path)
        this.filterText = ''
      }
    }
  }
}
</script>

<style lang="less" scoped>
.filter-input /deep/ input {
  width: 190px !important;
  margin: 5px 10px 0 10px;
  color: #ffffff;
  background-color: #304156;
  padding: 0 0 0 15px;
  border: 1px dashed gray;
}
.filter-input /deep/ input:after {
  background-color: #ffffff;
}
.filter-tree {
  max-height: 500px;
}
</style>
