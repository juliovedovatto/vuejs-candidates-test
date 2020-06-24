<template>
  <div class="view-preset">
    <div class="presets-selector">
      <b-dropdown ref="dropdown" variant="outline-dark" size="lg" block @hide="onHide" @keydown.esc="ignoreEscape">
        <template #button-content>
          <span class="presets-button-content" @click="setTableViewMenuItemSelected">
            {{ view && view.name }} {{ isOwner && changed ? '*' : '' }}
          </span>
        </template>

        <b-dropdown-form>
          <div class="presets-container">
            <div class="presets">
              <button
                v-if="systemViews.length"
                :class="tableViewMenuItemSelected === 'systemViews' ? 'preset-selected-background' : ''"
                class="btn preset"
                @click.prevent="tableViewMenuItemSelected = 'systemViews'"
              >
                <strong class="preset-title">System Views ({{ systemViews.length }})</strong>
                <div class="icon" v-if="tableViewMenuItemSelected === 'systemViews'">
                  <font-awesome-icon icon="angle-right" />
                </div>
              </button>
            </div>

            <div class="preset-items" v-if="tableViewMenuItemSelected === 'systemViews'">
              <div class="preset-item" v-for="view in systemViews" :key="view.id">
                <button class="btn preset-item-title" @click.prevent="onSelectView(view)">
                  <truncate>
                    <span :class="view.id == currentViewName.id ? 'current-view' : ''">{{ view.name }}</span>
                  </truncate>
                </button>
              </div>
            </div>
          </div>
        </b-dropdown-form>
      </b-dropdown>
    </div>
  </div>
</template>

<script>
import { BDropdown, BDropdownForm } from 'bootstrap-vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { chain } from 'lodash'
import { DateTime } from 'luxon'

import { Truncate } from '@/components/readmore'

export default {
  name: 'TablePreset',
  components: {
    BDropdown,
    BDropdownForm,
    FontAwesomeIcon,
    Truncate
  },
  props: {
    views: {
      type: Array,
      default: () => []
    },
    view: {
      type: Object
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
    createFilterset: {
      type: Function,
      required: true
    },
    updateDisplayPreferences: {
      type: Function,
      required: true
    },
    tableDetails: {
      type: Object,
      default: () => {}
    },
    inlineMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tableViewMenuItemSelected: '',
      currentViewName: {},
      changed: false
    }
  },
  computed: {
    isOwner() {
      return false
    },
    systemViews() {
      return this.views.filter(view => view.is_system)
    }
  },
  mounted() {
    this.currentViewName = { ...this.view }
  },
  methods: {
    setTableViewMenuItemSelected() {
      if (this.view && this.view.is_system) {
        this.tableViewMenuItemSelected = 'systemViews'
      } else if (this.isOwner) {
        this.tableViewMenuItemSelected = 'myViews'
      } else {
        this.tableViewMenuItemSelected = 'sharedViews'
      }
      this.currentViewName = { ...this.view }
    },
    onSelectView(view) {
      if (view.id !== this.view.id) {
        this.$emit('on-view-selected', view)
      }

      this.changed = false
      this.$refs.dropdown.hide(true)
    },
    ignoreEscape() {
      this.$refs.dropdown.show()
    },
    onHide() {
      this.setTableViewMenuItemSelected()
    }
  },
  watch: {
    views: {
      immediate: true,
      handler() {
        if (!this.view && this.views.length) {
          const views = chain(this.views)
            .orderBy(view => DateTime.fromISO(view.updated_at), ['desc'])
            .value()

          const view = views.find(view => view.is_system && view.name === 'Default')
          this.$emit('on-view-selected', view)
        }
      }
    },
    'view.display_preferences': {
      handler(newValue, oldValue) {
        if (oldValue && newValue.updated === oldValue.updated) {
          this.changed = true
        }
      }
    },
    view: {
      handler() {
        this.changed = false
        this.setTableViewMenuItemSelected()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.view-preset {
  display: flex;
  flex-flow: row nowrap;

  .presets-selector {
    width: 18.75rem;
    margin-right: 1rem;

    .presets-button-content {
      display: inline-block;
      width: calc(100% - 0.7em);
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      line-height: 1.25rem;
      text-overflow: ellipsis;
    }

    .presets-container {
      display: flex;
      flex-flow: row nowrap;
      width: 44.313rem;
      height: 26.188rem;

      .presets {
        display: flex;
        flex-flow: column nowrap;
        margin-right: 2rem;

        .preset {
          color: $dark;
          padding-left: 0;
          text-align: left;
          cursor: pointer;
          width: 11.875rem;
          height: 2.188rem;
          display: flex;
          flex-flow: row nowrap;
          align-items: center;
          padding-left: 1rem;

          .preset-title {
            flex: 1 0 auto;
          }
          .icon {
            flex: 0 1 auto;
          }
        }

        .preset-selected-background {
          background-color: $light;
          border-radius: 0.25rem;
        }
      }

      .preset-items {
        display: flex;
        flex-flow: column nowrap;
        overflow-y: auto;
        overflow-x: hidden;
        width: 100%;
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
        .preset-item {
          width: 100%;
          display: flex;
          flex-flow: row nowrap;
          align-items: center;

          .user-avatar {
            height: 1.563rem;
            width: 1.563rem;
            box-shadow: 0 0.063rem 0.188rem $box-shadow;
            border-radius: 100%;
            border: 0.125rem solid $white;
            color: $gray-light;
            margin-left: 1rem;
          }

          .preset-item-title {
            flex: 1 1 auto;
            text-align: left;
            color: $dark;
            min-width: 0;
          }

          .current-view {
            min-width: 0;
            color: $primary;
          }

          .preset-item-crud {
            flex: 0 0 auto;
            margin-right: 1.5rem;
            .crud-rename {
              cursor: pointer;
              margin-right: 1rem;
              opacity: 0.3;
              &:hover {
                opacity: 1;
              }
            }
            .crud-icon {
              cursor: pointer;
              margin-right: 0.5rem;
              opacity: 0.3;
              &:hover {
                opacity: 1;
              }
            }
          }

          .preset-item-inline {
            margin-left: 0.75rem;
            margin-right: 1.5rem;
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            input {
              border-right: none !important;
              box-shadow: none !important;
            }
            .edit-ok {
              border-left: none;
              border-color: #a9a9a9;
              color: green;
              &:hover {
                background-color: $white;
              }
            }

            .preset-item-inline-input {
              font-size: 1rem;
              color: $dark;
            }

            .preset-item-inline-icon {
              font-size: 1rem;
              float: right;
              margin-left: -1.563rem;
              color: $success;
              cursor: pointer;
            }
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
.btn:focus,
.btn:active {
  outline: none !important;
  box-shadow: none !important;
}
.view-preset {
  padding: 1rem;
  .presets-selector {
    .dropdown {
      .dropdown-toggle {
        border-color: $gray;
      }

      .dropdown-menu {
        padding: 0;

        .b-dropdown-form {
          padding: 1.25rem;
        }
      }
    }
  }

  .preset-actions {
    .dropdown {
      &.disabled-button {
        button:not(.dropdown-toggle) {
          opacity: 0.5;
          pointer-events: none;
        }
      }
    }

    .btn-outline-dark {
      border-width: 0.125rem;
    }
  }
}
.delete-modal-view-to-delete {
  color: $primary !important;
}
</style>
