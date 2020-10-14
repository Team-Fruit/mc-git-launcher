<template>
  <div>now {{ serverId }}
    {{server.modPacks.length}}
  </div>
</template>

<script lang="ts">
import {serverStore} from "~/store";
import {Vue, Component} from "vue-property-decorator";
import {Server} from "~/store/servers";

@Component({
  name: "serverIndex",
  layout: "test"
})
export default class ServerIndex extends Vue {
  serverId: string = this.$route.params.serverId
  server: Server = serverStore.servers.filter(s => s.name == this.serverId)[0]

  get servers() {
    return serverStore.servers
  }

  async created () {

  }
}
</script>


<style scoped>

</style>
