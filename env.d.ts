/// <reference types="vite/client" />

declare module "*?sharedworker" {
  const workerConstructor: {
    new (): SharedWorker;
  };
  export default workerConstructor;
}
