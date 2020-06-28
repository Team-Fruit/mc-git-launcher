<template>
  <v-btn
    v-on:click="cloneGit()"
    :loading="loading"
    :disabled="loading"
    outlined
  >Clone
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
      async cloneGit() {
        this.loading = true
        this.result = await ipcRenderer.invoke(this.channel, this.data.local, this.data.remote)
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
