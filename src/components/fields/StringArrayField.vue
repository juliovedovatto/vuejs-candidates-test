<template>
  <truncate>
    <div class="string-array-field">
      <template v-if="value && value.length">
        <span v-for="string in value" :key="string" class="string">{{ string }}</span>
      </template>
      <template v-else>N/A</template>
    </div>
  </truncate>
</template>

<script>
import { Truncate } from '@/components/readmore'

export default {
  name: 'StringArrayField',
  components: {
    Truncate
  },
  props: {
    value: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped>
.string-array-field {
  .string:not(:last-child) {
    &::after {
      content: ', ';
    }
  }
}
</style>
