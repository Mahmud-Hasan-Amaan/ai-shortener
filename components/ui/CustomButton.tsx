import clsx from "clsx";
import React from "react";
import Marker from "./Marker";
import Image from "next/image";

interface ButtonProps {
  children: React.ReactNode;
  icon?: string;
  href?: string;
  containerClassName?: string;
  onClick?: () => void;
  markerFill?: string;
}

const Inner = React.memo(
  ({
    icon,
    children,
    markerFill,
  }: Pick<ButtonProps, "icon" | "children" | "markerFill">) => (
    <>
      <span className="relative flex items-center min-h-[60px] px-4 g4 rounded-2xl inner-before group-hover:before:opacity-100 overflow-hidden">
        <span className="absolute -left-[1px]">
          <Marker fill={markerFill} />
        </span>
        {icon && (
          <Image
            src={icon}
            alt="icon"
            width={40}
            height={40}
            className="mr-5 object-contain z-10"
            loading="lazy"
          />
        )}
        <span className="relative z-2 font-poppins base-bold text-p1 uppercase">
          {children}
        </span>
      </span>
      <span className="glow-before glow-after" />
    </>
  )
);

Inner.displayName = "ButtonInner";

const Button = React.memo(
  ({
    icon,
    children,
    href,
    containerClassName,
    onClick,
    markerFill,
  }: ButtonProps) => {
    const commonClassName = clsx(
      "relative p-0.5 g5 rounded-2xl shadow-500 group",
      containerClassName
    );

    if (href) {
      return (
        <a className={commonClassName} href={href}>
          <Inner icon={icon} markerFill={markerFill}>
            {children}
          </Inner>
        </a>
      );
    }

    return (
      <button className={commonClassName} onClick={onClick}>
        <Inner icon={icon} markerFill={markerFill}>
          {children}
        </Inner>
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
