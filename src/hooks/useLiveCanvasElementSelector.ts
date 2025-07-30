import { useState, useCallback, useEffect, useRef } from 'react';
import type { SelectedElement } from '@/types';

export interface LiveCanvasElementSelectorOptions {
  enabledByDefault?: boolean;
  toggleMode?: boolean;
  onElementSelect?: (element: SelectedElement) => void;
  onToggleChange?: (enabled: boolean) => void;
}

export interface LiveCanvasElementSelectorState {
  isActive: boolean;
  selectedElement: SelectedElement | null;
  hoveredElement: Element | null;
  toggleMode: boolean;
}

/**
 * Hook that integrates with LiveCanvas element selection system
 * Uses LiveCanvas utilities for element identification and preview updates
 */
export function useLiveCanvasElementSelector(options: LiveCanvasElementSelectorOptions = {}) {
  const {
    enabledByDefault = false,
    toggleMode = false,
    onElementSelect,
    onToggleChange,
  } = options;

  const [state, setState] = useState<LiveCanvasElementSelectorState>({
    isActive: enabledByDefault,
    selectedElement: null,
    hoveredElement: null,
    toggleMode,
  });

  // References for cleanup
  const mouseOverHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const mouseOutHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const clickHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);

  // Get LiveCanvas utilities
  const getLCUtils = useCallback(() => {
    return {
      CSSelector: (window as any).CSSelector,
      getLayoutElementType: (window as any).getLayoutElementType,
      getHtmlElementType: (window as any).getHtmlElementType,
      getElementTypeInfo: (window as any).getElementTypeInfo,
    };
  }, []);

  // Get preview iframe document (LiveCanvas integration)
  const getPreviewDocument = useCallback(() => {
    const iframe = document.querySelector('#previewiframe') as HTMLIFrameElement;
    return iframe && iframe.contentDocument ? iframe.contentDocument : null;
  }, []);

  // Create SelectedElement using LiveCanvas utilities - matches LiveCanvas workflow
  const createSelectedElement = useCallback((element: Element): SelectedElement | null => {
    try {
      const utils = getLCUtils();
      
      // Use LiveCanvas CSSelector to get the selector - this is critical for LiveCanvas compatibility
      let selector = '';
      if (utils.CSSelector && typeof utils.CSSelector === 'function') {
        selector = utils.CSSelector(element);
      }
      
      // Enhanced fallback if CSSelector fails or returns empty
      if (!selector || selector.trim() === '') {
        if (element.id && element.id.trim() !== '') {
          selector = `#${element.id.trim()}`;
        } else if (element.className && element.className.trim() !== '') {
          const firstClass = element.className.trim().split(/\s+/)[0];
          selector = `.${firstClass}`;
        } else {
          // Use position-based selector as last resort
          const tagName = element.tagName.toLowerCase();
          const parent = element.parentElement;
          if (parent) {
            const siblings = Array.from(parent.children).filter(child => child.tagName === element.tagName);
            if (siblings.length > 1) {
              const index = siblings.indexOf(element);
              selector = `${tagName}:nth-of-type(${index + 1})`;
            } else {
              selector = tagName;
            }
          } else {
            selector = tagName;
          }
        }
      }

      // Get current classes from the actual element
      const classes = Array.from(element.classList);

      // Get current HTML content
      const innerHTML = element.innerHTML;
      const outerHTML = element.outerHTML;

      // Get all attributes except style and class (handled separately)
      const attributes = Array.from(element.attributes).reduce((acc, attr) => {
        if (attr.name !== 'class' && attr.name !== 'style') {
          acc[attr.name] = attr.value;
        }
        return acc;
      }, {} as Record<string, string>);

      const selectedElement: SelectedElement = {
        element: element as HTMLElement,
        selector,
        classes,
        tagName: element.tagName,
        id: element.id || '',
        innerHTML,
        outerHTML,
        attributes,
      };

      console.log('LiveCanvas Element Created:', {
        selector,
        tagName: element.tagName,
        classes: classes.length,
        hasId: !!element.id,
      });

      return selectedElement;
    } catch (error) {
      console.error('Error creating selected element:', error);
      return null;
    }
  }, [getLCUtils]);

  // Add hover highlight class (LiveCanvas compatible)
  const addHoverHighlight = useCallback((element: Element) => {
    try {
      // Use LiveCanvas highlight class if available
      element.classList.add('lc-highlight-hover');
    } catch (error) {
      console.error('Error adding hover highlight:', error);
    }
  }, []);

  // Remove hover highlight class
  const removeHoverHighlight = useCallback((element: Element) => {
    try {
      element.classList.remove('lc-highlight-hover');
    } catch (error) {
      console.error('Error removing hover highlight:', error);
    }
  }, []);

  // Add selection highlight class (LiveCanvas compatible)
  const addSelectionHighlight = useCallback((element: Element) => {
    try {
      // Use LiveCanvas selection highlight class
      element.classList.add('lc-highlight-currently-editing');
    } catch (error) {
      console.error('Error adding selection highlight:', error);
    }
  }, []);

  // Remove selection highlight class
  const removeSelectionHighlight = useCallback((element: Element) => {
    try {
      element.classList.remove('lc-highlight-currently-editing');
    } catch (error) {
      console.error('Error removing selection highlight:', error);
    }
  }, []);

  // Mouse over handler
  const handleMouseOver = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as Element;
    if (!target || target === state.selectedElement?.element) return;

    // Remove previous hover highlight
    if (state.hoveredElement && state.hoveredElement !== target) {
      removeHoverHighlight(state.hoveredElement);
    }

    // Add new hover highlight
    addHoverHighlight(target);

    setState(prev => ({
      ...prev,
      hoveredElement: target,
    }));
  }, [state.selectedElement, state.hoveredElement, addHoverHighlight, removeHoverHighlight]);

  // Mouse out handler
  const handleMouseOut = useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    if (!target) return;

    removeHoverHighlight(target);

    setState(prev => ({
      ...prev,
      hoveredElement: null,
    }));
  }, [removeHoverHighlight]);

  // Click handler - Fixed to maintain proper selection state
  const handleClick = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as Element;
    if (!target) return;

    console.log('LiveCanvas Element Click Handler: Processing click on', target.tagName);

    // Create selected element using LiveCanvas utilities
    const selectedElement = createSelectedElement(target);
    if (!selectedElement) {
      console.warn('LiveCanvas Element Click Handler: Failed to create selected element');
      return;
    }

    // Update state in a single setState to avoid stale state issues
    setState(prev => {
      // Remove previous selection highlight
      if (prev.selectedElement?.element) {
        removeSelectionHighlight(prev.selectedElement.element);
      }

      // Remove hover highlight from clicked element
      removeHoverHighlight(target);

      // Add selection highlight to new element
      addSelectionHighlight(target);

      console.log('LiveCanvas Element Click Handler: State updated, new selector:', selectedElement.selector);

      return {
        ...prev,
        selectedElement,
        hoveredElement: null,
      };
    });

    // Call callback with the new selected element
    if (onElementSelect) {
      onElementSelect(selectedElement);
    }

    // FIXED: Don't deactivate in toggle mode - keep selector active for multiple selections
    // This was the root cause of the "losing selection" issue
    
    console.log('LiveCanvas Element Selected Successfully:', {
      selector: selectedElement.selector,
      tagName: selectedElement.tagName,
      classes: selectedElement.classes,
    });
  }, [
    createSelectedElement,
    addSelectionHighlight,
    removeSelectionHighlight,
    removeHoverHighlight,
    onElementSelect,
  ]);

  // Setup event listeners on preview iframe
  const setupEventListeners = useCallback(() => {
    const previewDoc = getPreviewDocument();
    if (!previewDoc) {
      console.warn('Preview iframe document not available for element selection');
      return;
    }

    // Store handlers for cleanup
    mouseOverHandlerRef.current = handleMouseOver;
    mouseOutHandlerRef.current = handleMouseOut;
    clickHandlerRef.current = handleClick;

    // Add event listeners to preview document
    previewDoc.addEventListener('mouseover', handleMouseOver, true);
    previewDoc.addEventListener('mouseout', handleMouseOut, true);
    previewDoc.addEventListener('click', handleClick, true);

    console.log('LiveCanvas Element Selector: Event listeners added to preview iframe');
  }, [getPreviewDocument, handleMouseOver, handleMouseOut, handleClick]);

  // Cleanup event listeners
  const cleanupEventListeners = useCallback(() => {
    const previewDoc = getPreviewDocument();
    if (!previewDoc) return;

    // Remove event listeners
    if (mouseOverHandlerRef.current) {
      previewDoc.removeEventListener('mouseover', mouseOverHandlerRef.current, true);
    }
    if (mouseOutHandlerRef.current) {
      previewDoc.removeEventListener('mouseout', mouseOutHandlerRef.current, true);
    }
    if (clickHandlerRef.current) {
      previewDoc.removeEventListener('click', clickHandlerRef.current, true);
    }

    // Clear references
    mouseOverHandlerRef.current = null;
    mouseOutHandlerRef.current = null;
    clickHandlerRef.current = null;

    // Remove any remaining hover highlights
    if (state.hoveredElement) {
      removeHoverHighlight(state.hoveredElement);
    }

    console.log('LiveCanvas Element Selector: Event listeners removed');
  }, [getPreviewDocument, state.hoveredElement, removeHoverHighlight]);

  // Toggle selector active state - FIXED to maintain selection
  const toggleSelector = useCallback((active?: boolean) => {
    setState(prev => {
      const newActiveState = active !== undefined ? active : !prev.isActive;
      
      console.log('LiveCanvas Selector Toggle:', { 
        from: prev.isActive, 
        to: newActiveState,
        hasSelection: !!prev.selectedElement 
      });

      if (newActiveState) {
        setupEventListeners();
      } else {
        cleanupEventListeners();
        // FIXED: Only clear hover highlights, keep selection for editing
        if (prev.hoveredElement) {
          removeHoverHighlight(prev.hoveredElement);
        }
        // Don't clear selectedElement - keep it for continued editing
      }

      onToggleChange?.(newActiveState);

      return {
        ...prev,
        isActive: newActiveState,
        hoveredElement: newActiveState ? prev.hoveredElement : null, // Clear hover when inactive
        // Keep selectedElement even when inactive so we can continue editing
      };
    });
  }, [
    setupEventListeners,
    cleanupEventListeners,
    removeHoverHighlight,
    onToggleChange,
  ]);

  // Clear current selection
  const clearSelection = useCallback(() => {
    if (state.selectedElement?.element) {
      removeSelectionHighlight(state.selectedElement.element);
    }
    if (state.hoveredElement) {
      removeHoverHighlight(state.hoveredElement);
    }

    setState(prev => ({
      ...prev,
      selectedElement: null,
      hoveredElement: null,
    }));
  }, [state.selectedElement, state.hoveredElement, removeSelectionHighlight, removeHoverHighlight]);

  // Setup/cleanup effect
  useEffect(() => {
    if (state.isActive) {
      setupEventListeners();
    } else {
      cleanupEventListeners();
    }

    return cleanupEventListeners;
  }, [state.isActive, setupEventListeners, cleanupEventListeners]);

  // Update toggle mode
  useEffect(() => {
    setState(prev => ({
      ...prev,
      toggleMode,
    }));
  }, [toggleMode]);

  return {
    ...state,
    toggleSelector,
    clearSelection,
    createSelectedElement,
  };
}