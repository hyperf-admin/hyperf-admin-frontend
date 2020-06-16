<script>
import formCreate from '@/utils/form-create'
import { maker } from '@/utils/form-maker'
export default {
  name: 'TableForm',
  props: {
    rule: {
      type: Object,
      default: () => {}
    },
    rules: {
      type: Array,
      default: () => []
    },
    max: {
      type: Number,
      default: 0
    },
    min: {
      type: Number,
      default: 0
    },
    value: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      cacheRule: [1],
      tableData: [],
      cell: undefined,
      config: {
        injectEvent: true,
        labelWidth: 0,
        submitBtn: false,
        resetBtn: false
      }
    }
  },
  methods: {
    getTableHeader() {
      return this.$props.rules
    },
    addCell() {
      if (this.$props.max && this.tableData.length >= this.$props.max) {
        this.$message({
          message: `最多允许${this.$props.max}个子项`,
          type: 'warning'
        })
        return
      }
      this.tableData.push(Object.assign({}, this.cell))
      this.onChange()
    },
    makeCell() {
      const cell = {}
      this.$props.rules.forEach(item => {
        cell[item.field] = item.value || undefined
      })
      return cell
    },
    removeCell(index) {
      if (this.$props.min && this.tableData.length <= this.$props.min) {
        this.$message({
          message: `至少保留${this.$props.min}个子项`,
          type: 'warning'
        })
        return
      }
      this.tableData.splice(index, 1)
      this.onChange()
    },
    onChange() {
      this.$emit('input', this.tableData)
      this.$emit('change', this.tableData)
    },
    onCellChange(fApi, field, val, index) {
      console.log(fApi, field, val, index)
      this.tableData[index][field] = val
      this.onChange()
    }
  },
  render(h) {
    console.log('TableForm', this.$props)
    this.tableData = this.$props.value
    this.cell = this.makeCell()
    const header = this.getTableHeader()
    const FormCreate = formCreate.$form()
    console.log('TableForm header', header)
    return <div>
      <ElTable data={this.tableData} size='small' border={true}>
        {
          header.map((item, index) => {
            console.log('TableForm header_map', item)
            return <ElTableColumn key={index} prop={item.field} label={item.title} {...{
              scopedSlots: {
                default: (props) => {
                  const rule = Object.assign({}, maker(item))
                  rule.on = {
                    change: (fApi, val) => this.onCellChange(fApi, item.field, val, props.$index)
                  }
                  delete rule['title']
                  delete rule['col']
                  console.log('cellRule', rule)
                  return <FormCreate rule={[rule]} option={this.config}/>
                }
              }
            }}/>
          })
        }
        <ElTableColumn label='操作' width={100} {
        ...{
          scopedSlots: {
            default: (props) => {
              return <ElButton type='danger' icon='el-icon-delete' size='small' circle={true} on-click={() => this.removeCell(props.$index)}/>
            }
          }
        }}/>
      </ElTable>
      <ElButton type='success' icon='el-icon-plus' size='small' circle={true} on-click={this.addCell}/>
    </div>
  }
}
</script>
