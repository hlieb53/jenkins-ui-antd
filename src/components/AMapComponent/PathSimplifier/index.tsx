import React, { useCallback, useEffect, useRef, useState } from 'react';
import PathNavigator from './PathNavigator';

interface PathSimplifierProps {
  __map__?: any;
  options?: Omit<PathSimplifierOptions, 'map'>;
  pathData?: PathDataItemType[];
  children?: React.ReactNode;
  onCreated?: (nav: PathSimplifier) => void;
}

const PathSimplifier = (props: PathSimplifierProps) => {
  const { pathData, __map__, onCreated, options } = props;

  const pathSimplifierRef = useRef<PathSimplifier | null>(null);
  const [loading, setLoading] = useState(false);

  const pathSimplifier = useCallback(
    (PathObj: PathSimplifier) => {
      pathSimplifierRef.current = new PathObj({
        zIndex: 100,
        getPath: (_pathData: any) => {
          return _pathData.path;
        },
        getHoverTitle: (_pathData: any) => {
          return _pathData.name;
        },
        map: __map__,
        ...options,
      });
      if (pathData) {
        pathSimplifierRef.current?.setData(
          pathData.map((item) => ({ name: item.name || '路线', path: item.path })),
        );
        setLoading(true);
      }

      if (onCreated) {
        onCreated(pathSimplifierRef.current!);
      }
    },
    [props],
  );

  const loadUI = () => {
    if ((window as any).AMapUI) {
      (window as any).AMapUI.load(['ui/misc/PathSimplifier', 'lib/$'], (path: PathSimplifier) => {
        if (!path.supportCanvas) {
          console.warn('当前环境不支持 Canvas！');
          return;
        }
        pathSimplifier(path);
      });
    }
  };

  const renderChildren = () => {
    return React.Children.map(props.children, (child, index) => {
      if (child) {
        if (typeof child === 'string') {
          return child;
        } else {
          return React.cloneElement(child as any, {
            __pathSimplifier__: pathSimplifierRef.current,
            navKey: index,
          });
        }
      }
      return child;
    });
  };

  useEffect(() => {
    if (__map__) {
      loadUI();
    }
  }, [__map__]);

  return <>{loading && renderChildren()}</>;
};

PathSimplifier.PathNavigator = PathNavigator;

export default PathSimplifier;
