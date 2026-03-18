import { useEffect } from 'react';

export const useSiteProtection = () => {
    useEffect(() => {
        // === CONTEXT MENU BLOCKING ===
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        // Add event listeners
        document.addEventListener('contextmenu', handleContextMenu);

        // Cleanup
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);
};
