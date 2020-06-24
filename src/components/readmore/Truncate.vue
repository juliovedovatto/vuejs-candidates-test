<template>
  <div :class="{ 'is-truncated': isTruncated }" class="truncate">
    <p :id="`${id}-truncate`" :style="styles" class="truncate-text">
      <slot>{{ text }}</slot>
    </p>

    <b-popover
      v-if="isTruncated"
      :target="`${id}-truncate`"
      triggers="hover focus"
      placement="bottom"
      custom-class="truncate-popover"
    >
      <slot>{{ text }}</slot>
    </b-popover>
  </div>
</template>

<script>
import { v1 as uuidv1 } from 'uuid'
import { BPopover } from 'bootstrap-vue'

export default {
  name: 'Truncate',
  components: {
    BPopover
  },
  props: {
    text: {
      type: String
    },
    lines: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      id: uuidv1(),
      resizeObserver: null,
      isTruncated: false
    }
  },
  mounted() {
    this.setResizeObserver()
  },
  destroyed() {
    this.resizeObserver.disconnect()
  },
  computed: {
    styles() {
      return {
        '-webkit-line-clamp': this.lines
      }
    }
  },
  methods: {
    setResizeObserver() {
      this.resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
          const { height } = entry.contentRect

          if (height) {
            const element = this.$el.querySelector('.truncate-text')
            this.isTruncated = element.clientHeight < element.scrollHeight
          }
        })
      })

      this.resizeObserver.observe(this.$el.querySelector('.truncate-text'))
    }
  }
}
</script>

<style lang="scss" scoped>
.truncate {
  word-break: break-word;
  white-space: normal;
  &.is-truncated {
    cursor: pointer;
  }

  .truncate-text {
    margin-bottom: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
}
</style>

<style lang="scss">
.truncate-popover {
  max-width: 50%;
  padding: 1rem;
}
</style>
