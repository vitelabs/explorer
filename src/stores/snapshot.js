import { defineStore } from 'pinia';
import { insertList } from '@/utils/_';
import { useMainStore } from './main';

export const useSnapshotStore = defineStore('snapshot', {
  state: () => ({
    pageSize: 10,
    snapshots: [],
  }),
  getters: {
    pageNumber(state) {
      const mainStore = useMainStore();
      return Math.ceil(mainStore.height / state.pageSize);
    },
  },
  actions: {
    update(obj) {
      for (let key in obj) {
        this[key] = obj[key];
      }
    },
    async getSnapshotBlockByHash(hash) {
      const mainStore = useMainStore();
      const api = mainStore.getApi;
      return api.request('ledger_getSnapshotBlockByHash', hash);
    },
    async getSnapshotBlockByHeight(height) {
      const mainStore = useMainStore();
      const api = mainStore.getApi;
      return api.request('ledger_getSnapshotBlockByHeight', height);
    },
    async getSnapshots({ start, end }) {
      console.log('getSnapshots', start, end);
      const mainStore = useMainStore();
      const api = mainStore.getApi;
      const size = end - start + 1;
      const chunks = await api.request('ledger_getChunks', start, end);
      // Check if the size of the snapshots is correct
      
      // if (!chunks || chunks.length !== size) {
      //   console.error('Snapshot size mismatch:', chunks?.length, size);
      //   return; // Do not update if size is incorrect
      // } else {
      //   console.log('got snapshots', chunks);
      // }
      this.snapshots = [];
      for (let i in chunks) {
        this.snapshots = insertList(
          this.snapshots,
          Object.seal(chunks[i].SnapshotBlock),
          'height',
          size
        );
      }
      return chunks;
    },
    async getLatestSnapshots(size = this.pageSize) {
      const mainStore = useMainStore();
      const previousHeight = mainStore.height;
      await mainStore.getHeight();
      const height = mainStore.height;
      if (previousHeight != 0 && previousHeight >= height) {
        return;
      }
      const end = height;
      const start = height - size + 1;
      console.log('getLatestSnapshots', height, size);
      const chunks = await mainStore.getApi.request('ledger_getChunks', start, end);
      // Check if the size of the snapshots is correct
      if (!chunks || chunks.length !== size) {
        console.error('Snapshot size mismatch: real', chunks?.length, 'expect', size);
        return; // Do not update if size is incorrect
      } else {
        console.log('got snapshots', chunks);
      }
      this.snapshots = [];
      for (let i in chunks) {
        this.snapshots = insertList(
          this.snapshots,
          Object.seal(chunks[i].SnapshotBlock),
          'height',
          size
        );
      }
      return chunks;
    },
  },
});