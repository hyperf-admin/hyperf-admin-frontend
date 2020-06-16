<template>
  <div
    v-clickoutside="handleClose"
    class="el-select oms-select2"
    :class="{opening: visible, size: selectSize, disabled}"
  >
    <div
      ref="content"
      class="select2-content"
      @click.stop="toggleMenu"
    >
      <div v-if="selected.length === 0" class="placeholder">{{ placeholder }}</div>
      <span class="select2-icon">
        <i class="el-icon-arrow-down" :class="{opening: visible}" />
      </span>
      <div class="tags">
        <template v-if="collapseTags && selected.length">
          <el-tag
            :closable="!disabled"
            size="mini"
            type="info"
            disable-transitions
            @close="deleteTag($event, selected[0])"
          >
            <span class="el-select__tags-text">{{ selected[0].label || selected[0].value }}</span>
          </el-tag>
          <el-tag
            v-if="selected.length > 1"
            :closable="false"
            size="mini"
            type="info"
            disable-transitions
          >
            <span class="el-select__tags-text">+ {{ selected.length - 1 }}</span>
          </el-tag>
        </template>
        <template v-else>
          <el-tag
            v-for="item in selected"
            :key="item.value"
            :closable="!disabled"
            size="mini"
            type="info"
            disable-transitions
            @close="deleteTag($event, item)"
          >
            <span class="el-select__tags-text">{{ item.label || item.value }}</span>
          </el-tag>
        </template>
      </div>
    </div>
    <transition
      name="el-zoom-in-top"
    >
      <div
        v-show="visible"
        ref="popper"
        class="el-select-dropdown el-popper is-multiple"
        x-placement="bottom-start"
        :style="{top: inputHeight +'px', width:dropdownWidth +'px'}"
      >
        <div class="search-box">
          <el-input
            ref="select2-query"
            v-model="query"
            clearable
            size="mini"
            placeholder="请输入关键词"
            @input="queryChange"
            @keydown.native.enter.prevent="selectOption"
            @keydown.native.down.stop.prevent="navigateOptions('next')"
            @keydown.native.up.stop.prevent="navigateOptions('prev')"
          />
        </div>
        <el-scrollbar
          ref="scrollbar"
          v-loading="loading"
          element-loading-spinner="el-icon-loading"
          tag="ul"
          wrap-class="el-select-dropdown__wrap"
          view-class="el-select-dropdown__list"
        >
          <li
            v-if="showNewOption"
            :ref="`optionItem_-1`"
            :class="getItemClass({ label: query, value: query }, -1)"
            created
            @click="onClickOption({ label: query, value: query }, -1)"
            @mouseenter="hoverItem(-1)"
          >{{ query }}</li>
          <template v-if="option.length > 0">
            <li
              v-for="(item,index) in option"
              :ref="`optionItem_${index}`"
              :key="item.value"
              :class="getItemClass(item, index)"
              @click="onClickOption(item, index)"
              @mouseenter="hoverItem(index)"
            >
              {{ item.label }}
            </li>
          </template>
          <div v-if="!allowCreate && option.length === 0" class="select2-dropdown__empty">{{ emptyText }}</div>
        </el-scrollbar>
        <div class="select-option-popper__arrow" />
      </div>
    </transition>
  </div>
</template>

<script>
import Clickoutside from 'element-ui/src/utils/clickoutside'
import request from '@/utils/request'
import { strVarReplace } from '@/utils/index'
import _ from 'lodash'
import Emitter from '@/mixins/emitter'
import scrollIntoView from 'element-ui/src/utils/scroll-into-view'

