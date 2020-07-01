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
  import {ipcRenderer, remote} from "electron";

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
        this.result = await ipcRenderer.invoke(this.channel, this.data)
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
