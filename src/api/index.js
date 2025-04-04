import { ViteAPI, HTTP_RPC, WS_RPC } from '@vite/vitejs';
// import http from '@vite/vitejs-http';
// import ws from '@vite/vitejs-ws';
import { log } from '@/utils/log';

export default class Api extends ViteAPI {
  constructor(url) {
    try {
      if (!url) {
        throw new Error('API URL is required');
      }
      let service;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        service = new HTTP_RPC(url);
      } else if (url.startsWith('ws://') || url.startsWith('wss://')) {
        service = new WS_RPC(url);
      } else {
        throw new Error('Invalid URL format. Must start with http://, https://, ws://, or wss://');
      }
      super(service, () => {
        log(`connected to ${url}`);
      });
      this.url = url;
    } catch (error) {
      console.error(`Failed to initialize Api with URL ${url}:`, error);
      throw error; // Ensure the error is propagated
    }
  }

  async request(method, ...args) {
    try {
      return await super.request(method, ...args);
    } catch (error) {
      console.error(`API request failed for method ${method}:`, error);
      throw error;
    }
  }
}