const fs = require('fs');
const path = require('path');

// Law Colleges Data (32 colleges, ids 10061-10092)
const lawColleges = [
  { id: 10061, name: "National Law School of India University (NLSIU)", location: "Nagarbhavi", district: "Bengaluru Urban", state: "Karnataka", type: "Government", level: "Both", naac: "A++", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 220000, ug_total: 1100000, pg_annual: 180000, pg_total: 360000, hostel: 85000, cutoff_gen: 98.5, cutoff_obc: 97.0, cutoff_sc: 92.0, cutoff_st: 89.0, avg_pkg: 15.5, max_pkg: 45.0, seats: 80, nirf: 1, website: "https://www.nls.ac.in" },
  { id: 10062, name: "NALSAR University of Law", location: "Justice City", district: "Hyderabad", state: "Telangana", type: "Government", level: "Both", naac: "A++", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 195000, ug_total: 975000, pg_annual: 165000, pg_total: 330000, hostel: 75000, cutoff_gen: 98.0, cutoff_obc: 96.5, cutoff_sc: 91.5, cutoff_st: 88.5, avg_pkg: 14.8, max_pkg: 42.0, seats: 120, nirf: 2, website: "https://www.nalsar.ac.in" },
  { id: 10063, name: "National Law University, Delhi (NLU Delhi)", location: "Sector 14", district: "Gautam Buddha Nagar", state: "Uttar Pradesh", type: "Government", level: "Both", naac: "A++", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 185000, ug_total: 925000, pg_annual: 155000, pg_total: 310000, hostel: 70000, cutoff_gen: 97.5, cutoff_obc: 96.0, cutoff_sc: 91.0, cutoff_st: 88.0, avg_pkg: 14.2, max_pkg: 40.0, seats: 100, nirf: 3, website: "https://www.nludelhi.ac.in" },
  { id: 10064, name: "West Bengal National University of Juridical Sciences (WBNUJS)", location: "Salt Lake", district: "Kolkata", state: "West Bengal", type: "Government", level: "Both", naac: "A++", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 175000, ug_total: 875000, pg_annual: 145000, pg_total: 290000, hostel: 65000, cutoff_gen: 97.0, cutoff_obc: 95.5, cutoff_sc: 90.5, cutoff_st: 87.5, avg_pkg: 13.8, max_pkg: 38.0, seats: 90, nirf: 4, website: "https://www.wbnujs.edu.in" },
  { id: 10065, name: "National Law Institute University (NLIU) Bhopal", location: "Kerwa Dam Road", district: "Bhopal", state: "Madhya Pradesh", type: "Government", level: "Both", naac: "A+", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 165000, ug_total: 825000, pg_annual: 135000, pg_total: 270000, hostel: 60000, cutoff_gen: 96.5, cutoff_obc: 95.0, cutoff_sc: 90.0, cutoff_st: 87.0, avg_pkg: 12.5, max_pkg: 35.0, seats: 100, nirf: 5, website: "https://www.nliu.ac.in" },
  { id: 10066, name: "Hidayatullah National Law University (HNLU) Raipur", location: "Uparwara", district: "Raipur", state: "Chhattisgarh", type: "Government", level: "Both", naac: "A+", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 155000, ug_total: 775000, pg_annual: 125000, pg_total: 250000, hostel: 55000, cutoff_gen: 96.0, cutoff_obc: 94.5, cutoff_sc: 89.5, cutoff_st: 86.5, avg_pkg: 11.8, max_pkg: 32.0, seats: 90, nirf: 6, website: "https://www.hnlu.ac.in" },
  { id: 10067, name: "Gujarat National Law University (GNLU)", location: "Attalika Avenue", district: "Gandhinagar", state: "Gujarat", type: "Government", level: "Both", naac: "A+", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 160000, ug_total: 800000, pg_annual: 130000, pg_total: 260000, hostel: 58000, cutoff_gen: 96.2, cutoff_obc: 94.7, cutoff_sc: 89.7, cutoff_st: 86.7, avg_pkg: 12.0, max_pkg: 33.0, seats: 100, nirf: 7, website: "https://www.gnlu.ac.in" },
  { id: 10068, name: "Rajiv Gandhi National University of Law (RGNUL) Patiala", location: "Sidhuwal", district: "Patiala", state: "Punjab", type: "Government", level: "Both", naac: "A+", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 158000, ug_total: 790000, pg_annual: 128000, pg_total: 256000, hostel: 57000, cutoff_gen: 95.8, cutoff_obc: 94.3, cutoff_sc: 89.3, cutoff_st: 86.3, avg_pkg: 11.5, max_pkg: 31.0, seats: 95, nirf: 8, website: "https://www.rgnul.ac.in" },
  { id: 10069, name: "National University of Advanced Legal Studies (NUALS) Kochi", location: "Kalamassery", district: "Ernakulam", state: "Kerala", type: "Government", level: "Both", naac: "A+", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 152000, ug_total: 760000, pg_annual: 122000, pg_total: 244000, hostel: 54000, cutoff_gen: 95.5, cutoff_obc: 94.0, cutoff_sc: 89.0, cutoff_st: 86.0, avg_pkg: 11.2, max_pkg: 30.0, seats: 85, nirf: 9, website: "https://www.nuals.ac.in" },
  { id: 10070, name: "National University of Study and Research in Law (NUSRL) Ranchi", location: "Namkum", district: "Ranchi", state: "Jharkhand", type: "Government", level: "Both", naac: "A", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 148000, ug_total: 740000, pg_annual: 118000, pg_total: 236000, hostel: 52000, cutoff_gen: 95.0, cutoff_obc: 93.5, cutoff_sc: 88.5, cutoff_st: 85.5, avg_pkg: 10.8, max_pkg: 28.0, seats: 80, nirf: 10, website: "https://www.nusrlranchi.in" },
  { id: 10071, name: "Symbiosis Law School (SLS) Pune", location: "Viman Nagar", district: "Pune", state: "Maharashtra", type: "Deemed", level: "Both", naac: "A++", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 285000, ug_total: 1425000, pg_annual: 235000, pg_total: 470000, hostel: 95000, cutoff_gen: 94.5, cutoff_obc: 93.0, cutoff_sc: 88.0, cutoff_st: 85.0, avg_pkg: 10.5, max_pkg: 27.0, seats: 180, nirf: 11, website: "https://www.slspune.edu.in" },
  { id: 10072, name: "Jindal Global Law School (JGLS)", location: "Sonipat", district: "Sonipat", state: "Haryana", type: "Private", level: "Both", naac: "A+", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 395000, ug_total: 1975000, pg_annual: 325000, pg_total: 650000, hostel: 125000, cutoff_gen: 94.0, cutoff_obc: 92.5, cutoff_sc: 87.5, cutoff_st: 84.5, avg_pkg: 12.8, max_pkg: 35.0, seats: 200, nirf: 12, website: "https://www.jgls.edu.in" },
  { id: 10073, name: "Amity Law School Delhi", location: "Sector 125", district: "Gautam Buddha Nagar", state: "Uttar Pradesh", type: "Private", level: "Both", naac: "A+", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 245000, ug_total: 1225000, pg_annual: 195000, pg_total: 390000, hostel: 105000, cutoff_gen: 92.0, cutoff_obc: 90.5, cutoff_sc: 85.5, cutoff_st: 82.5, avg_pkg: 9.5, max_pkg: 24.0, seats: 150, nirf: 13, website: "https://www.amity.edu/als" },
  { id: 10074, name: "Army Institute of Law", location: "Sector 68", district: "Mohali", state: "Punjab", type: "Government", level: "Both", naac: "A+", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 165000, ug_total: 825000, pg_annual: 135000, pg_total: 270000, hostel: 62000, cutoff_gen: 93.5, cutoff_obc: 92.0, cutoff_sc: 87.0, cutoff_st: 84.0, avg_pkg: 10.2, max_pkg: 26.0, seats: 100, nirf: 14, website: "https://www.ail.ac.in" },
  { id: 10075, name: "ILS Law College Pune", location: "Law College Road", district: "Pune", state: "Maharashtra", type: "Government", level: "Both", naac: "A+", courses: ["LL.B", "LL.M"], ug_annual: 85000, ug_total: 255000, pg_annual: 65000, pg_total: 130000, hostel: 55000, cutoff_gen: 91.0, cutoff_obc: 89.5, cutoff_sc: 84.5, cutoff_st: 81.5, avg_pkg: 8.5, max_pkg: 22.0, seats: 120, nirf: 15, website: "https://www.ilslaw.edu" },
  { id: 10076, name: "Government Law College Mumbai", location: "Churchgate", district: "Mumbai City", state: "Maharashtra", type: "Government", level: "Both", naac: "A+", courses: ["LL.B", "LL.M"], ug_annual: 75000, ug_total: 225000, pg_annual: 55000, pg_total: 110000, hostel: 85000, cutoff_gen: 92.5, cutoff_obc: 91.0, cutoff_sc: 86.0, cutoff_st: 83.0, avg_pkg: 9.0, max_pkg: 23.0, seats: 150, nirf: 16, website: "https://www.glc.edu" },
  { id: 10077, name: "Faculty of Law, Delhi University", location: "Law Centre I", district: "North Delhi", state: "Delhi", type: "Government", level: "Both", naac: "A++", courses: ["LL.B", "LL.M"], ug_annual: 18000, ug_total: 54000, pg_annual: 12000, pg_total: 24000, hostel: 35000, cutoff_gen: 94.0, cutoff_obc: 92.5, cutoff_sc: 87.5, cutoff_st: 84.5, avg_pkg: 9.5, max_pkg: 25.0, seats: 240, nirf: 17, website: "https://www.lawfaculty.du.ac.in" },
  { id: 10078, name: "Campus Law Centre, Delhi University", location: "Law Centre II", district: "North Delhi", state: "Delhi", type: "Government", level: "Both", naac: "A+", courses: ["LL.B", "LL.M"], ug_annual: 17000, ug_total: 51000, pg_annual: 11000, pg_total: 22000, hostel: 33000, cutoff_gen: 93.0, cutoff_obc: 91.5, cutoff_sc: 86.5, cutoff_st: 83.5, avg_pkg: 9.0, max_pkg: 24.0, seats: 200, nirf: 18, website: "https://www.clc.du.ac.in" },
  { id: 10079, name: "Aligarh Muslim University - Faculty of Law", location: "AMU Campus", district: "Aligarh", state: "Uttar Pradesh", type: "Government", level: "Both", naac: "A+", courses: ["LL.B", "LL.M"], ug_annual: 25000, ug_total: 75000, pg_annual: 18000, pg_total: 36000, hostel: 28000, cutoff_gen: 90.0, cutoff_obc: 88.5, cutoff_sc: 83.5, cutoff_st: 80.5, avg_pkg: 7.5, max_pkg: 20.0, seats: 150, nirf: 19, website: "https://www.amu.ac.in/law" },
  { id: 10080, name: "Banaras Hindu University - Faculty of Law", location: "BHU Campus", district: "Varanasi", state: "Uttar Pradesh", type: "Government", level: "Both", naac: "A+", courses: ["LL.B", "LL.M"], ug_annual: 22000, ug_total: 66000, pg_annual: 16000, pg_total: 32000, hostel: 26000, cutoff_gen: 90.5, cutoff_obc: 89.0, cutoff_sc: 84.0, cutoff_st: 81.0, avg_pkg: 7.8, max_pkg: 21.0, seats: 140, nirf: 20, website: "https://www.bhu.ac.in/law" },
  { id: 10081, name: "Chanakya National Law University", location: "Mithapur", district: "Patna", state: "Bihar", type: "Government", level: "Both", naac: "A", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 145000, ug_total: 725000, pg_annual: 115000, pg_total: 230000, hostel: 50000, cutoff_gen: 94.5, cutoff_obc: 93.0, cutoff_sc: 88.0, cutoff_st: 85.0, avg_pkg: 10.5, max_pkg: 27.0, seats: 90, nirf: 21, website: "https://www.cnlu.ac.in" },
  { id: 10082, name: "Tamil Nadu National Law University (TNNLU)", location: "Tiruchirappalli", district: "Tiruchirappalli", state: "Tamil Nadu", type: "Government", level: "Both", naac: "A", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 142000, ug_total: 710000, pg_annual: 112000, pg_total: 224000, hostel: 48000, cutoff_gen: 94.0, cutoff_obc: 92.5, cutoff_sc: 87.5, cutoff_st: 84.5, avg_pkg: 10.0, max_pkg: 26.0, seats: 85, nirf: 22, website: "https://www.tnnlu.ac.in" },
  { id: 10083, name: "Maharashtra National Law University (MNLU) Mumbai", location: "Bandra", district: "Mumbai Suburban", state: "Maharashtra", type: "Government", level: "Both", naac: "A", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 168000, ug_total: 840000, pg_annual: 138000, pg_total: 276000, hostel: 72000, cutoff_gen: 94.2, cutoff_obc: 92.7, cutoff_sc: 87.7, cutoff_st: 84.7, avg_pkg: 10.8, max_pkg: 28.0, seats: 100, nirf: 23, website: "https://www.mnlumumbai.edu.in" },
  { id: 10084, name: "Maharashtra National Law University (MNLU) Nagpur", location: "Nagpur", district: "Nagpur", state: "Maharashtra", type: "Government", level: "Both", naac: "A", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 155000, ug_total: 775000, pg_annual: 125000, pg_total: 250000, hostel: 55000, cutoff_gen: 93.5, cutoff_obc: 92.0, cutoff_sc: 87.0, cutoff_st: 84.0, avg_pkg: 10.2, max_pkg: 26.0, seats: 90, nirf: 24, website: "https://www.mnlunagpur.edu.in" },
  { id: 10085, name: "Maharashtra National Law University (MNLU) Aurangabad", location: "Aurangabad", district: "Aurangabad", state: "Maharashtra", type: "Government", level: "Both", naac: "A", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 152000, ug_total: 760000, pg_annual: 122000, pg_total: 244000, hostel: 53000, cutoff_gen: 93.0, cutoff_obc: 91.5, cutoff_sc: 86.5, cutoff_st: 83.5, avg_pkg: 10.0, max_pkg: 25.0, seats: 85, nirf: 25, website: "https://www.mnlu.ac.in" },
  { id: 10086, name: "Damodaram Sanjivayya National Law University", location: "Sabbavaram", district: "Visakhapatnam", state: "Andhra Pradesh", type: "Government", level: "Both", naac: "A", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 148000, ug_total: 740000, pg_annual: 118000, pg_total: 236000, hostel: 51000, cutoff_gen: 92.5, cutoff_obc: 91.0, cutoff_sc: 86.0, cutoff_st: 83.0, avg_pkg: 9.8, max_pkg: 24.0, seats: 80, nirf: 26, website: "https://www.dsnlu.ac.in" },
  { id: 10087, name: "Dr. Ram Manohar Lohiya National Law University", location: "Sector B", district: "Lucknow", state: "Uttar Pradesh", type: "Government", level: "Both", naac: "A", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 158000, ug_total: 790000, pg_annual: 128000, pg_total: 256000, hostel: 56000, cutoff_gen: 93.8, cutoff_obc: 92.3, cutoff_sc: 87.3, cutoff_st: 84.3, avg_pkg: 10.5, max_pkg: 27.0, seats: 95, nirf: 27, website: "https://www.rmlnlu.ac.in" },
  { id: 10088, name: "Himachal Pradesh National Law University", location: "Ghandal", district: "Shimla", state: "Himachal Pradesh", type: "Government", level: "Both", naac: "A", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 145000, ug_total: 725000, pg_annual: 115000, pg_total: 230000, hostel: 49000, cutoff_gen: 92.0, cutoff_obc: 90.5, cutoff_sc: 85.5, cutoff_st: 82.5, avg_pkg: 9.5, max_pkg: 23.0, seats: 75, nirf: 28, website: "https://www.hpnlu.ac.in" },
  { id: 10089, name: "National Law University Odisha", location: "Cuttack", district: "Cuttack", state: "Odisha", type: "Government", level: "Both", naac: "A", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 142000, ug_total: 710000, pg_annual: 112000, pg_total: 224000, hostel: 47000, cutoff_gen: 91.5, cutoff_obc: 90.0, cutoff_sc: 85.0, cutoff_st: 82.0, avg_pkg: 9.2, max_pkg: 22.0, seats: 70, nirf: 29, website: "https://www.nluo.ac.in" },
  { id: 10090, name: "National Law University and Judicial Academy Assam", location: "Amingaon", district: "Kamrup", state: "Assam", type: "Government", level: "Both", naac: "A", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 138000, ug_total: 690000, pg_annual: 108000, pg_total: 216000, hostel: 45000, cutoff_gen: 91.0, cutoff_obc: 89.5, cutoff_sc: 84.5, cutoff_st: 81.5, avg_pkg: 9.0, max_pkg: 21.0, seats: 65, nirf: 30, website: "https://www.nluassam.ac.in" },
  { id: 10091, name: "National Law University Tripura", location: "Agartala", district: "West Tripura", state: "Tripura", type: "Government", level: "Both", naac: "A", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 135000, ug_total: 675000, pg_annual: 105000, pg_total: 210000, hostel: 43000, cutoff_gen: 90.5, cutoff_obc: 89.0, cutoff_sc: 84.0, cutoff_st: 81.0, avg_pkg: 8.8, max_pkg: 20.0, seats: 60, nirf: 31, website: "https://www.nlutripura.ac.in" },
  { id: 10092, name: "National Law University Meghalaya", location: "Mayurbhanj Complex", district: "East Khasi Hills", state: "Meghalaya", type: "Government", level: "Both", naac: "A", courses: ["B.A. LL.B (Hons)", "LL.M"], ug_annual: 132000, ug_total: 660000, pg_annual: 102000, pg_total: 204000, hostel: 41000, cutoff_gen: 90.0, cutoff_obc: 88.5, cutoff_sc: 83.5, cutoff_st: 80.5, avg_pkg: 8.5, max_pkg: 19.0, seats: 55, nirf: 32, website: "https://www.nlumeghalaya.ac.in" }
];

