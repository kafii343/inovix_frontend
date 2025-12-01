declare module 'midtrans-client' {
  export class Snap {
    constructor(config: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });
    createTransaction: (transactionParams: any) => Promise<any>;
    transaction: {
      notification: (notification: any) => Promise<any>;
    };
  }

  export class CoreApi {
    constructor(config: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });
  }

  export default {
    Snap: Snap,
    CoreApi: CoreApi
  };
}