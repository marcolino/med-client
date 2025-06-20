import { apiCall } from "./Network";

export class SecureStorage {
  constructor(backend = 'local', options = {}) {
    this.key = null; // CryptoKey object (set after init)
    this.backend = backend;
    this.options = options;
    this.isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;
  }

  // ======================
  // Public Methods
  // ======================

  // Fetch the encryption key from the server
  async init() {
    try {
      const response = await apiCall("get", "/auth/encryptionKey");
      const { key } = response;
      this.key = await this.#importKey(key); // Convert to CryptoKey
      //console.log("CryptoKey:", this.key);
    } catch (error) {
      console.error('Failed to initialize SecureStorage:', error);
      throw error;
    }
  }

  // Convert base64 string to CryptoKey
  async #importKey(base64Key) {
    const rawKey = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
    return crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt key/value
  async set(key, value) {
    if (this.backend === 'local') {
      if (!this.isLocalStorageAvailable) throw new Error('LocalStorage not available');
      if (!this.key) throw new Error('SecureStorage not initialized');

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.key,
        new TextEncoder().encode(JSON.stringify(value))
      );

      localStorage.setItem(key, JSON.stringify({
        iv: Array.from(iv).toString(),
        data: Array.from(new Uint8Array(encrypted)).toString()
      }));
    } else {
      console.error('Sorry, currently the only backend implemented is "local"');
      // Server side storage logic - TODO...
      //apiCall("post", "/auth/storeEncryptedData", { key, value });
    }
  }

  // Decrypt value from key
  async get(key) {
    if (this.backend === 'local') {
      if (!this.isLocalStorageAvailable) throw new Error('LocalStorage not available');
      if (!this.key) throw new Error('SecureStorage not initialized');
      const item = localStorage.getItem(key);
      if (!item) return null;
      const { iv, data } = JSON.parse(item);
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(iv.split(',').map(Number))
        },
        this.key,
        new Uint8Array(data.split(',').map(Number))
      );
      return JSON.parse(new TextDecoder().decode(decrypted));
    } else {
      console.error('Sorry, currently the only backend implemented is "local"');
      return null;
      // Server side retrieval logic - TODO...
      //const data = await apiCall("get", "/auth/loadEncryptedData", { key });
      //return data;
    }
  }
}
