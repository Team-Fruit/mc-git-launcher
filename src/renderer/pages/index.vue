<template>
  <v-container>
    <v-row no-gutters>
      <v-col
        v-for="n in 3"
        :key="n"
        cols="12"
        sm="4"
      >
        <v-card
          class="pa-2"
          outlined
          tile
        >
          One of three columns
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { remote, ipcRenderer } from 'electron'

export default {
  components: {
  },
  data() {
    return {
      local: 'C:\\softdata\\git\\FruitLauncherV2',
      remote: 'https://github.com/Team-Fruit/InventoryBan.git',
      result: 'none'
    }
  },
  methods: {
    openURL(url) {
      remote.shell.openExternal(url)
    },
    async cloneGit() {
      this.result = await ipcRenderer.invoke('c-clone', this.local, this.remote)
    }
  }
}
</script>

<style>
</style>
