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


  doc.setFillColor(7, 9, 26);
  doc.rect(0, 0, pageWidth, 50, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AdmissionIQ', 20, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 200);
  doc.text('AI-Powered College Prediction Report', 20, 35);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 20, 43);

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Profile', 20, 70);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${data.studentName}`, 20, 82);
  doc.text(`Marks / Percentile: ${data.marks}%`, 20, 92);
  doc.text(`Category: ${data.category}`, 20, 102);
  doc.text(`Preferred Course: ${data.course}`, 20, 112);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Counsellor Advice', 20, 130);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const splitSummary = doc.splitTextToSize(data.aiSummary, pageWidth - 40);
  doc.text(splitSummary, 20, 142);

  let yPos = 142 + splitSummary.length * 7 + 15;

  const addCollegeTable = (
    title: string,
    colleges: College[],
    color: [number, number, number]
  ) => {
    if (colleges.length === 0) return;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    doc.text(title, 20, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [['College', 'Location', 'Cutoff%', 'Avg Package', 'NIRF Rank']],
      body: colleges.map(c => [
        c.name,
        `${c.location}, ${c.state}`,
        `${c.cutoff_general || 'N/A'}%`,
        `₹${c.avg_package_lpa || 'N/A'} LPA`,
        c.nirf_rank ? `#${c.nirf_rank}` : 'N/A',
      ]),
      headStyles: {
        fillColor: color,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 248, 255] },
      margin: { left: 20, right: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  };

  addCollegeTable(
    '✅ Safe Colleges (High Chance)',
    data.safeColleges,
    [34, 197, 94]
  );
  addCollegeTable(
    '🎯 Moderate Colleges (Good Chance)',
    data.moderateColleges,
    [99, 102, 241]
  );
  addCollegeTable(
    '🚀 Reach Colleges (Ambitious)',
    data.reachColleges,
    [249, 115, 22]
  );

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `AdmissionIQ — admissioniq-app.vercel.app — Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`AdmissionIQ_Report_${data.studentName}_${Date.now()}.pdf`);
};
