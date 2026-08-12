import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportDocumentToPdf(
  elementId = 'rsa-document-canvas',
  filename = 'RSA_Refugee_Status_BI-1693.pdf'
) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Document canvas element not found');
  }

  // Save original inline styles to restore after capture
  const originalTransform = element.style.transform;
  const originalTransformOrigin = element.style.transformOrigin;
  const originalBoxShadow = element.style.boxShadow;
  const originalMargin = element.style.margin;

  // Add exporting class to turn off drop shadows, rings, and badges in CSS
  element.classList.add('pdf-exporting');

  // Explicitly hide all selection badges, handles, and drag UI elements
  const hideElements = element.querySelectorAll<HTMLElement>(
    '.selection-badge, .pdf-hide, [data-pdf-hide="true"], .cursor-nwse-resize'
  );
  hideElements.forEach((el) => {
    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('visibility', 'hidden', 'important');
    el.style.setProperty('opacity', '0', 'important');
  });

  // Temporarily reset transform, shadow, and margins for pristine 1:1 A4 capturing
  element.style.transform = 'none';
  element.style.transformOrigin = 'top left';
  element.style.boxShadow = 'none';
  element.style.margin = '0';

  let imgData: string | null = null;

  try {
    // Primary Exporter: html-to-image with strict 794x1123 canvas bounds
    imgData = await toPng(element, {
      quality: 1.0,
      pixelRatio: 3.0,
      width: 794,
      height: 1123,
      canvasWidth: 794 * 3.0,
      canvasHeight: 1123 * 3.0,
      cacheBust: true,
      style: {
        transform: 'none',
        transformOrigin: 'top left',
        boxShadow: 'none',
        margin: '0',
      },
      filter: (node) => {
        if (node instanceof HTMLElement) {
          if (
            node.classList.contains('cursor-nwse-resize') ||
            node.classList.contains('selection-badge') ||
            node.classList.contains('pdf-hide') ||
            node.getAttribute('data-pdf-hide') === 'true'
          ) {
            return false;
          }
        }
        return true;
      },
    });
  } catch (primaryErr) {
    console.warn('Primary html-to-image renderer warning, attempting fallback:', primaryErr);

    // Fallback Exporter: html2canvas
    try {
      const canvas = await html2canvas(element, {
        scale: 3.0,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
      });
      imgData = canvas.toDataURL('image/png', 1.0);
    } catch (fallbackErr) {
      console.error('Fallback renderer failed:', fallbackErr);
      throw fallbackErr;
    }
  } finally {
    // Restore original class & styles
    element.classList.remove('pdf-exporting');
    element.style.transform = originalTransform;
    element.style.transformOrigin = originalTransformOrigin;
    element.style.boxShadow = originalBoxShadow;
    element.style.margin = originalMargin;

    // Restore hidden UI elements
    hideElements.forEach((el) => {
      el.style.display = '';
      el.style.visibility = '';
      el.style.opacity = '';
    });
  }

  if (!imgData) {
    throw new Error('Failed to generate document image snapshot.');
  }

  // Generate A4 PDF with jsPDF (A4 standard = 210mm x 297mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // Fit image precisely to the exact 210mm x 297mm page without any offset
  pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
  pdf.save(filename);
}
