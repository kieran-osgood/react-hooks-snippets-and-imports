// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

type Snippet = {
	body: Array<string> | string
	description?: string
	prefix: string
}

const hooks = {
	"useState": {
		"prefix": "useState",
		"body": [
			"const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState(${2:initialState})"
		]
	},
	"useEffect": {
		"prefix": "useEffect",
		"body": [
			"useEffect(() => {",
			"\t${1:effect}",
			"\treturn () => {",
			"\t\t${2:cleanup}",
			"\t};",
			"}, [${3:input}])"
		]
	},
	"useContext": {
		"prefix": "useContext",
		"body": ["const ${1:context} = useContext(${2:contextValue})"]
	},
	"useReducer": {
		"prefix": "useReducer",
		"body": [
			"const [state, dispatch] = useReducer(${1:reducer}, ${2:initialState}, ${3:init})"
		]
	},
	"useCallback": {
		"prefix": "useCallback",
		"body": [
			"useCallback(",
			"\t() => {",
			"\t\t${1:callback}",
			"\t},",
			"\t[${2:input}],",
			")"
		]
	},
	"useMemo": {
		"prefix": "useMemo",
		"body": ["useMemo(() => ${1:function}, ${2:input})"]
	},
	"useRef": {
		"prefix": "useRef",
		"body": ["const ${1:ref} = useRef(${2:initialValue})"]
	},
	"useImperativeHandle": {
		"prefix": "useImperativeHandle",
		"body": [
			"useImperativeHandle(",
			"\t${1:ref},",
			"\t() => {",
			"\t\t${2:handler}",
			"\t},",
			"\t[${3:input}],",
			")"
		]
	},
	"useLayoutEffect": {
		"prefix": "useLayoutEffect",
		"body": [
			"useLayoutEffect(() => {",
			"\t${1:effect}",
			"\treturn () => {",
			"\t\t${2:cleanup}",
			"\t};",
			"}, [${3:input}])"
		]
	},
	"useDebugValue": {
		"prefix": "useDebugValue",
		"body": ["useDebugValue(${1:value})"]
	}
}
const exp = new RegExp('(?:import\ )(?:.*)(?:react)(?:\'\;?)', 'gm')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "react-hooks-snippets-and-imports" is now active!');
	vscode.window.showInformationMessage('Hello World!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.updateImports', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		const editor = vscode.window.activeTextEditor

		const exp = new RegExp('(?:import\ )(?:.*)(?:react)(?:\'\;?)', 'gm')
		const currentDocument = editor?.document.getText()

		const reactImport = currentDocument?.match(exp)
		// reactImport = '' Array(1) ["import React, { useState, useCallback } from 'reac…"]
		/** TODO Wrap it in current if js has equivalent?
			Need to see/store all of the sub strings within the { }
			then add those plus whatever one has just been selected backin
		*/


	});
	const editor = vscode.window.activeTextEditor
	if (editor === undefined) { return }
	const currentPosition = editor?.selection.active
	const currentLineText = editor?.document.lineAt(currentPosition).text.substr(0, currentPosition.character)
	const hooksCompletionItemProviders: Array<vscode.Disposable> = []

	Object.values(hooks).forEach((hook: Snippet) => {
		if (!currentLineText.endsWith(hook.prefix)) {
			hooksCompletionItemProviders.push(vscode.languages.registerCompletionItemProvider(
				'javascript',
				{
					provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
						const item = new vscode.CompletionItem(hook.body.toString(), vscode.CompletionItemKind.Snippet)
						const currentDocument = editor?.document.getText() ?? ''
						
						const reactImport = currentDocument?.match(exp)
						const hooksToBeImported: string[] = [];
						Object.keys(hooks).forEach(hook => {
							if (currentDocument.includes(hook)) {
								hooksToBeImported.push(hook)
							}
						})
						
						item.insertText = new vscode.SnippetString(hook.body.toString())
						item.additionalTextEdits = [vscode.TextEdit.insert(new vscode.Position(0, 0), `import React, { ${hooksToBeImported.join(', ')} } from 'react'\n`)];
						item.detail = hook.description			

						return [item]
					}
				},
				'use' // triggered whenever a '.' is being typed
			))
		}
	})
	context.subscriptions.push(disposable, ...hooksCompletionItemProviders);
}

// this method is called when your extension is deactivated
export function deactivate() { }
