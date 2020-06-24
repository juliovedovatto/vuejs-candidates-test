<template>
  <span :class="classes" class="custom-badge">
    <slot />
  </span>
</template>

<script>
export default {
  name: 'Badge',
  props: {
    theme: {
      type: String
    },
    background: {
      type: String
    },
    color: {
      type: String
    },
    size: {
      type: String,
      default: 'md'
    },
    upperCase: {
      type: Boolean,
      default: false
    },
    pill: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    classes() {
      const sizes = {
        sm: 'custom-badge--sm',
        md: 'custom-badge--md',
        lg: 'custom-badge--lg'
      }
      const size = sizes[this.size]

      return {
        [this.theme]: this.theme,
        [this.background]: this.background,
        [this.color]: this.color,
        [size]: size,
        'text-uppercase': this.upperCase,
        'custom-badge--pill': this.pill
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-badge {
  display: inline-block;
  font-family: Poppins, sans-serif;
  line-height: 1;
  padding: 0.5rem;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  border-radius: 5px;

  &--sm {
    font-size: 0.625rem;
    line-height: 1rem;
    padding: 0 0.5rem;
  }

  &--md {
    padding: 0.5rem;
  }

  &--lg {
    padding: 0.5rem 1rem;
  }

  &--pill {
    border-radius: 50rem;
  }

  &.outline-primary {
    border: 2px solid $primary;
    color: $primary;
    font-weight: 900;
  }

  &.gray {
    background-color: $gray;
    color: $white;
    font-weight: bold;
  }

  &.danger {
    background-color: $danger;
    color: $white;
    font-weight: bold;
  }

  &.primary {
    background-color: $primary;
    color: $white;
    font-weight: bold;
  }

  &.light {
    background-color: $light;
    border: 1px solid $gray-light;
  }
}
</style>
