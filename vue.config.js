module.exports = {
  css: {
    loaderOptions: {
      scss: {
        prependData: (() =>
          [
            '~@/assets/scss/abstracts/variables.scss',
            '~@/assets/scss/abstracts/functions.scss',
            '~@/assets/scss/abstracts/mixins.scss'
          ]
            .map(path => `@import "${path}";`)
            .join(''))()
      }
    }
  },

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true
    }
  },

  chainWebpack: config => {
    config.module
      .rule('i18n')
      .resourceQuery(/blockType=i18n/)
      .type('javascript/auto')
      .use('i18n')
      .loader('@kazupon/vue-i18n-loader')
      .end()
      .end()

    config.amd(false)
  }
}
