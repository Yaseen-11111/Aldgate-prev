import { useEffect } from 'react';
import { useLocation } from 'wouter';

export function ScrollToTop() {
    const [location] = useLocation();

    useEffect(() => {
        // If scrolling the whole page:
        window.scrollTo(0, 0);

        // OR if using a custom scroll container, target it directly:
        // const container = document.getElementById('your-scroll-container-id');
        // if (container) container.scrollTop = 0;
    }, [location, window.location.search]);

    return null;
}