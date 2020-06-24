<template>
  <div :style="style" :class="classes" class="radial-progress-container">
    <div class="radial-progress" />
  </div>
</template>

<script>
import { isInteger } from 'lodash'
import ProgressBar from 'progressbar.js'

export default {
  name: 'RadialProgress',
  props: {
    percentile: {
      type: [Number, String],
      default: 100,
      validator(value) {
        return isInteger(parseInt(value))
      }
    },
    color: {
      type: String,
      default: '#5cc57e'
    },
    width: {
      type: Number,
      default: 48
    },
    filled: {
      type: Boolean,
      default: false
    },
    fontSize: {
      type: Number,
      default: 20
    }
  },
  data() {
    return {
      bar: null
    }
  },
  computed: {
    style() {
      return {
        width: `${this.width}px`
      }
    },
    classes() {
      return {
        filled: this.filled
      }
    }
  },
  mounted() {
    this.bar = new ProgressBar.Circle(this.$el.querySelector('.radial-progress'), {
      strokeWidth: 6,
      color: this.color,
      trailColor: '#eee',
      text: {
        value: this.percentile,
        className: 'radial-progress-text',
        style: {
          position: 'absolute',
          left: '50%',
          top: '50%',
          padding: 0,
          margin: 0,
          transform: {
            prefix: true,
            value: 'translate(-50%, -50%)'
          },
          fontSize: `${this.fontSize}px`
        }
      },
      duration: 0
    })
    this.bar.animate(this.percentile / 100)
  },
  watch: {
    percentile() {
      this.bar.setText(this.percentile)
      this.bar.animate(this.percentile / 100)
    }
  }
}
</script>

<style lang="scss">
.radial-progress-container {
  &.filled {
    background-color: #fff;
    border: 2px solid #fff;
    box-shadow: 0px 1px 3px #0000001a;
    border-radius: 50%;
  }
}

.radial-progress-text {
  font-size: 20px;
  font-family: Lato, sans-serif;
  font-weight: bold;
}

.dark {
  .radial-progress-text {
    color: #fff !important;
  }
}
</style>
