import React, { useState, useCallback, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty, CommandGroup } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { X, Plus, Search, Palette, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CSSClassManagerProps {
  classes: string[];
  onChange: (classes: string[]) => void;
  suggestions?: string[];
  className?: string;
}

// Common Tailwind CSS classes for suggestions
const DEFAULT_SUGGESTIONS = [
  // Layout
  'flex', 'grid', 'block', 'inline', 'inline-block', 'inline-flex', 'inline-grid',
  'hidden', 'visible', 'invisible',
  
  // Flexbox
  'flex-row', 'flex-col', 'flex-wrap', 'flex-nowrap',
  'justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around',
  'items-start', 'items-center', 'items-end', 'items-stretch',
  
  // Grid
  'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-6', 'grid-cols-12',
  'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-6', 'col-span-12',
  
  // Spacing
  'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-6', 'p-8', 'p-12',
  'px-0', 'px-1', 'px-2', 'px-3', 'px-4', 'px-6', 'px-8', 'px-12',
  'py-0', 'py-1', 'py-2', 'py-3', 'py-4', 'py-6', 'py-8', 'py-12',
  'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-6', 'm-8', 'm-12',
  'mx-auto', 'my-auto',
  
  // Sizing
  'w-full', 'w-1/2', 'w-1/3', 'w-2/3', 'w-1/4', 'w-3/4',
  'h-full', 'h-screen', 'h-auto',
  'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-4xl',
  
  // Colors
  'text-black', 'text-white', 'text-gray-900', 'text-gray-700', 'text-gray-500',
  'bg-white', 'bg-black', 'bg-gray-50', 'bg-gray-100', 'bg-gray-900',
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
  
  // Typography
  'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl',
  'font-thin', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold',
  'text-left', 'text-center', 'text-right', 'text-justify',
  
  // Borders
  'border', 'border-0', 'border-2', 'border-4',
  'border-solid', 'border-dashed', 'border-dotted',
  'rounded', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full',
  
  // Effects
  'shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl',
  'opacity-0', 'opacity-50', 'opacity-75', 'opacity-100',
  'hover:opacity-75', 'hover:shadow-lg', 'hover:scale-105',
  
  // Transitions
  'transition', 'transition-all', 'transition-colors', 'transition-transform',
  'duration-150', 'duration-300', 'duration-500', 'duration-700',
  'ease-in', 'ease-out', 'ease-in-out',
];

export function CSSClassManager({ 
  classes, 
  onChange, 
  suggestions = DEFAULT_SUGGESTIONS,
  className 
}: CSSClassManagerProps) {
  const [newClass, setNewClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [copiedClass, setCopiedClass] = useState<string | null>(null);

  // Filter suggestions based on search term and exclude already added classes
  const filteredSuggestions = useMemo(() => {
    return suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !classes.includes(suggestion)
      )
      .slice(0, 50); // Limit to 50 for performance
  }, [suggestions, searchTerm, classes]);

  const handleAddClass = useCallback((className: string) => {
    const trimmedClass = className.trim();
    if (trimmedClass && !classes.includes(trimmedClass)) {
      onChange([...classes, trimmedClass]);
      setNewClass('');
      setSearchTerm('');
      setIsPopoverOpen(false);
    }
  }, [classes, onChange]);

  const handleRemoveClass = useCallback((classToRemove: string) => {
    onChange(classes.filter(cls => cls !== classToRemove));
  }, [classes, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddClass(newClass);
    } else if (e.key === ' ' && newClass.trim()) {
      e.preventDefault();
      handleAddClass(newClass);
    }
  }, [newClass, handleAddClass]);

  const copyClassToClipboard = useCallback(async (className: string) => {
    try {
      await navigator.clipboard.writeText(className);
      setCopiedClass(className);
      setTimeout(() => setCopiedClass(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Add New Class Input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium">CSS Classes</label>
        </div>
        
        <div className="flex gap-2">
          <Input
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add class names (space-separated)..."
            className="flex-1 text-sm"
          />
          
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="px-3"
                title="Browse common classes"
              >
                <Search className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <Command>
                <CommandInput 
                  placeholder="Search classes..." 
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                <CommandList>
                  <CommandEmpty>No classes found.</CommandEmpty>
                  <CommandGroup heading="Tailwind CSS Classes">
                    {filteredSuggestions.map((suggestion) => (
                      <CommandItem
                        key={suggestion}
                        onSelect={() => handleAddClass(suggestion)}
                        className="flex items-center justify-between"
                      >
                        <span className="font-mono text-sm">{suggestion}</span>
                        <Plus className="h-3 w-3 opacity-50" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          <Button
            onClick={() => handleAddClass(newClass)}
            size="sm"
            disabled={!newClass.trim()}
            title="Add class"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Current Classes */}
      {classes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Current Classes ({classes.length})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange([])}
              className="h-6 px-2 text-xs"
              title="Clear all classes"
            >
              Clear All
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border rounded-md bg-muted/20">
            {classes.map((cls, index) => (
              <div key={`${cls}-${index}`} className="group relative">
                <Badge 
                  variant="outline" 
                  className="font-mono text-xs pr-6 hover:bg-accent transition-colors"
                >
                  {cls}
                  
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyClassToClipboard(cls)}
                          className="h-4 w-4 p-0 hover:bg-primary/10"
                        >
                          {copiedClass === cls ? (
                            <Check className="h-2.5 w-2.5 text-green-600" />
                          ) : (
                            <Copy className="h-2.5 w-2.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {copiedClass === cls ? 'Copied!' : 'Copy class'}
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveClass(cls)}
                          className="h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Remove class
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Raw Input Fallback */}
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
          Advanced: Edit as text
        </summary>
        <div className="mt-2 space-y-2">
          <Input
            value={classes.join(' ')}
            onChange={(e) => {
              const newClasses = e.target.value
                .split(/\s+/)
                .filter(cls => cls.trim())
                .filter((cls, index, arr) => arr.indexOf(cls) === index); // Remove duplicates
              onChange(newClasses);
            }}
            placeholder="space-separated class names..."
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Manually edit all classes as space-separated text. Duplicates will be automatically removed.
          </p>
        </div>
      </details>
    </div>
  );
}