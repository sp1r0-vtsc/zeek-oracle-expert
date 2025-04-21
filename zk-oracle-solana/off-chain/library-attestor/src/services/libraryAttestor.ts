import axios from 'axios';
import { Logger } from 'winston';
import * as nacl from 'tweetnacl';
import * as util from 'tweetnacl-util';

export interface Attestation {
  isbn: string;
  timestamp: number;
  holdings: number;
  signature: string;
}

export class LibraryAttestor {
  private logger: Logger;
  private keyPair: nacl.SignKeyPair;

  constructor(logger: Logger) {
    this.logger = logger;
    this.logger.info('Initializing Library Attestor');

    const envKey = process.env.LIBRARY_ATTESTOR_SECRET_KEY;
    if (!envKey) {
      this.logger.error('Missing LIBRARY_ATTESTOR_SECRET_KEY');
      throw new Error('Missing LIBRARY_ATTESTOR_SECRET_KEY');
    }
    const secretKey = util.decodeBase64(envKey);
    if (secretKey.length !== nacl.sign.secretKeyLength) {
      this.logger.error('Invalid secret key length');
      throw new Error('Invalid secret key length');
    }
    this.keyPair = nacl.sign.keyPair.fromSecretKey(secretKey);
    const pubKeyBase64 = util.encodeBase64(this.keyPair.publicKey);
    this.logger.info('Library Attestor public key', { publicKey: pubKeyBase64 });
  }

  getPublicKey(): string {
    return util.encodeBase64(this.keyPair.publicKey);
  }

  async attest(isbn: string): Promise<Attestation> {
    this.logger.info('Attesting library holdings', { isbn });
    const holdings = await this.fetchEditionCount(isbn);
    const timestamp = Date.now();
    const payload = JSON.stringify({ isbn, timestamp, holdings });
    const signatureUint8 = nacl.sign.detached(util.decodeUTF8(payload), this.keyPair.secretKey);
    const signature = util.encodeBase64(signatureUint8);
    return { isbn, timestamp, holdings, signature };
  }

  private async fetchEditionCount(isbn: string): Promise<number> {
    try {
      const url = `https://openlibrary.org/search.json?isbn=${isbn}&fields=edition_count`;
      const resp = await axios.get(url);
      if (resp.data && Array.isArray(resp.data.docs) && resp.data.docs.length > 0) {
        return resp.data.docs[0].edition_count || 0;
      }
      return 0;
    } catch (err) {
      this.logger.error('Error fetching edition count', { err });
      throw new Error('Failed to fetch edition count');
    }
  }
}