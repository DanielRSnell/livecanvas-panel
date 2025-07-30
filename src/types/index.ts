export interface SelectedElement {
  element: HTMLElement;
  selector: string;
  classes: string[];
  tagName: string;
  id?: string;
  innerHTML: string;
  outerHTML: string;
  attributes: Record<string, string>;
}

export interface ElementToolsConfig {
  ajaxUrl: string;
  nonce: string;
  strings: {
    title: string;
    classes: string;
    html: string;
    save: string;
    cancel: string;
    saved: string;
    error: string;
  };
}

export interface SaveResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface ElementToolsState {
  isActive: boolean;
  selectedElement: SelectedElement | null;
  isVisible: boolean;
  activeTab: 'classes' | 'html' | 'attributes';
  isLoading: boolean;
  error: string | null;
  toggleMode: boolean; // Free selection mode (no CMD required)
}

export interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

declare global {
  interface Window {
    lcElementTools?: ElementToolsConfig;
    React?: any;
    ReactDOM?: any;
  }
}