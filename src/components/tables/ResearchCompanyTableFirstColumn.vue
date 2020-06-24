<template>
  <div class="first-column">
    <template v-if="showPanel">
      <font-awesome-icon
        v-if="!isPanelOpen"
        icon="angle-right"
        @click="togglePanel(item)"
        class="mr-3 cursor-pointer"
      />
      <font-awesome-icon
        v-else-if="isPanelOpen"
        icon="angle-up"
        @click="togglePanel(item)"
        class="mr-3 cursor-pointer"
      />
    </template>

    <div class="company-logo">
      <div v-if="item.company_logo" class="logo" :style="{ backgroundImage: `url(${item.company_logo})` }"></div>
      <font-awesome-icon v-else size="lg" icon="building" class="text-dark no-logo" />
    </div>
    <truncate>{{ item.name }}</truncate>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Truncate } from '@/components/readmore'

export default {
  name: 'ResearchCompanyTableFirstColumn',
  components: {
    FontAwesomeIcon,
    Truncate
  },
  props: {
    isBusy: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object
    },
    showPanel: {
      type: Boolean,
      default: false
    },
    isPanelOpen: {
      type: Boolean,
      default: false
    },
    togglePanel: {
      type: Function
    }
  }
}
</script>

<style lang="scss" scoped>
.first-column {
  width: 100%;
  display: flex;
  align-items: center;
  .company-logo-and-name {
    align-items: center;
    display: flex;
    flex-direction: row;
  }
  .company-logo {
    display: inline-block;
    margin-right: 0.5rem;
    text-align: center;

    .logo {
      width: 30px;
      height: 30px;
      background-position: 5% 50%;
      background-color: transparent;
      background-size: cover;
      background-repeat: no-repeat;
      box-shadow: none;
    }
    .no-logo {
      margin-left: 0.6rem;
      margin-right: 0.6rem;
    }
  }
}
</style>
