import JsBarcode from 'jsbarcode';

export function generateBarcodeSvg(value: string, height = 35, width = 1.2, displayValue = false): string {
  try {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    JsBarcode(svg, value || '000000', {
      format: 'CODE128',
      height,
      width,
      margin: 2,
      displayValue,
      background: 'transparent',
      lineColor: '#000000',
    });
    return new XMLSerializer().serializeToString(svg);
  } catch (err) {
    console.warn('Barcode generation error:', err);
    return '';
  }
}
