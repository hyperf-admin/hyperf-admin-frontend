<template>
  <div v-if="item" class="cell-warpper">
    <template v-if="item.edit && whereFilter(scopeData.row, item.when)">
      <template v-if="item.type === 'number'">
        <el-input-number
          v-model="scopeData.row[item.field]"
          size="mini"
          @change="() => rowChange(scopeData.row, item.field, scopeData.row[item.field])"
        />
      </template>
      <template v-else-if="item.type === 'switch'">
        <el-tooltip
          :content="scopeData.row[item.field] === 1 ? '启用' : '禁用'"
          placement="top"
        >
          <el-switch
            v-model="scopeData.row[item.field]"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="1"
            size="small"
            :inactive-value="0"
            @change="() => rowChange(scopeData.row, item.field, scopeData.row[item.field])"
          />
        </el-tooltip>
      </template>
      <template v-else>
        <el-input
          v-model="scopeData.row[item.field]"
          size="small"
          @change="() => rowChange(scopeData.row, item.field, scopeData.row[item.field])"
        />
      </template>
    </template>
    <template v-else>
      <el-popover v-if="item.popover && whereFilter(scopeData.row, item.popover.when || [])" trigger="hover" placement="top">
        <p v-for="(each, index) in (item.popover.messages || item.popover)" :key="index" v-text="varReplace(each, scopeData.row)" />
        <div slot="reference" class="name-wrapper">
          <cell-render :value="scopeData.row[item.field]" :options="item" :data="scopeData.row" />
        </div>
      </el-popover>
      <cell-render v-else :value="scopeData.row[item.field]" :options="item" :data="scopeData.row" />
    </template>
  </div>
</template>
<script>
import { strVarReplace, whereFilter } from '@/utils/index'
import CellRender from '@/components/Common/CellRender'

export default {
  name: 'ClumnRender',
  components: {
    CellRender
  },
  props: {
    item: {
      type: Object,
      default: function() {
        return {}
      }
    },
    scopeData: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  methods: {
    rowChange(row, key, val) {
      this.$emit('row-change', { row, key, val })
    },
    whereFilter: function(obj, where) {
      return whereFilter(obj, where)
    },
    varReplace: function(str, obj) {
      return strVarReplace(str, obj)
    }
  }
}
</script>
<style scoped>
.cell-warpper{
  display: inline;
}
</style>
