import { useState, useMemo } from 'react';

export function useSearch<T>(items: T[] | undefined | null, searchKeys: (keyof T)[]) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = useMemo(() => {
        if (!items) return [];
        if (!searchQuery.trim()) return items;

        const query = searchQuery.toLowerCase();

        return items.filter((item) =>
            searchKeys.some((key) => {
                const value = item[key];
                // Ensure the value exists and convert to string for comparison
                return value != null && String(value).toLowerCase().includes(query);
            })
        );
    }, [items, searchQuery, searchKeys]);

    return {
        searchQuery,
        setSearchQuery,
        filteredItems,
    };
}