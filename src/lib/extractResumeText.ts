export async function extractFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) =>
        'str' in item ? item.str : ''
      )
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText.trim();
}

export async function extractFromWord(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  // @ts-ignore
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

export async function extractResumeText(file: File): Promise<string> {
  if (file.name.endsWith('.pdf')) {
    return extractFromPDF(file);
  } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
    return extractFromWord(file);
  }
  throw new Error('Unsupported file format. Please upload PDF or Word.');
}
