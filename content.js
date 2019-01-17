const config = {
	translateInterval: 1000
};

function log(text) {
	console.log('[DWT]: ' + text)
}

// let lastTranslate = null;
// document.body.addEventListener('DOMSubtreeModified', function () {
//
// 	if(lastTranslate === null || (new Date() - lastTranslate) > 1000) {
// 		lastTranslate = new Date();
// 		setTimeout(translate, 500);
// 	}
//
// }, false);

// find and convert approximate word in dictionary by ID
function convertWordApproximate(word_id) { // slow
	for(let w_i in __englishWords) {
		let word = __englishWords[w_i];

		if(~word_id.indexOf(w_i)) {
			return word;
		}
	}
	return null;
}

// find and convert precise word in dictionary by ID
function convertWordPrecise(word_id) { // fast
	return __englishWords[word_id];
}

// convert string concat by +
function convertString(word) {
	let strings = word.split('+');

	let ret = strings.map((word_id) =>
		convertWordPrecise(word_id) ||
		convertWordApproximate(word_id) ||
		word_id // clear text, no need conversion
	);

	// print if not found
	if(ret.length <= 0) {
		log('Word not found in dictionary: ' + word);
	}

	return ret;
}

// convert string encoded by ';' and '::'
function convert(encoded_i18n_id) {

	const ret = {};

	const semicolonSplit = encoded_i18n_id.split(';'); // split by ';'

	for(const ssItem of semicolonSplit) {
		const doubleColonSplit = ssItem.split('::'); // split by '::'
		if(doubleColonSplit.length > 1) {
			// if splits then fill corresponding attribute
			ret[doubleColonSplit[0]] = convertString(doubleColonSplit[1]);
		} else {
			// if not splits then fill innerHTML content
			ret['__content__'] = convertString(ssItem);
		}
	}

	return ret;
}

// translate all document
function translate() {

	log('TRANSLATE');

	let elems = $('[t]');

	for(let i=0; i<elems.length; i++) {
		let elem = elems[i];
		let jElem = $(elem);
		let i18n_id = elem.getAttribute('t');

		let converted = convert(i18n_id);
		for(let c in converted) {
			if(!converted.hasOwnProperty(c)) continue;

			let cItem = converted[c].join('');
			if(c === '__content__') {
				// check if content need update then update
				if(jElem.html() !== cItem) {
					jElem.html(cItem);
				}
			} else {
				// check if property need update then update
				if(jElem.prop(c) !== cItem) {
					jElem.prop(c, cItem);
				}
			}
		}
	}

	setTimeout(translate, config.translateInterval);
}

setTimeout(translate, config.translateInterval);
