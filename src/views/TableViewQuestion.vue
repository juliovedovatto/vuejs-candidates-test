<template>
  <div class="table-view-question">
    <section class="question">
      <p>
        The challenge for this task is to add a new feature for this table in order to maintain the top row (header row)
        and the first column (company name) fixed.
      </p>
      <strong>Expected outcome:</strong>
      <p>
        As the user scrolls to the bottom of the view, the top row (header row) will need to stay fixed in view (always
        visible) for the user to keep track of the columns' names as the infinite-scroller loads more items. As the user
        scrolls to the right of the view, the first column (company name) will need to stay fixed in view (always
        visible) for the user to keep track of the company name as the new columns come into view.
      </p>
    </section>

    <table-view v-bind="table">
      <template #first_header>Company Name</template>
      <template #first_column="{ item, showPanel, isPanelOpen, togglePanel }">
        <research-company-table-first-column
          :item="item"
          :show-panel="showPanel"
          :is-panel-open="isPanelOpen"
          :toggle-panel="togglePanel"
        />
      </template>
      <template #detail="{ item, panelFields, getField, getAvailableFieldById }">
        <research-company-table-detail
          :item="item"
          :panel-fields.sync="panelFields"
          :get-field="getField"
          :get-available-fields="getAvailableFields"
          :get-available-field-by-id="getAvailableFieldById"
        />
      </template>
    </table-view>
  </div>
</template>

<script>
import API from '@/core/api'
import { TableView, ResearchCompanyTableFirstColumn, ResearchCompanyTableDetail } from '@/components/tables'

export default {
  name: 'TableViewQuestion',
  components: {
    TableView,
    ResearchCompanyTableFirstColumn,
    ResearchCompanyTableDetail
  },
  data() {
    return {
      table: {
        getViews: this.getTableViews,
        createView: this.createTableView,
        updateView: this.updateTableView,
        deleteView: this.deleteTableView,
        getAvailableFields: this.getAvailableFields,
        getFiltersets: this.getFiltersets,
        getFilterset: this.getFilterset,
        createFilterset: this.createFilterset,
        updateFilterset: this.updateFilterset,
        getOperators: this.getOperators,
        getSearch: this.getSearch,
        getInlineSearch: this.getInlineSearch,
        updateDisplayPreferences: this.updateDisplayPreferences,
        tableRetrieve: this.tableRetrieve,
        tableBulkRetrieve: this.tableBulkRetrieve,
        tableInlineRetrieve: this.tableInlineRetrieve,
        tableInlineBulkRetrieve: this.tableInlineBulkRetrieve,
        shareView: this.shareView,
        unshareView: this.unshareView,
        getCSVExport: this.getResearchCompanyCSVExport,
        getInlineCSVExport: this.getResearchCompanyInlineCSVExport,
        firstColumnId: 'research.company.tableview.company.name',
        tableDetails: {},
        tableInfiniteType: 'companies',
        tableInfiniteWrapper: this.tableInfiniteWrapper,
        filterable: this.filterable,
        displayConfigurable: this.displayConfigurable,
        shareable: this.shareable,
        exportable: this.exportable,
        selectable: this.selectable,
        inlineMode: this.inlineMode
      }
    }
  },
  methods: {
    getTableViews(payload = {}) {
      return API.getResearchCompanyTableViews(payload)
    },
    createTableView(payload = {}) {
      return API.createResearchCompanyTableView(payload)
    },
    updateTableView(payload = {}) {
      return API.updateResearchCompanyTableView(payload)
    },
    deleteTableView(payload = {}) {
      return API.removeResearchCompanyTableView(payload)
    },
    getAvailableFields(payload = {}) {
      return API.getResearchCompanyTableViewAvailableFields(payload)
    },
    getFiltersets(payload = {}) {
      return API.getResearchCompanyFiltersets(payload)
    },
    getFilterset(payload = {}) {
      return API.getResearchCompanyFilterset(payload)
    },
    createFilterset(payload = {}) {
      return API.createResearchCompanyFilterset(payload)
    },
    updateFilterset(payload = {}) {
      return API.updateResearchCompanyFilterset(payload)
    },
    getOperators(payload = {}) {
      return API.getResearchCompanyFiltersetAvailableOperators(payload)
    },
    getSearch(payload = {}) {
      return API.searchResearchCompanyTableView(payload)
    },
    getInlineSearch(payload = {}) {
      return API.researchCompanyTableViewInlineSearch(payload)
    },
    updateDisplayPreferences(payload = {}) {
      return API.updateResearchCompanyTableViewDisplayPreferences(payload)
    },
    tableRetrieve(payload = {}) {
      return API.researchCompanyTableRetrieve(payload)
    },
    tableBulkRetrieve(payload = {}) {
      return API.researchCompanyTableBulkRetrieve(payload)
    },
    tableInlineRetrieve(payload = {}) {
      return API.researchCompanyTableInlineRetrieve(payload)
    },
    tableInlineBulkRetrieve(payload = {}) {
      return API.researchCompanyTableInlineBulkRetrieve(payload)
    },
    shareView(payload = {}) {
      return API.shareOrganizationResearchCompanyTableView(payload)
    },
    unshareView(payload = {}) {
      return API.unshareOrganizationResearchCompanyTableView(payload)
    },
    getResearchCompanyCSVExport(payload = {}) {
      return API.researchCompanyCSVExport(payload)
    },
    getResearchCompanyInlineCSVExport(payload = {}) {
      return API.researchCompanyInlineCSVExport(payload)
    }
  }
}
</script>

<style lang="scss" scoped>
.table-view-question {
  .question {
    flex: 0 1 auto;
    background-color: $light;
    padding: 0.5rem 1rem;
  }
}
</style>