export default {
  directives: { Clickoutside },
  mixins: [Emitter],
  props: {
    value: { type: [String, Number, Array], default: '' },
    placeholder: { type: String, default: '请选择' },
    // [{ value: 0 || '', label: '' }]
    options: { type: Array, default: _ => [] },
    // 是否远程模式
    remote: { type: Boolean, default: false },
    // 远程搜索api
    selectApi: { type: String, default: '' },
    // 是否折叠tag
    collapseTags: { type: Boolean, default: false },
    // 是否禁用
    disabled: { type: Boolean, default: false },
    // 最多可选数量
    multipleLimit: { type: Number, default: 1000 },
    // 是否支持创建条目
    allowCreate: { type: Boolean, default: false },
    // 默认第一个
    defaultFirstOption: { type: Boolean, default: false }
  },
  data() {
    return {
      // 初始赋值的optionList
      originList: [],
      // 当前活跃的备选项
      option: [],
      selectSize: 'mini',
      // 下拉框的状态
      visible: false,
      query: '',
      // 已选的 当前活跃的值
      selected: [],
      // 输入框高度
      inputHeight: 31,
      // 下拉框打开的宽度
      dropdownWidth: 500,
      emptyText: '没有找到数据',
      // 远程搜索loading状态
      loading: false,
      // 默认hover的index
      hoverIndex: -1
    }
  },
  computed: {
    iconClass() {
      return this.visible ? 'arrow-up is-reverse' : 'arrow-up'
    },
    showNewOption() {
      const options = this.option
      const hasExistingOption = options.some(option => option.label === this.query)
      return this.allowCreate && this.query !== '' && !hasExistingOption
    }
  },
  watch: {
    value: {
      handler(value) {
        if (Array.isArray(value)) {
          const selected = []
          value.forEach(v => {
            // 已选项目 和 赋值项目 合并
            const data = [...this.options, ...this.selected].find(item => item.value === v)
            if (data) {
              selected.push({
                value: v,
                label: data.label
              })
            } else {
              if (this.allowCreate) {
                selected.push({
                  value: v,
                  label: v
                })
              }
            }
          })
          this.selected = selected
        }
        // 触发表单校验
        this.dispatch('ElFormItem', 'el.form.change', value)
      },
      immediate: true
    }
  },
  inject: {
    elForm: { default: '' },
    elFormItem: { default: '' }
  },
  created() {
    this.option = this.options
    this.originList = this.options
    if (this.defaultFirstOption) {
      this.hoverIndex = 0
    }
  },
  mounted() {
  },
  methods: {
    updateValue() {
      const value = this.selected.map(item => item.value)
      this.$emit('input', value)
      this.$emit('change', value)
    },
    toggleMenu() {
      if (!this.disabled) {
        this.visible = !this.visible
        this.visible ? this.handleOpen() : ''
      }
    },
    handleClose() {
      this.visible = false
    },
    handleOpen() {
      // '焦点转移'
      this.$nextTick(() => {
        this.$refs['select2-query'].focus()
        this.dropdownWidth = this.$refs.content.offsetWidth
      })
    },
    onClickOption(item) {
      if (this.selected.length > this.multipleLimit - 1) {
        this.$message.warning(`最多只能选择${this.multipleLimit}个`)
        return false
      }
      const index = this.selected.findIndex(d => d.value === item.value)
      if (index !== -1) {
        this.selected.splice(index, 1)
        this.selected = this.selected
      } else {
        this.selected.push(item)
        this.selected = this.selected
      }
      this.updateValue()
      this.setCss()
    },
    // 选中的值变化导致的异动处理
    setCss() {
      this.$nextTick(() => {
        if (this.$refs.content) {
          this.inputHeight = this.$refs.content.offsetHeight
          this.$refs['select2-query'].focus()
        }
      })
    },
    getItemClass(item, index) {
      const selected = this.selected
      return [
        'el-select-dropdown__item',
        { 'selected': selected.some(d => d.value === item.value) },
        { 'hover': this.hoverIndex === index }
      ]
    },
    queryChange: _.debounce(function(event) {
      this.loadOptions()
      this.setHoverIndex()
    }, 300),
    loadOptions() {
      if (this.remote) {
        this.loadOptionsFromRemote()
      } else {
        this.loadOptionsFromLocal()
      }
    },
    loadOptionsFromLocal() {
      if (this.query) {
        this.option = this.originList.filter(item => item.label.indexOf(this.query) >= 0)
      } else {
        this.option = this.originList
      }
    },
    loadOptionsFromRemote() {
      if (this.query === '') {
        this.option = []
        return false
      } else if (this.selectApi) {
        this.loading = true
        let url = this.selectApi
        if (this.elForm) {
          // 路径参数替换
          url = strVarReplace(this.selectApi, this.elForm.model)
        }
        request({
          url,
          method: 'get',
          params: { kw: this.query }
        }).then(res => {
          this.loading = false
          const list = JSON.stringify(res.payload) === '{}' ? [] : res.payload
          this.option = list
        }, res => {
          this.loading = false
        })
      }
    },
    deleteTag(event, item) {
      this.selected = this.selected.filter(d => d.value !== item.value)
      event.stopPropagation()
      this.updateValue()
      this.setCss()
    },
    // 按回车 等于选中标签
    selectOption() {
      if (this.hoverIndex > -1) {
        this.onClickOption(this.option[this.hoverIndex])
      } else {
        this.onClickOption({ label: this.query, value: this.query })
      }
    },
    setHoverIndex() {
      if (this.defaultFirstOption) {
        this.hoverIndex = this.showNewOption ? -1 : 0
      } else {
        this.hoverIndex = this.showNewOption ? -2 : -1
      }
    },
    hoverItem(index) {
      this.hoverIndex = index
    },
    // 导航options
    navigateOptions(action) {
      if (action === 'next') {
        if (this.hoverIndex === this.option.length - 1) {
          this.hoverIndex = this.showNewOption ? -1 : 0
        } else {
          this.hoverIndex++
        }
      } else if (action === 'prev') {
        this.hoverIndex--
        if (this.hoverIndex === (this.showNewOption ? -2 : -1)) {
          this.hoverIndex = this.option.length - 1
        }
      }
      this.scrollToOption()
    },
    scrollToOption() {
      const target = this.$refs[`optionItem_${this.hoverIndex}`][0]
      if (this.$refs.popper && target) {
        const menu = this.$refs.popper.querySelector('.el-select-dropdown__wrap')
        scrollIntoView(menu, target)
      }
      this.$refs.scrollbar && this.$refs.scrollbar.handleScroll()
    }
  }
}
</script>
<style lang="less" scoped>
.oms-select2{
  width: 100%;
  border-radius: 4px;
  min-height: 32px;
  line-height: 24px;
  border: 1px solid #DCDFE6;
  position: relative;

  &.opening{
    border: 1px solid #409EFF;
  }
  &.disabled{
    background: #F5F7FA;
    cursor: not-allowed;
  }

  .search-box{
    padding: 10px 10px 5px;
  }
  .el-select-dropdown{
    position: absolute;
  }
  .select2-dropdown__empty {
    font-size: 14px;
    color: #606266;
    // color: #c0c4cc;
    padding: 0 20px;
  }
}
.select2-content{
  position: relative;
  width: 100%;
  padding: 3px 0;
  padding-right: 30px;

  .placeholder {
    padding-left: 15px;
    font-size: 12px;
    color: #c0c4cc;
  }
  .select2-icon{
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #c0c4cc;
    cursor: pointer;

    .el-icon-arrow-down {
      -webkit-transition: -webkit-transform .3s;
      transition: -webkit-transform .3s;
      transition: transform .3s;
      transition: transform .3s,-webkit-transform .3s;

      &.opening {
        transform: rotateZ(180deg);
        -webkit-transform: rotateZ(180deg);
      }
    }
  }
}
.select-option-popper__arrow {
  position: absolute;
  display: block;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  -webkit-filter: drop-shadow(0 2px 12px rgba(0, 0, 0, .03));
  filter: drop-shadow(0 2px 12px rgba(0, 0, 0, .03));
  top: -6px;
  left: 35px;
  margin-right: 3px;
  border-top-width: 0;
  border-bottom-color: #EBEEF5;

  &:after{
    top: 1px;
    margin-left: -6px;
    content: " ";
    border: 6px solid transparent;
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    border-top-width: 0;
    border-bottom-color: #fff;
  }
}
</style>
<style lang="less">
.el-form-item.is-error .oms-select2{
  border-color: #F56C6C
}
.el-form-item.is-error .oms-select2 .search-box .el-input__inner{
  border: 1px solid #409EFF;
}

</style>
