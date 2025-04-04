<template>
  <div class="bg-background">
    <div class="pa-4">
      <p class="text-h5">Known Accounts</p>
      <v-table>
        <tbody class="table-content">
          <tr v-for="item in accounts" :key="item.address">
            <td>
              <v-link prefix="/account/" :value="item.address" :full="true" />
            </td>
            <td>{{ item.desc }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<script>
import VLink from '@/components/Link';
import { settings } from '@/utils/consts';

export default {
  name: 'AccountList',
  computed: {
    accounts() {
      return settings.accounts;
    },
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
</style>