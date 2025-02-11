import {
  BaseInfernoComponent,
} from '@devextreme/runtime/inferno';
function view(model: Widget) {
  return <div></div>;
}

export type WidgetInputType = {
  prop?: boolean;
};
const WidgetInput: WidgetInputType = {};
type RestProps = {
  className?: string;
  style?: { [name: string]: any };
  key?: any;
  ref?: any;
};

export default class Widget extends BaseInfernoComponent<any> {
  state = {};
  refs: any;

  constructor(props: any) {
    super(props);
  }

  get restAttributes(): RestProps {
    const { prop, ...restProps } = this.props as any;
    return restProps;
  }

  render() {
    const props = this.props;
    return view({
      props: { ...props },
      restAttributes: this.restAttributes,
    } as Widget);
  }
}

Widget.defaultProps = WidgetInput;
