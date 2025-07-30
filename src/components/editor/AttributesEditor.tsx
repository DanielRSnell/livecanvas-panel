import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Trash2, 
  Settings, 
  Hash, 
  Type, 
  Link,
  Eye,
  MousePointer,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttributesEditorProps {
  attributes: Record<string, string>;
  onChange: (attributes: Record<string, string>) => void;
  className?: string;
}

interface AttributeItem {
  name: string;
  value: string;
  isEditing: boolean;
}

// Common HTML attributes organized by category
const COMMON_ATTRIBUTES = {
  'Core': ['id', 'class', 'title', 'lang', 'dir'],
  'Data & ARIA': ['data-*', 'aria-label', 'aria-describedby', 'aria-hidden', 'role'],
  'Events': ['onclick', 'onload', 'onchange', 'onsubmit', 'onfocus', 'onblur'],
  'Form': ['name', 'value', 'placeholder', 'required', 'disabled', 'readonly'],
  'Links & Media': ['href', 'target', 'src', 'alt', 'width', 'height'],
  'Styling': ['style', 'hidden', 'contenteditable', 'draggable', 'spellcheck']
};

export function AttributesEditor({ attributes, onChange, className }: AttributesEditorProps) {
  const [attributeItems, setAttributeItems] = useState<AttributeItem[]>([]);
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [showCommonAttrs, setShowCommonAttrs] = useState(false);

  // Convert attributes object to editable items
  useEffect(() => {
    const items = Object.entries(attributes).map(([name, value]) => ({
      name,
      value,
      isEditing: false
    }));
    setAttributeItems(items);
  }, [attributes]);

  // Convert items back to attributes object
  const updateAttributes = useCallback((items: AttributeItem[]) => {
    const newAttributes: Record<string, string> = {};
    items.forEach(item => {
      if (item.name.trim()) {
        newAttributes[item.name.trim()] = item.value;
      }
    });
    onChange(newAttributes);
  }, [onChange]);

  const handleAddAttribute = useCallback(() => {
    if (!newAttrName.trim()) return;
    
    const newItem: AttributeItem = {
      name: newAttrName.trim(),
      value: newAttrValue,
      isEditing: false
    };
    
    const updatedItems = [...attributeItems, newItem];
    setAttributeItems(updatedItems);
    updateAttributes(updatedItems);
    
    setNewAttrName('');
    setNewAttrValue('');
  }, [newAttrName, newAttrValue, attributeItems, updateAttributes]);

  const handleUpdateAttribute = useCallback((index: number, field: 'name' | 'value', newValue: string) => {
    const updatedItems = attributeItems.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: newValue };
      }
      return item;
    });
    
    setAttributeItems(updatedItems);
    updateAttributes(updatedItems);
  }, [attributeItems, updateAttributes]);

  const handleRemoveAttribute = useCallback((index: number) => {
    const updatedItems = attributeItems.filter((_, i) => i !== index);
    setAttributeItems(updatedItems);
    updateAttributes(updatedItems);
  }, [attributeItems, updateAttributes]);

  const handleToggleEdit = useCallback((index: number) => {
    const updatedItems = attributeItems.map((item, i) => {
      if (i === index) {
        return { ...item, isEditing: !item.isEditing };
      }
      return item;
    });
    setAttributeItems(updatedItems);
  }, [attributeItems]);

  const handleAddCommonAttribute = useCallback((attrName: string) => {
    if (attributeItems.some(item => item.name === attrName)) {
      return; // Attribute already exists
    }

    const newItem: AttributeItem = {
      name: attrName,
      value: '',
      isEditing: true
    };
    
    const updatedItems = [...attributeItems, newItem];
    setAttributeItems(updatedItems);
    setShowCommonAttrs(false);
  }, [attributeItems]);

  const getAttributeIcon = (attrName: string) => {
    if (attrName === 'id') return <Hash className="h-3 w-3" />;
    if (attrName === 'class') return <Type className="h-3 w-3" />;
    if (attrName.startsWith('href')) return <Link className="h-3 w-3" />;
    if (attrName.startsWith('aria-')) return <Eye className="h-3 w-3" />;
    if (attrName.startsWith('data-')) return <Zap className="h-3 w-3" />;
    if (attrName.startsWith('on')) return <MousePointer className="h-3 w-3" />;
    return <Settings className="h-3 w-3" />;
  };

  return (
    <div className={cn('attributes-editor space-y-4', className)}>
      {/* Current Attributes List */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Element Attributes</Label>
        
        {attributeItems.length === 0 ? (
          <div className="text-xs text-muted-foreground p-4 border border-dashed rounded-lg text-center">
            No attributes set. Add some below.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {attributeItems.map((item, index) => (
              <div 
                key={`${item.name}-${index}`}
                className="flex items-center gap-2 p-2 border rounded-lg bg-muted/20"
              >
                <div className="flex items-center gap-1 text-muted-foreground">
                  {getAttributeIcon(item.name)}
                </div>
                
                {item.isEditing ? (
                  <>
                    <Input
                      value={item.name}
                      onChange={(e) => handleUpdateAttribute(index, 'name', e.target.value)}
                      placeholder="attribute name"
                      className="text-xs h-6 flex-1"
                    />
                    <span className="text-xs text-muted-foreground">=</span>
                    <Input
                      value={item.value}
                      onChange={(e) => handleUpdateAttribute(index, 'value', e.target.value)}
                      placeholder="value"
                      className="text-xs h-6 flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleEdit(index)}
                      className="h-6 w-6"
                    >
                      ✓
                    </Button>
                  </>
                ) : (
                  <>
                    <span 
                      className="text-xs font-mono flex-1 cursor-pointer hover:text-primary"
                      onClick={() => handleToggleEdit(index)}
                    >
                      {item.name}
                    </span>
                    <span className="text-xs text-muted-foreground">=</span>
                    <span 
                      className="text-xs font-mono flex-1 cursor-pointer hover:text-primary truncate"
                      onClick={() => handleToggleEdit(index)}
                      title={item.value}
                    >
                      "{item.value}"
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAttribute(index)}
                      className="h-6 w-6 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Attribute */}
      <div className="space-y-3 p-3 border border-dashed rounded-lg">
        <Label className="text-xs font-medium">Add New Attribute</Label>
        
        <div className="flex items-center gap-2">
          <Input
            value={newAttrName}
            onChange={(e) => setNewAttrName(e.target.value)}
            placeholder="attribute name"
            className="text-xs h-7 flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAddAttribute()}
          />
          <span className="text-xs text-muted-foreground">=</span>
          <Input
            value={newAttrValue}
            onChange={(e) => setNewAttrValue(e.target.value)}
            placeholder="value"
            className="text-xs h-7 flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAddAttribute()}
          />
          <Button
            onClick={handleAddAttribute}
            disabled={!newAttrName.trim()}
            size="icon"
            className="h-7 w-7"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Common Attributes Quick Add */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCommonAttrs(!showCommonAttrs)}
            className="text-xs h-6"
          >
            Common Attributes
          </Button>
          
          {showCommonAttrs && (
            <div className="space-y-2">
              {Object.entries(COMMON_ATTRIBUTES).map(([category, attrs]) => (
                <div key={category} className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">{category}</div>
                  <div className="flex flex-wrap gap-1">
                    {attrs.map(attr => (
                      <Button
                        key={attr}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddCommonAttribute(attr)}
                        disabled={attributeItems.some(item => item.name === attr)}
                        className="text-xs h-5 px-2 py-0"
                      >
                        {attr}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}