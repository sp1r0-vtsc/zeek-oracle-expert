#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import axios from 'axios';

interface Attestation {
  isbn: string;
  timestamp: number;
  holdings: number;
  signature: string;
}

async function main() {
  const program = new Command();
  program
    .name('library-attestor-cli')
    .description('Batch request library attestations via the running service')
    .requiredOption('-i, --input <file>', 'Input JSON file containing an array of ISBN strings')
    .option('-o, --output <file>', 'Output file path (defaults to stdout)')
    .option('-b, --base-url <url>', 'Base URL of the attestor service', 'http://localhost:3300')
    .parse(process.argv);

  const options = program.opts<{ input: string; output?: string; baseUrl: string }>();
  let isbns: string[];
  try {
    const payload = fs.readFileSync(options.input, 'utf-8');
    isbns = JSON.parse(payload);
    if (!Array.isArray(isbns)) {
      console.error('Input file must be a JSON array of ISBN strings');
      process.exit(1);
    }
  } catch (err: any) {
    console.error(`Failed to read or parse input file: ${err.message}`);
    process.exit(1);
  }

  const results: Attestation[] = [];
  for (const isbn of isbns) {
    process.stdout.write(`Attesting ${isbn}... `);
    try {
      const response = await axios.get<Attestation>(
        `${options.baseUrl}/attestations/library/${encodeURIComponent(isbn)}`
      );
      results.push(response.data);
      console.log('done');
    } catch (err: any) {
      console.error(`error: ${err.message}`);
    }
  }

  const jsonOut = JSON.stringify(results, null, 2);
  if (options.output) {
    try {
      fs.writeFileSync(options.output, jsonOut, 'utf-8');
      console.log(`Wrote ${results.length} attestations to ${options.output}`);
    } catch (err: any) {
      console.error(`Failed to write output file: ${err.message}`);
      process.exit(1);
    }
  } else {
    console.log(jsonOut);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});