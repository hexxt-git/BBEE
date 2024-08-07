import tokenize from "./lexer";
import parse, { ExpressionKind, type Expression, type NumericLiteralExpression } from "./parser";

class Interpreter {
    private memory: Record<string, number> = {};

    public interpret(expression: Expression): number {
        if (expression.kind === ExpressionKind.NumericLiteral) return expression.value;
        if (expression.kind === ExpressionKind.BinaryExpression) {
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
                case "=":
                    // i could make values immutable here
                    if (expression.left.kind !== ExpressionKind.Identifier)
                        throw new Error("Assignment to non identifier");
                    this.memory[expression.left.identifier] = this.interpret(expression.right);
                    return this.memory[expression.left.identifier];
                case ",": case ";":
                    // comma calculates left and discards it but it may create side effects like assignment
                    this.interpret(expression.left);
                    return this.interpret(expression.right);
            }
        }
        if (expression.kind === ExpressionKind.Identifier) {
            if (typeof this.memory[expression.identifier] === "undefined")
                throw new Error("Attempted to access unassigned variable");
            return this.memory[expression.identifier];
        }

        return 0;
    }
}

export default function interpret(source: string): number {
    const token_arr = tokenize(source);
    const ast = parse(token_arr);
    const interpreter = new Interpreter();

    const output = interpreter.interpret(ast);

    return output;
}
