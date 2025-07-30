/**
 * Attribute Management - EXACT replicas of LiveCanvas functions
 */

import { getWorkingDocument } from './html';

/**
 * getAttributeValue - EXACT replica of LiveCanvas function
 * Gets the value of an attribute from the specified selector
 * 
 * @param selector - CSS selector
 * @param attribute_name - Name of the attribute
 * @returns Attribute value as string, empty string if not found
 */
function getAttributeValue(selector: string, attribute_name: string): string {
    if (selector === undefined || selector === '' || attribute_name === undefined || attribute_name === '') {
        console.log("getAttributeValue is called with an undefined parameter");
        return "";
    }
    
    const doc = getWorkingDocument();
    if (!doc) {
        console.log("Document not available");
        return "";
    }
    
    const element = doc.querySelector(selector);
    if (!element) {
        console.log("getAttributeValue is called with an undefined parameter");
        return "";
    }
    
    const value = element.getAttribute(attribute_name);
    return value || "";
}

/**
 * setAttributeValue - EXACT replica of LiveCanvas function
 * Sets the value of an attribute on the specified selector
 * If newValue is empty string, removes the attribute
 * 
 * @param selector - CSS selector
 * @param attribute_name - Name of the attribute
 * @param newValue - New attribute value, empty string removes attribute
 */
function setAttributeValue(selector: string, attribute_name: string, newValue: string): void {
    const doc = getWorkingDocument();
    if (!doc) {
        console.log("Document not available");
        return;
    }
    
    const element = doc.querySelector(selector);
    if (!element) {
        console.log("Element not found: " + selector);
        return;
    }
    
    if (newValue === '') {
        element.removeAttribute(attribute_name);
    } else {
        element.setAttribute(attribute_name, newValue);
    }
}

export {
    getAttributeValue,
    setAttributeValue
};