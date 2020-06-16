import formCreate from '@form-create/element-ui'

import IconSelect from '@/components/Common/IconSelect/Index'
import TableTransfer from '@/components/Common/TableTransfer'
import SubForm from '@/components/Common/SubForm'
import { VueEditor } from 'vue2-editor'
import TableForm from '@/components/Common/TableForm'
import VInput from '@/components/CustomForm/VInput'
import Select2 from '@/components/CustomForm/Select2/Select2'
import VUpload from '@/components/CustomForm/VUpload/Upload'
import VJson from '@/components/Common/VJson'
import FormItemInfo from '@/components/CustomForm/FormItemInfo'
import InputRange from '@/components/CustomForm/VInputRange'
import CodeMirror from '@/components/Common/CodeMirror/Index'

// formCreate 内部全局的form组件在此处注册
formCreate.component('TableTransfer', TableTransfer)
formCreate.component('IconSelect', IconSelect)
formCreate.component('vue-editor', VueEditor)
formCreate.component('VJsoneditor', VJson)
formCreate.component('SubForm', SubForm)
formCreate.component('TableForm', TableForm)
formCreate.component('VInput', VInput)
formCreate.component('Select2', Select2)
formCreate.component('VUpload', VUpload)
formCreate.component('InputRange', InputRange)
formCreate.component('FormItemInfo', FormItemInfo)
formCreate.component('CodeMirror', CodeMirror)

// tips: 非共用组件请勿全局引入

export default formCreate
