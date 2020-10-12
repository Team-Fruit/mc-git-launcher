<template>
  <div>this is test page! aaa {{ posts }}</div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from "vue-property-decorator";
import {feedStore} from "~/store";

@Component({
  layout: 'test'
})
export default class Test extends Vue {
  get posts() {
    return feedStore.posts
  }
  async created() {
    feedStore.addPost()
  }
}
</script>

<style scoped>

</style>
