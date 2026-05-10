export default function ConfirmModal({
    open,
    title = 'Confirm action',
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    loading = false,
    onConfirm,
    onCancel,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <p className="mt-3 text-sm text-gray-600">{message}</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        title={cancelLabel}
                        className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 disabled:opacity-60"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        title={confirmLabel}
                        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        {loading ? 'Working...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
