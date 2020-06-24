<i18n>
{
  "en": {
    "true": "Yes",
    "false": "No"
  }
}
</i18n>

<template>
  <multiselect
    :value="value"
    :options="options"
    :class="classes"
    :custom-label="customLabel"
    :preselect-first="true"
    :allow-empty="false"
    open-direction="bottom"
    @input="onInput"
  />
</template>

<script>
import Multiselect from 'vue-multiselect'

export default {
  name: 'BooleanInput',
  components: {
    Multiselect
  },
  props: {
    value: {
      type: String
    },
    size: {
      type: String,
      default: 'md'
    }
  },
  data() {
    return {
      options: ['true', 'false']
    }
  },
  computed: {
    classes() {
      const sizes = {
        sm: 'multiselect__sm',
        lg: 'multiselect__lg'
      }
      const size = sizes[this.size]

      return {
        [size]: size
      }
    }
  },
  methods: {
    customLabel(option) {
      return this.$t(`${option}`)
    },
    onInput(option) {
      this.$emit('input', option)
    }
  }
}
</script>
