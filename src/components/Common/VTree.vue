<template>
  <el-row>
    <el-col :span="6">
      <el-tree
        :data="data"
        :props="defaultProps"
        :load="loadNode"
        :expand-on-click-node="false"
        lazy
      >
        <span slot-scope="scope" class="custom-tree-node">
          <span>{{ scope.node.label }}</span>
          <span>
            <el-button type="text" size="mini" @click="() => edit(scope.data)">编辑</el-button>
            <el-button type="text" size="mini" @click="() => append(scope.data)">添加</el-button>
            <el-button type="text" size="mini" @click="() => remove(scope.data)">删除</el-button>
          </span>
        </span>
      </el-tree>
    </el-col>
    <el-col :span="18">
      <v-form
        v-if="activeNode || addPid"
        :key="activeNode || addPid"
        :rule-api="getFormApi()"
        :save-api="getFormSaveApi()"
        :after-submit="afterSubmit"
        :router-back="false"
      />
    </el-col>
  </el-row>
</template>

<script>
import request from '@/utils/request'
import { strVarReplace } from '@/utils/index'
import VForm from '@/components/scaffold/VForm'
export default {
  name: 'VTree',
  components: {
    VForm
  },
  props: {
    listApi: {
      type: String,
      default: function() {
        return this.$route.path.replace('tree', 'list')
      }
    },
    nodeLoadApi: {
      type: String,
      default: function() {
        return this.$route.path.replace('tree', 'childs/{id}')
      }
    },
    ruleApi: {
      type: String,
      default: function() {
        return this.$route.path.replace('tree', 'form')
      }
    }
  },
  data() {
    return {
      data: [],
      defaultProps: {
        children: 'children',
        label: 'label',
        isLeaf: 'leaf'
      },
      formRules: [],
      activeNode: undefined,
      addPid: undefined
    }
  },
  created: function() {
    // this.getList()
  },
  methods: {
    getList() {
      request({
        url: `/${this.getSubject()}/list`
      }).then(res => {
        console.log(res)
        this.data = res.payload.list.map(item => {
          item.leaf = !item.hasChildren
          console.log(item)
          return item
        })
      })
    },
    loadNode(node, resolve) {
      if (node.data.length === 0) {
        this.getList()
        return
      }
      request({
        url: strVarReplace(this.$props.nodeLoadApi, node.data)
      }).then(res => {
        console.log(node, res)
        resolve(res.payload.childs.map(item => {
          item.leaf = !item.hasChildren
          return item
        }))
      })
    },
    edit(data) {
      this.addPid = undefined
      this.activeNode = data.id
      console.log(data)
    },
    getFormApi() {
      if (this.addPid) {
        return this.$props.ruleApi
      }
      return this.getSubject() + (this.activeNode ? '/' + this.activeNode : '/form')
    },
    getFormSaveApi() {
      if (this.addPid) {
        return this.getSubject() + '/save'
      }
      return this.getSubject() + (this.activeNode ? '/' + this.activeNode : '/save')
    },
    afterSubmit() {
    },
    getSubject() {
      return this.$route.path.split('/')[1]
    },
    append(data) {
      console.log(data)
      this.activeNode = undefined
      this.addPid = data.id + '_add'
    },
    remove() {

    }
  }
}
</script>
<style scoped>
.tree {
  border: 1px solid;
}
</style>
