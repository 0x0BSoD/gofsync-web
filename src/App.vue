<template>
  <v-app>
    <v-toolbar app dense>
      <v-toolbar-title class="headline text-uppercase">
        <span>go</span>
        <span class="font-weight-light">Fsync</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      {username}
    </v-toolbar>

    <v-content>
      <HostGroup/>
    </v-content>
  </v-app>
</template>

<script>
import HostGroup from './components/hostgroup'

export default {
  name: 'App',
  components: {
    HostGroup
  },
  data () {
    return {
      //
    }
  }
}
</script>
