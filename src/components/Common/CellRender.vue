<template>
  <span class="cell-content" :class="options.className">
    <!-- 插槽模式，给前端自定义预留 -->
    <slot v-if="options.type === 'slot'" />
    <icon v-else-if="options.type === 'icon'" :icon="value" />
    <template v-else-if="options.type === 'image'">
      <div v-for="(imgUrl, index) in (Array.isArray(value)?value:[value])" :key="index" class="image-item">
        <el-image
          v-if="imgUrl"
          lazy
          class="cell-image"
          :src="imgUrl"
          :preview-src-list="[imgUrl]"
        />
      </div>
    </template>
    <span v-else-if="options.type === 'html'" v-html="value" />
    <template v-else-if="options.type === 'extrude'">
      <extrude :value="varReplaceMulti(value, data)" />
    </template>
    <template v-else-if="options.href !== undefined">
      <el-link v-if="typeof options.href === 'string'" type="primary" :href="varReplace(options.href, data)" target="_blank">{{ value }}</el-link>
      <el-link v-if="typeof options.href === 'object'" :type="options.href.type || 'primary'" :href="varReplace(options.href.href, data)" :target="options.href.target || '_blank'">{{ value }}</el-link>
    </template>
    <template v-else-if="options.enum !== undefined">
      <template v-if="value === ''"> - </template>
      <el-tag v-else size="small" :type="options.enum[value]">
        {{ options.options ? (options.options[value] || value) : value }}
      </el-tag>
    </template>
    <template v-else-if="options.options">{{ options.options[value] || value }}</template>
    <template v-else-if="options.type === 'link'">
      <el-link v-if="value.length > 0" type="primary" :href="value" target="_blank">{{ options.title || value }}</el-link>
    </template>
    <template v-else-if="options.type === 'iframe'">
      <el-button v-if="value.length > 0" :type="options.style || ''" size="mini" @click="showIframe = true">查看</el-button>
      <el-dialog :visible.sync="showIframe" :width="((options.width || 500) + 40) + 'px'">
        <iframe :src="value" :width="(options.width || 500) + 'px'" :height="(options.height || 600) + 'px'" />
      </el-dialog>
    </template>
    <template v-else-if="options.type === 'supperButton'">
      <super-button
        v-if="options.config"
        :type="options.config.type || 'text'"
        :target="options.config.target"
        :props="{
          text: options.config.text || options.config.props,
          size: 'mini',
          ...options.config.props,
        }"
        :form-options="options.config.rules || {}"
        :method="options.config.method"
        :base-data="data"
        :inject-data="data"
      />
    </template>
    <template v-else-if="options.type === 'LineChart'">
      <line-chart v-if="isArray(value)" :data="value" :chart="{}" />
    </template>
    <template v-else-if="options.type === 'progress'">
      <el-progress
        :type="options.props ? (options.props.type || 'circle') : 'circle'"
        :text-inside="options.props ? (options.props.textInside || false) : false"
        :stroke-width="options.props ? (options.props.strokeWidth || 6) : 6"
        :status="options.props ? (options.props.status || null) : null"
        :color="options.props ? (options.props.color || '') : ''"
        :width="options.props ? (options.props.width || 50) : 50"
        :show-text="options.props ? (options.props.showText || true) : true"
        :stroke-linecap="options.props ? (options.props.strokeLinecap || 'round') : 'round'"
        :percentage="value || 0"
      />
    </template>
    <pre v-else-if="options.type === 'json'" style="overflow-x: auto">{{ value ? JSON.stringify(value, null , 2) : '-' }}</pre>

    <template v-else>
      <span v-for="(each, index) in isArray(value) ? value : [value]" :key="index">{{ each }}</span>
    </template>
  </span>
</template>
<script>
import Extrude from '@/components/Common/extrude'
import Icon from '@/components/Common/icon'
import { strVarReplace, type, whereFilter } from '@/utils/index'
import SuperButton from '@/components/Common/SuperButton'
import LineChart from '@/components/Charts/LineChart'

export default {
  name: 'CellRender',
  components: {
    Extrude,
    Icon,
    SuperButton,
    LineChart
  },
  props: {
    value: {
      type: [String, Number, Array, Object],
      default: ''
    },
    options: {
      type: Object,
      default: function() {
        return {}
      }
    },
    data: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      showIframe: false
    }
  },
  methods: {
    varReplace: function(str, obj) {
      return strVarReplace(str, obj)
    },
    varReplaceMulti: function(val, obj) {
      if (typeof val === 'string' || typeof val === 'number') {
        return this.varReplace(val, obj)
      } else {
        if (!val.length) {
          return []
        }
        for (var i = 0; i < val.length; i++) {
          val[i] = this.varReplace(val[i], obj)
        }
        return val
      }
    },
    whereFilter: function(obj, where) {
      return whereFilter(obj, where)
    },
    isArray(data) {
      return type(data) === 'array'
    }
  }
}
</script>
<style lang="less" scoped>
  .cell-content {
    white-space: pre-line;

    &.nowrap {
      white-space: nowrap;
    }
    .image-item{
      // 必须要固定高度，因为图片是懒加载的，加载完成后把cell高度撑起的话，会导致操作列高度异常
      height: 55px;
      .cell-image {
        max-height: 50px;
        max-width: 50px;
        line-height: 50px;
      }
    }
  }
  /deep/ .cell-image .el-image__inner{
    vertical-align: middle;
  }
</style>
