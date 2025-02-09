import _, { Extraction, Extractor, _nearString, infoNearExtractionError } from './index';

// @ts-ignore
if (process.env.TSDX_FORMAT !== 'esm')
{
	Object.defineProperty(_, "__esModule", { value: true });

	Object.defineProperty(_, 'default', { value: _ });

	Object.defineProperty(_, 'Extraction', { value: Extraction });
	Object.defineProperty(_, 'Extractor', { value: Extractor });
	Object.defineProperty(_, '_nearString', { value: _nearString });
	Object.defineProperty(_, 'infoNearExtractionError', { value: infoNearExtractionError });
}

// @ts-ignore
export = _
