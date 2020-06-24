<template>
  <div class="table-filter">
    <div class="table-selectors">
      <div class="preset">
        <multiselect
          :value="filterset"
          :options="filtersets"
          :show-labels="false"
          :allow-empty="false"
          track-by="id"
          label="name"
          open-direction="bottom"
          class="multiselect__lg preset-selector"
          placeholder="+ New Filter"
          @input="onFiltersetSelect"
        >
          <template #singleLabel="props">{{ props.option.name }} {{ isOwner && changed ? '*' : '' }}</template>
        </multiselect>
      </div>

      <div class="sorting">
        <div v-if="filterset" class="badges">
          <badge v-for="field in filterset.order_columns" :key="field.field_id" background="bg-white">
            <span class="mb-0 mr-2">{{ getAvailableFieldById(field.field_id).label }}</span>
            <font-awesome-icon
              v-if="field.direction === 'desc'"
              icon="arrow-down"
              class="mr-2 text-primary cursor-pointer"
              @click="onSortChange(field)"
            />
            <font-awesome-icon
              v-else
              icon="arrow-up"
              class="mr-2 text-primary cursor-pointer"
              @click="onSortChange(field)"
            />

            <font-awesome-icon icon="times" class="cursor-pointer" @click="onSortRemove(field)" />
          </badge>
        </div>

        <multiselect
          :options="sortFields"
          v-bind="fieldSelector"
          placeholder="+ Add Sorting"
          class="multiselect__lg sorting-selector"
          :hide-selected="true"
          @input="onSortSelect"
        />
      </div>
    </div>

    <hr class="separator" />

    <div v-if="filterset" class="filters">
      <div v-for="(group, groupIndex) in filterset.groups" :key="`${groupIndex}-group`" class="filter-group">
        <div v-for="(filter, index) in group.filters" :key="`${index}-filter`" class="filter">
          <div class="filter-counter">{{ index + 1 }}</div>

          <div class="filter-field">
            <multiselect
              ref="filterField"
              v-model="filter.object"
              :options="availableFilterFields"
              v-bind="fieldSelector"
              class="multiselect__lg w-100"
              @input="onFilterFieldChange(filter)"
              tabIndex="0"
            />
          </div>

          <div v-if="filter.object && filter.object.type" class="filter-operator">
            <multiselect
              ref="filterOperator"
              v-model="filter.operator"
              :options="getOperatorsByFilter(filter)"
              :show-labels="false"
              track-by="value"
              label="label"
              class="multiselect__lg w-100"
              @input="onFilterOperatorChange(filter)"
              tabIndex="1"
            />
          </div>

          <div v-if="filter.operator && hasComponent(filter)" class="filter-value">
            <!-- eslint-disable-next-line vue/require-component-is -->
            <component
              v-if="isFacetComponent(filter)"
              v-bind="getComponentByFilter(filter)"
              v-model="filter.value"
              :options="facets[filter.object.choices.value] || []"
              @input="onFilterValueChange(filter)"
            />
            <!-- eslint-disable-next-line vue/require-component-is -->
            <component
              v-else
              v-bind="getComponentByFilter(filter)"
              v-model="filter.value"
              @input="onFilterValueChange(filter)"
            />
          </div>

          <div class="filter-remove">
            <font-awesome-icon icon="times" class="cursor-pointer" @click="onFilterRemove(group, index)" />
          </div>
        </div>

        <div class="filter">
          <div class="filter-counter">
            {{ group.filters.length + 1 }}
          </div>

          <div class="filter-field">
            <multiselect
              placeholder="+ Add filter"
              :options="availableFilterFields"
              v-bind="fieldSelector"
              class="multiselect__lg w-100"
              @input="field => onAddFilter(group, field)"
            />
          </div>
        </div>
      </div>
    </div>

    <hr class="separator" />

    <div class="filter-actions">
      <button :disabled="!changed" class="btn btn-lg btn-primary mr-4" @click="onApply">Apply</button>
      <button :disabled="!changed" class="btn btn-lg btn-outline-dark custom-outline-dark" @click="onReset">
        Reset
      </button>
    </div>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import DatePicker from 'v-calendar/lib/components/date-picker.umd'
