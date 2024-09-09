# Bare Bone Expression Evaluator (BBEE 🐝)

an interpreted high level programming language built on typescript with 0 dependencies, made for educational purposes.

# Installation

## From source

your best bet to get the latest version is always to clone source and run using bun through the following commands

```bash
git clone https://github.com/hexxt-git/BBEE
cd BBEE
bun install
```

## Releases page

you can also find releases in the github repository [here](https://github.com/hexxt-git/BBEE/releases/).
these releases have no dependencies and can be ran on any computer

# usage
after installation run the cli with the help option to list all possible actions. you should use `interpret` option to run a program file which should be noted by the .bbee file extension

## running from language source:
```bash
bun . interpret ./example.bbee
```
## running from installed Cli:
```bash
./bbee-linux interpret ./example.bbee
```

## Using the REPL
for light testing and learning purposes it is great to use a REPL environment. which stands for Read Evaluate Print Repeat. there are also options you can check through the help command
```bash
bun . interactive # from source
./bbee-linux interactive # from release
```

# Learning to use the language and contributing
the best way to do this is to jump into the source code and try running and altering some of the examples in the examples folder

# syntax
the language is dynamically typed with support for advanced syntax such as functions, loops, if and else blocks and ternary operators.

**note that everything is an expression in this language so you must link multiple expressions together through the comma operator `,` or `;`.**

### the basics
- declaring variables and constants
    ```
    mut name = "HEXXT"
    ```
    ```
    const PI = 3.1415
    ```
- unary operations
    ```
    !a
    ```
- binary operations
    ```
    x + 5 * 3 
    ```
    ```
    a > b && a > c
- ternary operations
    ```
    condition ? a : b
    ```
## control flow
- if statements (else is optional)
    ```
    if (x > y) {
        success_expression
    } else {
        failure_expression
    }
    ```
- loops
    ```
    for (condition) {
        expression
    }
    ```

## functions
- declaration
    ```
    const myFunction = func (input1, input2) => {
        function_body
    }
    ```
- function calls
    ```
    myFunction@(input1, input2)
    ```
## stdlib
- there are some preloaded functions such as `print` `println` and `random` you can call them as normal functions but they run natively
