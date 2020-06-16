<template>
  <div>
    <analysis :id="id" />
  </div>
</template>
<script>
import Analysis from '@/components/scaffold/analysis'
export default {
  name: 'Report',
  components: { Analysis },
  data() {
    const parts = this.$route.path.split('/')
    const id = parts[2].replace('report_', '')
    return {
      id
    }
  }
}
</script>
