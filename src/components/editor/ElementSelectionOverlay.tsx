import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Target, MousePointer2, Code2 } from 'lucide-react';

interface ElementInfo {
  tagName: string;
  id?: string;
  classes: string[];
  selector: string;
  rect: DOMRect;
}

interface ElementSelectionOverlayProps {
  isActive: boolean;
  targetDocument?: Document;
  onElementHover?: (element: HTMLElement | null, info: ElementInfo | null) => void;
  onElementSelect?: (element: HTMLElement, info: ElementInfo) => void;
  toggleMode?: boolean;
  className?: string;
}

export function ElementSelectionOverlay({
  isActive,
  targetDocument = document,
  onElementHover,
  onElementSelect,
  toggleMode = false,
  className
}: ElementSelectionOverlayProps) {
  const [hoveredInfo, setHoveredInfo] = useState<ElementInfo | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  // Generate element info
  const getElementInfo = useCallback((element: HTMLElement): ElementInfo => {
    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      classes: Array.from(element.classList).filter(cls => 
        cls && !cls.startsWith('lc-') && !cls.startsWith('hover:') && !cls.startsWith('focus:')
      ),
      selector: element.id 
        ? `#${element.id}` 
        : element.className 
          ? `${element.tagName.toLowerCase()}.${Array.from(element.classList).slice(0, 2).join('.')}` 
          : element.tagName.toLowerCase(),
      rect: element.getBoundingClientRect()
    };
  }, []);

  // Handle mouse move for tooltip positioning
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isActive) return;
    
    setMousePosition({ x: e.clientX, y: e.clientY });
    
    const target = e.target as HTMLElement;
    
    // Skip our own components
    if (target.closest('.lc-element-tools-container, .lc-element-selection-overlay')) {
      setHoveredInfo(null);
      setShowTooltip(false);
      onElementHover?.(null, null);
      return;
    }

    const info = getElementInfo(target);
    setHoveredInfo(info);
    setShowTooltip(true);
    onElementHover?.(target, info);
  }, [isActive, getElementInfo, onElementHover]);

  // Handle click
  const handleClick = useCallback((e: MouseEvent) => {
    if (!isActive) return;
    
    // Check for CMD/Ctrl key only if not in toggle mode
    if (!toggleMode && !e.metaKey && !e.ctrlKey) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    
    // Skip our own components
    if (target.closest('.lc-element-tools-container, .lc-element-selection-overlay')) {
      return;
    }

    const info = getElementInfo(target);
    onElementSelect?.(target, info);
    
    // Hide tooltip after selection
    setShowTooltip(false);
  }, [isActive, toggleMode, getElementInfo, onElementSelect]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoveredInfo(null);
    setShowTooltip(false);
    onElementHover?.(null, null);
  }, [onElementHover]);

  // Set up event listeners
  useEffect(() => {
    if (isActive) {
      const doc = targetDocument;
      
      // Add event listeners
      doc.addEventListener('mousemove', handleMouseMove);
      doc.addEventListener('click', handleClick, true);
      doc.addEventListener('mouseleave', handleMouseLeave);
      
      // Set cursor style
      const originalCursor = doc.body.style.cursor;
      doc.body.style.cursor = 'crosshair';
      
      return () => {
        // Remove event listeners
        doc.removeEventListener('mousemove', handleMouseMove);
        doc.removeEventListener('click', handleClick, true);
        doc.removeEventListener('mouseleave', handleMouseLeave);
        
        // Restore cursor
        doc.body.style.cursor = originalCursor;
        
        // Clear state
        setHoveredInfo(null);
        setShowTooltip(false);
      };
    }
  }, [isActive, targetDocument, handleMouseMove, handleClick, handleMouseLeave]);

  if (!isActive) {
    return null;
  }

  return (
    <>
      {/* Element Highlight Overlay */}
      <AnimatePresence>
        {hoveredInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="lc-element-selection-overlay fixed pointer-events-none z-[999995]"
            style={{
              left: hoveredInfo.rect.left + window.scrollX,
              top: hoveredInfo.rect.top + window.scrollY,
              width: hoveredInfo.rect.width,
              height: hoveredInfo.rect.height,
            }}
          >
            {/* Main highlight border */}
            <div className="absolute inset-0 border-2 border-blue-500 bg-blue-500/10 rounded-sm" />
            
            {/* Corner indicators */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
            
            {/* Dimensions label */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-8 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs font-mono whitespace-nowrap shadow-lg"
            >
              {Math.round(hoveredInfo.rect.width)} × {Math.round(hoveredInfo.rect.height)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Tooltip */}
      <AnimatePresence>
        {showTooltip && hoveredInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 25,
              duration: 0.2 
            }}
            className={cn(
              "lc-element-selection-overlay fixed pointer-events-none z-[999998]",
              "bg-popover text-popover-foreground border rounded-lg shadow-xl p-3 max-w-sm",
              className
            )}
            style={{
              left: Math.min(
                mousePosition.x + 15, 
                window.innerWidth - 300
              ),
              top: Math.max(
                mousePosition.y - 10, 
                10
              ),
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="font-semibold text-sm">
                &lt;{hoveredInfo.tagName}&gt;
              </span>
              {hoveredInfo.id && (
                <Badge variant="secondary" className="text-xs font-mono">
                  #{hoveredInfo.id}
                </Badge>
              )}
            </div>
            
            {/* Element Info */}
            <div className="space-y-2 text-xs">
              {/* Selector */}
              <div className="flex items-start gap-2">
                <Code2 className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                <code className="text-muted-foreground font-mono bg-muted/50 px-1 rounded text-xs break-all">
                  {hoveredInfo.selector}
                </code>
              </div>
              
              {/* Classes */}
              {hoveredInfo.classes.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Classes:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hoveredInfo.classes.slice(0, 6).map((cls, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs font-mono px-1 py-0"
                      >
                        {cls}
                      </Badge>
                    ))}
                    {hoveredInfo.classes.length > 6 && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        +{hoveredInfo.classes.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {/* Dimensions */}
              <div className="text-muted-foreground">
                Size: {Math.round(hoveredInfo.rect.width)}px × {Math.round(hoveredInfo.rect.height)}px
              </div>
              
              {/* Instructions */}
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MousePointer2 className="h-3 w-3" />
                  <span>
                    {toggleMode 
                      ? 'Click to select' 
                      : 'CMD/Ctrl + Click to select'
                    }
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}