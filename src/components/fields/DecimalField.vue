<template>
  <span class="decimal-field">{{ formattedValue }}</span>
</template>

<script>
import numeral from 'numeral'

export default {
  name: 'DecimalField',
  props: {
    value: {
      type: String
    }
  },
  computed: {
    formattedValue() {
      if (!this.value) {
        return 'N/A'
      }

      return numeral(this.value).format('0,0.00')
    }
  }
}
</script>

<style lang="scss" scoped>
.decimal-field {
  font-size: 1rem;
}
</style>
