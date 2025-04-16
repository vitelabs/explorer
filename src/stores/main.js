import { defineStore } from 'pinia';
import Api from '@/api';
import { DEFAULT_NODE } from '@/utils/consts'; // Import default node URL

export const useMainStore = defineStore('main', {
  state: () => ({
    height: 0,
    api: null, // API instance
  }),
  getters: {
    getApi(state) {
      if (!state.api) {
        this.initializeApi(DEFAULT_NODE); // Use default node
      }
      return state.api;
    },
  },
  actions: {
    initializeApi(url) {
      if (!url) {
        console.error('No selected node found. Using default node.');
        this.api = new Api(DEFAULT_NODE); // Use default node
        return;
      }
      this.api = new Api(url); // Initialize API with the selected node's URL
      console.log('API reinitialized with URL:', url);
    },
    async getHeight() {
      try {
        const height = await this.getApi.request('ledger_getSnapshotChainHeight'); // Use getApi to ensure API is initialized
        this.height = height;
        console.log('Height set to:', height);
        return height;
      } catch (error) {
        console.error('Failed to fetch height:', error);
        this.height = 0;
        return this.height;
      }
    },
  },
});