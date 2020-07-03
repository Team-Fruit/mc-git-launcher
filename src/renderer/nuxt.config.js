/**
 * By default, Nuxt.js is configured to cover most use cases.
 * This default configuration can be overwritten in this file
 * @link {https://nuxtjs.org/guide/configuration/}
 */


module.exports = {
  mode: 'spa', // or 'universal'
  head: {
    title: 'mc-git-launcher'
  },
  loading: false,
  plugins: [],
  buildModules: [],
  modules: [
    '@nuxtjs/vuetify',
  ],
  vuetify: {
    theme: {
      themes: {
        light: {
          primary: '#1867c0',
          secondary: '#b0bec5',
          accent: '#8c9eff',
          error: '#b71c1c',
        },
      },
    }
  },
  build: {
    extend(config, ctx) {
      config.externals.push(
        function(context, request, callback) {
          if(/^nodegit/.test(request))
            return callback(null, 'commonjs' + " " + request);
          callback();
        }
      )
      if (ctx.isDev && ctx.isClient)
        config.devtool = 'eval-source-map'
    }
  }
};
