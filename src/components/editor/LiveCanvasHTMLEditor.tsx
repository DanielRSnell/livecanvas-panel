import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MonacoEditor } from '@/components/editor/MonacoEditor';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, RefreshCw, Code2, Save, RotateCcw, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SelectedElement } from '@/types';

interface LiveCanvasHTMLEditorProps {
  selectedElement: SelectedElement | null;
  onClose?: () => void;
  className?: string;
  useMonaco?: boolean;
}

export function LiveCanvasHTMLEditor({
  selectedElement,
  onClose,
  className,
  useMonaco = true
}: LiveCanvasHTMLEditorProps) {
  const [htmlContent, setHtmlContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditableMode, setIsEditableMode] = useState(false);
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get LiveCanvas utilities
  const getLCUtils = useCallback(() => {
    return {
      getPageHTML: (window as any).getPageHTML || (window as any).LCUtils?.getPageHTML,
      setPageHTML: (window as any).setPageHTML || (window as any).LCUtils?.setPageHTML,
      updatePreviewSectorial: (window as any).updatePreviewSectorial || (window as any).LCUtils?.updatePreviewSectorial,
      updatePreview: (window as any).updatePreview || (window as any).LCUtils?.updatePreview,
    };
  }, []);

  // Load HTML content from LiveCanvas when element changes
  const loadHTMLContent = useCallback(async () => {
    if (!selectedElement?.selector) {
      setHtmlContent('');
      setOriginalContent('');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const utils = getLCUtils();
      let content = '';

      if (typeof utils.getPageHTML === 'function') {
        // Use LiveCanvas method to get HTML from source document
        content = utils.getPageHTML(selectedElement.selector);
        console.log(`LiveCanvas HTML Editor: Loaded HTML from source for ${selectedElement.selector}`);
      } else {
        // Fallback to element's innerHTML
        content = selectedElement.innerHTML || '';
        console.warn('LiveCanvas getPageHTML not available, using element innerHTML');
      }

      setHtmlContent(content);
      setOriginalContent(content);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error loading HTML content:', error);
      setError(error instanceof Error ? error.message : 'Failed to load HTML content');
      // Fallback to element content
      const fallbackContent = selectedElement.innerHTML || '';
      setHtmlContent(fallbackContent);
      setOriginalContent(fallbackContent);
    } finally {
      setIsLoading(false);
    }
  }, [selectedElement, getLCUtils]);

  // Update HTML content using LiveCanvas methods
  const updateHTMLContent = useCallback(async (newContent: string) => {
    if (!selectedElement?.selector) return;

    setIsLoading(true);
    setError(null);

    try {
      const utils = getLCUtils();

      console.log(`LiveCanvas HTML Editor: Updating HTML for ${selectedElement.selector}`);

      if (typeof utils.setPageHTML === 'function') {
        // Update the source document using LiveCanvas method
        utils.setPageHTML(selectedElement.selector, newContent);
        console.log(`LiveCanvas HTML Editor: Source document updated for ${selectedElement.selector}`);

        // Update the preview using LiveCanvas method
        if (typeof utils.updatePreviewSectorial === 'function') {
          utils.updatePreviewSectorial(selectedElement.selector);
          console.log(`LiveCanvas HTML Editor: Preview updated for ${selectedElement.selector}`);
        } else if (typeof utils.updatePreview === 'function') {
          utils.updatePreview();
          console.log('LiveCanvas HTML Editor: Full preview refreshed as fallback');
        }

        // Also update the actual DOM element for immediate visual feedback
        if (selectedElement.element) {
          selectedElement.element.innerHTML = newContent;
        }

        console.log(`LiveCanvas HTML Editor: Successfully updated HTML for ${selectedElement.selector}`);
      } else {
        console.warn('LiveCanvas setPageHTML not available, using direct DOM manipulation');
        
        // Fallback to direct DOM manipulation
        const previewDoc = (document.querySelector('#previewiframe') as HTMLIFrameElement)?.contentDocument;
        if (previewDoc) {
          const previewElement = previewDoc.querySelector(selectedElement.selector);
          if (previewElement) {
            previewElement.innerHTML = newContent;
            console.log(`Direct manipulation: Updated preview element ${selectedElement.selector}`);
          }
        }
        
        // Update the current DOM element
        if (selectedElement.element) {
          selectedElement.element.innerHTML = newContent;
          console.log(`Direct manipulation: Updated current element`);
        }
      }

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error updating HTML content:', error);
      setError(error instanceof Error ? error.message : 'Failed to update HTML content');
    } finally {
      setIsLoading(false);
    }
  }, [selectedElement, getLCUtils]);

  // Debounced update handler
  const handleContentChange = useCallback((newContent: string) => {
    setHtmlContent(newContent);
    setHasUnsavedChanges(newContent !== originalContent);

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the update to avoid too frequent calls
    debounceTimeoutRef.current = setTimeout(() => {
      updateHTMLContent(newContent);
    }, 1000); // 1 second delay for HTML updates
  }, [originalContent, updateHTMLContent]);

  // Save changes immediately
  const handleSave = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    updateHTMLContent(htmlContent);
  }, [htmlContent, updateHTMLContent]);

  // Reset to original content
  const handleReset = useCallback(() => {
    setHtmlContent(originalContent);
    setHasUnsavedChanges(false);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, [originalContent]);

  // Refresh content from source
  const handleRefresh = useCallback(() => {
    loadHTMLContent();
  }, [loadHTMLContent]);

  // Editable region assignment function
  const assignEditableRegions = useCallback(() => {
    try {
      // Get the main LiveCanvas content area
      const previewDoc = (document.querySelector('#previewiframe') as HTMLIFrameElement)?.contentDocument;
      if (!previewDoc) {
        console.warn('Preview iframe not found');
        return;
      }

      const mainContent = previewDoc.querySelector('#lc-main');
      if (!mainContent) {
        console.warn('#lc-main not found in preview');
        return;
      }

      // Target inline text elements
      const targetSelectors = 'h1, h2, h3, h4, h5, h6, p, span, li';
      const elements = mainContent.querySelectorAll(targetSelectors);

      let processedCount = 0;

      elements.forEach(element => {
        // Skip if already has editable attribute
        if (element.hasAttribute('editable')) {
          return;
        }

        const childNodes = Array.from(element.childNodes);
        const hasTextNodes = childNodes.some(node => 
          node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
        );
        const hasElementNodes = childNodes.some(node => 
          node.nodeType === Node.ELEMENT_NODE
        );

        if (hasTextNodes && !hasElementNodes) {
          // Simple case: only text content
          element.setAttribute('editable', 'inline');
          processedCount++;
        } else if (hasTextNodes && hasElementNodes) {
          // Mixed content: needs special handling
          processMixedContent(element);
          processedCount++;
        }
        // Skip elements with only child elements
      });

      console.log(`Editable regions assigned to ${processedCount} elements`);
      
      // Refresh the HTML editor content
      loadHTMLContent();
      
    } catch (error) {
      console.error('Error assigning editable regions:', error);
      setError('Failed to assign editable regions');
    }
  }, [loadHTMLContent]);

  // Process mixed content (text + elements)
  const processMixedContent = useCallback((element: Element) => {
    const childNodes = Array.from(element.childNodes);
    const targetTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'li'];
    
    childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        // Wrap orphan text in span with editable attribute
        const span = element.ownerDocument.createElement('span');
        span.setAttribute('editable', 'inline');
        span.textContent = node.textContent;
        element.replaceChild(span, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const nodeElement = node as Element;
        if (targetTags.includes(nodeElement.tagName.toLowerCase())) {
          // Check if this child element has only text content
          const hasOnlyText = Array.from(nodeElement.childNodes).every(childNode =>
            childNode.nodeType === Node.TEXT_NODE
          );
          
          if (hasOnlyText) {
            nodeElement.setAttribute('editable', 'inline');
          }
        }
      }
    });
  }, []);

  // Remove editable regions
  const removeEditableRegions = useCallback(() => {
    try {
      const previewDoc = (document.querySelector('#previewiframe') as HTMLIFrameElement)?.contentDocument;
      if (!previewDoc) return;

      const mainContent = previewDoc.querySelector('#lc-main');
      if (!mainContent) return;

      // Remove all editable attributes
      const editableElements = mainContent.querySelectorAll('[editable="inline"]');
      let removedCount = 0;

      editableElements.forEach(element => {
        element.removeAttribute('editable');
        removedCount++;
        
        // If it's a span that was created for wrapping orphan text, we might want to unwrap it
        // This is a simplified approach - a more complex implementation would track original structure
        if (element.tagName.toLowerCase() === 'span' && 
            !element.hasAttribute('class') && 
            !element.hasAttribute('id') &&
            element.childNodes.length === 1 &&
            element.childNodes[0].nodeType === Node.TEXT_NODE) {
          // This looks like a span we added - unwrap it
          const parent = element.parentNode;
          if (parent) {
            parent.replaceChild(element.childNodes[0], element);
          }
        }
      });

      console.log(`Removed editable attributes from ${removedCount} elements`);
      
      // Refresh the HTML editor content
      loadHTMLContent();
      
    } catch (error) {
      console.error('Error removing editable regions:', error);
      setError('Failed to remove editable regions');
    }
  }, [loadHTMLContent]);

  // Toggle editable mode
  const handleEditableToggle = useCallback(() => {
    if (isEditableMode) {
      removeEditableRegions();
    } else {
      assignEditableRegions();
    }
    setIsEditableMode(!isEditableMode);
  }, [isEditableMode, assignEditableRegions, removeEditableRegions]);

  // Load content when element changes
  useEffect(() => {
    loadHTMLContent();
  }, [loadHTMLContent]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  if (!selectedElement) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <AlertCircle className="h-5 w-5 mr-2" />
        No element selected
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with element info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-lc-primary" />
          <span className="text-sm font-medium text-white">HTML Content</span>
          <Badge variant="outline" className="text-xs">
            &lt;{selectedElement.tagName.toLowerCase()}&gt;
          </Badge>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
              Unsaved
            </Badge>
          )}
          {isEditableMode && (
            <Badge variant="outline" className="text-xs bg-blue-600/10 text-blue-400 border-blue-600/30">
              Editable Mode
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isEditableMode ? "default" : "ghost"}
                size="sm"
                onClick={handleEditableToggle}
                className={cn(
                  "h-6 w-6 p-0",
                  isEditableMode && "bg-blue-600 hover:bg-blue-700 text-white"
                )}
                disabled={isLoading}
                title="Enable inline editing for text elements"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isEditableMode ? 'Disable' : 'Enable'} inline editing for text elements
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="h-6 w-6 p-0"
                disabled={isLoading}
                title="Refresh from source"
              >
                <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh HTML from source</TooltipContent>
          </Tooltip>
          
          {hasUnsavedChanges && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-6 w-6 p-0"
                    disabled={isLoading}
                    title="Reset changes"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset to original</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                    disabled={isLoading}
                    title="Save changes"
                  >
                    <Save className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save changes now</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* HTML Editor */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-lc-grey-light">
          Element HTML Content
        </Label>
        <p className="text-xs text-lc-grey mb-3">
          Edit the inner HTML using LiveCanvas methods. Changes are auto-saved after 1 second.
        </p>
        
        <div className="h-64 overflow-hidden editor-container">
          {useMonaco ? (
            <MonacoEditor
              value={htmlContent}
              onChange={handleContentChange}
              language="html"
              height="100%"
              minimap={false}
              lineNumbers="on"
              className="monaco-editor-container"
              readOnly={isLoading}
            />
          ) : (
            <ScrollArea className="h-full content-area">
              <Textarea
                value={htmlContent}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Enter HTML content..."
                className="h-full text-sm font-mono resize-none bg-transparent border-none text-white placeholder:text-lc-grey focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isLoading}
              />
            </ScrollArea>
          )}
        </div>
      </div>

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