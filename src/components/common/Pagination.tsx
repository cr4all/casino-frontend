import type { PaginationMeta } from '@/types';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  if (pagination.last_page <= 1) {
    return null;
  }

  const { current_page, last_page, total } = pagination;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted">
        Page {current_page} of {last_page} ({total} total)
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={current_page <= 1}
          onClick={() => onPageChange(current_page - 1)}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-white disabled:opacity-40 hover:bg-surface"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={current_page >= last_page}
          onClick={() => onPageChange(current_page + 1)}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-white disabled:opacity-40 hover:bg-surface"
        >
          Next
        </button>
      </div>
    </div>
  );
}
