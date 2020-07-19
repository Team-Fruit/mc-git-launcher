<template>
  <v-btn
    v-on:click="action()"
    :loading="loading"
    :disabled="loading"
    outlined
  >{{name}}
  </v-btn>
</template>

<script>
  export default {
    name: "gitButton",
    props: [
      'name',
      'channel',
      'data'
    ],
    data() {
      return {
        loading: false,
        result: '',
      }
    },
    methods: {
      async action() {
        this.loading = true
        this.result = await api.git(this.channel, this.data)
        this.loading = false
      }
    },
    watch: {
      result: function(newValue) {
        this.$emit('onResult', newValue);
      }
    }
  }
</script>

<style scoped>

</style>
