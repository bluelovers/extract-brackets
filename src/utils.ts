//to sort an array by length
import { defaultStringObj, Mates, regexChars } from './types';
import { _createExtractionError, Extraction, IExtractionResult } from './extraction';

function sortArrayByLength(a: string, b: string)
{
	return b.length - a.length;
}

/**
 * to get the mate value of the given string
 */
export function getMate(str: string): string
{

	let keys, regex, match, count;

	// @ts-ignore
	if (str in Mates) return Mates[str];

	//check for repeating cases

	//get the keys in order of largest to smallest since the smaller ones are substrings of the larger ones
	keys = Object.keys(Mates).sort(sortArrayByLength).map(toRegex);
	regex = new RegExp('(' + keys.join('|') + ')', 'g');
	match = str.match(regex);

	if (match)
	{
		count = str.length / match[0].length;
		// @ts-ignore
		if (count === match.length) return Mates[match[0]].repeat(count);
	}

	//if no common mate, then use the reverse of the str
	return reverse(str);
}

//to reverse a string
function reverse(str: string)
{
	return str.split('').reverse().join('');
}

function toRegex(str: string)
{
	return escapeChars(str, regexChars);
}

function escapeChars(str: string, arr: readonly string[])
{
	const expression = arr.join('\\');
	const regex = new RegExp('[\\' + expression + ']', 'g');

	return str.replace(regex, '\\$&')
}

export function popLast<T>(arr: T[])
{
	return arr.splice(arr.length - 1, 1)[0];
}

export function getLast<T>(arr: T[])
{
	return arr[arr.length - 1];
}

export function addEscape(str: string)
{
	return '\\\\' + str;
}

export function buildStringObj(arr: string | readonly string[])
{

	const ret = {
		open: [] as string[],
		close: [] as string[],
	};

	if (typeof arr === "string")
	{
		arr = [arr] as readonly string[];
	}
	else if (!Array.isArray(arr)) return defaultStringObj;

	arr.forEach(function (el: string | [string, string])
	{
		if (typeof el === "string")
		{
			ret.open.push(el);
			ret.close.push(getMate(el))
		}
		else if (Array.isArray(el) && typeof el[0] === "string")
		{
			if (typeof el[1] === "string")
			{
				ret.open.push(el[0])
				ret.close.push(el[1])
			}
			else
			{
				ret.open.push(el);
				ret.close.push(getMate(el));
			}
		}
	})

	return ret;
}

export function buildRegex(open: string, close: string, stringChars: any)
{
	const regexNormal = [open, close].concat(stringChars).sort(sortArrayByLength).map(toRegex),
		regexEscaped = regexNormal.map(addEscape),
		arr = regexEscaped.concat(regexNormal);

	return new RegExp('(' + arr.join('|') + ')', 'g');
}

export function _nearString(value: string, index: number, match: string, offset: number = 15, offsetEnd: number = 80, maxLength = 80)
{
	let s = Math.max(0, index - offset);
	let e = index + Math.min((match?.length || 0) + offsetEnd, maxLength > 0 ? maxLength : 80);

	return value.slice(s, e)
}

export function infoNearExtractionError(infoline: string, self: Extraction)
{
	let result: IExtractionResult = self?.result || {} as any;
	return _nearString(infoline, result.index?.[0] || 0, result.simple?.[0] as any)
}

