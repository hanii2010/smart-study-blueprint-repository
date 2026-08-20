import type * as PdfjsLib from 'pdfjs-dist';

export interface ExtractedPdf {
  text: string;
  pageCount: number;
}

let pdfjsModule: typeof PdfjsLib | null = null;

async function getPdfjs(): Promise<typeof PdfjsLib> {
  if (pdfjsModule) return pdfjsModule;
  pdfjsModule = await import('pdfjs-dist');
  const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url);
  pdfjsModule.GlobalWorkerOptions.workerSrc = workerUrl.href;
  return pdfjsModule;
}

export async function extractPdfText(file: File): Promise<ExtractedPdf> {
  const pdfjsLib = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = pdf.numPages;
  const textParts: string[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    textParts.push(pageText);
  }

  await pdf.destroy();

  return {
    text: textParts.join('\n\n'),
    pageCount,
  };
}
