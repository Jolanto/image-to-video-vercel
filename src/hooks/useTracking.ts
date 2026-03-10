export function useTracking() {
  const trackAction = async (type: 'visit' | 'upload' | 'download' | 'share') => {
    try {
      // Get or create a userId stored in localStorage to mock sessions
      let userId = localStorage.getItem('img2vid_user_id');
      if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('img2vid_user_id', userId);
      }

      await fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, type, source: document.referrer || 'direct' }),
      });
    } catch (err) {
      console.error('Failed to track action', err);
    }
  };

  return { trackAction };
}
