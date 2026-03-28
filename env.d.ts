/// <reference types="vite/client" />

declare const __DEV__: boolean;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ImportMetaEnv {
      PORT?: string;
      NODE_ENV?: 'development' | 'production';
      DEBUG?: string;
      DEVTOOL?: string;
    }
  }
}

export {};
