<template>
  <v-container class="background-muted">
    <v-row class="pa-4">
      <v-col>
        <p class="text-h5">Snapshot Block Details</p>

        <v-table v-if="block">
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
              <td>Mined By</td>
              <td>{{ block.producer }}</td>
            </tr>
            <tr>
              <td>SBP</td>
              <td>
                <v-link
                  prefix="/sbp/"
                  :value="getSbpName(sbps, block.producer)"
                />
              </td>
            </tr>
            <tr>
              <td>Time</td>
              <td>{{ new Date(block.timestamp * 1000).toLocaleString() }}</td>
            </tr>
          </tbody>
        </v-table>

        <p class="text-h5 mt-4" v-if="block && block.snapshotData">
          Account Blocks
        </p>

        <v-table v-if="block && block.snapshotData">
          <thead>
            <tr>
              <th>Hash</th>
              <th>Type</th>
              <th>Account Address</th>
              <th>Height</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in accountblocks" :key="item.hash">
              <td>
                <v-link prefix="/tx/" :value="item.hash" />
              </td>
              <td>
                {{ isReceive(item.blockType) ? 'Receive' : 'Send' }}
                <v-icon
                class="ml-2"
                style="font-size: 14px;"
                >
                  {{ isReceive(item.blockType) ? 'mdi-arrow-bottom-left' : 'mdi-arrow-top-right' }}
                </v-icon>
              </td>
              <td>
                <v-link
                  prefix="/account/"
                  :value="item.accountAddress"
                  :full="true"
                />
              </td>
              <td>{{ item.height }}</td>
            </tr>
          </tbody>
        </v-table>

        <p class="text-h5 mt-4" v-if="block && !block.snapshotData">
          No Account Blocks
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed } from 'vue';
import { useSnapshotStore, useSbpStore } from '@/stores';
import VLink from '@/components/Link';
import { getSbpName, blockTypeText, isReceive } from '@/utils/_';

export default {
  name: 'SnapshotDetail',
  setup() {
    const snapshotStore = useSnapshotStore();
    const sbpStore = useSbpStore();

    const block = ref(null);
    const accountblocks = ref(null);

    const sbps = computed(() => sbpStore.sbps);

    const getSbps = () => sbpStore.getSbps();
    const getBlock = async (heightorhash) => {
      const height = parseInt(heightorhash, 10);
      if (height === 1) {
        block.value = { height: 1 };
        accountblocks.value = [];
        return Promise.resolve(1);
      }

      const promise =
        heightorhash.length !== 64
          ? snapshotStore.getSnapshotBlockByHeight(height)
          : snapshotStore.getSnapshotBlockByHash(heightorhash);

      const blockData = await promise;
      
      block.value = Object.seal(blockData);
      const blockheight = blockData.height;
      const chunks = await snapshotStore.getSnapshots({ start: blockheight, end: blockheight });
      console.log(chunks);
      accountblocks.value = Object.seal(chunks[0].AccountBlocks);
      return blockheight;
    };

    return {
      block,
      accountblocks,
      sbps,
      getSbps,
      getBlock,
      getSbpName,
      blockTypeText,
      isReceive,
    };
  },
  beforeRouteEnter(to, from, next) {
    const heightorhash = to.params.heightorhash;
    next(vm => {
      vm.getSbps();
      vm.getBlock(heightorhash);
    });
  },
  beforeRouteUpdate(to, from, next) {
    const heightorhash = to.params.heightorhash;
    this.getBlock(heightorhash).then(() => next());
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