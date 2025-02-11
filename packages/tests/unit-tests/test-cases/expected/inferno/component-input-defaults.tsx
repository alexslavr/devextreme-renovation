import {
  BaseInfernoComponent,
} from '@devextreme/runtime/inferno';
function view(model: Widget) {
  return <div></div>;
}
function isMaterial() {
  return true;
}
function format(key: string) {
  return 'localized_' + key;
}

export type BasePropsType = {
  empty?: string;
  height?: number;
  width?: number;
  baseNested: typeof TextsProps | string;
};
export const BaseProps: BasePropsType = {
  height: 10,
  get width() {
    return isMaterial() ? 20 : 10;
  },
  baseNested: Object.freeze({ text: '3' }) as any,
};
export type TextsPropsType = {
  text?: string;
};
export const TextsProps: TextsPropsType = {
  get text() {
    return format('text');
  },
};
export type ExpressionPropsType = {
  expressionDefault?: any;
};
export const ExpressionProps: ExpressionPropsType = {
  get expressionDefault() {
    return isMaterial() ? 20 : 10;
  },
};
export type WidgetPropsType = typeof BaseProps & {
  text?: string;
  texts1?: typeof TextsProps;
  texts2?: typeof TextsProps;
  texts3?: typeof TextsProps;
  template?: any;
};
export const WidgetProps: WidgetPropsType = Object.create(
  Object.prototype,
  Object.assign(
    Object.getOwnPropertyDescriptors(BaseProps),
    Object.getOwnPropertyDescriptors({
      get text() {
        return format('text');
      },
      texts1: Object.freeze({ text: format('text') }) as any,
      texts2: Object.freeze({ text: format('text') }) as any,
      texts3: Object.freeze(TextsProps) as any,
      template: () => <div></div>,
    })
  )
);
export type WidgetPropsTypeType = {
  text?: string;
  texts1?: typeof TextsProps;
  texts2?: typeof TextsProps;
  texts3?: typeof TextsProps;
  template?: any;
  empty?: string;
  height?: number;
  width?: number;
  baseNested: typeof TextsProps | string;
  expressionDefault?: any;
};
const WidgetPropsType: WidgetPropsTypeType = {
  get text() {
    return WidgetProps.text;
  },
  get texts1() {
    return WidgetProps.texts1;
  },
  get texts2() {
    return WidgetProps.texts2;
  },
  get texts3() {
    return WidgetProps.texts3;
  },
  get template() {
    return WidgetProps.template;
  },
  get height() {
    return WidgetProps.height;
  },
  get width() {
    return WidgetProps.width;
  },
  get baseNested() {
    return WidgetProps.baseNested;
  },
  get expressionDefault() {
    return ExpressionProps.expressionDefault;
  },
};
type RestProps = {
  className?: string;
  style?: { [name: string]: any };
  key?: any;
  ref?: any;
};
const getTemplate = (TemplateProp: any) =>
  TemplateProp &&
  (TemplateProp.defaultProps
    ? (props: any) => <TemplateProp {...props} />
    : TemplateProp);
export default class Widget extends BaseInfernoComponent<any> {
  state = {};
  refs: any;

  constructor(props: any) {
    super(props);
  }

  get restAttributes(): RestProps {
    const {
      baseNested,
      empty,
      expressionDefault,
      height,
      template,
      text,
      texts1,
      texts2,
      texts3,
      width,
      ...restProps
    } = this.props as any;
    return restProps;
  }

  render() {
    const props = this.props;
    return view({
      props: { ...props, template: getTemplate(props.template) },
      restAttributes: this.restAttributes,
    } as Widget);
  }
}

Widget.defaultProps = WidgetPropsType;
