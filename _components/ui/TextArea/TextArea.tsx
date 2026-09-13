import cn from 'clsx';
import styles from './TextArea.module.css';

const textAreaSizeStyleMap = {
  default: styles.default,
  sm: styles.sm,
  lg: styles.lg,
};

type TextAreaSizes = keyof typeof textAreaSizeStyleMap;

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  sizeVariant?: TextAreaSizes;
}

const TextArea = ({
  className,
  sizeVariant = 'default',
  ...props
}: TextAreaProps) => (
  <textarea
    className={cn(
      styles.textArea,
      textAreaSizeStyleMap[sizeVariant],
      className,
    )}
    {...props}
  />
);

TextArea.displayName = 'TextArea';

export { TextArea, type TextAreaSizes };
