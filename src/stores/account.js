import { defineStore } from 'pinia';
import { atos, insertList } from '@/utils/_';
import { nullToken } from '@/utils/consts';
import { useMainStore } from './main';
import { VITE } from '@/utils/consts';

export const useAccountStore = defineStore('account', {
  state: () => ({
    account: null,
    balance: 0,
    txPageSize: 10,
    txs: [],
    utxCount: 0,
  }),
  getters: {
    txPageNum(state) {
      if (state.account) {
        return Math.ceil(state.account.blockCount / state.txPageSize);
      }
      return 0;
    },
    utxPageNum(state) {
      return Math.ceil(state.utxCount / state.txPageSize);
    },
  },
  actions: {
    async getAccountInfo(address) {
      const mainStore = useMainStore();
      const res = await mainStore.api.request('ledger_getAccountInfoByAddress', address);
      if (res.balanceInfoMap) {
        Object.entries(res.balanceInfoMap).forEach(([tti, { tokenInfo, balance }]) => {
          res.balanceInfoMap[tti].balance = atos(balance, tokenInfo.decimals);
          tokenInfo.tokenId = tti;
          tokenInfo.tokenSymbolView =
            tokenInfo.tokenSymbol +
            '-' +
            (Array(3).join('0') + tokenInfo.index).slice(-3);
          if (tti === VITE) {
            this.balance = res.balanceInfoMap[tti].balance;
          }
        });
      }
      this.account = Object.seal(res);
    },
    async getUtxCount(address) {
      const mainStore = useMainStore();
      const res = await mainStore.api.request('ledger_getUnreceivedTransactionSummaryByAddress', address);
      this.utxCount = res.blockCount;
    },
    async getUtxs(address, pageNum) {
      const mainStore = useMainStore();
      const res = await mainStore.api.request(
        'ledger_getUnreceivedBlocksByAddress',
        address,
        pageNum,
        this.txPageSize
      );
      this.txs = res.map(tx => {
        tx.amount = atos(tx.amount, tx.tokenInfo.decimals);
        return Object.seal(tx);
      });
    },
    addTx(tx) {
      this.txs = insertList(this.txs, tx, this.txPageSize);
    },
    updateTxs(txs) {
      this.txs = txs.map(tx => {
        if (!tx.tokenInfo) {
          tx.tokenInfo = nullToken;
        }
        tx.amount = atos(tx.amount, tx.tokenInfo.decimals);
        return Object.seal(tx);
      });
    },
  },
});