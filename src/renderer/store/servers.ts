import {VuexModule, Module, Action, Mutation} from 'vuex-module-decorators'

@Module({
  stateFactory: true,
  namespaced: true,
  name: 'servers'
})
class Servers extends VuexModule {
  servers: Server[] = []

  @Mutation
  addServer(name: string) {
    this.servers = [...this.servers, new Server(name)]
  }

  @Mutation
  clearServer() {
    this.servers = []
  }

  public get getServerLength() {
    return this.servers.length
  }
}

class Server {
  name: string = ""
  iconUrl: string = "https://avatars2.githubusercontent.com/u/17563842?s=460&u=65463cc37658fedcba44c84664dbba9fe1113970&v=4"
  modPacks: ModPack[] = []

  constructor(name: string) {
    this.name = name
    this.modPacks = [...this.modPacks, new ModPack("su  s h i ")]
  }

  getInfo(): object {
    return {
      name: this.name,
      iconUrl: this.iconUrl
    }
  }

  setName(arg: string) {
    this.name = arg
  }

}

class ModPack {
  private name: string = ""

  constructor(name: string) {
    this.name = name
  }

  getName(): string {
    return name
  }
}

export default Servers
export {Server,ModPack}
