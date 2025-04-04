<template>
  <div class="bg-blue-grey-lighten-5">
    <div class="pa-4">
      <v-table>
        <tbody>
          <tr>
            <td>Height</td>
            <td>{{ height }}</td>
          </tr>
        </tbody>
      </v-table>

      <p class="text-h5" :style="{ color: theme.current.value.colors.text }">Latest Snapshots</p>
      <v-table>
        <thead>
          <tr>
            <th :style="{ color: theme.current.value.colors.text }">Height</th>
            <th :style="{ color: theme.current.value.colors.text }">Hash</th>
            <th :style="{ color: theme.current.value.colors.text }">Timestamp</th>
            <th :style="{ color: theme.current.value.colors.text }">Interval</th>
            <th :style="{ color: theme.current.value.colors.text }">Miner (SBP)</th>
            <th :style="{ color: theme.current.value.colors.text }">Transactions</th>
          </tr>
        </thead>
        <tbody class="table-content">
          <tr
            v-for="(item, index) in snapshots.slice(0, snapshots.length - 1)"
            :key="item.height"
            :class="{ 'highlight-changed': item.changed }"
            @animationend="clearHighlight(item)"
          >
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
            <td :style="{ color: theme.current.value.colors.text }">
              {{ Object.keys(item.snapshotData || {}).length }}
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Show an error message if fetching fails -->
      <div v-if="error" class="text-center text-error">
        <p>Failed to load snapshots: {{ error.message }}</p>
      </div>
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
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import { useMainStore, useSnapshotStore, useSbpStore } from '@/stores';
import VLink from '@/components/Link';
import { getSbpName } from '@/utils/_';
import { formatDistanceToNowStrict, formatDistanceStrict } from 'date-fns';

export default {
  name: 'HomePage',
  setup() {
    const router = useRouter();
    const theme = useTheme();
    const mainStore = useMainStore();
    const snapshotStore = useSnapshotStore();
    const sbpStore = useSbpStore();

    const loading = ref(false);
    const error = ref(null);
    const searching = ref(false);
    const previousSnapshots = ref([]); // Store previous snapshot heights for comparison

    const height = computed(() => mainStore.height);
    const snapshots = computed(() => snapshotStore.snapshots);
    const pageSize = computed(() => snapshotStore.pageSize);
    const pageNumber = computed(() => snapshotStore.pageNumber);
    const sbps = computed(() => sbpStore.sbps);

    const toastVisible = ref(false);
    const toastMessage = ref('');

    const getSnapshots = async () => {
      if (loading.value) return;
      loading.value = true;
      try {
        // Store previous snapshot heights
        previousSnapshots.value = snapshotStore.snapshots.map((item) => item.height);
        await snapshotStore.getLatestSnapshots( pageSize.value + 1 );       
        // Mark new rows based on height
        const newSnapshots = snapshotStore.snapshots.map((newItem) => {
          const isNew = !previousSnapshots.value.includes(newItem.height);
          return { ...newItem, changed: isNew }; // Mark as changed if height is new
        });
        snapshotStore.snapshots = newSnapshots; // Update with change flags
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
      if (!nextTimestamp) return 'grey';
      const intervalInSeconds = currentTimestamp - nextTimestamp;
      if (intervalInSeconds <= 1) return 'success';
      if (intervalInSeconds > 30) return 'error';
      return 'warning';
    };

    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text).then(() => {
        toastMessage.value = 'Snapshot Hash Copied.';
        toastVisible.value = true;
      }).catch((err) => {
        console.error('Failed to copy text: ', err);
      });
    };

    const clearHighlight = (item) => {
      item.changed = false; // Clear the highlight after animation
    };

    let pollingInterval = null;

    const startPolling = () => {
      pollingInterval = setInterval(() => {
        getSnapshots();
      }, 10000); // Polling
    };

    const stopPolling = () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
    };

    onMounted(() => {
      getSnapshots();
      getSbps();
      startPolling();
    });

    onUnmounted(() => {
      stopPolling();
    });

    return {
      loading,
      error,
      searching,
      height,
      snapshots,
      pageSize,
      pageNumber,
      sbps,
      getSnapshots,
      getSbps,
      search,
      getSbpName,
      theme,
      formatTimeAgo,
      formatInterval,
      getIntervalColor,
      copyToClipboard,
      clearHighlight,
      toastVisible,
      toastMessage,
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.getSnapshots();
      vm.getSbps();
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.getSnapshots().then(() => next());
  },
  components: {
    VLink,
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

/* Highlight animation for changed rows */
.highlight-changed {
  animation: highlight 0.5s ease 0s 2;
}

@keyframes highlight {
  0% {
    background-color: rgba(255, 235, 59, 0.3); /* Light yellow highlight */
  }
  100% {
    background-color: transparent;
  }
}
</style>