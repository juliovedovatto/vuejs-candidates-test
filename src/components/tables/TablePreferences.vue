<template>
  <div class="table-preferences">
    <b-modal id="tablePreferences" v-model="show" size="xl" @hidden="onHidden">
      <template #modal-title>
        <div class="title"><h3>View Settings</h3></div>
      </template>

      <b-tabs v-model="activeTab" content-class="tabs mt-2" card>
        <b-tab
          v-for="tab in tabs"
          :key="tab.title"
          :title="tab.title"
          :active="tab.active"
          :disabled="tab.disabled"
          @click="onChangeTab(tab)"
          no-body
        >
          <template #title>
            <strong>
              <span>{{ tab.title }}</span>
            </strong>
          </template>
        </b-tab>

        <div v-if="activeTab === 0" class="tab-content">
          <div v-if="isLoading" class="d-flex justify-content-center">
            <loader-icon />
          </div>

          <transition name="fade">
            <div>
              <p>
                Select and reorder what fields should be displayed in the Table Columns by dragging and dropping the
                fields below.
              </p>

              <div class="row">
                <div class="column-card col-sm-6">
                  <ul class="nav nav-tabs mb-2">
                    <li class="nav-item selected-fields-tab">
                      <a class="nav-link active">Selected Fields</a>
                    </li>
                  </ul>

                  <div class="draggable-section-left">
                    <draggable
                      v-model="tableColumns"
                      :group="{ name: 'tableColumns', pull: false, put: true }"
                      :key="tableColumns.length"
                      :emptyInsertThreshold="500"
                      ghostClass="ghost"
                    >
                      <transition-group type="transition" name="flip-list">
                        <div
                          class="card selected-fields"
                          v-for="(element, index) in tableColumns"
                          :key="`${element.field_id}-selectedTableColumn`"
                        >
                          <div class="card-body">
                            <div class="field-first-row">
                              <p class="field-title">
                                <strong>{{ element.label }}</strong>
                              </p>
                              <p class="field-group">{{ element.group_name | uppercaseFilter }}</p>
                            </div>

                            <div class="field-second-row">
                              <p
                                :id="`${element.field_id}-readmore`"
                                :class="{ 'cursor-pointer': isTruncated(element.example) }"
                                class="field-example"
                              >
                                {{ readMore(element.example) }}
                              </p>

                              <b-tooltip
                                placement="bottom"
                                v-if="isTruncated(element.example)"
                                :target="`${element.field_id}-readmore`"
                              >
                                <p class="text-left text-white mb-0">{{ element.example }}</p>
                              </b-tooltip>
                              <p class="field-remove" @click="removeSelectedTableColumn(index)">- Remove</p>
                            </div>
                          </div>
                        </div>
                      </transition-group>
                    </draggable>
                  </div>
                </div>

                <div class="column-card col-sm-6">
                  <ul class="nav nav-tabs">
                    <li class="nav-item available-fields-tab">
                      <a class="nav-link active" href="#">Available Fields</a>
                    </li>
                    <li class="nav-item disabled-tab">
                      <a class="nav-link disabled" href="#">Properties</a>
                    </li>
                    <li class="nav-item disabled-tab">
                      <a class="nav-link disabled" href="#">Style</a>
                    </li>
                  </ul>

                  <div class="mb-2">
                    <multiselect
                      v-model="columnGroups"
                      :options="availableColumnGroups"
                      v-bind="categorySelector"
                      placeholder="Select Category"
                      class="multiselect__lg field-selector"
                    ></multiselect>
                  </div>

                  <div class="draggable-section-right">
                    <draggable
                      tag="div"
                      v-model="availableColumnFields"
                      :sort="false"
                      :group="{ name: 'tableColumns', pull: 'clone', put: false }"
                      :key="availableColumnFields.length"
                      draggable=".draggable"
                      ghostClass="ghost"
                      class="list-group"
                    >
                      <transition-group name="no" class="list-group" tag="ul">
                        <div
                          class="card available-fields"
                          v-for="element in availableColumnFields"
                          :key="`${element.field_id}-availableTableColumn`"
                          :id="`${element.field_id}-availableTableColumn`"
                          :class="element.used === true ? 'ghost' : 'draggable'"
                        >
                          <div class="card-body">
                            <div class="field-first-row">
                              <p class="field-title">
                                <strong>{{ element.label }}</strong>
                              </p>
                              <p class="field-group">{{ element.group_name | uppercaseFilter }}</p>
                            </div>

                            <div class="field-second-row">
                              <p
                                :id="`${element.field_id}-readmore`"
                                class="field-example"
                                :class="{ 'cursor-pointer': isTruncated(element.description) }"
                              >
                                {{ readMore(element.description) }}
                              </p>

                              <b-tooltip
                                v-if="isTruncated(element.description)"
                                :target="`${element.field_id}-readmore`"
                                placement="bottom"
                              >
                                <p class="text-left text-white mb-0">{{ element.description }}</p>
                              </b-tooltip>

                              <p
                                :disabled="element.used"
                                :class="element.used === true ? 'field-add-disabled' : 'field-add'"
                                @click="addAvailableTableColumn(element)"
                              >
                                + Add
                              </p>
                            </div>
                          </div>
                        </div>
                      </transition-group>
                    </draggable>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <div v-if="activeTab === 1" class="tab-content">
          <div v-if="isLoading" class="d-flex justify-content-center">
            <loader-icon />
          </div>

          <transition name="fade">
            <div>
              <form>
                <div class="form-group">
                  <div class="form-check mb-2">
                    <input type="checkbox" class="form-check-input" id="expanded-panel" v-model="showPanels" />
                    <label class="form-check-label" for="expanded-panel">Enable company expanded panel</label>
                  </div>

                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="defaultShowPanels"
                      id="defaultShowPanels1"
                      :value="true"
                      v-model="panelsExpanded"
                      :disabled="!showPanels"
                    />
                    <label class="form-check-label" for="defaultShowPanels1">Show all panels expanded by default</label>
                  </div>

                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="defaultShowPanels"
                      id="defaultShowPanels2"
                      :value="false"
                      v-model="panelsExpanded"
                      :disabled="!showPanels"
                    />
                    <label class="form-check-label" for="defaultShowPanels2"
                      >Show all panels collapsed by default</label
                    >
                  </div>
                </div>
              </form>

              <transition name="fade">
                <div>
                  <p>
                    Select and reorder what fields should be displayed in the Expanded Panel by dragging and dropping
                    the fields below.
                  </p>

                  <div class="row">
                    <div class="column-card col-sm-6">
                      <ul class="nav nav-tabs mb-2">
                        <li class="nav-item selected-fields-tab">
                          <a class="nav-link active">Selected Fields</a>
                        </li>
                      </ul>

                      <div class="draggable-section-left">
                        <draggable
                          v-model="panelFields"
                          :key="panelFields.length"
                          :group="{ name: 'panelFields', pull: false, put: true }"
                          :emptyInsertThreshold="500"
                          ghostClass="ghost"
                        >
                          <transition-group type="transition" name="flip-list">
                            <div
                              class="card selected-fields"
                              v-for="(element, index) in panelFields"
                              :key="`${element.field_id}-selectedPanelField`"
                              :id="`${element.field_id}-availablePanelField`"
                              :used="element.used"
                            >
                              <div class="card-body">
                                <div class="field-first-row">
                                  <p class="field-title">
                                    <strong>{{ element.label }}</strong>
                                  </p>
                                  <p class="field-group">{{ element.group_name | uppercaseFilter }}</p>
                                </div>

                                <div class="field-second-row">
                                  <p
                                    :id="`${element.field_id}-readmore`"
                                    class="field-example"
                                    :class="{ 'cursor-pointer': isTruncated(element.example) }"
                                  >
                                    {{ readMore(element.example) }}
                                  </p>

                                  <b-tooltip
                                    placement="bottom"
                                    v-if="isTruncated(element.example)"
                                    :target="`${element.field_id}-readmore`"
                                  >
                                    <p class="text-left text-white mb-0">{{ element.example }}</p>
                                  </b-tooltip>
                                  <p class="field-remove" @click="removeSelectedPanelField(index)">
                                    - Remove
                                  </p>
                                </div>
                              </div>
                            </div>
                          </transition-group>
                        </draggable>
                      </div>
                    </div>

                    <div class="column-card col-sm-6">
                      <ul class="nav nav-tabs">
                        <li class="nav-item available-fields-tab">
                          <a class="nav-link active" href="#">Available Fields</a>
                        </li>
                        <li class="nav-item disabled-tab">
                          <a class="nav-link disabled" href="#">Properties</a>
                        </li>
                        <li class="nav-item disabled-tab">
                          <a class="nav-link disabled" href="#">Style</a>
                        </li>
                      </ul>

                      <div class="mb-2">
                        <multiselect
                          placeholder="Select Category"
                          v-model="panelGroups"
                          v-bind="categorySelector"
                          :options="availablePanelGroups"
                          class="multiselect__lg field-selector"
                        ></multiselect>
                      </div>

                      <div class="draggable-section-right">
                        <draggable
                          tag="div"
                          v-model="availablePanelFields"
                          :key="availablePanelFields.length"
                          :sort="false"
                          :group="{ name: 'panelFields', pull: 'clone', put: false }"
                          ghostClass="ghost"
                          draggable=".draggable"
                          class="list-group"
                        >
                          <transition-group name="no" class="list-group" tag="ul">
                            <div
                              class="card available-fields"
                              v-for="element in availablePanelFields"
                              :key="`${element.field_id}-availablePanelField`"
                              :id="`${element.field_id}-availablePanelField`"
                              :used="element.used"
                              :class="element.used === true ? 'ghost' : 'draggable'"
                            >
                              <div class="card-body">
                                <div class="field-first-row">
                                  <p class="field-title">
                                    <strong>{{ element.label }}</strong>
                                  </p>
                                  <p class="field-group">{{ element.group_name | uppercaseFilter }}</p>
                                </div>

                                <div class="field-second-row">
                                  <p
                                    :id="`${element.field_id}-readmorepanel`"
                                    class="field-example"
                                    :class="{ 'cursor-pointer': isTruncated(element.description) }"
                                  >
                                    {{ readMore(element.description) }}
                                  </p>

                                  <b-tooltip
                                    placement="bottom"
                                    v-if="isTruncated(element.description)"
                                    :target="`${element.field_id}-readmorepanel`"
                                  >
                                    <p class="text-left text-white mb-0">{{ element.description }}</p>
                                  </b-tooltip>
                                  <p
                                    :disabled="element.used"
                                    :class="element.used === true ? 'field-add-disabled' : 'field-add'"
                                    @click="addAvailablePanelField(element)"
                                  >
                                    + Add
                                  </p>
                                </div>
                              </div>
                            </div>
                          </transition-group>
                        </draggable>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </transition>
        </div>
      </b-tabs>

      <template #modal-footer>
        <div class="modal-footer-content pb-2">
          <b-button size="sm" class="button-apply float-right" @click.prevent="onApplyPreferences()">
            Apply
          </b-button>

          <b-button
            variant="primary"
            size="sm"
            class="button-cancel float-right mr-3"
            @click.prevent="cancelPreferences()"
          >
            <strong>Cancel</strong>
          </b-button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import Multiselect from 'vue-multiselect'
