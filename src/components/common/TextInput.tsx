import React from "react";
import "./TextInput.css"; // 스타일 분리

type TextInputProps = {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
};

export default function TextInput({
  type = "text",
  placeholder = "",
  value,
  onChange,
  name,
}: TextInputProps) {
  return (
    <input
      className="custom-input"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
    />
  );
}