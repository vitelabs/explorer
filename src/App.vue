<template>
  <v-app>
    <nav-bar />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { provide, watch } from 'vue';
import { useTheme } from 'vuetify';
import { useMainStore } from '@/stores';
import NavBar from './components/NavBar.vue';

export default {
  name: 'App',
  components: {
    NavBar,
  },
  setup() {
    const mainStore = useMainStore();
    const theme = useTheme(); // Access the Vuetify theme

    // Provide the API to child components
    provide('api', mainStore.getApi);

    // Function to update CSS variables with theme colors
    const updateThemeColors = () => {
      const root = document.documentElement;
      const colors = theme.current.value.colors;
      root.style.setProperty('--theme-link', colors.link);
      root.style.setProperty('--theme-link-hover', colors.linkHover);
      root.style.setProperty('--theme-text', colors.text);
      root.style.setProperty('--theme-border', colors.border);
      root.style.setProperty('--theme-primary', colors.primary);
      root.style.setProperty('--theme-secondary', colors.secondary);
      root.style.setProperty('--theme-error', colors.error);
      root.style.setProperty('--theme-warning', colors.warning);
      root.style.setProperty('--theme-success', colors.success);
    };

    // Update colors initially
    updateThemeColors();

    // Watch for theme changes (e.g., if the theme switches between light/dark)
    watch(
      () => theme.current.value.colors,
      () => {
        updateThemeColors();
      },
      { deep: true }
    );
  },
};
</script>

<style>
/* Define fallback CSS variables */
:root {
  --theme-link: #1e88e5; /* Fallback */
  --theme-link-hover: #1565c0; /* Fallback */
  --theme-text: #666666; /* Fallback */
  --theme-border: #ccc; /* Fallback */
  --theme-primary: #1976d2; /* Fallback */
  --theme-secondary: #424242; /* Fallback */
  --theme-error: #FF5252; /* Fallback */
  --theme-warning: #FB8C00; /* Fallback */
  --theme-success: #4CAF50; /* Fallback */
}
</style>