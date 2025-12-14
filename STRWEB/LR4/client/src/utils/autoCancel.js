// UI-side setTimeout demo: returns { promise, cancel } to show a cancellable timer
export function autoCancelAfter(ms, onCancel) {
  let timer = null;
  let cancelled = false;
  const promise = new Promise(resolve => {
    timer = setTimeout(() => {
      if (cancelled) return;
      onCancel?.();
      resolve(true);
    }, ms);
  });
  return {
    promise,
    cancel: () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    }
  };
}



