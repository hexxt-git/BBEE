import { TokenKind, type Token } from "./lexer";

export enum ExpressionKind {
    NumericLiteral,
    Identifier,
    UnaryOperation,
    BinaryOperation,
    Random,
    TernaryOperation,
}

export interface NumericLiteralExpression {
    kind: ExpressionKind.NumericLiteral;
    value: number;
}

export interface IdentifierExpression {
    kind: ExpressionKind.Identifier;
    identifier: string;
}

export interface RandomExpression {
    kind: ExpressionKind.Random;
}

export interface UnaryExpression {
    kind: ExpressionKind.UnaryOperation;
    operator: string;
    right: Expression;
}

export interface BinaryExpression {
    kind: ExpressionKind.BinaryOperation;
    left: Expression;
    operator: string;
    right: Expression;
}

export interface TernaryExpression {
    kind: ExpressionKind.TernaryOperation;
    condition: Expression;
    operator: string;
    success: Expression;
    failure: Expression;
}

export type Expression =
    | NumericLiteralExpression
    | IdentifierExpression
    | UnaryExpression
    | BinaryExpression
    | TernaryExpression
    | RandomExpression;

// for binary ops only

export const PRECEDENCE: TokenKind[] = [
    // comma
    // assignment
    // ternary
    TokenKind.logical,
    TokenKind.comparative,
    TokenKind.exponentiation,
    TokenKind.modulo,
    TokenKind.multiplicative,
    TokenKind.additive,
    // unary
    // numeric
    // identifiers
    // random
    // parentheses
];

export class Parser {
    private tokens: Token[] = [];
    private current = 0;
    private top = () => this.tokens[this.current];
    private pop = () => this.tokens[this.current++];

    public parse(source: Token[]): Expression {
        this.tokens = source;
        return this.parseToken();
    }

    public parseToken() {
        const program: Expression = this.parseAssignmentOperation();

        return program;
    }

    private parseAssignmentOperation(): Expression {
        let left = this.parseCommaOperation();

        while (this.top() && this.top().kind == TokenKind.assignment) {
            const operator: string = this.pop().value;
            const right: Expression = this.parseCommaOperation();

            const expression: BinaryExpression = {
                kind: ExpressionKind.BinaryOperation,
                left,
                operator,
                right,
            };

            left = expression;
        }

        return left;
    }
    private parseCommaOperation(): Expression {
        let left = this.parseTernaryOperation();

        while (this.top() && this.top().kind == TokenKind.comma) {
            const operator: string = this.pop().value;
            const right: Expression = this.parseTernaryOperation();

            const expression: BinaryExpression = {
                kind: ExpressionKind.BinaryOperation,
                left,
                operator,
                right,
            };

            left = expression;
        }

        return left;
    }

    private parseTernaryOperation(): Expression {
        let condition = this.parseBinaryOperation();

        while (this.top() && this.top().kind == TokenKind.ternaryOpen) {
            const operator: string = this.pop().value;
            const success: Expression = this.parseBinaryOperation();
            const otherwise: Token = this.pop();
            if (otherwise.kind !== TokenKind.ternaryContinue)
                throw new Error("expected : after ternary expression");
            const failure: Expression = this.parseBinaryOperation();

            const expression: TernaryExpression = {
                kind: ExpressionKind.TernaryOperation,
                condition,
                operator,
                success,
                failure,
            };

            condition = expression;
        }

        return condition;
    }

    private parseBinaryOperation(precedence: number = 0): Expression {
        if (precedence >= PRECEDENCE.length) return this.parseUnaryOperation();
        let left = this.parseBinaryOperation(precedence + 1);

        while (this.top() && this.top().kind == PRECEDENCE[PRECEDENCE.length - precedence - 1]) {
            const operator: string = this.pop().value;
            const right: Expression = this.parseBinaryOperation(precedence + 1);

            const expression: BinaryExpression = {
                kind: ExpressionKind.BinaryOperation,
                left,
                operator,
                right,
            };

            left = expression;
        }

        return left;
    }

    private parseUnaryOperation(): Expression {
        if (this.top().kind !== TokenKind.unary) return this.parseNumericLiteral();
        const operator = this.pop().value;
        const right: Expression = this.parseNumericLiteral();

        const expression: UnaryExpression = {
            kind: ExpressionKind.UnaryOperation,
            operator,
            right,
        };

        return expression;
    }

    private parseNumericLiteral(): Expression {
        if (this.top().kind !== TokenKind.numericLiteral) return this.parseIdentifier();
        const expression: NumericLiteralExpression = {
            kind: ExpressionKind.NumericLiteral,
            value: parseFloat(this.pop().value),
        };
        return expression;
    }

    private parseIdentifier(): Expression {
        if (this.top().kind !== TokenKind.identifier) return this.parseRandom();
        const expression: IdentifierExpression = {
            kind: ExpressionKind.Identifier,
            identifier: this.pop().value,
        };
        return expression;
    }

    private parseRandom(): Expression {
        if (this.top().kind !== TokenKind.random) return this.parsePar();
        const expression: RandomExpression = {
            kind: ExpressionKind.Random,
        };
        this.pop();
        return expression;
    }

    private parsePar(): Expression {
        if (this.top().kind !== TokenKind.openPar)
            throw new Error("Unexpected Token Encountered: " + JSON.stringify(this.top()));
        this.pop();

        const expression = this.parseToken();

        const closing = this.pop();
        if (closing.kind !== TokenKind.closePar)
            throw new Error("Expected closing paren token, got: " + JSON.stringify(closing));

        return expression;
    }
}

export default function parse(source: Token[]): Expression {
    const parser = new Parser();
    const ast = parser.parse(source);
    return ast;
}
