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

export type IExtractionError<T extends Error = SyntaxError> = T & {
	self?: Extraction;
}

export interface IExtractionSimple extends Array<string | string[] | IExtractionSimple>
{

}

export interface IExtractionResult
{
	nest: IExtractionResult[];
	simple: IExtractionSimple;
	hasNest: boolean;
	str: string;
	index: number[];
}

export interface IExtractionStringCharsObject
{
	open: string[];
	close: string[];
}

export type IExtractionCallback<T extends any = IExtractionResult[]> = (e: IExtractionError, result: IExtractionResult[]) => T;