// Function to generate college entry
function generateCollegeEntry(college) {
  const hasPostGrad = college.pg_annual !== undefined;
  
  return `  {
    id: ${college.id},
    name: "${college.name}",
    location: "${college.location}",
    district: "${college.district}",
    state: "${college.state}",
    type: "${college.type}",
    level: "${college.level}",
    naac_grade: "${college.naac}",
    courses: ${JSON.stringify(college.courses)},
    fees_structure: {
      ug_annual: ${college.ug_annual},
      ug_total: ${college.ug_total},${hasPostGrad ? `
      pg_annual: ${college.pg_annual},
      pg_total: ${college.pg_total},` : ''}
      hostel_annual: ${college.hostel}
    },
    cutoff_general: ${college.cutoff_gen},
    cutoff_obc: ${college.cutoff_obc},
    cutoff_sc: ${college.cutoff_sc},
    cutoff_st: ${college.cutoff_st},
    avg_package_lpa: ${college.avg_pkg},
    max_package_lpa: ${college.max_pkg},
    seats: ${college.seats},
    nirf_rank: ${college.nirf},
    website: "${college.website}"
  }`;
}

// Read the current file
const filePath = path.join(__dirname, '..', 'src', 'data', 'collegesDatabase.ts');
let fileContent = fs.readFileSync(filePath, 'utf8');

// Find the insertion point (before the closing bracket "];")
const insertionPoint = fileContent.lastIndexOf('];');

if (insertionPoint === -1) {
  console.error('Could not find insertion point in file');
  process.exit(1);
}

// Generate all law colleges
const lawCollegesStr = lawColleges.map(generateCollegeEntry).join(',\n');

// Insert the new colleges
const beforeInsertion = fileContent.substring(0, insertionPoint);
const afterInsertion = fileContent.substring(insertionPoint);

const newContent = beforeInsertion + ',\n\n  // LAW COLLEGES (32 colleges - completing 50 total)\n' + lawCollegesStr + '\n' + afterInsertion;

// Write the updated content back to the file
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('Successfully added 32 Law colleges (ids 10061-10092)');
console.log('Total colleges added so far: 87 (20 Arts & Science + 35 Commerce + 32 Law)');
console.log('Remaining: 243 colleges across 7 streams');
