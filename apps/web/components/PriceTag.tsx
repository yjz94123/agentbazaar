'use client';

interface Props {
  price: string;
  currency: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceTag({ price, currency, size = 'sm' }: Props) {
  const sizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <span className={`inline-flex items-baseline gap-1 font-mono font-semibold text-sky-400 ${sizeMap[size]}`}>
      <span className="text-sky-500/60 text-xs">{currency}</span>
      <span>{price}</span>
      <span className="text-slate-500 font-normal text-xs">/task</span>
    </span>
  );
}
