import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty, CommandGroup } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X, Plus, Search, Palette, Copy, Check, Eye, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SelectedElement } from '@/types';

interface LiveCanvasCSSClassManagerProps {
  selectedElement: SelectedElement | null;
  onClose?: () => void;
  className?: string;
}

// Enhanced suggestions with LiveCanvas-aware classes
const LIVECANVAS_SUGGESTIONS = [
  // LiveCanvas specific classes
  'lc-block', 'lc-element', 'lc-container', 'lc-row', 'lc-column',
  'lc-widget', 'lc-component', 'lc-section', 'lc-highlight',
  
  // Bootstrap classes (commonly used with LiveCanvas)
  'container', 'container-fluid', 'row', 'col', 'col-12', 'col-6', 'col-4', 'col-3',
  'd-flex', 'd-block', 'd-none', 'd-inline', 'd-inline-block',
  'justify-content-center', 'justify-content-between', 'justify-content-end',
  'align-items-center', 'align-items-start', 'align-items-end',
  'text-center', 'text-left', 'text-right', 'text-uppercase', 'text-lowercase',
  'mb-0', 'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-5',
  'mt-0', 'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mt-5',
  'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5',
  'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-5',
  
  // Common utility classes
  'btn', 'btn-primary', 'btn-secondary', 'btn-success', 'btn-danger',
  'card', 'card-body', 'card-header', 'card-footer',
  'form-control', 'form-group', 'input-group',
  'list-group', 'list-group-item',
  'table', 'table-striped', 'table-bordered',
  'navbar', 'nav', 'nav-link', 'dropdown',
  'modal', 'modal-dialog', 'modal-content',
  'alert', 'alert-primary', 'alert-success', 'alert-warning', 'alert-danger',
  
  // Responsive classes
  'img-responsive', 'img-fluid', 'w-100', 'h-100',
  'visible-xs', 'visible-sm', 'visible-md', 'visible-lg',
  'hidden-xs', 'hidden-sm', 'hidden-md', 'hidden-lg',
  
  // Animation classes
  'fade', 'fadeIn', 'fadeOut', 'slideIn', 'slideOut',
  'animate__animated', 'animate__fadeIn', 'animate__slideIn',
];

