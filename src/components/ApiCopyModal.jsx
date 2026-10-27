import React, { useState, useMemo } from 'react';

const ApiCopyModal = ({
  isOpen,
  onClose,
  value,
  size,
  fgColor,
  bgColor,
  ecLevel,
  quietZone,
  logoImage,
  logoWidth,
  logoHeight,
  logoOpacity,
  logoPadding,
  logoPaddingStyle,
  removeQrCodeBehindLogo,
  qrStyle,
  eyeRadius,
  eyeColor,
  bottomText,
  bottomTextColor,
  logoPlacement = 'center',
  captionLogoSize = 32,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [testData, setTestData] = useState('https://wajihah-qr-generator.pages.dev/');

  // Normalize logo name
  const cleanLogo = useMemo(() => {
    if (!logoImage) return '';
    const clean = String(logoImage).trim();
    if (clean.includes('/')) {
      return clean.split('/').pop().replace('.png', '').replace(/\s+/g, '-').toLowerCase();
    }
    return clean.toLowerCase();
  }, [logoImage]);

  const formatColorParam = (c) => {
    if (!c) return '';
    const s = String(c).trim();
    if (s.toLowerCase() === 'transparent') return 'transparent';
    return s.startsWith('#') ? s.substring(1) : s;
  };

  // Base Host (Current origin or default pages.dev)
  const baseHost = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
    ? window.location.origin
    : 'https://wajihah-qr-generator.pages.dev';

  // Build query parameters
  const queryParams = useMemo(() => {
    const params = [];
    if (size && size !== 350) params.push(`size=${size}`);
    if (fgColor && fgColor !== '#000000') params.push(`fg=${formatColorParam(fgColor)}`);
    if (bgColor && bgColor !== '#ffffff') params.push(`bg=${formatColorParam(bgColor)}`);
    if (eyeColor && eyeColor !== fgColor) params.push(`eyeColor=${formatColorParam(eyeColor)}`);
    if (cleanLogo) params.push(`logo=${encodeURIComponent(cleanLogo)}`);
    if (logoPlacement && logoPlacement !== 'center') params.push(`logoPlacement=${logoPlacement}`);
    if (logoPlacement === 'bottom' && captionLogoSize) params.push(`captionLogoSize=${captionLogoSize}`);
    if (qrStyle && qrStyle !== 'squares') params.push(`style=${qrStyle}`);
    if (eyeRadius !== undefined && eyeRadius !== null && eyeRadius !== '') params.push(`eyeRadius=${eyeRadius}`);
    if (ecLevel && ecLevel !== 'H') params.push(`ecLevel=${ecLevel}`);
    if (quietZone && quietZone !== 10) params.push(`quietZone=${quietZone}`);
    if (logoPlacement !== 'bottom') {
      if (logoWidth && logoWidth !== 128) params.push(`logoWidth=${logoWidth}`);
      if (logoHeight && logoHeight !== 128) params.push(`logoHeight=${logoHeight}`);
    }
    if (bottomText && bottomText.trim()) params.push(`bottomText=${encodeURIComponent(bottomText.trim())}`);
    if (bottomTextColor && bottomTextColor !== fgColor) params.push(`textColor=${formatColorParam(bottomTextColor)}`);
    if (!removeQrCodeBehindLogo) params.push(`removeBehindLogo=false`);

    return params.join('&');
  }, [
    size, fgColor, bgColor, eyeColor, cleanLogo, logoPlacement, captionLogoSize, qrStyle, eyeRadius,
    ecLevel, quietZone, logoWidth, logoHeight, bottomText, bottomTextColor, removeQrCodeBehindLogo
  ]);

  // Base API URL ending with data=
  const baseApiUrl = useMemo(() => {
    const prefix = queryParams ? `${queryParams}&data=` : 'data=';
    return `${baseHost}/api/qr?${prefix}`;
  }, [baseHost, queryParams]);

  const fullSampleUrl = useMemo(() => {
    return `${baseApiUrl}${encodeURIComponent(testData || 'https://domain-kamu.com')}`;
  }, [baseApiUrl, testData]);

  const handleCopyApi = () => {
    navigator.clipboard.writeText(baseApiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeExample = `// Contoh penggunaan di website lain:
const QR_API = "${baseApiUrl}";

// Cukup gabungkan dengan data dinamis kamu:
const linkInvoice = "https://website-kamu.com/invoice/123";
const qrUrl = QR_API + encodeURIComponent(linkInvoice);

// Pasang langsung di tag gambar:
<img src={qrUrl} alt="QR Code" width="${size || 350}" height="${size || 350}" />`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(codeExample);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.35)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: '28px 24px',
        maxWidth: 580,
        width: '95%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: 24,
            color: '#aaa',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
          }}
          aria-label="Tutup"
        >
          ×
        </button>

        <h3 style={{ margin: 0, marginBottom: 8, color: '#222', fontSize: 18, fontWeight: 600 }}>
          Salin URL API QR Code
        </h3>
        <p style={{ margin: 0, marginBottom: 18, fontSize: 14, color: '#666', lineHeight: 1.5 }}>
          Gunakan URL ini di website lain untuk generate QR secara otomatis dengan semua settingan dan tulisan yang sudah kamu buat.
        </p>

        {/* URL Box */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>
            URL API (Data di paling akhir: <span style={{ color: '#27ae60' }}>&data=</span>)
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              readOnly
              value={baseApiUrl}
              onClick={(e) => e.target.select()}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #ddd',
                fontSize: 13,
                background: '#f8f9fa',
                color: '#333',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleCopyApi}
              style={{
                padding: '10px 18px',
                background: copied ? '#27ae60' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: 14,
                whiteSpace: 'nowrap',
                transition: 'background 0.2s ease',
              }}
            >
              {copied ? 'Tersalin!' : 'Salin API'}
            </button>
          </div>
        </div>

        {/* Live Test */}
        <div style={{
          marginBottom: 18,
          background: '#f8f9fa',
          border: '1px solid #eee',
          borderRadius: 8,
          padding: 14,
        }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>
            Coba Masukkan Data:
          </label>
          <input
            type="text"
            value={testData}
            onChange={(e) => setTestData(e.target.value)}
            placeholder="Masukkan teks atau URL..."
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 6,
              border: '1px solid #ddd',
              fontSize: 13,
              boxSizing: 'border-box',
              background: '#fff',
            }}
          />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <small style={{ color: '#777', fontSize: 12 }}>
              Hasil gabungan langsung bisa dipakai sebagai gambar.
            </small>
            <a
              href={fullSampleUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 13,
                color: '#3498db',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Buka Gambar di Tab Baru →
            </a>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444' }}>
              Contoh Pemasangan di Kode:
            </label>
            <button
              type="button"
              onClick={handleCopySnippet}
              style={{
                background: 'none',
                border: 'none',
                color: copiedSnippet ? '#27ae60' : '#3498db',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {copiedSnippet ? 'Tersalin!' : 'Salin Contoh Kode'}
            </button>
          </div>
          <pre style={{
            margin: 0,
            padding: 12,
            background: '#f8f9fa',
            border: '1px solid #eee',
            borderRadius: 8,
            fontSize: 12,
            color: '#333',
            fontFamily: 'monospace',
            lineHeight: 1.5,
            overflowX: 'auto',
          }}>
            {codeExample}
          </pre>
        </div>

        {/* Action button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 11, color: '#95a5a6' }}>
            QR Code is a registered trademark of DENSO WAVE INCORPORATED.
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              background: '#f1f3f5',
              color: '#495057',
              border: '1px solid #dee2e6',
              borderRadius: 8,
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

export default ApiCopyModal;
