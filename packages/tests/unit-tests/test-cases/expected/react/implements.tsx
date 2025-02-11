import BaseProps from './component-bindings-only';
const view = (model: Widget) => <span />;

export interface PropsI {
  p: string;
}

interface WidgetI {
  onClick(): void;
}

export type WidgetInputType = typeof BaseProps & {
  p: string;
};
const WidgetInput: WidgetInputType = Object.create(
  Object.prototype,
  Object.assign(
    Object.getOwnPropertyDescriptors(BaseProps),
    Object.getOwnPropertyDescriptors({
      p: '10',
    })
  )
);
import { useCallback } from 'react';

type RestProps = {
  className?: string;
  style?: { [name: string]: any };
  key?: any;
  ref?: any;
};
interface Widget {
  props: typeof WidgetInput & RestProps;
  onClick: () => void;
  restAttributes: RestProps;
}

export default function Widget(props: typeof WidgetInput & RestProps) {
  const __onClick = useCallback(function __onClick(): void {}, []);
  const __restAttributes = useCallback(
    function __restAttributes(): RestProps {
      const { data, height, info, p, ...restProps } = props;
      return restProps;
    },
    [props]
  );

  return view({
    props: { ...props },
    onClick: __onClick,
    restAttributes: __restAttributes(),
  });
}

Widget.defaultProps = WidgetInput;
