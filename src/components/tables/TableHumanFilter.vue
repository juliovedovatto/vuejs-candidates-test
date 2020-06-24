<template>
  <truncate :lines="2">
    <div class="human-filter">
      <span v-for="filter in humanizedFilters" :key="`${filter.id}-${filter.value}`">
        <strong class="human-filter-field">{{ filter.field }}</strong>
        {{ filter.operator }}
        <strong class="human-filter-value">{{ filter.value }}</strong>

        <template v-if="filter.group">
          {{ filter.group }}
        </template>
      </span>
    </div>
  </truncate>
</template>

<script>
import { Truncate } from '@/components/readmore'
import { DateTime } from 'luxon'

export default {
  name: 'TableHumanFilter',
  components: {
    Truncate
  },
  props: {
    filterset: {
      type: Object,
      required: true
    },
    availableFields: {
      type: Array,
      required: true
    },
    operators: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      humanizedFilters: []
    }
  },
  methods: {
    getAvailableFieldById(field_id) {
      const fields = this.availableFields.map(group => group.items).flat()
      return fields.find(field => field.id === field_id)
    },
    getOperatorLabel(type, operator) {
      return this.operators[type][operator]
    },
    async getValue(filter, availableField) {
      const value = filter.value
      const type = availableField.type
      const operator = filter.operator

      const isNull = operator.includes('isnull')
      const choices = availableField.choices
      const isDate = type === 'Date'
      const isDatetime = type === 'Datetime'
      const isYear = operator.includes('year')
      const isInQuarter = operator.includes('in_quarter')

      if (isNull) {
        return ''
      }

      if (choices && choices.type === 'inline') {
        return value
          .map(item => {
            const choice = choices.value.find(choice => choice.id == item)
            return choice.label
          })
          .join(', ')
      }

      if (choices && choices.type === 'masters') {
        const options = await this.$store.dispatch('api/getChoicesById', {
          params: {
            ...choices,
            ids: filter.value
          }
        })

        return value.map(item => options.list.find(option => option.id === item).label).join(', ')
      }

      if (isYear || isInQuarter) {
        return value.join(', ')
      }

      if (isDate) {
        return value.map(item => DateTime.fromISO(item).toLocaleString(DateTime.DATE_FULL)).join(' and ')
      }

      if (isDatetime) {
        return value.map(item => DateTime.fromISO(item).toLocaleString(DateTime.DATETIME_SHORT)).join(' and ')
      }

      return value.join(', ')
    },
    async humanizeFilters() {
      const phrases = this.filterset.groups.reduce((reducer, group) => {
        const filters = group.filters.map(async (filter, index) => {
          const availableField = this.getAvailableFieldById(filter.field_id)
          const operator = this.getOperatorLabel(availableField.type, filter.operator)
          const value = await this.getValue(filter, availableField)

          return {
            id: availableField.id,
            field: availableField.label,
            operator,
            value,
            group: index === group.filters.length - 1 ? null : group.operator.toLowerCase()
          }
        })

        reducer.push(...filters)
        return reducer
      }, [])

      return Promise.all(phrases)
    }
  },
  watch: {
    filterset: {
      immediate: true,
      async handler() {
        this.humanizedFilters = await this.humanizeFilters()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.human-filter {
  span {
    margin: 0;

    &:not(:last-child) {
      margin-right: 0.3rem;
    }

    .human-filter-field,
    .human-filter-value {
      color: $primary !important;
    }
  }
}
</style>
