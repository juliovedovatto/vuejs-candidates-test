<template>
  <a v-if="!image" :class="{ 'link-disabled': !this.formattedValue }" :href="formattedValue" target="_blank">
    <icon-field :value="formattedValue" :icon-class="iconClass" />
  </a>
  <image-field v-else :value="formattedValue" :width="imageWidth" :height="imageHeight" />
</template>

<script>
import IconField from './IconField.vue'
import ImageField from './ImageField.vue'

export default {
  name: 'URLField',
  components: {
    IconField,
    ImageField
  },
  props: {
    value: {
      type: String
    },
    iconClass: {
      type: String
    },
    image: {
      type: Boolean,
      default: false
    },
    imageWidth: {
      type: Number
    },
    imageHeight: {
      type: Number
    }
  },
  computed: {
    formattedValue() {
      if (!this.value) {
        return ''
      }

      return this.value.startsWith('http') ? this.value : `//${this.value}`
    }
  }
}
</script>

<style lang="scss" scoped>
.link-disabled {
  pointer-events: none;
}
</style>
