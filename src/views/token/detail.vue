<template>
  <v-container class="background-muted">
    <p class="text-h5">Token Detail</p>
    <!-- Show a loading indicator while fetching -->
    <v-row v-if="loading" justify="center" class="my-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-row>

    <!-- Show an error message if fetching fails -->
    <v-row v-else-if="error" justify="center" class="my-4 text-error">
      <v-alert type="error" dense>
        Failed to load token: {{ error.message }}
      </v-alert>
    </v-row>

    <!-- Show the token details if available -->
    <v-table v-else-if="token">
      <tbody class="table-content">
        <tr>
          <td>ID</td>
          <td>{{ token.tokenId }}</td>
        </tr>
        <tr>
          <td>Symbol</td>
          <td>{{ token.tokenSymbol }}</td>
        </tr>
        <tr>
          <td>Index</td>
          <td>{{ token.indexText }}</td>
        </tr>
        <tr>
          <td>Name</td>
          <td>{{ token.tokenName }}</td>
        </tr>
        <tr>
          <td>Decimals</td>
          <td>{{ token.decimals }}</td>
        </tr>
        <tr>
          <td>Total Supply</td>
          <td>{{ token.totalSupply }}</td>
        </tr>
        <tr>
          <td>Max Supply</td>
          <td>{{ token.maxSupply }}</td>
        </tr>
        <tr>
          <td>Reissuable</td>
          <td>{{ token.isReIssuable }}</td>
        </tr>
        <tr>
          <td>Only Burnable by Owner</td>
          <td>{{ token.isOwnerBurnOnly }}</td>
        </tr>
        <tr>
          <td>Issuer</td>
          <td>
            <v-link prefix="/account/" :value="token.owner" />
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Show a message if no token is found -->
    <div v-else class="text-center">
      <p>No token found.</p>
    </div>
  </v-container>
</template>

<script>
import { computed, ref } from 'vue';
import { useTokenStore } from '@/stores';
import VLink from '@/components/Link';

export default {
  name: 'TokenDetail',
  setup() {
    const tokenStore = useTokenStore();

    const loading = ref(false);
    const error = ref(null);

    const token = computed(() => tokenStore.token);

    const getTokenDetails = async (tti) => {
      loading.value = true;
      error.value = null;
      try {
        await tokenStore.getTokenDetails(tti);
      } catch (err) {
        console.error('Failed to fetch token details:', err);
        error.value = err;
      } finally {
        loading.value = false;
      }
    };

    const getToken = async (tti) => {
      if (loading.value) return;
      await getTokenDetails(tti);
    };

    return {
      loading,
      error,
      token,
      getToken,
    };
  },
  beforeRouteEnter(to, from, next) {
    const tti = to.params.tid;
    next((vm) => {
      vm.getToken(tti);
    });
  },
  beforeRouteUpdate(to, from, next) {
    const tti = to.params.tid;
    this.getToken(tti).then(() => next());
  },
  components: {
    VLink,
  },
};
</script>

<style scoped>
.pa-4 {
  padding: 16px; /* Matches Vuetify's pa-4 utility */
}
.my-4 {
  margin-top: 16px;
  margin-bottom: 16px; /* Matches Vuetify's my-4 utility */
}
</style>