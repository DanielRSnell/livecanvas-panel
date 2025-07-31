import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatHtml, basicFormatHtml } from '@/utils/htmlFormatter';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'html' | 'json' | 'javascript' | 'css';
  height?: string | number;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  minimap?: boolean;
  lineNumbers?: 'on' | 'off' | 'relative' | 'interval';
}

export function MonacoEditor({
  value,
  onChange,
  language = 'html',
  height = '100%',
  className,
  placeholder,
  readOnly = false,
  minimap = false,
  lineNumbers = 'on'
}: MonacoEditorProps) {
  const editorRef = useRef<any>(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [lastFormattedValue, setLastFormattedValue] = useState<string>('');

  // Auto-format when value changes (from parent component)
  useEffect(() => {
    const autoFormatValue = async () => {
      if (
        !editorRef.current || 
        !value || 
        value === lastFormattedValue || 
        language !== 'html' ||
        isFormatting
      ) {
        return;
      }

      setIsFormatting(true);
      try {
        const formatted = await formatHtml(value);
        if (formatted !== value) {
          editorRef.current.setValue(formatted);
          setLastFormattedValue(formatted);
          onChange(formatted);
        } else {
          setLastFormattedValue(value);
        }
      } catch (error) {
        console.warn('Auto-formatting failed, using basic formatter:', error);
        const formatted = basicFormatHtml(value);
        if (formatted !== value) {
          editorRef.current.setValue(formatted);
          setLastFormattedValue(formatted);
          onChange(formatted);
        } else {
          setLastFormattedValue(value);
        }
      } finally {
        setIsFormatting(false);
      }
    };

    autoFormatValue();
  }, [value, language, lastFormattedValue, isFormatting, onChange]);

  // Format HTML function
  const formatCurrentValue = async () => {
    if (!editorRef.current || isFormatting) return;
    
    setIsFormatting(true);
    try {
      const currentValue = editorRef.current.getValue();
      let formatted;
      
      if (language === 'html') {
        // Try Prettier first, fallback to basic formatter
        try {
          formatted = await formatHtml(currentValue);
        } catch (error) {
          console.warn('Prettier formatting failed, using fallback:', error);
          formatted = basicFormatHtml(currentValue);
        }
      } else {
        // For non-HTML languages, use basic formatting
        formatted = currentValue
          .replace(/></g, '>\n<') // Add line breaks between tags
          .replace(/^\s+/gm, (match) => '  '.repeat(match.length / 4)); // Normalize indentation
      }
      
      // Update editor content
      editorRef.current.setValue(formatted);
      setLastFormattedValue(formatted);
      
      // Trigger onChange to sync with parent component
      onChange(formatted);
    } catch (error) {
      console.error('Formatting error:', error);
    } finally {
      setIsFormatting(false);
    }
  };

  const handleEditorDidMount = async (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Force vs-dark theme and ensure it stays dark
    monaco.editor.setTheme('vs-dark');
    
    // Add listener to prevent theme changes (with safety check)
    let disposable: any = null;
    try {
      if (monaco.editor.onDidChangeTheme && typeof monaco.editor.onDidChangeTheme === 'function') {
        disposable = monaco.editor.onDidChangeTheme(() => {
          if (monaco.editor.getTheme && monaco.editor.getTheme() !== 'vs-dark') {
            monaco.editor.setTheme('vs-dark');
          }
        });
      }
    } catch (error) {
      console.warn('Monaco onDidChangeTheme not available:', error);
    }
    
    // Add ultra-aggressive custom CSS to completely eliminate focus borders
    const addCustomFocusBorderCSS = () => {
      // Remove existing styles first
      const existingStyle = document.getElementById('monaco-focus-border-override');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      const style = document.createElement('style');
      style.id = 'monaco-focus-border-override';
      style.textContent = `
        /* NUCLEAR OPTION: Remove ALL focus borders everywhere in Monaco */
        * {
          --vscode-focusBorder: transparent !important;
          --vscode-editor-focusBorder: transparent !important;
          --monaco-focusBorder: transparent !important;
          --vscode-contrastBorder: transparent !important;
          --vscode-contrastActiveBorder: transparent !important;
        }
        
        /* Target every possible Monaco element with maximum specificity */
        .monaco-editor,
        .monaco-editor *,
        .monaco-diff-editor,
        .monaco-diff-editor *,
        .monaco-component,
        .monaco-component *,
        div[class*="monaco"],
        div[class*="monaco"] *,
        div[data-editor-id],
        div[data-editor-id] *,
        .monaco-editor-background,
        .monaco-editor .view-overlays,
        .monaco-editor .view-overlays *,
        .monaco-editor .view-rulers,
        .monaco-editor .view-rulers *,
        .monaco-editor .view-zones,
        .monaco-editor .view-zones *,
        .monaco-editor .view-lines,
        .monaco-editor .view-lines *,
        .monaco-editor .cursors-layer,
        .monaco-editor .cursors-layer *,
        .monaco-editor .margin,
        .monaco-editor .margin *,
        .monaco-editor .glyph-margin,
        .monaco-editor .glyph-margin *,
        .monaco-editor .lines-content,
        .monaco-editor .lines-content *,
        .monaco-editor .overflow-guard,
        .monaco-editor .overflow-guard *,
        .monaco-editor .editor-scrollable,
        .monaco-editor .editor-scrollable *,
        .monaco-editor .monaco-scrollable-element,
        .monaco-editor .monaco-scrollable-element *,
        .monaco-editor textarea,
        .monaco-editor input,
        .monaco-editor .inputarea,
        .monaco-editor .textarea,
        textarea[data-monaco-editor-id],
        input[data-monaco-editor-id],
        .monaco-editor:focus,
        .monaco-editor *:focus,
        .monaco-editor:focus-within,
        .monaco-editor *:focus-within,
        .monaco-editor:focus-visible,
        .monaco-editor *:focus-visible {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
          -webkit-focus-ring-color: transparent !important;
          focus-ring-color: transparent !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
        }
        
        /* Override any pseudo-element borders */
        .monaco-editor::before,
        .monaco-editor::after,
        .monaco-editor *::before,
        .monaco-editor *::after {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        
        /* Force remove focus on all interactive elements */
        .monaco-editor [tabindex],
        .monaco-editor [tabindex]:focus,
        .monaco-editor [contenteditable],
        .monaco-editor [contenteditable]:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
      `;
      document.head.appendChild(style);
      
      // Also add to body for maximum coverage
      document.body.style.setProperty('--vscode-focusBorder', 'transparent', 'important');
      document.body.style.setProperty('--vscode-editor-focusBorder', 'transparent', 'important');
      document.body.style.setProperty('--monaco-focusBorder', 'transparent', 'important');
    };
    
    // Add the custom CSS immediately
    addCustomFocusBorderCSS();
    
    // Add mutation observer to continuously remove focus borders
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Remove focus styles from any newly added Monaco elements
              if (element.classList && (
                element.classList.contains('monaco-editor') ||
                element.classList.toString().includes('monaco') ||
                element.closest('.monaco-editor')
              )) {
                removeFocusStyles(element);
              }
              // Also check children
              const monacoElements = element.querySelectorAll('[class*="monaco"], .monaco-editor, .monaco-editor *');
              monacoElements.forEach(removeFocusStyles);
            }
          });
        }
      });
    });
    
    const removeFocusStyles = (element: Element) => {
      if (element instanceof HTMLElement) {
        element.style.setProperty('outline', 'none', 'important');
        element.style.setProperty('border', 'none', 'important');
        element.style.setProperty('box-shadow', 'none', 'important');
        element.style.setProperty('--vscode-focusBorder', 'transparent', 'important');
        element.style.setProperty('--vscode-editor-focusBorder', 'transparent', 'important');
        element.style.setProperty('--monaco-focusBorder', 'transparent', 'important');
      }
    };
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Direct DOM manipulation after a brief delay to ensure Monaco is fully mounted
    setTimeout(() => {
      const monacoContainer = editor.getDomNode();
      if (monacoContainer) {
        // Remove focus styles from the main container and all children
        const allElements = [monacoContainer, ...monacoContainer.querySelectorAll('*')];
        allElements.forEach(removeFocusStyles);
        
        // Also remove tabindex to prevent focus
        allElements.forEach(element => {
          if (element instanceof HTMLElement && element.hasAttribute('tabindex')) {
            element.removeAttribute('tabindex');
          }
        });
      }
    }, 100);
    
    // EXACT LiveCanvas behavior: DO NOT auto-format HTML on load
    // LiveCanvas preserves the original formatting from the source document
    setLastFormattedValue(value);
    
    // Add custom commands optimized for HTML editing
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Prevent default save, let parent handle it
      return false;
    });
    
    // Custom key bindings for better navigation in constrained space
    editor.addCommand(monaco.KeyCode.Tab, () => {
      // Custom tab behavior: insert 2 spaces instead of default tab
      const selection = editor.getSelection();
      if (selection && !selection.isEmpty()) {
        // If text is selected, indent the selected lines
        editor.trigger('keyboard', 'editor.action.indentLines', null);
      } else {
        // Insert 2 spaces at cursor position
        editor.executeEdits('tab-replacement', [{
          range: selection,
          text: '  ', // 2 spaces
          forceMoveMarkers: true
        }]);
      }
    });
    
    // Shift+Tab for unindent
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Tab, () => {
      editor.trigger('keyboard', 'editor.action.outdentLines', null);
    });
    
    // Enhanced formatting command using Prettier
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      formatCurrentValue();
    });
    
    // Add format action to context menu
    editor.addAction({
      id: 'format-html',
      label: 'Format HTML',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
      contextMenuGroupId: '9_cutcopypaste',
      contextMenuOrder: 1,
      run: () => {
        formatCurrentValue();
      }
    });
  };

  const handleChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };


  const editorOptions = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly,
    cursorStyle: 'line' as const,
    automaticLayout: true,
    minimap: { enabled: minimap },
    lineNumbers,
    scrollBeyondLastLine: false,
    wordWrap: 'on' as const,
    wordWrapColumn: 80,
    wordWrapMinified: true,
    wrappingIndent: 'indent' as const,
    wordWrapBreakAfterCharacters: '\t})]?|&,;',
    wordWrapBreakBeforeCharacters: '{([+',
    wordWrapBreakObtrusiveCharacters: '.',
    contextmenu: true,
    fontSize: 13,
    lineHeight: 1.6,
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", "Fira Code", monospace',
    // Tab and indentation settings optimized for constrained space
    tabSize: 2,
    insertSpaces: true,
    detectIndentation: false,
    // Reduce auto-formatting that can cause navigation issues
    formatOnType: false,
    formatOnPaste: false,
    autoIndent: 'brackets' as const, // Less aggressive than 'full'
    // Suggestion settings optimized for small space
    suggest: {
      insertMode: 'replace' as const,
      filterGraceful: true,
      showWords: false, // Reduce noise in suggestions
      showSnippets: false // Disable snippets that can be intrusive
    },
    quickSuggestions: {
      other: false, // Disable for better navigation
      comments: false,
      strings: false
    },
    parameterHints: {
      enabled: false // Disable to reduce UI clutter
    },
    // Folding settings for better space utilization - conditional based on line numbers
    folding: lineNumbers === 'off' ? false : true,
    foldingStrategy: 'indentation' as const,
    showFoldingControls: 'always' as const,
    foldingHighlight: false,
    // Bracket pair colorization
    bracketPairColorization: {
      enabled: true
    },
    // Additional settings for better navigation in small space
    smoothScrolling: true,
    mouseWheelZoom: false,
    dragAndDrop: false, // Prevent accidental drag operations
    links: false, // Disable link detection to prevent accidents
    occurrencesHighlight: false, // Reduce visual noise
    renderWhitespace: 'selection' as const, // Only show whitespace when selected
    renderControlCharacters: false,
    // Optimize viewport for flexible space - minimal padding for clean content area
    padding: {
      top: lineNumbers === 'off' ? 8 : 8,
      bottom: lineNumbers === 'off' ? 8 : 8,
      left: lineNumbers === 'off' ? 12 : 0, // Add left padding when no line numbers for clean edge
      right: lineNumbers === 'off' ? 12 : 0
    },
    // Improve scrolling behavior with LiveCanvas theme - prevent horizontal overflow
    scrollbar: {
      vertical: 'auto' as const,
      horizontal: 'hidden' as const, // Hide horizontal scrollbar to prevent overflow
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 0 // Remove horizontal scrollbar completely
    },
    // Remove all margins and gutters for clean content area
    lineNumbersMinChars: lineNumbers === 'off' ? 0 : 2,
    glyphMargin: false, // Remove glyph margin completely
    lineDecorationsWidth: lineNumbers === 'off' ? 0 : 10, // Remove decoration space
    lineNumbersWidth: lineNumbers === 'off' ? 0 : undefined, // Remove line number area completely
    // Tab bar settings - hide default tabs
    showTabs: false, // Hide tab bar completely
    renderTabs: false, // Don't render tabs
    hideCursorInOverviewRuler: true, // Hide cursor in overview ruler to save space
    // Remove all focus indicators
    renderValidationDecorations: 'off' as const, // Remove validation decorations that can show focus
    renderLineHighlight: 'none' as const, // Remove line highlighting
    renderFinalNewline: 'off' as const, // Remove final newline rendering
    // Additional focus removal
    overviewRulerBorder: false, // Remove overview ruler border
    scrollBeyondLastColumn: 0, // Prevent extra scrolling that can trigger focus
    stopRenderingLineAfter: -1 // Render all lines to prevent focus issues
  };

  return (
    <div className={cn('monaco-editor-container overflow-hidden relative h-full flex flex-col', className)}>
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-lc-accent bg-lc-bg-dark/50">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={formatCurrentValue}
            disabled={isFormatting}
            className="h-7 w-7 p-0 hover:bg-lc-accent text-lc-grey-light hover:text-white relative group"
            title={isFormatting ? 'Formatting...' : 'Format Code (Ctrl+Shift+F)'}
          >
            <Code2 className="h-3.5 w-3.5" />
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-lc-bg-dark text-white text-xs rounded border border-lc-accent opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[9999999]">
              <div>{isFormatting ? 'Formatting...' : 'Format Code'}</div>
              <div className="text-xs text-lc-grey">Ctrl+Shift+F</div>
            </div>
          </Button>
        </div>
        
        <div className="text-xs text-lc-grey opacity-60">
          {language.toUpperCase()}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={editorOptions}
          loading={
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Loading editor...
            </div>
          }
        />
      </div>
    </div>
  );
}