import { BTabs, BTab, BButton, BTooltip } from 'bootstrap-vue'
import { truncate } from '@/core/string'
import { chain } from 'lodash'

import { LoaderIcon } from '@/components/icons'

export default {
  name: 'TablePreferences',
  components: {
    BTabs,
    BTab,
    BButton,
    BTooltip,
    draggable,
    LoaderIcon,
    Multiselect
  },
  props: {
    availableFields: {
      type: Array,
      required: true
    },
    view: {
      type: Object,
      required: true
    },
    updateDisplayPreferences: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      isLoading: false,
      show: true,
      tabs: [
        {
          title: 'Table Columns',
          index: 0,
          active: true,
          disabled: false
        },
        {
          title: 'Expanded Panel',
          index: 1,
          active: false,
          disabled: false
        }
      ],
      activeTab: 0,
      tableColumns: [],
      panelFields: [],
      columnGroups: [],
      panelGroups: [],
      showPanels: true,
      panelsExpanded: false,
      categorySelector: {
        multiple: true,
        taggable: true,
        openDirection: 'bottom'
      }
    }
  },
  computed: {
    availableColumnGroups() {
      if (!this.availableFields) {
        return []
      }

      return chain(this.availableFields)
        .filter(group => group.items.some(item => item.display_column))
        .orderBy('group_name', 'asc')
        .map(group => group.group_name)
        .value()
    },
    availablePanelGroups() {
      if (!this.availableFields) {
        return []
      }

      return chain(this.availableFields)
        .filter(group => group.items.some(item => item.display_panel))
        .orderBy('group_name', 'asc')
        .map(group => group.group_name)
        .value()
    },
    availableColumnFields() {
      if (!this.availableFields) {
        return []
      }

      return chain(this.availableFields)
        .filter(group => {
          if (!this.columnGroups.length) {
            return true
          }

          return this.columnGroups.includes(group.group_name)
        })
        .reduce((reducer, group) => {
          const fields = chain(group.items)
            .filter(item => item.display_column)
            .orderBy('label', 'asc')
            .map(item => {
              return {
                field_id: item.id,
                description: item.description,
                example: item.example,
                group_name: group.group_name,
                label: item.label,
                type: item.type,
                used: Boolean(this.tableColumns.find(field => field.field_id === item.id)),
                field_properties: {
                  display_format: item.display_format
                },
                field_style: {
                  image_width: item.image_width,
                  image_height: item.image_height
                }
              }
            })
            .value()

          reducer.push(...fields)
          return reducer
        }, [])
        .value()
    },
    availablePanelFields() {
      if (!this.availableFields) {
        return []
      }

      return chain(this.availableFields)
        .filter(group => {
          if (!this.panelGroups.length) {
            return true
          }

          return this.panelGroups.includes(group.group_name)
        })
        .reduce((reducer, group) => {
          const fields = chain(group.items)
            .filter(item => item.display_panel)
            .orderBy('label', 'asc')
            .map(item => {
              return {
                field_id: item.id,
                description: item.description,
                example: item.example,
                group_name: group.group_name,
                label: item.label,
                used: Boolean(this.panelFields.find(field => field.field_id === item.id)),
                field_properties: {
                  display_format: item.display_format
                },
                field_style: {
                  image_width: item.image_width,
                  image_height: item.image_height
                }
              }
            })
            .value()

          reducer.push(...fields)
          return reducer
        }, [])
        .value()
    }
  },
  mounted() {
    const preferences = { ...this.view.display_preferences }

    this.tableColumns = [...this.enrichFields(preferences.table_columns)]
    this.panelFields = [...this.enrichFields(preferences.panel_fields)]
    this.showPanels = this.view.display_preferences.show_panel
    this.panelsExpanded = this.view.display_preferences.panel_expanded
  },
  methods: {
    onChangeTab(tab) {
      if (tab.index === 0) {
        return (this.activeTab = 0)
      } else if (tab.index === 1) {
        return (this.activeTab = 1)
      }
    },
    getAvailableFieldById(field_id) {
      const fields = this.availableFields
        .map(group => {
          return group.items.map(item => ({ ...item, group_name: group.group_name }))
        })
        .flat()

      return fields.find(field => field.id === field_id)
    },
    enrichFields(fields) {
      return fields.map(field => {
        const availableField = this.getAvailableFieldById(field.field_id)

        return {
          field_id: availableField.id,
          description: availableField.description,
          example: availableField.example,
          group_name: availableField.group_name,
          label: availableField.label,
          field_properties: {
            display_format: availableField.display_format
          },
          field_style: {
            image_width: availableField.image_width,
            image_height: availableField.image_height
          }
        }
      })
    },
    addAvailableTableColumn(element) {
      this.tableColumns.push(element)
    },
    removeSelectedTableColumn(index) {
      this.tableColumns.splice(index, 1)
    },
    addAvailablePanelField(element) {
      this.panelFields.push(element)
    },
    removeSelectedPanelField(index) {
      this.panelFields.splice(index, 1)
    },
    readMore(text) {
      return truncate(text, 50, '...', '')
    },
    isTruncated(text) {
      return text.length > 50
    },
    onApplyPreferences() {
      if (!this.view) {
        return this.$bvModal.hide('tablePreferences')
      }

      const displayPreferences = { ...this.view.display_preferences }
      displayPreferences.table_columns = this.tableColumns.map((item, order) => ({ ...item, order }))
      displayPreferences.panel_fields = this.panelFields.map((item, order) => ({ ...item, order }))
      displayPreferences.panel_expanded = this.panelsExpanded
      displayPreferences.show_panel = this.showPanels

      this.$emit('applied-preferences', displayPreferences)
      this.$bvModal.hide('tablePreferences')
    },
    cancelPreferences() {
      this.$bvModal.hide('tablePreferences')
    },
    onHidden() {
      this.$emit('on-hidden')
    }
  },
  filters: {
    uppercaseFilter(value) {
      if (!value) return ''

      value = value.toString()
      return value.toUpperCase()
    }
  }
}
</script>

