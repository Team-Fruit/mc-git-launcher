import { Module, VuexModule, Mutation } from 'vuex-module-decorators'

@Module({
  name: 'index',
  stateFactory: true,
  namespaced: true,
})
class Index extends VuexModule {

}
