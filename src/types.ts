import { Extraction } from './extraction';

/**
 * common string symbols
 */
export const defaultStringChars = [
	'"',
	'\'',
	'`',
] as const;

export const defaultStringObj = {
	open: defaultStringChars,
	close: defaultStringChars,
} as const;

/**
 * Common mates for statements
 */
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
} as const;

export const regexChars = ['^', '$', '[', ']', '{', '}', '(', ')', '\\', '/', '.', ',', '?', '-', '+', '*', '|'] as const;

export type IExtractionError<T extends Error> = T & {
	self?: Extraction;
}
