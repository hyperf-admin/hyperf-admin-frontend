<template>
  <v-form
    :rule-api="ruleApi"
    :save-api="saveApi"
    :router-back="false"
  />
</template>

<script>
import VForm from '@/components/scaffold/VForm.vue'
export default {
  components: {
    VForm
  },
  data() {
    return {
      ruleApi: '',
      saveApi: ''
    }
  },
  created: function() {
    const parts = this.$route.path.split('/')
    const key = parts[2].replace('cconf_', '')
    this.ruleApi = '/cconf/detail/' + key
    this.saveApi = '/cconf/detail/' + key
  }
}

</script>

<style scoped>
</style>

