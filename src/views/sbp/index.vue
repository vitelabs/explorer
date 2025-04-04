<template>
  <v-row class="pa-4 background-muted">
    <v-col>
      <p class="text-h5">Snapshot Block Producers</p>
      <v-table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Votes</th>
            <th>Health Status</th>
            <th>Success / Expected</th>
            <th>Coinbase</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in sbps" :key="item.sbpName">
            <td>{{ index + 1 }}</td>
            <td>
              <v-link prefix="/sbp/" :value="item.sbpName" />
            </td>
            <td>{{ item.votes }}</td>
            <td>
              <v-progress-circular v-if="loading" indeterminate color="primary"></v-progress-circular>
              <v-chip v-else
                :color="getHealthColor(item.sbpName)"
                text-color="white"
                small
                class="health-chip"
              >
                {{ getHealthPercentage(item.sbpName) }}%              
              </v-chip>
            </td>
            <td>
              <v-progress-circular v-if="loading" indeterminate color="primary"></v-progress-circular>
              <span v-else-if="isValidHealth(item.sbpName)" class="raw-data">
                {{ sbpStats[item.sbpName].blockNum }} / {{ sbpStats[item.sbpName].exceptedBlockNum }}
              </span>
            </td>
            <td class="text-truncate" style="max-width: 200px;">
              <v-link prefix="/account/" :value="item.blockProducingAddress" />
            </td>
          </tr>
        </tbody>
      </v-table>
      <!-- Loading indicator -->
      <v-row v-if="loading" justify="center" class="mt-4">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import { computed, ref } from 'vue';
import { useSbpStore } from '@/stores';
import VLink from '@/components/Link';

export default {
  name: 'SBPList',
  // Handle initial navigation
  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      await vm.loadData();
    });
  },
  setup() {
    const sbpStore = useSbpStore();
    const loading = ref(true); // Track loading state

    // Computed properties for reactive data
    const sbps = computed(() => sbpStore.sbps || []);
    const sbpStats = computed(() => sbpStore.sbpstats || {});

    // Centralized data loading function
    const loadData = async () => {
      loading.value = true;
      try {
        await Promise.all([
          sbpStore.getSbps(),
          sbpStore.getDayIndex(),
        ]);
        await sbpStore.getSbpStats();
      } catch (error) {
        console.error('Error fetching SBPs:', error);
      } finally {
        loading.value = false;
      }
    };

    // Calculate health percentage
    const getHealthPercentage = (sbpName) => {
      const stats = sbpStats.value[sbpName];
      if (!stats || !stats.exceptedBlockNum || stats.exceptedBlockNum === 0) {
        return 'N/A';
      }
      return ((stats.blockNum / stats.exceptedBlockNum) * 100).toFixed(2);
    };

    // Check if health data is valid for displaying raw data
    const isValidHealth = (sbpName) => {
      const stats = sbpStats.value[sbpName];
      return stats && stats.blockNum !== undefined && stats.exceptedBlockNum !== undefined && stats.exceptedBlockNum !== 0;
    };

    // Use Vuetify semantic colors for v-chip
    const getHealthColor = (sbpName) => {
      const percentage = parseFloat(getHealthPercentage(sbpName));
      if (isNaN(percentage)) return 'grey'; // Grey for N/A
      if (percentage > 90) return 'success'; // Green
      if (percentage < 60) return 'error'; // Red
      return 'warning'; // Orange/yellow
    };

    // Load data on component setup (for refresh)
    loadData();

    return {
      sbps,
      sbpStats,
      loading,
      loadData,
      getHealthPercentage,
      getHealthColor,
      isValidHealth,
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

/* Ensure nested span inherits color */
.raw-data {
  color: inherit;
}

/* Adjust chip spacing */
.health-chip {
  margin: 0;
  padding: 0 8px;
}
</style>