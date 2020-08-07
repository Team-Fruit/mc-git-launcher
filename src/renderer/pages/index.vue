<template>
  <v-container>
    <v-progress-linear :value="progress.runtime"></v-progress-linear>
    <nuxt-link to="/main">aaa</nuxt-link>
  </v-container>
</template>

<script>
  export default {
    data() {
      return {
        progress: {
          runtime: 0,
        }
      }
    },
    created() {
      api.on('java-progress', (event, value) => {
        this.progress.runtime = value
      })
      api.action('java', {})
        .then(result => {
          this.$router.push('main')
        })
        .catch(err => alert(err))
    }
  }
</script>

<style scoped>

</style>
