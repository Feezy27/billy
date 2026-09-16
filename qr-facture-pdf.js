var SwissQRBillPDF = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // pdf-entry.js
  var pdf_entry_exports = {};
  __export(pdf_entry_exports, {
    SwissQRBill: () => SwissQRBill
  });

  // node_modules/swissqrbill/lib/esm/shared/cleaner.js
  function cleanData(data) {
    const _cleanObject = (object) => {
      return Object.fromEntries(
        Object.entries(object).map(([key, value]) => {
          if (typeof value === "object") {
            return [key, _cleanObject(value)];
          }
          if (typeof value === "string") {
            if (key === "account") {
              return [key, removeLineBreaks(removeSpaces(value))];
            }
            if (key === "reference") {
              return [key, removeLineBreaks(removeSpaces(value))];
            }
            if (key === "country") {
              return [key, removeLineBreaks(removeSpaces(value).toUpperCase())];
            }
            return [key, removeLineBreaks(value)];
          }
          return [key, value];
        })
      );
    };
    return _cleanObject(data);
  }
  function removeSpaces(text) {
    return text.replace(/ /g, "");
  }
  function removeLineBreaks(text) {
    return text.replace(/\n/g, "").replace(/\r/g, "");
  }

  // node_modules/swissqrbill/lib/esm/shared/qr-code-generator.js
  var qrcodegen;
  ((qrcodegen2) => {
    const _QrCode = class _QrCode2 {
      /*-- Constructor (low level) and fields --*/
      // Creates a new QR Code with the given version number,
      // error correction level, data codeword bytes, and mask number.
      // This is a low-level API that most users should not use directly.
      // A mid-level API is the encodeSegments() function.
      constructor(version, errorCorrectionLevel, dataCodewords, msk) {
        this.version = version;
        this.errorCorrectionLevel = errorCorrectionLevel;
        this.modules = [];
        this.isFunction = [];
        if (version < _QrCode2.MIN_VERSION || version > _QrCode2.MAX_VERSION)
          throw "Version value out of range";
        if (msk < -1 || msk > 7)
          throw "Mask value out of range";
        this.size = version * 4 + 17;
        const row = [];
        for (let i = 0; i < this.size; i++)
          row.push(false);
        for (let i = 0; i < this.size; i++) {
          this.modules.push(row.slice());
          this.isFunction.push(row.slice());
        }
        this.drawFunctionPatterns();
        const allCodewords = this.addEccAndInterleave(dataCodewords);
        this.drawCodewords(allCodewords);
        if (msk == -1) {
          let minPenalty = 1e9;
          for (let i = 0; i < 8; i++) {
            this.applyMask(i);
            this.drawFormatBits(i);
            const penalty = this.getPenaltyScore();
            if (penalty < minPenalty) {
              msk = i;
              minPenalty = penalty;
            }
            this.applyMask(i);
          }
        }
        assert(0 <= msk && msk <= 7);
        this.mask = msk;
        this.applyMask(msk);
        this.drawFormatBits(msk);
        this.isFunction = [];
      }
      /*-- Static factory functions (high level) --*/
      // Returns a QR Code representing the given Unicode text string at the given error correction level.
      // As a conservative upper bound, this function is guaranteed to succeed for strings that have 738 or fewer
      // Unicode code points (not UTF-16 code units) if the low error correction level is used. The smallest possible
      // QR Code version is automatically chosen for the output. The ECC level of the result may be higher than the
      // ecl argument if it can be done without increasing the version.
      static encodeText(text, ecl) {
        const segs = qrcodegen2.QrSegment.makeSegments(text);
        return _QrCode2.encodeSegments(segs, ecl);
      }
      // Returns a QR Code representing the given binary data at the given error correction level.
      // This function always encodes using the binary segment mode, not any text mode. The maximum number of
      // bytes allowed is 2953. The smallest possible QR Code version is automatically chosen for the output.
      // The ECC level of the result may be higher than the ecl argument if it can be done without increasing the version.
      static encodeBinary(data, ecl) {
        const seg = qrcodegen2.QrSegment.makeBytes(data);
        return _QrCode2.encodeSegments([seg], ecl);
      }
      /*-- Static factory functions (mid level) --*/
      // Returns a QR Code representing the given segments with the given encoding parameters.
      // The smallest possible QR Code version within the given range is automatically
      // chosen for the output. Iff boostEcl is true, then the ECC level of the result
      // may be higher than the ecl argument if it can be done without increasing the
      // version. The mask number is either between 0 to 7 (inclusive) to force that
      // mask, or -1 to automatically choose an appropriate mask (which may be slow).
      // This function allows the user to create a custom sequence of segments that switches
      // between modes (such as alphanumeric and byte) to encode text in less space.
      // This is a mid-level API; the high-level API is encodeText() and encodeBinary().
      static encodeSegments(segs, ecl, minVersion = 1, maxVersion = 40, mask = -1, boostEcl = true) {
        if (!(_QrCode2.MIN_VERSION <= minVersion && minVersion <= maxVersion && maxVersion <= _QrCode2.MAX_VERSION) || mask < -1 || mask > 7)
          throw "Invalid value";
        let version;
        let dataUsedBits;
        for (version = minVersion; ; version++) {
          const dataCapacityBits2 = _QrCode2.getNumDataCodewords(version, ecl) * 8;
          const usedBits = QrSegment.getTotalBits(segs, version);
          if (usedBits <= dataCapacityBits2) {
            dataUsedBits = usedBits;
            break;
          }
          if (version >= maxVersion)
            throw "Data too long";
        }
        for (const newEcl of [_QrCode2.Ecc.MEDIUM, _QrCode2.Ecc.QUARTILE, _QrCode2.Ecc.HIGH]) {
          if (boostEcl && dataUsedBits <= _QrCode2.getNumDataCodewords(version, newEcl) * 8)
            ecl = newEcl;
        }
        const bb = [];
        for (const seg of segs) {
          appendBits(seg.mode.modeBits, 4, bb);
          appendBits(seg.numChars, seg.mode.numCharCountBits(version), bb);
          for (const b of seg.getData())
            bb.push(b);
        }
        assert(bb.length == dataUsedBits);
        const dataCapacityBits = _QrCode2.getNumDataCodewords(version, ecl) * 8;
        assert(bb.length <= dataCapacityBits);
        appendBits(0, Math.min(4, dataCapacityBits - bb.length), bb);
        appendBits(0, (8 - bb.length % 8) % 8, bb);
        assert(bb.length % 8 == 0);
        for (let padByte = 236; bb.length < dataCapacityBits; padByte ^= 236 ^ 17)
          appendBits(padByte, 8, bb);
        const dataCodewords = [];
        while (dataCodewords.length * 8 < bb.length)
          dataCodewords.push(0);
        bb.forEach((b, i) => dataCodewords[i >>> 3] |= b << 7 - (i & 7));
        return new _QrCode2(version, ecl, dataCodewords, mask);
      }
      /*-- Accessor methods --*/
      // Returns the color of the module (pixel) at the given coordinates, which is false
      // for light or true for dark. The top left corner has the coordinates (x=0, y=0).
      // If the given coordinates are out of bounds, then false (light) is returned.
      getModule(x, y) {
        return 0 <= x && x < this.size && 0 <= y && y < this.size && this.modules[y][x];
      }
      /*-- Private helper methods for constructor: Drawing function modules --*/
      // Reads this object's version field, and draws and marks all function modules.
      drawFunctionPatterns() {
        for (let i = 0; i < this.size; i++) {
          this.setFunctionModule(6, i, i % 2 == 0);
          this.setFunctionModule(i, 6, i % 2 == 0);
        }
        this.drawFinderPattern(3, 3);
        this.drawFinderPattern(this.size - 4, 3);
        this.drawFinderPattern(3, this.size - 4);
        const alignPatPos = this.getAlignmentPatternPositions();
        const numAlign = alignPatPos.length;
        for (let i = 0; i < numAlign; i++) {
          for (let j = 0; j < numAlign; j++) {
            if (!(i == 0 && j == 0 || i == 0 && j == numAlign - 1 || i == numAlign - 1 && j == 0))
              this.drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
          }
        }
        this.drawFormatBits(0);
        this.drawVersion();
      }
      // Draws two copies of the format bits (with its own error correction code)
      // based on the given mask and this object's error correction level field.
      drawFormatBits(mask) {
        const data = this.errorCorrectionLevel.formatBits << 3 | mask;
        let rem = data;
        for (let i = 0; i < 10; i++)
          rem = rem << 1 ^ (rem >>> 9) * 1335;
        const bits = (data << 10 | rem) ^ 21522;
        assert(bits >>> 15 == 0);
        for (let i = 0; i <= 5; i++)
          this.setFunctionModule(8, i, getBit(bits, i));
        this.setFunctionModule(8, 7, getBit(bits, 6));
        this.setFunctionModule(8, 8, getBit(bits, 7));
        this.setFunctionModule(7, 8, getBit(bits, 8));
        for (let i = 9; i < 15; i++)
          this.setFunctionModule(14 - i, 8, getBit(bits, i));
        for (let i = 0; i < 8; i++)
          this.setFunctionModule(this.size - 1 - i, 8, getBit(bits, i));
        for (let i = 8; i < 15; i++)
          this.setFunctionModule(8, this.size - 15 + i, getBit(bits, i));
        this.setFunctionModule(8, this.size - 8, true);
      }
      // Draws two copies of the version bits (with its own error correction code),
      // based on this object's version field, iff 7 <= version <= 40.
      drawVersion() {
        if (this.version < 7)
          return;
        let rem = this.version;
        for (let i = 0; i < 12; i++)
          rem = rem << 1 ^ (rem >>> 11) * 7973;
        const bits = this.version << 12 | rem;
        assert(bits >>> 18 == 0);
        for (let i = 0; i < 18; i++) {
          const color = getBit(bits, i);
          const a = this.size - 11 + i % 3;
          const b = Math.floor(i / 3);
          this.setFunctionModule(a, b, color);
          this.setFunctionModule(b, a, color);
        }
      }
      // Draws a 9*9 finder pattern including the border separator,
      // with the center module at (x, y). Modules can be out of bounds.
      drawFinderPattern(x, y) {
        for (let dy = -4; dy <= 4; dy++) {
          for (let dx = -4; dx <= 4; dx++) {
            const dist = Math.max(Math.abs(dx), Math.abs(dy));
            const xx = x + dx;
            const yy = y + dy;
            if (0 <= xx && xx < this.size && 0 <= yy && yy < this.size)
              this.setFunctionModule(xx, yy, dist != 2 && dist != 4);
          }
        }
      }
      // Draws a 5*5 alignment pattern, with the center module
      // at (x, y). All modules must be in bounds.
      drawAlignmentPattern(x, y) {
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++)
            this.setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) != 1);
        }
      }
      // Sets the color of a module and marks it as a function module.
      // Only used by the constructor. Coordinates must be in bounds.
      setFunctionModule(x, y, isDark) {
        this.modules[y][x] = isDark;
        this.isFunction[y][x] = true;
      }
      /*-- Private helper methods for constructor: Codewords and masking --*/
      // Returns a new byte string representing the given data with the appropriate error correction
      // codewords appended to it, based on this object's version and error correction level.
      addEccAndInterleave(data) {
        const ver = this.version;
        const ecl = this.errorCorrectionLevel;
        if (data.length != _QrCode2.getNumDataCodewords(ver, ecl))
          throw "Invalid argument";
        const numBlocks = _QrCode2.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
        const blockEccLen = _QrCode2.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver];
        const rawCodewords = Math.floor(_QrCode2.getNumRawDataModules(ver) / 8);
        const numShortBlocks = numBlocks - rawCodewords % numBlocks;
        const shortBlockLen = Math.floor(rawCodewords / numBlocks);
        const blocks = [];
        const rsDiv = _QrCode2.reedSolomonComputeDivisor(blockEccLen);
        for (let i = 0, k = 0; i < numBlocks; i++) {
          const dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
          k += dat.length;
          const ecc = _QrCode2.reedSolomonComputeRemainder(dat, rsDiv);
          if (i < numShortBlocks)
            dat.push(0);
          blocks.push(dat.concat(ecc));
        }
        const result = [];
        for (let i = 0; i < blocks[0].length; i++) {
          blocks.forEach((block, j) => {
            if (i != shortBlockLen - blockEccLen || j >= numShortBlocks)
              result.push(block[i]);
          });
        }
        assert(result.length == rawCodewords);
        return result;
      }
      // Draws the given sequence of 8-bit codewords (data and error correction) onto the entire
      // data area of this QR Code. Function modules need to be marked off before this is called.
      drawCodewords(data) {
        if (data.length != Math.floor(_QrCode2.getNumRawDataModules(this.version) / 8))
          throw "Invalid argument";
        let i = 0;
        for (let right = this.size - 1; right >= 1; right -= 2) {
          if (right == 6)
            right = 5;
          for (let vert = 0; vert < this.size; vert++) {
            for (let j = 0; j < 2; j++) {
              const x = right - j;
              const upward = (right + 1 & 2) == 0;
              const y = upward ? this.size - 1 - vert : vert;
              if (!this.isFunction[y][x] && i < data.length * 8) {
                this.modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
                i++;
              }
            }
          }
        }
        assert(i == data.length * 8);
      }
      // XORs the codeword modules in this QR Code with the given mask pattern.
      // The function modules must be marked and the codeword bits must be drawn
      // before masking. Due to the arithmetic of XOR, calling applyMask() with
      // the same mask value a second time will undo the mask. A final well-formed
      // QR Code needs exactly one (not zero, two, etc.) mask applied.
      applyMask(mask) {
        if (mask < 0 || mask > 7)
          throw "Mask value out of range";
        for (let y = 0; y < this.size; y++) {
          for (let x = 0; x < this.size; x++) {
            let invert;
            switch (mask) {
              case 0:
                invert = (x + y) % 2 == 0;
                break;
              case 1:
                invert = y % 2 == 0;
                break;
              case 2:
                invert = x % 3 == 0;
                break;
              case 3:
                invert = (x + y) % 3 == 0;
                break;
              case 4:
                invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 == 0;
                break;
              case 5:
                invert = x * y % 2 + x * y % 3 == 0;
                break;
              case 6:
                invert = (x * y % 2 + x * y % 3) % 2 == 0;
                break;
              case 7:
                invert = ((x + y) % 2 + x * y % 3) % 2 == 0;
                break;
              default:
                throw "Unreachable";
            }
            if (!this.isFunction[y][x] && invert)
              this.modules[y][x] = !this.modules[y][x];
          }
        }
      }
      // Calculates and returns the penalty score based on state of this QR Code's current modules.
      // This is used by the automatic mask choice algorithm to find the mask pattern that yields the lowest score.
      getPenaltyScore() {
        let result = 0;
        for (let y = 0; y < this.size; y++) {
          let runColor = false;
          let runX = 0;
          const runHistory = [0, 0, 0, 0, 0, 0, 0];
          for (let x = 0; x < this.size; x++) {
            if (this.modules[y][x] == runColor) {
              runX++;
              if (runX == 5)
                result += _QrCode2.PENALTY_N1;
              else if (runX > 5)
                result++;
            } else {
              this.finderPenaltyAddHistory(runX, runHistory);
              if (!runColor)
                result += this.finderPenaltyCountPatterns(runHistory) * _QrCode2.PENALTY_N3;
              runColor = this.modules[y][x];
              runX = 1;
            }
          }
          result += this.finderPenaltyTerminateAndCount(runColor, runX, runHistory) * _QrCode2.PENALTY_N3;
        }
        for (let x = 0; x < this.size; x++) {
          let runColor = false;
          let runY = 0;
          const runHistory = [0, 0, 0, 0, 0, 0, 0];
          for (let y = 0; y < this.size; y++) {
            if (this.modules[y][x] == runColor) {
              runY++;
              if (runY == 5)
                result += _QrCode2.PENALTY_N1;
              else if (runY > 5)
                result++;
            } else {
              this.finderPenaltyAddHistory(runY, runHistory);
              if (!runColor)
                result += this.finderPenaltyCountPatterns(runHistory) * _QrCode2.PENALTY_N3;
              runColor = this.modules[y][x];
              runY = 1;
            }
          }
          result += this.finderPenaltyTerminateAndCount(runColor, runY, runHistory) * _QrCode2.PENALTY_N3;
        }
        for (let y = 0; y < this.size - 1; y++) {
          for (let x = 0; x < this.size - 1; x++) {
            const color = this.modules[y][x];
            if (color == this.modules[y][x + 1] && color == this.modules[y + 1][x] && color == this.modules[y + 1][x + 1])
              result += _QrCode2.PENALTY_N2;
          }
        }
        let dark = 0;
        for (const row of this.modules)
          dark = row.reduce((sum, color) => sum + (color ? 1 : 0), dark);
        const total = this.size * this.size;
        const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
        assert(0 <= k && k <= 9);
        result += k * _QrCode2.PENALTY_N4;
        assert(0 <= result && result <= 2568888);
        return result;
      }
      /*-- Private helper functions --*/
      // Returns an ascending list of positions of alignment patterns for this version number.
      // Each position is in the range [0,177), and are used on both the x and y axes.
      // This could be implemented as lookup table of 40 variable-length lists of integers.
      getAlignmentPatternPositions() {
        if (this.version == 1)
          return [];
        else {
          const numAlign = Math.floor(this.version / 7) + 2;
          const step = this.version == 32 ? 26 : Math.ceil((this.version * 4 + 4) / (numAlign * 2 - 2)) * 2;
          const result = [6];
          for (let pos = this.size - 7; result.length < numAlign; pos -= step)
            result.splice(1, 0, pos);
          return result;
        }
      }
      // Returns the number of data bits that can be stored in a QR Code of the given version number, after
      // all function modules are excluded. This includes remainder bits, so it might not be a multiple of 8.
      // The result is in the range [208, 29648]. This could be implemented as a 40-entry lookup table.
      static getNumRawDataModules(ver) {
        if (ver < _QrCode2.MIN_VERSION || ver > _QrCode2.MAX_VERSION)
          throw "Version number out of range";
        let result = (16 * ver + 128) * ver + 64;
        if (ver >= 2) {
          const numAlign = Math.floor(ver / 7) + 2;
          result -= (25 * numAlign - 10) * numAlign - 55;
          if (ver >= 7)
            result -= 36;
        }
        assert(208 <= result && result <= 29648);
        return result;
      }
      // Returns the number of 8-bit data (i.e. not error correction) codewords contained in any
      // QR Code of the given version number and error correction level, with remainder bits discarded.
      // This stateless pure function could be implemented as a (40*4)-cell lookup table.
      static getNumDataCodewords(ver, ecl) {
        return Math.floor(_QrCode2.getNumRawDataModules(ver) / 8) - _QrCode2.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver] * _QrCode2.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
      }
      // Returns a Reed-Solomon ECC generator polynomial for the given degree. This could be
      // implemented as a lookup table over all possible parameter values, instead of as an algorithm.
      static reedSolomonComputeDivisor(degree) {
        if (degree < 1 || degree > 255)
          throw "Degree out of range";
        const result = [];
        for (let i = 0; i < degree - 1; i++)
          result.push(0);
        result.push(1);
        let root = 1;
        for (let i = 0; i < degree; i++) {
          for (let j = 0; j < result.length; j++) {
            result[j] = _QrCode2.reedSolomonMultiply(result[j], root);
            if (j + 1 < result.length)
              result[j] ^= result[j + 1];
          }
          root = _QrCode2.reedSolomonMultiply(root, 2);
        }
        return result;
      }
      // Returns the Reed-Solomon error correction codeword for the given data and divisor polynomials.
      static reedSolomonComputeRemainder(data, divisor) {
        const result = divisor.map((_) => 0);
        for (const b of data) {
          const factor = b ^ result.shift();
          result.push(0);
          divisor.forEach((coef, i) => result[i] ^= _QrCode2.reedSolomonMultiply(coef, factor));
        }
        return result;
      }
      // Returns the product of the two given field elements modulo GF(2^8/0x11D). The arguments and result
      // are unsigned 8-bit integers. This could be implemented as a lookup table of 256*256 entries of uint8.
      static reedSolomonMultiply(x, y) {
        if (x >>> 8 != 0 || y >>> 8 != 0)
          throw "Byte out of range";
        let z = 0;
        for (let i = 7; i >= 0; i--) {
          z = z << 1 ^ (z >>> 7) * 285;
          z ^= (y >>> i & 1) * x;
        }
        assert(z >>> 8 == 0);
        return z;
      }
      // Can only be called immediately after a light run is added, and
      // returns either 0, 1, or 2. A helper function for getPenaltyScore().
      finderPenaltyCountPatterns(runHistory) {
        const n = runHistory[1];
        assert(n <= this.size * 3);
        const core = n > 0 && runHistory[2] == n && runHistory[3] == n * 3 && runHistory[4] == n && runHistory[5] == n;
        return (core && runHistory[0] >= n * 4 && runHistory[6] >= n ? 1 : 0) + (core && runHistory[6] >= n * 4 && runHistory[0] >= n ? 1 : 0);
      }
      // Must be called at the end of a line (row or column) of modules. A helper function for getPenaltyScore().
      finderPenaltyTerminateAndCount(currentRunColor, currentRunLength, runHistory) {
        if (currentRunColor) {
          this.finderPenaltyAddHistory(currentRunLength, runHistory);
          currentRunLength = 0;
        }
        currentRunLength += this.size;
        this.finderPenaltyAddHistory(currentRunLength, runHistory);
        return this.finderPenaltyCountPatterns(runHistory);
      }
      // Pushes the given value to the front and drops the last value. A helper function for getPenaltyScore().
      finderPenaltyAddHistory(currentRunLength, runHistory) {
        if (runHistory[0] == 0)
          currentRunLength += this.size;
        runHistory.pop();
        runHistory.unshift(currentRunLength);
      }
    };
    _QrCode.MIN_VERSION = 1;
    _QrCode.MAX_VERSION = 40;
    _QrCode.PENALTY_N1 = 3;
    _QrCode.PENALTY_N2 = 3;
    _QrCode.PENALTY_N3 = 40;
    _QrCode.PENALTY_N4 = 10;
    _QrCode.ECC_CODEWORDS_PER_BLOCK = [
      // Version: (note that index 0 is for padding, and is set to an illegal value)
      //0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
      [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
      // Low
      [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
      // Medium
      [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
      // Quartile
      [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
      // High
    ];
    _QrCode.NUM_ERROR_CORRECTION_BLOCKS = [
      // Version: (note that index 0 is for padding, and is set to an illegal value)
      //0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
      [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
      // Low
      [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
      // Medium
      [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
      // Quartile
      [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
      // High
    ];
    let QrCode = _QrCode;
    qrcodegen2.QrCode = QrCode;
    function appendBits(val, len, bb) {
      if (len < 0 || len > 31 || val >>> len != 0)
        throw "Value out of range";
      for (let i = len - 1; i >= 0; i--)
        bb.push(val >>> i & 1);
    }
    function getBit(x, i) {
      return (x >>> i & 1) != 0;
    }
    function assert(cond) {
      if (!cond)
        throw "Assertion error";
    }
    const _QrSegment = class _QrSegment2 {
      /*-- Constructor (low level) and fields --*/
      // Creates a new QR Code segment with the given attributes and data.
      // The character count (numChars) must agree with the mode and the bit buffer length,
      // but the constraint isn't checked. The given bit buffer is cloned and stored.
      constructor(mode, numChars, bitData) {
        this.mode = mode;
        this.numChars = numChars;
        this.bitData = bitData;
        if (numChars < 0)
          throw "Invalid argument";
        this.bitData = bitData.slice();
      }
      /*-- Static factory functions (mid level) --*/
      // Returns a segment representing the given binary data encoded in
      // byte mode. All input byte arrays are acceptable. Any text string
      // can be converted to UTF-8 bytes and encoded as a byte mode segment.
      static makeBytes(data) {
        const bb = [];
        for (const b of data)
          appendBits(b, 8, bb);
        return new _QrSegment2(_QrSegment2.Mode.BYTE, data.length, bb);
      }
      // Returns a segment representing the given string of decimal digits encoded in numeric mode.
      static makeNumeric(digits) {
        if (!_QrSegment2.isNumeric(digits))
          throw "String contains non-numeric characters";
        const bb = [];
        for (let i = 0; i < digits.length; ) {
          const n = Math.min(digits.length - i, 3);
          appendBits(parseInt(digits.substr(i, n), 10), n * 3 + 1, bb);
          i += n;
        }
        return new _QrSegment2(_QrSegment2.Mode.NUMERIC, digits.length, bb);
      }
      // Returns a segment representing the given text string encoded in alphanumeric mode.
      // The characters allowed are: 0 to 9, A to Z (uppercase only), space,
      // dollar, percent, asterisk, plus, hyphen, period, slash, colon.
      static makeAlphanumeric(text) {
        if (!_QrSegment2.isAlphanumeric(text))
          throw "String contains unencodable characters in alphanumeric mode";
        const bb = [];
        let i;
        for (i = 0; i + 2 <= text.length; i += 2) {
          let temp = _QrSegment2.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)) * 45;
          temp += _QrSegment2.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i + 1));
          appendBits(temp, 11, bb);
        }
        if (i < text.length)
          appendBits(_QrSegment2.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)), 6, bb);
        return new _QrSegment2(_QrSegment2.Mode.ALPHANUMERIC, text.length, bb);
      }
      // Returns a new mutable list of zero or more segments to represent the given Unicode text string.
      // The result may use various segment modes and switch modes to optimize the length of the bit stream.
      static makeSegments(text) {
        if (text == "")
          return [];
        else if (_QrSegment2.isNumeric(text))
          return [_QrSegment2.makeNumeric(text)];
        else if (_QrSegment2.isAlphanumeric(text))
          return [_QrSegment2.makeAlphanumeric(text)];
        else
          return [_QrSegment2.makeBytes(_QrSegment2.toUtf8ByteArray(text))];
      }
      // Returns a segment representing an Extended Channel Interpretation
      // (ECI) designator with the given assignment value.
      static makeEci(assignVal) {
        const bb = [];
        if (assignVal < 0)
          throw "ECI assignment value out of range";
        else if (assignVal < 1 << 7)
          appendBits(assignVal, 8, bb);
        else if (assignVal < 1 << 14) {
          appendBits(2, 2, bb);
          appendBits(assignVal, 14, bb);
        } else if (assignVal < 1e6) {
          appendBits(6, 3, bb);
          appendBits(assignVal, 21, bb);
        } else
          throw "ECI assignment value out of range";
        return new _QrSegment2(_QrSegment2.Mode.ECI, 0, bb);
      }
      // Tests whether the given string can be encoded as a segment in numeric mode.
      // A string is encodable iff each character is in the range 0 to 9.
      static isNumeric(text) {
        return _QrSegment2.NUMERIC_REGEX.test(text);
      }
      // Tests whether the given string can be encoded as a segment in alphanumeric mode.
      // A string is encodable iff each character is in the following set: 0 to 9, A to Z
      // (uppercase only), space, dollar, percent, asterisk, plus, hyphen, period, slash, colon.
      static isAlphanumeric(text) {
        return _QrSegment2.ALPHANUMERIC_REGEX.test(text);
      }
      /*-- Methods --*/
      // Returns a new copy of the data bits of this segment.
      getData() {
        return this.bitData.slice();
      }
      // (Package-private) Calculates and returns the number of bits needed to encode the given segments at
      // the given version. The result is infinity if a segment has too many characters to fit its length field.
      static getTotalBits(segs, version) {
        let result = 0;
        for (const seg of segs) {
          const ccbits = seg.mode.numCharCountBits(version);
          if (seg.numChars >= 1 << ccbits)
            return Infinity;
          result += 4 + ccbits + seg.bitData.length;
        }
        return result;
      }
      // Returns a new array of bytes representing the given string encoded in UTF-8.
      static toUtf8ByteArray(str) {
        str = encodeURI(str);
        const result = [];
        for (let i = 0; i < str.length; i++) {
          if (str.charAt(i) != "%")
            result.push(str.charCodeAt(i));
          else {
            result.push(parseInt(str.substr(i + 1, 2), 16));
            i += 2;
          }
        }
        return result;
      }
    };
    _QrSegment.NUMERIC_REGEX = /^[0-9]*$/;
    _QrSegment.ALPHANUMERIC_REGEX = /^[A-Z0-9 $%*+.\/:-]*$/;
    _QrSegment.ALPHANUMERIC_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
    let QrSegment = _QrSegment;
    qrcodegen2.QrSegment = QrSegment;
  })(qrcodegen || (qrcodegen = {}));
  ((qrcodegen2) => {
    ((QrCode2) => {
      const _Ecc = class _Ecc {
        // The QR Code can tolerate about 30% erroneous codewords
        /*-- Constructor and fields --*/
        constructor(ordinal, formatBits) {
          this.ordinal = ordinal;
          this.formatBits = formatBits;
        }
      };
      _Ecc.LOW = new _Ecc(0, 1);
      _Ecc.MEDIUM = new _Ecc(1, 0);
      _Ecc.QUARTILE = new _Ecc(2, 3);
      _Ecc.HIGH = new _Ecc(3, 2);
      let Ecc = _Ecc;
      QrCode2.Ecc = Ecc;
    })(qrcodegen2.QrCode || (qrcodegen2.QrCode = {}));
  })(qrcodegen || (qrcodegen = {}));
  ((qrcodegen2) => {
    ((QrSegment2) => {
      const _Mode = class _Mode {
        /*-- Constructor and fields --*/
        constructor(modeBits, numBitsCharCount) {
          this.modeBits = modeBits;
          this.numBitsCharCount = numBitsCharCount;
        }
        /*-- Method --*/
        // (Package-private) Returns the bit width of the character count field for a segment in
        // this mode in a QR Code at the given version number. The result is in the range [0, 16].
        numCharCountBits(ver) {
          return this.numBitsCharCount[Math.floor((ver + 7) / 17)];
        }
      };
      _Mode.NUMERIC = new _Mode(1, [10, 12, 14]);
      _Mode.ALPHANUMERIC = new _Mode(2, [9, 11, 13]);
      _Mode.BYTE = new _Mode(4, [8, 16, 16]);
      _Mode.KANJI = new _Mode(8, [8, 10, 12]);
      _Mode.ECI = new _Mode(7, [0, 0, 0]);
      let Mode = _Mode;
      QrSegment2.Mode = Mode;
    })(qrcodegen2.QrSegment || (qrcodegen2.QrSegment = {}));
  })(qrcodegen || (qrcodegen = {}));

  // node_modules/swissqrbill/lib/esm/shared/errors.js
  var ValidationError = class extends Error {
    /** @internal */
    constructor(message, params) {
      const messageWithParams = params ? resolveMessageParams(message, params) : message;
      super(messageWithParams);
      this.name = "ValidationError";
      this.code = getErrorCodeByMessage(message);
    }
  };
  function getErrorCodeByMessage(message) {
    const errorCodes = Object.keys(ValidationErrors);
    const errorCode = errorCodes.find((key) => ValidationErrors[key] === message);
    return errorCode;
  }
  function resolveMessageParams(message, params) {
    return Object.entries(params).reduce((message2, [key, value]) => {
      return message2.replace(`{${key}}`, value);
    }, message);
  }
  var ValidationErrors = /* @__PURE__ */ ((ValidationErrors2) => {
    ValidationErrors2["ACCOUNT_IS_QR_IBAN_BUT_REFERENCE_IS_MISSING"] = "If there is no reference, a conventional IBAN must be used.";
    ValidationErrors2["ACCOUNT_IS_QR_IBAN_BUT_REFERENCE_IS_REGULAR"] = "QR-IBAN requires the use of a QR-Reference.";
    ValidationErrors2["ACCOUNT_IS_REGULAR_IBAN_BUT_REFERENCE_IS_QR"] = "QR-Reference requires the use of a QR-IBAN.";
    ValidationErrors2["ACCOUNT_LENGTH_IS_INVALID"] = "The provided IBAN number '{iban}' is either too long or too short.";
    ValidationErrors2["ADDITIONAL_INFORMATION_LENGTH_IS_INVALID"] = "Additional information must be a maximum of 140 characters.";
    ValidationErrors2["ADDITIONAL_INFORMATION_TYPE_IS_INVALID"] = "Additional information must be a string.";
    ValidationErrors2["ALTERNATIVE_SCHEME_LENGTH_IS_INVALID"] = "{scheme} must be a maximum of 100 characters.";
    ValidationErrors2["ALTERNATIVE_SCHEME_TYPE_IS_INVALID"] = "{scheme} must be a string.";
    ValidationErrors2["AMOUNT_LENGTH_IS_INVALID"] = "Amount must be a maximum of 12 digits.";
    ValidationErrors2["AMOUNT_TYPE_IS_INVALID"] = "Amount must be a number.";
    ValidationErrors2["CREDITOR_ACCOUNT_COUNTRY_IS_INVALID"] = "Only CH and LI IBAN numbers are allowed.";
    ValidationErrors2["CREDITOR_ACCOUNT_IS_INVALID"] = "The provided IBAN number '{iban}' is not valid.";
    ValidationErrors2["CREDITOR_ACCOUNT_IS_UNDEFINED"] = "Creditor account cannot be undefined.";
    ValidationErrors2["CREDITOR_ADDRESS_IS_UNDEFINED"] = "Creditor address cannot be undefined.";
    ValidationErrors2["CREDITOR_ADDRESS_LENGTH_IS_INVALID"] = "Creditor address must be a maximum of 70 characters.";
    ValidationErrors2["CREDITOR_ADDRESS_TYPE_IS_INVALID"] = "Creditor address TYPE must be a string.";
    ValidationErrors2["CREDITOR_BUILDING_NUMBER_LENGTH_IS_INVALID"] = "Creditor buildingNumber must be a maximum of 16 characters.";
    ValidationErrors2["CREDITOR_BUILDING_NUMBER_TYPE_IS_INVALID"] = "Creditor buildingNumber must be either a string or a number.";
    ValidationErrors2["CREDITOR_CITY_IS_UNDEFINED"] = "Creditor city cannot be undefined.";
    ValidationErrors2["CREDITOR_CITY_LENGTH_IS_INVALID"] = "Creditor city must be a maximum of 35 characters.";
    ValidationErrors2["CREDITOR_CITY_TYPE_IS_INVALID"] = "Creditor city must be a string.";
    ValidationErrors2["CREDITOR_COUNTRY_IS_UNDEFINED"] = "Creditor country cannot be undefined.";
    ValidationErrors2["CREDITOR_COUNTRY_LENGTH_IS_INVALID"] = "Creditor country must be 2 characters.";
    ValidationErrors2["CREDITOR_COUNTRY_TYPE_IS_INVALID"] = "Creditor country must be a string.";
    ValidationErrors2["CREDITOR_IS_UNDEFINED"] = "Creditor cannot be undefined.";
    ValidationErrors2["CREDITOR_NAME_IS_UNDEFINED"] = "Creditor name cannot be undefined.";
    ValidationErrors2["CREDITOR_NAME_LENGTH_IS_INVALID"] = "Creditor name must be a maximum of 70 characters.";
    ValidationErrors2["CREDITOR_NAME_TYPE_IS_INVALID"] = "Creditor name must be a string.";
    ValidationErrors2["CREDITOR_ZIP_IS_UNDEFINED"] = "Creditor zip cannot be undefined.";
    ValidationErrors2["CREDITOR_ZIP_LENGTH_IS_INVALID"] = "Creditor zip must be a maximum of 16 characters.";
    ValidationErrors2["CREDITOR_ZIP_TYPE_IS_INVALID"] = "Creditor zip must be either a string or a number.";
    ValidationErrors2["CURRENCY_IS_UNDEFINED"] = "Currency cannot be undefined.";
    ValidationErrors2["CURRENCY_LENGTH_IS_INVALID"] = "Currency must be a length of 3 characters.";
    ValidationErrors2["CURRENCY_STRING_IS_INVALID"] = "Currency must be either 'CHF' or 'EUR'";
    ValidationErrors2["CURRENCY_TYPE_IS_INVALID"] = "Currency must be a string.";
    ValidationErrors2["DEBTOR_ADDRESS_IS_UNDEFINED"] = "Debtor address cannot be undefined.";
    ValidationErrors2["DEBTOR_ADDRESS_LENGTH_IS_INVALID"] = "Debtor address must be a maximum of 70 characters.";
    ValidationErrors2["DEBTOR_ADDRESS_TYPE_IS_INVALID"] = "Debtor address TYPE must be a string.";
    ValidationErrors2["DEBTOR_BUILDING_NUMBER_LENGTH_IS_INVALID"] = "Debtor buildingNumber must be a maximum of 16 characters.";
    ValidationErrors2["DEBTOR_BUILDING_NUMBER_TYPE_IS_INVALID"] = "Debtor buildingNumber must be either a string or a number.";
    ValidationErrors2["DEBTOR_CITY_IS_UNDEFINED"] = "Debtor city cannot be undefined.";
    ValidationErrors2["DEBTOR_CITY_LENGTH_IS_INVALID"] = "Debtor city must be a maximum of 35 characters.";
    ValidationErrors2["DEBTOR_CITY_TYPE_IS_INVALID"] = "Debtor city must be a string.";
    ValidationErrors2["DEBTOR_COUNTRY_IS_UNDEFINED"] = "Debtor country cannot be undefined.";
    ValidationErrors2["DEBTOR_COUNTRY_LENGTH_IS_INVALID"] = "Debtor country must be 2 characters.";
    ValidationErrors2["DEBTOR_COUNTRY_TYPE_IS_INVALID"] = "Debtor country must be a string.";
    ValidationErrors2["DEBTOR_IS_UNDEFINED"] = "Debtor cannot be undefined.";
    ValidationErrors2["DEBTOR_NAME_IS_UNDEFINED"] = "Debtor name cannot be undefined.";
    ValidationErrors2["DEBTOR_NAME_LENGTH_IS_INVALID"] = "Debtor name must be a maximum of 70 characters.";
    ValidationErrors2["DEBTOR_NAME_TYPE_IS_INVALID"] = "Debtor name must be a string.";
    ValidationErrors2["DEBTOR_ZIP_IS_UNDEFINED"] = "Debtor zip cannot be undefined.";
    ValidationErrors2["DEBTOR_ZIP_LENGTH_IS_INVALID"] = "Debtor zip must be a maximum of 16 characters.";
    ValidationErrors2["DEBTOR_ZIP_TYPE_IS_INVALID"] = "Debtor zip must be either a string or a number.";
    ValidationErrors2["MESSAGE_AND_ADDITIONAL_INFORMATION_LENGTH_IS_INVALID"] = "Message and additionalInformation combined must be a maximum of 140 characters.";
    ValidationErrors2["MESSAGE_LENGTH_IS_INVALID"] = "Message must be a maximum of 140 characters.";
    ValidationErrors2["MESSAGE_TYPE_IS_INVALID"] = "Message must be a string.";
    ValidationErrors2["QR_REFERENCE_IS_INVALID"] = "The provided QR-Reference '{reference}' is not valid.";
    ValidationErrors2["QR_REFERENCE_LENGTH_IS_INVALID"] = "QR-Reference must be a must be exactly 27 characters.";
    ValidationErrors2["REFERENCE_TYPE_IS_INVALID"] = "Reference must be a string.";
    ValidationErrors2["REGULAR_REFERENCE_LENGTH_IS_INVALID"] = "Creditor reference must be a maximum of 25 characters.";
    return ValidationErrors2;
  })(ValidationErrors || {});

  // node_modules/swissqrbill/lib/esm/shared/utils.js
  function isQRIBAN(iban) {
    iban = iban.replace(/ /g, "");
    const QRIID = iban.substring(4, 9);
    return +QRIID >= 3e4 && +QRIID <= 31999;
  }
  function isIBANValid(iban) {
    iban = iban.replace(/ /g, "").toUpperCase();
    iban = iban.substring(4) + iban.substring(0, 4);
    return mod97(iban) === 1;
  }
  function formatIBAN(iban) {
    var _a;
    const ibanArray = iban.replace(/ /g, "").match(/.{1,4}/g);
    return (_a = ibanArray == null ? void 0 : ibanArray.join(" ")) != null ? _a : iban;
  }
  function isQRReference(reference) {
    reference = reference.replace(/ /g, "");
    if (reference.length !== 27) {
      return false;
    }
    if (!/^\d+$/.test(reference)) {
      return false;
    }
    return true;
  }
  function isQRReferenceValid(reference) {
    reference = reference.replace(/ /g, "");
    if (!isQRReference(reference)) {
      return false;
    }
    const ref = reference.substring(0, 26);
    const checksum = reference.substring(26, 27);
    const calculatedChecksum = calculateQRReferenceChecksum(ref);
    return calculatedChecksum === checksum;
  }
  function calculateQRReferenceChecksum(reference) {
    return mod10(reference);
  }
  function formatQRReference(reference) {
    const trimmedReference = reference.replace(/ /g, "");
    const match = trimmedReference.substring(2).match(/.{1,5}/g);
    return match ? `${trimmedReference.substring(0, 2)} ${match.join(" ")}` : reference;
  }
  function formatSCORReference(reference) {
    var _a;
    const trimmedReference = reference.replace(/ /g, "");
    const match = trimmedReference.match(/.{1,4}/g);
    return (_a = match == null ? void 0 : match.join(" ")) != null ? _a : reference;
  }
  function formatReference(reference) {
    const referenceType = getReferenceType(reference);
    if (referenceType === "QRR") {
      return formatQRReference(reference);
    } else if (referenceType === "SCOR") {
      return formatSCORReference(reference);
    }
    return reference;
  }
  function formatAmount(amount) {
    const amountString = amount.toFixed(2);
    const amountArray = amountString.split(".");
    let formattedAmountWithoutDecimals = "";
    for (let x = amountArray[0].length - 1, i = 1; x >= 0; x--, i++) {
      formattedAmountWithoutDecimals = amountArray[0][x] + formattedAmountWithoutDecimals;
      if (i === 3) {
        formattedAmountWithoutDecimals = ` ${formattedAmountWithoutDecimals}`;
        i = 0;
      }
    }
    return `${formattedAmountWithoutDecimals.trim()}.${amountArray[1]}`;
  }
  function mm2pt(millimeters) {
    return millimeters * 2.83465;
  }
  function pt2mm(points) {
    return points / 2.83465;
  }
  function getReferenceType(reference) {
    if (typeof reference === "undefined") {
      return "NON";
    } else if (isQRReference(reference)) {
      return "QRR";
    } else {
      return "SCOR";
    }
  }
  function mod97(input) {
    const charCodeOfLetterA = "A".charCodeAt(0);
    const inputArr = input.split("");
    for (let i = 0; i < inputArr.length; i++) {
      const charCode = inputArr[i].charCodeAt(0);
      if (charCode >= charCodeOfLetterA) {
        inputArr[i] = `${charCode - charCodeOfLetterA + 10}`;
      }
    }
    input = inputArr.join("");
    let remainder = 0;
    for (let i = 0; i < input.length; i++) {
      const digit = +input[i];
      remainder = (10 * remainder + digit) % 97;
    }
    return remainder;
  }
  function mod10(input) {
    const trimmedInput = input.replace(/ /g, "");
    const table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
    let carry = 0;
    for (let i = 0; i < trimmedInput.length; i++) {
      carry = table[(carry + parseInt(trimmedInput.substring(i, i + 1), 10)) % 10];
    }
    return ((10 - carry) % 10).toString();
  }

  // node_modules/swissqrbill/lib/esm/shared/validator.js
  function validateData(data) {
    if (data.reference !== void 0) {
      if (typeof data.reference !== "string") {
        throw new ValidationError(ValidationErrors.REFERENCE_TYPE_IS_INVALID);
      }
    }
    if (data.message !== void 0) {
      if (typeof data.message !== "string") {
        throw new ValidationError(ValidationErrors.MESSAGE_TYPE_IS_INVALID);
      }
      if (data.message.length > 140) {
        throw new ValidationError(ValidationErrors.MESSAGE_LENGTH_IS_INVALID);
      }
    }
    if (data.additionalInformation !== void 0) {
      if (typeof data.additionalInformation !== "string") {
        throw new ValidationError(ValidationErrors.ADDITIONAL_INFORMATION_TYPE_IS_INVALID);
      }
      if (data.additionalInformation.length > 140) {
        throw new ValidationError(ValidationErrors.ADDITIONAL_INFORMATION_LENGTH_IS_INVALID);
      }
    }
    if (data.message !== void 0 && data.additionalInformation !== void 0) {
      if (data.additionalInformation.length + data.message.length > 140) {
        throw new ValidationError(ValidationErrors.MESSAGE_AND_ADDITIONAL_INFORMATION_LENGTH_IS_INVALID);
      }
    }
    if (data.av1 !== void 0) {
      if (typeof data.av1 !== "string") {
        throw new ValidationError(ValidationErrors.ALTERNATIVE_SCHEME_TYPE_IS_INVALID, { scheme: "AV1" });
      }
      if (data.av1.length > 100) {
        throw new ValidationError(ValidationErrors.ALTERNATIVE_SCHEME_LENGTH_IS_INVALID, { scheme: "AV1" });
      }
    }
    if (data.av2 !== void 0) {
      if (typeof data.av2 !== "string") {
        throw new ValidationError(ValidationErrors.ALTERNATIVE_SCHEME_TYPE_IS_INVALID, { scheme: "AV2" });
      }
      if (data.av2.length > 100) {
        throw new ValidationError(ValidationErrors.ALTERNATIVE_SCHEME_LENGTH_IS_INVALID, { scheme: "AV2" });
      }
    }
    if (data.creditor === void 0) {
      throw new ValidationError(ValidationErrors.CREDITOR_IS_UNDEFINED);
    }
    if (data.creditor.account === void 0) {
      throw new ValidationError(ValidationErrors.CREDITOR_ACCOUNT_IS_UNDEFINED);
    }
    if (!data.creditor.account.startsWith("CH") && !data.creditor.account.startsWith("LI")) {
      throw new ValidationError(ValidationErrors.CREDITOR_ACCOUNT_COUNTRY_IS_INVALID);
    }
    if (data.creditor.account.length !== 21) {
      throw new ValidationError(ValidationErrors.ACCOUNT_LENGTH_IS_INVALID, { iban: data.creditor.account });
    }
    if (data.creditor.name === void 0) {
      throw new ValidationError(ValidationErrors.CREDITOR_NAME_IS_UNDEFINED);
    }
    if (typeof data.creditor.name !== "string") {
      throw new ValidationError(ValidationErrors.CREDITOR_NAME_TYPE_IS_INVALID);
    }
    if (data.creditor.name.length > 70) {
      throw new ValidationError(ValidationErrors.CREDITOR_NAME_LENGTH_IS_INVALID);
    }
    if (data.creditor.address === void 0) {
      throw new ValidationError(ValidationErrors.CREDITOR_ADDRESS_IS_UNDEFINED);
    }
    if (typeof data.creditor.address !== "string") {
      throw new ValidationError(ValidationErrors.CREDITOR_ADDRESS_TYPE_IS_INVALID);
    }
    if (data.creditor.address.length > 70) {
      throw new ValidationError(ValidationErrors.CREDITOR_ADDRESS_LENGTH_IS_INVALID);
    }
    if (data.creditor.buildingNumber !== void 0) {
      if (typeof data.creditor.buildingNumber !== "string" && typeof data.creditor.buildingNumber !== "number") {
        throw new ValidationError(ValidationErrors.CREDITOR_BUILDING_NUMBER_TYPE_IS_INVALID);
      }
      if (data.creditor.buildingNumber.toString().length > 16) {
        throw new ValidationError(ValidationErrors.CREDITOR_BUILDING_NUMBER_LENGTH_IS_INVALID);
      }
    }
    if (data.creditor.zip === void 0) {
      throw new ValidationError(ValidationErrors.CREDITOR_ZIP_IS_UNDEFINED);
    }
    if (typeof data.creditor.zip !== "string" && typeof data.creditor.zip !== "number") {
      throw new ValidationError(ValidationErrors.CREDITOR_ZIP_TYPE_IS_INVALID);
    }
    if (data.creditor.zip.toString().length > 16) {
      throw new ValidationError(ValidationErrors.CREDITOR_ZIP_LENGTH_IS_INVALID);
    }
    if (data.creditor.city === void 0) {
      throw new ValidationError(ValidationErrors.CREDITOR_CITY_IS_UNDEFINED);
    }
    if (typeof data.creditor.city !== "string") {
      throw new ValidationError(ValidationErrors.CREDITOR_CITY_TYPE_IS_INVALID);
    }
    if (data.creditor.city.length > 35) {
      throw new ValidationError(ValidationErrors.CREDITOR_CITY_LENGTH_IS_INVALID);
    }
    if (data.creditor.country === void 0) {
      throw new ValidationError(ValidationErrors.CREDITOR_COUNTRY_IS_UNDEFINED);
    }
    if (typeof data.creditor.country !== "string") {
      throw new ValidationError(ValidationErrors.CREDITOR_COUNTRY_TYPE_IS_INVALID);
    }
    if (data.creditor.country.length !== 2) {
      throw new ValidationError(ValidationErrors.CREDITOR_COUNTRY_LENGTH_IS_INVALID);
    }
    if (data.amount !== void 0) {
      if (typeof data.amount !== "number") {
        throw new ValidationError(ValidationErrors.AMOUNT_TYPE_IS_INVALID);
      }
      if (data.amount.toFixed(2).toString().length > 12) {
        throw new ValidationError(ValidationErrors.AMOUNT_LENGTH_IS_INVALID);
      }
    }
    if (data.currency === void 0) {
      throw new ValidationError(ValidationErrors.CURRENCY_IS_UNDEFINED);
    }
    if (typeof data.currency !== "string") {
      throw new ValidationError(ValidationErrors.CURRENCY_TYPE_IS_INVALID);
    }
    if (data.currency.length !== 3) {
      throw new ValidationError(ValidationErrors.CURRENCY_LENGTH_IS_INVALID);
    }
    if (data.currency !== "CHF" && data.currency !== "EUR") {
      throw new ValidationError(ValidationErrors.CURRENCY_STRING_IS_INVALID);
    }
    if (data.debtor !== void 0) {
      if (data.debtor.name === void 0) {
        throw new ValidationError(ValidationErrors.DEBTOR_NAME_IS_UNDEFINED);
      }
      if (typeof data.debtor.name !== "string") {
        throw new ValidationError(ValidationErrors.DEBTOR_NAME_TYPE_IS_INVALID);
      }
      if (data.debtor.name.length > 70) {
        throw new ValidationError(ValidationErrors.DEBTOR_NAME_LENGTH_IS_INVALID);
      }
      if (data.debtor.address === void 0) {
        throw new ValidationError(ValidationErrors.DEBTOR_ADDRESS_IS_UNDEFINED);
      }
      if (typeof data.debtor.address !== "string") {
        throw new ValidationError(ValidationErrors.DEBTOR_ADDRESS_TYPE_IS_INVALID);
      }
      if (data.debtor.address.length > 70) {
        throw new ValidationError(ValidationErrors.DEBTOR_ADDRESS_LENGTH_IS_INVALID);
      }
      if (data.debtor.buildingNumber !== void 0) {
        if (typeof data.debtor.buildingNumber !== "string" && typeof data.debtor.buildingNumber !== "number") {
          throw new ValidationError(ValidationErrors.DEBTOR_BUILDING_NUMBER_TYPE_IS_INVALID);
        }
        if (data.debtor.buildingNumber.toString().length > 16) {
          throw new ValidationError(ValidationErrors.DEBTOR_BUILDING_NUMBER_LENGTH_IS_INVALID);
        }
      }
      if (data.debtor.zip === void 0) {
        throw new ValidationError(ValidationErrors.DEBTOR_ZIP_IS_UNDEFINED);
      }
      if (typeof data.debtor.zip !== "string" && typeof data.debtor.zip !== "number") {
        throw new ValidationError(ValidationErrors.DEBTOR_ZIP_TYPE_IS_INVALID);
      }
      if (data.debtor.zip.toString().length > 16) {
        throw new ValidationError(ValidationErrors.DEBTOR_ZIP_LENGTH_IS_INVALID);
      }
      if (data.debtor.city === void 0) {
        throw new ValidationError(ValidationErrors.DEBTOR_CITY_IS_UNDEFINED);
      }
      if (typeof data.debtor.city !== "string") {
        throw new ValidationError(ValidationErrors.DEBTOR_CITY_TYPE_IS_INVALID);
      }
      if (data.debtor.city.length > 35) {
        throw new ValidationError(ValidationErrors.DEBTOR_CITY_LENGTH_IS_INVALID);
      }
      if (data.debtor.country === void 0) {
        throw new ValidationError(ValidationErrors.DEBTOR_COUNTRY_IS_UNDEFINED);
      }
      if (typeof data.debtor.country !== "string") {
        throw new ValidationError(ValidationErrors.DEBTOR_COUNTRY_TYPE_IS_INVALID);
      }
      if (data.debtor.country.length !== 2) {
        throw new ValidationError(ValidationErrors.DEBTOR_COUNTRY_LENGTH_IS_INVALID);
      }
    }
    if (isIBANValid(data.creditor.account) === false) {
      throw new ValidationError(ValidationErrors.CREDITOR_ACCOUNT_IS_INVALID, { iban: data.creditor.account });
    }
    if (isQRIBAN(data.creditor.account)) {
      if (data.reference === void 0) {
        throw new ValidationError(ValidationErrors.ACCOUNT_IS_QR_IBAN_BUT_REFERENCE_IS_MISSING);
      }
      if (data.reference.length !== 27) {
        throw new ValidationError(ValidationErrors.QR_REFERENCE_LENGTH_IS_INVALID);
      }
      if (isQRReference(data.reference)) {
        if (!isQRReferenceValid(data.reference)) {
          throw new ValidationError(ValidationErrors.QR_REFERENCE_IS_INVALID, { reference: data.reference });
        }
      } else {
        throw new ValidationError(ValidationErrors.ACCOUNT_IS_QR_IBAN_BUT_REFERENCE_IS_REGULAR);
      }
    } else {
      if (data.reference !== void 0) {
        if (isQRReference(data.reference)) {
          throw new ValidationError(ValidationErrors.ACCOUNT_IS_REGULAR_IBAN_BUT_REFERENCE_IS_QR);
        }
        if (data.reference.length > 25) {
          throw new ValidationError(ValidationErrors.REGULAR_REFERENCE_LENGTH_IS_INVALID);
        }
      }
    }
  }

  // node_modules/swissqrbill/lib/esm/shared/qr-code.js
  function generateQRData(data) {
    var _a, _b, _c, _d, _e;
    const cleanedData = cleanData(data);
    validateData(cleanedData);
    const amount = (_a = cleanedData.amount) == null ? void 0 : _a.toFixed(2);
    const reference = getReferenceType(cleanedData.reference);
    const qrData = [
      "SPC",
      // Swiss Payments Code
      "0200",
      // Version
      "1",
      // Coding Type UTF-8
      (_b = cleanedData.creditor.account) != null ? _b : "",
      // IBAN
      "S",
      // Address Type
      cleanedData.creditor.name,
      // Name
      cleanedData.creditor.address,
      // Address
      cleanedData.creditor.buildingNumber ? `${cleanedData.creditor.buildingNumber}` : "",
      `${cleanedData.creditor.zip}`,
      // Zip
      cleanedData.creditor.city,
      // City
      cleanedData.creditor.country,
      // Country
      "",
      // 1x Empty
      "",
      // 2x Empty
      "",
      // 3x Empty
      "",
      // 4x Empty
      "",
      // 5x Empty
      "",
      // 6x Empty
      "",
      // 7x Empty
      amount != null ? amount : "",
      // Amount
      cleanedData.currency,
      // Currency
      ...cleanedData.debtor ? [
        "S",
        // Address Type
        cleanedData.debtor.name,
        // Name
        cleanedData.debtor.address,
        // Address
        cleanedData.debtor.buildingNumber ? `${cleanedData.debtor.buildingNumber}` : "",
        `${cleanedData.debtor.zip}`,
        // Zip
        cleanedData.debtor.city,
        // City
        (_c = cleanedData.debtor.country) != null ? _c : ""
        // Country
      ] : [
        "",
        // Empty address type
        "",
        // Empty name
        "",
        // Empty address
        "",
        // Empty building number
        "",
        // Empty zip field
        "",
        // Empty city field
        ""
        // Empty country
      ],
      reference,
      // Reference type
      (_d = cleanedData.reference) != null ? _d : "",
      // Reference
      (_e = cleanedData.message) != null ? _e : "",
      // Unstructured message
      "EPD",
      // End of payment data
      ...cleanedData.additionalInformation ? [
        cleanedData.additionalInformation
      ] : [],
      ...cleanedData.av1 ? [
        cleanedData.av1
      ] : [],
      ...cleanedData.av2 ? [
        cleanedData.av2
      ] : []
    ];
    return qrData.join("\n");
  }
  function renderQRCode(data, size, renderBlockFunction) {
    const qrData = generateQRData(data);
    const eci = qrcodegen.QrSegment.makeEci(26);
    const segments = qrcodegen.QrSegment.makeSegments(qrData);
    const qrCode = qrcodegen.QrCode.encodeSegments([eci, ...segments], qrcodegen.QrCode.Ecc.MEDIUM, 10, 25, -1, false);
    const blockSize = size / qrCode.size;
    for (let x = 0; x < qrCode.size; x++) {
      const xPos = x * blockSize;
      for (let y = 0; y < qrCode.size; y++) {
        const yPos = y * blockSize;
        if (qrCode.getModule(x, y)) {
          renderBlockFunction(xPos, yPos, blockSize);
        }
      }
    }
  }
  function renderSwissCross(size, renderRectFunction) {
    const scale = size / mm2pt(46);
    const swissCrossWhiteBackgroundSize = mm2pt(7) * scale;
    const swissCrossBlackBackgroundSize = mm2pt(6) * scale;
    const swissCrossThickness = mm2pt(1.17) * scale;
    const swissCrossLength = mm2pt(3.89) * scale;
    renderRectFunction(
      size / 2 - swissCrossWhiteBackgroundSize / 2,
      size / 2 - swissCrossWhiteBackgroundSize / 2,
      swissCrossWhiteBackgroundSize,
      swissCrossWhiteBackgroundSize,
      "white"
    );
    renderRectFunction(
      size / 2 - swissCrossBlackBackgroundSize / 2,
      size / 2 - swissCrossBlackBackgroundSize / 2,
      swissCrossBlackBackgroundSize,
      swissCrossBlackBackgroundSize,
      "black"
    );
    renderRectFunction(
      size / 2 - swissCrossLength / 2,
      size / 2 - swissCrossThickness / 2,
      swissCrossLength,
      swissCrossThickness,
      "white"
    );
    renderRectFunction(
      size / 2 - swissCrossThickness / 2,
      size / 2 - swissCrossLength / 2,
      swissCrossThickness,
      swissCrossLength,
      "white"
    );
  }

  // node_modules/swissqrbill/lib/esm/pdf/swissqrcode.js
  var SwissQRCode = class {
    /**
     * Creates a Swiss QR Code.
     *
     * @param data The data to be encoded in the QR code.
     * @param size The size of the QR code in mm.
     * @throws { ValidationError } Throws an error if the data is invalid.
     */
    constructor(data, size = 46) {
      this.size = mm2pt(size);
      this.data = cleanData(data);
      validateData(this.data);
    }
    /**
     * Attaches the Swiss QR Code to a PDF document.
     *
     * @param doc The PDF document to attach the Swiss QR Code to.
     * @param x The horizontal position in points where the Swiss QR Code will be placed.
     * @param y The vertical position in points where the Swiss QR Code will be placed.
     */
    attachTo(doc, x = ((_a) => (_a = doc.x) != null ? _a : 0)(), y = ((_b) => (_b = doc.y) != null ? _b : 0)()) {
      doc.save();
      doc.translate(x, y);
      renderQRCode(this.data, this.size, (xPos, yPos, blockSize) => {
        doc.rect(
          xPos,
          yPos,
          blockSize,
          blockSize
        );
      });
      doc.fillColor("black");
      doc.fill();
      renderSwissCross(this.size, (xPos, yPos, width, height, fillColor) => {
        doc.rect(
          xPos,
          yPos,
          width,
          height
        ).fillColor(fillColor).fill();
      });
      doc.restore();
    }
  };

  // node_modules/swissqrbill/lib/esm/shared/translations.js
  var translations = {
    DE: {
      acceptancePoint: "Annahmestelle",
      account: "Konto / Zahlbar an",
      additionalInformation: "Zus\xE4tzliche Informationen",
      amount: "Betrag",
      currency: "W\xE4hrung",
      inFavourOf: "Zugunsten",
      payableBy: "Zahlbar durch",
      payableByName: "Zahlbar durch (Name/Adresse)",
      paymentPart: "Zahlteil",
      receipt: "Empfangsschein",
      reference: "Referenz",
      separate: "Vor der Einzahlung abzutrennen"
    },
    EN: {
      acceptancePoint: "Acceptance point",
      account: "Account / Payable to",
      additionalInformation: "Additional information",
      amount: "Amount",
      currency: "Currency",
      inFavourOf: "In favour of",
      payableBy: "Payable by",
      payableByName: "Payable by (name/address)",
      paymentPart: "Payment part",
      receipt: "Receipt",
      reference: "Reference",
      separate: "Separate before paying in"
    },
    FR: {
      acceptancePoint: "Point de d\xE9p\xF4t",
      account: "Compte / Payable \xE0",
      additionalInformation: "Informations suppl\xE9mentaires",
      amount: "Montant",
      currency: "Monnaie",
      inFavourOf: "En faveur de",
      payableBy: "Payable par",
      payableByName: "Payable par (nom/adresse)",
      paymentPart: "Section paiement",
      receipt: "R\xE9c\xE9piss\xE9",
      reference: "R\xE9f\xE9rence",
      separate: "A d\xE9tacher avant le versement"
    },
    IT: {
      acceptancePoint: "Punto di accettazione",
      account: "Conto / Pagabile a",
      additionalInformation: "Informazioni supplementari",
      amount: "Importo",
      currency: "Valuta",
      inFavourOf: "A favore di",
      payableBy: "Pagabile da",
      payableByName: "Pagabile da (nome/indirizzo)",
      paymentPart: "Sezione pagamento",
      receipt: "Ricevuta",
      reference: "Riferimento",
      separate: "Da staccare prima del versamento"
    },
    RM: {
      acceptancePoint: "Post da recepziun",
      account: "Conto / Da pajar a",
      additionalInformation: "Infurmaziuns supplementaras",
      amount: "Import",
      currency: "Valuta",
      inFavourOf: "A favur da",
      payableBy: "Da pajar da",
      payableByName: "Da pajar da (num/adressa)",
      paymentPart: "Part da pajament",
      receipt: "Quittanza",
      reference: "Referenza",
      separate: "Da distatgar avant che pajar"
    }
  };

  // node_modules/swissqrbill/lib/esm/pdf/swissqrbill.js
  var __defProp2 = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp2 = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp2.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var _SwissQRBill = class _SwissQRBill2 {
    /**
     * Creates a new SwissQRBill instance.
     *
     * @param data The data to be used for the QR Bill.
     * @param options Options to define how the QR Bill should be rendered.
     * @throws { ValidationError } Throws an error if the data is invalid.
     */
    constructor(data, options) {
      this.scissors = true;
      this.separate = false;
      this.outlines = true;
      this.language = "DE";
      this.font = "Helvetica";
      this.renderAdditionalInformation = true;
      this._x = 0;
      this._y = 0;
      this.data = cleanData(data);
      validateData(this.data);
      this.language = (options == null ? void 0 : options.language) !== void 0 ? options.language : this.language;
      this.outlines = (options == null ? void 0 : options.outlines) !== void 0 ? options.outlines : this.outlines;
      this.font = (options == null ? void 0 : options.fontName) !== void 0 ? options.fontName : this.font;
      this.renderAdditionalInformation = (options == null ? void 0 : options.renderAdditionalInformation) !== void 0 ? options.renderAdditionalInformation : this.renderAdditionalInformation;
      if ((options == null ? void 0 : options.scissors) !== void 0) {
        this.scissors = options.scissors;
        this.separate = !options.scissors;
      }
      if ((options == null ? void 0 : options.separate) !== void 0) {
        this.separate = options.separate;
        this.scissors = !options.separate;
      }
      if ((options == null ? void 0 : options.scissors) === false && (options == null ? void 0 : options.separate) === false) {
        this.separate = false;
        this.scissors = false;
      }
    }
    /**
     * Attaches the QR-Bill to a PDFKit document instance. It will create a new page with the size of the QR-Slip if not
     * enough space is left on the current page.
     *
     * @param doc The PDFKit instance.
     * @param x The horizontal position in points where the QR Bill will be placed.
     * @param y The vertical position in points where the QR Bill will be placed.
     */
    attachTo(doc, x = 0, y = ((_a) => (_a = doc.page) == null ? void 0 : _a.height)() ? ((_b) => (_b = doc.page) == null ? void 0 : _b.height)() - mm2pt(105) : 0) {
      if (!_SwissQRBill2.isSpaceSufficient(doc, x, y)) {
        doc.addPage({
          margin: 0,
          size: [_SwissQRBill2.width, _SwissQRBill2.height]
        });
        x = 0;
        y = 0;
      }
      this._x = x;
      this._y = y;
      this.render(doc);
    }
    /**
     * Checks whether there is enough space on the current page to add the QR Bill.
     *
     * @param doc The PDFKit document instance.
     * @param x The horizontal position where the QR Bill will be placed.
     * @param y The vertical position where the QR Bill will be placed.
     * @returns `true` if there is enough space, otherwise `false`.
     */
    static isSpaceSufficient(doc, x = 0, y = ((_c) => (_c = doc.page) == null ? void 0 : _c.height)() ? ((_d) => (_d = doc.page) == null ? void 0 : _d.height)() - _SwissQRBill2.height : 0) {
      if (!doc.page) {
        return false;
      }
      return Math.round(x + _SwissQRBill2.width) <= Math.round(doc.page.width) && Math.round(doc.y + _SwissQRBill2.height) <= Math.round(doc.page.height) && Math.round(y + _SwissQRBill2.height) <= Math.round(doc.page.height);
    }
    x(millimeters = 0) {
      return this._x + mm2pt(millimeters);
    }
    y(millimeters = 0) {
      return this._y + mm2pt(millimeters);
    }
    render(doc) {
      if (this.outlines) {
        if (doc.page.height > mm2pt(105)) {
          doc.moveTo(this.x(), this.y()).lineTo(this.x(210), this.y()).lineWidth(0.75).strokeOpacity(1).dash(1, { size: 1 }).strokeColor("black").stroke();
        }
        doc.moveTo(this.x(62), this.y()).lineTo(this.x(62), this.y(105)).lineWidth(0.75).strokeOpacity(1).dash(1, { size: 1 }).strokeColor("black").stroke();
      }
      if (this.scissors) {
        const scissorsTop = "4.545 -1.803 m 4.06 -2.388 3.185 -2.368 2.531 -2.116 c -1.575 -0.577 l -2.769 -1.23 -3.949 -1.043 -3.949 -1.361 c -3.949 -1.61 -3.721 -1.555 -3.755 -2.203 c -3.788 -2.825 -4.437 -3.285 -5.05 -3.244 c -5.664 -3.248 -6.3 -2.777 -6.305 -2.129 c -6.351 -1.476 -5.801 -0.869 -5.152 -0.826 c -4.391 -0.713 -3.043 -1.174 -2.411 -0.041 c -2.882 0.828 -3.718 0.831 -4.474 0.787 c -5.101 0.751 -5.855 0.931 -6.154 1.547 c -6.443 2.138 -6.16 2.979 -5.496 3.16 c -4.826 3.406 -3.906 3.095 -3.746 2.325 c -3.623 1.731 -4.044 1.452 -3.882 1.236 c -3.76 1.073 -2.987 1.168 -1.608 0.549 c 2.838 2.117 l 3.4 2.273 4.087 2.268 4.584 1.716 c -0.026 -0.027 l 4.545 -1.803 l h -4.609 -2.753 m -3.962 -2.392 -4.015 -1.411 -4.687 -1.221 c -5.295 -1.009 -6.073 -1.6 -5.879 -2.26 c -5.765 -2.801 -5.052 -3 -4.609 -2.753 c h -4.581 1.256 m -3.906 1.505 -4.02 2.648 -4.707 2.802 c -5.163 2.96 -5.814 2.733 -5.86 2.196 c -5.949 1.543 -5.182 0.954 -4.581 1.256 c h";
        const scissorsCenter = " 1.803 4.545 m 2.388 4.06 2.368 3.185 2.116 2.531 c 0.577 -1.575 l 1.23 -2.769 1.043 -3.949 1.361 -3.949 c 1.61 -3.949 1.555 -3.721 2.203 -3.755 c 2.825 -3.788 3.285 -4.437 3.244 -5.05 c 3.248 -5.664 2.777 -6.3 2.129 -6.305 c 1.476 -6.351 0.869 -5.801 0.826 -5.152 c 0.713 -4.391 1.174 -3.043 0.041 -2.411 c -0.828 -2.882 -0.831 -3.718 -0.787 -4.474 c -0.751 -5.101 -0.931 -5.855 -1.547 -6.154 c -2.138 -6.443 -2.979 -6.16 -3.16 -5.496 c -3.406 -4.826 -3.095 -3.906 -2.325 -3.746 c -1.731 -3.623 -1.452 -4.044 -1.236 -3.882 c -1.073 -3.76 -1.168 -2.987 -0.549 -1.608 c -2.117 2.838 l -2.273 3.4 -2.268 4.087 -1.716 4.584 c 0.027 -0.026 l 1.803 4.545 l h 2.753 -4.609 m 2.392 -3.962 1.411 -4.015 1.221 -4.687 c 1.009 -5.295 1.6 -6.073 2.26 -5.879 c 2.801 -5.765 3 -5.052 2.753 -4.609 c h -1.256 -4.581 m -1.505 -3.906 -2.648 -4.02 -2.802 -4.707 c -2.96 -5.163 -2.733 -5.814 -2.196 -5.86 c -1.543 -5.949 -0.954 -5.182 -1.256 -4.581 c h";
        if (doc.page.height > mm2pt(105)) {
          doc.save();
          doc.translate(this.x(105), this.y());
          doc.addContent(scissorsTop).fillColor("black").fill();
          doc.restore();
        }
        doc.save();
        doc.translate(this.x(62), this.y() + 30);
        doc.addContent(scissorsCenter).fillColor("black").fill();
        doc.restore();
      }
      if (this.separate) {
        if (doc.page.height > mm2pt(105)) {
          doc.fontSize(11);
          doc.font(this.font);
          doc.text(translations[this.language].separate, 0, this.y() - 12, {
            align: "center",
            width: mm2pt(210)
          });
        }
      }
      doc.fontSize(11);
      doc.font(`${this.font}-Bold`);
      doc.text(translations[this.language].receipt, this.x(5), this.y(5), {
        align: "left",
        width: mm2pt(52)
      });
      doc.fontSize(6);
      doc.font(`${this.font}-Bold`);
      doc.text(translations[this.language].account, this.x(5), this.y(12), {
        lineGap: 1,
        width: mm2pt(52)
      });
      doc.fontSize(8);
      doc.font(this.font);
      doc.text(`${formatIBAN(this.data.creditor.account)}
${this.formatAddress(this.data.creditor)}`, {
        lineGap: -0.5,
        width: mm2pt(52)
      });
      doc.fontSize(9);
      doc.moveDown();
      if (this.data.reference !== void 0) {
        doc.fontSize(6);
        doc.font(`${this.font}-Bold`);
        doc.text(translations[this.language].reference, {
          lineGap: 1,
          width: mm2pt(52)
        });
        doc.fontSize(8);
        doc.font(this.font);
        doc.text(formatReference(this.data.reference), {
          lineGap: -0.5,
          width: mm2pt(52)
        });
        doc.fontSize(9);
        doc.moveDown();
      }
      if (this.data.debtor !== void 0) {
        doc.fontSize(6);
        doc.font(`${this.font}-Bold`);
        doc.text(translations[this.language].payableBy, {
          lineGap: 1,
          width: mm2pt(52)
        });
        doc.fontSize(8);
        doc.font(this.font);
        doc.text(this.formatAddress(this.data.debtor), {
          lineGap: -0.5,
          width: mm2pt(52)
        });
      } else {
        doc.fontSize(6);
        doc.font(`${this.font}-Bold`);
        doc.text(translations[this.language].payableByName, {
          lineGap: 1,
          width: mm2pt(52)
        });
        this.addRectangle(doc, 5, pt2mm(doc.y - this.y()), 52, 20);
      }
      doc.fontSize(6);
      doc.font(`${this.font}-Bold`);
      doc.text(translations[this.language].currency, this.x(5), this.y(68), {
        lineGap: 1,
        width: mm2pt(15)
      });
      const amountXPosition = this.data.amount === void 0 ? 18 : 27;
      doc.text(translations[this.language].amount, this.x(amountXPosition), this.y(68), {
        lineGap: 1,
        width: mm2pt(52 - amountXPosition)
      });
      doc.fontSize(8);
      doc.font(this.font);
      doc.text(this.data.currency, this.x(5), this.y(71), {
        lineGap: -0.5,
        width: mm2pt(15)
      });
      if (this.data.amount !== void 0) {
        doc.text(formatAmount(this.data.amount), this.x(amountXPosition), this.y(71), {
          lineGap: -0.5,
          width: mm2pt(52 - amountXPosition)
        });
      } else {
        this.addRectangle(doc, 27, 68, 30, 10);
      }
      doc.fontSize(6);
      doc.font(`${this.font}-Bold`);
      doc.text(translations[this.language].acceptancePoint, this.x(5), this.y(82), {
        align: "right",
        height: mm2pt(18),
        lineGap: 1,
        width: mm2pt(52)
      });
      doc.fontSize(11);
      doc.font(`${this.font}-Bold`);
      doc.text(translations[this.language].paymentPart, this.x(67), this.y(5), {
        align: "left",
        lineGap: 1,
        width: mm2pt(51)
      });
      const swissQRCode = new SwissQRCode(this.data);
      swissQRCode.attachTo(doc, this.x(67), this.y(17));
      doc.fontSize(8);
      doc.font(`${this.font}-Bold`);
      doc.text(translations[this.language].currency, this.x(67), this.y(68), {
        lineGap: 1,
        width: mm2pt(15)
      });
      doc.text(translations[this.language].amount, this.x(89), this.y(68), {
        width: mm2pt(29)
      });
      doc.fontSize(10);
      doc.font(this.font);
      doc.text(this.data.currency, this.x(67), this.y(72), {
        lineGap: -0.5,
        width: mm2pt(15)
      });
      if (this.data.amount !== void 0) {
        doc.text(formatAmount(this.data.amount), this.x(89), this.y(72), {
          lineGap: -0.5,
          width: mm2pt(29)
        });
      } else {
        this.addRectangle(doc, 78, 72, 40, 15);
      }
      if (this.data.av1 !== void 0) {
        const [scheme, data] = this.data.av1.split(/(\/.+)/);
        doc.fontSize(7);
        doc.font(`${this.font}-Bold`);
        doc.text(scheme, this.x(67), this.y(90), {
          continued: true,
          height: mm2pt(3),
          lineGap: 1,
          width: mm2pt(138)
        });
        doc.font(this.font);
        doc.text(this.data.av1.length > 90 ? `${data.substring(0, 87)}...` : data, {
          continued: false
        });
      }
      if (this.data.av2 !== void 0) {
        const [scheme, data] = this.data.av2.split(/(\/.+)/);
        doc.fontSize(7);
        doc.font(`${this.font}-Bold`);
        doc.text(scheme, this.x(67), this.y(93), {
          continued: true,
          height: mm2pt(3),
          lineGap: 1,
          width: mm2pt(138)
        });
        doc.font(this.font);
        doc.text(this.data.av2.length > 90 ? `${data.substring(0, 87)}...` : data, {
          lineGap: -0.5
        });
      }
      doc.fontSize(8);
      doc.font(`${this.font}-Bold`);
      doc.text(translations[this.language].account, this.x(118), this.y(5), {
        lineGap: 1,
        width: mm2pt(87)
      });
      doc.fontSize(10);
      doc.font(this.font);
      doc.text(`${formatIBAN(this.data.creditor.account)}
${this.formatAddress(this.data.creditor)}`, {
        lineGap: -0.75,
        width: mm2pt(87)
      });
      doc.fontSize(9);
      doc.moveDown();
      if (this.data.reference !== void 0) {
        doc.fontSize(8);
        doc.font(`${this.font}-Bold`);
        doc.text(translations[this.language].reference, {
          lineGap: 1,
          width: mm2pt(87)
        });
        doc.fontSize(10);
        doc.font(this.font);
        doc.text(formatReference(this.data.reference), {
          lineGap: -0.75,
          width: mm2pt(87)
        });
        doc.fontSize(9);
        doc.moveDown();
      }
      const shouldRenderAdditionalInformation = this.renderAdditionalInformation && this.data.additionalInformation !== void 0;
      const shouldRenderMessageSection = this.data.message !== void 0 || shouldRenderAdditionalInformation;
      if (shouldRenderMessageSection) {
        doc.fontSize(8);
        doc.font(`${this.font}-Bold`);
        doc.text(translations[this.language].additionalInformation, {
          lineGap: 1,
          width: mm2pt(87)
        });
        doc.fontSize(10);
        doc.font(this.font);
        const options = {
          lineGap: -0.75,
          width: mm2pt(87)
        };
        const singleLineHeight = doc.heightOfString("A", options);
        const referenceType = getReferenceType(this.data.reference);
        const maxLines = referenceType === "QRR" || referenceType === "SCOR" ? 3 : 4;
        const linesOfAdditionalInformation = shouldRenderAdditionalInformation && this.data.additionalInformation !== void 0 ? doc.heightOfString(this.data.additionalInformation, options) / singleLineHeight : 0;
        if (shouldRenderAdditionalInformation) {
          if (referenceType === "QRR" || referenceType === "SCOR") {
            if (this.data.message !== void 0) {
              doc.text(this.data.message, __spreadProps(__spreadValues({}, options), { ellipsis: true, height: singleLineHeight, lineBreak: false }));
            }
          } else {
            if (this.data.message !== void 0) {
              const maxLinesOfMessage = maxLines - linesOfAdditionalInformation;
              doc.text(this.data.message, __spreadProps(__spreadValues({}, options), { ellipsis: true, height: singleLineHeight * maxLinesOfMessage, lineBreak: true }));
            }
          }
          doc.text(this.data.additionalInformation, options);
        } else if (this.data.message !== void 0) {
          doc.text(this.data.message, __spreadProps(__spreadValues({}, options), { ellipsis: true, height: singleLineHeight * maxLines, lineBreak: true }));
        }
        doc.fontSize(9);
        doc.moveDown();
      }
      if (this.data.debtor !== void 0) {
        doc.fontSize(8);
        doc.font(`${this.font}-Bold`);
        doc.text(translations[this.language].payableBy, {
          lineGap: 1,
          width: mm2pt(87)
        });
        doc.fontSize(10);
        doc.font(this.font);
        doc.text(this.formatAddress(this.data.debtor), {
          lineGap: -0.75,
          width: mm2pt(87)
        });
      } else {
        doc.fontSize(8);
        doc.font(`${this.font}-Bold`);
        doc.text(translations[this.language].payableByName, {
          lineGap: 1,
          width: mm2pt(87)
        });
        this.addRectangle(doc, 118, pt2mm(doc.y - this.y()), 65, 25);
      }
    }
    formatAddress(data) {
      const countryPrefix = data.country !== "CH" ? `${data.country} - ` : "";
      if (data.buildingNumber !== void 0) {
        return `${data.name}
${data.address} ${data.buildingNumber}
${countryPrefix}${data.zip} ${data.city}`;
      }
      return `${data.name}
${data.address}
${countryPrefix}${data.zip} ${data.city}`;
    }
    addRectangle(doc, x, y, width, height) {
      const length = 3;
      doc.moveTo(this.x(x + length), this.y(y)).lineTo(this.x(x), this.y(y)).lineTo(this.x(x), this.y(y + length)).moveTo(this.x(x), this.y(y + height - length)).lineTo(this.x(x), this.y(y + height)).lineTo(this.x(x + length), this.y(y + height)).moveTo(this.x(x + width - length), this.y(y + height)).lineTo(this.x(x + width), this.y(y + height)).lineTo(this.x(x + width), this.y(y + height - length)).moveTo(this.x(x + width), this.y(y + length)).lineTo(this.x(x + width), this.y(y)).lineTo(this.x(x + width - length), this.y(y)).lineWidth(0.75).undash().strokeColor("black").stroke();
    }
  };
  _SwissQRBill.width = mm2pt(210);
  _SwissQRBill.height = mm2pt(105);
  var SwissQRBill = _SwissQRBill;
  return __toCommonJS(pdf_entry_exports);
})();
