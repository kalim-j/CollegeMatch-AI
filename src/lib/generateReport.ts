// Dynamic imports will be used inside the function to avoid SSR issues

type College = {
  name: string;
  location: string;
  state: string;
  cutoff_general?: number;
  cutoff_obc?: number;
  cutoff_sc?: number;
  cutoff_st?: number;
  avg_package_lpa?: number;
  nirf_rank?: number;
  website?: string;
};

type ReportData = {
  studentName: string;
  marks: number;
  category: string;
  course: string;
  aiSummary: string;
  safeColleges: College[];
  moderateColleges: College[];
  reachColleges: College[];
};

export const generatePDFReport = async (data: ReportData) => {
  // Dynamically import jsPDF and autoTable only when the function is called (Client-side)
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- HEADER SECTION ---
  // Dark Background Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Header Accent Line
  doc.setFillColor(99, 102, 241); // indigo-500
  doc.rect(0, 45, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('CollegeMatch', 20, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('AI-POWERED ADMISSION INSIGHTS REPORT', 20, 35);
  
  doc.setTextColor(255, 255, 255);
  doc.text(`${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - 20, 25, { align: 'right' });

  // --- STUDENT PROFILE ---
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Profile', 20, 65);
  
  // Profile Underline
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(20, 68, 70, 68);

  // Profile Grid
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('NAME', 20, 80);
  doc.text('MARKS/PERCENTILE', 80, 80);
  doc.text('CATEGORY', 140, 80);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(data.studentName.toUpperCase(), 20, 86);
  doc.text(`${data.marks}%`, 80, 86);
  doc.text(data.category.toUpperCase(), 140, 86);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('PREFERRED COURSE', 20, 98);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(data.course.toUpperCase(), 20, 104);

  // --- AI SUMMARY SECTION ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(15, 115, pageWidth - 30, 35, 3, 3, 'F');
  
  doc.setTextColor(79, 70, 229); // indigo-600
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Counselor Summary', 22, 125);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85); // slate-700
  const splitSummary = doc.splitTextToSize(data.aiSummary, pageWidth - 45);
  doc.text(splitSummary, 22, 132);

  let yPos = 165;

  const addCollegeTable = (
    title: string,
    colleges: College[],
    headerColor: [number, number, number],
    label: string
  ) => {
    if (colleges.length === 0) return;

    // Check for page overflow
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 25;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...headerColor);
    doc.text(title, 20, yPos);
    
    yPos += 6;

    autoTable(doc, {
      startY: yPos,
      head: [['College Name', 'Location', 'Cutoff', 'Avg Package', 'Rank']],
      body: colleges.map(c => [
        c.name,
        c.location,
        `${c.cutoff_general || 'N/A'}%`,
        `${c.avg_package_lpa || 'N/A'} LPA`, // Removed Rupee symbol to prevent symbols
        c.nirf_rank ? `#${c.nirf_rank}` : 'N/A',
      ]),
      headStyles: {
        fillColor: headerColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        cellPadding: 4,
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 4,
        textColor: [51, 65, 85],
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 15 },
      },
      margin: { left: 20, right: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  };

  // Safe Colleges
  addCollegeTable(
    'Safe Colleges (High Admission Probability)',
    data.safeColleges,
    [22, 163, 74], // green-600
    'SAFE'
  );

  // Moderate Colleges
  addCollegeTable(
    'Moderate Colleges (Target Options)',
    data.moderateColleges,
    [79, 70, 229], // indigo-600
    'TARGET'
  );

  // Reach Colleges
  addCollegeTable(
    'Reach Colleges (Aspirational)',
    data.reachColleges,
    [234, 88, 12], // orange-600
    'REACH'
  );

  // --- FOOTER ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Bottom border
    doc.setDrawColor(226, 232, 240);
    doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `CollegeMatch Report — collegematch-ai.vercel.app`,
      20,
      pageHeight - 10
    );
    
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 20,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  doc.save(`CollegeMatch_Report_${data.studentName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};
