import React from 'react';
import * as ReactWindowModule from 'react-window';

const getListComponent = (): any => {
  const mod: any = ReactWindowModule;
  if (mod && typeof mod.FixedSizeList === 'function') return mod.FixedSizeList;
  if (mod && mod.default && typeof mod.default.FixedSizeList === 'function') return mod.default.FixedSizeList;
  if (mod && typeof mod.default === 'function') return mod.default;
  if (typeof mod === 'function') return mod;
  return null;
};

const ListComponent = getListComponent();

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export default function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className = ''
}: VirtualizedListProps<T>) {
  if (!ListComponent) {
    return (
      <div className={`w-full overflow-y-auto ${className}`} style={{ maxHeight: height }}>
        {(items || []).map((item, index) => (
          <div key={index}>{renderItem(item, index)}</div>
        ))}
      </div>
    );
  }

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    return <div style={style}>{renderItem(item, index)}</div>;
  };

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <ListComponent
        height={height}
        itemCount={(items || []).length}
        itemSize={itemHeight}
        width="100%"
      >
        {Row}
      </ListComponent>
    </div>
  );
}
