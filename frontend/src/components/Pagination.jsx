export default function Pagination({ pagination, onPageChange }) {
    if (!pagination || pagination.pages <= 1) return null;

    const { page, pages, total, limit } = pagination;
    const start = total === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return (
        <div className="mt-6 flex flex-col gap-3 rounded-lg bg-white p-4 shadow-md sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">
                Showing {start}-{end} of {total}
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="rounded bg-gray-200 px-3 py-2 text-sm text-gray-800 hover:bg-gray-300 disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-sm text-gray-700">
                    Page {page} of {pages}
                </span>
                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= pages}
                    className="rounded bg-gray-200 px-3 py-2 text-sm text-gray-800 hover:bg-gray-300 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
