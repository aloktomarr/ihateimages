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
