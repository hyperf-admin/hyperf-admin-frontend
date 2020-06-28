<template>
  <el-table
    :data="data"
    style="width: 100%"
    size="mini"
  >
    <el-table-column
      v-for="(item, index) in header"
      :key="index"
      :sortable="item.sortable"
      :prop="item.field"
      :label="item.title"
    >
      <template slot-scope="scope">
        <template v-if="item.type === 'input'">
          <el-input v-model="scope.row[item.field]" size="small" />
        </template>
        <template v-else-if="item.type === 'image'">
          <upload-image v-model="scope.row[item.field]" />
        </template>
        <template v-else-if="item.type === 'number'">
          <el-input-number v-model="scope.row[item.field]" size="small" />
        </template>
        <template v-else-if="item.type === 'switch'">
          <el-tooltip :content="scope.row[item.field] === 1 ? '启用' : '禁用'" placement="top">
            <el-switch
              v-model="scope.row[item.field]"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="1"
              size="small"
              :inactive-value="0"
            />
          </el-tooltip>
        </template>
        <template v-else>
          {{ scope.row[item.field] }}
        </template>
      </template>
    </el-table-column>
    <el-table-column
      label="操作"
    >
      <template slot-scope="scope">
        <el-button
          type="danger"
          icon="el-icon-delete"
          circle
          size="small"
          @click="delAction(scope.row, scope.$index)"
        />
      </template>
    </el-table-column>
  </el-table>

</template>
<script>
import UploadImage from '@/components/Common/uploadImage'
import request from '@/utils/request'
export default {
  name: 'EditTable',
  components: {
    UploadImage
  },
  props: {
    header: {
      type: Array,
      default: function() {
        return []
      }
    },
    data: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      categoryOptions: {}
    }
  },
  created() {
    this.categoryInit()
  },
  methods: {
    categoryInit() {
      // 检测表头中是否有级联类型
      const categoryHeader = this.header.filter(item => item.type === 'category')
      if (categoryHeader.length > 0) {
        categoryHeader.forEach(item => {
          item.api && request({ url: item.api }).then(res => {
            this.$set(this.categoryOptions, item.field, res.payload)
          })
        })
      }
    },
    delAction: function(row, index) {
      this.data = this.data.splice(index, 1)
    }
  }
}
</script>

<style scoped>

</style>
