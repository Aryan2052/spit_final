// src/components/InputField.tsx
import { FC } from "react";

type InputFieldProps = {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: JSX.Element;
};

const InputField: FC<InputFieldProps> = ({ type, placeholder, value, onChange, icon }) => (
  <div className="relative w-full">
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-10 p-2 border rounded focus:outline-blue-500"
      required
    />
    <span className="absolute left-3 top-2 text-gray-500">{icon}</span>
  </div>
);

export default InputField;