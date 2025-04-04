<template>
  <div class="bg-background">
    <div class="pa-4">
      <!-- Show a loading indicator while fetching -->
      <v-row v-if="loading" justify="center" class="mt-4">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-row>

      <!-- Show an error message if fetching fails -->
      <div v-if="error" class="text-center text-error">
        <p>Failed to load account: {{ error.message }}</p>
      </div>

      <!-- Show the account details if available -->
      <div v-else-if="account">
        <div class="mb-4">
          <v-table>
            <tbody class="table-content">
              <tr>
                <td>Address</td>
                <td>{{ account.address }}</td>
              </tr>
              <tr>
                <td>Height</td>
                <td>{{ account.blockCount }}</td>
              </tr>
              <tr>
                <td>Balance</td>
                <td>{{ viteBalance }} VITE</td>
              </tr>
            </tbody>
          </v-table>
        </div>
        <div>
          <v-tabs v-model="tab" color="primary" class="mb-4">
            <v-tab value="tx">Transactions</v-tab>
            <v-tab value="utx">Unreceived</v-tab>
            <v-tab value="balance">Assets</v-tab>
          </v-tabs>
          <v-window v-model="tab">
            <v-window-item value="tx">
              <v-table>
                <thead>
                  <tr>
                    <th>Height</th>
                    <th>Hash</th>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Amount</th>
                    <th>Token</th>
                    <th>Timestamp</th>
                    <th>Confirmations</th>
                  </tr>
                </thead>
                <tbody class="table-content">
                  <tr v-for="item in txs" :key="item.height">
                    <td>{{ item.height }}</td>
                    <td>
                      <v-link prefix="/tx/" :value="item.hash" />
                    </td>
                    <td>
                      <v-chip text-color="white">
                        {{ blockTypeText(item.transactionType) }}
                        <v-icon
                        class="ml-2"
                        style="font-size: 14px;"
                        >
                          {{ isReceive(item.blockType) ? 'mdi-arrow-bottom-left' : 'mdi-arrow-top-right' }}
                        </v-icon>
                      </v-chip>
                    </td>
                    <td>
                      <v-link prefix="/account/" :value="item.fromAddress" />
                      <v-icon
                        class="ml-2 cursor-pointer"
                        style="font-size: 14px;"
                        @click="copyToClipboard(item.fromAddress, 'From Address')"
                      >
                        mdi-content-copy
                      </v-icon>
                    </td>
                    <td>
                      <v-link prefix="/account/" :value="item.toAddress" />
                      <v-icon
                        class="ml-2 cursor-pointer"
                        style="font-size: 14px;"
                        @click="copyToClipboard(item.toAddress, 'To Address')"
                      >
                        mdi-content-copy
                      </v-icon>
                    </td>
                    <td>
                      <span :class="getAmountClass(item.amount, item.blockType)">
                        {{ formatAmount(item.amount, item.blockType) }}
                      </span>
                    </td>
                    <td>{{ item.tokenInfo.tokenSymbol }}</td>
                    <td>{{ new Date(item.timestamp * 1000).toLocaleString() }}</td>
                    <td>{{ item.confirmations }}</td>
                  </tr>
                </tbody>
              </v-table>
              <pagination :page-num="txPageNum" @select="getCurrentTxs" />
            </v-window-item>
            <v-window-item value="utx">
              <v-table>
                <thead>
                  <tr>
                    <th>Hash</th>
                    <th>Type</th>
                    <th>Token</th>
                    <th>From</th>
                    <th>Height</th>
                    <th>To</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody class="table-content">
                  <tr v-for="item in txs" :key="item.height">
                    <td>
                      <v-link prefix="/tx/" :value="item.hash" />
                    </td>
                    <td>{{ blockTypeText(item.blockType) }}</td>
                    <td>{{ item.tokenInfo.tokenSymbol }}</td>
                    <td>
                      <v-link prefix="/account/" :value="item.fromAddress" />
                    </td>
                    <td>{{ item.height }}</td>
                    <td>
                      <v-link prefix="/account/" :value="item.toAddress" />
                    </td>
                    <td>{{ item.amount }}</td>
                  </tr>
                </tbody>
              </v-table>
              <pagination :page-num="utxPageNum" @select="getCurrentUtxs" />
            </v-window-item>
            <v-window-item value="balance">
              <v-table>
                <thead>
                  <tr>
                    <th>Token Id</th>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody class="table-content">
                  <tr v-for="item in tokens" :key="item.tokenInfo.tokenId">
                    <td>
                      <v-link prefix="/token/" :value="item.tokenInfo.tokenId" />
                    </td>
                    <td>{{ item.tokenInfo.tokenSymbolView }}</td>
                    <td>{{ item.tokenInfo.tokenName }}</td>
                    <td>{{ item.balance }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-window-item>
          </v-window>
        </div>
      </div>

      <!-- Show a message if no account is found -->
      <div v-else class="text-center">
        <p>No account found.</p>
      </div>

      <!-- Toast notification -->
      <v-snackbar
        v-model="toastVisible"
        timeout="1000"
        location="center"
        color="success"
      >
        {{ toastMessage }}
      </v-snackbar>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { useAccountStore } from '@/stores';
import { inject } from 'vue';
import VLink from '@/components/Link';
import Pagination from '@/components/Pagination';
import { blockTypeText, isReceive } from '@/utils/_';
import { VITE } from '@/utils/consts';

export default {
  name: 'AccountDetail',
  setup() {
    const accountStore = useAccountStore();
    const api = inject('api'); // Provided by App.vue

    const loading = ref(false);
    const error = ref(null);
    const tab = ref('tx');
    const address = ref('');
    const toastVisible = ref(false);
    const toastMessage = ref('');

    const account = computed(() => accountStore.account);
    const viteBalance = computed(() => accountStore.balance);
    const txs = computed(() => accountStore.txs);
    const txPageSize = computed(() => accountStore.txPageSize);
    const txPageNum = computed(() => accountStore.txPageNum);
    const utxPageNum = computed(() => accountStore.utxPageNum);

    const tokens = computed(() => {
      if (account.value && account.value.balanceInfoMap) {
        return Object.values(account.value.balanceInfoMap)
          .filter((item) => item.balance !== '0')
          .sort((a, b) => {
            if (a.tokenInfo.tokenId === VITE) return -1;
            if (b.tokenInfo.tokenId === VITE) return 1;
            return 0;
          });
      }
      return [];
    });

    const getAccountInfo = async (addr) => {
      loading.value = true;
      error.value = null;
      try {
        await accountStore.getAccountInfo(addr);
      } catch (err) {
        console.error('Failed to fetch account info:', err);
        error.value = err;
      } finally {
        loading.value = false;
      }
    };

    const getUtxs = async (addr, page) => {
      loading.value = true;
      error.value = null;
      try {
        await accountStore.getUtxs(addr, page);
      } catch (err) {
        console.error('Failed to fetch unreceived transactions:', err);
        accountStore.updateTxs([]); // Reset txs on error
        error.value = err;
      } finally {
        loading.value = false;
      }
    };

    const getTxs = async (addr, page) => {
      loading.value = true;
      error.value = null;
      try {
        const transactions = await api.getTransactionList({
          address: addr,
          pageIndex: page - 1,
          pageSize: txPageSize.value,
        });
        accountStore.updateTxs(Object.seal(transactions || []));
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        accountStore.updateTxs([]);
        error.value = err;
      } finally {
        loading.value = false;
      }
    };

    const getCurrentTxs = (page) => getTxs(address.value, page);
    const getCurrentUtxs = (page) => getUtxs(address.value, page);

    const refreshByTab = (tabVal) => {
      switch (tabVal) {
        case 'balance':
          return;
        case 'tx':
          getCurrentTxs(1);
          return;
        case 'utx':
          getCurrentUtxs(1);
          return;
      }
    };

    const copyToClipboard = (text, type) => {
      navigator.clipboard.writeText(text).then(() => {
        toastMessage.value = `${type} Copied.`;
        toastVisible.value = true;
      }).catch((err) => {
        console.error('Failed to copy text:', err);
        toastMessage.value = 'Copy failed.';
        toastVisible.value = true;
      });
    };

    const formatAmount = (amount, blockType) => {
      if (amount === '0') return '0';
      return !isReceive(blockType) ? `-${amount}` : `+${amount}`;
    };

    const getAmountClass = (amount, blockType) => {
      if (amount === '0') return 'text-secondary';
      if (blockType === 2) return 'text-error';
      if (blockType === 4) return 'text-success';
      return 'text-secondary';
    };

    watch(tab, (value) => {
      refreshByTab(value);
    });

    return {
      loading,
      error,
      account,
      viteBalance,
      txs,
      txPageNum,
      utxPageNum,
      tokens,
      tab,
      address,
      blockTypeText,
      getCurrentTxs,
      getCurrentUtxs,
      getAccountInfo,
      copyToClipboard,
      formatAmount,
      getAmountClass,
      toastVisible,
      toastMessage,
      refreshByTab,
      isReceive,
    };
  },
  beforeRouteEnter(to, from, next) {
    const addr = to.params.address;
    next((vm) => {
      if (addr) {
        vm.address = addr;
        vm.getAccountInfo(addr);
        vm.refreshByTab(vm.tab);
      }
    });
  },
  beforeRouteUpdate(to, from, next) {
    const addr = to.params.address;
    this.address = addr;
    this.getAccountInfo(addr);
    this.refreshByTab(this.tab);
    next();
  },
  components: {
    VLink,
    Pagination,
  },
};
</script>

<style scoped>
/* Minimal component-specific styles */
.pa-4 {
  padding: 16px; /* Matches Vuetify's pa-4 utility */
}
</style>