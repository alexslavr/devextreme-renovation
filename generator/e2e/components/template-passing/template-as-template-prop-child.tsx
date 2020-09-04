import {
  Component,
  ComponentBindings,
  JSXComponent,
  Template,
} from "../../../component_declaration/common";
export const viewFunction = ({
  props: { secondTemplate: Second },
}: Child): JSX.Element => (
  <div>
    FirstTemplateText
    <Second />
  </div>
);

@ComponentBindings()
export class ChildProps {
  @Template() secondTemplate?: any;
}

@Component({
  defaultOptionRules: null,
  view: viewFunction,
})
export class Child extends JSXComponent(ChildProps) {}
