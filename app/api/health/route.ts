// file: app/api/health/route.ts
// description: Liveness and readiness endpoint for deployment platforms and uptime monitors
// reference: server/_core/env.ts, server/db.ts

import { NextResponse, type NextRequest } from 'next/server';
import { getEnvironmentStatus } from '../../../server/_core/env';
import { getDb } from '../../../server/db';

async function checkDatabase() {
  const startedAt = Date.now();

  try {
    const db = await getDb();

    if (!db) {
      return {
        name: 'database',
        status: 'degraded' as const,
        latencyMs: Date.now() - startedAt,
        message: 'Database is not configured or unavailable.'
      };
    }

    await db.$client.execute('select 1 as ok');

    return {
      name: 'database',
      status: 'ok' as const,
      latencyMs: Date.now() - startedAt,
      message: 'Database connection succeeded.'
    };
  } catch (error) {
    return {
      name: 'database',
      status: 'down' as const,
      latencyMs: Date.now() - startedAt,
      message: error instanceof Error ? error.message : 'Unknown database error.'
    };
  }
}

export async function GET(req: NextRequest) {
  const environment = getEnvironmentStatus();
  const database = await checkDatabase();
  const readyMode = req.nextUrl.searchParams.get('ready') === 'true';
  const ready = environment.productionReady && database.status === 'ok';
  const status = readyMode && !ready ? 503 : 200;

  return NextResponse.json({
    service: 'yuber',
    status: ready ? 'ready' : database.status === 'down' ? 'down' : 'degraded',
    ready,
    checkedAt: new Date().toISOString(),
    checks: {
      environment: {
        status: environment.productionReady ? 'ok' : 'degraded',
        appId: environment.appId,
        nodeEnv: environment.nodeEnv,
        missingProduction: environment.missingProduction
      },
      database
    }
  }, { status });
}
