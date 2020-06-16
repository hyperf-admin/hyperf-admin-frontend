<template>
  <div>
    <analysis :id="$route.params.id" />
  </div>
</template>
<script>
import Analysis from '@/components/scaffold/analysis'
export default {
  name: 'Report',
  components: { Analysis },
  data() {
    return {
    }
  }
}
</script>
