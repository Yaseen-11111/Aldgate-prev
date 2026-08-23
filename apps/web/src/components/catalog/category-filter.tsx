import { useLocation } from 'wouter';

const CATEGORIES = [
  { id: 'all', label: 'All Collection' },
  { id: 'roller', label: 'Roller Blinds' },
  { id: 'venetian', label: 'Venetian Blinds' },
  { id: 'roman', label: 'Roman Blinds' },
  { id: 'shutter', label: 'Shutters' },
];

interface CategoryFilterProps {
  activeCategory: string | undefined;
}

/** Category pill filter bar for the catalog page. */
export function CategoryFilter({ activeCategory }: CategoryFilterProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {CATEGORIES.map((cat) => {
        const isActive = cat.id === 'all' ? !activeCategory : activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => setLocation(cat.id === 'all' ? '/catalog' : `/catalog?category=${cat.id}`)}
            className={`px-4 py-2 text-sm transition-colors border ${
              isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:border-primary/50 text-foreground'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
