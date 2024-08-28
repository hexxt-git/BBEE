import { ExpressionKind, type Expression } from "./parser";

interface Function {
    inputs: string[];
    body: Expression;
}

type Value = number | string | Function; // | variable[] | functionExpression
type Variable = { value: Value; mutable: Boolean };
type identifier = string;
export interface MemoryBlock {
    values: Record<identifier, Variable>;
    parent: MemoryBlock | null;
}

function isTrue(value: Value) {
    return !!value;
}

export default function interpret(
    expression: Expression,
    memory: MemoryBlock = {
        parent: null,
        values: {},
    }
): Value {
    const interpretHere = (expression: Expression) => interpret(expression, memory);

    const findVariable = (identifier: string, currentMemory: MemoryBlock = memory): Variable => {
        let foundValue: Variable | null = currentMemory.values[identifier];
        // console.log(currentMemory, typeof foundValue);
        if (typeof foundValue === "undefined")
            if (currentMemory.parent == null) {
                throw new Error("attempted to access unassigned identifier: " + identifier);
            } else {
                foundValue = findVariable(identifier, currentMemory.parent);
            }
        return foundValue;
    };

    switch (expression.kind) {
        case ExpressionKind.FunctionDeclaration:
            const new_fn: Function = {
                inputs: expression.inputs,
                body: expression.body,
            };
            return new_fn;

        case ExpressionKind.FunctionCall: {
            const fn: Value = interpretHere(expression.left);
            if (typeof fn != "string" && typeof fn != "number") {
                const values: Record<identifier, Variable> = {};
                if (fn.inputs.length != expression.inputs.length)
                    throw new Error(
                        "number of inputs to function call does not match number in declaration"
                    );
                for (let [index, identifier] of Object.entries(fn.inputs)) {
                    values[identifier] = {
                        value: interpretHere(expression.inputs[Number(index)]),
                        mutable: true,
                    };
                }
                const childMemory: MemoryBlock = {
                    parent: memory,
                    values: values,
                };
                return interpret(fn.body, childMemory);
            } else throw new Error("trying to call non callable");
        }

        case ExpressionKind.NumericLiteral:
            return expression.value;

        case ExpressionKind.UnaryOperation: {
            const right = interpretHere(expression.right);

            switch (expression.operator) {
                case "!":
                case "not":
                    return isTrue(right) ? 0 : 1;
                case "floor":
                    if (typeof right !== "number")
                        throw new Error(`Cannot preform floor operation on type ${typeof right}`);
                    return Math.floor(right);
                case "round":
                    if (typeof right !== "number")
                        throw new Error(`Cannot preform round operation on type ${typeof right}`);
                    return Math.round(right);
                case "stringify":
                    if (typeof right === "number") return right.toString(10);
                    else return right;
                case "output":
                    process.stdout.write(right.toString());
                    return right;
                default:
                    throw new Error("Unknown unary operator: " + expression.operator);
            }
        }

        case ExpressionKind.BinaryOperation: {
            switch (expression.operator) {
                case "+": {
                    const left = interpretHere(expression.left);
                    const right = interpretHere(expression.right);
                    if (typeof left === "number" && typeof right === "number") return left + right;
                    else if (typeof left === "string" && typeof right === "string")
                        return left + right;
                    else
                        throw new Error(
                            `Cannot perform addition on types: ${typeof left} and ${typeof right}`
                        );
                }
                case "-": {
                    const left = interpretHere(expression.left);
                    const right = interpretHere(expression.right);
                    if (typeof left === "number" && typeof right === "number") return left - right;
                    else
                        throw new Error(
                            `Cannot perform subtraction on types: ${typeof left} and ${typeof right}`
                        );
                }
                case "*": {
                    const left = interpretHere(expression.left);
                    const right = interpretHere(expression.right);
                    if (typeof left === "number" && typeof right === "number") return left * right;
                    else if (typeof left === "string" && typeof right === "number")
                        return left.repeat(right);
                    else
                        throw new Error(
                            `Cannot perform multiplication on types: ${typeof left} and ${typeof right}`
                        );
                }
                case "/": {
                    const left = interpretHere(expression.left);
                    const right = interpretHere(expression.right);
                    if (typeof left === "number" && typeof right === "number") return left / right;
                    else
                        throw new Error(
                            `Cannot perform division on types: ${typeof left} and ${typeof right}`
                        );
                }
                case "%": {
                    const left = interpretHere(expression.left);
                    const right = interpretHere(expression.right);
                    if (typeof left === "number" && typeof right === "number") return left % right;
                    else
                        throw new Error(
                            `Cannot perform modulo operation on types: ${typeof left} and ${typeof right}`
                        );
                }
                case "^": {
                    const left = interpretHere(expression.left);
                    const right = interpretHere(expression.right);
                    if (typeof left === "number" && typeof right === "number") return left ** right;
                    else
                        throw new Error(
                            `Cannot perform exponentiation on types: ${typeof left} and ${typeof right}`
                        );
                }

                case ">": {
                    const left = interpretHere(expression.left);
                    const right = interpretHere(expression.right);
                    return left > right ? 1 : 0;
                }
                case "<": {
                    const left = interpretHere(expression.left);
                    const right = interpretHere(expression.right);
                    return left < right ? 1 : 0;
                }
                case ">=": {
                    const left = interpretHere(expression.left);
                    const right = interpretHere(expression.right);
                    return left >= right ? 1 : 0;
                }
                case "<=": {
                    const left = interpretHere(expression.left);
                    const right = interpretHere(expression.right);
                    return left <= right ? 1 : 0;
                }
                case "==": {
                    const left = interpretHere(expression.left);
                    const right = interpretHere(expression.right);
                    return left === right ? 1 : 0;
                }
                case "!=": {
                    const left = interpretHere(expression.left);
                    const right = interpretHere(expression.right);
                    return left !== right ? 1 : 0;
                }
                case "&&": {
                    const left = interpretHere(expression.left);
                    const right = interpretHere(expression.right);
                    return left && right ? 1 : 0;
                }
                case "||": {
                    const left = interpretHere(expression.left);
                    const right = interpretHere(expression.right);
                    return left || right ? 1 : 0;
                }
                case "^^": {
                    const left = interpretHere(expression.left);
                    const right = interpretHere(expression.right);
                    return !left != !right ? 1 : 0;
                }

                case "=":
                    if (expression.left.kind !== ExpressionKind.Identifier)
                        throw new Error("Assignment to non identifier or reserved keyword");

                    const variable: Variable = findVariable(expression.left.identifier);
                    if (!variable)
                        throw new Error(
                            "Assignment to undeclared variable: " + expression.left.identifier
                        );
                    if (!variable.mutable) throw new Error("Assignment to non mutable variable");

                    const right = interpretHere(expression.right);
                    variable.value = right;

                    return right;

                case ",":
                case ";": {
                    const _ = interpretHere(expression.left);
                    const right = interpretHere(expression.right);
                    // comma calculates left and discards it but it may create side effects like assignment
                    return right;
                }
                default:
                    throw new Error("Unknown binary operator: " + expression.operator);
            }
        }

        case ExpressionKind.TernaryOperation:
            return isTrue(interpretHere(expression.condition))
                ? interpretHere(expression.success)
                : interpretHere(expression.failure);

        case ExpressionKind.Loop:
            switch (expression.operation) {
                case "for": {
                    let final: Value = 0;
                    while (interpretHere(expression.condition)) {
                        final = interpretHere(expression.content);
                    }
                    return final;
                }
                default: {
                    throw new Error("Unknown Block Operation:" + expression.operation);
                }
            }

        case ExpressionKind.Conditional:
            if (interpretHere(expression.condition)) {
                return interpretHere(expression.success);
            } else if (expression.failure) {
                return interpretHere(expression.failure);
            }
            return NaN;

        case ExpressionKind.StringLiteral:
            return expression.content;

        case ExpressionKind.Declaration:
            const identifier = expression.identifier;
            const content = interpretHere(expression.content);
            memory.values[identifier] = {
                value: content,
                mutable: expression.operation === "mut",
            };
            return content;

        case ExpressionKind.Identifier:
            const { value } = findVariable(expression.identifier);
            return value;

        case ExpressionKind.Macro:
            switch (expression.identifier) {
                case "random":
                    return Math.random();
                case "input":
                    const input = prompt("input:") ?? "";

                    if (/^[+-]?[0-9]+(\.[0-9]+)?$/.test(input)) return parseFloat(input);

                    return input;
                default:
                    throw new Error("Unknown Macro: " + expression.identifier);
            }

        case ExpressionKind.Closure:
            const childMemory: MemoryBlock = {
                parent: memory,
                values: {},
            };
            return interpret(expression.content, childMemory);
        default:
            throw new Error("Unknown expression kind");
    }
}
