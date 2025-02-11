import {
  Expression,
  SimpleExpression,
  SyntaxKind,
  Binary,
  Prefix,
  Paren,
  Identifier,
  Call,
  Property,
  BindingPattern,
  Parameter,
  BaseFunction,
  getTemplate,
  PropertyAccess,
  Conditional,
  StringLiteral,
  getExpressionFromParens,
  getJsxExpression,
  getExpression,
  getMember,
  VariableExpression,
  capitalizeFirstLetter,
} from '@devextreme-generator/core';
import { JsxExpression } from './jsx-expression';
import { toStringOptions } from '../../types';
import { JsxAttribute } from './attribute';
import { AngularDirective } from './angular-directive';
import { TrackByAttribute } from './track-by-attribute';
import { isElement, JsxElement } from './elements';
import {
  JsxOpeningElement,
  JsxSelfClosingElement,
  JsxClosingElement,
} from './jsx-opening-element';
import { counter } from '../../counter';

export const mergeToStringOptions = (
  dst: toStringOptions | undefined,
  src: toStringOptions | undefined,
) => {
  if (dst === src || !dst || !src) {
    return dst;
  }
  dst.hasStyle = dst.hasStyle || src.hasStyle;
  dst.hasDynamicComponents = dst.hasDynamicComponents || src.hasDynamicComponents;
  dst.defaultTemplates = src.defaultTemplates || {};
  const trackBy = (dst.trackBy || []).concat(src.trackBy || []);
  dst.trackBy = [...new Set(trackBy)];
  return dst;
};

export class JsxChildExpression extends JsxExpression {
  constructor(expression: JsxExpression) {
    super(expression.dotDotDotToken, expression.expression);
  }

  processBinary(
    expression: Binary,
    options?: toStringOptions,
    condition: Expression[] = [],
  ): string | null {
    const left = getExpression(expression.left, options);
    const right = getExpression(expression.right, options);

    if (
      (isElement(left) || isElement(right))
      && expression.operator !== SyntaxKind.AmpersandAmpersandToken
    ) {
      throw `Operator ${
        expression.operator
      } is not supported: ${expression.toString()}`;
    }
    if (
      expression.operator === SyntaxKind.AmpersandAmpersandToken
      && !left.isJsx()
    ) {
      if (right instanceof Binary) {
        return this.processBinary(
          right,
          options,
          condition.concat(expression.left),
        );
      }

      const conditionExpression = condition.reduce((c: Expression, e) => new Binary(new Paren(c), SyntaxKind.AmpersandAmpersandToken, e), expression.left);

      return this.compileStatement(right, conditionExpression, options);
    }
    return null;
  }

  compileSlot(slot: Property, options: toStringOptions) {
    options.checkSlot?.(slot, options);
    const slotValue = `<ng-container [ngTemplateOutlet]="dx${slot.name}"></ng-container>`;
    if (options.isSVG) {
      return `<svg:g #slot${capitalizeFirstLetter(
        slot.name,
      )} >${slotValue}</svg:g>`;
    }
    return `<div #slot${capitalizeFirstLetter(slot.name)} style="display: contents"></div>
    ${slotValue}
    <div class="dx-slot-end" style="display: contents"></div>`;
  }

  createIfAttribute(condition: Expression): JsxAttribute {
    return new AngularDirective(new Identifier('*ngIf'), condition);
  }

  createJsxExpression(statement: Expression) {
    return new JsxExpression(undefined, statement);
  }

  createContainer(
    attributes: JsxAttribute[],
    children: Array<JsxExpression | JsxElement | JsxSelfClosingElement | string>,
  ) {
    const containerIdentifer = new Identifier('ng-container');
    return new JsxElement(
      new JsxOpeningElement(containerIdentifer, undefined, attributes, {}),
      children,
      new JsxClosingElement(containerIdentifer, {}),
    );
  }

