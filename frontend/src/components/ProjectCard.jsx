import Card from './Card';
import { Link } from 'react-router-dom';
import Tooltip from './Tooltip';

export default function ProjectCard({ project, onDelete }) {
    return (
        <Card className="hover:shadow-lg transition cursor-pointer" title={project.name}>
            <Link to={`/projects/${project.id}`} title={`View project ${project.name}`}>
                <h3 className="text-lg font-semibold text-gray-800 mb-2" title={project.name}>{project.name}</h3>
                <p className="text-gray-600 mb-4" title={project.description || 'No description'}>{project.description}</p>
            </Link>
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500" title={`${project.taskCount || 0} tasks in this project`}>
                    {project.taskCount} tasks
                </span>
                <Tooltip text={`Delete project ${project.name}`}>
                    <button
                        onClick={() => onDelete(project.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Delete
                    </button>
                </Tooltip>
            </div>
        </Card>
    );
}
