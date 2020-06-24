<template>
  <input
    :value="value"
    :class="classes"
    :min="min"
    :max="max"
    :max-length="1"
    class="form-control"
    type="number"
    @input="onInput"
  />
</template>

<script>
import { isNumber } from 'lodash'

export default {
  name: 'NumberInput',
  props: {
    value: {
      type: [String, Number]
    },
    min: {
      type: [String, Number]
    },
    max: {
      type: [String, Number]
    },
    size: {
      type: String,
      default: 'sm'
    }
  },
  data() {
    return {
      sizes: {
        sm: 'form-control-sm',
        md: 'form-control-md',
        lg: 'form-control-lg'
      }
    }
  },
  computed: {
    classes() {
      const size = this.sizes[this.size]

      return {
        [size]: size
      }
    }
  },
  methods: {
    onInput(event) {
      let value = parseInt(event.target.value)
      const min = parseInt(this.min)
      const max = parseInt(this.max)

      if (isNumber(min) && isNumber(value) && value < min) {
        value = min
      }

      if (isNumber(max) && isNumber(value) && value > max) {
        value = max
      }

      value = isNumber(value) ? value : null
      event.target.value = value

      this.$emit('input', value)
    }
  }
}
</script>
