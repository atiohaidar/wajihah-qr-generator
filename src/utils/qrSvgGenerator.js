import qrcode from 'qrcode-generator';
import { resolveLogo } from './logoData.js';

function utf16to8(str) {
  let out = '', i, c;
  const len = str.length;
  for (i = 0; i < len; i++) {
    c = str.charCodeAt(i);
    if (c >= 0x0001 && c <= 0x007F) {
      out += str.charAt(i);
    } else if (c > 0x07FF) {
      out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
      out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
      out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
    } else {
      out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
      out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
    }
  }
  return out;
}

function normalizeColor(color, fallback = '#000000') {
  if (!color) return fallback;
  const c = String(color).trim();
  if (c.toLowerCase() === 'transparent') return 'none';
  if (/^[0-9a-fA-F]{3,8}$/.test(c)) return '#' + c;
  return c;
}

function escapeXml(unsafe) {
  return String(unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function roundedRectPath(x, y, w, h, r) {
  const maxR = Math.min(w / 2, h / 2);
  const radius = Math.max(0, Math.min(maxR, r || 0));
  if (radius <= 0) {
    return `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;
  }
  return `M ${x + radius} ${y} ` +
         `L ${x + w - radius} ${y} ` +
         `Q ${x + w} ${y} ${x + w} ${y + radius} ` +
         `L ${x + w} ${y + h - radius} ` +
         `Q ${x + w} ${y + h} ${x + w - radius} ${y + h} ` +
         `L ${x + radius} ${y + h} ` +
         `Q ${x} ${y + h} ${x} ${y + h - radius} ` +
         `L ${x} ${y + radius} ` +
         `Q ${x} ${y} ${x + radius} ${y} Z`;
}

export function generateQrSvg(options = {}) {
  const {
    data = 'https://wajihah-qr-generator.pages.dev/',
    value = data,
    size = 350,
    quietZone = 10,
    ecLevel = 'H',
    fgColor = '#000000',
    bgColor = '#ffffff',
    qrStyle = 'squares',
    eyeRadius = 10,
    eyeColor = fgColor,
    logo = null,
    logoImage = logo,
    logoWidth = null,
    logoHeight = null,
    logoOpacity = 1,
    logoPadding = 0.1,
    logoPaddingStyle = 'circle',
    removeQrCodeBehindLogo = true,
    bottomText = '',
    label = bottomText,
    bottomTextColor = null,
    textColor = bottomTextColor,
  } = options;

  const validEcLevels = ['L', 'M', 'Q', 'H'];
  const safeEcLevel = validEcLevels.includes(String(ecLevel).toUpperCase())
    ? String(ecLevel).toUpperCase()
    : 'H';

  // Generate QR matrix
  const qr = qrcode(0, safeEcLevel);
  qr.addData(utf16to8(String(value || '')));
  qr.make();

  const length = qr.getModuleCount();
  const numSize = Number(size) || 350;
  const numQuietZone = Number(quietZone) >= 0 ? Number(quietZone) : 10;
  const canvasSize = numSize + 2 * numQuietZone;
  const cellSize = numSize / length;
  const offset = numQuietZone;

  // Resolve bottom text
  const cleanBottomText = String(bottomText || label || '').trim();
  const textFontSize = Math.max(14, Math.round(canvasSize * 0.046));
  const textPadding = cleanBottomText ? Math.round(textFontSize * 1.8) : 0;
  const totalCanvasHeight = canvasSize + textPadding;

  // Resolve Logo
  const resolvedLogo = resolveLogo(logoImage);
  const logoDataUri = resolvedLogo?.dataUri || (typeof logoImage === 'string' && (logoImage.startsWith('data:') || logoImage.startsWith('http') || logoImage.startsWith('/')) ? logoImage : null);

  const defaultLogoSize = numSize * 0.28;
  const dWidthLogo = Number(logoWidth) > 0 ? Number(logoWidth) : defaultLogoSize;
  const dHeightLogo = Number(logoHeight) > 0 ? Number(logoHeight) : dWidthLogo;
  const dxLogo = (numSize - dWidthLogo) / 2;
  const dyLogo = (numSize - dHeightLogo) / 2;

  const actualFg = normalizeColor(fgColor, '#000000');
  const actualBg = normalizeColor(bgColor, '#ffffff');
  const actualEyeColor = normalizeColor(eyeColor, actualFg);

  const positioningZones = [
    { row: 0, col: 0 },
    { row: 0, col: length - 7 },
    { row: length - 7, col: 0 },
  ];

  const isInPositioningZone = (row, col) => {
    return positioningZones.some(
      (z) => row >= z.row && row < z.row + 7 && col >= z.col && col < z.col + 7
    );
  };

  const isBehindLogo = (row, col) => {
    if (!removeQrCodeBehindLogo || !logoDataUri) return false;
    const absolute_dxLogo = dxLogo + offset;
    const absolute_dyLogo = dyLogo + offset;
    const cellLeft = Math.round(col * cellSize) + offset;
    const cellTop = Math.round(row * cellSize) + offset;
    const w = Math.ceil((col + 1) * cellSize) - Math.floor(col * cellSize);
    const h = Math.ceil((row + 1) * cellSize) - Math.floor(row * cellSize);
    const cellRight = cellLeft + w;
    const cellBottom = cellTop + h;

    const paddingPx = Number(logoPadding) <= 1 && Number(logoPadding) > 0
      ? Number(logoPadding) * Math.max(dWidthLogo, dHeightLogo)
      : (Number(logoPadding) || 4);

    if (logoPaddingStyle === 'circle') {
      const logoCenterX = absolute_dxLogo + dWidthLogo / 2;
      const logoCenterY = absolute_dyLogo + dHeightLogo / 2;
      const circleRadius = Math.max(dWidthLogo, dHeightLogo) / 2 + paddingPx;
      const closestX = Math.max(cellLeft, Math.min(logoCenterX, cellRight));
      const closestY = Math.max(cellTop, Math.min(logoCenterY, cellBottom));
      const distanceX = logoCenterX - closestX;
      const distanceY = logoCenterY - closestY;
      return distanceX * distanceX + distanceY * distanceY < circleRadius * circleRadius;
    } else {
      const logoLeft = absolute_dxLogo - paddingPx;
      const logoRight = absolute_dxLogo + dWidthLogo + paddingPx;
      const logoTop = absolute_dyLogo - paddingPx;
      const logoBottom = absolute_dyLogo + dHeightLogo + paddingPx;
      return cellLeft < logoRight && cellRight > logoLeft && cellTop < logoBottom && cellBottom > logoTop;
    }
  };

  // Generate SVG elements
  let svgContent = '';

  // 1. Background
  if (actualBg !== 'none') {
    svgContent += `<rect width="${canvasSize}" height="${totalCanvasHeight}" fill="${actualBg}" />\n`;
  }

  // 2. Modules
  let modulesSvg = '';
  const radius = cellSize / 2;

  for (let row = 0; row < length; row++) {
    for (let col = 0; col < length; col++) {
      if (qr.isDark(row, col) && !isInPositioningZone(row, col) && !isBehindLogo(row, col)) {
        const x = Math.round(col * cellSize) + offset;
        const y = Math.round(row * cellSize) + offset;
        const w = Math.ceil((col + 1) * cellSize) - Math.floor(col * cellSize);
        const h = Math.ceil((row + 1) * cellSize) - Math.floor(row * cellSize);

        if (qrStyle === 'dots') {
          const cx = (x + radius).toFixed(2);
          const cy = (y + radius).toFixed(2);
          const r = ((radius / 100) * 80).toFixed(2);
          modulesSvg += `<circle cx="${cx}" cy="${cy}" r="${r}" />\n`;
        } else if (qrStyle === 'fluid') {
          modulesSvg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${(cellSize * 0.35).toFixed(2)}" />\n`;
        } else {
          modulesSvg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" />\n`;
        }
      }
    }
  }

  if (modulesSvg) {
    svgContent += `<g fill="${actualFg}">\n${modulesSvg}</g>\n`;
  }

  // 3. Finder Pattern Eyes (Positioning zones)
  const numEyeRadius = Number(eyeRadius) || 0;
  positioningZones.forEach((zone) => {
    const eyeX = zone.col * cellSize + offset;
    const eyeY = zone.row * cellSize + offset;
    const eyeSize = cellSize * 7;
    const innerOffset = cellSize;
    const innerSize = cellSize * 5;
    const centerOffset = cellSize * 2;
    const centerSize = cellSize * 3;

    const rOuter = Math.min(numEyeRadius, eyeSize / 2);
    const rInner = Math.max(0, rOuter - cellSize);
    const rCenter = Math.max(0, rOuter - cellSize * 1.5);

    const outerPath = roundedRectPath(eyeX, eyeY, eyeSize, eyeSize, rOuter);
    const innerCutout = roundedRectPath(eyeX + innerOffset, eyeY + innerOffset, innerSize, innerSize, rInner);
    
    svgContent += `<path d="${outerPath} ${innerCutout}" fill="${actualEyeColor}" fill-rule="evenodd" />\n`;

    const centerPath = roundedRectPath(eyeX + centerOffset, eyeY + centerOffset, centerSize, centerSize, rCenter);
    svgContent += `<path d="${centerPath}" fill="${actualEyeColor}" />\n`;
  });

  // 4. Logo in Center
  if (logoDataUri) {
    const logoX = (dxLogo + offset).toFixed(2);
    const logoY = (dyLogo + offset).toFixed(2);
    const w = dWidthLogo.toFixed(2);
    const h = dHeightLogo.toFixed(2);
    const op = Number(logoOpacity) || 1;

    svgContent += `<image href="${logoDataUri}" x="${logoX}" y="${logoY}" width="${w}" height="${h}" opacity="${op}" preserveAspectRatio="xMidYMid meet" />\n`;
  }

  // 5. Bottom Text Label (if specified)
  if (cleanBottomText) {
    const actualTextColor = normalizeColor(bottomTextColor || textColor || actualFg, actualFg);
    const textY = (canvasSize + (textPadding * 0.58)).toFixed(2);
    svgContent += `<text x="${(canvasSize / 2).toFixed(2)}" y="${textY}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="700" font-size="${textFontSize}" fill="${actualTextColor}" letter-spacing="0.5">${escapeXml(cleanBottomText)}</text>\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasSize} ${totalCanvasHeight}" width="${canvasSize}" height="${totalCanvasHeight}">
${svgContent}
</svg>`;
}
