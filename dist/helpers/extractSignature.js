"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _SignPdfError = _interopRequireDefault(require("../SignPdfError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Basic implementation of signature extraction.
 *
 * Really basic. Would work in the simplest of cases where there is only one signature
 * in a document and ByteRange is only used once in it.
 *
 * @param {Buffer} pdf
 * @returns {Object} {ByteRange: Number[], signature: Buffer, signedData: Buffer}
 */
const extractSignature = pdf => {
  if (!(pdf instanceof Buffer)) {
    throw new _SignPdfError.default('PDF expected as Buffer.', _SignPdfError.default.TYPE_INPUT);
  }

  const byteRangePos = pdf.indexOf('/ByteRange [');

  if (byteRangePos === -1) {
    throw new _SignPdfError.default('Failed to locate ByteRange.', _SignPdfError.default.TYPE_PARSE);
  }

  const byteRangeEnd = pdf.indexOf(']', byteRangePos);

  if (byteRangeEnd === -1) {
    throw new _SignPdfError.default('Failed to locate the end of the ByteRange.', _SignPdfError.default.TYPE_PARSE);
  }

  const byteRange = pdf.slice(byteRangePos, byteRangeEnd + 1).toString();
  const matches = /\/ByteRange \[(\d+) +(\d+) +(\d+) +(\d+) *\]/.exec(byteRange);

  if (matches === null) {
    throw new _SignPdfError.default('Failed to parse the ByteRange.', _SignPdfError.default.TYPE_PARSE);
  }

  const signedData = Buffer.concat([pdf.slice(parseInt(matches[1]), parseInt(matches[1]) + parseInt(matches[2])), pdf.slice(parseInt(matches[3]), parseInt(matches[3]) + parseInt(matches[4]))]);
  let signatureHex = pdf.slice(parseInt(matches[1]) + parseInt(matches[2]) + 1, parseInt(matches[3]) - 1).toString('binary');
  signatureHex = signatureHex.replace(/(?:00)*$/, '');
  const signature = Buffer.from(signatureHex, 'hex').toString('binary');
  return {
    ByteRange: matches.slice(1, 5).map(Number),
    signature,
    signedData
  };
};

var _default = extractSignature;
exports.default = _default;