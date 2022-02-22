# vscode-norminette

vscode norminette linter

> _**Note**:_ currently under development, not works well

## Features

Show norminette diagnostics

## Requirements

You must have [norminette](https://github.com/42School/norminette) installed on your computer.

## Extension Settings

This extension contributes the following settings:

- `vscode-norminette.command`: norminette command, or path to executable
- `vscode-norminette.args`: extra arguments (ex: `["-R", "CheckForbiddenSourceHeader"]`)
- `vscode-norminette.include.name`: file name to check (PCRE) (default: `^ft.*\.[ch]$`) - not implemented yet
- `vscode-norminette.include.path`: file path to check (PCRE) (default: `ft`) - not implemented yet
- `vscode-norminette.exclude.name`: file name to not check (PCRE) - not implemented yet
- `vscode-norminette.exclude.path`: file path to not check (PCRE) - not implemented yet

## Known Issues

Not work properly when error count is not in (0, 1)

## Release Notes

- `v0.0.1`: published by mistake
- `v0.0.2`: write README.md
