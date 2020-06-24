<template>
  <span>{{ formatedValue }}</span>
</template>

<script>
import { DateTime } from 'luxon'

export default {
  name: 'DatetimeField',
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

      return DateTime.fromISO(this.value).toLocaleString(DateTime.DATETIME_SHORT)
    }
  }
}
</script>
