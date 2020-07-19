<template>
  <v-container>
    <v-row no-gutters>
      <v-col
        cols="12"
      >
        <v-text-field
          v-model="data.remote"
          label="Remote URL"
        ></v-text-field>
      </v-col>
      <v-col
        cols="12"
      >
        <v-text-field
          v-model="data.local"
          label="Local Path"
        ></v-text-field>
        <git-button
          name="Clone"
          channel="clone"
          :data="data"
          @onResult="notification"
        ></git-button>
        <git-button
          name="Pull"
          channel="pull"
          :data="data"
          @onResult="notification"
        ></git-button>
        <git-button
          name="Diff"
          channel="diff"
          :data="data"
          @onResult="notification"
        ></git-button>
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
  import gitButton from '~/components/gitButton.vue'

  export default {
    components: {
      gitButton
    },
    data() {
      return {
        data: {
          local: 'C:\\softdata\\git\\hello-git',
          remote: 'https://github.com/kokoa0429/hello-git.git'
        },
        snackbar: false,
        text: ''
      }
    },
    methods: {
      openURL(url) {
        api.openURL(url)
      },
      notification(newValue) {
        this.text = newValue.success ? 'Success!' : ('Failed: ' + newValue.reason)
        this.snackbar = true
      }
    }
  }
</script>

<style>
</style>
