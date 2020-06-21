<template>
  <div class="vue-codemirror" :class="{ merge }">
    <div v-if="merge" ref="mergeview" />
    <textarea v-else ref="textarea" :name="name" :placeholder="placeholder" />
    <div style="float: right">
      <el-switch
        v-model="keymap_vim"
        size="mini"
        active-text="Vim"
        @change="vimSwitch"
      />
      <el-switch
        v-model="dark_theme"
        size="mini"
        active-text="Dark"
        @change="changeTheme"
      />
    </div>
  </div>
</template>

<script>
// import { debounce } from '@/utils'
import _CodeMirror from 'codemirror/lib/codemirror'

const CodeMirror = window.CodeMirror || _CodeMirror
window.CodeMirror = CodeMirror
// base style
import 'codemirror/lib/codemirror.css'
// theme css
import 'codemirror/theme/base16-dark.css'
import 'codemirror/theme/base16-light.css'
// language
import 'codemirror/mode/php/php.js'
// import './data_focus_mode.js'
// active-line.js
import 'codemirror/addon/selection/active-line.js'
// styleSelectedText
import 'codemirror/addon/selection/mark-selection.js'
import 'codemirror/addon/search/searchcursor.js'
// highlightSelectionMatches
import 'codemirror/addon/scroll/annotatescrollbar.js'
import 'codemirror/addon/search/matchesonscrollbar.js'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/addon/search/match-highlighter.js'
// keyMap
import 'codemirror/mode/clike/clike.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/comment/comment.js'
import 'codemirror/addon/dialog/dialog.js'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/addon/search/search.js'
import 'codemirror/keymap/sublime.js'
import 'codemirror/keymap/vim.js'
// foldGutter
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/comment-fold.js'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/indent-fold.js'
import 'codemirror/addon/fold/markdown-fold.js'
import 'codemirror/addon/fold/xml-fold.js'
// show-hint
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/anyword-hint.js'

import jsonLint from 'jsonlint'

