
//to sort an array by length
import { defaultStringObj, Mates, regexChars } from './types';

function sortArrayByLength(a, b)
{
	return b.length - a.length;
}

//to get the mate value of the given string
export function getMate(str: string)
{

	var keys, regex, match, count;

	if (str in Mates) return Mates[str];

	//check for repeating cases

	//get the keys in order of largest to smallest since the smaller ones are substrings of the larger ones
	keys = Object.keys(Mates).sort(sortArrayByLength).map(toRegex);
	regex = new RegExp('(' + keys.join('|') + ')', 'g');
	match = str.match(regex);

	if (match)
	{
		count = str.length / match[0].length;
		if (count === match.length) return Mates[match[0]].repeat(count);
	}

	//if no common mate, then use the reverse of the str
	return reverse(str);
}

//to reverse a string
function reverse(str)
{
	return str.split('').reverse().join('');
}

function toRegex(str)
{
	return escapeChars(str, regexChars);
}

function escapeChars(str, arr)
{
	var expression = arr.join('\\'),
		regex = new RegExp('[\\' + expression + ']', 'g');

	return str.replace(regex, '\\$&')
}

export function popLast(arr)
{
	return arr.splice(arr.length - 1, 1)[0];
}

function getLast(arr)
{
	return arr[arr.length - 1];
}

function addEscape(str)
{
	return '\\\\' + str;
}

export function buildStringObj(arr)
{

	var ret = {
		open: [],
		close: [],
	}

	if (typeof arr === "string")
	{
		arr = [arr];
	}
	else if (typeof arr !== "object" || arr.constructor !== Array) return defaultStringObj;

	arr.forEach(function (el)
	{
		if (typeof el === "string")
		{
			ret.open.push(el);
			ret.close.push(getMate(el))
		}
		else if (typeof el === "object" && el.constructor === Array && typeof el[0] === "string")
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

export function buildRegex(open, close, stringChars)
{
	var regexNormal = [open, close].concat(stringChars).sort(sortArrayByLength).map(toRegex),
		regexEscaped = regexNormal.map(addEscape),
		arr = regexEscaped.concat(regexNormal);

	return new RegExp('(' + arr.join('|') + ')', 'g');
}
