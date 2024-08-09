import tokenize, { TokenKind } from "./lexer";
import parse, { ExpressionKind, type Expression } from "./parser";

class Interpreter {
    // TODO: implement closures so we can implement function declarations
    private memory: Record<string, number> = {};

    // i could define for myself what is truthy or not but i will use js for now
    private isTrue = (value: any) => !!value;

    public interpret(expression: Expression): number {
        switch (expression.kind) {
            case ExpressionKind.NumericLiteral:
                return expression.value;
            case ExpressionKind.UnaryOperation: {
                const right = this.interpret(expression.right);

                switch (expression.operator) {
                    case "!":
                    case "not":
                        return this.isTrue(right) ? 0 : 1;
                    case "floor":
                        return Math.floor(right);
                    case "round":
                        return Math.round(right);
                    case "output":
                        console.log(right);
                        return right;
                    default:
                        throw new Error("Unknown unary operator: " + expression.operator);
                }
            }
            case ExpressionKind.BinaryOperation: {
                switch (expression.operator) {
                    case "+":
                        return this.interpret(expression.left) + this.interpret(expression.right);
                    case "-":
                        return this.interpret(expression.left) - this.interpret(expression.right);
                    case "*":
                        return this.interpret(expression.left) * this.interpret(expression.right);
                    case "/":
                        return this.interpret(expression.left) / this.interpret(expression.right);
                    case "%":
                        return this.interpret(expression.left) % this.interpret(expression.right);
                    case "^":
                        return this.interpret(expression.left) ** this.interpret(expression.right);
                    case ">":
                        return this.interpret(expression.left) > this.interpret(expression.right)
                            ? 1
                            : 0;
                    case "<":
                        return this.interpret(expression.left) < this.interpret(expression.right)
                            ? 1
                            : 0;
                    case ">=":
                        return this.interpret(expression.left) >= this.interpret(expression.right)
                            ? 1
                            : 0;
                    case "<=":
                        return this.interpret(expression.left) <= this.interpret(expression.right)
                            ? 1
                            : 0;
                    case "==":
                        return this.interpret(expression.left) == this.interpret(expression.right)
                            ? 1
                            : 0;
                    case "&&":
                        return this.interpret(expression.left) && this.interpret(expression.right)
                            ? 1
                            : 0;
                    case "||":
                        return this.interpret(expression.left) || this.interpret(expression.right)
                            ? 1
                            : 0;
                    case "^^":
                        return !this.interpret(expression.left) != !this.interpret(expression.right)
                            ? 1
                            : 0;
                    case "=":
                        // i could make values immutable here or make const let keywords
                        if (expression.left.kind !== ExpressionKind.Identifier)
                            throw new Error("Assignment to non identifier or reserved keyword");
                        this.memory[expression.left.identifier] = this.interpret(expression.right);
                        return this.memory[expression.left.identifier];
                    case ",":
                    case ";":
                        // comma calculates left and discards it but it may create side effects like assignment
                        this.interpret(expression.left);
                        return this.interpret(expression.right);
                    default:
                        throw new Error("Unknown binary operator: " + expression.operator);
                }
            }
            case ExpressionKind.TernaryOperation:
                // ternary to make a ternary lol
                return this.isTrue(this.interpret(expression.condition))
                    ? this.interpret(expression.success)
                    : this.interpret(expression.failure);
            case ExpressionKind.Block:
                switch (expression.operation) {
                    case "for": {
                        let final = 0;
                        while (this.interpret(expression.condition)) {
                            final = this.interpret(expression.content);
                        }
                        return final;
                    }
                    case "if": {
                        let final = 0;
                        if (this.interpret(expression.condition)) {
                            final = this.interpret(expression.content);
                        }
                        return final;
                    }
                    default: {
                        throw new Error("Unknown Block Operation:" + expression.operation);
                    }
                }
            case ExpressionKind.Identifier:
                if (typeof this.memory[expression.identifier] === "undefined")
                    throw new Error("Attempted to access unassigned variable");
                return this.memory[expression.identifier];
            case ExpressionKind.Macro:
                switch (expression.identifier) {
                    case "random":
                        return Math.random();
                    case "input":
                        const input = prompt("input:") ?? "";
                        const float = parseFloat(input);
                        if (isNaN(float)) throw new Error("Input is not a number");
                        return float;
                    default:
                        throw new Error("Unknown Macro: " + expression.identifier);
                }
            default:
                throw new Error("Unknown expression kind"); // Or handle other cases appropriately
        }
    }
}

export default function interpret(ast: Expression): number {
    const interpreter = new Interpreter();

    const output = interpreter.interpret(ast);

    return output;
}
