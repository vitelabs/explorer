import './index.less';

// Vue 3 imports
import { createApp } from 'vue';

// Router
import router from './router';

// Store (Pinia)
import { createPinia } from 'pinia';

// Vuetify
import vuetify from './plugins/vuetify';

// App component
import App from './App.vue';

// Create the Vue 3 app
const app = createApp(App);

// Use plugins
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(vuetify);

// Router navigation guard
router.beforeEach(async (to, from, next) => {
  console.log('Navigating to:', to.path); // Debug log
  next();
});

// Mount the app
app.mount('#app');
console.log('App mounted successfully'); // Debug log