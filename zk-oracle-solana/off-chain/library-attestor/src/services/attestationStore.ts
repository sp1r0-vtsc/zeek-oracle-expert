import Database from 'better-sqlite3';
import { Attestation } from './libraryAttestor';

/**
 * AttestationStore manages persistent storage of attestations in SQLite.
 */
export class AttestationStore {
  // SQLite database instance (inferred type)
  private db;

  /**
   * Initialize a new store with the given SQLite file path.
   * @param dbFile Path to SQLite database file
   */
  constructor(dbFile: string) {
    this.db = new Database(dbFile);
    this.init();
  }

  /**
   * Create the attestations table if it does not exist.
   */
  private init(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS attestations (
        isbn TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        holdings INTEGER NOT NULL,
        signature TEXT NOT NULL
      );
    `);
  }

  /**
   * Save a new attestation record to the database.
   * @param att Attestation to persist
   */
  save(att: Attestation): void {
    const stmt = this.db.prepare(
      'INSERT INTO attestations (isbn, timestamp, holdings, signature) VALUES (?, ?, ?, ?)'
    );
    stmt.run(att.isbn, att.timestamp, att.holdings, att.signature);
  }

  /**
   * Retrieve all attestations, ordered by timestamp.
   */
  getAll(): Attestation[] {
    const stmt = this.db.prepare(
      'SELECT isbn, timestamp, holdings, signature FROM attestations ORDER BY timestamp'
    );
    return stmt.all() as Attestation[];
  }

  /**
   * Retrieve attestations for a specific ISBN, ordered by timestamp.
   * @param isbn Book ISBN to filter by
   */
  getByIsbn(isbn: string): Attestation[] {
    const stmt = this.db.prepare(
      'SELECT isbn, timestamp, holdings, signature FROM attestations WHERE isbn = ? ORDER BY timestamp'
    );
    return stmt.all(isbn) as Attestation[];
  }
}