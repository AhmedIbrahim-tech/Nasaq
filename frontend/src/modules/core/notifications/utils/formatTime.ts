export function formatRelativeTime(dateString: string, locale: string = 'ar'): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    const isAr = locale.startsWith('ar');

    if (diffSeconds < 60) {
      return isAr ? 'الآن' : 'Just now';
    }

    if (diffMinutes < 60) {
      return isAr ? `منذ ${diffMinutes} دقيقة` : `${diffMinutes}m ago`;
    }

    if (diffHours < 24) {
      return isAr ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    }

    if (diffDays < 7) {
      return isAr ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
    }

    return date.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatFullDateTime(dateString: string, locale: string = 'ar'): string {
  try {
    const date = new Date(dateString);
    const isAr = locale.startsWith('ar');
    return date.toLocaleString(isAr ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}
