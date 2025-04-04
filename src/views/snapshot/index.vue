<template>
  <div class="bg-blue-grey-lighten-5">
    <div class="pa-4">
      <p class="text-h5" :style="{ color: theme.current.value.colors.text }">Snapshot Blocks History</p>
      <v-table>
        <thead>
          <tr>
            <th :style="{ color: theme.current.value.colors.text }">Height</th>
            <th :style="{ color: theme.current.value.colors.text }">Hash</th>
            <th :style="{ color: theme.current.value.colors.text }">Timestamp</th>
            <th :style="{ color: theme.current.value.colors.text }">Interval</th>
            <th :style="{ color: theme.current.value.colors.text }">Miner (SBP)</th>
            <th :style="{ color: theme.current.value.colors.text }">Version</th>
            <th :style="{ color: theme.current.value.colors.text }">Transactions</th>
          </tr>
        </thead>
        <tbody class="table-content">
          <tr v-for="(item, index) in snapshots.slice(0, snapshots.length - 1)" :key="item.height">
            <td :style="{ color: theme.current.value.colors.text }">{{ item.height }}</td>
            <td>
              <v-link prefix="/snapshot/" :value="item.hash" /> 
              <v-icon
                class="ml-2 cursor-pointer"
                style="font-size: 14px;"
                @click="copyToClipboard(item.hash)"
              >
                mdi-content-copy
              </v-icon>
            </td>
            <td :style="{ color: theme.current.value.colors.text }">
              {{ formatTimeAgo(item.timestamp) }} ({{ new Date(item.timestamp * 1000).toLocaleString() }})
            </td>
            <td>
              <v-chip
                v-if="index < snapshots.length - 1"
                :color="getIntervalColor(item.timestamp, snapshots[index + 1]?.timestamp)"
                text-color="white"
                class="interval-chip"
              >
                {{ formatInterval(item.timestamp, snapshots[index + 1].timestamp) }}
              </v-chip>
            </td>
            <td>
              <v-link prefix="/sbp/" :value="getSbpName(sbps, item.producer)" /> 
            </td>
            <td>
              {{ item.version }}
            </td>
            <td :style="{ color: theme.current.value.colors.text }">
              {{ Object.keys(item.snapshotData || {}).length }}
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Show a loading message while fetching -->
      <div v-if="loading" class="text-center">
        <p>Loading...</p>
      </div>

      <!-- Show an error message if fetching fails -->
      <div v-else-if="error" class="text-center text-error">
        <p>Failed to load snapshots: {{ error.message }}</p>
      </div>

      <pagination :page-num="pageNumber" @select="getBlocks" />
    </div>
  </div>
  <v-snackbar
    v-model="toastVisible"
    timeout="1000"
    location="center"
    color="success"
  >
    {{ toastMessage }}
  </v-snackbar>
</template>

<script>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import { useMainStore, useSnapshotStore, useSbpStore } from '@/stores';
import VLink from '@/components/Link';
import Pagination from '@/components/Pagination';
import { log } from '@/utils/log';
import { getSbpName } from '@/utils/_';
import { formatDistanceToNowStrict, formatDistanceStrict } from 'date-fns';

export default {
  name: 'SnapshotList',
  setup() {
    const router = useRouter();
    const theme = useTheme(); // Access the Vuetify theme
    const mainStore = useMainStore();
    const snapshotStore = useSnapshotStore();
    const sbpStore = useSbpStore();

    const loading = ref(false);
    const error = ref(null);
    const searching = ref(false);

    const height = computed(() => mainStore.height);
    const snapshots = computed(() => snapshotStore.snapshots);
    const pageSize = computed(() => snapshotStore.pageSize);
    const pageNumber = computed(() => snapshotStore.pageNumber);
    const sbps = computed(() => sbpStore.sbps);

    const toastVisible = ref(false);
    const toastMessage = ref('');

    const getBlocks = async (page) => {
      log('page', page);
      if (loading.value) return;

      loading.value = true;
      const offset = page * pageSize.value;
      let start = Math.max(height.value - offset, 1);
      const end = start + pageSize.value;

      try {
        await snapshotStore.getSnapshots({start, end});
      } catch (err) {
        error.value = err;
      } finally {
        loading.value = false;
      }
    };

    const getSbps = () => sbpStore.getSbps();

    const search = (value) => {
      value = value.trim();
      if (value) {
        router.push(`/snapshot/${value}`);
      }
    };

    const formatTimeAgo = (timestamp) => {
      return formatDistanceToNowStrict(new Date(timestamp * 1000), { addSuffix: true });
    };

    const formatInterval = (currentTimestamp, nextTimestamp) => {
      return formatDistanceStrict(new Date(currentTimestamp * 1000), new Date(nextTimestamp * 1000));
    };

    const getIntervalColor = (currentTimestamp, nextTimestamp) => {
      if (!nextTimestamp) return 'grey'; // Default for no interval
      const intervalInSeconds = currentTimestamp - nextTimestamp;
      if (intervalInSeconds <= 1) {
        return 'success'; // Green for <= 1 second
      } else if (intervalInSeconds > 30) {
        return 'error'; // Red for > 30 seconds
      } else {
        return 'warning'; // Orange for 1-30 seconds
      }
    };

    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text).then(() => {
        toastMessage.value = 'Snapshot Hash Copied.';
        toastVisible.value = true;
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    };

    return {
      loading,
      error,
      searching,
      height,
      snapshots,
      pageSize,
      pageNumber,
      sbps,
      getBlocks,
      getSbps,
      search,
      getSbpName,
      theme,
      formatTimeAgo,
      formatInterval,
      getIntervalColor,
      copyToClipboard,
      toastVisible,
      toastMessage,
    };
  },
  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      const mainStore = useMainStore();
      await mainStore.getHeight();
      const page = to.params.page || 1;
      vm.getBlocks(page);
      vm.getSbps();
    });
  },
  beforeRouteUpdate(to, from, next) {
    const mainStore = useMainStore();
    mainStore.getHeight().then(() => {
      const page = to.params.page || 1;
      this.getBlocks(page).then(() => next());
    });
  },
  components: {
    VLink,
    Pagination,
  },
};
</script>

<style scoped>
.m-p {
  margin: 0;
}

.m-divider {
  height: 50px;
  margin: 0 30px;
}

.dashboard {
  padding-top: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--theme-border);
}

.dashboard.sticky-below {
  border-bottom: 1px solid var(--theme-border);
}

.interval-chip {
  margin: 0;
  padding: 0 8px;
}
</style>