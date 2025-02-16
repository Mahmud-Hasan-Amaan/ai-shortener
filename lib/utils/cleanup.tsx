const cleanupHandlers = new Set<() => void>();

export function registerCleanup(handler: () => void) {
  cleanupHandlers.add(handler);
  return () => cleanupHandlers.delete(handler);
}

function cleanup() {
  cleanupHandlers.forEach((handler) => {
    try {
      handler();
    } catch (error) {
      console.error("Cleanup handler error:", error);
    }
  });
}

["SIGTERM", "SIGINT", "SIGQUIT"].forEach((signal) => {
  process.on(signal, () => {
    cleanup();
    process.exit(0);
  });
});

process.on("exit", cleanup);
