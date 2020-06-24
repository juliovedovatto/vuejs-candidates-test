<template>
  <truncate>
    <p v-if="value != null" class="mb-0">{{ value }}</p>
    <p v-else class="mb-0">N/A</p>
  </truncate>
</template>

<script>
import { Truncate } from '@/components/readmore'

export default {
  name: 'StringField',
  components: {
    Truncate
  },
  props: {
    value: {
      type: [String, Number]
    }
  }
}
</script>
