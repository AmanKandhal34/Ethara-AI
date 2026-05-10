import Card from '../../../components/Card';
import Tooltip from '../../../components/Tooltip';

const formatDateTime = (value) => {
    if (!value) {
        return 'No date set';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'No date set';
    }

    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function TaskCard({ task, onEdit, onDelete }) {
    return (
        <Card className="hover:shadow-lg transition" title={task.title}>
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-800" title={task.title}>{task.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                    }`} title={`Status: ${task.status}`}>
                    {task.status}
                </span>
            </div>
            <p className="text-gray-600 mb-4" title={task.description || 'No description'}>{task.description}</p>
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500" title={`Due ${formatDateTime(task.dueDate)}`}>
                    Due: {formatDateTime(task.dueDate)}
                </span>
                <div className="space-x-2">
                    <Tooltip text={`Edit task ${task.title}`}>
                        <button
                            onClick={() => onEdit(task.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Edit
                        </button>
                    </Tooltip>
                    <Tooltip text={`Delete task ${task.title}`}>
                        <button
                            onClick={() => onDelete(task.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </Tooltip>
                </div>
            </div>
        </Card>
    );
}
