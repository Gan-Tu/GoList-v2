// Copyright 2022 Gan Tu
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { forwardRef } from "react";
import { Spinner } from "./SvgIcons";
import { classNames } from "./Helpers";

// Every button in the app used to spell out its own ~120 characters of
// Tailwind, and they had drifted: three focus-ring colors, two hover styles,
// primary actions on the left in some dialogs and the right in others. This is
// the one definition. Keyboard focus comes from the global :focus-visible rule
// in index.css, so nothing here draws a ring on mouse click.

const BASE =
  "relative inline-flex shrink-0 select-none items-center justify-center gap-2 " +
  "whitespace-nowrap rounded-full font-medium " +
  "transition-[background-color,color,box-shadow,opacity,transform] duration-150 ease-smooth " +
  // A slight press-in gives immediate feedback on touch, where there is no hover.
  "active:scale-[0.97] motion-reduce:active:scale-100 " +
  "disabled:pointer-events-none disabled:opacity-40 " +
  "aria-disabled:pointer-events-none aria-disabled:opacity-40";

const VARIANTS = {
  primary: "bg-accent text-white shadow-button hover:bg-accent-hover",
  secondary:
    "bg-control text-fg shadow-button ring-1 ring-inset ring-hairline-strong hover:bg-control-hover",
  ghost: "text-fg-muted hover:bg-subtle hover:text-fg",
  danger: "bg-danger text-white shadow-button hover:bg-danger-hover",
  "danger-ghost": "text-danger-fg hover:bg-danger-soft"
};

const SIZES = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-5 text-[15px]"
};

const ICON_ONLY_SIZES = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-11 w-11"
};

/**
 * The class string for a button, for elements that cannot be a <Button> —
 * a Headless UI Menu.Button, say.
 */
export function buttonClasses({
  variant = "secondary",
  size = "md",
  iconOnly = false,
  className = ""
} = {}) {
  return classNames(
    BASE,
    VARIANTS[variant],
    iconOnly ? ICON_ONLY_SIZES[size] : SIZES[size],
    className
  );
}

/**
 * variant: primary | secondary | ghost | danger | danger-ghost
 * size:    sm (32px) | md (36px) | lg (44px, the comfortable touch target)
 *
 * `as={Link}` renders a router link that looks like a button. Icon-only
 * buttons must carry an accessible name (an sr-only span or aria-label).
 */
const Button = forwardRef(function Button(
  {
    as: Component = "button",
    variant = "secondary",
    size = "md",
    iconOnly = false,
    loading = false,
    disabled,
    type,
    className = "",
    children,
    ...props
  },
  ref
) {
  const isNativeButton = Component === "button";

  return (
    <Component
      ref={ref}
      type={isNativeButton ? type || "button" : undefined}
      disabled={isNativeButton ? disabled || loading : undefined}
      aria-disabled={!isNativeButton && disabled ? "true" : undefined}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, iconOnly, className })}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </Component>
  );
});

export default Button;
