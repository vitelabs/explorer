<template>
  <v-container class="background-muted">
    <v-row class="pa-4">
      <v-col>
        <p class="text-h5">Summary</p>

        <v-table>
          <tbody>
            <tr>
              <td>Name</td>
              <td>{{ sbpstat.name }}</td>
            </tr>
            <tr>
              <td>Votes</td>
              <td>{{ sbpstat.voteCnt }} VITE</td>
            </tr>
            <tr>
              <td>Stats</td>
              <td>
                {{ (sbpstat.blockNum * 100 / sbpstat.exceptedBlockNum).toFixed(2) }}%
                 ( {{ sbpstat.blockNum }} / {{ sbpstat.exceptedBlockNum }} )
              </td>
            </tr>
            <tr>
              <td>Coinbase</td>
              <td>
                <v-link
                  prefix="/account/"
                  :value="sbpstat.blockProducingAddress"
                  :full="true"
                />
              </td>
            </tr>
            <tr>
              <td>Owner</td>
              <td>
                <v-link
                  prefix="/account/"
                  :value="sbpstat.stakeAddress"
                  :full="true"
                />
              </td>
            </tr>
            <tr>
              <td>Reward Address</td>
              <td>
                <v-link
                  prefix="/account/"
                  :value="sbpstat.rewardWithdrawAddress"
                  :full="true"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>

    <v-row class="pa-4">
      <v-col>
        <p class="text-h5">Rewards</p>
        
        <!-- Loading indicator -->
        <v-row v-if="loading" justify="center" class="mt-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-row>

        <!-- Rewards table, shown only when not loading -->
        <v-table v-else>
          <thead>
            <tr>
              <th>Cycle</th>
              <th>Time</th>
              <th>Rewards of Blocks</th>
              <th>Rewards of Votes</th>
              <th>Total Rewards</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in sbpRewards" :key="item.cycle">
              <td>{{ item.cycle }}</td>
              <td>
                {{
                  new Date(item.startTime * 1000).toLocaleString() +
                  ' - ' +
                  new Date(item.endTime * 1000).toLocaleString()
                }}
              </td>
              <td>{{ item.blockProducingReward }} VITE</td>
              <td>{{ item.votingReward }} VITE</td>
              <td>{{ item.totalReward }} VITE</td>
            </tr>
          </tbody>
        </v-table>

        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          @update:modelValue="getRewards"
          class="mt-4"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed, inject } from 'vue';
import { useSbpStore } from '@/stores';
import VLink from '@/components/Link';

export default {
  name: 'SBPDetail',
  beforeRouteEnter(to, from, next) {
    const sbpName = to.params.name;
    next(async (vm) => {
      await vm.loadData(sbpName);
    });
  },
  beforeRouteUpdate(to, from, next) {
    const sbpName = to.params.name;
    this.loadData(sbpName)
      .then(() => next())
      .catch((error) => {
        console.error('Route update error:', error);
        next(false);
      });
  },
  setup() {
    const sbpStore = useSbpStore();
    const api = inject('api'); // Provided by App.vue

    // Reactive variables
    const currentPage = ref(1);
    const loading = ref(false); // Added loading state

    // Computed properties from store
    const sbpstat = computed(() => sbpStore.sbpstat);
    const sbpName = computed(() => sbpStore.sbpName);
    const dayIndex = computed(() => sbpStore.dayIndex);
    const pageSize = computed(() => sbpStore.pageSize);
    const sbpRewards = computed(() => sbpStore.sbpRewards);
    const pageNum = computed(() => sbpStore.pageNum);

    // Computed property for total pages
    const totalPages = computed(() => Math.ceil(dayIndex.value / pageSize.value));

    const getSbpStats = () => sbpStore.getSbpStats();
    const getSbp = (sbpName) => sbpStore.getSbp(sbpName);
    const setSbpName = (sbpName) => sbpStore.setSbpName(sbpName);
    const getDayIndex = () => sbpStore.getDayIndex();
    const updateRewards = (rewards) => sbpStore.updateRewards(rewards);

    const getRewards = async (page) => {
      console.log('Fetching rewards for page:', page);
      loading.value = true; // Set loading to true
      const offset = (page - 1) * pageSize.value;
      const end = Math.max(dayIndex.value - offset, 1);
      const start = Math.max(end - pageSize.value + 1, 1);
      const promises = [];
      const rewards = [];
      
      console.log('dayIndex:', dayIndex.value, 'start:', start, 'end:', end);
      
      for (let cycle = start; cycle <= end; cycle++) {
        promises.push(
          api
            .request('contract_getSBPRewardByCycle', '' + cycle)
            .then((res) => {
              rewards.push(res);
            })
            .catch((err) => console.error(`Error fetching cycle ${cycle}:`, err))
        );
      }

      try {
        await Promise.all(promises);
        console.log('Rewards fetched:', rewards);
        updateRewards(rewards);
      } catch (error) {
        console.error('Error fetching rewards:', error);
      } finally {
        loading.value = false; // Reset loading state
      }
    };

    const loadData = async (sbpName) => {
      try {
        loading.value = true; // Set loading to true
        await getDayIndex();
        await Promise.all([getSbpStats(), getSbp(sbpName)]);
        setSbpName(sbpName);
        await getRewards(currentPage.value);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        loading.value = false; // Reset loading state
      }
    };

    return {
      sbpstat,
      sbpName,
      dayIndex,
      pageSize,
      sbpRewards,
      pageNum,
      currentPage,
      totalPages,
      loading, // Expose loading to template
      getRewards,
      loadData,
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
</style>