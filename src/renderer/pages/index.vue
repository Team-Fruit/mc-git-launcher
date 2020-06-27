<template>
  <v-container>
    <v-row no-gutters>
      <v-col
        cols="12"
      >
        <v-text-field
          v-model="remote"
          label="Remote URL"
        ></v-text-field>
      </v-col>
      <v-col
        cols="12"
      >
        <v-text-field
          v-model="local"
          label="Local Path"
        ></v-text-field>
        <v-btn
          v-on:click="cloneGit()"
          :loading="loading"
          :disabled="loading"
          outlined
        >Clone</v-btn>
      </v-col>
    </v-row>
    <v-snackbar
      v-model="snackbar"
    >
      {{ text }}

      <template v-slot:action="{ attrs }">
        <v-btn
          color="pink"
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
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
      loading: false,
      result: '',
      snackbar: false,
      text: ''
    }
  },
  methods: {
    openURL(url) {
      remote.shell.openExternal(url)
    },
    async cloneGit() {
      this.loading = true
      this.result = await ipcRenderer.invoke('c-clone', this.local, this.remote)
      this.loading = false
    }
  },
  watch: {
    result: function(newValue) {
      this.text = newValue.success ? 'Success!' : 'Failed :-('
      this.snackbar = true
    }
  }
}
</script>

<style>
</style>
