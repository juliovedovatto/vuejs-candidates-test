<template>
  <input :value="value" :class="classes" class="form-control" type="text" @input="onInput" />
</template>

<script>
export default {
  name: 'TextInput',
  props: {
    value: {
      type: String
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
      this.$emit('input', event.target.value)
    }
  }
}
</script>
