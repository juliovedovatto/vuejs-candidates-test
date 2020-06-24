<template>
  <div class="image-field" :style="styles">
    <img :src="value" />
  </div>
</template>

<script>
export default {
  name: 'ImageField',
  props: {
    value: {
      type: String
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    }
  },
  computed: {
    styles() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.image-field {
  img {
    vertical-align: middle;
    width: 100%;
    height: auto;
  }
}
</style>