if (typeof Object.assign !== 'function') {
  Object.defineProperty(Object, 'assign', {
    value(target, varArgs) {
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object')
      }
      const to = Object(target)
      for (let index = 1; index < arguments.length; index++) {
        const nextSource = arguments[index]
        if (nextSource != null) {
          for (const nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey]
            }
          }
        }
      }
      return to
    },
    writable: true,
    configurable: true
  })
}
// export
export default {
  name: 'Codemirror',
  props: {
    code: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    marker: {
      type: Function,
      default: _ => {
      }
    },
    unseenLines: {
      type: Array,
      default: _ => []
    },
    name: {
      type: String,
      default: 'codemirror'
    },
    placeholder: {
      type: String,
      default: ''
    },
    merge: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      default: () => {
      }
    },
    events: {
      type: Array,
      default: () => ([])
    },
    globalOptions: {
      type: Object,
      default: () => ({})
    },
    globalEvents: {
      type: Array,
      default: () => ([])
    },
    mode: {
      type: String,
      default: 'text/x-php'
    },
    type: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      content: '',
      codemirror: null,
      cminstance: null,
      keymap_vim: true,
      dark_theme: false,
      defaultOptions: {
        lineWrapping: true,
        matchBrackets: true,
        indentWithTabs: true,
        indentUnit: 4,
        tabSize: 4,
        foldGutter: true,
        gutters: ['note-gutter', 'CodeMirror-linenumbers'],
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        keyMap: 'vim',
        mode: this.$props.mode,
        theme: 'default',
        indentAuto: true,
        // readOnly: true,
        extraKeys: {
          'Cmd-/': 'toggleComment',
          'F11': function(cm) {
            cm.setOption('fullScreen', !cm.getOption('fullScreen'))
          },
          // todo not working
          'Esc': function(cm) {
            if (cm.getOption('fullScreen')) {
              cm.setOption('fullScreen', false)
            } else {
              return CodeMirror.Pass
            }
          },
          'Enter': function(cm) {
            if (!cm.state.completionActive) {
              // CodeMirror.commands.indentAuto(cm) // todo not working
              return CodeMirror.Pass
            }
          }
        }
      },
      line_widget: [],
      error_line: []
    }
  },
  watch: {
    options: {
      deep: true,
      handler(options) {
        for (const key in options) {
          this.cminstance.setOption(key, options[key])
        }
      }
    },
    merge() {
      this.$nextTick(this.switchMerge)
    },
    code(newVal) {
      this.handelCodeChange(newVal)
    },
    value(newVal) {
      this.handelCodeChange(newVal)
    }
  },
  mounted() {
    this.initialize()
  },
  beforeDestroy() {
    this.destroy()
  },
  methods: {
    initialize(extra) {
      const cmOptions = Object.assign({}, this.globalOptions, this.defaultOptions, this.options, extra)
      if (this.merge) {
        this.codemirror = CodeMirror.MergeView(this.$refs.mergeview, cmOptions)
        this.cminstance = this.codemirror.edit
      } else {
        this.codemirror = CodeMirror.fromTextArea(this.$refs.textarea, cmOptions)
        this.cminstance = this.codemirror
        this.cminstance.setValue(this.code || this.value || this.content)
      }
      this.cminstance.on('change', cm => {
        this.content = cm.getValue()
        if (this.$props.type === 'json') {
          const json_info = this.isJson(this.content)
          this.showJsonError(json_info)
        }
        if (this.$emit) {
          this.$emit('input', this.content)
          this.$emit('change', this.content)
        }
      })

      CodeMirror.on(this.cminstance, 'keyup', (cm, event) => {
        const cur = cm.getCursor()
        const doc = cm.doc.getLine(cur.line).substr(cur.ch - 2, cur.ch)
        if (!cm.state.completionActive && /[a-zA-z]{2,}/.test(doc)) {
          // debounce(CodeMirror.commands.autocomplete(cm, null, { completeSingle: false }), 50)
        }
      })

      // 所有有效事件（驼峰命名）+ 去重
      const tmpEvents = {}
      const allEvents = [
        'scroll',
        'changes',
        'beforeChange',
        'cursorActivity',
        'keyHandled',
        'inputRead',
        'electricInput',
        'beforeSelectionChange',
        'viewportChange',
        'swapDoc',
        'gutterClick',
        'gutterContextMenu',
        'focus',
        'blur',
        'refresh',
        'optionChange',
        'scrollCursorIntoView',
        'update'
      ]
      allEvents.concat(this.events)
        .concat(this.globalEvents)
        .filter(e => (!tmpEvents[e] && (tmpEvents[e] = true)))
        .forEach(event => {
          // 循环事件，并兼容 run-time 事件命名
          this.cminstance.on(event, (...args) => {
            // console.log('当有事件触发了', event, args)
            this.$emit(event, ...args)
            const lowerCaseEvent = event.replace(/([A-Z])/g, '-$1').toLowerCase()
            if (lowerCaseEvent !== event) {
              this.$emit(lowerCaseEvent, ...args)
            }
          })
        })
      this.pairUp()
      this.$emit('ready', this.codemirror)
      this.unseenLineMarkers()
      // prevents funky dynamic rendering
      this.refresh()
    },
    refresh() {
      this.$nextTick(() => {
        this.cminstance.refresh()
      })
    },
    destroy() {
      // garbage cleanup
      const element = this.cminstance.doc.cm.getWrapperElement()
      element && element.remove && element.remove()
    },
    handelCodeChange(newVal) {
      const cm_value = this.cminstance.getValue()
      if (newVal !== cm_value) {
        const scrollInfo = this.cminstance.getScrollInfo()
        this.cminstance.setValue(newVal)
        this.content = newVal
        this.cminstance.scrollTo(scrollInfo.left, scrollInfo.top)
      }
      this.unseenLineMarkers()
    },
    unseenLineMarkers() {
      if (this.unseenLines !== undefined && this.marker !== undefined) {
        this.unseenLines.forEach(line => {
          const info = this.cminstance.lineInfo(line)
          this.cminstance.setGutterMarker(line, 'breakpoints', info.gutterMarkers ? null : this.marker())
        })
      }
    },
    switchMerge() {
      // Save current values
      const history = this.cminstance.doc.history
      const cleanGeneration = this.cminstance.doc.cleanGeneration
      this.options.value = this.cminstance.getValue()
      this.destroy()
      this.initialize()
      // Restore values
      this.cminstance.doc.history = history
      this.cminstance.doc.cleanGeneration = cleanGeneration
    },
    vimSwitch(status) {
      this.destroy()
      this.initialize({ keyMap: status ? 'vim' : 'sublime' })
    },
    pairUp() {
      const factory = (chart1, chart2) => {
        const obj = {}
        const key = '\'' + chart1 + '\''
        obj['name'] = 'autoInsertParentheses' + chart1
        obj[key] = (cm) => {
          const cur = cm.getCursor()

          cm.replaceRange(chart1 + chart2, cur, cur, '+insert')
          cm.doc.setCursor({ line: cur.line, ch: cur.ch + 1 })
        }
        return obj
      }

      [
        ['[', ']'], ['(', ')'], ['{', '}'], ['<', '>'], ['\'', '\''], ['\"', '\"']
      ].forEach(item => {
        this.cminstance.addKeyMap(factory(item[0], item[1]))
      })
    },
    isJson: function(str) {
      str = str.replace(/\/\/[^"]+?$/gm, '').replace(/^\s*\/\/.*?$/gm, '')
      try {
        jsonLint.parse(str)
        return true
      } catch (e) {
        return e.message
      }
    },
    showJsonError(check) {
      if (check === true) {
        this.cminstance.clearGutter('note-gutter')
        return
      }
      if (check !== '' & check !== 'Invalid array length') {
        const match = /Parse error on line (\d+)/.exec(check)
        const line = parseInt(match[1]) - 1
        const div = document.createElement('i')
        div.setAttribute('class', 'el-tag__close el-icon-close line-error')
        this.cminstance.setGutterMarker(line, 'note-gutter', div)
      }
    },
    changeTheme(val) {
      this.cminstance.setOption('theme', val ? 'base16-dark' : 'default')
    }
  }
}
</script>

<style>
    .vue-codemirror {
        border-radius: 4px;
        border: 1px solid #dcdfe6;
    }
    .CodeMirror {
        height: auto;
        line-height: 21px;
    }
    .line-error {
        border-radius: 50%;
        text-align: center;
        position: relative;
        cursor: pointer;
        font-size: 12px;
        height: 16px;
        width: 16px;
        line-height: 16px;
        vertical-align: middle;
        top: -1px;
        right: -5px;
        color: #fff;
        background-color: #f56c6c;
    }
</style>
