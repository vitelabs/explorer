<template>
  <div class="d-flex align-center">
    <v-text-field
      v-model="input"
      :placeholder="placeholder"
      clearable
      variant="solo-filled"
      @keyup.enter="search"
      class="flex-grow-1"
      hide-details
      append-inner-icon="mdi-magnify"
      single-line
      dense
      @click:append-inner="search"
    ></v-text-field>
    <!-- <v-btn
      color="primary"
      variant="flat"
      class="ml-2"
      @click="search"
    >
      Search
    </v-btn> -->
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'SearchComponent',
  props: {
    placeholder: String,
  },
  setup(props, { emit }) {
    const input = ref('');

    const search = () => {
      emit('search', input.value);
    };

    return {
      input,
      search,
    };
  },
};
</script>

<style scoped>
.v-text-field {
  width: 100%;
  min-width: 500px;
  max-width: 800px;
}
.v-text-field :deep(.v-field__input) {
  font-size: 13px;
}
</style>