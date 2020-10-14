import {VuexModule, Module, Action, Mutation} from 'vuex-module-decorators'

@Module({stateFactory: true, namespaced: true, name: 'feed'})
export default class Feed extends VuexModule {
  posts: string[] = ["a", "u"]

  @Mutation
  addPost() {
    this.posts = [...this.posts, "ssushisushi"]
  }

  public get postLength() {
    return this.posts.length
  }
}
