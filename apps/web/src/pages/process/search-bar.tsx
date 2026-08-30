import { Search, X } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchBar({
                              value,
                              onChange,
                              placeholder = "Search...",
                              className = "w-full sm:w-72"
                          }: SearchBarProps) {
    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm bg-transparent border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}