  processSlotInConditional(
    statement: Expression,
    condition?: Expression,
    options?: toStringOptions,
  ) {
    const slot = this.getSlot(
      statement.toString({
        members: [],
        ...options,
      }),
      options,
    );

    if (
      slot
      && slot.getter(options?.newComponentContext)
      === statement.toString(options)
      && condition
      && getMember(condition, options) === slot
    ) {
      return new JsxChildExpression(
        this.createJsxExpression(statement),
      ).toString(options);
    }
    return undefined;
  }

  getExpressionFromStatement(
    statement: Expression,
    _options?: toStringOptions,
  ) {
    return getJsxExpression(statement);
  }

  compileStatement(
    statement: Expression,
    condition?: Expression,
    options?: toStringOptions,
  ): string {
    const slot = this.processSlotInConditional(statement, condition, options);
    if (slot) {
      return slot;
    }

    const conditionAttribute = this.createIfAttribute(condition!);

    const expression = this.getExpressionFromStatement(statement, options);
    if (isElement(expression)) {
      const element = expression.clone();
      element.addAttribute(conditionAttribute);
      return element.toString(options);
    }
    return this.createContainer(
      [conditionAttribute],
      [this.createJsxExpression(statement)],
    ).toString(options);
  }

  compileConditionStatement(
    condition: Expression,
    thenStatement: Expression,
    elseStatement: Expression,
    options?: toStringOptions,
  ) {
    const result: string[] = [];
    result.push(this.compileStatement(thenStatement, condition, options));
    result.push(
      this.compileStatement(
        elseStatement,
        new Prefix(SyntaxKind.ExclamationToken, new Paren(condition)),
        options,
      ),
    );

    return result.join('\n');
  }

  getIteratorItemName(
    parameter: Identifier | BindingPattern,
    options: toStringOptions,
  ) {
    if (parameter instanceof BindingPattern) {
      const identifier = new Identifier(`item_${counter.get()}`);

      options.variables = {
        ...options.variables,
        ...parameter.getVariableExpressions(identifier),
      };
      return identifier;
    }
    return parameter;
  }

  getSlot(stringValue: string, options?: toStringOptions) {
    const possibleSlots = options?.members
      .filter(
        (m) => m.isSlot
          && (stringValue.indexOf(m.getter(options.newComponentContext)) !== -1),
      );
    const overlapedSlots = possibleSlots?.filter((m) => !m.name.startsWith('slot'));
    if (overlapedSlots && overlapedSlots.length > 1) {
      throw new Error(`Slot name '${stringValue}' overlap for slot: ${overlapedSlots.map((m) => m.name)}`);
    }
    return possibleSlots && possibleSlots[0] as Property | undefined;
  }

  addCallParameters(
    parameters: Parameter[],
    args: Expression[],
    options?: toStringOptions,
  ) {
    const templateOptions = options
      ? { disableTemplates: true, ...options }
      : { members: [] };

    return parameters.reduce(
      (acc: toStringOptions, param: Parameter, index) => {
        const initializer = args[index];
        const name = param.name;

        if (name instanceof BindingPattern) {
          const identifier = new Identifier(initializer.toString(options));

          acc.variables = {
            ...acc.variables,
            ...name.getVariableExpressions(identifier),
          };
        } else {
          acc.variables = {
            ...acc.variables,
            ...{ [name.toString()]: initializer },
          };
        }

        return acc;
      },
      templateOptions,
    );
  }

