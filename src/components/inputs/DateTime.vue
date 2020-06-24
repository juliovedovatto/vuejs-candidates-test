<template>
  <div class="datetime-input">
    <date-picker :value="date" :input-props="{ class: classes }" @input="onDate" />
    <input :value="time" :class="classes" type="time" @input="onTime" />
  </div>
</template>

<script>
import DatePicker from 'v-calendar/lib/components/date-picker.umd'

export default {
  name: 'DateTime',
  components: {
    DatePicker
  },
  props: {
    value: {
      type: Date
    },
    size: {
      type: String,
      default: 'md'
    }
  },
  data() {
    return {
      date: null,
      time: null,
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

      return [
        'form-control',
        {
          [size]: size
        }
      ]
    }
  },
  methods: {
    getTime() {
      const time = this.time || '00:00'
      const [hour, minute] = time.split(':')

      return [parseInt(hour || 0), parseInt(minute || 0)]
    },
    emit() {
      this.$emit('input', this.date)
    },
    onDate(value) {
      this.date = value

      if (!value) {
        this.time = null
      } else {
        const [hour, minute] = this.getTime()
        this.date.setHours(hour, minute)
      }

      this.emit()
    },
    onTime(event) {
      this.time = event.target.value

      if (this.date) {
        const [hour, minute] = this.getTime()
        const newDate = new Date(this.date.getTime())
        newDate.setHours(hour, minute)

        this.date = newDate
        this.emit()
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      handler() {
        if (this.value) {
          this.date = this.value

          const hours = this.value
            .getHours()
            .toString()
            .padStart(2, '0')
          const minutes = this.value
            .getMinutes()
            .toString()
            .padStart(2, '0')
          this.time = `${hours}:${minutes}`
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.datetime-input {
  display: flex;
  flex-flow: row nowrap;

  span {
    flex: 0 0 auto;
    width: 50%;
  }

  input[type='time'] {
    flex: 0 0 auto;
    width: 50%;
    margin-left: 0.5rem;
    padding: 0.375rem;
  }
}
</style>
