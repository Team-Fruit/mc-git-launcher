import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import Feed from '~/store/feed'
import Servers from '~/store/servers'

/* eslint import/no-mutable-exports: 0 */
let feedStore: Feed
let serverStore: Servers

function initialiseStores(store: Store<any>): void {
  feedStore = getModule(Feed, store)
  serverStore = getModule(Servers,store)
}

export { initialiseStores, feedStore ,serverStore}
