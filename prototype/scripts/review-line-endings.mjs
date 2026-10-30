// Git may check out tracked Markdown with CRLF on Windows.
// This affects representation, not translated words or punctuation.
export function normalizeReviewLineEndings(text) {
 if(typeof text!=="string")throw TypeError("Expected text");
 return text.replace(/\r\n/g,"\n");
}
export function sameReviewSnapshot(saved,generated) {
 return normalizeReviewLineEndings(saved)===normalizeReviewLineEndings(generated);
}
