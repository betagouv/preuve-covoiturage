import { QRErrorCorrectLevel } from './QRErrorCorrectLevel';

import { QRCodeLimitLength } from './QRCodeLimitLength';

import { QRCodeModel } from './QRCodeModel';

function QRCode(options) {
  const instance = this;

  //Default options
  this.options = {
    padding: 4,
    width: 256,
    height: 256,
    typeNumber: 4,
    color: '#000000',
    background: '#ffffff',
    ecl: 'M',
  };

  //In case the options is string
  if (typeof options === 'string') {
    options = {
      content: options,
    };
  }

  //Merge options
  if (options) {
    for (const i in options) {
      this.options[i] = options[i];
    }
  }

  if (typeof this.options.content !== 'string') {
    throw new Error("Expected 'content' as string!");
  }

  if (this.options.content.length === 0 /* || this.options.content.length > 7089 */) {
    throw new Error("Expected 'content' to be non-empty!");
  }

  if (!(this.options.padding >= 0)) {
    throw new Error("Expected 'padding' value to be non-negative!");
  }

  if (!(this.options.width > 0) || !(this.options.height > 0)) {
    throw new Error("Expected 'width' or 'height' value to be higher than zero!");
  }

  //Gets the error correction level
  function _getErrorCorrectLevel(ecl) {
    switch (ecl) {
      case 'L':
        return QRErrorCorrectLevel.L;

      case 'M':
        return QRErrorCorrectLevel.M;

      case 'Q':
        return QRErrorCorrectLevel.Q;

      case 'H':
        return QRErrorCorrectLevel.H;

      default:
        throw new Error('Unknwon error correction level: ' + ecl);
    }
  }

  //Get type number
  function _getTypeNumber(content, ecl) {
    const length = _getUTF8Length(content);

    let type = 1;
    let limit = 0;
    for (let i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
      const table = QRCodeLimitLength[i];
      if (!table) {
        throw new Error('Content too long: expected ' + limit + ' but got ' + length);
      }

      switch (ecl) {
        case 'L':
          limit = table[0];
          break;

        case 'M':
          limit = table[1];
          break;

        case 'Q':
          limit = table[2];
          break;

        case 'H':
          limit = table[3];
          break;

        default:
          throw new Error('Unknwon error correction level: ' + ecl);
      }

      if (length <= limit) {
        break;
      }

      type++;
    }

    if (type > QRCodeLimitLength.length) {
      throw new Error('Content too long');
    }

    return type;
  }

  //Gets text length
  function _getUTF8Length(content) {
    const result = encodeURI(content)
      .toString()
      .replace(/\%[0-9a-fA-F]{2}/g, 'a');
    return result.length + (result.length != content ? 3 : 0);
  }

  //Generate QR Code matrix
  const content = this.options.content;
  const type = _getTypeNumber(content, this.options.ecl);
  const ecl = _getErrorCorrectLevel(this.options.ecl);
  this.qrcode = new QRCodeModel(type, ecl);
  this.qrcode.addData(content);
  this.qrcode.make();
}

