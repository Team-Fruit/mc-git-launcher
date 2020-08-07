export const state = () => ({
  count: 0,
})

export const mutations = {
  setCount(state, data) {
    state.count = data
  },
}

export const actions = {
  increment({commit, state}) {
    commit("setCount", state.count + 1)
  },
}
