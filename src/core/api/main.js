import axios from 'axios'
import qs from 'qs'

class API {
  constructor() {
    this.request = axios.create({
      baseURL: 'http://35.209.75.167:8011/',
      headers: {
        Authorization: 'Token 6c7d00fc3ab815621d89f1de84480b49f1c290d0'
      },
      paramsSerializer(params) {
        return qs.stringify(params, { arrayFormat: 'repeat' })
      }
    })

    this.request.interceptors.response.use(response => {
      return response.data
    })
  }

  getResearchCompanyTableViews(payload = {}) {
    return this.request.get('research/company-tableview/', payload)
  }

  getResearchCompanyTableView(payload = {}) {
    const { id } = payload
    return this.request.get(`research/company-tableview/${id}/`)
  }

  getResearchCompanyTableViewAvailableFields(payload = {}) {
    const { id } = payload
    return this.request.get(`research/company-tableview/${id}/available-fields/`)
  }

  getResearchCompanyFiltersets(payload = {}) {
    return this.request.get('research/company-tableview-filterset/', payload)
  }

  getResearchCompanyFilterset(payload = {}) {
    const { id } = payload
    return this.request.get(`research/company-tableview-filterset/${id}/`)
  }

  getResearchCompanyFiltersetAvailableOperators(payload = {}) {
    return this.request.get('research/company-tableview-filterset/available-operators', payload)
  }

  searchResearchCompanyTableView(payload = {}) {
    const { filterset, params } = payload
    return this.request.get(`research/company-tableview-search/search/${filterset}/`, { params })
  }

  researchCompanyTableViewInlineSearch(payload = {}) {
    const { data, params } = payload
    return this.request.post('research/company-tableview-search/inline-search/', data, { params })
  }

  researchCompanyTableRetrieve(payload = {}) {
    const { rowId, params } = payload
    return this.request.get(`research/company-tableview/${rowId}/item-retrieve/`, { params })
  }

  researchCompanyTableBulkRetrieve(payload = {}) {
    const { filtersetId, data, params } = payload
    return this.request.post(`research/company-tableview-search/bulk-retrieve/${filtersetId}/`, data, { params })
  }

  researchCompanyTableInlineRetrieve(payload = {}) {
    const { rowId, data } = payload
    return this.request.post(`research/company-tableview-search/${rowId}/inline-retrieve/`, data)
  }

  researchCompanyTableInlineBulkRetrieve(payload = {}) {
    const { data, params } = payload
    return this.request.post(`research/company-tableview-search/inline-bulk-retrieve/`, data, { params })
  }

  researchCompanyCSVExport(payload = {}) {
    const { filterset, params } = payload
    return this.request.get(`research/company-tableview-search/csv-export/${filterset}/`, { params })
  }

  researchCompanyInlineCSVExport(payload = {}) {
    const { data } = payload
    return this.request.post('research/company-tableview-search/inline-csv-export/', data)
  }
}

export default new API()
