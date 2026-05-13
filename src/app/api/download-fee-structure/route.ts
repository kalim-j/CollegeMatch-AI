import { NextResponse } from "next/server";
import { collegesDatabase } from "@/data/collegesDatabase";
import { jsPDF } from "jspdf";

export async function POST(req: Request) {
  try {
    const { collegeName, website, collegeId } = await req.json();

    // Find college in database
    const college = collegesDatabase.find(c => c.id === collegeId || c.name === collegeName);

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    // Generate PDF with fee structure
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(79, 70, 229); // Indigo
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Fee Structure', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(college.name, 105, 32, { align: 'center' });

    // College Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    let yPos = 55;
    
    doc.text('College Information', 20, yPos);
    yPos += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Location: ${college.location}, ${college.district}, ${college.state}`, 20, yPos);
    yPos += 7;
    doc.text(`Type: ${college.type}`, 20, yPos);
    yPos += 7;
    doc.text(`NAAC Grade: ${college.naac_grade}`, 20, yPos);
    yPos += 7;
    doc.text(`NIRF Rank: #${college.nirf_rank}`, 20, yPos);
    yPos += 7;
    doc.text(`Website: ${college.website}`, 20, yPos);
    yPos += 15;

    // Fee Structure Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Undergraduate (UG) Fee Structure', 20, yPos);
    yPos += 10;

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPos - 5, 170, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Fee Type', 25, yPos);
    doc.text('Amount (INR)', 140, yPos);
    yPos += 10;

    // Table rows
    doc.setFont('helvetica', 'normal');
    const ugFees = [
      { label: 'Annual Tuition Fee', amount: `₹${college.fees_structure.ug_annual.toLocaleString('en-IN')}` },
      { label: 'Total 4-Year Fee', amount: `₹${college.fees_structure.ug_total.toLocaleString('en-IN')}` },
      { label: 'Hostel Fee (Annual)', amount: college.fees_structure.hostel_annual ? `₹${college.fees_structure.hostel_annual.toLocaleString('en-IN')}` : 'N/A' },
    ];

    ugFees.forEach((fee, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(20, yPos - 5, 170, 8, 'F');
      }
      doc.text(fee.label, 25, yPos);
      doc.text(fee.amount, 140, yPos);
      yPos += 8;
    });

    yPos += 10;

    // PG Fees if available
    if (college.level === 'Both' || college.level === 'PG') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Postgraduate (PG) Fee Structure', 20, yPos);
      yPos += 10;

      // Table header
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPos - 5, 170, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Fee Type', 25, yPos);
      doc.text('Amount (INR)', 140, yPos);
      yPos += 10;

      // Table rows
      doc.setFont('helvetica', 'normal');
      const pgFees = [
        { label: 'Annual Tuition Fee', amount: college.fees_structure.pg_annual ? `₹${college.fees_structure.pg_annual.toLocaleString('en-IN')}` : 'N/A' },
        { label: 'Total 2-Year Fee', amount: college.fees_structure.pg_total ? `₹${college.fees_structure.pg_total.toLocaleString('en-IN')}` : 'N/A' },
      ];

      pgFees.forEach((fee, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(20, yPos - 5, 170, 8, 'F');
        }
        doc.text(fee.label, 25, yPos);
        doc.text(fee.amount, 140, yPos);
        yPos += 8;
      });

      yPos += 10;
    }

    // Cutoff Information
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Admission Cutoff Marks', 20, yPos);
    yPos += 10;

    // Cutoff table
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPos - 5, 170, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Category', 25, yPos);
    doc.text('Cutoff', 140, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    const cutoffs = [
      { label: 'General', amount: college.cutoff_general.toString() },
      { label: 'OBC', amount: college.cutoff_obc.toString() },
      { label: 'SC', amount: college.cutoff_sc.toString() },
      { label: 'ST', amount: college.cutoff_st.toString() },
    ];

    cutoffs.forEach((cutoff, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(20, yPos - 5, 170, 8, 'F');
      }
      doc.text(cutoff.label, 25, yPos);
      doc.text(cutoff.amount, 140, yPos);
      yPos += 8;
    });

    yPos += 10;

    // Placement Information
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Placement Statistics', 20, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Average Package: ₹${college.avg_package_lpa} LPA`, 25, yPos);
    yPos += 7;
    doc.text(`Highest Package: ₹${college.max_package_lpa} LPA`, 25, yPos);
    yPos += 7;
    doc.text(`Total Seats: ${college.seats}`, 25, yPos);
    yPos += 15;

    // Available Courses
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Available Courses', 20, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    college.courses.forEach((course, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`• ${course}`, 25, yPos);
      yPos += 6;
    });

    // Footer
    yPos = 280;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Note: Fees are subject to change. Please verify with the official college website.', 105, yPos, { align: 'center' });
    yPos += 5;
    doc.text(`Generated by CollegeMatch-AI on ${new Date().toLocaleDateString('en-IN')}`, 105, yPos, { align: 'center' });

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${college.name.replace(/[^a-z0-9]/gi, '_')}_Fee_Structure.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating fee structure PDF:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
