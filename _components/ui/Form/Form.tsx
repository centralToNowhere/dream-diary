import styles from './Form.module.css';
import cn from 'clsx';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

const Form = ({ className, children, ...props }: FormProps) => {
  return (
    <form {...props} className={cn(styles.form, className)}>
      {children}
    </form>
  );
};

Form.displayName = 'Form';

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  horizontal?: boolean;
}

Form.Field = ({
  className,
  horizontal,
  children,
  ...props
}: FormFieldProps) => {
  return (
    <div
      className={cn(
        styles.field,
        horizontal ? styles.horizontal : null,
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Form;
