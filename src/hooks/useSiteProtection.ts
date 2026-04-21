import { useEffect } from 'react';

export const useSiteProtection = () => {
    useEffect(() => {
        // === CONTEXT MENU BLOCKING ===
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        // === KEYBOARD SHORTCUT BLOCKING (F12, DevTools, View Source) ===
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent F12
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }

            // Prevent Ctrl+Shift+I (DevTools)
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                return false;
            }

            // Prevent Ctrl+Shift+J (DevTools Console)
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                return false;
            }

            // Prevent Ctrl+Shift+C (DevTools Element Inspect)
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                return false;
            }

            // Prevent Ctrl+U (View Source)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                return false;
            }

            // Prevent Command+Option+I / Command+Option+J / Command+Option+C (Mac)
            if (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'j' || e.key === 'c')) {
                e.preventDefault();
                return false;
            }

            // Prevent Command+Option+U (Mac View Source)
            if (e.metaKey && e.altKey && e.key === 'u') {
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
