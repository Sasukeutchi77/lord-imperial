import { logger } from './logger';

const logUnhandledError = (label, error, extra = {}) => {
  logger.error(label, {
    ...extra,
    name: error?.name,
    message: error?.message || String(error || ''),
    stack: error?.stack,
  });
};

export const setupGlobalErrorHandling = () => {
  const errorUtils = global.ErrorUtils;
  const cleanups = [];

  if (errorUtils && typeof errorUtils.getGlobalHandler === 'function') {
    const originalHandler = errorUtils.getGlobalHandler();

    errorUtils.setGlobalHandler((error, isFatal) => {
      logUnhandledError('Erreur globale capturée.', error, {
        isFatal: Boolean(isFatal),
      });

      if (typeof originalHandler === 'function') {
        originalHandler(error, isFatal);
      }
    });

    cleanups.push(() => {
      if (typeof originalHandler === 'function') {
        errorUtils.setGlobalHandler(originalHandler);
      }
    });
  }

  const previousUnhandledRejection = globalThis.onunhandledrejection;
  globalThis.onunhandledrejection = (event) => {
    const reason = event?.reason instanceof Error ? event.reason : new Error(String(event?.reason || 'Promise rejetée'));
    logUnhandledError('Promesse non gérée capturée.', reason);

    if (typeof previousUnhandledRejection === 'function') {
      previousUnhandledRejection(event);
    }
  };

  cleanups.push(() => {
    globalThis.onunhandledrejection = previousUnhandledRejection;
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
};
