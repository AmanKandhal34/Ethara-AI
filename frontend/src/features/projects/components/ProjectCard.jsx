import Card from '../../../components/Card';
import { Link } from 'react-router-dom';
import Tooltip from '../../../components/Tooltip';

export default function ProjectCard({ project, onEdit, onDelete }) {
    return (
        <Card className="hover:shadow-lg transition cursor-pointer" title={project.name}>
            <h3 className="text-lg font-semibold text-gray-800 mb-2" title={project.name}>{project.name}</h3>
            <p className="text-gray-600 mb-4" title={project.description || 'No description'}>{project.description}</p>
            <div className="flex justify-between items-center gap-2">
                <span className="text-sm text-gray-500" title={`${project.taskCount || 0} tasks in this project`}>
                    {project.taskCount} tasks
                </span>
                <div className="space-x-2">
                    <Tooltip text={`View project ${project.name}`}>
                        <Link
                            to={`/projects/${project.id}`}
                            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800"
                        >
                            View
                        </Link>
                    </Tooltip>
                    <Tooltip text={`Edit project ${project.name}`}>
                        <button
                            onClick={() => onEdit(project)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Edit
                        </button>
                    </Tooltip>
                    <Tooltip text={`Delete project ${project.name}`}>
                        <button
                            onClick={() => onDelete(project.id)}
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
