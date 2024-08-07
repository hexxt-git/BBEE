import { TokenKind, type Token } from "./lexer";

export enum ExpressionKind {
    NumericLiteral,
    Identifier,
    BinaryExpression,
}

export interface NumericLiteralExpression {
    kind: ExpressionKind.NumericLiteral;
    value: number;
}

export interface IdentifierExpression {
    kind: ExpressionKind.Identifier;
    identifier: string;
}

export interface BinaryExpression {
    kind: ExpressionKind.BinaryExpression;
    left: Expression;
    operator: string;
    right: Expression;
}

export type Expression = NumericLiteralExpression | IdentifierExpression | BinaryExpression;

export const PRECEDENCE: TokenKind[] = [
    TokenKind.additive,
    TokenKind.multiplicative,
    TokenKind.modulo,
    TokenKind.exponentiation,
    TokenKind.comma,
    TokenKind.assignment,
];

export class Parser {
    private tokens: Token[] = [];
    private current = 0;
    private top = () => this.tokens[this.current];
    private pop = () => this.tokens[this.current++];

    public parse(source: Token[]): Expression {
        this.tokens = source;
        const program: Expression = this.parseBinaryExpression();

        return program;
    }

    private parseBinaryExpression(precedence: number = 0): Expression {
        if (precedence >= PRECEDENCE.length) return this.parseNumericLiteral();
        let left = this.parseBinaryExpression(precedence + 1);

        while (this.top() && this.top().kind == PRECEDENCE[precedence]) {
            const operator: string = this.pop().value;
            const right: Expression = this.parseBinaryExpression(precedence + 1);

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
        if (this.top().kind !== TokenKind.identifier) return this.parsePar();
        const expression: IdentifierExpression = {
            kind: ExpressionKind.Identifier,
            identifier: this.pop().value,
        };
        return expression;
    }

    private parsePar(): Expression {
        if (this.top().kind !== TokenKind.openPar)
            throw new Error("Unexpected Token Encountered: " + JSON.stringify(this.top));
        this.pop();

        const expression = this.parseBinaryExpression();

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
