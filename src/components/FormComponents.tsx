import React from 'react';

/**
 * Get validation CSS class for a field
 */
const getValidationClass = (
    fieldName: string,
    validationErrors: string[],
    hasValidated: boolean
): string => {
    if (!hasValidated) return '';
    return validationErrors.includes(fieldName) ? 'border-danger' : '';
};

interface FormInputProps {
    label: string;
    fieldName: string;
    value: string;
    setValue: (value: string) => void;
    type?: string;
    placeholder?: string;
    colSize?: string;
    validationErrors: string[];
    hasValidated: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
    label,
    fieldName,
    value,
    setValue,
    type = 'text',
    placeholder = '',
    colSize = 'col-sm-10',
    validationErrors,
    hasValidated
}) => {
    const validationClass = getValidationClass(fieldName, validationErrors, hasValidated);
    return (
        <div className="row">
            <div className="asa-label col-sm-2">
                {label} :
            </div>
            <div className={colSize}>
                <input
                    type={type}
                    name={fieldName}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className={`form-control input-sm ${validationClass}`}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
};

interface FormTextareaProps {
    label: string;
    fieldName: string;
    value: string;
    setValue: (value: string) => void;
    rows?: number;
    maxLength?: number;
    colSize?: string;
    placeholder?: string;
    style?: React.CSSProperties;
    validationErrors: string[];
    hasValidated: boolean;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
    label,
    fieldName,
    value,
    setValue,
    rows = 2,
    maxLength,
    colSize = 'col-sm-10',
    placeholder = '',
    style,
    validationErrors,
    hasValidated
}) => {
    const validationClass = getValidationClass(fieldName, validationErrors, hasValidated);
    return (
        <div className="row">
            <div className="asa-label col-sm-2">
                {label} :
            </div>
            <div className={colSize}>
                <textarea
                    name={fieldName}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className={`form-control ${colSize} ${validationClass}`}
                    rows={rows}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    style={style}
                />
            </div>
        </div>
    );
};

interface FormSelectProps {
    label: string;
    fieldName: string;
    value: string;
    setValue: (value: string) => void;
    options: (string | { value: string; label: string })[];
    disabled?: boolean;
    colSize?: string;
    validationErrors: string[];
    hasValidated: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
    label,
    fieldName,
    value,
    setValue,
    options,
    disabled = false,
    colSize = 'col-sm-4',
    validationErrors,
    hasValidated
}) => {
    const validationClass = getValidationClass(fieldName, validationErrors, hasValidated);
    return (
        <div className="row">
            <div className="asa-label col-sm-2">
                {label} :
            </div>
            <div className={colSize}>
                <select
                    name={fieldName}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className={`form-control input-sm ${validationClass}`}
                    disabled={disabled}
                >
                    <option value=""></option>
                    {options.map((opt, idx) => {
                        if (typeof opt === 'string') {
                            return <option key={idx} value={opt}>{opt}</option>;
                        }
                        return <option key={idx} value={opt.value}>{opt.label}</option>;
                    })}
                </select>
            </div>
        </div>
    );
};
