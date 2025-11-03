import React, { useMemo, useCallback } from 'react';
import { useVirtualScroll } from '../../hooks/usePerformance';
import './VirtualList.css';

const VirtualList = ({
  items,
  itemHeight = 60,
  containerHeight = 400,
  renderItem,
  className = '',
  overscan = 5
}) => {
  const {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  } = useVirtualScroll(items, itemHeight, containerHeight);

  // Adiciona itens extras para scroll suave
  const extendedVisibleItems = useMemo(() => {
    const startIndex = Math.max(0, visibleItems[0]?.index - overscan);
    const endIndex = Math.min(
      items.length - 1,
      (visibleItems[visibleItems.length - 1]?.index || 0) + overscan
    );

    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      ...item,
      index: startIndex + index
    }));
  }, [items, visibleItems, overscan]);

  const renderVisibleItems = useCallback(() => {
    return extendedVisibleItems.map((item) => (
      <div
        key={item.index}
        className="virtual-list-item"
        style={{
          position: 'absolute',
          top: item.index * itemHeight,
          height: itemHeight,
          width: '100%'
        }}
      >
        {renderItem(item, item.index)}
      </div>
    ));
  }, [extendedVisibleItems, itemHeight, renderItem]);

  return (
    <div 
      className={`virtual-list ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div 
        className="virtual-list-content"
        style={{ height: totalHeight, position: 'relative' }}
      >
        {renderVisibleItems()}
      </div>
    </div>
  );
};

export default VirtualList;