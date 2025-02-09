import { popLast } from './utils';
import { IExtractionError } from './types';

export function _createExtractionError(self: Extraction, msg: string)
{
	const e: IExtractionError<SyntaxError> = new SyntaxError(msg);
	e.self = self;

	return e
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

export class Extraction
{
	matches: any[];
	protected tree: any[];
	protected escaped: boolean;
	protected openChar: string;
	protected closeChar: string;
	protected stringChars: any;
	protected regex: RegExp;
	protected sameChar: boolean;
	count: number;
	index: number;
	result: IExtractionResult;
	protected unescapeStr: string;

	constructor(open: string, close: string, stringChars: any, regex: RegExp)
	{
		this.matches = [];
		this.tree = [];
		this.escaped = false;

		this.openChar = open;
		this.closeChar = close;
		this.stringChars = stringChars;
		this.regex = regex;

		this.sameChar = open === close;
	}

	init(str: string, count: number): any[]
	{
		const arr = str.split(this.regex);
		const l = arr.length;
		this.count = count;
		this.index = 0;

		for (let i = 0; i < l; i++)
		{
			if (this.handleStr(arr[i])) break;
			this.index += arr[i].length;
		}

		//if there is still a result, then there was an error
		if (this.result)
		{
			if (this.escaped) throw _createExtractionError(this, "Unable to parse. Unclosed String detected");
			throw _createExtractionError(this, "Unable to parse. Unclosed Bracket detected");
		}

		return this.matches;
	}

	handleStr(str: string): boolean
	{
		let index: number;

		if (this.escaped)
		{
			if (str === this.unescapeStr) this.escaped = false;
			return this.add(str);
		}

		if (str === this.openChar) return this.open();

		if (str === this.closeChar) return this.close();

		index = this.stringChars.open.indexOf(str);
		if (index > -1)
		{
			this.escaped = true;
			this.unescapeStr = this.stringChars.close[index];
		}
		return this.add(str);
	}

	open(): boolean
	{
		//create a new result object
		const obj: IExtractionResult = {
			nest: [],
			simple: [],
			hasNest: false,
			str: '',
			index: [this.index],
		};

		//if there currently is a result:
		if (this.result)
		{
			//if the open and close characters are the same, then close
			if (this.sameChar) return this.close();

			//set hasNest to true
			this.result.hasNest = true;

			//add the new result object to the current nest
			this.result.nest.push(obj);

			//add the new simple result object to the current simple
			this.result.simple.push(obj.simple);

			//add the result to the tree
			this.tree.push(this.result);

			this.tree.forEach((branch) =>
			{
				//get the index of this for each parent
				obj.index.push(this.index - branch.index[0] - 1);

				//add the open char to all strings
				branch.str += this.openChar;
			});
		}
		//otherwise, save the obj as a new match
		else
		{
			this.matches.push(obj);
		}

		//set the result to be the new object
		this.result = obj;

		return false;
	}

	add(str: string): boolean
	{
		let nest;

		if (str && this.result)
		{
			nest = this.result.nest;

			//if the last element is a string, then append
			if (typeof nest[nest.length - 1] === "string")
			{
				nest[nest.length - 1] += str;
				this.result.simple += str;
			}
			//otherwise, the new string
			else
			{
				nest.push(str);
				this.result.simple.push(str);
			}

			this.result.str += str;

			this.tree.forEach((obj) =>
			{
				obj.str += str;
			});
		}

		return false;
	}

	close(): boolean
	{
		this.tree.forEach((branch) =>
		{
			//add the close char to all strings
			branch.str += this.closeChar;
		});

		//set the result to be the last element in the tree
		this.result = popLast(this.tree);

		//return true if it reached the desired number of matches
		return (!this.result && this.matches.length === this.count);
	}
}
