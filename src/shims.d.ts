// heic2any ships no type declarations, declare a minimal surface here.
declare module 'heic2any' {
  interface Heic2AnyOptions {
    blob: Blob;
    toType?: string;
    quality?: number;
    multiple?: boolean;
  }
  const heic2any: (options: Heic2AnyOptions) => Promise<Blob | Blob[]>;
  export default heic2any;
}

// The File Handling API (window.launchQueue) is not in the DOM lib yet.
interface LaunchParams {
  readonly files: readonly FileSystemFileHandle[];
  readonly targetURL?: string;
}
interface LaunchQueue {
  setConsumer(consumer: (params: LaunchParams) => void): void;
}
interface Window {
  launchQueue?: LaunchQueue;
}
