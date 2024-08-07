import tokenize from "./lexer";
import parse, { ExpressionKind, type Expression } from "./parser";

class Interpreter {
    private memory: Record<string, number> = {};

    // i could define for myself what is truthy or not but i will use js for now
    private isTrue = (value: any) => !!value;

    public interpret(expression: Expression): number {
        switch (expression.kind) {
            case ExpressionKind.NumericLiteral:
                return expression.value;
            case ExpressionKind.UnaryOperation: {
                switch (expression.operator) {
                    case "!":
                        return this.isTrue(this.interpret(expression.right)) ? 0 : 1;
                    case "#":
                        return Math.floor(this.interpret(expression.right));
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
                    case "&":
                        return this.interpret(expression.left) && this.interpret(expression.right)
                            ? 1
                            : 0;
                    case "|":
                        return this.interpret(expression.left) || this.interpret(expression.right)
                            ? 1
                            : 0;
                    case "@":
                        return !this.interpret(expression.left) != !this.interpret(expression.right)
                            ? 1
                            : 0;
                    case "=":
                        // i could make values immutable here
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
            case ExpressionKind.Identifier:
                if (typeof this.memory[expression.identifier] === "undefined")
                    throw new Error("Attempted to access unassigned variable");
                return this.memory[expression.identifier];
            case ExpressionKind.Random:
                return Math.random();
            default:
                throw new Error("Unknown expression kind"); // Or handle other cases appropriately
        }
    }
}

export default function interpret(source: string): number {
    const token_arr = tokenize(source);
    const ast = parse(token_arr);
    const interpreter = new Interpreter();

    const output = interpreter.interpret(ast);

    return output;
}
