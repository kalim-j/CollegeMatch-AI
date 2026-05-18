const fs = require('fs');
const path = require('path');

// College data for all remaining streams
const collegeData = {
  commerce: [
    // Commerce Colleges (35 colleges, ids 10026-10060)
    { id: 10026, name: "Shri Ram College of Commerce (SRCC)", location: "Delhi University", district: "North Delhi", state: "Delhi", type: "Government", level: "UG", naac: "A++", courses: ["B.Com (Hons)", "B.A Economics (Hons)"], ug_annual: 18000, ug_total: 54000, hostel: 35000, cutoff_gen: 99.5, cutoff_obc: 98.5, cutoff_sc: 94.0, cutoff_st: 91.0, avg_pkg: 8.5, max_pkg: 28.0, seats: 600, nirf: 1, website: "https://www.srcc.edu" },
    { id: 10027, name: "Lady Shri Ram College for Women - Commerce", location: "Lajpat Nagar", district: "South Delhi", state: "Delhi", type: "Government", level: "UG", naac: "A++", courses: ["B.Com (Hons)"], ug_annual: 16000, ug_total: 48000, hostel: 38000, cutoff_gen: 99.0, cutoff_obc: 97.5, cutoff_sc: 93.0, cutoff_st: 90.0, avg_pkg: 7.8, max_pkg: 25.0, seats: 300, nirf: 2, website: "https://www.lsr.edu.in" },
    { id: 10028, name: "Hindu College - Commerce", location: "Delhi University", district: "North Delhi", state: "Delhi", type: "Government", level: "UG", naac: "A++", courses: ["B.Com (Hons)"], ug_annual: 15000, ug_total: 45000, hostel: 35000, cutoff_gen: 98.5, cutoff_obc: 97.0, cutoff_sc: 92.0, cutoff_st: 89.0, avg_pkg: 7.5, max_pkg: 24.0, seats: 400, nirf: 3, website: "https://www.hinducollege.ac.in" },
    { id: 10029, name: "St. Xavier's College - Commerce", location: "Mumbai", district: "Mumbai City", state: "Maharashtra", type: "Autonomous", level: "Both", naac: "A++", courses: ["B.Com", "M.Com"], ug_annual: 45000, ug_total: 135000, pg_annual: 35000, pg_total: 70000, hostel: 85000, cutoff_gen: 94.0, cutoff_obc: 92.0, cutoff_sc: 87.0, cutoff_st: 84.0, avg_pkg: 6.5, max_pkg: 20.0, seats: 500, nirf: 4, website: "https://www.xaviers.edu" },
    { id: 10030, name: "Loyola College - Commerce", location: "Nungambakkam", district: "Chennai", state: "Tamil Nadu", type: "Autonomous", level: "Both", naac: "A++", courses: ["B.Com", "M.Com"], ug_annual: 42000, ug_total: 126000, pg_annual: 32000, pg_total: 64000, hostel: 75000, cutoff_gen: 95.0, cutoff_obc: 93.0, cutoff_sc: 88.0, cutoff_st: 85.0, avg_pkg: 6.8, max_pkg: 22.0, seats: 600, nirf: 5, website: "https://www.loyolacollege.edu" },
    { id: 10031, name: "Christ University - Commerce", location: "Hosur Road", district: "Bengaluru Urban", state: "Karnataka", type: "Deemed", level: "Both", naac: "A++", courses: ["B.Com", "M.Com", "BBA"], ug_annual: 185000, ug_total: 555000, pg_annual: 145000, pg_total: 290000, hostel: 95000, cutoff_gen: 93.5, cutoff_obc: 91.5, cutoff_sc: 86.5, cutoff_st: 83.5, avg_pkg: 7.2, max_pkg: 23.0, seats: 800, nirf: 6, website: "https://www.christuniversity.in" },
    { id: 10032, name: "Hansraj College - Commerce", location: "Delhi University", district: "North Delhi", state: "Delhi", type: "Government", level: "UG", naac: "A++", courses: ["B.Com (Hons)"], ug_annual: 14500, ug_total: 43500, hostel: 33000, cutoff_gen: 98.0, cutoff_obc: 96.5, cutoff_sc: 91.5, cutoff_st: 88.5, avg_pkg: 7.0, max_pkg: 22.0, seats: 350, nirf: 7, website: "https://www.hansrajcollege.ac.in" },
    { id: 10033, name: "Ramjas College - Commerce", location: "Delhi University", district: "North Delhi", state: "Delhi", type: "Government", level: "UG", naac: "A+", courses: ["B.Com (Hons)"], ug_annual: 13000, ug_total: 39000, hostel: 30000, cutoff_gen: 97.0, cutoff_obc: 95.5, cutoff_sc: 90.5, cutoff_st: 87.5, avg_pkg: 6.5, max_pkg: 20.0, seats: 400, nirf: 8, website: "https://www.ramjas.du.ac.in" },
    { id: 10034, name: "Narsee Monjee College of Commerce and Economics", location: "Vile Parle", district: "Mumbai Suburban", state: "Maharashtra", type: "Autonomous", level: "Both", naac: "A++", courses: ["B.Com", "M.Com", "BMS"], ug_annual: 85000, ug_total: 255000, pg_annual: 65000, pg_total: 130000, hostel: 95000, cutoff_gen: 92.0, cutoff_obc: 90.0, cutoff_sc: 85.0, cutoff_st: 82.0, avg_pkg: 6.8, max_pkg: 21.0, seats: 600, nirf: 9, website: "https://www.nmcollege.in" },
    { id: 10035, name: "Symbiosis College of Arts and Commerce - Commerce", location: "Senapati Bapat Road", district: "Pune", state: "Maharashtra", type: "Autonomous", level: "Both", naac: "A+", courses: ["B.Com", "M.Com", "BBA"], ug_annual: 95000, ug_total: 285000, pg_annual: 75000, pg_total: 150000, hostel: 85000, cutoff_gen: 91.0, cutoff_obc: 89.0, cutoff_sc: 84.0, cutoff_st: 81.0, avg_pkg: 6.5, max_pkg: 19.0, seats: 500, nirf: 10, website: "https://www.scac.edu.in" },
    { id: 10036, name: "Madras Christian College - Commerce", location: "Tambaram", district: "Chengalpattu", state: "Tamil Nadu", type: "Autonomous", level: "Both", naac: "A++", courses: ["B.Com", "M.Com"], ug_annual: 35000, ug_total: 105000, pg_annual: 28000, pg_total: 56000, hostel: 55000, cutoff_gen: 92.0, cutoff_obc: 90.0, cutoff_sc: 85.0, cutoff_st: 82.0, avg_pkg: 5.8, max_pkg: 17.0, seats: 450, nirf: 11, website: "https://www.mcc.edu.in" },
    { id: 10037, name: "St. Joseph's College - Commerce", location: "Residency Road", district: "Bengaluru Urban", state: "Karnataka", type: "Autonomous", level: "Both", naac: "A++", courses: ["B.Com", "M.Com", "BBA"], ug_annual: 48000, ug_total: 144000, pg_annual: 38000, pg_total: 76000, hostel: 70000, cutoff_gen: 92.5, cutoff_obc: 90.5, cutoff_sc: 85.5, cutoff_st: 82.5, avg_pkg: 6.2, max_pkg: 18.0, seats: 500, nirf: 12, website: "https://www.sjc.ac.in" },
    { id: 10038, name: "Fergusson College - Commerce", location: "Shivajinagar", district: "Pune", state: "Maharashtra", type: "Autonomous", level: "Both", naac: "A+", courses: ["B.Com", "M.Com"], ug_annual: 25000, ug_total: 75000, pg_annual: 20000, pg_total: 40000, hostel: 45000, cutoff_gen: 90.0, cutoff_obc: 88.0, cutoff_sc: 83.0, cutoff_st: 80.0, avg_pkg: 5.5, max_pkg: 16.0, seats: 400, nirf: 13, website: "https://www.fergusson.edu" },
    { id: 10039, name: "Stella Maris College - Commerce", location: "Cathedral Road", district: "Chennai", state: "Tamil Nadu", type: "Autonomous", level: "Both", naac: "A++", courses: ["B.Com", "M.Com"], ug_annual: 38000, ug_total: 114000, pg_annual: 30000, pg_total: 60000, hostel: 65000, cutoff_gen: 93.5, cutoff_obc: 91.5, cutoff_sc: 86.5, cutoff_st: 83.5, avg_pkg: 6.0, max_pkg: 17.5, seats: 350, nirf: 14, website: "https://www.stellamariscollege.edu.in" },
    { id: 10040, name: "Mount Carmel College - Commerce", location: "Vasanth Nagar", district: "Bengaluru Urban", state: "Karnataka", type: "Autonomous", level: "Both", naac: "A++", courses: ["B.Com", "M.Com", "BBA"], ug_annual: 55000, ug_total: 165000, pg_annual: 45000, pg_total: 90000, hostel: 75000, cutoff_gen: 93.0, cutoff_obc: 91.0, cutoff_sc: 86.0, cutoff_st: 83.0, avg_pkg: 6.3, max_pkg: 18.5, seats: 400, nirf: 15, website: "https://www.mcc.edu.in" },
    { id: 10041, name: "Ethiraj College for Women - Commerce", location: "Egmore", district: "Chennai", state: "Tamil Nadu", type: "Autonomous", level: "Both", naac: "A+", courses: ["B.Com", "M.Com"], ug_annual: 32000, ug_total: 96000, pg_annual: 26000, pg_total: 52000, hostel: 55000, cutoff_gen: 90.0, cutoff_obc: 88.0, cutoff_sc: 83.0, cutoff_st: 80.0, avg_pkg: 5.5, max_pkg: 15.0, seats: 350, nirf: 16, website: "https://www.ethirajcollege.edu.in" },
    { id: 10042, name: "Jain University - Commerce", location: "Jayanagar", district: "Bengaluru Urban", state: "Karnataka", type: "Deemed", level: "Both", naac: "A+", courses: ["B.Com", "M.Com", "BBA"], ug_annual: 125000, ug_total: 375000, pg_annual: 95000, pg_total: 190000, hostel: 90000, cutoff_gen: 89.0, cutoff_obc: 87.0, cutoff_sc: 82.0, cutoff_st: 79.0, avg_pkg: 6.0, max_pkg: 17.0, seats: 500, nirf: 17, website: "https://www.jainuniversity.ac.in" },
    { id: 10043, name: "Gargi College - Commerce", location: "Siri Fort", district: "South Delhi", state: "Delhi", type: "Government", level: "UG", naac: "A+", courses: ["B.Com (Hons)"], ug_annual: 12500, ug_total: 37500, hostel: 28000, cutoff_gen: 96.0, cutoff_obc: 94.0, cutoff_sc: 89.0, cutoff_st: 86.0, avg_pkg: 6.0, max_pkg: 18.0, seats: 300, nirf: 18, website: "https://www.gargicollege.in" },
    { id: 10044, name: "Presidency College - Commerce", location: "College Street", district: "Kolkata", state: "West Bengal", type: "Government", level: "Both", naac: "A++", courses: ["B.Com", "M.Com"], ug_annual: 8000, ug_total: 24000, pg_annual: 6000, pg_total: 12000, hostel: 25000, cutoff_gen: 95.5, cutoff_obc: 93.5, cutoff_sc: 88.5, cutoff_st: 85.5, avg_pkg: 5.8, max_pkg: 16.0, seats: 400, nirf: 19, website: "https://www.presiuniv.ac.in" },
    { id: 10045, name: "HR College of Commerce and Economics", location: "Churchgate", district: "Mumbai City", state: "Maharashtra", type: "Autonomous", level: "UG", naac: "A++", courses: ["B.Com", "BMS", "BAF"], ug_annual: 95000, ug_total: 285000, hostel: 105000, cutoff_gen: 93.0, cutoff_obc: 91.0, cutoff_sc: 86.0, cutoff_st: 83.0, avg_pkg: 7.0, max_pkg: 22.0, seats: 600, nirf: 20, website: "https://www.hrcollege.edu" },
    { id: 10046, name: "Jai Hind College", location: "Churchgate", district: "Mumbai City", state: "Maharashtra", type: "Autonomous", level: "Both", naac: "A+", courses: ["B.Com", "M.Com"], ug_annual: 75000, ug_total: 225000, pg_annual: 55000, pg_total: 110000, hostel: 95000, cutoff_gen: 91.0, cutoff_obc: 89.0, cutoff_sc: 84.0, cutoff_st: 81.0, avg_pkg: 6.2, max_pkg: 18.0, seats: 500, nirf: 21, website: "https://www.jaihindcollege.com" },
    { id: 10047, name: "Wilson College", location: "Chowpatty", district: "Mumbai City", state: "Maharashtra", type: "Autonomous", level: "Both", naac: "A", courses: ["B.Com", "M.Com"], ug_annual: 65000, ug_total: 195000, pg_annual: 50000, pg_total: 100000, hostel: 85000, cutoff_gen: 89.0, cutoff_obc: 87.0, cutoff_sc: 82.0, cutoff_st: 79.0, avg_pkg: 5.8, max_pkg: 16.0, seats: 450, nirf: 22, website: "https://www.wilsoncollege.edu" },
    { id: 10048, name: "Mithibai College", location: "Vile Parle", district: "Mumbai Suburban", state: "Maharashtra", type: "Autonomous", level: "Both", naac: "A+", courses: ["B.Com", "M.Com", "BMS"], ug_annual: 72000, ug_total: 216000, pg_annual: 52000, pg_total: 104000, hostel: 90000, cutoff_gen: 90.0, cutoff_obc: 88.0, cutoff_sc: 83.0, cutoff_st: 80.0, avg_pkg: 6.0, max_pkg: 17.0, seats: 550, nirf: 23, website: "https://www.mithibaicollege.ac.in" },
    { id: 10049, name: "Ramakrishna Mission Vivekananda College - Commerce", location: "Mylapore", district: "Chennai", state: "Tamil Nadu", type: "Autonomous", level: "Both", naac: "A++", courses: ["B.Com", "M.Com"], ug_annual: 12000, ug_total: 36000, pg_annual: 10000, pg_total: 20000, hostel: 30000, cutoff_gen: 91.0, cutoff_obc: 89.0, cutoff_sc: 84.0, cutoff_st: 81.0, avg_pkg: 5.5, max_pkg: 15.0, seats: 300, nirf: 24, website: "https://www.rkmvc.ac.in" },
    { id: 10050, name: "Deen Dayal Upadhyaya College", location: "Dwarka", district: "South West Delhi", state: "Delhi", type: "Government", level: "UG", naac: "A+", courses: ["B.Com (Hons)"], ug_annual: 11000, ug_total: 33000, hostel: 25000, cutoff_gen: 95.0, cutoff_obc: 93.0, cutoff_sc: 88.0, cutoff_st: 85.0, avg_pkg: 5.5, max_pkg: 16.0, seats: 350, nirf: 25, website: "https://www.dducollegedu.ac.in" },
    { id: 10051, name: "Kirori Mal College", location: "Delhi University", district: "North Delhi", state: "Delhi", type: "Government", level: "UG", naac: "A++", courses: ["B.Com (Hons)"], ug_annual: 13500, ug_total: 40500, hostel: 32000, cutoff_gen: 97.5, cutoff_obc: 96.0, cutoff_sc: 91.0, cutoff_st: 88.0, avg_pkg: 6.8, max_pkg: 21.0, seats: 400, nirf: 26, website: "https://www.kmc.du.ac.in" },
    { id: 10052, name: "Atma Ram Sanatan Dharma College", location: "Dhaula Kuan", district: "South West Delhi", state: "Delhi", type: "Government", level: "UG", naac: "A+", courses: ["B.Com (Hons)"], ug_annual: 12000, ug_total: 36000, hostel: 28000, cutoff_gen: 95.5, cutoff_obc: 93.5, cutoff_sc: 88.5, cutoff_st: 85.5, avg_pkg: 6.0, max_pkg: 18.0, seats: 350, nirf: 27, website: "https://www.arsdcollege.ac.in" },
    { id: 10053, name: "Shaheed Sukhdev College of Business Studies", location: "Vivek Vihar", district: "East Delhi", state: "Delhi", type: "Government", level: "UG", naac: "A++", courses: ["B.Com (Hons)", "BBA"], ug_annual: 14000, ug_total: 42000, hostel: 30000, cutoff_gen: 97.0, cutoff_obc: 95.5, cutoff_sc: 90.5, cutoff_st: 87.5, avg_pkg: 7.2, max_pkg: 23.0, seats: 450, nirf: 28, website: "https://www.sscbsdu.ac.in" },
    { id: 10054, name: "Daulat Ram College", location: "Delhi University", district: "North Delhi", state: "Delhi", type: "Government", level: "UG", naac: "A+", courses: ["B.Com (Hons)"], ug_annual: 12500, ug_total: 37500, hostel: 29000, cutoff_gen: 96.0, cutoff_obc: 94.0, cutoff_sc: 89.0, cutoff_st: 86.0, avg_pkg: 6.0, max_pkg: 18.0, seats: 300, nirf: 29, website: "https://www.dr.du.ac.in" },
    { id: 10055, name: "Keshav Mahavidyalaya", location: "Pitampura", district: "North West Delhi", state: "Delhi", type: "Government", level: "UG", naac: "A", courses: ["B.Com (Hons)"], ug_annual: 10500, ug_total: 31500, hostel: 24000, cutoff_gen: 94.0, cutoff_obc: 92.0, cutoff_sc: 87.0, cutoff_st: 84.0, avg_pkg: 5.5, max_pkg: 16.0, seats: 350, nirf: 30, website: "https://www.keshav.du.ac.in" },
    { id: 10056, name: "Shyam Lal College", location: "Shahdara", district: "East Delhi", state: "Delhi", type: "Government", level: "UG", naac: "A", courses: ["B.Com (Hons)"], ug_annual: 9500, ug_total: 28500, hostel: 22000, cutoff_gen: 93.0, cutoff_obc: 91.0, cutoff_sc: 86.0, cutoff_st: 83.0, avg_pkg: 5.2, max_pkg: 15.0, seats: 400, nirf: 31, website: "https://www.shyamlal.du.ac.in" },
    { id: 10057, name: "Vivekananda College", location: "Vivek Vihar", district: "East Delhi", state: "Delhi", type: "Government", level: "UG", naac: "A", courses: ["B.Com (Hons)"], ug_annual: 10000, ug_total: 30000, hostel: 23000, cutoff_gen: 93.5, cutoff_obc: 91.5, cutoff_sc: 86.5, cutoff_st: 83.5, avg_pkg: 5.3, max_pkg: 15.5, seats: 350, nirf: 32, website: "https://www.vivekanandacollege.edu.in" },
    { id: 10058, name: "Zakir Husain Delhi College", location: "Jawaharlal Nehru Marg", district: "Central Delhi", state: "Delhi", type: "Government", level: "UG", naac: "A", courses: ["B.Com (Hons)"], ug_annual: 9000, ug_total: 27000, hostel: 21000, cutoff_gen: 92.5, cutoff_obc: 90.5, cutoff_sc: 85.5, cutoff_st: 82.5, avg_pkg: 5.0, max_pkg: 14.5, seats: 300, nirf: 33, website: "https://www.zakirhusaincollege.ac.in" },
    { id: 10059, name: "Kamala Nehru College", location: "August Kranti Marg", district: "South Delhi", state: "Delhi", type: "Government", level: "UG", naac: "A+", courses: ["B.Com (Hons)"], ug_annual: 13000, ug_total: 39000, hostel: 30000, cutoff_gen: 96.5, cutoff_obc: 94.5, cutoff_sc: 89.5, cutoff_st: 86.5, avg_pkg: 6.2, max_pkg: 19.0, seats: 350, nirf: 34, website: "https://www.knc.du.ac.in" },
    { id: 10060, name: "Jesus and Mary College", location: "Chanakyapuri", district: "New Delhi", state: "Delhi", type: "Government", level: "UG", naac: "A+", courses: ["B.Com (Hons)"], ug_annual: 14000, ug_total: 42000, hostel: 32000, cutoff_gen: 96.0, cutoff_obc: 94.0, cutoff_sc: 89.0, cutoff_st: 86.0, avg_pkg: 6.0, max_pkg: 18.5, seats: 300, nirf: 35, website: "https://www.jmc.ac.in" }
  ]
};

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

// Generate all commerce colleges
const commerceColleges = collegeData.commerce.map(generateCollegeEntry).join(',\n');

// Insert the new colleges
const beforeInsertion = fileContent.substring(0, insertionPoint);
const afterInsertion = fileContent.substring(insertionPoint);

const newContent = beforeInsertion + ',\n\n  // COMMERCE COLLEGES (35 colleges - completing 50 total)\n' + commerceColleges + '\n' + afterInsertion;

// Write the updated content back to the file
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('Successfully added 35 Commerce colleges (ids 10026-10060)');
console.log('Total colleges added so far: 55 (20 Arts & Science + 35 Commerce)');
console.log('Remaining: 275 colleges across 8 streams');
