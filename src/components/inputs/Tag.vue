<template>
  <div>
    <b-form-tags
      id="tag-input"
      :value="value"
      :input-type="inputType"
      @input="onInput"
      separator=","
      duplicate-tag-text="Duplicate value"
      remove-on-delete
      tagClass="selected-tag"
      :class="classes"
    />
  </div>
</template>

<script>
import { BFormTags } from 'bootstrap-vue'

export default {
  name: 'Tag',
  components: {
    BFormTags
  },
  props: {
    value: {
      default: () => []
    },
    size: {
      type: String,
      default: 'md'
    },
    inputType: {
      type: String,
      default: 'text'
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
      const arrayClasses = []
      arrayClasses.push(size, 'input-group')
      return arrayClasses
    }
  },
  methods: {
    emit(value) {
      this.$emit('input', value)
    },
    onInput(value) {
      this.emit(value)
    }
  }
}
</script>

<style lang="scss">
.selected-tag {
  background-color: $light;
  color: $dark;
  font-size: 1rem;
  button {
    align-self: center;
  }
}
</style>
