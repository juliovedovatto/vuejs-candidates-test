<template>
  <div class="research-company-table-detail">
    <div class="contact-infos">
      <ul class="list-inline mb-0">
        <li class="list-inline-item">
          <font-awesome-icon icon="map-marker-alt" class="mr-1" /> {{ item.location || 'N/A' }}
        </li>
        <li class="list-inline-item"><font-awesome-icon icon="at" class="mr-1" /> {{ item.contact_email || 'N/A' }}</li>
        <li class="list-inline-item list-inline-item-icon">
          <url-field :value="item.domain" icon-class="globe" />
        </li>
        <li class="list-inline-item list-inline-item-icon">
          <url-field :value="item.crunchbase_url" icon-class="system-crunchbase-icon-class" />
        </li>
        <li class="list-inline-item list-inline-item-icon">
          <url-field :value="item.twitter_url" icon-class="twitter" />
        </li>
        <li class="list-inline-item list-inline-item-icon">
          <url-field :value="item.facebook_url" icon-class="facebook-f" />
        </li>
      </ul>
    </div>

    <div class="company-description">
      <p class="mb-0">{{ item.elevator_pitch }}</p>
    </div>

    <div class="company-icons">
      <div class="icon-description" v-for="field in fields" :key="`${field.id}-field`">
        <div class="icon">
          <font-awesome-layers class="fa-3x">
            <font-awesome-icon icon="square" class="text-white" />
            <font-awesome-icon :icon="field.icon_class" class="text-dark img-fluid" transform="shrink-9" />
          </font-awesome-layers>
        </div>

        <div class="description">
          <truncate>
            <strong>{{ field.label }}</strong>
          </truncate>
          <!-- eslint-disable-next-line vue/require-component-is -->
          <component v-bind="getField(item, field)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome'
import { isNil, isEmpty } from 'lodash'

import { Truncate } from '@/components/readmore'
import {
  LeadScoreField,
  StringField,
  CurrencyField,
  StringArrayField,
  DateField,
  DatetimeField,
  DurationField,
  BooleanField,
  DecimalField,
  URLField
} from '@/components/fields'

export default {
  name: 'ResearchCompanyTableDetail',
  components: {
    FontAwesomeIcon,
    FontAwesomeLayers,
    Truncate,
    LeadScoreField, // eslint-disable-line vue/no-unused-components
    StringField, // eslint-disable-line vue/no-unused-components
    CurrencyField, // eslint-disable-line vue/no-unused-components
    StringArrayField, // eslint-disable-line vue/no-unused-components
    DateField, // eslint-disable-line vue/no-unused-components
    DatetimeField, // eslint-disable-line vue/no-unused-components
    DurationField, // eslint-disable-line vue/no-unused-components
    BooleanField, // eslint-disable-line vue/no-unused-components
    DecimalField, // eslint-disable-line vue/no-unused-components
    URLField, // eslint-disable-line vue/no-unused-components
    UrlField: URLField
  },
  props: {
    item: {
      type: Object
    },
    panelFields: {
      type: Array,
      default: () => []
    },
    getField: {
      type: Function
    },
    getAvailableFields: {
      type: Function
    },
    getAvailableFieldById: {
      type: Function
    }
  },
  computed: {
    fields() {
      return this.panelFields.map(field => {
        return this.getAvailableFieldById(field.field_id)
      })
    }
  },
  methods: {
    isNil,
    isEmpty
  }
}
</script>

<style lang="scss" scoped>
.research-company-table-detail {
  display: flex;
  flex-flow: column wrap;
  padding: 1.5rem;
  max-width: 110rem;

  > :not(:last-child) {
    margin-bottom: 1.5rem;
  }

  .contact-infos {
    .list-inline {
      .list-inline-item {
        &:not(:last-child) {
          margin-right: 1.5rem;
        }

        &.list-inline-item-icon:not(:last-child) {
          margin-right: 0.75rem;
        }
      }
    }
  }

  .badges {
    .custom-badge:not(:last-child) {
      margin-right: 1rem;
    }
  }

  .company-icons {
    display: flex;
    flex-flow: row wrap;
    align-items: center;

    .icon-description {
      flex: 0 0 250px;
      max-width: 250px;
      display: flex;
      flex-flow: row nowrap;
      margin-bottom: 1rem;

      &:not(:last-child) {
        margin-right: 1rem;
      }

      .icon {
        flex: 0 0 auto;
        margin-right: 0.5rem;
      }

      .description {
        flex: 0 1 auto;
        display: flex;
        flex-flow: column nowrap;
        max-width: 100%;
        overflow: hidden;
      }
    }
  }
}
</style>
