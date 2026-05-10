export function formatDate(dateString) {
    if (!dateString) return 'No date set';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? 'No date set' : date.toLocaleDateString('en-US', options);
}

export function formatDateTime(dateString) {
    if (!dateString) return 'No date set';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? 'No date set' : date.toLocaleString('en-US', options);
}

export function getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}
