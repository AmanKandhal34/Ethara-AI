import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import projectAPI from '../api/project.api';

export default function ProjectDetails() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const projectRes = await projectAPI.getProjectById(id);
                setProject(projectRes.data?.data || null);

                try {
                    const tasksRes = await projectAPI.getProjectTasks(id);
                    setTasks(tasksRes.data?.data || []);
                } catch (taskError) {
                    console.error('Failed to fetch project tasks:', taskError);
                    setTasks([]);
                }
            } catch (error) {
                console.error('Failed to fetch project details:', error);
                setProject(null);
                setTasks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    if (loading) {
        return <Loader />;
    }

    if (!project) {
        return (
            <div className="p-8">
                <EmptyState message="Project not found" />
                <Link to="/projects" className="inline-block mt-4 text-blue-600 hover:text-blue-700">
                    Back to Projects
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">{project.name}</h1>
                    <p className="text-gray-600 mt-2">{project.description || 'No description provided.'}</p>
                </div>
                <Link to="/projects" className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black">
                    Back
                </Link>
            </div>

            {project.thumbnail && (
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-sm text-gray-600 mb-2">Thumbnail</p>
                    <img src={project.thumbnail} alt={project.name} className="max-h-72 rounded-lg object-contain" />
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Project Tasks</h2>
                {tasks.length === 0 ? (
                    <EmptyState message="No tasks in this project" />
                ) : (
                    <div className="space-y-3">
                        {tasks.map((task) => (
                            <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="font-semibold text-gray-800">{task.title}</h3>
                                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">{task.status}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">{task.description || 'No description'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
