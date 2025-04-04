<template>
  <v-tooltip :text="value" location="top">
    <template #activator="{ props: tooltipProps }">
      <router-link
        :to="prefix + value"
        :class="cls"
        v-bind="tooltipProps"
      >
        {{ text }}
      </router-link>
    </template>
  </v-tooltip>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'VLink', // Added for clarity
  props: {
    value: {
      type: String,
      required: true,
    },
    full: {
      type: Boolean,
      default: false,
    },
    prefix: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const text = computed(() => {
      const text = props.value;
      if (!text || text.length < 16) {
        return text;
      }
      const start = text.startsWith('vite_') ? 5 : 0;
      return `${text.slice(0, start + 8)}...${text.slice(-6)}`;
    });

    const cls = computed(() => (props.full ? '' : 'text-truncate'));

    return {
      text,
      cls,
    };
  },
};
</script>

<style scoped>

</style>