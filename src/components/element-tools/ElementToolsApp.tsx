import React, { useState, useCallback, useId, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ElementToolsPanel } from './ElementToolsPanel';
import { ElementSelectionOverlay } from '@/components/editor/ElementSelectionOverlay';
import { useLiveCanvasElementSelector } from '@/hooks/useLiveCanvasElementSelector';
import { Layers3, MousePointer2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SelectedElement } from '@/types';

interface ElementToolsAppProps {
  config?: any;
  className?: string;
}

// Animation variants for professional transitions
const containerVariants = {
  inactive: {
    scale: 1,
    opacity: 1,
  },
  active: {
    scale: 1.05,
    opacity: 1,
  },
  hover: {
    scale: 1.1,
    opacity: 1,
  }
};

const panelVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    x: -20,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    x: -20,
    y: 20,
  }
};

const activationButtonVariants = {
  inactive: {
    scale: 1,
    rotate: 0,
  },
  active: {
    scale: 1.1,
    rotate: 180,
  },
  hover: {
    scale: 1.2,
    rotate: 5,
  }
};

export function ElementToolsApp({ config, className }: ElementToolsAppProps) {
  // Get iframe document from config
  const iframeDoc = config?.iframeDoc || null;
  
  // Refs and IDs
  const appId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [isToolsVisible, setIsToolsVisible] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [toggleMode, setToggleMode] = useState(false);
  
  // Debug toggle mode changes
  const handleToggleModeChange = useCallback((newMode: boolean) => {
    console.log('ElementToolsApp: Toggle mode changing to', newMode, 'current state:', toggleMode);
    setToggleMode(prevMode => {
      console.log('ElementToolsApp: setToggleMode called, prev:', prevMode, 'new:', newMode);
      return newMode;
    });
  }, []); // Remove toggleMode from deps to avoid stale closure
  
  const [isHoveringContainer, setIsHoveringContainer] = useState(false);

  const { 
    isActive, 
    selectedElement, 
    hoveredElement,
    toggleMode: currentToggleMode,
    toggleSelector,
    clearSelection,
    createSelectedElement,
    setSelectedElement
  } = useLiveCanvasElementSelector({
    enabledByDefault: false,
    toggleMode,
    onElementSelect: (element: SelectedElement) => {
      console.log('ElementToolsApp: LiveCanvas element selected', element);
      setIsToolsVisible(true);
    },
    onToggleChange: (enabled: boolean) => {
      console.log('ElementToolsApp: Toggle mode changed', enabled);
    }
  });

  // Real-time update handler using LiveCanvas native methods
  const handleRealTimeUpdate = useCallback((type: 'classes' | 'html' | 'attributes', value: string | Record<string, string>): void => {
    if (!selectedElement || !selectedElement.element) return;
    
    setSaveStatus('saving');
    
    try {
      // Get iframe document reference for LiveCanvas functions
      const doc = iframeDoc || (document.querySelector('#previewiframe') as HTMLIFrameElement)?.contentDocument;
      
      // Get the CSS selector using LiveCanvas approach
      // IMPORTANT: For lc-main, ALWAYS use canonical selector
      const isLcMainElement = selectedElement && (
        selectedElement.id === 'lc-main' || 
        selectedElement.selector === 'main#lc-main' || 
        selectedElement.selector === '#lc-main'
      );
      
      let lcSelector: string;
      if (isLcMainElement) {
        // For lc-main, ALWAYS use canonical selector (never rely on CSSelector)
        lcSelector = 'main#lc-main';
        console.log('LC Element Tools: Using canonical selector for lc-main:', lcSelector);
      } else {
        // For regular elements, use CSSelector if available
        lcSelector = (window as any).CSSelector ? 
          (window as any).CSSelector(selectedElement.element) : 
          selectedElement.selector;
      }
      
      // Safety check - ensure we have a valid selector
      if (!lcSelector || lcSelector.trim() === '') {
        console.warn('LC Element Tools: Empty selector detected, using fallback:', selectedElement.selector);
        lcSelector = selectedElement.selector || '#lc-main';
      }
      
      if (type === 'classes') {
        // Use LC's setAttributeValue for real-time class updates
        if ((window as any).setAttributeValue) {
          (window as any).setAttributeValue(lcSelector, 'class', value as string);
        } else {
          // Direct manipulation on iframe element
          if (doc) {
            const element = doc.querySelector(lcSelector) as HTMLElement;
            if (element) {
              element.className = value as string;
            }
          } else {
            selectedElement.element.className = value as string;
          }
        }
      } else if (type === 'html') {
        // Get LiveCanvas functions with proper fallback to LCUtils
        const setPageHTML = (window as any).setPageHTML || (window as any).LCUtils?.content?.setPageHTML;
        const updatePreviewSectorial = (window as any).updatePreviewSectorial || (window as any).LCUtils?.preview?.updatePreviewSectorial;
        
        if (isLcMainElement) {
          // SPECIAL HANDLING FOR LC-MAIN - EXACT LiveCanvas pattern
          console.log('LC Element Tools: Special lc-main HTML update');
          
          // Step 1: Use the already determined lcSelector (which is canonical for lc-main)
          console.log('LC Element Tools: Using lcSelector for lc-main updates:', lcSelector);
          
          // Step 2: Update source document via LiveCanvas function
          if (typeof setPageHTML === 'function') {
            console.log('LC Element Tools: Updating lc-main source via setPageHTML');
            setPageHTML(lcSelector, value as string);
          } else {
            console.warn('LC Element Tools: setPageHTML not available for lc-main');
            // Fallback: update working document directly
            const getWorkingDocument = () => {
              if (typeof window !== 'undefined' && (window as any).lcMainStore?.doc) {
                return (window as any).lcMainStore.doc;
              }
              return doc; // Use provided iframe doc
            };
            
            const workingDoc = getWorkingDocument();
            if (workingDoc) {
              const sourceElement = workingDoc.querySelector(lcSelector) || workingDoc.querySelector('#lc-main');
              if (sourceElement) {
                sourceElement.innerHTML = value as string;
                console.log('LC Element Tools: Updated lc-main source via working document');
              }
            }
          }
          
          // Step 3: Update preview via updatePreviewSectorial (ALWAYS use canonical selector)
          if (typeof updatePreviewSectorial === 'function') {
            console.log('LC Element Tools: Updating lc-main preview via updatePreviewSectorial');
            updatePreviewSectorial(lcSelector); // Use determined canonical selector
          } else {
            console.log('LC Element Tools: updatePreviewSectorial not available, direct iframe update');
            // Direct iframe update fallback
            if (doc) {
              const previewElement = doc.querySelector(lcSelector) || doc.querySelector('#lc-main');
              if (previewElement) {
                previewElement.innerHTML = value as string;
                console.log('LC Element Tools: Updated lc-main preview via direct DOM');
              } else {
                console.warn('LC Element Tools: Could not find lc-main in preview iframe');
              }
            }
          }
          
        } else {
          // REGULAR ELEMENT HANDLING
          if (typeof setPageHTML === 'function') {
            console.log('LC Element Tools: Using setPageHTML for regular element:', lcSelector);
            setPageHTML(lcSelector, value as string);
            
            // Update preview for regular elements
            if (typeof updatePreviewSectorial === 'function') {
              updatePreviewSectorial(lcSelector);
            }
          } else {
            console.log('LC Element Tools: setPageHTML not available, using direct DOM manipulation');
            // Complete fallback: Direct manipulation on iframe element
            if (doc) {
              const element = doc.querySelector(lcSelector) as HTMLElement;
              if (element) {
                element.innerHTML = value as string;
                console.log('LC Element Tools: Updated via direct DOM manipulation:', lcSelector);
              } else {
                console.warn('LC Element Tools: Element not found with selector:', lcSelector);
              }
            } else if (selectedElement.element) {
              selectedElement.element.innerHTML = value as string;
              console.log('LC Element Tools: Updated via selected element:', lcSelector);
            }
          }
        }
      } else if (type === 'attributes') {
        const attrs = value as Record<string, string>;
        // Update attributes using LC methods when available
        Object.entries(attrs).forEach(([name, val]) => {
          if (name !== 'class' && name !== 'style') {
            if ((window as any).setAttributeValue) {
              (window as any).setAttributeValue(lcSelector, name, val);
            } else {
              // Direct manipulation on iframe element
              if (doc) {
                const element = doc.querySelector(lcSelector) as HTMLElement;
                if (element) {
                  element.setAttribute(name, val);
                }
              } else {
                selectedElement.element.setAttribute(name, val);
              }
            }
          }
        });
      }
      
      // Use LC's updatePreviewSectorial for real-time preview updates
      if ((window as any).updatePreviewSectorial) {
        (window as any).updatePreviewSectorial(lcSelector);
      }
      
      setSaveStatus('success');
      setStatusMessage('Changes applied successfully!');
      
    } catch (error) {
      setSaveStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'An error occurred');
    }
    
    // Reset status after 3 seconds
    setTimeout(() => {
      setSaveStatus('idle');
      setStatusMessage('');
    }, 3000);
  }, [selectedElement, iframeDoc]);

  // Function to adjust the preview iframe layout like LiveCanvas Tweaks
  const adjustPreviewLayout = useCallback((isActive: boolean) => {
    const previewIframe = document.getElementById("previewiframe-wrap");
    const previewWindow = document.getElementById("previewiframe");
    
    if (previewIframe && previewWindow) {
      if (isActive) {
        // Push preview to the right (60% width) like LiveCanvas Tweaks
        previewIframe.style.marginLeft = "auto";
        previewIframe.style.marginRight = "0";
        previewIframe.style.width = "60%";
        
        console.log('LC Element Tools: Preview layout adjusted for side panel');
      } else {
        // Reset preview layout - use removeProperty for complete reset
        previewIframe.style.removeProperty('margin-left');
        previewIframe.style.removeProperty('margin-right');
        previewIframe.style.removeProperty('width');
        
        console.log('LC Element Tools: Preview layout restored');
      }
    }
  }, []);

  const handleClose = useCallback(() => {
    console.log('LC Element Tools: Closing panel and resetting everything');
    
    // Step 1: Hide the tools panel
    setIsToolsVisible(false);
    
    // Step 2: Clear the selection
    clearSelection();
    
    // Step 3: Deactivate the selector (this will trigger preview layout reset)
    toggleSelector(false);
    
    // Step 4: Explicitly reset the preview layout
    adjustPreviewLayout(false);
    
    console.log('LC Element Tools: Panel closed, selector deactivated, layout reset');
  }, [clearSelection, toggleSelector, adjustPreviewLayout]);

  // Add keyboard support for clearing selection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedElement) {
        event.preventDefault();
        clearSelection();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, clearSelection]);

  // Observer for #sidepanel - close our panel when LiveCanvas sidepanel is visible
  useEffect(() => {
    const sidepanel = document.getElementById('sidepanel');
    if (!sidepanel) return;

    const checkSidePanelVisibility = () => {
      if (!sidepanel) return;
      
      // Check if display is NOT 'none' (meaning it's visible)
      const computedStyle = getComputedStyle(sidepanel);
      const inlineStyle = sidepanel.style.display;
      
      // Panel is visible if:
      // 1. Inline style is not 'none' AND computed style is not 'none'
      // 2. OR if there's no inline style and computed style is not 'none'
      const isVisible = (inlineStyle !== 'none' && computedStyle.display !== 'none') ||
                       (!inlineStyle && computedStyle.display !== 'none');
      
      // If sidepanel becomes visible and our panel is open, close it
      if (isVisible && isToolsVisible) {
        console.log('LC Element Tools: LiveCanvas sidepanel is visible, closing our panel');
        handleClose();
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
          // Check visibility after any style or class change
          checkSidePanelVisibility();
        }
      });
    });

    // Watch for style and class attribute changes
    observer.observe(sidepanel, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Also check initial state
    checkSidePanelVisibility();

    return () => observer.disconnect();
  }, [isToolsVisible, handleClose]);

  // Handle selecting the lc-main element - EXACT LiveCanvas approach
  const handleSelectLcMain = useCallback(() => {
    console.log('LC Element Tools: handleSelectLcMain called');
    
    // Step 1: Get working document (EXACT LiveCanvas pattern)
    const getWorkingDocument = () => {
      if (typeof window !== 'undefined' && (window as any).lcMainStore?.doc) {
        return (window as any).lcMainStore.doc;
      }
      const iframe = document.querySelector('#previewiframe') as HTMLIFrameElement;
      return iframe?.contentDocument || null;
    };
    
    // Step 2: Get iframe document for visual selection
    const iframe = document.querySelector('#previewiframe') as HTMLIFrameElement;
    const currentIframeDoc = iframe?.contentDocument;
    
    console.log('LC Element Tools: iframe element found:', !!iframe);
    console.log('LC Element Tools: iframeDoc available:', !!currentIframeDoc);
    
    if (!currentIframeDoc) {
      console.warn('LC Element Tools: iframe document not available');
      return;
    }
    
    // Step 3: Find lc-main element using EXACT LiveCanvas selector pattern
    const lcMainElement = currentIframeDoc.querySelector('main#lc-main') as HTMLElement;
    if (!lcMainElement) {
      console.warn('LC Element Tools: main#lc-main element not found in iframe');
      // Try fallback selector (EXACT LiveCanvas pattern)
      const fallbackElement = currentIframeDoc.querySelector('#lc-main') as HTMLElement;
      if (!fallbackElement) {
        console.warn('LC Element Tools: #lc-main element also not found');
        return;
      }
      console.log('LC Element Tools: Using fallback #lc-main element');
    }

    const targetElement = lcMainElement || currentIframeDoc.querySelector('#lc-main') as HTMLElement;
    console.log('LC Element Tools: Target element found:', targetElement.tagName, targetElement.id);

    // Step 4: Get HTML using EXACT LiveCanvas pattern - always use canonical selector
    const canonicalSelector = "main#lc-main"; // Hard-coded like LiveCanvas
    let html = '';
    
    // Try LiveCanvas getPageHTML first
    const getPageHTML = (window as any).getPageHTML || (window as any).LCUtils?.content?.getPageHTML;
    if (getPageHTML && typeof getPageHTML === 'function') {
      html = getPageHTML(canonicalSelector);
      console.log('LC Element Tools: Got HTML using getPageHTML, length:', html.length);
    } else {
      // Fallback: get from working document, not iframe
      const workingDoc = getWorkingDocument();
      if (workingDoc) {
        const sourceElement = workingDoc.querySelector(canonicalSelector) || workingDoc.querySelector('#lc-main');
        if (sourceElement) {
          html = sourceElement.innerHTML;
          console.log('LC Element Tools: Got HTML from working document, length:', html.length);
        }
      }
      if (!html) {
        // Final fallback to iframe element
        html = targetElement.innerHTML;
        console.log('LC Element Tools: Got HTML using iframe innerHTML fallback, length:', html.length);
      }
    }

    // Step 5: Create selected element object using EXACT LiveCanvas pattern
    const selectedLcMain = {
      element: targetElement,
      selector: canonicalSelector, // Always use canonical selector
      classes: Array.from(targetElement.classList).filter(cls => 
        cls && !cls.startsWith('lc-')
      ),
      tagName: targetElement.tagName.toLowerCase(),
      id: targetElement.id || 'lc-main',
      innerHTML: html,
      outerHTML: targetElement.outerHTML,
      attributes: Array.from(targetElement.attributes).reduce((acc, attr) => {
        if (attr.name !== 'class' && attr.name !== 'style') {
          acc[attr.name] = attr.value;
        }
        return acc;
      }, {} as Record<string, string>)
    };

    // Step 6: Apply selection using LiveCanvas pattern
    setIsToolsVisible(true);
    
    if (selectedLcMain) {
      console.log('LC Element Tools: Selected main#lc-main element with canonical selector:', selectedLcMain.selector);
      setSelectedElement(selectedLcMain);
    }
  }, [setSelectedElement]);

  const handleToggleSelector = useCallback(() => {
    const newActiveState = !isActive;
    toggleSelector(newActiveState);
    
    if (newActiveState) {
      // When activating, first close LiveCanvas sidepanel using their method
      const closeSidepanelBtn = document.querySelector('.close-sidepanel');
      if (closeSidepanelBtn && typeof (closeSidepanelBtn as HTMLElement).click === 'function') {
        (closeSidepanelBtn as HTMLElement).click();
        console.log('LC Element Tools: Closed LiveCanvas sidepanel using .close-sidepanel');
      } else {
        // Fallback to direct style manipulation
        const sidepanel = document.getElementById('sidepanel');
        if (sidepanel) {
          sidepanel.style.display = 'none';
          console.log('LC Element Tools: Hidden LiveCanvas sidepanel via style (fallback)');
        }
      }
      
      setIsToolsVisible(true);
      adjustPreviewLayout(true);
    } else {
      // When deactivating, hide the panel and restore layout
      clearSelection();
      setIsToolsVisible(false);
      adjustPreviewLayout(false);
    }
  }, [isActive, toggleSelector, clearSelection, adjustPreviewLayout]);
  

  return (
    <div 
      id={appId}
      ref={containerRef}
      className={cn("lc-element-tools-container fixed z-[999999]", className)}
      onMouseEnter={() => setIsHoveringContainer(true)}
      onMouseLeave={() => setIsHoveringContainer(false)}
      style={{
        // Professional color scheme
        '--lc-primary': '#3b82f6',
        '--lc-primary-dark': '#2563eb',
        '--lc-surface': '#ffffff',
        '--lc-surface-elevated': '#f8fafc',
        '--lc-border': '#e2e8f0',
        '--lc-text': '#1e293b',
        '--lc-text-muted': '#64748b',
        '--lc-success': '#10b981',
        '--lc-error': '#ef4444',
        '--lc-warning': '#f59e0b',
        '--lc-shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        '--lc-shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        '--lc-shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        '--lc-shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      } as React.CSSProperties}
    >
      {/* Activation Button - Bottom Left Circle - Hidden when panel is open */}
      <AnimatePresence>
        {!isToolsVisible && (
          <motion.div
            initial="inactive"
            animate={isActive ? "active" : "inactive"}
            whileHover="hover"
            variants={containerVariants}
            className="fixed bottom-6 left-6"
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{
              zIndex: 999999,
            }}
          >
        <motion.div
          variants={activationButtonVariants}
          className="relative"
        >
          <Button
            onClick={handleToggleSelector}
            className={cn(
              "h-16 w-16 rounded-full p-0 border-0 shadow-xl transition-all duration-300",
              "flex items-center justify-center relative overflow-hidden",
              isActive 
                ? "bg-lc-primary hover:bg-lc-primary-dark text-white" 
                : "bg-lc-bg-dark hover:bg-lc-accent text-lc-grey-light border-2 border-lc-accent"
            )}
            style={{
              background: isActive 
                ? 'linear-gradient(135deg, #3ecf8e 0%, #22c55e 100%)' 
                : 'linear-gradient(135deg, #171717 0%, #262626 100%)',
            }}
          >
            {/* Icon with rotation animation */}
            <motion.div
              animate={{ 
                rotate: isActive ? 180 : 0,
                scale: isActive ? 1.1 : 1
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20 
              }}
            >
              <Layers3 className="h-7 w-7" />
            </motion.div>
            
            {/* Pulse animation when active */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ scale: 1, opacity: 0 }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeOut" 
                  }}
                  className="absolute inset-0 rounded-full bg-lc-primary/60"
                />
              )}
            </AnimatePresence>
          </Button>
          
          {/* Status indicator */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: isActive ? 1 : 0 }}
            className="absolute -top-1 -right-1 h-4 w-4 bg-lc-primary rounded-full border-2 border-lc-bg shadow-sm"
          />
        </motion.div>
      </motion.div>
        )}
      </AnimatePresence>

      {/* Element Selection Overlay - Always active for command+click, full active when selector is on */}
      {iframeDoc && (
        <ElementSelectionOverlay
          isActive={true}
          targetDocument={iframeDoc}
          toggleMode={isActive ? toggleMode : false}
          showHoverStates={isActive}
          onElementSelect={(element, info) => {
          const selected = {
            element,
            selector: info.selector,
            classes: info.classes,
            tagName: info.tagName,
            id: info.id,
            innerHTML: element.innerHTML, // This will show the actual innerHTML
            outerHTML: element.outerHTML,
            attributes: Array.from(element.attributes).reduce((acc, attr) => {
              if (attr.name !== 'class' && attr.name !== 'style') {
                acc[attr.name] = attr.value;
              }
              return acc;
            }, {} as Record<string, string>)
          };
          console.log('LC Element Tools: Element selected via command+click:', selected.selector);
          
          // First close LiveCanvas sidepanel if open
          const closeSidepanelBtn = document.querySelector('.close-sidepanel');
          if (closeSidepanelBtn && typeof (closeSidepanelBtn as HTMLElement).click === 'function') {
            (closeSidepanelBtn as HTMLElement).click();
            console.log('LC Element Tools: Closed LiveCanvas sidepanel for command+click selection');
          }
          
          // Open the panel and set the selected element
          setIsToolsVisible(true);
          adjustPreviewLayout(true);
          // Use the LiveCanvas hook to properly set the element
          setSelectedElement(selected);
          if (!toggleMode) {
            toggleSelector(false);
          }
        }}
        />
      )}

      {/* Instructions Overlay */}
      <AnimatePresence>
        {isActive && !selectedElement && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              duration: 0.3
            }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[999997]"
          >
            <div className="bg-lc-bg-dark/95 backdrop-blur-sm text-white px-6 py-4 rounded-xl shadow-xl border border-lc-accent/50 flex items-center gap-3">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <MousePointer2 className="h-5 w-5 text-lc-primary" />
              </motion.div>
              <div>
                <div className="font-semibold text-sm text-white">
                  {toggleMode 
                    ? 'Click any element to select it' 
                    : 'Hold CMD/Ctrl and click an element'
                  }
                </div>
                <div className="text-xs text-lc-grey-light mt-1">
                  Select elements within the main content area to edit CSS classes and HTML content
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Messages */}
      <AnimatePresence>
        {saveStatus !== 'idle' && statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
            className="fixed bottom-28 left-6 z-[999997]"
          >
            <div className={cn(
              "px-4 py-3 rounded-lg shadow-lg text-sm font-medium backdrop-blur-sm border",
              saveStatus === 'saving' && "bg-lc-primary/90 text-white border-lc-primary/50",
              saveStatus === 'success' && "bg-lc-green/90 text-white border-lc-green/50",
              saveStatus === 'error' && "bg-red-500/90 text-white border-red-500/50"
            )}>
              <div className="flex items-center gap-2">
                {saveStatus === 'saving' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                )}
                {statusMessage}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Add Section Button - Bottom Right */}
      <AnimatePresence>
        {(!isToolsVisible || selectedElement) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.4
            }}
            className="fixed bottom-6 right-6 z-[999998]"
          >
            <Button
              className="add-section add-new-section h-9 px-4 shadow-xl transition-all duration-300 bg-lc-bg-dark border-lc-accent hover:bg-lc-accent text-lc-grey-light hover:text-white border flex items-center gap-2"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 90, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Plus className="h-4 w-4" />
              </motion.div>
              <span className="text-sm font-medium">Section</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* High-Fidelity Element Tools Panel */}
      <AnimatePresence>
        {isToolsVisible && (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.4
            }}
            className="fixed top-0 left-0 h-full w-[40%] z-[999996] bg-lc-bg/95 backdrop-blur-lg border-r border-lc-accent shadow-2xl"
            style={{}}
          >
            <ElementToolsPanel
              selectedElement={selectedElement}
              onClose={handleClose}
              onClearSelection={clearSelection}
              onSelectLcMain={handleSelectLcMain}
              onRealTimeUpdate={handleRealTimeUpdate}
              toggleMode={toggleMode}
              onToggleModeChange={handleToggleModeChange}
              isHovered={isHoveringContainer}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}