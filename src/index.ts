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

		this.extract = this.extract.bind(this);
	}

	extract(str: string, count?: number)
	{
		if (typeof count !== "number") count = 0;

		return new Extraction(this.openChar, this.closeChar, this.stringChars, this.regex).init(str, count);
	}
}

export default Extractor
