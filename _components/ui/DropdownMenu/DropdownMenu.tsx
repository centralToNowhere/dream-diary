import { DropdownMenu } from 'radix-ui';
import { Fragment, ReactNode, isValidElement } from 'react';
import cn from 'clsx';
import styles from './DropdownMenu.module.css';

export type DropDownMenuItem = {
  node: ReactNode;
  id: string;
  disabled?: boolean;
  onSelect?: () => void;
} & (
  | {
      children: DropDownMenuItem[];
    }
  | {
      children?: undefined;
    }
);

type DropDownNavProps = {
  trigger: ReactNode;
  label?: ReactNode;
  items: DropDownMenuItem[];
  contentCls?: string;
  subContentCls?: string;
  itemCls?: string;
  triggerCls?: string;
  subTriggerCls?: string;
  offset?: number;
};

const renderItemTree = ({
  items,
  itemCls,
  subTriggerCls,
  subContentCls,
}: {
  items: DropDownMenuItem[];
  itemCls?: string;
  subTriggerCls?: string;
  subContentCls?: string;
}) => {
  return items.map((item) => {
    if (!isValidElement(item.node))
      return <Fragment key={item.id}>{item.node}</Fragment>;

    if (item.children) {
      return (
        <DropdownMenu.Sub key={item.id}>
          <DropdownMenu.SubTrigger
            className={cn(styles.subTrigger, subTriggerCls)}
          >
            {item.node}
          </DropdownMenu.SubTrigger>
          <DropdownMenu.Portal>
            <DropdownMenu.SubContent
              className={cn(styles.subContent, subContentCls)}
              sideOffset={2}
              alignOffset={-5}
            >
              {renderItemTree({
                items: item.children,
                itemCls,
                subTriggerCls,
              })}
            </DropdownMenu.SubContent>
          </DropdownMenu.Portal>
        </DropdownMenu.Sub>
      );
    }

    return (
      <DropdownMenu.Item
        key={item.id}
        asChild
        className={cn(styles.item, itemCls)}
        onSelect={item.onSelect}
      >
        {item.node}
      </DropdownMenu.Item>
    );
  });
};

const DropDownMenuCustom = ({
  trigger,
  label,
  items,
  itemCls,
  contentCls,
  subContentCls,
  triggerCls,
  subTriggerCls,
  offset,
}: DropDownNavProps) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild className={cn(styles.trigger, triggerCls)}>
        {trigger}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(styles.content, contentCls)}
          sideOffset={offset || 5}
        >
          {label && (
            <>
              <DropdownMenu.Label className={styles.label}>
                {label}
              </DropdownMenu.Label>
              <DropdownMenu.Separator className={styles.separator} />
            </>
          )}

          {renderItemTree({
            items,
            itemCls,
            subTriggerCls,
            subContentCls,
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default DropDownMenuCustom;