<style lang="scss">
.modal-content {
  display: flex;

  h3 {
    font-weight: bold;
    color: $primary;
    padding: 1.5rem 0 0 1.5rem;
  }

  .card-header {
    background-color: $white;
    border: none;
    &:hover {
      border: none;
    }
    .nav {
      font-size: 1rem;
      color: $primary;
      .nav-link {
        text-decoration: none;
        border: none;
        color: $gray;
        span {
          &:hover {
            border-bottom: 2px solid $primary;
          }
        }
      }
      .active {
        margin: 0;
        span {
          color: $primary;
          border-bottom: 2px solid $primary;
        }
      }
    }
  }
  .tab-content {
    padding: 0.25rem 0 0 0.8rem;
    .column-card {
      height: 375px;
      .draggable-section-left {
        max-height: 300px;
        overflow: visible;
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 1rem;
        &::-webkit-scrollbar {
          width: 4px;
          border-radius: 100px;
        }
        &::-webkit-scrollbar-track {
          background: $gray-scrollbar-track;
        }
        &::-webkit-scrollbar-thumb {
          background: $gray-light;
        }
      }
      .draggable-section-right {
        max-height: 250px;
        overflow: visible;
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 1rem;
        &::-webkit-scrollbar {
          width: 4px;
          border-radius: 100px;
        }
        &::-webkit-scrollbar-track {
          background: $gray-scrollbar-track;
        }
        &::-webkit-scrollbar-thumb {
          background: $gray-light;
        }
      }
      .nav-tabs {
        border-bottom: 2px solid $light;
        color: $dark;
        margin-bottom: 10px;
        .nav-item {
          .nav-link {
            border: none;
          }
        }
        .selected-fields-tab {
          .active {
            color: $primary;
            font-size: 1rem;
            border-bottom: 1px solid $light !important;
          }
        }
        .available-fields-tab {
          .active {
            background-color: $light !important;
            color: $dark !important;
          }
        }
        .disabled-tab {
          .disabled {
            color: $dark !important;
          }
        }
      }
      .field-selector {
        width: calc(100% - 20px);
      }
      .card {
        height: 4.875rem;
        margin-bottom: 0.5rem;
        box-shadow: 0px 3px 6px $box-shadow;
        .card-body {
          .field-first-row {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: baseline;
            margin-top: -8px;
            .field-title {
              align-self: flex-start;
            }
            .field-group {
              align-self: flex-end;
              background: $light;
              padding: 0.25rem 0.5rem;
              font-size: 0.7rem !important;
            }
          }
          .field-second-row {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: baseline;
            margin-top: -8px;
            .field-example {
              align-self: flex-start;
            }
            .field-remove {
              color: $danger !important;
              align-self: flex-end;
              &:hover {
                cursor: pointer;
              }
            }
            .field-add {
              color: $success !important;
              &:hover {
                cursor: pointer;
              }
            }
            .field-add-disabled {
              color: $success !important;
            }
          }
        }
      }
      .selected-fields {
        border-left: 4px solid $primary;
      }
      .available-fields {
        border-left: 4px solid $gray-light;
      }
      .flip-list-move {
        transition: transform 0.5s;
      }
      .no-move {
        transition: transform 0s;
      }
      .list-group-item {
        cursor: move;
      }
      .list-group-item i {
        cursor: pointer;
      }
      .ghost {
        opacity: 0.5;
        background: $light;
      }
      .sortable-fallback {
        opacity: 0;
      }
    }
  }
  .modal-footer {
    border: none;
    .modal-footer-content {
      width: 95%;
      margin: auto;
      border-top: 1px solid $light;
      padding: 1.5rem 0 0 1.5rem;
    }
    .button-apply {
      width: 106px;
      height: 48px;
      font-size: 16px;
      font-weight: bold;
      background-color: $primary;
    }
    .button-cancel {
      width: 106px;
      height: 48px;
      font-size: 16px;
      background-color: $white;
      color: $dark;
      border: 2px solid $dark;
    }
  }
}
</style>