  compileIterator(
    iterator: BaseFunction,
    expression: Call,
    options?: toStringOptions,
  ): string {
    const templateOptions: toStringOptions = options
      ? { ...options, ...{ keys: [] } }
      : { members: [] };
    const templateExpression = getTemplate(iterator, templateOptions, true);

    const itemsExpression = (expression.expression as PropertyAccess)
      .expression;
    const itemName = this.getIteratorItemName(
      iterator.parameters[0].name,
      templateOptions,
    ).toString();
    const itemsExpressionString = itemsExpression.toString(options);

    templateOptions.mapItemName = itemName;
    templateOptions.mapItemExpression = itemsExpression;

    let template = '';

    if (isElement(templateExpression)) {
      template = templateExpression.toString(templateOptions);
    } else {
      const expression = new JsxChildExpression(
        templateExpression as JsxExpression,
      );
      template = expression.toString(templateOptions);
    }

    const item = `let ${itemName} of ${itemsExpressionString}`;
    const ngForValue = [item];
    if (iterator.parameters[1]) {
      ngForValue.push(`index as ${iterator.parameters[1].name.toString()}`);
    }

    const keyAttribute = templateOptions.keys?.[0];

    if (keyAttribute) {
      const trackByName = new Identifier(
        `_trackBy_${itemsExpressionString
          .replace('.', '_')
          .replace(/[(\s|[\])]/gi, '')}_${counter.get()}`,
      );
      ngForValue.push(`trackBy: ${trackByName}`);
      if (options) {
        const arr = (options.trackBy || []).concat(
          templateOptions.trackBy || [],
        );
        options.trackBy = [...new Set(arr)];
        options.trackBy.push(
          new TrackByAttribute(
            trackByName,
            keyAttribute.toString({
              ...templateOptions,
              newComponentContext: SyntaxKind.ThisKeyword,
              variables: Object.keys(templateOptions.variables || {}).reduce(
                (variables: VariableExpression, k) => {
                  const variable = templateOptions.variables![k];
                  if (
                    variable instanceof Identifier
                    && variable.toString(templateOptions).startsWith('global')
                  ) {
                    return {
                      ...variables,
                      [k]: new PropertyAccess(
                        new SimpleExpression(SyntaxKind.ThisKeyword),
                        variable,
                      ),
                    };
                  }
                  return {
                    ...variables,
                    [k]: variable,
                  };
                },
                {},
              ),
            }),
            iterator.parameters[1]?.name.toString() || '',
            itemName,
          ),
        );
      }
    }

    mergeToStringOptions(options, templateOptions);

    return `<ng-container *ngFor="${ngForValue.join(
      ';',
    )}">${template}</ng-container>`;
  }

  getTemplateForVariable(
    _element: JsxElement | JsxSelfClosingElement,
    identifier: Identifier,
  ): JsxElement | JsxSelfClosingElement {
    return new JsxSelfClosingElement(
      new SimpleExpression('ng-container'),
      undefined,
      [
        new AngularDirective(
          new Identifier('*ngTemplateOutlet'),
          new SimpleExpression(identifier.toString()),
        ),
      ],
      {},
    );
  }

  getExpression(options?: toStringOptions) {
    const baseExpression = super.getExpression(options);
    const expression = getExpressionFromParens(this.expression);
    if (expression instanceof Identifier && isElement(baseExpression)) {
      return this.getTemplateForVariable(baseExpression, expression);
    }

    return baseExpression;
  }

  toString(options?: toStringOptions) {
    const expression = this.getExpression(options);

    if (!expression) {
      return '';
    }

    if (expression instanceof Binary) {
      const parsedBinary = this.processBinary(expression, options);
      if (parsedBinary) {
        return parsedBinary;
      }
    }

    const iterator = this.getIterator(expression);

    if (iterator) {
      return this.compileIterator(iterator, expression as Call, options);
    }

    if (expression instanceof Call) {
      const funcName = expression.expression.toString();
      const template = options?.variables?.[funcName];
      if (template instanceof BaseFunction) {
        const templateOptions = this.addCallParameters(
          template.parameters,
          expression.arguments,
          options,
        );
        const templateExpression = template.getTemplate(templateOptions, true);

        return templateExpression;
      }
      if (template) {
        return `{{${expression.toString({
          members: [],
          disableTemplates: true,
          ...options,
        })}}}`;
      }
    }

    if (expression instanceof Conditional) {
      return this.compileConditionStatement(
        expression.expression,
        expression.thenStatement,
        expression.elseStatement,
        options,
      );
    }

    if (expression instanceof StringLiteral) {
      return expression.expression;
    }
    const stringValue = super.toString(options);

    if (
      expression.isJsx()
      || stringValue.startsWith('<')
      || stringValue.startsWith('(<')
    ) {
      return stringValue;
    }

    const slot = this.getSlot(stringValue, options);
    if (slot) {
      return this.compileSlot(slot as Property, options!);
    }

    return `{{${stringValue}}}`;
  }
}
