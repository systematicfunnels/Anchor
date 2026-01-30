// @ts-ignore
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js';

export const generateQuotePDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  const opt = {
    margin: 0,
    filename: `${filename}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('PDF Generation Error:', error);
  }
};
