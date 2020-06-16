<template>
  <div>
    <async-load-comp v-if="$props.chart.type && $props.chart.type.length > 0" base-dir="components/Charts" :name="$props.chart.type" :props="{chart: $props.chart, data: $props.data}" />
  </div>
</template>

<script>
import AsyncLoadComp from '@/components/Common/AsyncLoadComp'
export default {
  name: 'DataChart',
  components: { AsyncLoadComp },
  props: {
    name: {
      type: [String, Number],
      default: ''
    },
    chart: {
      type: Object,
      default: _ => {}
    },
    data: {
      type: [Object, Array],
      default: _ => {}
    }
  }
}
</script>

<style scoped>

</style>
