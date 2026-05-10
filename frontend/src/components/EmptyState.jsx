export default function EmptyState({ message = 'No data found', icon = '📭' }) {
    return (
        <div className="flex flex-col items-center justify-center h-64">
            <div className="text-4xl mb-4">{icon}</div>
            <p className="text-gray-600 text-lg">{message}</p>
        </div>
    );
}
