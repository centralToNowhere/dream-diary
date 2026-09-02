import cn from "clsx";
import styles from "./Label.module.css";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = ({ className, ...props }: LabelProps) => (
  <label className={cn(styles.label, className)} {...props} />
);

Label.displayName = "Label";

export { Label };
