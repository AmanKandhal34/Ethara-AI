import { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import projectAPI from '../api/project.api';
import taskAPI from '../api/task.api';
import folderAPI from '../api/folder.api';
import { useAuth } from '../hooks/useAuth';
import Tooltip from '../components/Tooltip';
import Alert from '../components/Alert';
import ConfirmModal from '../components/ConfirmModal';

const StatCard = ({ title, value, accentClass, children }) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-md ${accentClass} text-white`}>
        <div className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-white/10" />
        <div className="relative flex items-start justify-between gap-4">
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-4xl font-bold">{value}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                {children}
            </div>
        </div>
    </div>
);

const FolderIcon = () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
        <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6A2.5 2.5 0 0 1 20.5 9.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z" />
    </svg>
);

const TaskIcon = () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
        <path d="M8 12.5 10.5 15 16 9.5" />
        <path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
        <path d="M9 12.5 11.2 14.7 15.5 10.5" />
        <path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
    </svg>
);

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

const dataUrlToObjectUrl = (dataUrl) => {
    const [header, base64Data] = dataUrl.split(',');
    const mimeType = header.match(/data:(.*?);base64/)?.[1] || 'application/octet-stream';
    const binary = atob(base64Data || '');
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }

    return {
        mimeType,
        url: URL.createObjectURL(new Blob([bytes], { type: mimeType })),
    };
};

const isTaskOverdue = (task) => {
    if (!task.dueDate || task.status === 'completed') return false;

    const dueDate = new Date(task.dueDate);
    if (Number.isNaN(dueDate.getTime())) return false;

    const dueDateOnly = typeof task.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(task.dueDate)
        ? task.dueDate.slice(0, 10)
        : null;

    if (dueDateOnly) {
        const [year, month, day] = dueDateOnly.split('-').map(Number);
        const endOfDueDay = new Date(year, month - 1, day, 23, 59, 59, 999);
        return endOfDueDay < new Date();
    }

    return dueDate < new Date();
};

export default function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [folders, setFolders] = useState([]);
    const [stats, setStats] = useState({ projects: 0, tasks: 0, completed: 0 });
    const [loading, setLoading] = useState(true);
    const [deletingUploadKey, setDeletingUploadKey] = useState('');
    const [selectedUpload, setSelectedUpload] = useState(null);
    const [viewingUploadKey, setViewingUploadKey] = useState('');
    const [deletingProjectId, setDeletingProjectId] = useState('');
    const [deletingTaskId, setDeletingTaskId] = useState('');
    const [notice, setNotice] = useState({ type: '', message: '' });
    const [confirmAction, setConfirmAction] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const { user } = useAuth();

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [projectsRes, tasksRes, completedTasksRes, foldersRes] = await Promise.all([
                projectAPI.getProjects(),
                taskAPI.getTasks(),
                taskAPI.getTasks({ status: 'completed' }),
                folderAPI.getFolders(),
            ]);
            setProjects(projectsRes.data?.data || []);
            setTasks(tasksRes.data?.data || []);
            setFolders(foldersRes.data?.data || []);
            setStats({
                projects: projectsRes.data?.pagination?.total || 0,
                tasks: tasksRes.data?.pagination?.total || 0,
                completed: completedTasksRes.data?.pagination?.total || 0,
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setProjects([]);
            setTasks([]);
            setFolders([]);
            setStats({ projects: 0, tasks: 0, completed: 0 });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    const folderNameById = new Map(folders.map((folder) => [folder.id, folder.name]));
    const projectNameById = new Map(projects.map((project) => [project.id, project.name]));

    const getFolderName = (folderId) => folderNameById.get(folderId) || 'No folder';
    const getProjectName = (projectId) => projectNameById.get(projectId) || 'No project';

    const taskUploads = tasks.flatMap((task) =>
        (Array.isArray(task.attachments) ? task.attachments : []).flatMap((attachment, index) => (
            typeof attachment === 'string'
                ? [{
                    type: 'task',
                    taskId: task.id,
                    title: task.title,
                    label: `Task attachment ${index + 1}`,
                    index,
                    key: `task:${task.id}:${index}`,
                }]
                : []
        ))
    );

    const projectUploads = projects
        .filter((project) => typeof project.thumbnail === 'string' && project.thumbnail)
        .map((project) => ({
            type: 'project',
            projectId: project.id,
            title: project.name,
            label: 'Project thumbnail',
            index: 0,
            key: `project:${project.id}:thumbnail`,
        }));

    const uploads = [...projectUploads, ...taskUploads];
    const activeProjects = projects.filter((project) => project.status === 'active').length;
    const overdueTasks = tasks.filter(isTaskOverdue).length;
    const completionRate = stats.tasks > 0 ? Math.round((stats.completed / stats.tasks) * 100) : 0;

    const handleViewUpload = async (upload) => {
        try {
            setViewingUploadKey(upload.key);
            const response = upload.type === 'project'
                ? await projectAPI.getProjectThumbnail(upload.projectId)
                : await taskAPI.getTaskAttachment(upload.taskId, upload.index);

            if (selectedUpload?.url) {
                URL.revokeObjectURL(selectedUpload.url);
            }

            setSelectedUpload({
                ...upload,
                ...dataUrlToObjectUrl(response.data?.data || ''),
            });
        } catch (error) {
            console.error('Failed to view upload:', error);
            setNotice({ type: 'error', message: error.response?.data?.message || 'Failed to view upload.' });
        } finally {
            setViewingUploadKey('');
        }
    };

    const deleteUpload = async (upload) => {
        try {
            setDeletingUploadKey(upload.key);
            if (upload.type === 'project') {
                await projectAPI.deleteProjectThumbnail(upload.projectId);
            } else {
                await taskAPI.deleteTaskAttachment(upload.taskId, upload.index);
            }
            if (selectedUpload?.key === upload.key) {
                URL.revokeObjectURL(selectedUpload.url);
                setSelectedUpload(null);
            }
            setNotice({ type: 'success', message: `${upload.label} deleted successfully.` });
            await fetchDashboardData();
        } catch (error) {
            console.error('Failed to delete upload:', error);
            setNotice({ type: 'error', message: error.response?.data?.message || 'Failed to delete upload.' });
        } finally {
            setDeletingUploadKey('');
        }
    };

    const closeUploadPreview = () => {
        if (selectedUpload?.url) {
            URL.revokeObjectURL(selectedUpload.url);
        }
        setSelectedUpload(null);
    };

    const deleteProject = async (projectId) => {
        try {
            setDeletingProjectId(projectId);
            await projectAPI.deleteProject(projectId);
            setNotice({ type: 'success', message: 'Project deleted successfully.' });
            await fetchDashboardData();
        } catch (error) {
            console.error('Failed to delete project:', error);
            setNotice({ type: 'error', message: error.response?.data?.message || 'Failed to delete project.' });
        } finally {
            setDeletingProjectId('');
        }
    };

    const deleteTask = async (taskId) => {
        try {
            setDeletingTaskId(taskId);
            await taskAPI.deleteTask(taskId);
            setNotice({ type: 'success', message: 'Task deleted successfully.' });
            await fetchDashboardData();
        } catch (error) {
            console.error('Failed to delete task:', error);
            setNotice({ type: 'error', message: error.response?.data?.message || 'Failed to delete task.' });
        } finally {
            setDeletingTaskId('');
        }
    };

    const handleConfirmAction = async () => {
        if (!confirmAction) return;

        const action = confirmAction;
        setConfirmAction(null);

        if (action.type === 'project') {
            await deleteProject(action.id);
        } else if (action.type === 'task') {
            await deleteTask(action.id);
        } else if (action.type === 'upload') {
            await deleteUpload(action.upload);
        }
    };

    return (
        <div className="p-8">
            <ConfirmModal
                open={Boolean(confirmAction)}
                title={confirmAction?.title || 'Confirm delete'}
                message={confirmAction?.message || 'This action cannot be undone.'}
                onCancel={() => setConfirmAction(null)}
                onConfirm={handleConfirmAction}
            />
            {selectedUpload && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-8">
                    <div className="w-full max-w-5xl bg-white rounded-lg shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-200">
                            <div className="min-w-0">
                                <h3 className="font-semibold text-gray-800 truncate">{selectedUpload.title}</h3>
                                <p className="text-sm text-gray-500 truncate">{selectedUpload.label}</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeUploadPreview}
                                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800"
                            >
                                Close
                            </button>
                        </div>
                        {selectedUpload.mimeType === 'application/pdf' ? (
                            <object data={selectedUpload.url} type="application/pdf" className="h-[75vh] w-full bg-white">
                                <div className="p-6 text-center text-gray-700">
                                    PDF preview is not available in this browser.
                                    <a href={selectedUpload.url} target="_blank" rel="noreferrer" className="ml-2 text-blue-600 underline">
                                        Open PDF
                                    </a>
                                </div>
                            </object>
                        ) : (
                            <iframe
                                src={selectedUpload.url}
                                title={`${selectedUpload.title} upload preview`}
                                className="h-[75vh] w-full bg-white"
                            />
                        )}
                    </div>
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800">
                    Welcome, {user?.name || 'User'}!
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                    You have <span className="font-semibold">{stats.tasks}</span> tasks and <span className="font-semibold">{stats.projects}</span> projects.
                </p>
            </div>
            <Alert type={notice.type} message={notice.message} onClose={() => setNotice({ type: '', message: '' })} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard title="Total Projects" value={stats.projects} accentClass="bg-gradient-to-br from-sky-600 to-blue-700">
                    <FolderIcon />
                </StatCard>
                <StatCard title="Total Tasks" value={stats.tasks} accentClass="bg-gradient-to-br from-emerald-600 to-green-700">
                    <TaskIcon />
                </StatCard>
                <StatCard title="Completed Tasks" value={stats.completed} accentClass="bg-gradient-to-br from-violet-600 to-purple-700">
                    <CheckIcon />
                </StatCard>
            </div>

            <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
                <Tooltip text="Projects currently marked active" className="block">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-sm text-gray-500">Active Projects</p>
                    <p className="mt-1 text-2xl font-bold text-gray-800">{activeProjects}</p>
                </div>
                </Tooltip>
                <Tooltip text="Tasks past due and not completed" className="block">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-sm text-gray-500">Overdue Tasks</p>
                    <p className="mt-1 text-2xl font-bold text-red-600">{overdueTasks}</p>
                </div>
                </Tooltip>
                <Tooltip text="Completed tasks divided by total tasks" className="block">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-sm text-gray-500">Completion Rate</p>
                    <p className="mt-1 text-2xl font-bold text-green-700">{completionRate}%</p>
                </div>
                </Tooltip>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Recent Projects</h2>
                    {projects.length === 0 ? (
                        <EmptyState message="No projects yet" />
                    ) : (
                        <div className="space-y-4">
                            {projects.slice(0, 5).map((project) => (
                                <div key={project.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between gap-4" title={`Created ${formatDateTime(project.createdAt)}`}>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-gray-800 truncate" title={project.name}>{project.name}</h3>
                                        <p className="text-gray-600 text-sm truncate" title={project.description || 'No description'}>
                                            {project.description || 'No description'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1" title={`Parent folder: ${getFolderName(project.folderId)}`}>
                                            Parent: {getFolderName(project.folderId)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Created: {formatDateTime(project.createdAt)}</p>
                                    </div>
                                    <Tooltip text={`Delete project ${project.name}`}>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmAction({
                                                type: 'project',
                                                id: project.id,
                                                title: 'Delete project',
                                                message: `Delete "${project.name}" and all its tasks?`,
                                            })}
                                            disabled={deletingProjectId === project.id}
                                            className="shrink-0 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
                                        >
                                            {deletingProjectId === project.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </Tooltip>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-4">Recent Tasks</h2>
                    {tasks.length === 0 ? (
                        <EmptyState message="No tasks yet" />
                    ) : (
                        <div className="space-y-4">
                            {tasks.slice(0, 5).map((task) => (
                                <div key={task.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between gap-4" title={`Due ${formatDateTime(task.dueDate)}`}>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-gray-800 truncate" title={task.title}>{task.title}</h3>
                                        <p className="text-gray-600 text-sm truncate" title={task.description || 'No description'}>
                                            {task.description || 'No description'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1" title={`Parent project: ${getProjectName(task.projectId || task.project)}`}>
                                            Project: {getProjectName(task.projectId || task.project)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1" title={`Parent folder: ${getFolderName(task.folderId)}`}>
                                            Parent: {getFolderName(task.folderId)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Due: {formatDateTime(task.dueDate)}</p>
                                    </div>
                                    <Tooltip text={`Delete task ${task.title}`}>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmAction({
                                                type: 'task',
                                                id: task.id,
                                                title: 'Delete task',
                                                message: `Delete "${task.title}" and its uploads?`,
                                            })}
                                            disabled={deletingTaskId === task.id}
                                            className="shrink-0 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
                                        >
                                            {deletingTaskId === task.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </Tooltip>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4">Recent Uploads</h2>
                {uploads.length === 0 ? (
                    <EmptyState message="No uploaded files yet" />
                ) : (
                    <div className="space-y-3">
                        {uploads.slice(0, 10).map((upload) => (
                            <div key={upload.key} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-800 truncate" title={upload.title}>{upload.title}</p>
                                    <p className="text-sm text-gray-500 truncate" title={upload.label}>{upload.label}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tooltip text={`View ${upload.label}`}>
                                        <button
                                            type="button"
                                            onClick={() => handleViewUpload(upload)}
                                            disabled={viewingUploadKey === upload.key}
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            {viewingUploadKey === upload.key ? 'Opening...' : 'View'}
                                        </button>
                                    </Tooltip>
                                    <Tooltip text={`Delete ${upload.label}`}>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmAction({
                                                type: 'upload',
                                                upload,
                                                title: 'Delete upload',
                                                message: `Delete ${upload.label} from "${upload.title}"?`,
                                            })}
                                            disabled={deletingUploadKey === upload.key}
                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
                                        >
                                            {deletingUploadKey === upload.key ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
