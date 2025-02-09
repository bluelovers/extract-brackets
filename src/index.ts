/*
Copyright Brian Ninni 2016

Todo:

Add endIndex

	Tests, Readme
	Rename String Escape to more generic term
	Avoid escaped open/close characters should be an option disabled by default
	Should Regex symbols (/ and /) act as default 'string escape' chars?
	Open/close/escape chars can be regex or array of strings?
*/

import { buildRegex, buildStringObj, getMate } from './utils';
import { Extraction } from './extraction';
import { IExtractionCallback, IExtractionError, IExtractionResult } from './types';

export { Extraction }
export { infoNearExtractionError, _nearString } from './utils';

export type * from './types';

/**
 * To extract everything inside the outer most brackets
 */
export class Extractor
{
	protected regex: RegExp;
	protected openChar: string;
	protected closeChar: string;
	protected stringChars: any;

	constructor(open: string, close?: string, stringChars?: any)
	{
		if (typeof open !== 'string') throw new TypeError('The \'open\' argument must be a string');

		//if close isnt a string, then get a mate for it
		if (typeof close !== 'string') close = getMate(open);

		this.openChar = open;
		this.closeChar = close;
		this.stringChars = buildStringObj(stringChars);
		this.regex = buildRegex(open, close, this.stringChars.open);

		this.createExtraction = this.createExtraction.bind(this);
		this.extract = this.extract.bind(this);
		this.extractSync = this.extractSync.bind(this);
		this.extractAsync = this.extractAsync.bind(this);
	}

	createExtraction()
	{
		return new Extraction(this.openChar, this.closeChar, this.stringChars, this.regex)
	}

	extract(str: string, count?: number)
	{
		if (typeof count !== "number") count = 0;

		return this.createExtraction().init(str, count);
	}

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
	extractSync<T extends any = IExtractionResult[]>(str: string, count?: number | IExtractionCallback<T>, cb?: IExtractionCallback<T>)
	{
		let err: IExtractionError;
		let result: T;

		if (typeof count === 'function')
		{
			([cb, count] = [count, void 0]);
		}

		if (typeof cb === 'function' || cb)
		{
			try
			{
				// @ts-ignore
				result = this.extract(str, count);
			}
			catch (e)
			{
				// @ts-ignore
				err = e
			}
		}
		else
		{
			// @ts-ignore
			return this.extract(str, count);
		}

		return cb(err, result as IExtractionResult[])
	}

	async extractAsync(str: string, count?: number)
	{
		return this.extract(str, count)
	}

}

export default Extractor
