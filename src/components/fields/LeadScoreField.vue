<template>
  <div>
    <radial-progress v-if="value" :percentile="value" :width="width" :fontSize="fontSize" :color="color" />
    <span v-else>{{ formattedValue }}</span>
  </div>
</template>

<script>
import { RadialProgress } from '@/components/charts'

export default {
  name: 'LeadScoreField',
  components: {
    RadialProgress
  },
  props: {
    value: {
      type: Number
    },
    width: {
      type: Number,
      default: 48
    },
    fontSize: {
      type: Number,
      default: 20
    },
    color: {
      type: String
    }
  },
  computed: {
    formattedValue() {
      if (!this.value) {
        return 'N/A'
      }

      return this.value
    }
  }
}
</script>
