<template>
  <div class="background-muted pa-4">
    <v-row justify="space-between" align="center" class="mb-4">
      <p class="text-h5">Tokens ({{ filteredTokens.length }})</p>
      <v-text-field
        v-model="searchText"
        placeholder="Filter By Symbol"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        style="max-width: 300px;"
      ></v-text-field>
    </v-row>

    <!-- Loading indicator -->
    <v-row v-if="loading" justify="center" class="my-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-row>

    <!-- Error message -->
    <v-row v-else-if="error" justify="center" class="my-4">
      <v-alert type="error" dense>
        Failed to load tokens: {{ error.message }}
      </v-alert>
    </v-row>

    <!-- Tokens table -->
    <v-table v-else>
      <thead>
        <tr>
          <th>Token Id</th>
          <th>Symbol</th>
          <th>Index</th>
          <th>Name</th>
          <th>Decimals</th>
          <th>Total Supply</th>
          <th>Max Supply</th>
          <th>ReIssuable</th>
          <th>Owner</th>
        </tr>
      </thead>
      <tbody class="table-content">
        <tr v-for="item in paginatedTokens" :key="item.tokenId">
          <td>
            <v-link prefix="/token/" :value="item.tokenId" />
            <v-icon
              class="ml-2 cursor-pointer"
              style="font-size: 14px;"
              @click="copyToClipboard(item.tokenId, 'Token ID')"
            >
              mdi-content-copy
            </v-icon>
          </td>
          <td>{{ item.tokenSymbol }}</td>
          <td>{{ item.indexText }}</td>
          <td>{{ item.tokenName }}</td>
          <td>{{ item.decimals }}</td>
          <td class="text-truncate" style="max-width: 120px;">{{ item.totalSupply }}</td>
          <td class="text-truncate" style="max-width: 120px;">{{ item.maxSupply }}</td>
          <td>{{ item.isReIssuable ? 'YES' : 'NO' }}</td>
          <td>
            <v-link prefix="/account/" :value="item.owner" />
            <v-icon
              class="ml-2 cursor-pointer"
              style="font-size: 14px;"
              @click="copyToClipboard(item.owner, 'Owner Address')"
            >
              mdi-content-copy
            </v-icon>
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-pagination
      v-model="currentPage"
      :length="totalPages"
      @update:modelValue="updatePage"
      class="mt-4"
    />

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
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTokenStore } from '@/stores';
import VLink from '@/components/Link';
import { atos } from '@/utils/_';

export default {
  name: 'TokenList',
  setup() {
    const router = useRouter();
    const tokenStore = useTokenStore();

    // Reactive variables
    const loading = ref(false);
    const error = ref(null);
    const searchText = ref('');
    const currentPage = ref(1);
    const toastVisible = ref(false);
    const toastMessage = ref('');

    // Computed properties
    const allTokens = computed(() => tokenStore.tokens.map((token) => ({
      ...token,
      totalSupply: atos(token.totalSupply, token.decimals),
      maxSupply: atos(token.maxSupply, token.decimals),
    })));

    const filteredTokens = computed(() => {
      const filterText = searchText.value.trim().toLowerCase();
      return allTokens.value.filter((token) =>
        filterText ? token.tokenSymbol.toLowerCase().includes(filterText) : true
      );
    });

    const totalPages = computed(() => Math.ceil(filteredTokens.value.length / tokenStore.pageSize));
    const paginatedTokens = computed(() => {
      const start = (currentPage.value - 1) * tokenStore.pageSize;
      const end = start + tokenStore.pageSize;
      return filteredTokens.value.slice(start, end);
    });

    // Methods
    const fetchTokens = async () => {
      loading.value = true;
      error.value = null;
      try {
        await tokenStore.getTokenInfoList();
      } catch (err) {
        error.value = err;
      } finally {
        loading.value = false;
      }
    };

    const updatePage = (page) => {
      currentPage.value = page; // Update page without refetching
    };

    const getToken = (tti) => {
      const trimmedTti = tti?.trim();
      if (trimmedTti) {
        router.push(`/token/${trimmedTti}`);
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

    // Initial load
    onMounted(() => {
      fetchTokens();
    });

    return {
      loading,
      error,
      searchText,
      currentPage,
      filteredTokens,
      paginatedTokens,
      totalPages,
      updatePage,
      getToken,
      copyToClipboard,
      toastVisible,
      toastMessage,
    };
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
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pa-4 {
  padding: 16px; /* Matches Vuetify's pa-4 utility */
}
.cursor-pointer {
  cursor: pointer;
}
</style>