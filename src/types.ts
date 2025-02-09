//common string symbols
export const defaultStringChars = [
	'"',
	'\'',
	'`',
];
export const defaultStringObj = {
	open: defaultStringChars,
	close: defaultStringChars,
};
//Common mates for statements
export const Mates = {
	'(': ')',
	'[': ']',
	'<': '>',
	'{': '}',
	'"': '"',
	'\'': '\'',
	'/*': '*/',
	'<!--': '-->',
	'(*': '*)',
	'{-': '-}',
	'%{': '%}',
	'<#': '#>',
};
export const regexChars = ['^', '$', '[', ']', '{', '}', '(', ')', '\\', '/', '.', ',', '?', '-', '+', '*', '|'];
