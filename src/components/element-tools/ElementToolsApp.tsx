import React, { useState, useCallback, useId, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ElementToolsPanel } from './ElementToolsPanel';
import { ElementSelectionOverlay } from '@/components/editor/ElementSelectionOverlay';
import { useLiveCanvasElementSelector } from '@/hooks/useLiveCanvasElementSelector';
import { Layers3, MousePointer2 } from 'lucide-react';
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
    clearSelection 
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
      
      // Get the CSS selector using LC's method if available, fallback to our method
      const lcSelector = (window as any).CSSelector ? 
        (window as any).CSSelector(selectedElement.element) : 
        selectedElement.selector;
      
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
        // Use LC's setPageHTML for real-time HTML updates
        if ((window as any).setPageHTML) {
          (window as any).setPageHTML(lcSelector, value as string);
        } else {
          // Direct manipulation on iframe element
          if (doc) {
            const element = doc.querySelector(lcSelector) as HTMLElement;
            if (element) {
              element.innerHTML = value as string;
            }
          } else {
            selectedElement.element.innerHTML = value as string;
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

  const handleClose = useCallback(() => {
    setIsToolsVisible(false);
    clearSelection();
  }, [clearSelection]);

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

  const handleToggleSelector = useCallback(() => {
    const newActiveState = !isActive;
    toggleSelector(newActiveState);
    
    if (newActiveState) {
      // When activating, show the panel and adjust layout
      setIsToolsVisible(true);
      adjustPreviewLayout(true);
    } else {
      // When deactivating, hide the panel and restore layout
      clearSelection();
      setIsToolsVisible(false);
      adjustPreviewLayout(false);
    }
  }, [isActive, toggleSelector, clearSelection]);

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
        // Reset preview layout
        previewIframe.style.marginLeft = "";
        previewIframe.style.marginRight = "";
        previewIframe.style.width = "";
        
        console.log('LC Element Tools: Preview layout restored');
      }
    }
  }, []);
  

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

      {/* Element Selection Overlay - Only active when iframe document is available */}
      {iframeDoc && (
        <ElementSelectionOverlay
          isActive={isActive}
          targetDocument={iframeDoc}
          toggleMode={toggleMode}
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
          // The element selection is handled by the LiveCanvas hook
          setIsToolsVisible(true);
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
                  Select elements to edit CSS classes and HTML content
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