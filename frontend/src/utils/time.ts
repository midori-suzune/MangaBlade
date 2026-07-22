export function getTimeAgo(updatedAt: string) {
    const updatedTime = new Date(updatedAt).getTime();

    if (Number.isNaN(updatedTime)) {
        return "Vừa Xong";
    }

    const diffMs = Date.now() - updatedTime;
    const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffMinutes < 1) {
        return "Vừa Xong";
    }

    if (diffMinutes < 60) {
        return `${diffMinutes} Phút Trước`;
    }

    if (diffHours < 24) {
        return `${diffHours} Giờ Trước`;
    }

    return new Date(updatedTime).toLocaleDateString('vi-VN');
}
