import { useEffect, useState } from 'react';

export const useAntiCheat = (onViolation) => {
  const [violations, setViolations] = useState([]);
useEffect(() => {
  // Disable text selection
  document.body.style.userSelect = 'none';
  document.body.style.msUserSelect = 'none';

  return () => {
    document.body.style.userSelect = '';
    document.body.style.msUserSelect = '';
  };
}, []);
  useEffect(() => {
    // Disable copy/paste
    const handleCopy = (e) => {
      e.preventDefault();
      // prevent copy
      // logViolation('copy_attempt');
    };

    const handlePaste = (e) => {
      e.preventDefault();
      // prevent past
      // logViolation('paste_attempt');
    };

    // Detect tab/window switch
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation('tab_switch');
      }
    };

    // Detect window blur (switching apps)
    const handleBlur = () => {
      logViolation('window_blur');
    };

    // Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      logViolation('right_click');
    };

    const logViolation = (type) => {
      const violation = { type, timestamp: new Date().toISOString() };
      setViolations(prev => [...prev, violation]);
      onViolation?.(violation);
    };

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

  return { violations };
};
