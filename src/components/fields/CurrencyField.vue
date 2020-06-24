<template>
  <p v-if="currencyValue" class="mb-0">{{ currencyValue }}</p>
  <p v-else class="mb-0">N/A</p>
</template>

<script>
import numeral from 'numeral'

export default {
  name: 'CurrencyField',
  props: {
    value: {
      type: [String, Number]
    }
  },
  computed: {
    currencyValue() {
      if (!this.value) {
        return ''
      }

      const currency = numeral(this.value).format('0.00 a')
      return `US$${currency}`
    }
  }
}
</script>
