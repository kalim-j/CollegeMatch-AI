import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  BorderStyle, AlignmentType,
} from 'docx';
import { saveAs } from 'file-saver';
import { ResumeData } from './resumeTemplates';

export async function downloadAsPDF(
  previewElementId: string,
  fileName: string
): Promise<void> {
  const element = document.getElementById(previewElementId);
  if (!element) throw new Error('Preview element not found');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  } else {
    let position = 0;
    let remainingHeight = imgHeight;
    while (remainingHeight > 0) {
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      remainingHeight -= pageHeight;
      position -= pageHeight;
      if (remainingHeight > 0) pdf.addPage();
    }
  }

  pdf.save(`${fileName}.pdf`);
}

export async function downloadAsWord(
  data: ResumeData,
  fileName: string
): Promise<void> {
  const sections: Paragraph[] = [];

  // Name heading
  sections.push(new Paragraph({
    children: [new TextRun({
      text: data.personal.fullName || 'Your Name',
      bold: true, size: 32, color: '534AB7',
    })],
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
  }));

  // Contact line
  const contactParts = [
    data.personal.email,
    data.personal.phone,
    data.personal.location,
    data.personal.linkedin,
  ].filter(Boolean);

  if (contactParts.length > 0) {
    sections.push(new Paragraph({
      children: [new TextRun({
        text: contactParts.join(' | '),
        size: 18, color: '666666',
      })],
      alignment: AlignmentType.CENTER,
    }));
  }

  // Blank line
  sections.push(new Paragraph({ text: '' }));

  // Helper: section heading
  const sectionHeading = (title: string) =>
    new Paragraph({
      children: [new TextRun({
        text: title.toUpperCase(),
        bold: true, size: 20,
        color: '534AB7',
      })],
      border: {
        bottom: {
          color: '534AB7',
          size: 6,
          space: 1,
          style: BorderStyle.SINGLE,
        },
      },
      spacing: { before: 200, after: 100 },
    });

  // Objective
  if (data.objective) {
    sections.push(sectionHeading('Objective'));
    sections.push(new Paragraph({
      children: [new TextRun({ text: data.objective, size: 18 })],
      spacing: { after: 100 },
    }));
  }

  // Education
  if (data.education?.length > 0) {
    sections.push(sectionHeading('Education'));
    data.education.forEach(edu => {
      if (!edu.institution) return;
      sections.push(new Paragraph({
        children: [
          new TextRun({ text: edu.institution, bold: true, size: 20 }),
          new TextRun({ text: `  ${edu.year}`, size: 18, color: '666666' }),
        ],
      }));
      sections.push(new Paragraph({
        children: [new TextRun({
          text: `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}${edu.cgpa ? ` | CGPA: ${edu.cgpa}` : ''}`,
          size: 18,
        })],
        spacing: { after: 100 },
      }));
    });
  }

  // Experience
  const validExp = data.experience?.filter(e => e.company) || [];
  if (validExp.length > 0) {
    sections.push(sectionHeading('Experience'));
    validExp.forEach(exp => {
      sections.push(new Paragraph({
        children: [
          new TextRun({ text: `${exp.role} — ${exp.company}`, bold: true, size: 20 }),
          new TextRun({ text: `  ${exp.duration}`, size: 18, color: '666666' }),
        ],
      }));
      sections.push(new Paragraph({
        children: [new TextRun({ text: exp.description, size: 18 })],
      }));
      if (exp.achievements) {
        sections.push(new Paragraph({
          children: [new TextRun({ text: `✓ ${exp.achievements}`, size: 18, bold: true })],
          spacing: { after: 100 },
        }));
      }
    });
  }

  // Projects
  const validProj = data.projects?.filter(p => p.name) || [];
  if (validProj.length > 0) {
    sections.push(sectionHeading('Projects'));
    validProj.forEach(proj => {
      sections.push(new Paragraph({
        children: [
          new TextRun({ text: proj.name, bold: true, size: 20 }),
          proj.tech ? new TextRun({ text: ` (${proj.tech})`, size: 18, italics: true, color: '534AB7' }) : new TextRun({ text: '' }),
        ],
      }));
      sections.push(new Paragraph({
        children: [new TextRun({ text: proj.description, size: 18 })],
        spacing: { after: 100 },
      }));
    });
  }

  // Skills
  if (data.skills.technical?.length > 0) {
    sections.push(sectionHeading('Skills'));
    sections.push(new Paragraph({
      children: [
        new TextRun({ text: 'Technical: ', bold: true, size: 18 }),
        new TextRun({ text: data.skills.technical.join(', '), size: 18 }),
      ],
    }));
    if (data.skills.soft?.length > 0) {
      sections.push(new Paragraph({
        children: [
          new TextRun({ text: 'Soft skills: ', bold: true, size: 18 }),
          new TextRun({ text: data.skills.soft.join(', '), size: 18 }),
        ],
      }));
    }
    if (data.skills.tools?.length > 0) {
      sections.push(new Paragraph({
        children: [
          new TextRun({ text: 'Tools: ', bold: true, size: 18 }),
          new TextRun({ text: data.skills.tools.join(', '), size: 18 }),
        ],
        spacing: { after: 100 },
      }));
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children: sections }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileName}.docx`);
}
