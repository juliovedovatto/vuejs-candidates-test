<template>
  <span>{{ formatedValue }}</span>
</template>

<script>
import { DateTime } from 'luxon'

export default {
  name: 'DateField',
  props: {
    value: {
      type: String
    }
  },
  computed: {
    formatedValue() {
      if (!this.value) {
        return 'N/A'
      }

      return DateTime.fromISO(this.value).toLocaleString(DateTime.DATE_FULL)
    }
  }
}
</script>
