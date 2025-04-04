import { defineStore } from 'pinia';
import { set, get } from '@/utils/storage';
import { useMainStore } from './main';
import { DEFAULT_NODE, DEFAULT_NODE_WS } from '@/utils/consts'; // Import default node URL

export const useSettingStore = defineStore('setting', {
  state: () => ({
    theme: get('THEME') || 'light', // Retrieve theme from local storage
    language: get('LANGUAGE') || 'en', // Retrieve language from local storage
    nodes: [
      { name: 'Default Node - HTTP', url: DEFAULT_NODE, selected: false },
      { name: 'Default Node - WS', url: DEFAULT_NODE_WS, selected: true },
      ...JSON.parse(get('NODES') || '[]'), // Append only user-added nodes
    ], // Default node list
  }),
  getters: {
    selectedNode(state) {
      return state.nodes.find(node => node.selected) || state.nodes[0]; // Ensure at least one node is selected
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
      this.nodes.push({ ...node, selected: false }); // Add a new node
      const userNodes = this.nodes.filter(
        node => node.url !== DEFAULT_NODE && node.url !== DEFAULT_NODE_WS
      ); // Exclude default nodes
      set('NODES', JSON.stringify(userNodes)); // Save only user-added nodes to local storage
    },
    removeNode(nodeUrl) {
      this.nodes = this.nodes.filter(node => node.url !== nodeUrl); // Remove a node
      if (!this.nodes.some(node => node.selected)) {
        this.nodes[0].selected = true; // Ensure at least one node is selected
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
      this.nodes.forEach(node => {
        node.selected = node.url === nodeUrl; // Mark the selected node
      });
      if (!this.nodes.some(node => node.selected)) {
        this.nodes[0].selected = true; // Ensure at least one node is selected
      }
      const userNodes = this.nodes.filter(
        node => node.url !== DEFAULT_NODE && node.url !== DEFAULT_NODE_WS
      ); // Exclude default nodes
      set('NODES', JSON.stringify(userNodes)); // Save only user-added nodes to local storage

      // Reinitialize API when the selected node changes
      const mainStore = useMainStore();
      mainStore.initializeApi();
    },
  },
});
