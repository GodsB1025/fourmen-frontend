import React from "react";
import "./TextInput.css"; // 스타일 분리

type TextInputProps = {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
}& React.InputHTMLAttributes<HTMLInputElement>;

export default function TextInput({
  type = "text",
  placeholder = "",
  value,
  onChange,
  name,
  ...rest
}: TextInputProps) {

  // const inputClassName = `custom-input ${hasError ? 'error' : ''}`.trim();

  return (
    <input
      className="custom-input"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      {...rest}
    />
  );
}

export function ContractTextInput({
  type = "text",
  placeholder = "",
  value,
  onChange,
  name,
  ...rest
}: TextInputProps) {

  // const inputClassName = `custom-input ${hasError ? 'error' : ''}`.trim();

  return (
    <input
      className="contract-custom-input"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      {...rest}
    />
  );
}