<template>
  <div>this is index
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from "vue-property-decorator";
import {serverStore} from "~/store";

@Component({
  layout: 'serverIndex'
})
export default class Test extends Vue {
}
</script>

<style scoped>

</style>
