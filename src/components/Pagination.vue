<template>
  <v-pagination
    v-model="current"
    :length="pageNum"
    :total-visible="10"
    prev-icon="mdi-chevron-left"
    next-icon="mdi-chevron-right"
    @update:modelValue="select"
    color="primary"
  ></v-pagination>
</template>

<script>
import { ref, onMounted } from 'vue';
import { log } from '@/utils/log';

export default {
  name: 'PaginationComponent',
  props: {
    pageNum: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {
    const current = ref(1);

    const select = (page) => {
      current.value = page;
      emit('select', current.value);
    };

    onMounted(() => {
      log(`pageNum ${props.pageNum}`);
    });

    return {
      current,
      select,
    };
  },
};
</script>

<style scoped>
.v-pagination .v-btn {
  min-width: 36px;
  height: 36px;
}
</style>