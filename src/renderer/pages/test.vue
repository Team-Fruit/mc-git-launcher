<template>
  <div>this is test page! {{ Servers.length }}</div>
</template>

<script lang="ts">
import Vue from 'vue'
import {mapState} from 'vuex'
//import {Servers} from '~/store/servers'

export default Vue.extend({
  layout: 'test',
  name: "test" as string,
  data() {
    return {
      test: "te  aa sast " as string
    }
  },
  computed: {
    ...mapState('servers', ['Servers'])
  }
})
</script>

<style scoped>

</style>
