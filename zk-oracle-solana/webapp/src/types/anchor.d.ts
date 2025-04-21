declare module '@coral-xyz/anchor' {
  import { Connection, PublicKey } from '@solana/web3.js';

  export const web3: any;

  export class Program {
    constructor(idl: any, programId: string, provider: AnchorProvider);
    methods: any;
  }

  export class AnchorProvider {
    constructor(connection: Connection, wallet: any, opts: any);
    static local(url?: string, opts?: any): AnchorProvider;
    static env(): AnchorProvider;
    static anchor: AnchorProvider;
    readonly connection: Connection;
    readonly wallet: any;
  }
}
