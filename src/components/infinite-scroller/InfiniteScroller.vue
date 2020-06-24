<i18n>
{
  "en": {
    "loading": "Loading..."
  }
}
</i18n>

<template>
  <component :is="tag" :class="{ 'infinite-scroller--self-contained': isSelfContained }" class="infinite-scroller">
    <component
      v-for="item in attached"
      :key="`item-${item.index}`"
      :is="itemTag"
      :style="{ top: `${accumulativeHeight[item.meta.index]}px` }"
      :data-index="item.meta.index"
      class="infinite-scroller__item"
    >
      <slot :item="item.meta.data" :index="item.meta.index"></slot>
    </component>
    <component
      v-if="loading"
      :is="itemTag"
      :style="{ top: `${loadingItem.top}px` }"
      ref="loading"
      class="infinite-scroller__item infinite-scroller__item--placeholder"
    >
      <slot name="loading">{{ $t('loading') }}</slot>
    </component>
    <component
      :is="itemTag"
      :style="{ top: `${scrollHeight}px` }"
      ref="scrollPlaceholder"
      class="infinite-scroller__scroll-placeholder"
    ></component>
  </component>
</template>

<script>
import { last, isNil, findLastIndex } from 'lodash'
import { getScrollableParent } from '@/core/html'

export default {
  name: 'InfiniteScroller',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    hasMore: {
      type: Boolean,
      default: false
    },
    tag: {
      type: String,
      default: 'div'
    },
    itemTag: {
      type: String,
      default: 'div'
    },
    minHeight: {
      type: Number,
      default: 50
    }
  },
  data() {
    return {
      isInit: false,
      isSelfContained: false,
      itemsMetadata: [],
      scroller: null,
      attachedRange: { begin: 0, end: 0 },
      loadingItem: { top: 0, height: 0 },
      scrolling: false
    }
  },
  mounted() {
    this.init()
  },
  computed: {
    attached() {
      return this.itemsMetadata.slice(this.attachedRange.begin, this.attachedRange.end + 1).map((meta, index) => {
        return {
          index,
          meta
        }
      })
    },
    loading() {
      return this.hasMore && this.attachedRange.end >= this.items.length - 1
    },
    clientHeight() {
      return this.attached.reduce((reducer, item) => reducer + item.meta.height, 0)
    },
    scrollHeight() {
      const itemsHeight = this.itemsMetadata.reduce((reducer, item) => reducer + (item.height || this.minHeight), 0)

      if (this.loading) {
        return itemsHeight + this.loadingItem.height
      }

      return itemsHeight
    },
    accumulativeHeight() {
      return this.itemsMetadata.reduce(
        (reducer, item) => {
          const lastHeight = last(reducer)
          const height = item.height || this.minHeight

          if (!isNil(lastHeight)) {
            reducer.push(lastHeight + height)
          }

          return reducer
        },
        [0]
      )
    }
  },
  methods: {
    async getScroller() {
      if (!this.$el) {
        await this.$nextTick()
        await this.getScroller()
        return
      }

      this.scroller = getScrollableParent(this.$el, false, true)
    },
    async fillInitial() {
      this.fill(this.attachedRange.begin, this.attachedRange.end + 1)
      await this.$nextTick()

      if (this.attached.length < this.items.length && this.scroller.clientHeight > this.clientHeight) {
        this.fillInitial()
      }
    },
    fill(start, end) {
      const begin = Math.max(0, start)
      const endRange = Math.min(end, Math.max(0, this.items.length - 1))
      this.attachedRange = { begin, end: endRange }

      if (this.items.length) {
        this.updateMetadata()
      }

      if (end >= this.items.length && this.hasMore) {
        this.$emit('load-more', this.items.length)
      }
    },
    updateMetadata() {
      const diff = this.items.length - this.itemsMetadata.length

      if (diff > 0) {
        this.itemsMetadata = this.itemsMetadata.concat(
          new Array(diff).fill(null).map((m, i) => ({
            index: this.itemsMetadata.length + i,
            height: 0,
            data: this.items[this.itemsMetadata.length + i]
          }))
        )
      }

      if (this.attachedRange.begin === this.attachedRange.end) {
        return
      }

      const nodes = this.$el.querySelectorAll(':scope > .infinite-scroller__item')

      for (let i = this.attachedRange.begin; i <= this.attachedRange.end; i++) {
        const meta = this.itemsMetadata[i]
        const node = nodes[i - this.attachedRange.begin]

        if (!node) {
          return
        }

        meta.height = node.offsetHeight
        meta.data = this.items[i]
        this.$set(this.itemsMetadata, i, meta)
      }
    },
    getVisibleItems() {
      const scrollTop = this.scroller.scrollTop
      const offsetHeight = this.scroller.offsetHeight
      const first = findLastIndex(this.accumulativeHeight, item => item <= scrollTop)
      const last = findLastIndex(this.accumulativeHeight, item => item <= scrollTop + offsetHeight)

      return { first, last }
    },
    async onScroll() {
      if (!this.scrolling) {
        this.scrolling = true

        requestAnimationFrame(() => {
          this.scrolling = false
          const visible = this.getVisibleItems()
          this.fill(visible.first, visible.last)
        })
      }
    },
    async init() {
      if (this.isInit) {
        return
      }

      await this.$nextTick()
      await this.getScroller()

      this.isSelfContained = this.scroller === this.$el
      this.scroller.classList.add('infinite-scroller__scroller')
      this.scroller.addEventListener('scroll', this.onScroll.bind(this), { passive: true })

      if (getComputedStyle(this.scroller).position === 'static') {
        this.scroller.style.position = 'relative'
      }

      this.itemsMetadata = this.items.map((item, index) => ({
        index,
        height: 0,
        data: item
      }))

      this.fillInitial()
      this.isInit = true
    }
  },
  watch: {
    async items() {
      if (!this.$el) {
        return
      }

      if (!this.hasMore && this.items.length !== this.itemsMetadata.length) {
        this.attachedRange = { begin: 0, end: 0 }
        this.itemsMetadata = this.items.map((item, index) => ({
          index,
          height: 0,
          data: item
        }))

        this.scroller.scrollTop = 0
        await this.fillInitial()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.infinite-scroller {
  transform: translate3d(0, 0, 0);

  &__scroll-placeholder {
    display: block;
    height: 1px;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    transition: top 0.2s;
    width: 1px;
  }

  &__item {
    position: absolute;
    width: 100%;
  }
}
</style>
