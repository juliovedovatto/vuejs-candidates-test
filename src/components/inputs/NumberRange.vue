<template>
  <div class="number-range-input">
    <input
      :value="min"
      :max="max"
      :class="classes"
      class="form-control"
      type="number"
      placeholder="Minimum"
      @input="onMinChange"
    />
    <input
      :value="max"
      :min="min"
      :class="classes"
      class="form-control"
      type="number"
      placeholder="Maximum"
      @input="onMaxChange"
    />
  </div>
</template>

<script>
export default {
  name: 'NumberRange',
  props: {
    value: {
      type: Array
    },
    size: {
      type: String,
      default: 'md'
    }
  },
  data() {
    return {
      min: null,
      max: null,
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
    onMinChange(event) {
      this.min = event.target.value
      this.emit()
    },
    onMaxChange(event) {
      this.max = event.target.value
      this.emit()
    },
    emit() {
      this.$emit('input', [this.min, this.max])
    }
  },
  watch: {
    value: {
      immediate: true,
      handler() {
        if (this.value && this.value.length) {
          const [min, max] = this.value
          this.min = min
          this.max = max
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.number-range-input {
  display: flex;

  input:not(:last-child) {
    margin-right: 0.5rem;
  }
}
</style>
