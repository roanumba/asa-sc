/**
 * A utility to create a form model with React state management.
 * Each field in the model is represented as a property with getter and setter,
 * allowing easy two-way data binding in forms.
 *
 * Supports:
 * - Primitive types (string, number, boolean)
 * - Objects (plain objects are deep cloned on initialization)
 * - Arrays (array values are properly cloned to avoid mutations)
 *
 * @example
 * const form = useModel({
 *   name: '',
 *   age: 0,
 *   isActive: false,
 *   address: { street: '', city: '', zip: '' },
 *   hobbies: ['reading', 'coding']
 * });
 *
 * // Access and update values
 * form.name = 'John';
 * form.address = { ...form.address, city: 'New York' };
 * form.hobbies = [...form.hobbies, 'gaming'];
 *
 * // Helper methods
 * const allValues = form.getValues();  // Get all current values
 * form.reset();                        // Reset all to initial values
 * form.resetFields('name', 'age');     // Reset specific fields
 * form.setValues({ name: 'Jane' });    // Set multiple values at once
 **/

import React from "react";

type FormModel = {
    [key: string]: any;
};

/**
 * Deep clone a value to avoid reference issues with objects and arrays
 */
function deepClone<T>(value: T): T {
    if (value === null || value === undefined) {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(item => deepClone(item)) as T;
    }

    if (typeof value === 'object' && value.constructor === Object) {
        const cloned: any = {};
        Object.entries(value).forEach(([key, val]) => {
            cloned[key] = deepClone(val);
        });
        return cloned as T;
    }

    return value;
}

/**
 * Normalize initial value based on type
 */
function normalizeValue(value: any): any {
    if (typeof value === 'boolean') {
        return !!value;
    }

    // Deep clone objects and arrays to prevent reference issues
    if (Array.isArray(value)) {
        return deepClone(value);
    }

    if (value !== null && typeof value === 'object' && value.constructor === Object) {
        return deepClone(value);
    }

    return value;
}

/**
 * Convert incoming value to appropriate type based on current state
 */
function convertValue(currentValue: any, newValue: any): any {
    // Handle boolean conversion
    if (typeof currentValue === 'boolean') {
        return newValue === 'true' || newValue === true;
    }

    // Handle number conversion
    if (typeof currentValue === 'number' && typeof newValue === 'string') {
        const parsed = parseFloat(newValue);
        return isNaN(parsed) ? currentValue : parsed;
    }

    // For objects and arrays, deep clone to avoid mutations
    if (Array.isArray(newValue)) {
        return deepClone(newValue);
    }

    if (newValue !== null && typeof newValue === 'object' && newValue.constructor === Object) {
        return deepClone(newValue);
    }

    return newValue;
}

function createFormModel(fields: FormModel) {
    const state: Record<string, [any, React.Dispatch<React.SetStateAction<any>>]> = {};
    const initialValues: FormModel = {};

    Object.entries(fields).forEach(([key, value]) => {
        const normalizedValue = normalizeValue(value);
        state[key] = React.useState(normalizedValue);
        initialValues[key] = normalizedValue;
    });

    // Helper methods
    const helpers = {
        /**
         * Get all current form values as a plain object
         */
        getValues: (): FormModel => {
            const values: FormModel = {};
            Object.keys(state).forEach(key => {
                values[key] = state[key][0];
            });
            return values;
        },

        /**
         * Reset all fields to their initial values
         */
        reset: (): void => {
            Object.keys(state).forEach(key => {
                state[key][1](deepClone(initialValues[key]));
            });
        },

        /**
         * Reset specific fields to their initial values
         */
        resetFields: (...fieldNames: string[]): void => {
            fieldNames.forEach(fieldName => {
                if (state[fieldName]) {
                    state[fieldName][1](deepClone(initialValues[fieldName]));
                }
            });
        },

        /**
         * Set multiple values at once
         */
        setValues: (values: FormModel): void => {
            Object.entries(values).forEach(([key, value]) => {
                if (state[key]) {
                    const convertedValue = convertValue(state[key][0], value);
                    state[key][1](convertedValue);
                }
            });
        },
    };

    const proxy = new Proxy(
        {},
        {
            get(_, prop: string) {
                // Return helper methods
                if (prop in helpers) {
                    return helpers[prop as keyof typeof helpers];
                }

                // Return field value
                if (state[prop]) {
                    return state[prop][0];
                }
                return undefined;
            },
            set(_, prop: string, value: any) {
                if (state[prop]) {
                    const convertedValue = convertValue(state[prop][0], value);
                    state[prop][1](convertedValue);
                    return true;
                }
                return false;
            },
        }
    );

    return proxy as FormModel;
}

function useModel(fields:any) {

    return createFormModel(fields);
}

export default useModel;
    
