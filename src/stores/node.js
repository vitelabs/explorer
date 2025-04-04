import { defineStore } from 'pinia';
import Api from '@/api';

export const useNodeStore = defineStore('node', {
  state: () => ({
    diagnostics: {}, // Store diagnostics for nodes
  }),
  actions: {
    async diagnoseNode(node) {
      try {
        const api = new Api(node.url); // Create a temporary API instance
        const nodeInfo = await api.request('net_nodeInfo');
        console.log('Node Info:', nodeInfo);
        const latency = nodeInfo.latency || [];
        const peers = (nodeInfo.peers || []).map(peer => ({
          name: peer.name || 'Unknown',
          height: peer.height || 0,
          reliable: peer.reliable || false,
        }));
        this.diagnostics[node.url] = {
          id: nodeInfo.id,
          name: nodeInfo.name,
          height: nodeInfo.height,
          latency,
          peers,
        };
        return this.diagnostics[node.url];
      } catch (error) {
        console.error('Failed to diagnose node:', error);
        throw error;
      }
    },
  },
});
