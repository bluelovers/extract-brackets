/**
 * common string symbols
 */
export declare const defaultStringChars: readonly [
	"\"",
	"'",
	"`"
];
export declare const defaultStringObj: {
	readonly open: readonly [
		"\"",
		"'",
		"`"
	];
	readonly close: readonly [
		"\"",
		"'",
		"`"
	];
};
/**
 * Common mates for statements
 */
export declare const Mates: {
	readonly "(": ")";
	readonly "[": "]";
	readonly "<": ">";
	readonly "{": "}";
	readonly "\"": "\"";
	readonly "'": "'";
	readonly "/*": "*/";
	readonly "<!--": "-->";
	readonly "(*": "*)";
	readonly "{-": "-}";
	readonly "%{": "%}";
	readonly "<#": "#>";
};
export declare const regexChars: readonly [
	"^",
	"$",
	"[",
	"]",
	"{",
	"}",
	"(",
	")",
	"\\",
	"/",
	".",
	",",
	"?",
	"-",
	"+",
	"*",
	"|"
];
export type IExtractionError<T extends Error = SyntaxError> = T & {
	self?: Extraction;
};
export interface IExtractionSimple extends Array<string | string[] | IExtractionSimple> {
}
export interface IExtractionResult {
	nest: IExtractionResult[];
	simple: IExtractionSimple;
	hasNest: boolean;
	str: string;
	index: number[];
}
export interface IExtractionStringCharsObject {
	open: string[];
	close: string[];
}
export type IExtractionCallback<T extends any = IExtractionResult[]> = (e: IExtractionError, result: IExtractionResult[]) => T;
export declare class Extraction {
	matches: IExtractionResult[];
	tree: IExtractionResult[];
	escaped: boolean;
	openChar: string;
	closeChar: string;
	protected stringChars: IExtractionStringCharsObject;
	protected regex: RegExp;
	sameChar: boolean;
	count: number;
	index: number;
	result: IExtractionResult;
	protected unescapeStr: string;
	constructor(open: string, close: string, stringChars: IExtractionStringCharsObject, regex: RegExp);
	init(str: string, count: number): IExtractionResult[];
	handleStr(str: string): boolean;
	open(): boolean;
	add(str: string): boolean;
	close(): boolean;
}
export declare function _nearString(value: string, index: number, match: string, offset?: number, offsetEnd?: number, maxLength?: number): string;
export declare function infoNearExtractionError(infoline: string, self: Extraction): string;
/**
 * To extract everything inside the outer most brackets
 */
export declare class Extractor {
	protected regex: RegExp;
	protected openChar: string;
	protected closeChar: string;
	protected stringChars: any;
	constructor(open: string, close?: string, stringChars?: any);
	createExtraction(): Extraction;
	extract(str: string, count?: number): IExtractionResult[];
	/**
	 * Synchronously extracts content from a string based on specified brackets.
	 * This method can be used with or without a callback.
	 *
	 * @template T - The type of the extraction result, defaults to IExtractionResult[]
	 * @param {string} str - The input string to extract content from
	 * @param {number | IExtractionCallback<T>} [count] - The number of extractions to perform or a callback function
	 * @param {IExtractionCallback<T>} [cb] - Optional callback function to handle the extraction result
	 * @returns {T | void} - Returns the extraction result if no callback is provided, otherwise void
	 * @throws {IExtractionError} - Throws an error if extraction fails and no callback is provided
	 *
	 * @example
	 * ```typescript
	 * const ExtractParents = new Extractor('{', '}');
	 *
	 * ExtractParents.extractSync(infoline, (e, result) => {
	 *
	 * 	console.error(e);
	 *
	 * 	console.dir(e ? infoNearExtractionError(infoline, e.self) : result, {
	 * 		depth: null,
	 * 	})
	 *
	 * })
	 * ```
	 */
	extractSync<T extends any = IExtractionResult[]>(str: string, count?: number | IExtractionCallback<T>, cb?: IExtractionCallback<T>): IExtractionResult[] | T;
	extractAsync(str: string, count?: number): Promise<IExtractionResult[]>;
}

export {
	Extractor as default,
};

export {};
