import { useState, useCallback, useEffect, useRef } from 'react';
import type { SelectedElement } from '@/types';

interface UseElementSelectorOptions {
  onElementSelected?: (element: SelectedElement) => void;
  enabledByDefault?: boolean;
  toggleMode?: boolean; // Free selection mode (no CMD/Ctrl required)
  iframeDoc?: Document | null; // Iframe document for element targeting
}

export function useElementSelector({ 
  onElementSelected, 
  enabledByDefault = false,
  toggleMode = false,
  iframeDoc = null
}: UseElementSelectorOptions = {}) {
  console.log('LC Element Tools: useElementSelector hook initializing', { 
    enabledByDefault, 
    toggleMode,
    hasCallback: !!onElementSelected,
    hasIframeDoc: !!iframeDoc
  });

  // Get the target document for element operations (iframe or fallback to current)
  const getTargetDocument = useCallback((): Document => {
    if (iframeDoc) {
      console.log('LC Element Tools: Using iframe document for element operations');
      return iframeDoc;
    }
    
    // Try to get iframe document dynamically
    const iframe = document.querySelector('#previewiframe') as HTMLIFrameElement;
    if (iframe && iframe.contentDocument) {
      console.log('LC Element Tools: Found iframe document dynamically');
      return iframe.contentDocument;
    }
    
    console.log('LC Element Tools: Falling back to parent document');
    return document;
  }, [iframeDoc]);
  
  const [isActive, setIsActive] = useState(enabledByDefault);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  
  const originalOutlineRef = useRef<string>('');
  const originalCursorRef = useRef<string>('');

  console.log('LC Element Tools: Hook state initialized', {
    isActive,
    hoveredElement: !!hoveredElement,
    selectedElement: !!selectedElement,
    toggleMode
  });
  

  // Generate CSS selector for an element using LC's method if available
  const generateSelector = useCallback((element: HTMLElement): string => {
    // Use Livecanvas's CSSelector if available
    if ((window as any).CSSelector && typeof (window as any).CSSelector === 'function') {
      try {
        return (window as any).CSSelector(element);
      } catch (error) {
        console.warn('LC CSSelector failed, falling back to custom selector:', error);
      }
    }
    
    // Fallback to custom selector generation
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const classes = Array.from(element.classList)
        .filter(cls => cls && !cls.startsWith('lc-') && !cls.startsWith('hover:') && !cls.startsWith('focus:'))
        .slice(0, 3); // Limit to first 3 relevant classes
      
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
      }
    }
    
    // Generate nth-child selector as fallback
    const siblings = Array.from(element.parentElement?.children || []);
    const index = siblings.indexOf(element) + 1;
    return `${element.tagName.toLowerCase()}:nth-child(${index})`;
  }, []);

  // Extract classes from element
  const getElementClasses = useCallback((element: HTMLElement): string[] => {
    return Array.from(element.classList).filter(cls => cls && !cls.startsWith('lc-'));
  }, []);

  // Extract attributes from element
  const getElementAttributes = useCallback((element: HTMLElement): Record<string, string> => {
    const attributes: Record<string, string> = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      if (attr.name !== 'class' && attr.name !== 'style') {
        attributes[attr.name] = attr.value;
      }
    }
    return attributes;
  }, []);

  // Create SelectedElement object
  const createSelectedElement = useCallback((element: HTMLElement): SelectedElement => {
    return {
      element,
      selector: generateSelector(element),
      classes: getElementClasses(element),
      tagName: element.tagName,
      id: element.id || undefined,
      innerHTML: element.innerHTML,
      outerHTML: element.outerHTML,
      attributes: getElementAttributes(element)
    };
  }, [generateSelector, getElementClasses, getElementAttributes]);

  // Handle element hover
  const handleMouseOver = useCallback((event: MouseEvent) => {
    if (!isActive) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const target = event.target as HTMLElement;
    
    // Skip if hovering over our own components
    if (target.closest('.lc-element-tools-container')) {
      return;
    }
    
    // Remove previous hover styling
    if (hoveredElement && hoveredElement !== target) {
      hoveredElement.style.outline = originalOutlineRef.current;
    }
    
    // Apply hover styling
    originalOutlineRef.current = target.style.outline;
    target.style.outline = '2px dashed #007cba';
    target.style.outlineOffset = '2px';
    
    setHoveredElement(target);
  }, [isActive, hoveredElement]);

  // Handle element click
  const handleClick = useCallback((event: MouseEvent) => {
    if (!isActive) return;
    
    // Check for CMD/Ctrl key only if not in toggle mode
    if (!toggleMode && !event.metaKey && !event.ctrlKey) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const target = event.target as HTMLElement;
    
    // Skip if clicking on our own components
    if (target.closest('.lc-element-tools-container')) {
      return;
    }
    
    // Clear hover styling
    if (hoveredElement) {
      hoveredElement.style.outline = originalOutlineRef.current;
      setHoveredElement(null);
    }
    
    // Create selected element
    const selected = createSelectedElement(target);
    setSelectedElement(selected);
    
    // Notify callback
    if (onElementSelected) {
      onElementSelected(selected);
    }
    
    // Deactivate selector after selection only if not in toggle mode
    if (!toggleMode) {
      setIsActive(false);
    }
  }, [isActive, hoveredElement, createSelectedElement, onElementSelected, toggleMode]);

  // Handle escape key to cancel selection
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isActive) {
      setIsActive(false);
      
      // Clear hover styling
      if (hoveredElement) {
        hoveredElement.style.outline = originalOutlineRef.current;
        setHoveredElement(null);
      }
    }
  }, [isActive, hoveredElement]);

  // Set up event listeners
  useEffect(() => {
    if (isActive) {
      const doc = getTargetDocument();
      
      // Store original body cursor on target document
      if (doc.body) {
        originalCursorRef.current = doc.body.style.cursor;
        doc.body.style.cursor = 'crosshair';
      }
      
      // Add event listeners to target document
      doc.addEventListener('mouseover', handleMouseOver);
      doc.addEventListener('click', handleClick, true);
      doc.addEventListener('keydown', handleKeyDown);
      
      return () => {
        // Restore original cursor on target document
        if (doc.body) {
          doc.body.style.cursor = originalCursorRef.current;
        }
        
        // Remove event listeners from target document
        doc.removeEventListener('mouseover', handleMouseOver);
        doc.removeEventListener('click', handleClick, true);
        doc.removeEventListener('keydown', handleKeyDown);
        
        // Clear hover styling
        if (hoveredElement) {
          hoveredElement.style.outline = originalOutlineRef.current;
        }
      };
    }
  }, [isActive, handleMouseOver, handleClick, handleKeyDown, hoveredElement, getTargetDocument]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoveredElement) {
        hoveredElement.style.outline = originalOutlineRef.current;
      }
      
      const doc = getTargetDocument();
      if (doc.body) {
        doc.body.style.cursor = originalCursorRef.current;
      }
    };
  }, [hoveredElement, getTargetDocument]);

  return {
    isActive,
    setIsActive,
    selectedElement,
    setSelectedElement,
    hoveredElement,
    clearSelection: () => {
      setSelectedElement(null);
      if (hoveredElement) {
        hoveredElement.style.outline = originalOutlineRef.current;
        setHoveredElement(null);
      }
    }
  };
}