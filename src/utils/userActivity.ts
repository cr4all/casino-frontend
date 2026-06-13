type ActivityListener = () => void;

const listeners = new Set<ActivityListener>();

export function reportUserActivity(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeUserActivity(listener: ActivityListener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
