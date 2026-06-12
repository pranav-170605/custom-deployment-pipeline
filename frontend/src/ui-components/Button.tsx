// components/Button.js
import React from "react";

type ButtonProps = {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
};

const Button = ({
  type = "button",
  onClick = () => {},
  className = "",
  disabled = false,
  children = "",
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-white text-teal-600 rounded-lg py-3 px-6 text-base font-semibold cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 min-w-[150px] ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