import { DateTimePickerComponent } from '@syncfusion/ej2-vue-calendars'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { chain, first, last, isArray, isObject, isNil, isEmpty } from 'lodash'
import { DateTime } from 'luxon'

import API from '@/core/api'
import { EventBus } from '@/core/bus'
import { Badge } from '@/components/badges'
import {
  NumberRange,
  DateTime as DateTimeInput,
  Tag,
  TextInput,
  NumberInput,
  SelectInput,
  BooleanInput
} from '@/components/inputs'

export default {
  name: 'TableFilter',
  components: {
    Badge,
    DatePicker, // eslint-disable-line vue/no-unused-components
    NumberRange, // eslint-disable-line vue/no-unused-components
    DateTimeInput, // eslint-disable-line vue/no-unused-components
    Tag, // eslint-disable-line vue/no-unused-components
    TextInput, // eslint-disable-line vue/no-unused-components
    NumberInput, // eslint-disable-line vue/no-unused-components
    Multiselect, // eslint-disable-line vue/no-unused-components
    SelectInput, // eslint-disable-line vue/no-unused-components
    DateTimePickerComponent, // eslint-disable-line vue/no-unused-components
    BooleanInput, // eslint-disable-line vue/no-unused-components
    FontAwesomeIcon
  },
  props: {
    view: {
      type: Object,
      required: true
    },
    operators: {
      type: Object,
      required: true
    },
    availableFields: {
      type: Array,
      required: true
    },
    getFiltersets: {
      type: Function,
      required: true
    },
    getFilterset: {
      type: Function,
      required: true
    },
    createFilterset: {
      type: Function,
      required: true
    },
    updateFilterset: {
      type: Function,
      required: true
    },
    inlineMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      changed: false,
      filterset: null,
      filtersets: [],
      newFilterset: {
        name: null,
        error: {}
      },
      fieldSelector: {
        groupValues: 'items',
        groupLabel: 'group_name',
        trackBy: 'id',
        label: 'label',
        openDirection: 'bottom',
        showLabels: false
      },
      facets: {},
      types: {
        String: {
          default: {
            is: 'TextInput',
            size: 'lg'
          },
          multiple: {
            is: 'Tag',
            size: 'lg',
            class: 'w-100'
          }
        },
        Number: {
          default: {
            is: 'NumberInput',
            size: 'lg'
          },
          range: {
            is: 'NumberRange',
            size: 'lg'
          },
          multiple: {
            is: 'Tag',
            size: 'lg',
            class: 'w-100',
            inputType: 'number'
          }
        },
        Duration: {
          default: {
            is: 'NumberInput',
            placeholder: 'Enter the duration in days',
            size: 'lg'
          }
        },
        Date: {
          default: {
            is: 'DateTimePickerComponent',
            placeholder: 'Enter date',
            cssClass: 'date-picker-component'
          },
          range: {
            is: 'DatePicker',
            mode: 'range',
            inputProps: {
              class: 'form-control form-control-lg'
            }
          },
          year: {
            is: 'NumberInput',
            size: 'lg',
            min: 1900,
            max: DateTime.local().year
          },
          quarter: {
            is: 'NumberInput',
            size: 'lg',
            min: 1,
            max: 4
          }
        },
        Datetime: {
          default: {
            is: 'DateTimePickerComponent',
            placeholder: 'Enter date',
            cssClass: 'date-picker-component'
          },
          range: {
            is: 'DatePicker',
            mode: 'range',
            inputProps: {
              class: 'form-control form-control-lg'
            }
          },
          year: {
            is: 'NumberInput',
            size: 'lg',
            min: 1900,
            max: DateTime.local().year
          },
          quarter: {
            is: 'NumberInput',
            size: 'lg',
            min: 1,
            max: 4
          }
        },
        Keyword: {
          default: {
            is: 'Tag',
            size: 'lg',
            class: 'w-100'
          }
        },
        Decimal: {
          default: {
            is: 'NumberInput',
            size: 'lg',
            min: 1
          },
          range: {
            is: 'NumberRange',
            size: 'lg'
          }
        },
        Boolean: {
          default: {
            is: 'BooleanInput',
            size: 'lg',
            class: 'w-100'
          }
        },
        Array: {
          default: {
            is: 'Multiselect',
            class: 'multiselect__lg w-100',
            multiple: true,
            openDirection: 'bottom'
          },
          'caravaggio.User': {
            is: 'Multiselect',
            trackBy: 'id',
            label: 'label',
            class: 'multiselect__lg w-100',
            openDirection: 'bottom',
            multiple: true,
            closeOnSelect: false
          },
          String: {
            is: 'Tag',
            size: 'lg',
            class: 'w-100'
          }
        },
        UUID: {
          'caravaggio.User': {
            is: 'Multiselect',
            trackBy: 'id',
            label: 'label',
            class: 'multiselect__lg w-100',
            openDirection: 'bottom',
            multiple: true,
            closeOnSelect: false
          }
        },
        Choices: {
          inline: {
            is: 'Multiselect',
            trackBy: 'id',
            label: 'label',
            class: 'multiselect__lg w-100',
            openDirection: 'bottom',
            multiple: true,
            closeOnSelect: false
          },
          facets: {
            is: 'SelectInput',
            url: `${API.request.defaults.baseURL}/apian/choices/list-choices/`,
            dataResults: 'list',
            dataHasMore: 'has_more',
            dataOffset: 'offset',
            isOffset: true,
            multiple: true,
            closeOnSelect: false
          },
          masters: {
            is: 'SelectInput',
            url: `${API.request.defaults.baseURL}/apian/choices/list-choices/`,
            dataResults: 'list',
            dataHasMore: 'has_more',
            multiple: true,
            closeOnSelect: false
          }
        },
        ManyToMany: {
          'caravaggio.User': {
            is: 'Multiselect',
            trackBy: 'id',
            label: 'label',
            class: 'multiselect__lg w-100',
            openDirection: 'bottom',
            multiple: true,
            closeOnSelect: false
          }
        }
      }
    }
  },
  async mounted() {
    EventBus.$on('tableview::filterset::change', async data => {
      if (this.filterset && this.filterset.id !== data.id) {
        this.filterset = await this.deserializeFilterset(data)
      }
    })
  },
  destroyed() {
    EventBus.$off('tableview::filterset::change')
  },
  computed: {
    isOwner() {
      return false
    },
    availableFilterFields() {
      if (!this.availableFields || !this.availableFields.length) {
        return []
      }

      return chain(this.availableFields)
        .orderBy('group_name', 'asc')
        .map(group => {
          const items = chain(group.items)
            .filter(item => item.filterable)
            .orderBy('label', 'asc')
            .value()
          return {
            ...group,
            items
          }
        })
        .value()
    },
    availableSortFields() {
      if (!this.availableFields || !this.availableFields.length) {
        return []
      }

      return this.availableFields.map(group => {
        const items = group.items.filter(item => item.sortable)

        return {
          ...group,
          items
        }
      })
    },
    sortFields() {
      if (!this.filterset) {
        return []
      }

      return this.availableSortFields.map(group => {
        const items = group.items.filter(item => {
          const order_columns = this.filterset.order_columns.map(column => column.field_id)
          return !order_columns.includes(item.id)
        })

        return {
          ...group,
          items
        }
      })
    }
  },
  methods: {
    hasComponent(filter) {
      const type = filter.object.type
      const operator = filter.operator.value

      const isNull = operator.includes('isnull')
      const componentByType = this.types[type]

      return componentByType && !isNull
    },
    isFacetComponent(filter) {
      const choices = filter.object.choices
      return choices && ['facets', 'masters'].includes(choices.type)
    },
    getComponentByFilter(filter) {
      const choices = filter.object.choices
      const type = choices ? 'Choices' : filter.object.type
      const operator = filter.operator.value

      const isRange = operator.includes('range')
      const isYear = operator.includes('year')
      const isInQuarter = operator.includes('in_quarter')
      const isMultiple = operator.includes('is_one_of') || operator.endsWith('in')
      const isArray = type === 'Array'
      const componentByType = this.types[type]

      if (choices) {
        const component = { ...componentByType[choices.type] }

        if (choices.type === 'inline') {
          component.options = choices.value
        } else if (['facets', 'masters'].includes(choices.type)) {
          component.queryParams = choices
        }

        return component
      }

      if (isArray) {
        const component = componentByType[filter.object.array_type]
        return component
      }

      if (isRange) {
        return componentByType.range
      }

      if (isYear) {
        return componentByType.year
      }

      if (isInQuarter) {
        return componentByType.quarter
      }

      if (isMultiple) {
        return componentByType.multiple
      }

      return componentByType.default
    },
    getOperatorsByFilter(filter) {
      const type = filter.object.type
      const hasChoices = filter.object.choices
      const isUUID = type === 'UUID'
      const isArray = type === 'Array'

      if (!this.operators || !this.operators[type]) {
        return []
      }

      const operator = hasChoices && !isUUID && !isArray ? this.operators['Choices'] : this.operators[type]
      return chain(Object.entries(operator))
        .orderBy(operator.label, 'asc')
        .map(([key, value]) => {
          return {
            label: value,
            value: key
          }
        })
        .value()
    },
    getAvailableFieldById(field_id) {
      const fields = this.availableFields.map(group => group.items).flat()

      return fields.find(field => field.id === field_id)
    },
    async onFiltersetSelect(filterset) {
      this.filterset = await this.deserializeFilterset(filterset)
      this.$emit('on-filterset-select', filterset)
    },
    onSortSelect(field) {
      this.filterset.order_columns.push({
        field_id: field.id,
        direction: 'asc'
      })
      this.changed = true
    },
    onSortChange(field) {
      field.direction = field.direction === 'asc' ? 'desc' : 'asc'
      this.changed = true
    },
    onSortRemove(field) {
      const index = this.filterset.order_columns.findIndex(column => column.field_id === field.field_id)
      this.filterset.order_columns.splice(index, 1)
      this.changed = true
    },
    onAddFilter(group, field) {
      const filter = {
        object: field,
        operator: null,
        value: null
      }
      group.filters.push(filter)
      this.$nextTick(() => {
        if (this.$refs.filterOperator) {
          this.$refs.filterOperator[this.$refs.filterOperator.length - 1].$el.focus()
        }
      })
    },
    onFilterFieldChange(filter) {
      filter.operator = null
      filter.value = null
      this.changed = true
    },
    onFilterValueChange() {
      this.changed = true
    },
    onFilterOperatorChange(filter) {
      filter.value = null
      this.changed = true
    },
    onFilterRemove(group, index) {
      group.filters.splice(index, 1)
      this.changed = true
    },
    clearNewFilterset() {
      this.newFilterset = {
        name: null,
        error: {}
      }
    },
    deserializeOperator(filter, object) {
      const composedFilter = { ...filter, object }

      const options = this.getOperatorsByFilter(composedFilter)
      return options.find(option => option.value === composedFilter.operator)
    },
    serializeValue(filter) {
      const type = filter.object.type
      const value = filter.value
      const operator = filter.operator.value

      const isnull = operator.includes('isnull')
      const isYear = operator.includes('year')
      const isInQuarter = operator.includes('in_quarter')
      const isMultiple = operator.includes('is_one_of') || operator.endsWith('in')
      const choices = filter.object.choices

      if (isnull) {
        return undefined
      }

      if (isMultiple) {
        if (choices && choices.type === 'inline') {
          return value.map(value => value.id)
        }

        return value
      }

      if (isArray(value)) {
        if (type === 'Date') {
          return value.map(value => DateTime.fromJSDate(value).toISODate())
        }

        return value
      }

      if (isObject(value)) {
        if (type === 'Datetime' && value.start && value.end) {
          const start = filter.value.start.toISOString()
          const end = filter.value.end.toISOString()

          return [start, end]
        }

        if (type === 'Date' && value.start && value.end) {
          const start = DateTime.fromJSDate(filter.value.start).toISODate()
          const end = DateTime.fromJSDate(filter.value.end).toISODate()

          return [start, end]
        }

        if (type === 'Date' && !(isYear || isInQuarter)) {
          return [DateTime.fromJSDate(value).toISODate()]
        } else if (type === 'Datetime' && !(isYear || isInQuarter)) {
          return [value.toISOString()]
        }

        if (choices) {
          return value.id
        }
      }

      return [value]
    },
    async deserializeValue(filter, object) {
      const type = object.type
      const value = filter.value
      const operator = filter.operator

      const isnull = operator.includes('isnull')
      const choices = object.choices
      const isYear = operator.includes('year')
      const isArray = type === 'Array'
      const isKeyword = type === 'Keyword'
      const isMultiple = operator.includes('is_one_of') || operator.endsWith('in')
      const isRange = operator.includes('range')
      const isInQuarter = operator.includes('in_quarter')

      if (isnull) {
        return undefined
      }

      if (choices) {
        if (choices.type === 'inline') {
          return value.map(item => choices.value.find(choice => choice.id == item))
        } else if (choices.type === 'facets') {
          const options = value.map(item => ({ id: item, label: item }))
          const facets = this.facets[choices.value]

          if (facets) {
            this.facets[choices.value] = chain([...facets, ...options])
              .uniqBy('id')
              .orderBy('label')
              .value()
          } else {
            this.facets[choices.value] = options
          }
        } else if (choices.type === 'masters') {
          const options = await this.$store.dispatch('api/getChoicesById', {
            params: {
              ...choices,
              ids: value
            }
          })

          const facets = this.facets[choices.value]

          if (facets) {
            this.facets[choices.value] = chain([...facets, ...options.list])
              .uniqBy('id')
              .orderBy('label')
              .value()
          } else {
            this.facets[choices.value] = options.list
          }
        }
      }

      if (isMultiple || isKeyword || isArray) {
        return value
      }

      if (isRange) {
        if (type === 'Date') {
          return {
            start: DateTime.fromISO(first(value)).toJSDate(),
            end: DateTime.fromISO(last(value)).toJSDate()
          }
        }

        if (type === 'Datetime') {
          return {
            start: DateTime.fromISO(first(value)).toJSDate(),
            end: DateTime.fromISO(last(value)).toJSDate()
          }
        }

        return value
      }

      if (['Date', 'Datetime'].includes(type)) {
        if (isYear || isInQuarter) {
          return first(value)
        }

        return DateTime.fromISO(first(value)).toJSDate()
      }

      return first(value)
    },
    serializeFilter(filter) {
      return {
        field_id: filter.object.id,
        operator: filter.operator && filter.operator.value,
        value: this.serializeValue(filter)
      }
    },
    async deserializeFilter(filter) {
      const object = this.availableFilterFields
        .map(fields => fields.items)
        .flat()
        .find(field => field.id === filter.field_id)

      return {
        object,
        operator: this.deserializeOperator(filter, object),
        value: await this.deserializeValue(filter, object)
      }
    },
    serializeFilterset(filterset) {
      const serializedFilterset = { ...filterset }

      serializedFilterset.groups = filterset.groups.map(group => {
        const filters = group.filters
          .filter(filter => {
            if (filter.operator.value.includes('isnull')) {
              return true
            }

            return isArray(filter.value) ? !isEmpty(filter.value) : !isNil(filter.value)
          })
          .map(filter => this.serializeFilter(filter))

        return {
          ...group,
          filters
        }
      })

      return serializedFilterset
    },
    async deserializeFilterset(filterset) {
      const deserializedFilterset = { ...filterset }

      deserializedFilterset.groups = await Promise.all(
        filterset.groups.map(async group => {
          const filters = await Promise.all(group.filters.map(filter => this.deserializeFilter(filter)))

          return {
            ...group,
            filters
          }
        })
      )

      return deserializedFilterset
    },
    onApply() {
      this.$emit('on-filterset-preview', this.serializeFilterset(this.filterset))
    },
    onReset() {
      this.getFilterset({ id: this.filterset.id }).then(async data => {
        this.filterset = await this.deserializeFilterset(data)
        this.changed = false

        this.$emit('on-filterset-update', data)
      })
    }
  },
  watch: {
    view: {
      immediate: true,
      handler(newValue, oldValue) {
        if (!this.view) {
          return
        }

        if (oldValue && oldValue.id === this.view.id) {
          return
        }

        this.changed = false
        this.getFiltersets({
          params: {
            tableview: this.view.id,
            order_by: 'name'
          }
        }).then(async data => {
          this.filtersets = chain(data.results)
            .orderBy(filterset => DateTime.fromISO(filterset.updated_at), ['desc'])
            .value()
          this.$emit('on-filtersets-load', this.filtersets)
          const filterset = first(this.filtersets)

          if (filterset) {
            this.filterset = await this.deserializeFilterset(filterset)
            this.$emit('on-filterset-select', filterset)
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.table-filter {
  display: flex;
  flex-flow: column wrap;
  background-color: $light;
  border-radius: 3px;
  padding: 1.5rem;

  .separator {
    width: 100%;
    border-top: 1px solid $gray-light;
    margin: 1.5rem 0;
  }

  .table-selectors {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;

    .preset {
      display: flex;
      flex-flow: row nowrap;

      .preset-selector {
        width: 300px;
        margin-right: 1rem;
      }
    }

    .sorting {
      display: flex;
      flex-flow: row wrap;
      align-items: center;

      .badges {
        margin-right: 1rem;

        .custom-badge {
          &:not(:last-child) {
            margin-right: 0.5rem;
          }
        }
      }

      .sorting-selector {
        width: 200px;
      }
    }
  }

  .filter-actions {
    .custom-outline-dark {
      border: 2px solid $dark;
    }
  }

  .filters {
    flex: 1 1 auto;
    display: flex;
    flex-flow: column wrap;

    .filter {
      flex: 1 1 auto;
      display: flex;
      align-items: stretch;

      &:not(:last-child) {
        margin-bottom: 1.5rem;
      }

      > :not(:last-child) {
        margin-right: 1rem;
      }

      .filter-counter {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        border: 2px solid $dark;
        border-radius: 50%;
        width: 3rem;
        height: 3rem;
      }

      .filter-field {
        flex: 0 0 250px;
      }

      .filter-operator {
        flex: 0 0 250px;
      }

      .filter-value {
        flex: 0 0 300px;
      }

      .filter-remove {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>

<style lang="scss">
.table-filter {
  .table-selectors {
    .btn-outline-dark {
      border-width: 2px;
    }

    .dropdown {
      &.disabled-button {
        button:not(.dropdown-toggle) {
          opacity: 0.5;
          pointer-events: none;
        }
      }

      .btn-outline-dark {
        border-width: 2px;
      }
    }
  }
  .date-picker-component {
    border: 1px solid $gray !important;
    font-size: 1rem;
    color: $dark;

    &:focus {
      box-shadow: 1px 1px 7px 1px rgba(0, 0, 0, 0.175) !important;
    }
    .e-datetimepicker {
      min-height: 2.9rem;
      border-radius: 0.3rem;
    }
    .e-date-icon {
      border: none;
    }
  }
}
</style>
