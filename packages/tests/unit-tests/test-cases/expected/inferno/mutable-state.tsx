import {
  InfernoEffect,
  InfernoComponent,
} from '@devextreme/runtime/inferno';
function view(viewModel: Widget) {
  return <div></div>;
}

export type WidgetInputType = {};
const WidgetInput: WidgetInputType = {};
type RestProps = {
  className?: string;
  style?: { [name: string]: any };
  key?: any;
  ref?: any;
};

export default class Widget extends InfernoComponent<any> {
  state = {};
  refs: any;
  obj!: { value?: number };
  notDefinedObj?: { value?: number };
  definedObj: { value?: number } = { value: 0 };

  constructor(props: any) {
    super(props);

    this.setObj = this.setObj.bind(this);
    this.getValue = this.getValue.bind(this);
    this.getObj = this.getObj.bind(this);
    this.destruct = this.destruct.bind(this);
    this.initialize = this.initialize.bind(this);
  }

  createEffects() {
    return [new InfernoEffect(this.initialize, [])];
  }
  updateEffects() {
    this._effects[0]?.update([]);
  }

  initialize(): any {
    this.setObj();
  }
  setObj(): any {
    this.obj.value = 0;
    this.definedObj.value = 0;
    this.notDefinedObj = this.notDefinedObj || {};
    this.notDefinedObj.value = 0;
  }
  getValue(): any {
    const a: number = this.obj.value ?? 0;
    const b: number = this.notDefinedObj?.value ?? 0;
    const c: number = this.definedObj.value ?? 0;
    return a + b + c;
  }
  getObj(): any {
    return this.obj;
  }
  destruct(): any {
    const a = this.obj.value;
    const b = this.definedObj.value;
    const c = this.notDefinedObj?.value;
  }
  get restAttributes(): RestProps {
    const { ...restProps } = this.props as any;
    return restProps;
  }

  render() {
    const props = this.props;
    return view({
      props: { ...props },
      setObj: this.setObj,
      getValue: this.getValue,
      getObj: this.getObj,
      destruct: this.destruct,
      restAttributes: this.restAttributes,
    } as Widget);
  }
}

Widget.defaultProps = WidgetInput;
