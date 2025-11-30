import { Button } from './ui/button';
import { ScrollArea, ScrollBar } from './ui/scroll-area';

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (categoryId: string | null) => void;
}

export const CategoryFilter = ({ categories, selected, onSelect }: CategoryFilterProps) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        <Button
          variant={selected === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(null)}
          className="flex-shrink-0"
        >
          All Categories
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selected === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect(category.id)}
            className="flex-shrink-0"
          >
            {category.icon && <span className="mr-1">{category.icon}</span>}
            {category.name}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};