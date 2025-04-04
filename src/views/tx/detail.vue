<template>
  <v-container class="background-muted">
    <v-row class="pa-4">
      <v-col>
        <p class="text-h5">Account Block Detail</p>

        <!-- Show a loading message while fetching -->
        <v-row v-if="loading" justify="center" class="mt-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-row>

        <!-- Show an error message if fetching fails -->
        <v-row v-else-if="error" justify="center" class="mt-4">
          <v-alert type="error" dense>
            Failed to load block: {{ error.message }}
          </v-alert>
        </v-row>

        <!-- Show the block details if available -->
        <v-table v-else-if="block" class="mt-4">
          <tbody>
            <tr>
              <td>Height</td>
              <td>{{ block.height }}</td>
            </tr>
            <tr>
              <td>Hash</td>
              <td>{{ block.hash }}</td>
            </tr>
            <tr>
              <td>BlockType</td>
              <td>{{ blockTypeText(block.blockType) }}</td>
            </tr>
            <tr v-if="isReceive(block.blockType)">
              <td>Send Block</td>
              <td>
                <v-link prefix="/tx/" :value="block.sendBlockHash" :full="true" />
              </td>
            </tr>
            <tr v-if="!isReceive(block.blockType)">
              <td>Receive Block</td>
              <td>
                <v-link
                  prefix="/tx/"
                  :value="block.receiveBlockHash"
                  :full="true"
                />
              </td>
            </tr>
            <tr>
              <td>Time</td>
              <td>{{ new Date(block.timestamp * 1000).toLocaleString() }}</td>
            </tr>
            <tr>
              <td>Confirmations</td>
              <td>{{ block.confirmations }}</td>
            </tr>
            <tr>
              <td>Snapshot</td>
              <td>
                <v-link
                  prefix="/snapshot/"
                  :value="block.firstSnapshotHash"
                  :full="true"
                />
              </td>
            </tr>
            <tr>
              <td>From</td>
              <td>
                <v-link
                  prefix="/account/"
                  :value="block.fromAddress"
                  :full="true"
                />
              </td>
            </tr>
            <tr>
              <td>To</td>
              <td>
                <v-link
                  prefix="/account/"
                  :value="block.toAddress"
                  :full="true"
                />
              </td>
            </tr>
            <tr>
              <td>Amount</td>
              <td>{{ atos(block.amount, block.tokenInfo.decimals) }}</td>
            </tr>
            <tr>
              <td>Token</td>
              <td>{{ block.tokenInfo.tokenSymbol }}</td>
            </tr>
            <tr>
              <td>Data / Memo (Base64)</td>
              <td>{{ block.data || '' }}</td>
            </tr>
            <tr>
              <td>Data / Memo (Decoded)</td>
              <td>{{ block.data ? decodeBase64(block.data) : '' }}</td>
            </tr>
            <tr>
              <td>Data / Memo (Hex)</td>
              <td>{{ block.data ? '0x' + decodeBase64(block.data, true) : '' }}</td>
            </tr>
          </tbody>
        </v-table>

        <!-- Show a message if no block is found -->
        <v-row v-else justify="center" class="mt-4">
          <p class="text-body-1">No block found.</p>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, inject } from 'vue';
import { atos, blockTypeText, isReceive } from '@/utils/_';
import { nullToken } from '@/utils/consts';
import VLink from '@/components/Link';

export default {
  name: 'TxDetail',
  setup() {
    const api = inject('api'); // Provided by App.vue
    const block = ref(null);
    const loading = ref(false);
    const error = ref(null);

    const getBlock = async (hash) => {
      loading.value = true;
      error.value = null;
      try {
        const response = await api.request('ledger_getAccountBlockByHash', hash);
        if (!response.tokenInfo) {
          response.tokenInfo = nullToken;
        }
        block.value = Object.seal(response);
      } catch (err) {
        console.error('Failed to fetch block:', err);
        error.value = err;
        block.value = null;
      } finally {
        loading.value = false;
      }
    };

    const decodeBase64 = (data, toHex = false) => {
      try {
        const decoded = atob(data);
        if (toHex) {
          return Array.from(decoded)
            .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
            .join('');
        }
        return decoded;
      } catch (e) {
        console.error('Failed to decode Base64:', e);
        return 'Invalid Base64 data';
      }
    };

    return {
      block,
      loading,
      error,
      atos,
      blockTypeText,
      isReceive,
      getBlock,
      decodeBase64,
    };
  },
  beforeRouteEnter(to, from, next) {
    const hash = to.params.hash;
    next(async (vm) => {
      await vm.getBlock(hash); // Ensure async completion
    });
  },
  beforeRouteUpdate(to, from, next) {
    const hash = to.params.hash;
    this.getBlock(hash)
      .then(() => next())
      .catch((error) => {
        console.error('Route update error:', error);
        next(false);
      });
  },
  components: {
    VLink,
  },
};
</script>

<style scoped>
.background-muted {
  background-color: #f5f5f5;
}
</style>