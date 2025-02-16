import React from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, className, containerClassName, ...props }, ref) => {
    return (
      <div className={clsx("input-icon", containerClassName)}>
        <input ref={ref} className={clsx("input-base", className)} {...props} />
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
