export default function Tooltip({ text, children, className = '' }) {
    if (!text) return children;

    return (
        <span className={`group relative inline-flex ${className}`}>
            {children}
            <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-max max-w-xs -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg group-hover:block">
                {text}
            </span>
        </span>
    );
}