/** Generates QR Code as SVG image */
QRCode.prototype.svg = function(opt) {
  const options = this.options || {};
  const modules = this.qrcode.modules;

  if (typeof opt == 'undefined') {
    opt = { container: options.container || 'svg' };
  }

  //Apply new lines and indents in SVG?
  const pretty = typeof options.pretty != 'undefined' ? !!options.pretty : true;

  const indent = pretty ? '  ' : '';
  const EOL = pretty ? '\r\n' : '';
  const width = options.width;
  const height = options.height;
  const length = modules.length;
  const xsize = width / (length + 2 * options.padding);
  const ysize = height / (length + 2 * options.padding);

  //Join (union, merge) rectangles into one shape?
  const join = typeof options.join != 'undefined' ? !!options.join : false;

  //Swap the X and Y modules, pull request #2
  const swap = typeof options.swap != 'undefined' ? !!options.swap : false;

  //Apply <?xml...?> declaration in SVG?
  const xmlDeclaration = typeof options.xmlDeclaration != 'undefined' ? !!options.xmlDeclaration : true;

  //Populate with predefined shape instead of "rect" elements, thanks to @kkocdko
  const predefined = typeof options.predefined != 'undefined' ? !!options.predefined : false;
  const defs = predefined
    ? indent +
      '<defs><path id="qrmodule" d="M0 0 h' +
      ysize +
      ' v' +
      xsize +
      ' H0 z" style="fill:' +
      options.color +
      ';shape-rendering:crispEdges;" /></defs>' +
      EOL
    : '';

  //Background rectangle
  const bgrect =
    indent +
    '<rect x="0" y="0" width="' +
    width +
    '" height="' +
    height +
    '" style="fill:' +
    options.background +
    ';shape-rendering:crispEdges;"/>' +
    EOL;

  //Rectangles representing modules
  let modrect = '';
  let pathdata = '';

  for (let y = 0; y < length; y++) {
    for (let x = 0; x < length; x++) {
      const module = modules[x][y];
      if (module) {
        let px = x * xsize + options.padding * xsize;
        let py = y * ysize + options.padding * ysize;

        //Some users have had issues with the QR Code, thanks to @danioso for the solution
        if (swap) {
          const t = px;
          px = py;
          py = t;
        }

        if (join) {
          //Module as a part of svg path data, thanks to @danioso
          let w = xsize + px;
          let h = ysize + py;

          px = (Number.isInteger(px) ? Number(px) : px.toFixed(2)) as number;
          py = (Number.isInteger(py) ? Number(py) : py.toFixed(2)) as number;
          w = (Number.isInteger(w) ? Number(w) : w.toFixed(2)) as number;
          h = (Number.isInteger(h) ? Number(h) : h.toFixed(2)) as number;

          pathdata += 'M' + px + ',' + py + ' V' + h + ' H' + w + ' V' + py + ' H' + px + ' Z ';
        } else if (predefined) {
          //Module as a predefined shape, thanks to @kkocdko
          modrect += indent + '<use x="' + px.toString() + '" y="' + py.toString() + '" href="#qrmodule" />' + EOL;
        } else {
          //Module as rectangle element
          modrect +=
            indent +
            '<rect x="' +
            px.toString() +
            '" y="' +
            py.toString() +
            '" width="' +
            xsize +
            '" height="' +
            ysize +
            '" style="fill:' +
            options.color +
            ';shape-rendering:crispEdges;"/>' +
            EOL;
        }
      }
    }
  }

  if (join) {
    modrect =
      indent +
      '<path x="0" y="0" style="fill:' +
      options.color +
      ';shape-rendering:crispEdges;" d="' +
      pathdata +
      '" />';
  }

  let svg = '';
  switch (opt.container) {
    //Wrapped in SVG document
    case 'svg':
      if (xmlDeclaration) {
        svg += '<?xml version="1.0" standalone="yes"?>' + EOL;
      }
      svg +=
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '">' + EOL;
      svg += defs + bgrect + modrect;
      svg += '</svg>';
      break;

    //Viewbox for responsive use in a browser, thanks to @danioso
    case 'svg-viewbox':
      if (xmlDeclaration) {
        svg += '<?xml version="1.0" standalone="yes"?>' + EOL;
      }
      svg += '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ' + width + ' ' + height + '">' + EOL;
      svg += defs + bgrect + modrect;
      svg += '</svg>';
      break;

    //Wrapped in group element
    case 'g':
      svg += '<g width="' + width + '" height="' + height + '">' + EOL;
      svg += defs + bgrect + modrect;
      svg += '</g>';
      break;

    //Without a container
    default:
      svg += (defs + bgrect + modrect).replace(/^\s+/, ''); //Clear indents on each line
      break;
  }

  return svg;
};

export { QRCode };
