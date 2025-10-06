"use client";

import PropTypes from "prop-types";
import { useId } from "react";

/**
 * CheckboxInput
 * -------------
 * Bootstrap checkbox + error/help metinleri
 * Uncontrolled kullanım için uygundur.
 */
export function CheckboxInput({
  name,
  label,
  required = false,
  disabled = false,
  className = "",
  defaultChecked = false,
  helperText,
  errorMessage,
  id,
}) {
  const autoId = useId();
  const inputId = id || `${name}-${autoId}`;
  const descId = `${inputId}-desc`;

  return (
    <div className={`form-check ${className}`}>
      <input
        id={inputId}
        name={name}
        type="checkbox"
        className={`form-check-input ${errorMessage ? "is-invalid" : ""}`}
        defaultChecked={defaultChecked}
        required={required}
        disabled={disabled}
        aria-invalid={!!errorMessage}
        aria-describedby={helperText || errorMessage ? descId : undefined}
      />
      <label className="form-check-label" htmlFor={inputId}>
        {label}
      </label>

      {helperText && (
        <div id={descId} className="form-text">
          {helperText}
        </div>
      )}
      {errorMessage && (
        <div className="invalid-feedback d-block" id={descId}>
          {errorMessage}
        </div>
      )}
    </div>
  );
}

CheckboxInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired, // string ya da ReactNode (link içerebilir)
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  className: PropTypes.string,
  helperText: PropTypes.node,
  errorMessage: PropTypes.node,
  id: PropTypes.string,
};

export default CheckboxInput;
