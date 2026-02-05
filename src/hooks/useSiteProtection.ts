import { useEffect } from 'react';

export const useSiteProtection = () => {
    useEffect(() => {
        // === CONTEXT MENU BLOCKING ===
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        // === KEYBOARD SHORTCUTS BLOCKING ===
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();

            // F12 (DevTools)
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }

            // Ctrl+Shift+I (DevTools)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && key === 'i') {
                e.preventDefault();
                return false;
            }

            // Ctrl+Shift+J (Console)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && key === 'j') {
                e.preventDefault();
                return false;
            }

            // Ctrl+Shift+C (Inspect Element)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && key === 'c') {
                e.preventDefault();
                return false;
            }

            // Ctrl+U (View Source)
            if ((e.ctrlKey || e.metaKey) && key === 'u') {
                e.preventDefault();
                return false;
            }

            // Ctrl+S (Save Page) - Optional protection
            if ((e.ctrlKey || e.metaKey) && key === 's') {
                e.preventDefault();
                return false;
            }

            // Ctrl+P (Print) - Optional protection
            if ((e.ctrlKey || e.metaKey) && key === 'p') {
                e.preventDefault();
                return false;
            }
        };

        // Add event listeners
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
};
