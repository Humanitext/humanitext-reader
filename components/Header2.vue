<template>
  <v-app-bar app flat border class="px-md-6">
    <v-app-bar-nav-icon @click="drawer = !drawer" class="mr-md-4" />
    <v-app-bar-title class="font-weight-bold">
      Humanitext Reader
    </v-app-bar-title>
    <v-spacer />
    <Navbar />
    <v-icon icon="mdi-account" class="mr-1" />
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" app floating class="px-6 py-4">
    <v-list>
      <v-list-item
        v-for="item in items"
        active-color="primary"
        :to="item.path"
        class="py-3"
      >
        <!--<v-icon :icon="item.icon" class="mr-6" />-->
        <v-list-item-title class="font-weight-bold" v-text="item.title" />
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
const items = [
  {
    title: "Reader",
    path: "/",
    //icon: 'mdi-numeric-2'
  },
  {
    title: "Help",
    path: "/help",
    //icon: 'mdi-numeric-2'
  },
];
// ナビゲーションの表示・非表示を制御
const drawer = useState("drawer", () => false);
</script>
