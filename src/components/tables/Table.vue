<i18n>
{
  "en": {
    "actions": {
      "filter": "Filter",
      "displayPreferences": "Display Preferences",
      "share": "Share",
      "export": "Export"
    },
    "caption": {
      "title": "{total} items"
    }
  }
}
</i18n>

<template>
  <div class="table-view">
    <div class="table-header">
      <div class="table-inputs">
        <div v-show="!inlineMode" class="preset-input">
          <table-preset
            :views="views"
            :view="view"
            :inline-mode="inlineMode"
            :update-view="updateView"
            :create-view="createView"
            :delete-view="deleteView"
            :create-filterset="createFilterset"
            :update-display-preferences="updateDisplayPreferences"
            :table-details="tableDetails"
            @on-copy-view="onViewChanged"
            @on-view-selected="onViewSelected"
            @on-view-created="onViewChanged"
            @on-view-updated="onViewChanged"
          />
        </div>

        <div v-if="!showFilter" class="table-human-filter">
          <table-human-filter
            v-if="filterset && availableFields.length && !isEmpty(operators)"
            :filterset="filterset"
            :available-fields="availableFields"
            :operators="operators"
          />
        </div>

        <div class="table-actions">
          <slot name="custom_action" />

          <b-button id="table-filter" :pressed.sync="showFilter" variant="outline-dark" class="custom-outline-dark">
            <font-awesome-icon icon="filter" />
            <b-tooltip target="table-filter" triggers="hover" placement="bottom">{{ $t('actions.filter') }}</b-tooltip>
          </b-button>

          <button
            id="display-preferences"
            class="btn btn-outline-dark custom-outline-dark"
            @click="showPreferences = true"
          >
            <font-awesome-icon icon="cog" />
            <b-tooltip target="display-preferences" triggers="hover" placement="bottom">
              {{ $t('actions.displayPreferences') }}
            </b-tooltip>
          </button>
        </div>
      </div>

      <table-preferences
        v-if="view && availableFields.length && showPreferences"
        :view="view"
        :update-display-preferences="updateDisplayPreferences"
        :available-fields.sync="availableFields"
        @on-hidden="showPreferences = false"
        @applied-preferences="onAppliedPreferences"
      />

      <table-filter
        v-if="view && availableFields.length"
        v-show="showFilter"
        :view="view"
        :operators="operators"
        :available-fields="availableFields"
        :inline-mode="inlineMode"
        :get-filtersets="getFiltersets"
        :get-filterset="getFilterset"
        :create-filterset="createFilterset"
        :update-filterset="updateFilterset"
        class="mt-3"
        @on-filterset-load="onFiltersetsLoad"
        @on-filterset-select="onFiltersetSelect"
        @on-filterset-create="onFiltersetChange"
        @on-filterset-update="onFiltersetChange"
        @on-filterset-preview="onFiltersetPreview"
      />
    </div>

    <div class="table-caption">
      <slot id="caption_title" name="caption_title" :total="formattedTotal">
        {{ $t('caption.title', { total: formattedTotal }) }}
      </slot>
      <multiselect
        v-if="filtersets && filtersets.length && !showFilter && !inlineMode"
        :value="filterset"
        :options="filtersets"
        :show-labels="false"
        :allow-empty="false"
        track-by="id"
        label="name"
        open-direction="bottom"
        class="multiselect__lg preset-selector"
        placeholder="Select Filter"
        @input="onFiltersetSelect"
      />
    </div>

    <div v-if="view" class="table-view-component">
      <div ref="thead" class="table-view-thead">
        <div class="table-view-tr">
          <div class="table-view-th" :class="sortedColumn.id === firstColumnId ? 'sorted-header' : ''">
            <slot name="first_header" />
            <span class="ml-2" @click="sortByColumn(firstColumnId)">
              <font-awesome-icon
                v-if="sortedColumn.id === firstColumnId"
                :icon="sortTypes[sortedColumn.sortedStateIndex].icon"
                class="sorted-icon"
              />
              <font-awesome-icon v-else :icon="sortTypes[0].icon" class="sort-icon" />
            </span>
          </div>
          <div
            v-for="field in columns"
            :key="field.id"
            class="table-view-th"
            :class="sortedColumn.id === field.id ? 'sorted-header' : ''"
          >
            {{ field.label }}
            <span class="ml-2" :id="field.id" @click="sortByColumn(field.id)">
              <font-awesome-icon
                v-if="sortedColumn.id === field.id"
                :icon="sortTypes[sortedColumn.sortedStateIndex].icon"
                class="sorted-icon"
              />
              <font-awesome-icon v-else :icon="sortTypes[0].icon" class="sort-icon" />
            </span>
          </div>
        </div>
      </div>

      <div v-show="!isLoadingItems" ref="tbody" class="table-view-tbody" @scroll="onScroll">
        <div
          v-for="item in items"
          v-bind:item="item"
          :key="`${item.id}-row`"
          :class="{ 'panel-open': openPanels[item.id] }"
          class="table-view-tr"
        >
          <div class="table-view-row">
            <div class="table-view-td" :class="sortedColumn.id === firstColumnId ? 'sorted-column' : ''">
              <slot
                name="first_column"
                :filterset="filterset"
                :item="item"
                :showPanel="showPanel"
                :isPanelOpen="openPanels[item.id]"
                :togglePanel="togglePanel"
              />
            </div>

            <div
              v-for="field in columns"
              :key="field.field_id"
              class="table-view-td"
              :class="sortedColumn.id === field.id ? 'sorted-column' : ''"
            >
              <slot :name="field.select_field" v-bind:item="item">
                <!-- eslint-disable-next-line vue/require-component-is -->
                <component v-bind="getField(item, field)" />
              </slot>
            </div>
          </div>

          <div v-if="showPanel && openPanels[item.id]" :key="`${item.id}-detail`" class="table-view-detail">
            <slot
              name="detail"
              :view.sync="view"
              :item.sync="item"
              :panelFields.sync="view.display_preferences.panel_fields"
              :getField="getField"
              :getAvailableFieldById="getAvailableFieldById"
            />
          </div>
        </div>
      </div>
      <div class="table-loader">
        <loader-icon v-if="isLoadingItems" />

        <infinite-loading
          v-else-if="!isLoadingItems && items.length && filterset"
          ref="infiniteLoading"
          :identifier="filterset.updated_at"
          :force-use-infinite-wrapper="tableInfiniteWrapper"
          @infinite="infiniteHandler"
        >
          <template #no-more>No more {{ tableInfiniteType }}</template>
          <template #no-results>No more {{ tableInfiniteType }}</template>
        </infinite-loading>

        <p v-else-if="!isLoadingItems && !items.length" class="mb-0">No {{ tableInfiniteType }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import InfiniteLoading from 'vue-infinite-loading'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { BButton, BTooltip } from 'bootstrap-vue'
import { differenceBy, uniqBy, isNil, isEmpty } from 'lodash'

import { EventBus } from '@/core/bus'
import { LoaderIcon } from '@/components/icons'
import {
  LeadScoreField,
  StringField,
  StringArrayField,
  CurrencyField,
  DurationField,
  DateField,
  DatetimeField,
  BooleanField,
  DecimalField,
  URLField
} from '@/components/fields'
import TablePreset from '@/components/tables/TablePreset.vue'
import TableFilter from '@/components/tables/TableFilter.vue'
import TableHumanFilter from '@/components/tables/TableHumanFilter.vue'
import TablePreferences from '@/components/tables/TablePreferences.vue'

export default {
  name: 'Table',
  components: {
    TablePreset,
    TableFilter,
    TableHumanFilter,
    TablePreferences,
    Multiselect,
    FontAwesomeIcon,
    BButton,
    InfiniteLoading,
    LoaderIcon,
    BTooltip,
    LeadScoreField, // eslint-disable-line vue/no-unused-components
    StringField, // eslint-disable-line vue/no-unused-components
    StringArrayField, // eslint-disable-line vue/no-unused-components
    CurrencyField, // eslint-disable-line vue/no-unused-components
    DurationField, // eslint-disable-line vue/no-unused-components
    DateField, // eslint-disable-line vue/no-unused-components
    DatetimeField, // eslint-disable-line vue/no-unused-components
    BooleanField, // eslint-disable-line vue/no-unused-components
    DecimalField, // eslint-disable-line vue/no-unused-components
    URLField // eslint-disable-line vue/no-unused-components
  },
  props: {
    getViews: {
      type: Function,
      required: true
    },
    updateView: {
      type: Function,
      required: true
    },
    createView: {
      type: Function,
      required: true
    },
    deleteView: {
      type: Function,
      required: true
    },
    getSearch: {
      type: Function,
      required: true
    },
    getInlineSearch: {
      type: Function,
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
    updateDisplayPreferences: {
      type: Function,
      required: true
    },
    getOperators: {
      type: Function,
      required: true
    },
    getAvailableFields: {
      type: Function,
      required: true
    },
    shareView: {
      type: Function,
      required: true
    },
    unshareView: {
      type: Function,
      required: true
    },
    tableRetrieve: {
      type: Function,
      required: true
    },
    tableBulkRetrieve: {
      type: Function,
      required: true
    },
    tableInlineRetrieve: {
      type: Function,
      required: true
    },
    tableInlineBulkRetrieve: {
      type: Function,
      required: true
    },
    getInlineCSVExport: {
      type: Function,
      required: true
    },
    getCSVExport: {
      type: Function,
      required: true
    },
    firstColumnId: {
      type: String
    },
    tableDetails: {
      type: Object,
      default: () => {}
    },
    tableInfiniteType: {
      type: String,
      default: 'items'
    },
    tableInfiniteWrapper: {
      type: String,
      default: '.content'
    },
    filterable: {
      type: Boolean,
      default: true
    },
    displayConfigurable: {
      type: Boolean,
      default: true
    },
    shareable: {
      type: Boolean,
      default: true
    },
    selectable: {
      type: Boolean,
      default: true
    },
    inlineMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      views: [],
      view: null,
      sortTypes: [
        { state: 'default', icon: 'sort' },
        { state: 'asc', icon: 'sort-amount-down-alt' },
        { state: 'desc', icon: 'sort-amount-up-alt' }
      ],
      sortedColumn: {
        id: '',
        sortedStateIndex: 0
      },
      new_order_columns: null,
      filtersets: [],
      filterset: null,
      operators: {},
      availableFields: [],
      showFilter: false,
      showPreferences: false,
      openPanels: {},
      lastDisplayPreferences: null,
      ctrlKey: false,
      shiftKey: false,
      selectedItems: {},
      previewMode: false,
      items: [],
      hasMoreItems: true,
      isLoadingItems: false,
      total: 0,
      limit: 10,
      page: 1,
      fields: {
        UUID: {
          default: {
            is: 'StringField'
          }
        },
        String: {
          default: {
            is: 'StringField'
          },
          Array: {
            is: 'StringArrayField'
          }
        },
        Number: {
          default: {
            is: 'StringField'
          }
        },
        Currency: {
          default: {
            is: 'CurrencyField'
          }
        },
        Duration: {
          default: {
            is: 'DurationField'
          }
        },
        Date: {
          default: {
            is: 'DateField'
          }
        },
        Datetime: {
          default: {
            is: 'DatetimeField'
          }
        },
        Boolean: {
          default: {
            is: 'BooleanField'
          }
        },
        Decimal: {
          default: {
            is: 'DecimalField'
          }
        },
        'dealflow.LeadScore': {
          default: {
            is: 'LeadScoreField',
            width: 30,
            height: 30,
            fontSize: 15
          }
        },
        'dealflow.QualificationChecklistScore': {
          default: {
            is: 'LeadScoreField',
            color: '#1971c2',
            width: 30,
            height: 30,
            fontSize: 15
          }
        },
        'dealflow.MBMScore': {
          default: {
            is: 'MBMScoreField',
            width: 30,
            height: 30,
            fontSize: 15
          }
        },
        'caravaggio.User': {
          default: {
            is: 'UserField'
          },
          Array: {
            is: 'UsersField'
          },
          ManyToMany: {
            is: 'UsersField'
          }
        },
        'card.Status': {
          default: {
            is: 'CardStatusField'
          }
        },
        'activity.Type': {
          default: {
            is: 'StringArrayField'
          }
        },
        URL: {
          default: {
            is: 'URLField'
          }
        },
        inline: {
          default: {
            is: 'StringField'
          }
        },
        facets: {
          default: {
            is: 'StringField'
          }
        },
        masters: {
          default: {
            is: 'StringField'
          }
        }
      }
    }
  },
  async mounted() {
    EventBus.$on('tableview::refresh', this.getItems)

    await this.getViews({ params: { order_by: 'name', limit: 1000 } }).then(data => {
      this.views = data.results
    })
    await this.getOperators().then(data => {
      this.operators = data
    })
  },
  destroyed() {
    EventBus.$off('tableview::refresh')
  },
  computed: {
    isOwner() {
      return false
    },
    showPanel() {
      return this.view && this.view.display_preferences.show_panel
    },
    isShared() {
      return this.view && this.view.shared_organizations.length
    },
    selectedList() {
      return this.items.filter(item => !isNil(this.selectedItems[item.id]))
    },
    columns() {
      if (!this.view) {
        return []
      }

      return this.view.display_preferences.table_columns.map(field => {
        return this.getAvailableFieldById(field.field_id)
      })
    },
    formattedTotal() {
      return new Intl.NumberFormat().format(this.total)
    },
    extraFields() {
      if (!this.lastDisplayPreferences) {
        return []
      }

      const lastTableColumns = this.lastDisplayPreferences.table_columns
      const lastPanelFields = this.lastDisplayPreferences.panel_fields
      const tableColumns = this.view.display_preferences.table_columns
      const panelFields = this.view.display_preferences.panel_fields

      const extraColumns = differenceBy(tableColumns, lastTableColumns, 'field_id')
      const extraPanelFields = differenceBy(panelFields, lastPanelFields, 'field_id')
      const extraFields = uniqBy([...extraColumns, ...extraPanelFields], 'field_id')

      return extraFields.map(item => item.field_id)
    }
  },
  methods: {
    isEmpty,
    isNil,
    onScroll(event) {
      this.$refs.thead.scrollLeft = event.target.scrollLeft
    },
    sortByColumn(id) {
      if (this.sortedColumn.id !== id) {
        this.sortedColumn.sortedStateIndex = 1
      } else {
        this.sortedColumn.sortedStateIndex++

        if (this.sortedColumn.sortedStateIndex >= 3) {
          this.sortedColumn.sortedStateIndex = 0
        }
      }

      if (this.sortTypes[this.sortedColumn.sortedStateIndex].state === 'default') {
        this.sortedColumn.id = ''
        this.new_order_columns = null
        this.previewMode = false
      } else {
        this.sortedColumn = {
          id: id,
          sortedStateIndex: this.sortedColumn.sortedStateIndex
        }
        this.new_order_columns = [{ field_id: id, direction: this.sortTypes[this.sortedColumn.sortedStateIndex].state }]
      }

      this.previewMode = true
      this.getItems(false, true, false)
    },
    togglePanel(item) {
      if (!this.showPanel) {
        return
      }

      this.$set(this.openPanels, item.id, !this.openPanels[item.id])
    },
    infiniteHandler(state) {
      if (!this.hasMoreItems) {
        return state.complete()
      }

      this.page += 1

      this.getItems(true).then(data => {
        if (data.next) {
          state.loaded()
        } else {
          state.complete()
        }
      })
    },
    getItems(appendResults = false, clearStates = false, clearSorting = false) {
      this.isLoadingItems = !appendResults

      if (clearStates) {
        this.openPanels = {}
        this.selectedItems = {}
        this.page = 1
      }

      if (clearSorting) {
        this.sortedColumn.id = ''
        this.new_order_columns = null
      }

      return this.getPaginatedItems().then(data => {
        this.hasMoreItems = Boolean(data.next)
        this.total = data.count
        this.isLoadingItems = false

        if (this.view.display_preferences.panel_expanded) {
          data.results.map(item => this.$set(this.openPanels, item.id, true))
        }

        if (appendResults) {
          this.items.push(...data.results)
        } else {
          this.items = data.results
        }

        return data
      })
    },
    getPaginatedItems() {
      let search

      if (this.previewMode || this.inlineMode) {
        const filterset = { ...this.filterset }

        if (this.new_order_columns) {
          filterset.order_columns = this.new_order_columns
        }

        search = this.getInlineSearch({
          data: {
            filter: filterset,
            fields_id: this.extraFields
          },
          params: {
            page: this.page,
            limit: this.limit
          }
        })
      } else {
        search = this.getSearch({
          filterset: this.filterset && this.filterset.id,
          params: {
            page: this.page,
            limit: this.limit,
            fields_id: this.extraFields.join(',') || undefined
          }
        })
      }

      return search
    },
    getAvailableFieldById(field_id) {
      const fields = this.availableFields.map(group => group.items).flat()
      return fields.find(field => field.id === field_id)
    },
    getField(item, field) {
      const value = item[field.select_field]

      const choices = field.choices
      const type = field.stereotype || field.array_type || (choices && choices.type) || field.type
      const isArrayLike = ['Array', 'ManyToMany'].includes(field.type)

      const components = { ...this.fields[type] }
      const component = isArrayLike ? components[field.type] : components.default
      const isURL = field.stereotype === 'URL'

      if (choices) {
        if (choices.type === 'inline') {
          const choice = choices.value.find(choice => choice.id == value)
          component.value = choice && choice.label

          return component
        }

        if (choices.type === 'masters') {
          component.choice = choices
        }
      }

      if (isURL) {
        component.iconClass = field.label_icon_class
        component.image = field.is_image
        component.imageWidth = field.image_width
        component.imageHeight = field.image_height
      }

      component.value = value
      return component
    },
    onViewSelected(view) {
      this.getAvailableFields({ id: view.id }).then(data => {
        this.availableFields = data.groups_of_fields
        this.view = view

        if (this.lastDisplayPreferences) {
          const lastView = this.views.find(item => item.id === this.lastDisplayPreferences.tableview)
          lastView.display_preferences = this.lastDisplayPreferences

          this.lastDisplayPreferences = null
        }
      })
    },
    onAppliedPreferences(displayPreferences) {
      if (!this.lastDisplayPreferences) {
        this.lastDisplayPreferences = { ...this.view.display_preferences }
      }

      this.$set(this.view, 'display_preferences', displayPreferences)

      let retrieveMethod
      const ids = this.items.map(item => item.id)

      if (this.previewMode || this.inlineMode) {
        retrieveMethod = this.tableInlineBulkRetrieve({
          data: { filter: this.filterset, items_id: ids, fields_id: this.extraFields },
          params: { limit: this.items.length }
        })
      } else {
        retrieveMethod = this.tableBulkRetrieve({
          filtersetId: this.filterset.id,
          data: { items_id: ids, fields_id: this.extraFields },
          params: { limit: this.items.length }
        })
      }

      retrieveMethod.then(({ results }) => {
        this.items = results
      })
    },
    onViewChanged(view) {
      this.lastDisplayPreferences = null
      this.view = view
    },
    onFiltersetsLoad(filtersets) {
      this.filtersets = filtersets
    },
    onFiltersetSelect(filterset) {
      this.previewMode = false
      this.filterset = filterset

      EventBus.$emit('tableview::filterset::change', this.filterset)

      this.getItems(false, true, true)
    },
    onFiltersetChange(filterset) {
      this.previewMode = false
      this.filterset = filterset

      this.getItems(false, true, true)
    },
    onFiltersetPreview(filterset) {
      this.previewMode = true
      this.filterset = filterset

      this.getItems(false, true, true).then(() => {
        if (this.$refs.infiniteLoading) {
          this.$refs.infiniteLoading.stateChanger.reset()
        }
      })
    }
  },
  watch: {
    isLoadingItems() {
      if (!this.isLoadingItems) {
        this.$nextTick(() => {
          this.$refs.thead.scrollLeft = this.$refs.tbody.scrollLeft
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.table-view {
  background-color: $white;
  border-radius: 3px 3px 0px 0px;
  box-shadow: 0px 3px 6px $box-shadow;
  margin-bottom: 0;

  .table-header {
    display: flex;
    flex-flow: column wrap;
    padding: 1.5rem;
    box-shadow: 0px 3px 6px $box-shadow;

    .table-details {
      display: flex;
      flex-flow: row wrap;
      justify-content: space-between;
    }

    .table-inputs {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      margin-top: 1rem;

      .preset-input {
        flex: 0 0 auto;
      }

      .table-human-filter {
        flex: 1 1 auto;
        text-align: right;
        margin: 0 0.5rem;
        justify-content: flex-end;
      }

      .table-actions {
        flex: 0 0 auto;
        margin-left: auto;

        button {
          width: 48px;
          height: 48px;

          &:not(:last-child) {
            margin-right: 1rem;
          }
        }

        .custom-outline-dark {
          border: 2px solid $dark;
          background-color: white;
          padding: 0 0.75rem;

          &:hover {
            background-color: $dark;

            * {
              color: $white !important;
            }
          }

          &.active {
            border: 2px solid $primary;
            background-color: $primary;
          }
        }

        .custom-outline-primary {
          border: 2px solid $primary;

          * {
            color: $primary !important;
          }

          &:hover {
            * {
              color: $white !important;
            }
          }
        }
      }
    }
  }

  .table-caption {
    padding: 1rem;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    align-content: flex-start;
    justify-content: space-between;
    .preset-selector {
      align-self: flex-end;
      width: 18.75rem;
      max-width: 18.75rem;
    }
    #caption_title {
      align-self: flex-start;
    }
  }

  .table-view-component {
    display: flex;
    flex-flow: column;
    font-size: 14px;

    .table-view-thead {
      overflow: hidden;
      display: flex;
      flex-flow: column;
      background-color: $tertiary;
      color: $white;

      @include sticky(0, $z-index: 10);

      .sorted-header {
        background-color: $light;
        color: $tertiary;
      }

      .table-view-tr {
        display: flex;
        flex-flow: row;
        min-width: 100%;

        .table-view-th {
          &:first-child {
            flex: 1 0 250px;
            width: 250px;
            background-color: $tertiary;

            @include sticky($left: 0, $z-index: 101);
          }

          border-top: 1px solid $gray-light;
          flex: 1 0 200px;
          width: 200px;
          display: flex;
          align-items: center;
          padding: 1rem 0.5rem;
          font-weight: bold;

          .sort-icon {
            opacity: 0.5;
            cursor: pointer;
          }
          .sorted-icon {
            cursor: pointer;
          }
        }
      }
    }

    .table-view-tbody {
      overflow: auto;
      display: flex;
      flex-flow: column;

      &.ctrl-key {
        .table-view-tr {
          cursor: pointer;
        }
      }

      &.shift-key {
        user-select: none;

        .table-view-tr {
          cursor: pointer;
        }
      }

      .table-view-tr {
        width: fit-content;
        min-width: 100%;
        display: flex;
        flex-flow: column;
        padding: 0;

        &.selected {
          background-color: #e7f0f9;

          .table-view-row {
            .table-view-td:first-child {
              border-left: 4px solid $primary;
            }
          }

          .table-view-detail {
            border-left: 4px solid $primary;
            background-color: $quinary;
          }

          .sorted-column {
            background-color: $quinary;
          }
        }

        .sorted-column {
          background-color: $light;
        }

        .table-view-row {
          display: flex;
          flex-flow: row;

          .table-view-td {
            &:first-child {
              flex: 1 0 250px;
              width: 250px;
              background-color: $white;

              @include sticky($left: 0);
            }

            border-top: 1px solid $gray-light;
            border-right: 1px solid $gray-light;
            flex: 1 0 200px;
            width: 200px;
            display: flex;
            align-items: center;
            padding: 0.5rem;
          }
        }

        .table-view-detail {
          border-top: 1px solid $gray-light;
          border-right: 1px solid $gray-light;
          background-color: $light;
        }
      }

      .panel-open {
        background-color: $light;
      }
    }
  }

  .table-loader {
    text-align: center;
    padding: 1rem;
  }

  .table-bulk {
    position: fixed;
    right: 0;
    bottom: 0;
    height: 80px;
    width: calc(100% - 180px);
    box-shadow: 0px -3px 6px $box-shadow;
    transition: width 0.2s ease;

    .table-counter-wrapper {
      display: flex;
      justify-content: center;
      position: relative;
      z-index: -1;
    }

    .table-counter-container {
      position: absolute;
      top: -24px;
      width: 64px;
      height: 64px;
      background-color: $white;
      border-radius: 50%;
      box-shadow: 0px -3px 6px $box-shadow;
    }

    .table-bulk-actions {
      display: flex;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background-color: $white;
      z-index: 1;

      .bulk-menu {
        flex: 0 0 33.333%;
      }

      .bulk-counter {
        flex: 0 0 33.333%;
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;
        position: relative;

        .counter {
          position: absolute;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 52px;
          width: 52px;
          background-color: $secondary;
          color: $white;
          font-weight: 600;
          font-family: Poppins, sans-serif;
          font-size: 1.125rem;
          border-radius: 50%;
          transform: translateY(-32px);
        }

        .counter-total {
          margin-top: 22px;
        }
      }

      .bulk-select-actions {
        flex: 0 0 33.333%;
        text-align: right;

        button:not(:last-child) {
          margin-right: 1rem;
        }
      }
    }
  }
}

.dashboard-container {
  &.collapsed {
    .table-view {
      .table-bulk {
        width: calc(100% - 80px);
      }

      .panel-open {
        background-color: $light;
      }
    }
  }
}
</style>
