type Level = 'debug' | 'info' | 'warn' | 'error';
const ORDER: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };

export interface Logger {
  debug: (msg: string, meta?: object) => void;
  info: (msg: string, meta?: object) => void;
  warn: (msg: string, meta?: object) => void;
  error: (msg: string, meta?: object) => void;
  child: (scope: string) => Logger;
}

export function createLogger(level: Level, scope = 'api'): Logger {
  const emit = (l: Level, msg: string, meta?: object) => {
    if (ORDER[l] < ORDER[level]) return;
    const line = { t: new Date().toISOString(), level: l, scope, msg, ...(meta ?? {}) };
    const out = l === 'error' || l === 'warn' ? process.stderr : process.stdout;
    out.write(`${JSON.stringify(line)}\n`);
  };
  return {
    debug: (m, meta) => emit('debug', m, meta),
    info: (m, meta) => emit('info', m, meta),
    warn: (m, meta) => emit('warn', m, meta),
    error: (m, meta) => emit('error', m, meta),
    child: (s) => createLogger(level, `${scope}:${s}`),
  };
}
