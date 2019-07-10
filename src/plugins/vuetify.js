import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import {Ripple} from 'vuetify/lib/directives'

import 'material-design-icons-iconfont'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  iconfont: 'md',
  directives: {
    Ripple
  }
});
