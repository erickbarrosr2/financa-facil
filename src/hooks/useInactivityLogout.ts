import { useEffect, useCallback, useRef } from "react";

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour in ms
const LAST_ACTIVITY_KEY = "financa-facil-last-activity";

const USER_EVENTS: Array<keyof WindowEventMap> = [
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "pointermove",
];

/**
 * Hook that tracks user activity and triggers a callback
 * after 1 hour of inactivity. Persists last activity timestamp
 * in localStorage so it survives page reloads.
 */
export function useInactivityLogout(onInactive: () => void, enabled: boolean) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recordActivity = useCallback(() => {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleLogout = useCallback(() => {
    clearTimer();

    const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || Date.now());
    const elapsed = Date.now() - lastActivity;

    // Already past the timeout — logout immediately
    if (elapsed >= INACTIVITY_TIMEOUT) {
      onInactive();
      return;
    }

    // Schedule logout for the remaining time
    timerRef.current = setTimeout(() => {
      onInactive();
    }, INACTIVITY_TIMEOUT - elapsed);
  }, [clearTimer, onInactive]);

  const handleActivity = useCallback(() => {
    recordActivity();
    scheduleLogout();
  }, [recordActivity, scheduleLogout]);

  useEffect(() => {
    if (!enabled) {
      clearTimer();
      return;
    }

    // Check on mount (handles page reload while inactive)
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (lastActivity) {
      const elapsed = Date.now() - Number(lastActivity);
      if (elapsed >= INACTIVITY_TIMEOUT) {
        onInactive();
        return;
      }
    } else {
      recordActivity();
    }

    scheduleLogout();

    // Listen for user activity
    for (const event of USER_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    // Listen for activity in other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LAST_ACTIVITY_KEY) {
        scheduleLogout();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      clearTimer();
      for (const event of USER_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
      window.removeEventListener("storage", handleStorage);
    };
  }, [enabled, clearTimer, handleActivity, onInactive, recordActivity, scheduleLogout]);
}

/** Remove activity timestamp on explicit logout */
export function clearActivityTimestamp() {
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}
