import { useEffect, useState } from 'react';

export const useAntiCheat = (onViolation, { enableFullscreen = false } = {}) => {
  const [violations, setViolations] = useState([]);

  useEffect(() => {
    document.body.style.userSelect = 'none';
    document.body.style.msUserSelect = 'none';
    return () => {
      document.body.style.userSelect = '';
      document.body.style.msUserSelect = '';
    };
  }, []);

  useEffect(() => {
    if (!enableFullscreen) return;
    // Request fullscreen on mount; if user exits, log it as a violation
    document.documentElement.requestFullscreen?.().catch(() => {});

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logViolation('exited_fullscreen');
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement) document.exitFullscreen?.();
    };
  }, [enableFullscreen]);

  useEffect(() => {
    const handleCopy = (e) => e.preventDefault();
    const handlePaste = (e) => e.preventDefault();
    const handleVisibilityChange = () => { if (document.hidden) logViolation('tab_switch'); };
    const handleBlur = () => logViolation('window_blur');
    const handleContextMenu = (e) => { e.preventDefault(); logViolation('right_click'); };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [onViolation]);

  const logViolation = (type) => {
    const violation = { type, timestamp: new Date().toISOString() };
    setViolations(prev => [...prev, violation]);
    onViolation?.(violation);
  };

  return { violations };
};
