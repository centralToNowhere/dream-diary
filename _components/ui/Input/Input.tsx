import cn from 'clsx';
import styles from './Input.module.css';

const inputSizeStyleMap = {
  default: styles.default,
  sm: styles.sm,
  lg: styles.lg,
};

type InputSizes = keyof typeof inputSizeStyleMap;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  sizeVariant?: InputSizes;
}

const Input = ({
  className,
  sizeVariant = 'default',
  ...props
}: InputProps) => (
  <input
    className={cn(styles.input, inputSizeStyleMap[sizeVariant], className)}
    {...props}
  />
);

Input.displayName = 'Input';

export { Input, type InputSizes };
