import React, { useState, useCallback, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { MonacoEditor } from '@/components/editor/MonacoEditor';
import { 
  Code2, 
  Palette, 
  X, 
  Settings,
  RotateCcw,
  Eye,
  EyeOff,
  Monitor,
  Zap,
  ZapOff,
  ChevronDown,
  ChevronUp,
  Layers3,
  Home,
  Component,
  Hash,
  Type,
  FileCode,
  Maximize2,
  Minimize2,
  MousePointerSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SelectedElement } from '@/types';

interface ElementToolsPanelProps {
  selectedElement: SelectedElement | null;
  onClose: () => void;
  onClearSelection?: () => void;
  onRealTimeUpdate: (type: 'classes' | 'html' | 'attributes', value: string | Record<string, string>) => void;
  className?: string;
  toggleMode?: boolean;
  onToggleModeChange?: (enabled: boolean) => void;
  isHovered?: boolean;
}

// Professional animation variants
const panelVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    x: -30,
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
    x: -30,
    y: 20,
  }
};

const tabContentVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -10,
  }
};

export function ElementToolsPanel({ 
  selectedElement, 
  onClose, 
  onClearSelection,
  onRealTimeUpdate,
  className,
  toggleMode = false,
  onToggleModeChange,
  isHovered = false
}: ElementToolsPanelProps) {
  // Generate unique IDs for accessibility
  const panelId = useId();
  
  // State management
  const [activeTab, setActiveTab] = useState<'classes' | 'html'>('classes');
  const [classesValue, setClassesValue] = useState('');
  const [htmlValue, setHtmlValue] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [useMonaco, setUseMonaco] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHtmlMaximized, setIsHtmlMaximized] = useState(false);

  // Update form values when selected element changes
  useEffect(() => {
    if (selectedElement) {
      // Filter out lc- prefixed classes before displaying in Monaco
      const filteredClasses = selectedElement.classes.filter(cls => 
        !cls.startsWith('lc-')
      );
      setClassesValue(filteredClasses.join(' '));
      setHtmlValue(selectedElement.innerHTML);
    }
  }, [selectedElement]);

  // Real-time update handlers with debouncing
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleRealTimeChange = useCallback((type: 'classes' | 'html', value: string) => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Debounce the update to avoid too frequent calls
    debounceTimeoutRef.current = setTimeout(() => {
      onRealTimeUpdate(type, value);
    }, 300); // 300ms delay
  }, [onRealTimeUpdate]);

  // Handle classes change with LiveCanvas integration
  const handleClassesChange = useCallback((newClasses: string) => {
    setClassesValue(newClasses);
    
    // Use LiveCanvas utilities for class updates
    if (selectedElement?.selector) {
      const setAttributeValue = (window as any).setAttributeValue || (window as any).LCUtils?.setAttributeValue;
      const updatePreviewSectorial = (window as any).updatePreviewSectorial || (window as any).LCUtils?.updatePreviewSectorial;
      
      if (typeof setAttributeValue === 'function') {
        // Update source document
        setAttributeValue(selectedElement.selector, 'class', newClasses);
        
        // Update preview
        if (typeof updatePreviewSectorial === 'function') {
          updatePreviewSectorial(selectedElement.selector);
        }
        
        // Update DOM element for immediate feedback
        if (selectedElement.element) {
          selectedElement.element.className = newClasses;
        }
        
        console.log(`LiveCanvas: Updated classes for ${selectedElement.selector}:`, newClasses);
      } else {
        // Fallback to real-time update handler
        handleRealTimeChange('classes', newClasses);
      }
    }
  }, [selectedElement, handleRealTimeChange]);

  // Handle HTML change with LiveCanvas integration
  const handleHtmlChange = useCallback((newHtml: string) => {
    setHtmlValue(newHtml);
    
    // Use LiveCanvas utilities for HTML updates
    if (selectedElement?.selector) {
      const setPageHTML = (window as any).setPageHTML || (window as any).LCUtils?.setPageHTML;
      const updatePreviewSectorial = (window as any).updatePreviewSectorial || (window as any).LCUtils?.updatePreviewSectorial;
      
      if (typeof setPageHTML === 'function') {
        // Update source document
        setPageHTML(selectedElement.selector, newHtml);
        
        // Update preview
        if (typeof updatePreviewSectorial === 'function') {
          updatePreviewSectorial(selectedElement.selector);
        }
        
        // Update DOM element for immediate feedback
        if (selectedElement.element) {
          selectedElement.element.innerHTML = newHtml;
        }
        
        console.log(`LiveCanvas: Updated HTML for ${selectedElement.selector}`);
      } else {
        // Fallback to real-time update handler
        handleRealTimeChange('html', newHtml);
      }
    }
  }, [selectedElement, handleRealTimeChange]);


  const handleReset = useCallback(() => {
    if (!selectedElement) return;
    
    if (activeTab === 'classes') {
      const originalClasses = selectedElement.classes.join(' ');
      setClassesValue(originalClasses);
      handleRealTimeChange('classes', originalClasses);
    } else if (activeTab === 'html') {
      setHtmlValue(selectedElement.innerHTML);
      handleRealTimeChange('html', selectedElement.innerHTML);
    }
  }, [selectedElement, activeTab, handleRealTimeChange]);

  // Show waiting state when no element is selected
  const isWaitingForSelection = !selectedElement;
  

  return (
    <motion.div
      id={panelId}
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
      className={cn(
        "lc-element-tools-panel h-full flex flex-col",
        "bg-lc-bg border-r border-lc-accent", // LiveCanvas native colors
        className
      )}
      style={{
        // LiveCanvas native color scheme
        '--panel-bg': '#0a0a0a',           // --color-interface-bg
        '--panel-bg-dark': '#171717',      // --color-interface-bg-dark 
        '--panel-accent': '#262626',       // --color-accents
        '--panel-primary': '#3ecf8e',      // --color1 (Supabase Green)
        '--panel-secondary': '#171717',    // --color2
        '--panel-grey': '#404040',         // --color-grey
        '--panel-grey-light': '#737373',   // --color-lightgrey
        '--text-primary': '#f5f5f5',       // Light text for dark theme
        '--text-secondary': '#a3a3a3',     // Muted text
        '--vscode-focusBorder': '#3ecf8e', // Monaco editor focus border
      } as React.CSSProperties}
    >
      {/* Professional Header */}
      {!isHtmlMaximized && (
        <div id="lc-et-panel-header" className="flex flex-col bg-lc-bg-dark border-b border-lc-accent p-4">
        {/* Main Header Row */}
        <div id="lc-et-header-main" className="flex items-center justify-between mb-3">
          <motion.div 
            id="lc-et-header-left"
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div id="lc-et-header-icon" className="p-2 bg-lc-primary/10 rounded-lg border border-lc-primary/20">
              <Layers3 className="h-5 w-5 text-lc-primary" />
            </div>
            <div id="lc-et-header-info">
              <h1 id="lc-et-header-title" className="text-lg font-bold text-white flex items-center gap-2">
                {isWaitingForSelection ? (
                  "Element Tools"
                ) : (
                  <>
                    &lt;{selectedElement.tagName.toLowerCase()}&gt;
                    {selectedElement.id && (
                      <Badge id="lc-et-element-id-badge" variant="outline" className="text-xs bg-lc-primary/10 text-lc-primary border-lc-primary/30">
                        #{selectedElement.id}
                      </Badge>
                    )}
                  </>
                )}
              </h1>
            </div>
          </motion.div>
            
          <motion.div 
            id="lc-et-header-controls"
            className="flex items-center gap-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Professional Control Buttons */}
            <Button
              id="lc-et-btn-monaco-toggle"
              variant="ghost"
              size="sm"
              onClick={() => setUseMonaco(!useMonaco)}
              className="h-8 w-8 p-0 hover:bg-lc-accent text-lc-grey-light hover:text-white relative group"
              title={useMonaco ? 'Use simple editor' : 'Use Monaco editor'}
            >
              <Monitor className="h-4 w-4" />
              {/* Custom tooltip */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-lc-bg-dark text-white text-xs rounded border border-lc-accent opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[9999999]">
                {useMonaco ? 'Use simple editor' : 'Use Monaco editor'}
              </div>
            </Button>
            
            <Button
              id="lc-et-btn-preview-toggle"
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="h-8 w-8 p-0 hover:bg-lc-accent text-lc-grey-light hover:text-white relative group"
              title={showPreview ? 'Hide preview' : 'Show preview'}
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-lc-bg-dark text-white text-xs rounded border border-lc-accent opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[9999999]">
                {showPreview ? 'Hide preview' : 'Show preview'}
              </div>
            </Button>
            
            <Button
              id="lc-et-btn-minimize-toggle"
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 hover:bg-lc-accent text-lc-grey-light hover:text-white relative group"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-lc-bg-dark text-white text-xs rounded border border-lc-accent opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[9999999]">
                {isMinimized ? 'Expand' : 'Minimize'}
              </div>
            </Button>
            
            {/* Unselect Button - Only show when element is selected */}
            {selectedElement && onClearSelection && (
              <Button
                id="lc-et-btn-unselect"
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="h-8 w-8 p-0 hover:bg-lc-accent text-lc-grey-light hover:text-white relative group"
                title="Clear selection"
              >
                <MousePointerSquare className="h-4 w-4" />
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-lc-bg-dark text-white text-xs rounded border border-lc-accent opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[9999999]">
                  Clear selection
                </div>
              </Button>
            )}
            
            <Separator id="lc-et-header-separator" orientation="vertical" className="h-6 mx-1 bg-lc-accent" />
            
            <Button
              id="lc-et-btn-close"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-red-500/20 text-lc-grey-light hover:text-red-400 relative group"
              title="Close panel"
            >
              <X className="h-4 w-4" />
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-lc-bg-dark text-white text-xs rounded border border-lc-accent opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[9999999]">
                Close panel
              </div>
            </Button>
          </motion.div>
        </div>
        
        {/* Professional Breadcrumb Navigation */}
        {!isWaitingForSelection && (
          <motion.div
            id="lc-et-breadcrumb-container"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Breadcrumb id="lc-et-breadcrumb">
              <BreadcrumbList id="lc-et-breadcrumb-list" className="text-lc-grey-light">
                <BreadcrumbItem id="lc-et-breadcrumb-document">
                  <BreadcrumbLink href="#" className="flex items-center gap-1 text-lc-grey-light hover:text-white">
                    <Home className="h-3 w-3" />
                    Document
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator id="lc-et-breadcrumb-sep-1" className="text-lc-grey" />
                <BreadcrumbItem id="lc-et-breadcrumb-element">
                  <BreadcrumbLink href="#" className="flex items-center gap-1 text-lc-grey-light hover:text-white">
                    <Component className="h-3 w-3" />
                    {selectedElement.tagName.toLowerCase()}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {selectedElement.id && (
                  <>
                    <BreadcrumbSeparator id="lc-et-breadcrumb-sep-2" className="text-lc-grey" />
                    <BreadcrumbItem id="lc-et-breadcrumb-id">
                      <BreadcrumbPage className="flex items-center gap-1 text-lc-primary font-medium">
                        <Hash className="h-3 w-3" />
                        {selectedElement.id}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
            
            {showPreview && (
              <motion.div 
                id="lc-et-selector-preview"
                className="text-xs text-lc-grey-light font-mono bg-lc-accent/50 px-2 py-1 rounded mt-2 truncate border border-lc-accent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {selectedElement.selector}
              </motion.div>
            )}
          </motion.div>
        )}
        </div>
      )}

      {/* Main Content Area */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            id="lc-et-content-container"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="flex-1 flex flex-col overflow-hidden min-h-0"
          >
            {isWaitingForSelection ? (
              // Professional Waiting State
              <div id="lc-et-waiting-state" className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                  id="lc-et-waiting-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-sm"
                >
                  <div id="lc-et-waiting-icon-container" className="mb-6">
                    <div id="lc-et-waiting-icon" className="p-4 bg-lc-accent/50 rounded-full w-fit mx-auto mb-4 border border-lc-accent">
                      <Layers3 className="h-8 w-8 text-lc-primary" />
                    </div>
                  </div>
                  <h3 id="lc-et-waiting-title" className="text-xl font-bold text-white mb-3">
                    Select an Element
                  </h3>
                  <p id="lc-et-waiting-description" className="text-sm text-lc-grey-light mb-6 leading-relaxed">
                    {toggleMode 
                      ? "Click any element on the page to start editing its styles and content."
                      : "Hold CMD/Ctrl and click any element to start editing its styles and content."
                    }
                  </p>
                  <div id="lc-et-waiting-status" className="flex items-center justify-center gap-2 text-xs text-lc-grey-light">
                    <motion.div
                      id="lc-et-waiting-pulse"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-2 w-2 bg-lc-primary rounded-full"
                    />
                    Selection Mode Active
                  </div>
                </motion.div>
              </div>
            ) : isHtmlMaximized ? (
              // Maximized HTML Editor - Full Panel Mode
              <div id="lc-et-maximized-html" className="flex-1 flex flex-col min-h-0 p-4">
                <div id="lc-et-html-header" className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label id="lc-et-html-label" className="text-sm font-medium text-lc-grey-light">
                      HTML Content (Focused Mode)
                    </Label>
                    <Button
                      id="lc-et-btn-html-maximize"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsHtmlMaximized(false)}
                      className="h-6 w-6 p-0 hover:bg-lc-accent text-lc-grey-light hover:text-white relative group"
                      title="Exit focused mode"
                    >
                      <Minimize2 className="h-3.5 w-3.5" />
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-lc-bg-dark text-white text-xs rounded border border-lc-accent opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[9999999]">
                        Exit focused mode
                      </div>
                    </Button>
                  </div>
                </div>
                <div id="lc-et-html-editor-container-max" className="flex-1 min-h-0 border border-lc-accent rounded-md overflow-hidden">
                  {useMonaco ? (
                    <div className="w-full h-full">
                      <MonacoEditor
                        id="lc-et-monaco-editor-max"
                        value={htmlValue}
                        onChange={handleHtmlChange}
                        language="html"
                        height="100%"
                        minimap={true}
                        lineNumbers="on"
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <ScrollArea id="lc-et-html-scroll-max" className="h-full content-area">
                      <Textarea
                        id="lc-et-html-textarea-max"
                        value={htmlValue}
                        onChange={(e) => handleHtmlChange(e.target.value)}
                        placeholder="Enter HTML content..."
                        className="h-full text-sm font-mono resize-none bg-transparent border-none text-white placeholder:text-lc-grey focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </ScrollArea>
                  )}
                </div>
              </div>
            ) : (
              // Professional Editing Interface
              <div id="lc-et-editing-interface" className="flex-1 flex flex-col min-h-0">
                <Tabs 
                  id="lc-et-main-tabs"
                  value={activeTab} 
                  onValueChange={(value) => setActiveTab(value as 'classes' | 'html')}
                  className="h-full flex flex-col min-h-0"
                >
                  {/* Enhanced Tab Navigation */}
                  <div id="lc-et-tabs-nav-container" className="px-4 pt-4 pb-2">
                    <TabsList id="lc-et-tabs-list" className="!grid !w-full grid-cols-2 h-10 bg-lc-accent rounded-lg p-0.5 !items-stretch">
                      <TabsTrigger 
                        id="lc-et-tab-classes"
                        value="classes" 
                        className="text-xs font-medium text-lc-grey-light data-[state=active]:bg-lc-bg-dark data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md flex items-center justify-center gap-1.5 px-2 py-1.5 min-w-0"
                      >
                        <Palette className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">Classes</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        id="lc-et-tab-html"
                        value="html" 
                        className="text-xs font-medium text-lc-grey-light data-[state=active]:bg-lc-bg-dark data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md flex items-center justify-center gap-1.5 px-2 py-1.5 min-w-0"
                      >
                        <FileCode className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">HTML</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Clean CSS Classes Tab with Monaco */}
                  <TabsContent id="lc-et-content-classes" value="classes" className="flex-1 m-0 min-h-0">
                    <motion.div
                      id="lc-et-classes-container"
                      variants={tabContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                      className="h-full flex flex-col p-4 min-h-0"
                    >
                      <div id="lc-et-classes-header" className="mb-3">
                        <Label id="lc-et-classes-label" className="text-sm font-medium text-lc-grey-light mb-2 block">
                          CSS Classes
                        </Label>
                        <p id="lc-et-classes-description" className="text-xs text-lc-grey mb-3">
                          Add or modify CSS classes for this element
                        </p>
                      </div>
                      <div id="lc-et-classes-editor-container" className="flex-1 min-h-0 border border-lc-accent rounded-md overflow-hidden">
                        {useMonaco ? (
                          <div className="w-full h-full">
                            <MonacoEditor
                              id="lc-et-classes-monaco"
                              value={classesValue}
                              onChange={handleClassesChange}
                              language="text"
                              height="100%"
                              minimap={false}
                              lineNumbers="off"
                              className="w-full h-full"
                            />
                          </div>
                        ) : (
                          <ScrollArea id="lc-et-classes-scroll" className="flex-1 content-area">
                            <Textarea
                              id="lc-et-classes-textarea"
                              value={classesValue}
                              onChange={(e) => handleClassesChange(e.target.value)}
                              placeholder="Enter CSS classes separated by spaces..."
                              className="h-full text-sm font-mono resize-none bg-transparent border-none text-white placeholder:text-lc-grey focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </ScrollArea>
                        )}
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Clean HTML Content Tab with Monaco */}
                  <TabsContent id="lc-et-content-html" value="html" className="flex-1 m-0 min-h-0">
                    <motion.div
                      id="lc-et-html-container"
                      variants={tabContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                      className="h-full flex flex-col p-4 min-h-0"
                    >
                      <div id="lc-et-html-header" className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <Label id="lc-et-html-label" className="text-sm font-medium text-lc-grey-light">
                            HTML Content
                          </Label>
                          <Button
                            id="lc-et-btn-html-maximize"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsHtmlMaximized(!isHtmlMaximized);
                              if (!isHtmlMaximized) {
                                setActiveTab('html');
                              }
                            }}
                            className="h-6 w-6 p-0 hover:bg-lc-accent text-lc-grey-light hover:text-white relative group"
                            title={isHtmlMaximized ? 'Exit focused mode' : 'Enter focused mode'}
                          >
                            {isHtmlMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-lc-bg-dark text-white text-xs rounded border border-lc-accent opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[9999999]">
                              {isHtmlMaximized ? 'Exit focused mode' : 'Enter focused mode'}
                            </div>
                          </Button>
                        </div>
                        {!isHtmlMaximized && (
                          <p id="lc-et-html-description" className="text-xs text-lc-grey mb-3">
                            Edit the inner HTML content of this element
                          </p>
                        )}
                      </div>
                      <div id="lc-et-html-editor-container" className="flex-1 min-h-0 border border-lc-accent rounded-md overflow-hidden">
                        {useMonaco ? (
                          <div className="w-full h-full">
                            <MonacoEditor
                              id="lc-et-monaco-editor"
                              value={htmlValue}
                              onChange={handleHtmlChange}
                              language="html"
                              height="100%"
                              minimap={false}
                              lineNumbers="on"
                              className="w-full h-full"
                            />
                          </div>
                        ) : (
                          <ScrollArea id="lc-et-html-scroll" className="h-full content-area">
                            <Textarea
                              id="lc-et-html-textarea"
                              value={htmlValue}
                              onChange={(e) => handleHtmlChange(e.target.value)}
                              placeholder="Enter HTML content..."
                              className="h-full text-sm font-mono resize-none bg-transparent border-none text-white placeholder:text-lc-grey focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </ScrollArea>
                        )}
                      </div>
                    </motion.div>
                  </TabsContent>

                </Tabs>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Clean Minimal Footer */}
      {!isHtmlMaximized && (
        <div id="lc-et-panel-footer" className="border-t border-lc-accent bg-lc-bg-dark p-4">
        <motion.div 
          id="lc-et-footer-content"
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div id="lc-et-footer-left" className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  id="lc-et-btn-reset"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="flex items-center gap-2 h-8 text-lc-grey-light hover:text-white hover:bg-lc-accent"
                  disabled={isWaitingForSelection}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Reset to original values
              </TooltipContent>
            </Tooltip>
            
            {!isWaitingForSelection && (
              <Badge id="lc-et-active-tab-badge" variant="outline" className="text-xs bg-lc-primary/10 text-lc-primary border-lc-primary/30">
                {activeTab === 'classes' ? 'CSS' : 'HTML'}
              </Badge>
            )}
          </div>
          
          {onToggleModeChange && (
            <motion.div
              id="lc-et-footer-right"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3"
            >
              <Label 
                id="lc-et-free-select-label"
                htmlFor={`${panelId}-free-select-switch`}
                className="text-sm font-medium text-lc-grey-light cursor-pointer"
              >
                Free Select ({toggleMode ? 'ON' : 'OFF'})
              </Label>
              <Switch
                id={`lc-et-free-select-switch-${panelId}`}
                checked={toggleMode}
                onCheckedChange={(checked) => {
                  if (onToggleModeChange) {
                    onToggleModeChange(checked);
                  }
                }}
                className="data-[state=checked]:bg-lc-primary"
                aria-label="Toggle Free Select Mode"
              />
            </motion.div>
          )}
        </motion.div>
        </div>
      )}
    </motion.div>
  );
}