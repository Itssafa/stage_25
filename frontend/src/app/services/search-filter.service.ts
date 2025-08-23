import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchFilterService {

  /**
   * Filter an array of objects based on a search field and value
   * @param items Array of items to filter
   * @param field Field key to search in
   * @param value Value to search for
   * @returns Filtered array
   */
  filterItems<T>(items: T[], field: string, value: any): T[] {
    if (!value || value === '' || !field || !items) {
      return items;
    }

    return items.filter(item => {
      const fieldValue = this.getNestedProperty(item, field);
      
      if (fieldValue === null || fieldValue === undefined) {
        return false;
      }

      // Handle different types of comparisons
      return this.matchesValue(fieldValue, value);
    });
  }

  /**
   * Apply multiple filters to an array of items
   * @param items Array of items to filter
   * @param filters Object containing field-value pairs for filtering
   * @returns Filtered array
   */
  applyMultipleFilters<T>(items: T[], filters: { [field: string]: any }): T[] {
    if (!items || !filters) {
      return items;
    }

    return items.filter(item => {
      return Object.entries(filters).every(([field, value]) => {
        if (!value || value === '') {
          return true; // Ignore empty filters
        }
        
        const fieldValue = this.getNestedProperty(item, field);
        
        if (fieldValue === null || fieldValue === undefined) {
          return false;
        }

        return this.matchesValue(fieldValue, value);
      });
    });
  }

  /**
   * Get nested property value from an object using dot notation
   * @param obj Object to get property from
   * @param path Property path (e.g., 'user.name' or 'operation.id')
   * @returns Property value
   */
  private getNestedProperty(obj: any, path: string): any {
    if (!obj || !path) {
      return null;
    }

    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Check if a field value matches the search value
   * @param fieldValue Value from the object field
   * @param searchValue Value to search for
   * @returns Boolean indicating match
   */
  private matchesValue(fieldValue: any, searchValue: any): boolean {
    // Convert both values to strings for comparison
    const fieldStr = String(fieldValue).toLowerCase();
    const searchStr = String(searchValue).toLowerCase();

    // Handle different comparison types
    if (typeof fieldValue === 'number' && !isNaN(Number(searchValue))) {
      return Number(fieldValue) === Number(searchValue);
    }

    if (fieldValue instanceof Date || this.isDateString(fieldValue)) {
      return this.compareDates(fieldValue, searchValue);
    }

    // Default to string contains comparison
    return fieldStr.includes(searchStr);
  }

  /**
   * Check if a string represents a date
   * @param value Value to check
   * @returns Boolean indicating if it's a date string
   */
  private isDateString(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    
    const date = new Date(value);
    return !isNaN(date.getTime()) && !!value.match(/^\d{4}-\d{2}-\d{2}/);
  }

  /**
   * Compare dates for filtering
   * @param fieldValue Date value from field
   * @param searchValue Date value to search for
   * @returns Boolean indicating match
   */
  private compareDates(fieldValue: any, searchValue: any): boolean {
    try {
      const fieldDate = new Date(fieldValue);
      const searchDate = new Date(searchValue);
      
      if (isNaN(fieldDate.getTime()) || isNaN(searchDate.getTime())) {
        return false;
      }
      
      // Compare dates by day (ignore time)
      const fieldDateStr = fieldDate.toISOString().split('T')[0];
      const searchDateStr = searchDate.toISOString().split('T')[0];
      
      return fieldDateStr === searchDateStr;
    } catch (error) {
      return false;
    }
  }

  /**
   * Perform a global search across multiple fields
   * @param items Array of items to search
   * @param searchValue Value to search for
   * @param searchFields Array of field paths to search in
   * @returns Filtered array
   */
  globalSearch<T>(items: T[], searchValue: string, searchFields: string[]): T[] {
    if (!searchValue || !searchValue.trim() || !searchFields.length) {
      return items;
    }

    const searchTerm = searchValue.toLowerCase().trim();

    return items.filter(item => {
      return searchFields.some(field => {
        const fieldValue = this.getNestedProperty(item, field);
        if (fieldValue === null || fieldValue === undefined) {
          return false;
        }
        
        return String(fieldValue).toLowerCase().includes(searchTerm);
      });
    });
  }

  /**
   * Generate search field configurations for a given object type
   * @param sampleObject Sample object to generate fields from
   * @param customLabels Optional custom labels for fields
   * @returns Array of SearchField configurations
   */
  generateSearchFields(sampleObject: any, customLabels?: { [key: string]: string }): any[] {
    if (!sampleObject) {
      return [];
    }

    const fields: any[] = [];

    Object.keys(sampleObject).forEach(key => {
      const value = sampleObject[key];
      let type: 'text' | 'number' | 'date' | 'select' = 'text';

      // Determine field type
      if (typeof value === 'number') {
        type = 'number';
      } else if (value instanceof Date || this.isDateString(value)) {
        type = 'date';
      } else if (typeof value === 'boolean') {
        type = 'select';
      }

      fields.push({
        key,
        label: customLabels?.[key] || this.capitalizeFirst(key),
        type,
        options: type === 'select' ? [
          { value: true, label: 'Oui' },
          { value: false, label: 'Non' }
        ] : undefined
      });
    });

    return fields;
  }

  /**
   * Capitalize first letter of a string
   * @param str String to capitalize
   * @returns Capitalized string
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}