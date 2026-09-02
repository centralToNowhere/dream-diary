import styles from './Button.module.css'
import { Slot } from "radix-ui";
import cn from 'clsx';

const buttonVariantStyleMap = {
  default: cn(styles.variant, styles.default),
  secondary: cn(styles.variant, styles.secondary),
  outline: cn(styles.variant, styles.outline),
  danger: cn(styles.variant, styles.danger),
}

const buttonSizeStyleMap = {
  default: cn(styles.size, styles.default),
  sm: cn(styles.size, styles.sm),
  lg: cn(styles.size, styles.lg)
}

type ButtonVariants = keyof typeof buttonVariantStyleMap;
type ButtonSizes = keyof typeof buttonSizeStyleMap;

type ButtonVariant = {
  variant?: ButtonVariants
}

type ButtonSize = {
  size?: ButtonSizes
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  ButtonVariant,
  ButtonSize {
  asChild?: boolean
}

const Button = ({ asChild, className, variant, size, ...props }: ButtonProps) => {
  const Comp = asChild ? Slot.Root : "button";

  variant = variant ? variant : 'default'
  size = size ? size : 'default'

  return (
    <Comp
      className={cn(
        styles.button,
        buttonVariantStyleMap[variant],
        buttonSizeStyleMap[size],
        className
      )}
      {...props}
    />
  )
}

Button.displayName = "Button"

export { Button, type ButtonVariants }