export function LiveCanvasCSSClassManager({ 
  selectedElement, 
  onClose,
  className 
}: LiveCanvasCSSClassManagerProps) {
  const [classes, setClasses] = useState<string[]>([]);
  const [newClass, setNewClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [copiedClass, setCopiedClass] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveMappedClasses, setLiveMappedClasses] = useState<Array<{className: string; selector: string; sheetName: string;}>>([]);

  // Get LiveCanvas utilities from window
  const getLCUtils = useCallback(() => {
    return (window as any).LCUtils || {};
  }, []);

  // Generate CSS selector for the current element using LiveCanvas CSSelector
  const getElementSelector = useCallback(() => {
    if (!selectedElement?.element) return null;
    
    try {
      const CSSelector = (window as any).CSSelector;
      if (typeof CSSelector === 'function') {
        const selector = CSSelector(selectedElement.element);
        if (selector && selector.trim() !== '') {
          return selector.trim();
        }
      }
      
      // Enhanced fallback selector generation
      const element = selectedElement.element;
      
      // Try ID first
      if (element.id && element.id.trim() !== '') {
        return `#${element.id.trim()}`;
      }
      
      // Try class names
      if (element.className && element.className.trim() !== '') {
        const firstClass = element.className.trim().split(/\s+/)[0];
        if (firstClass) {
          return `.${firstClass}`;
        }
      }
      
      // Try data attributes
      const dataId = element.getAttribute('data-id');
      if (dataId && dataId.trim() !== '') {
        return `[data-id="${dataId.trim()}"]`;
      }
      
      // Generate unique selector based on position
      const tagName = element.tagName.toLowerCase();
      let selector = tagName;
      
      // Get parent context for uniqueness
      const parent = element.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(child => child.tagName === element.tagName);
        if (siblings.length > 1) {
          const index = siblings.indexOf(element);
          selector = `${tagName}:nth-of-type(${index + 1})`;
        }
      }
      
      return selector;
    } catch (error) {
      console.error('Error generating element selector:', error);
      // Last resort fallback
      return selectedElement.element.tagName.toLowerCase();
    }
  }, [selectedElement]);

  // Load current classes from the selected element
  useEffect(() => {
    if (!selectedElement?.element) {
      setClasses([]);
      return;
    }

    try {
      // Get current classes from the element
      const elementClasses = Array.from(selectedElement.element.classList);
      setClasses(elementClasses);
      setError(null);

      // Load live CSS classes mapping for suggestions
      loadLiveCSSMapping();
    } catch (error) {
      console.error('Error loading element classes:', error);
      setError('Failed to load element classes');
    }
  }, [selectedElement]);

  // Load live CSS classes from the page using LiveCanvas utilities
  const loadLiveCSSMapping = useCallback(async () => {
    try {
      const getClassesMappedArray = (window as any).getClassesMappedArray;
      if (typeof getClassesMappedArray === 'function') {
        const mappedClasses = getClassesMappedArray();
        setLiveMappedClasses(mappedClasses || []);
      }
    } catch (error) {
      console.error('Error loading live CSS mapping:', error);
    }
  }, []);

  // Get enhanced suggestions including live classes from the page
  const enhancedSuggestions = useMemo(() => {
    const liveClassNames = liveMappedClasses
      .map(cls => cls?.className)
      .filter(className => className && typeof className === 'string' && className.trim() !== '');
    const allSuggestions = [...new Set([...LIVECANVAS_SUGGESTIONS, ...liveClassNames])];
    return allSuggestions.filter(suggestion => suggestion && typeof suggestion === 'string' && suggestion.trim() !== '');
  }, [liveMappedClasses]);

  // Filter suggestions based on search term and exclude already added classes
  const filteredSuggestions = useMemo(() => {
    return enhancedSuggestions
      .filter(suggestion => 
        suggestion && // Check suggestion exists
        typeof suggestion === 'string' && // Ensure it's a string
        suggestion.trim() !== '' && // Not empty
        suggestion.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !classes.includes(suggestion)
      )
      .slice(0, 50); // Limit to 50 for performance
  }, [enhancedSuggestions, searchTerm, classes]);

  // Update element classes using LiveCanvas setAttributeValue and update preview
  const updateElementClasses = useCallback(async (newClasses: string[]) => {
    if (!selectedElement?.element) return;

    setIsLoading(true);
    setError(null);

    try {
      const selector = getElementSelector();
      if (!selector || selector.trim() === '') {
        throw new Error('Unable to generate valid selector for element');
      }

      const classString = newClasses.join(' ');
      console.log(`LiveCanvas: Attempting to update classes for selector "${selector}":`, newClasses);

      // Try to use LiveCanvas utilities first, fallback to our implementations
      const setAttributeValue = (window as any).setAttributeValue || (window as any).LCUtils?.setAttributeValue;
      const updatePreviewSectorial = (window as any).updatePreviewSectorial || (window as any).LCUtils?.updatePreviewSectorial;

      if (typeof setAttributeValue === 'function') {
        // Update the source document using LiveCanvas method
        setAttributeValue(selector, 'class', classString);
        console.log(`LiveCanvas: Source document updated for ${selector}`);

        // Update the preview using LiveCanvas method
        if (typeof updatePreviewSectorial === 'function') {
          updatePreviewSectorial(selector);
          console.log(`LiveCanvas: Preview updated for ${selector}`);
        } else {
          console.warn('LiveCanvas updatePreviewSectorial not available');
          // Try to refresh the entire preview as fallback
          const updatePreview = (window as any).updatePreview || (window as any).LCUtils?.updatePreview;
          if (typeof updatePreview === 'function') {
            updatePreview();
            console.log('LiveCanvas: Full preview refreshed as fallback');
          }
        }

        // Also update the actual DOM element for immediate visual feedback
        if (selectedElement.element) {
          selectedElement.element.className = classString;
        }
        
        console.log(`LiveCanvas: Successfully updated classes for ${selector}:`, newClasses);
      } else {
        console.warn('LiveCanvas setAttributeValue not available, using direct DOM manipulation');
        // Fallback to direct DOM manipulation on both source and preview
        
        // Update the preview iframe element
        const previewDoc = (document.querySelector('#previewiframe') as HTMLIFrameElement)?.contentDocument;
        if (previewDoc) {
          const previewElement = previewDoc.querySelector(selector);
          if (previewElement) {
            previewElement.className = classString;
            console.log(`Direct manipulation: Updated preview element ${selector}`);
          }
        }
        
        // Update the current DOM element for immediate feedback
        if (selectedElement.element) {
          selectedElement.element.className = classString;
          console.log(`Direct manipulation: Updated current element`);
        }
      }

      setClasses(newClasses);
      
      // Update the selected element's classes array to maintain sync
      if (selectedElement) {
        selectedElement.classes = newClasses;
      }
    } catch (error) {
      console.error('Error updating element classes:', error);
      setError(error instanceof Error ? error.message : 'Failed to update classes');
    } finally {
      setIsLoading(false);
    }
  }, [selectedElement, getElementSelector]);

  const handleAddClass = useCallback((className: string) => {
    const trimmedClass = className.trim();
    if (trimmedClass && !classes.includes(trimmedClass)) {
      const newClasses = [...classes, trimmedClass];
      updateElementClasses(newClasses);
      setNewClass('');
      setSearchTerm('');
      setIsPopoverOpen(false);
    }
  }, [classes, updateElementClasses]);

  const handleRemoveClass = useCallback((classToRemove: string) => {
    const newClasses = classes.filter(cls => cls !== classToRemove);
    updateElementClasses(newClasses);
  }, [classes, updateElementClasses]);

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

  const handleClearAll = useCallback(() => {
    updateElementClasses([]);
  }, [updateElementClasses]);

  const handleRefreshMapping = useCallback(() => {
    loadLiveCSSMapping();
  }, [loadLiveCSSMapping]);

  if (!selectedElement) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <AlertCircle className="h-5 w-5 mr-2" />
        No element selected
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Add New Class Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add class names..."
            className="flex-1 text-sm bg-lc-bg-secondary border-lc-accent"
            disabled={isLoading}
          />
          
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="px-3 border-lc-accent hover:bg-lc-accent"
                title="Browse available classes"
                disabled={isLoading}
              >
                <Search className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-lc-bg-dark border-lc-accent" align="end">
              <Command className="bg-lc-bg-dark">
                <CommandInput 
                  placeholder="Search classes..." 
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                  className="border-lc-accent"
                />
                <CommandList>
                  <CommandEmpty className="text-lc-grey">No classes found.</CommandEmpty>
                  <CommandGroup heading="Available CSS Classes">
                    {filteredSuggestions.map((suggestion) => {
                      const isLiveClass = liveMappedClasses.some(cls => cls.className === suggestion);
                      return (
                        <CommandItem
                          key={suggestion}
                          onSelect={() => handleAddClass(suggestion)}
                          className="flex items-center justify-between hover:bg-lc-accent"
                        >
                          <span className="font-mono text-sm flex items-center gap-2">
                            {suggestion}
                            {isLiveClass && <Zap className="h-3 w-3 text-lc-primary" />}
                          </span>
                          <Plus className="h-3 w-3 opacity-50" />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          <Button
            onClick={() => handleAddClass(newClass)}
            size="sm"
            disabled={!newClass.trim() || isLoading}
            title="Add class"
            className="bg-lc-primary hover:bg-lc-primary/80"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Current Classes */}
      {classes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-lc-grey-light">
              Applied Classes ({classes.length})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-6 px-2 text-xs text-lc-grey hover:text-red-400"
              title="Clear all classes"
              disabled={isLoading}
            >
              Clear All
            </Button>
          </div>
          
          <ScrollArea className="max-h-48">
            <div className="flex flex-wrap gap-2 p-2 border border-lc-accent rounded-md bg-lc-bg-secondary/20">
              {classes.map((cls, index) => (
                <div key={`${cls}-${index}`} className="group relative">
                  <Badge 
                    variant="outline" 
                    className="font-mono text-xs pr-8 bg-lc-bg-dark border-lc-accent text-white hover:bg-lc-accent transition-colors"
                  >
                    {cls}
                    
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyClassToClipboard(cls)}
                            className="h-4 w-4 p-0 hover:bg-lc-primary/20"
                            disabled={isLoading}
                          >
                            {copiedClass === cls ? (
                              <Check className="h-2.5 w-2.5 text-green-400" />
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
                            className="h-4 w-4 p-0 hover:bg-red-500/20 hover:text-red-400"
                            disabled={isLoading}
                          >
                            <X className="h-2.5 w-2.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove class</TooltipContent>
                      </Tooltip>
                    </div>
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Live Classes Info */}
      {liveMappedClasses.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-lc-grey hover:text-white transition-colors flex items-center gap-2">
            <Zap className="h-3 w-3" />
            Live CSS Classes ({liveMappedClasses.length} available)
          </summary>
          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
            {liveMappedClasses.slice(0, 20).map((cls, index) => (
              <div key={index} className="text-xs text-lc-grey flex items-center justify-between p-1 hover:bg-lc-accent/20 rounded">
                <span className="font-mono">.{cls.className}</span>
                <span className="text-lc-grey opacity-60">{cls.sheetName}</span>
              </div>
            ))}
            {liveMappedClasses.length > 20 && (
              <div className="text-xs text-lc-grey text-center">
                ...and {liveMappedClasses.length - 20} more
              </div>
            )}
          </div>
        </details>
      )}

      {/* Status indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 text-lc-primary text-xs">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Updating element...
        </div>
      )}
    </div>
  );
}