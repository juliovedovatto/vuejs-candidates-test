<template>
  <div class="icon-field-container">
    <span v-if="isSystemIcon" :id="`icon-field-${id}`" :class="classes" />
    <font-awesome-icon v-else :id="`icon-field-${id}`" :class="classes" :icon="[iconPrefix, iconClass]" size="lg" />

    <b-tooltip :target="`icon-field-${id}`" triggers="hover">
      {{ value }}
    </b-tooltip>
  </div>
</template>

<script>
import { v1 as uuidv1 } from 'uuid'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { BTooltip } from 'bootstrap-vue'

export default {
  name: 'IconField',
  components: {
    FontAwesomeIcon,
    BTooltip
  },
  props: {
    value: {
      type: String
    },
    iconClass: {
      type: String
    }
  },
  data() {
    return {
      id: uuidv1()
    }
  },
  computed: {
    classes() {
      return [
        'icon-field',
        {
          disabled: !this.value,
          'system-icon': this.isSystemIcon,
          [this.iconClass]: this.iconClass
        }
      ]
    },
    isSystemIcon() {
      return this.iconClass.startsWith('system')
    },
    iconPrefix() {
      const brandIcons = ['linkedin-in', 'twitter', 'facebook-f']

      return brandIcons.includes(this.iconClass) ? 'fab' : 'fas'
    }
  }
}
</script>

<style lang="scss" scoped>
.icon-field-container {
  display: inline-block;

  .icon-field {
    color: $dark;

    &.disabled {
      color: $gray-light;
    }

    &:hover {
      color: $primary;
    }

    &.system-icon {
      display: inline-block;
      content: '';
      width: 1.2rem;
      height: 1.2rem;
      vertical-align: -0.225em;
      filter: invert(38%) sepia(70%) saturate(3%) hue-rotate(107deg) brightness(93%) contrast(92%);

      &.disabled {
        filter: invert(94%) sepia(0%) saturate(0%) hue-rotate(152deg) brightness(94%) contrast(87%);
      }

      &:hover {
        filter: invert(41%) sepia(88%) saturate(5967%) hue-rotate(196deg) brightness(92%) contrast(80%);
      }

      &::after {
        content: '';
        white-space: nowrap;
        display: inline-block;
        position: relative;
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;
        width: 100%;
        height: 100%;
      }

      &.system-crunchbase-icon-class {
        &::after {
          background-image: url(~@/assets/icon/crunchbase.svg);
        }
      }
    }
  }
}
</style>
