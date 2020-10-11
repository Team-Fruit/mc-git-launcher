<template>
  <div>this is test page! {{ test }}</div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  layout: 'test',
  name: "test" as string,
  data() {
    return {
      test: "test" as string
    }
  }
})
</script>

<style scoped>

</style>
