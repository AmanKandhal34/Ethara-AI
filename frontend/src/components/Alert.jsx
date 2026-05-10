export default function Alert({ type = 'info', message, onClose }) {
    if (!message) return null;

    const styles = {
        error: 'border-red-200 bg-red-50 text-red-700',
        success: 'border-green-200 bg-green-50 text-green-700',
        info: 'border-blue-200 bg-blue-50 text-blue-700',
    };

    return (
        <div className={`mb-4 flex items-start justify-between gap-4 rounded border px-4 py-3 text-sm ${styles[type] || styles.info}`}>
            <span>{message}</span>
            {onClose && (
                <button type="button" onClick={onClose} title="Dismiss message" className="font-semibold">
                    Close
                </button>
            )}
        </div>
    );
}
