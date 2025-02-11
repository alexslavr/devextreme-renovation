function view() {}

import { useCallback, useEffect } from 'react';

type RestProps = {
  className?: string;
  style?: { [name: string]: any };
  key?: any;
  ref?: any;
};
interface Widget {
  onPointerUp: () => any;
  scrollHandler: () => any;
  restAttributes: RestProps;
}

export function Widget(props: {} & RestProps) {
  const __onPointerUp = useCallback(function __onPointerUp(): any {}, []);
  const __scrollHandler = useCallback(function __scrollHandler(): any {}, []);
  const __restAttributes = useCallback(
    function __restAttributes(): RestProps {
      const { ...restProps } = props;
      return restProps;
    },
    [props]
  );
  useEffect(() => {
    document.addEventListener('pointerup', __onPointerUp);
    window.addEventListener('scroll', __scrollHandler);
    return function cleanup() {
      document.removeEventListener('pointerup', __onPointerUp);
      window.removeEventListener('scroll', __scrollHandler);
    };
  });

  return view();
}

export default Widget;
