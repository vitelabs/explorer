<template>
  <v-app-bar app color="primary" dark style="background-color: #1976d2 !important;">
    <!-- Navigation Menu -->
    <v-btn text @click="router.push('/')">
      <v-icon left>mdi-home</v-icon>
      Home
    </v-btn>
    <v-btn text>
      <router-link to="/snapshots" exact style="text-decoration: none; color: inherit;">Snapshots</router-link>
    </v-btn>
    <v-btn text>
      <router-link to="/sbp" style="text-decoration: none; color: inherit;">SBP</router-link>
    </v-btn>
    <v-btn text>
      <router-link to="/accounts" style="text-decoration: none; color: inherit;">Accounts</router-link>
    </v-btn>
    <v-btn text>
      <router-link to="/tokens" style="text-decoration: none; color: inherit;">Tokens</router-link>
    </v-btn>
    <v-btn text>
      <router-link to="/settings" style="text-decoration: none; color: inherit;">Settings</router-link>
    </v-btn>

    <v-spacer></v-spacer>

    <!-- Search Bar -->
    <div class="flex-grow-1 search-container" style="max-width: 800px;">
      <search
        placeholder="Search by Address / Block Hash / Snapshot Height / Token Id"
        @search="search"
      />
    </div>
  </v-app-bar>
</template>

<script>
import { inject } from 'vue';
import { useRouter } from 'vue-router';
import Search from '@/components/Search';
import { withCommas } from '@/utils/_';

export default {
  setup() {
    const router = useRouter();
    const api = inject('api'); // Inject the api provided by App.vue

    const search = async (value) => {
      value = value.trim();
      if (!value) {
        return;
      }
      if (/^-?\d+$/.test(value)) {
        router.push(`/snapshot/${value}`).catch(() => {});
      } else if (value.startsWith('tti_') && value.length === 28) {
        router.push(`/token/${value}`).catch(() => {});
      } else if (value.startsWith('vite_') && value.length === 55) {
        router.push(`/account/${value}`).catch(() => {});
      } else if (value.length === 64) {
        const block = await api.request('ledger_getAccountBlockByHash', value);
        if (block) {
          router.push(`/tx/${value}`).catch(() => {});
        }
        const snapshotBlock = await api.request('ledger_getSnapshotBlockByHash', value);
        if (snapshotBlock) {
          router.push(`/snapshot/${value}`).catch(() => {});
        }
      }
      console.log('search ' + value + ', length:' + value.length);
      console.log('' + router.currentRoute.value.path);
    };

    const menuItems = [
      { title: 'Snapshots', path: '/snapshots' },
      { title: 'SBP', path: '/sbp' },
      { title: 'Accounts', path: '/accounts' },
      { title: 'Tokens', path: '/tokens' },
      { title: 'Settings', path: '/settings' },
    ];

    return {
      menuItems,
      withCommas,
      search,
      router,
    };
  },
  components: {
    Search,
  },
};
</script>

<style scoped>
.v-toolbar-title {
  font-size: 1.5rem;
  font-weight: bold;
}
.v-btn {
  min-width: 0;
}
.search-container {
  margin-left: auto;
  margin-right: 20px; /* 在右侧留出一些空间 */
}
</style>