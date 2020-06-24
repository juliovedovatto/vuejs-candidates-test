import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default class Alert {
  constructor(vueInstance) {
    this.instance = vueInstance
    this.defaultConfig = {
      toaster: 'b-toaster-bottom-right',
      solid: true,
      noCloseButton: true
    }
  }

  createNode(message, icon) {
    const h = this.instance.$createElement
    const node = h('div', [
      h(FontAwesomeIcon, { props: { icon }, class: 'text-white mr-3' }),
      h('strong', { class: 'text-white' }, message)
    ])

    return node
  }

  success(message, extraConfig = { bodyClass: 'bg-success' }) {
    const node = this.createNode(message, 'check-circle')
    const config = Object.assign({}, this.defaultConfig, extraConfig)

    return this.instance.$bvToast.toast([node], config)
  }

  error(message, extraConfig = { bodyClass: 'bg-danger' }) {
    const node = this.createNode(message, 'times-circle')
    const config = Object.assign({}, this.defaultConfig, extraConfig)

    return this.instance.$bvToast.toast([node], config)
  }
}
