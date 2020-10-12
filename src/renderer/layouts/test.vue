<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
      stateless
      :mini-variant=true
      mini-variant-width="70"
    >
      <v-list class="ssss">
        <v-list-item class="pa-1">
          <v-avatar
            size="55"
          >
            <v-img
              src="https://avatars2.githubusercontent.com/u/17563842?s=460&u=65463cc37658fedcba44c84664dbba9fe1113970&v=4"></v-img>
          </v-avatar>
          <v-list-item-content>
            <v-list-item-title>おしらせ</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container>
        <nuxt/>
      </v-container>
    </v-main>
    <v-bottom-navigation
      height="50">

    </v-bottom-navigation>
  </v-app>
</template>

<script lang="ts">
//import {feedStore} from "~/store";
import {Vue, Component} from "vue-property-decorator";

@Component({
  name: "testlayout"
})
export default class TestLayout extends Vue {
  drawer:boolean = true
}
</script>

<style>
::-webkit-scrollbar {
  display: none;
  width: 2px;
}
</style>
