<template>
  <div>this is test page! aaa {{ servers }}
    <v-btn v-on:click="addServer()">add!</v-btn>
    <v-btn v-on:click="clearServer()">clear!</v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from "vue-property-decorator";
import {serverStore} from "~/store";

@Component({
  layout: 'test'
})
export default class Test extends Vue {
  get servers() {
    return serverStore.getServerLength
  }
  async created() {
    // serverStore.addServer("susisusiServer")
  }
  addServer() {
    serverStore.addServer("susisusiServer" + new Date())
  }
  clearServer() {
    serverStore.clearServer()
  }
}
</script>

<style scoped>

</style>
