import { Text, clx } from '@medusajs/ui';

export type SectionRowProps = {
  title: string;
  value?: React.ReactNode | string | null;
  actions?: React.ReactNode;
};

export const SectionRow = ({ title, value, actions }: SectionRowProps) => {
  const isValueString = typeof value === 'string' || !value;

  return (
    <div
      className={clx('text-ui-fg-subtle grid grid-cols-2 items-start gap-x-4 px-6 py-4', {
        'grid-cols-[1fr_1fr_28px]': !!actions,
      })}
    >
      <Text size="small" weight="plus" leading="compact" className="pt-0.5">
        {title}
      </Text>

      {isValueString ? (
        <Text size="small" leading="compact" className="min-w-0 whitespace-pre-line text-pretty">
          {value ?? '-'}
        </Text>
      ) : (
        <div className="flex min-w-0 flex-col gap-1">{value}</div>
      )}

      {actions && <div>{actions}</div>}
    </div>
  );
};
