export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface SyncErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo?: {
    actorEmail?: string | null;
    authMode?: 'password_gate' | 'encore_admin_token' | 'unknown';
  };
}

interface SyncErrorContext {
  actorEmail?: string | null;
  authMode?: 'password_gate' | 'encore_admin_token' | 'unknown';
}

export interface CatalogueSyncStructuredError extends Error {
  syncInfo?: SyncErrorInfo;
}

export function handleSyncError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  context?: SyncErrorContext,
) {
  const info: SyncErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: context
      ? {
          actorEmail: context.actorEmail,
          authMode: context.authMode || 'unknown',
        }
      : undefined,
  };

  console.error('Catalogue Sync Error:', JSON.stringify(info));
  const wrappedError = new Error(JSON.stringify(info)) as CatalogueSyncStructuredError;
  wrappedError.syncInfo = info;
  throw wrappedError;
}
