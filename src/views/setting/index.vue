<template>
  <v-container class="pa-4">
    <p class="text-h5">Settings</p>
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-select
          v-model="theme"
          :items="themes"
          label="Theme"
          variant="outlined"
          @change="updateTheme"
        ></v-select>
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="language"
          :items="languages"
          label="Language"
          variant="outlined"
          @change="updateLanguage"
        ></v-select>
      </v-col>
    </v-row>

    <p class="text-h6 mt-6">Node Configuration</p>
    <v-row class="mt-4">
      <v-col cols="12">
        <v-table>
          <thead>
            <tr>
              <th>Name</th>
              <th>URL</th>
              <th>Selected</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="node in nodes" :key="node.url">
              <td>{{ node.name }}</td>
              <td>{{ node.url }}</td>
              <td>
                <v-radio
                  v-model="selectedNodeUrl"
                  :value="node.url"
                  @change="selectNode(node.url)"
                ></v-radio>
              </td>
              <td>
                <v-btn
                  text
                  @click="editNode(node)"
                  :disabled="isDefaultNode(node)"
                >
                  Edit
                </v-btn>
                <v-btn
                  text
                  color="error"
                  @click="removeNode(node.url)"
                  :disabled="isDefaultNode(node)"
                >
                  Delete
                </v-btn>
                <v-btn
                  text
                  color="primary"
                  @click="diagnoseNode(node)"
                >
                  Diagnose
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-btn color="primary" @click="addNodeDialog = true">Add Node</v-btn>
      </v-col>
    </v-row>
    <!-- Add/Edit Node Dialog -->
    <v-dialog v-model="addNodeDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ editingNode ? 'Edit Node' : 'Add Node' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="nodeForm.name" label="Name"></v-text-field>
          <v-text-field
            v-model="nodeForm.url"
            label="URL"
            :error-messages="urlError"
            @input="validateUrl"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="addNodeDialog = false">Cancel</v-btn>
          <v-btn color="primary" :disabled="!!urlError" @click="saveNode">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Node Diagnosis Dialog -->
    <v-dialog v-model="diagnosisDialog" max-width="600px">
      <v-card>
        <v-card-title>Node Diagnosis</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <p><strong>ID:</strong> {{ diagnosisData.id }}</p>
            </v-col>
            <v-col cols="12" md="6">
              <p><strong>Name:</strong> {{ diagnosisData.name }}</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <p><strong>Height:</strong> {{ diagnosisData.height }}</p>
            </v-col>
            <v-col cols="12" md="6">
              <p><strong>Latency:</strong></p>
              <v-list dense>
                <v-list-item v-for="(latency, index) in diagnosisData.latency" :key="index">
                  <v-list-item-content>
                    {{ getLatencyLabel(index) }}: {{ latency }} ms
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <p><strong>Peers:</strong></p>
              <v-simple-table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Height</th>
                    <th>Reliable</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="peer in diagnosisData.peers" :key="peer.name">
                    <td>{{ peer.name }}</td>
                    <td>{{ peer.height }}</td>
                    <td>{{ peer.reliable ? 'Yes' : 'No' }}</td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="diagnosisDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { computed, ref } from 'vue';
import { useSettingStore, useNodeStore } from '@/stores';
import { DEFAULT_NODE, DEFAULT_NODE_WS } from '@/utils/consts';

export default {
  name: 'SettingPage',
  setup() {
    const settingStore = useSettingStore();
    const nodeStore = useNodeStore();

    const themes = ['light', 'dark'];
    const languages = ['en'];

    const theme = computed({
      get: () => settingStore.theme,
      set: value => settingStore.setTheme(value),
    });

    const language = computed({
      get: () => settingStore.language,
      set: value => settingStore.setLanguage(value),
    });

    const nodes = computed(() => settingStore.nodes);
    const selectedNodeUrl = computed(() =>
      nodes.value.find(node => node.selected)?.url
    );

    const addNodeDialog = ref(false);
    const editingNode = ref(false);
    const nodeForm = ref({ name: '', url: '' });
    const urlError = ref('');

    const diagnosisDialog = ref(false);
    const diagnosisData = ref({
      id: '',
      name: '',
      height: 0,
      latency: [],
      peers: [],
    });

    const updateTheme = value => {
      settingStore.setTheme(value);
    };

    const updateLanguage = value => {
      settingStore.setLanguage(value);
    };

    const validateUrl = () => {
      const urlPattern = /^(http|https|ws|wss):\/\/.+/;
      urlError.value = urlPattern.test(nodeForm.value.url)
        ? ''
        : 'Invalid URL. Must start with http, https, ws, or wss.';
    };

    const addNode = () => {
      nodeForm.value = { name: '', url: '' };
      editingNode.value = false;
      urlError.value = '';
      addNodeDialog.value = true;
    };

    const editNode = node => {
      if (isDefaultNode(node)) return;
      nodeForm.value = { ...node };
      editingNode.value = true;
      urlError.value = '';
      addNodeDialog.value = true;
    };

    const saveNode = () => {
      if (editingNode.value) {
        settingStore.updateNode(nodeForm.value);
      } else {
        settingStore.addNode(nodeForm.value);
      }
      addNodeDialog.value = false;
    };

    const removeNode = url => {
      const node = nodes.value.find(n => n.url === url);
      if (isDefaultNode(node)) return;
      settingStore.removeNode(url);
    };

    const selectNode = url => {
      settingStore.selectNode(url);
    };

    const isDefaultNode = node => {
      return node.url === DEFAULT_NODE || node.url === DEFAULT_NODE_WS;
    };

    const diagnoseNode = async node => {
      try {
        const data = await nodeStore.diagnoseNode(node);
        diagnosisData.value = data;
        diagnosisDialog.value = true;
      } catch (error) {
        console.error('Failed to diagnose node:', error);
      }
    };

    const getLatencyLabel = index => {
      const labels = ['Current', '4H', '12H', '24H'];
      return labels[index] || `Attempt ${index + 1}`;
    };

    return {
      themes,
      languages,
      theme,
      language,
      nodes,
      selectedNodeUrl,
      addNodeDialog,
      nodeForm,
      editingNode,
      urlError,
      diagnosisDialog,
      diagnosisData,
      updateTheme,
      updateLanguage,
      validateUrl,
      addNode,
      editNode,
      saveNode,
      removeNode,
      selectNode,
      isDefaultNode,
      diagnoseNode,
      getLatencyLabel,
    };
  },
};
</script>

<style scoped>
.pa-4 {
  padding: 16px;
}
.mt-4 {
  margin-top: 16px;
}
.mt-6 {
  margin-top: 24px;
}
</style>
