import { defineStore } from 'pinia';
import { useMainStore } from './main';

export const useTokenStore = defineStore('token', {
  state: () => ({
    pageSize: 10, // Client-side page size
    tokens: [],   // All fetched tokens
    token: {},    // Single token details
    total: 0,     // Total number of tokens fetched
  }),
  getters: {
    pageNum(state) {
      return Math.ceil(state.total / state.pageSize);
    },
  },
  actions: {
    async getTokenInfoList() {
      const mainStore = useMainStore();
      try {
        // Fetch up to 500 tokens in one go (adjust based on API limits)
        const res = await mainStore.getApi.request('contract_getTokenInfoList', 0, 500);
        this.total = res.totalCount > 500 ? 500 : res.totalCount; // Cap at 500 or actual total
        this.tokens = res.tokenInfoList.slice(0, 500).map(token => {
          const indexText = (Array(3).join('0') + token.index).slice(-3);
          token.indexText = indexText;
          token.tokenSymbolView =
            token.tokenSymbol +
            '-' +
            indexText;
          return token;
        });
      } catch (error) {
        console.error('Failed to fetch token info list:', error);
        this.total = 0;
        this.tokens = [];
        throw error; // Re-throw to handle in component
      }
    },
    async getTokenDetails(tti) {
      const mainStore = useMainStore();
      try {
        const res = await mainStore.getApi.request('contract_getTokenInfoById', tti);
        const indexText = (Array(3).join('0') + res.index).slice(-3);
        res.indexText = indexText;
        res.tokenSymbolView =
          res.tokenSymbol + '-' + indexText;
        this.token = res;
      } catch (error) {
        console.error('Failed to fetch token details:', error);
        this.token = {};
      }
    },
  },
});