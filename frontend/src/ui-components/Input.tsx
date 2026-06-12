// components/InputField.js
import React, { ChangeEvent, FocusEvent, ReactNode } from 'react';

const Input = ({ 
  label = "", 
  name = "", 
  type = 'text', 
  placeholder="", 
  value="", 
  onChange= (e: ChangeEvent<HTMLInputElement>) => {}, 
  onBlur = (e: FocusEvent<HTMLInputElement>) => {}, 
  error ="", 
  touched = false,
  icon = null as ReactNode,
  endIcon = null as ReactNode
}) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-gray-700 mb-2" htmlFor={name}>{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full py-2 px-3 border text-zinc-600 ${
            touched && error ? 'border-red-500' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${
            icon ? 'pl-10' : ''
          }`}
          autoComplete = "off"
        />
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {endIcon}
          </div>
        )}
      </div>
      {touched && error ? <div className="text-red-500 text-sm mt-1">{error}</div> : null}
    </div>
  );
};

export default Input;