import { useLoadingStore } from "../stores/loadingStore";

export function LoadingSpinner() {
  const isLoading = useLoadingStore((state) => state.isLoading);

  if (!isLoading) {
    return null;
  }

  return (
    <div aria-live="polite" className="global-loading" role="status">
      Loading
    </div>
  );
}
