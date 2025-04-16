import { defineStore } from 'pinia';
import { set, get } from '@/utils/storage';
import { useMainStore } from './main';
import { DEFAULT_NODE, DEFAULT_NODE_WS } from '@/utils/consts'; // Import default node URL

export const useSettingStore = defineStore('setting', {
  state: () => ({
    theme: get('THEME') || 'light', // Retrieve theme from local storage
    language: get('LANGUAGE') || 'en', // Retrieve language from local storage
    nodes: [
      { name: 'Default Node - HTTP', url: DEFAULT_NODE },
      { name: 'Default Node - WS', url: DEFAULT_NODE_WS },
      ...JSON.parse(get('NODES') || '[]'), // Append only user-added nodes
    ], // Default node list
  }),
  getters: {
    selectedNode(state) {
      const selectedUrl = get('SELECTED_NODE_URL') || state.nodes[0].url; // Retrieve selected node URL from local storage
      return state.nodes.find(node => node.url === selectedUrl) || state.nodes[0]; // Ensure at least one node is selected
    },
  },
  actions: {
    setTheme(theme) {
      this.theme = theme;
      set('THEME', theme); // Save theme to local storage
    },
    setLanguage(language) {
      this.language = language;
      set('LANGUAGE', language); // Save language to local storage
    },
    addNode(node) {
      this.nodes.push(node); // Add a new node
      const userNodes = this.nodes.filter(
        node => node.url !== DEFAULT_NODE && node.url !== DEFAULT_NODE_WS
      ); // Exclude default nodes
      set('NODES', JSON.stringify(userNodes)); // Save only user-added nodes to local storage
    },
    removeNode(nodeUrl) {
      this.nodes = this.nodes.filter(node => node.url !== nodeUrl); // Remove a node
      const selectedUrl = get('SELECTED_NODE_URL');
      if (selectedUrl === nodeUrl) {
        const newSelectedUrl = DEFAULT_NODE; // Fallback to DEFAULT_NODE
        set('SELECTED_NODE_URL', newSelectedUrl); // Update selected node URL to default
        const mainStore = useMainStore();
        mainStore.initializeApi(); // Reinitialize API with default node
      }
      const userNodes = this.nodes.filter(
        node => node.url !== DEFAULT_NODE && node.url !== DEFAULT_NODE_WS
      ); // Exclude default nodes
      set('NODES', JSON.stringify(userNodes)); // Save only user-added nodes to local storage
    },
    updateNode(updatedNode) {
      const index = this.nodes.findIndex(node => node.url === updatedNode.url);
      if (index !== -1) {
        this.nodes[index] = { ...this.nodes[index], ...updatedNode }; // Update node details
        const userNodes = this.nodes.filter(
          node => node.url !== DEFAULT_NODE && node.url !== DEFAULT_NODE_WS
        ); // Exclude default nodes
        set('NODES', JSON.stringify(userNodes)); // Save only user-added nodes to local storage
      }
    },
    selectNode(nodeUrl) {
      set('SELECTED_NODE_URL', nodeUrl); // Save selected node URL to local storage
      const mainStore = useMainStore();
      mainStore.initializeApi(nodeUrl); // Reinitialize API when the selected node changes
    },
  },
});