<template>
  <div :key="key" v-loading="loading" :class="loading ? 'loading' : ''">
    <div v-if="!loading">
      <v-form
        :key="key"
        :rules="rule"
        :data-version-enable="versionEnable"
        :data-versions="versions"
        :compute-when="computeWhen"
        save-api="/dev/make"
        :router-back="false"
        @change="onChange"
      />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import VForm from '@/components/scaffold/VForm.vue'
import request from '@/utils/request'
import { strVarReplace } from '@/utils'
import VJson from '@/components/Common/VJson'

Vue.component('v-jsoneditor', VJson)
export default {
  components: {
    VForm
  },
  data() {
    return {
      isStep: false,
      rule: [],
      loading: true,
      versionEnable: false,
      versions: [],
      stepType: 'card',
      computeWhen: {
        resource: {},
        computeMap: {}
      }
    }
  },
  computed: {
    key: function() {
      this.formRule()
      return this.$route.query._ver || ''
    }
  },
  created() {},
  methods: {
    formRule() {
      request({
        url: '/dev/controllermaker',
        method: 'get',
        params: this.$route.query
      }).then(res => {
        this.rule = res.payload.form
        this.rule.forEach(item => {
          if (item.section !== undefined) {
            this.isStep = true
          }
        })
        this.versionEnable = res.payload.version_enable
        this.versions = res.payload.version_list
        this.stepType = res.payload.step_type || 'card'
        this.loading = false
        this.computeWhen.computeMap = res.payload.compute_map
      })
    },
    onChange(fApi, field, val) {
      console.log('marker', fApi, field, val)
      if (field === 'pool') {
        const url = strVarReplace(fApi.getRule('database').props.selectApi, fApi.formData())
        request({ url }).then(res => {
          console.log('maker', res)
          fApi.updateRule('database', { options: res.payload, props: { remote: false }})
        })
      }
      if (field === 'database') {
        const url = strVarReplace(fApi.getRule('table').props.selectApi, fApi.formData())
        request({ url }).then(res => {
          console.log('maker', res)
          fApi.updateRule('table', { options: res.payload, props: { remote: false }})
        })
      }
      if (field === 'table') {
        const url = strVarReplace('/dev/tableSchema?pool={pool}&db={database}&table={table}', fApi.formData())
        request({ url }).then(res => {
          console.log('maker schema', res)
          fApi.updateRule('form', { value: res.payload })
        })
      }
    }
  }
}

</script>

<style scoped>
  .loading {
    height: 500px;
  }
</style>

