import { defineStore } from 'pinia';
import { atos } from '@/utils/_';
import { useMainStore } from './main';

export const useSbpStore = defineStore('sbp', {
  state: () => ({
    pageSize: 10,
    sbps: [],
    dayIndex: -1,
    sbpName: '',
    sbpstats: {},
    hourSbpstats: {},
    sbpstat: {},
    sbp: {},
    hourSbpstat: {},
    sbpRewards: [],
  }),
  getters: {
    pageNum(state) {
      return Math.ceil(state.dayIndex / state.pageSize);
    },
  },
  actions: {
    async getSbpList() {
      const mainStore = useMainStore();
      const res = await mainStore.getApi.request('contract_getSBPList');
      this.sbps = res;
      console.log(res);
    },
    async getSbps() {
      const mainStore = useMainStore();
      try {
        const res = await mainStore.getApi.request('contract_getSBPVoteList');
        this.sbps = res.map(sbp => {
          sbp.votes = atos(sbp.votes, 18, 0);
          return sbp;
        });
      } catch (error) {
        console.error('Failed to fetch SBPs:', error);
        this.sbps = [];
      }
    },
    async getSbpStats() {
      const mainStore = useMainStore();
      const res = await mainStore.getApi.request('sbpstats_getDaySBPStats', this.dayIndex, this.dayIndex);
      this.sbpstats = {};
      if (res && res.length > 0 && res[res.length - 1]?.stat?.stats) {
        const m = res[res.length - 1].stat.stats;
        for (let key in m) {
          m[key].voteCnt = atos(m[key].voteCnt, 18, 0);
          this.sbpstats[key] = Object.seal(m[key]);
        }
      }
    },
    async getDayIndex() {
      const mainStore = useMainStore();
      const res = await mainStore.getApi.request('sbpstats_time2Index', null, 2);
      this.dayIndex = res;
    },
    async getSbp(sbpName) {
      const mainStore = useMainStore();
      const res = await mainStore.getApi.request('contract_getSBP', sbpName);
      this.sbpstat = res;
    },
    setSbpName(sbpName) {
      console.log('set sbpName ', sbpName);
      this.sbpName = sbpName;
      this.sbpstat = Object.assign({}, this.sbpstat, this.sbpstats[sbpName]);
      this.hourSbpstat = this.hourSbpstats[sbpName];
    },
    updateRewards(rewards) {
      this.sbpRewards = rewards
        .map(r => {
          let result = Object.assign({}, r.rewardMap[this.sbpName], {});
          result.cycle = r.cycle;
          result.blockProducingReward = atos(result.blockProducingReward, 18, 2);
          result.votingReward = atos(result.votingReward, 18, 2);
          result.totalReward = atos(result.totalReward, 18, 2);
          result.startTime = r.startTime;
          result.endTime = r.endTime;
          return result;
        })
        .sort((a, b) => {
          return b.cycle - a.cycle;
        });
    },
  },
});