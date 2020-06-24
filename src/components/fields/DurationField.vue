<template>
  <p v-if="value" class="duration-field">{{ durationField }}</p>
  <p v-else class="mb-0">N/A</p>
</template>

<script>
import humanizeDuration from 'humanize-duration'

export default {
  name: 'DurationField',
  props: {
    value: {
      type: String
    }
  },
  computed: {
    durationField() {
      if (!this.value) {
        return ''
      }

      const pattern = /(?<days>\d+) (?<hours>\d{2}):(?<minutes>\d{2}):(?<seconds>\d{2})/g
      const regex = pattern.exec(this.value)

      if (!regex) {
        return ''
      }

      const days = parseInt(regex.groups.days) * 86400
      const minutes = parseInt(regex.groups.minutes) * 60
      const seconds = parseInt(regex.groups.seconds) + days + minutes
      const milliseconds = seconds * 1000

      return humanizeDuration(milliseconds, { largest: 2 })
    }
  }
}
</script>

<style lang="scss" scoped>
.duration-field {
  margin: 0;
}
</style>
