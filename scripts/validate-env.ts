// file: scripts/validate-env.ts
// description: Validates deploy-critical environment variable coverage without printing secret values
// reference: server/_core/env.ts, .env.example

import { getEnvironmentStatus } from '../server/_core/env';

const strict = process.argv.includes('--strict') || process.env.NODE_ENV === 'production';
const status = getEnvironmentStatus();
const rows = status.requirements.map(requirement => ({
  variable: requirement.name,
  required: requirement.productionRequired ? 'production' : 'optional',
  configured: requirement.configured ? 'yes' : 'no',
  description: requirement.description
}));

console.table(rows);

if (strict && !status.productionReady) {
  console.error(`Missing production environment variables: ${status.missingProduction.join(', ')}`);
  process.exit(1);
}

console.info(strict ? 'Production environment validation passed.' : 'Environment inventory completed. Use --strict for production gating.');
