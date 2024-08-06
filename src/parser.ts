import { TokenKind, type Token } from "./lexer";

export enum ExpressionKind {
    NumericLiteral,
    Identifier,
    BinaryExpression,
}

export interface Expression {
    kind: ExpressionKind;
}

export interface NumericLiteralExpression extends Expression {
    kind: ExpressionKind.NumericLiteral;
    value: number;
}

export interface IdentifierExpression extends Expression {
    kind: ExpressionKind.Identifier;
    identifier: string;
}

export interface BinaryExpression extends Expression {
    kind: ExpressionKind.BinaryExpression;
    left: Expression;
    operator: string;
    right: Expression;
}

export const PRECEDENCE: TokenKind[] = [TokenKind.additive, TokenKind.multiplicative];

export default class Parser {
    private tokens: Token[] = [];
    private current = 0;
    private top = () => this.tokens[this.current];
    private pop = () => this.tokens[this.current++];

    public parse(source: Token[]): Expression {
        this.tokens = source;
        const program: Expression = this.parseBinaryOperation(0);

        return program;
    }

    private parseBinaryOperation(precedence: number): Expression {
        if (precedence >= PRECEDENCE.length) return this.parseNumericLiteral();
        let left = this.parseBinaryOperation(precedence + 1);

        while (this.top() && this.top().kind == PRECEDENCE[precedence]) {
            const operator: string = this.pop().value;
            const right: Expression = this.parseBinaryOperation(precedence + 1);

            const expression: BinaryExpression = {
                kind: ExpressionKind.BinaryExpression,
                left,
                operator,
                right,
            };

            left = expression;
        }

        return left;
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
        if (this.top().kind !== TokenKind.identifier) return this.parseParentheses();
        const expression: IdentifierExpression = {
            kind: ExpressionKind.Identifier,
            identifier: this.pop().value,
        };
        return expression;
    }

    private parseParentheses(): Expression {
        // todo implement
        throw new Error("Unexpected Token Encountered: " + JSON.stringify(this.top));
    }
}
