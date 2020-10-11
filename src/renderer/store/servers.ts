import {Module, VuexModule, Mutation, Action} from 'vuex-module-decorators'

@Module({
  name: 'servers',
  stateFactory: true,
  namespaced: true,
})
class Servers extends VuexModule {
  Servers: Server[] = []

  @Mutation
  addServer(srv: Server) {
    this.Servers.push(srv)
  }

  get servers() {
    return Servers
  }
}

class Server {
  private name: string = ""
  private iconurl: string = ""
  private modpacks: Modpack[] = []

  getName(): string {
    return this.name
  }

  getIcon(): string {
    return this.iconurl
  }

  getModpacks(): Modpack[] {
    return this.modpacks
  }

}

class Modpack {
  private name: string = ""
}
