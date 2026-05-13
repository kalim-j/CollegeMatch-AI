/**
 * College Database Expansion Template
 * 
 * This file provides a template for adding more colleges to the database.
 * Follow the structure below to add colleges from any district/state.
 * 
 * Data Sources:
 * 1. Official College Websites
 * 2. NIRF Rankings: https://www.nirfindia.org/
 * 3. CollegeDunia: https://collegedunia.com/
 * 4. Shiksha: https://www.shiksha.com/
 * 5. CollegeDekho: https://www.collegedekho.com/
 * 6. State Government Education Portals
 */

import { CollegeData } from '../src/data/collegesDatabase';

/**
 * Template for adding a new college
 * Copy this template and fill in the details
 */
const newCollegeTemplate: CollegeData = {
  id: 0, // Increment from last college ID
  name: "College Full Name",
  location: "Area/Locality",
  district: "District Name", // IMPORTANT: Must match district in stateDistricts.ts
  state: "State Name", // IMPORTANT: Must match state in stateDistricts.ts
  type: "Government", // or "Private" or "Deemed" or "Autonomous"
  level: "Both", // or "UG" or "PG"
  naac_grade: "A++", // A++, A+, A, B++, B+, B, C
  courses: [
    "Computer Science",
    "Information Technology",
    "Electronics and Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical and Electronics"
  ],
  fees_structure: {
    ug_annual: 50000, // Annual UG fee in INR
    ug_total: 200000, // Total 4-year UG fee in INR
    pg_annual: 30000, // Annual PG fee in INR (optional)
    pg_total: 60000, // Total 2-year PG fee in INR (optional)
    hostel_annual: 40000 // Annual hostel fee in INR (optional)
  },
  cutoff_general: 180.0, // General category cutoff
  cutoff_obc: 175.0, // OBC category cutoff
  cutoff_sc: 165.0, // SC category cutoff
  cutoff_st: 160.0, // ST category cutoff
  avg_package_lpa: 6.5, // Average placement package in LPA
  max_package_lpa: 35.0, // Highest placement package in LPA
  seats: 1000, // Total seats available
  nirf_rank: 100, // NIRF ranking (if available)
  website: "https://www.college-website.edu"
};

/**
 * Example: Adding colleges from different Tamil Nadu districts
 */

// ERODE DISTRICT
const erodeColleges: CollegeData[] = [
  {
    id: 26,
    name: "Bannari Amman Institute of Technology",
    location: "Sathyamangalam",
    district: "Erode",
    state: "Tamil Nadu",
    type: "Private",
    level: "Both",
    naac_grade: "A",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Mechanical Engineering", "Civil Engineering", "Electrical and Electronics"],
    fees_structure: {
      ug_annual: 75000,
      ug_total: 300000,
      pg_annual: 50000,
      pg_total: 100000,
      hostel_annual: 55000
    },
    cutoff_general: 175.0,
    cutoff_obc: 170.0,
    cutoff_sc: 160.0,
    cutoff_st: 155.0,
    avg_package_lpa: 5.2,
    max_package_lpa: 28.0,
    seats: 1200,
    nirf_rank: 180,
    website: "https://www.bitsathy.ac.in"
  },
  {
    id: 27,
    name: "Kongu Engineering College",
    location: "Perundurai",
    district: "Erode",
    state: "Tamil Nadu",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A+",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Mechanical Engineering", "Civil Engineering"],
    fees_structure: {
      ug_annual: 65000,
      ug_total: 260000,
      pg_annual: 45000,
      pg_total: 90000,
      hostel_annual: 50000
    },
    cutoff_general: 182.0,
    cutoff_obc: 177.0,
    cutoff_sc: 167.0,
    cutoff_st: 162.0,
    avg_package_lpa: 6.0,
    max_package_lpa: 32.0,
    seats: 1400,
    nirf_rank: 140,
    website: "https://www.kongu.edu"
  }
];

// THANJAVUR DISTRICT
const thanjavurColleges: CollegeData[] = [
  {
    id: 28,
    name: "Saranathan College of Engineering",
    location: "Thanjavur",
    district: "Thanjavur",
    state: "Tamil Nadu",
    type: "Private",
    level: "Both",
    naac_grade: "A",
    courses: ["Computer Science", "Electronics and Communication", "Mechanical Engineering", "Civil Engineering", "Electrical and Electronics"],
    fees_structure: {
      ug_annual: 70000,
      ug_total: 280000,
      pg_annual: 48000,
      pg_total: 96000,
      hostel_annual: 52000
    },
    cutoff_general: 172.0,
    cutoff_obc: 167.0,
    cutoff_sc: 157.0,
    cutoff_st: 152.0,
    avg_package_lpa: 4.8,
    max_package_lpa: 24.0,
    seats: 900,
    nirf_rank: 200,
    website: "https://www.saranathan.ac.in"
  }
];

// KARNATAKA - MANGALORE
const mangaloreColleges: CollegeData[] = [
  {
    id: 29,
    name: "National Institute of Technology Karnataka (NITK)",
    location: "Surathkal",
    district: "Dakshina Kannada",
    state: "Karnataka",
    type: "Government",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering"],
    fees_structure: {
      ug_annual: 170000,
      ug_total: 680000,
      pg_annual: 52000,
      pg_total: 104000,
      hostel_annual: 65000
    },
    cutoff_general: 2000,
    cutoff_obc: 4000,
    cutoff_sc: 7000,
    cutoff_st: 9000,
    avg_package_lpa: 14.5,
    max_package_lpa: 52.0,
    seats: 1100,
    nirf_rank: 12,
    website: "https://www.nitk.ac.in"
  },
  {
    id: 30,
    name: "Manipal Institute of Technology",
    location: "Manipal",
    district: "Udupi",
    state: "Karnataka",
    type: "Deemed",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Mechanical Engineering", "Biotechnology", "Aeronautical Engineering"],
    fees_structure: {
      ug_annual: 350000,
      ug_total: 1400000,
      pg_annual: 200000,
      pg_total: 400000,
      hostel_annual: 120000
    },
    cutoff_general: 178.0,
    cutoff_obc: 173.0,
    cutoff_sc: 163.0,
    cutoff_st: 158.0,
    avg_package_lpa: 8.5,
    max_package_lpa: 48.0,
    seats: 2000,
    nirf_rank: 48,
    website: "https://www.manipal.edu/mit.html"
  }
];

// MAHARASHTRA - NAGPUR
const nagpurColleges: CollegeData[] = [
  {
    id: 31,
    name: "Visvesvaraya National Institute of Technology (VNIT)",
    location: "South Ambazari Road",
    district: "Nagpur",
    state: "Maharashtra",
    type: "Government",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Electronics and Communication", "Mechanical Engineering", "Civil Engineering", "Electrical Engineering", "Metallurgical Engineering"],
    fees_structure: {
      ug_annual: 175000,
      ug_total: 700000,
      pg_annual: 55000,
      pg_total: 110000,
      hostel_annual: 60000
    },
    cutoff_general: 3500,
    cutoff_obc: 6000,
    cutoff_sc: 9000,
    cutoff_st: 11000,
    avg_package_lpa: 12.8,
    max_package_lpa: 48.0,
    seats: 1300,
    nirf_rank: 38,
    website: "https://www.vnit.ac.in"
  }
];

// WEST BENGAL - KOLKATA
const kolkataColleges: CollegeData[] = [
  {
    id: 32,
    name: "Jadavpur University - Faculty of Engineering",
    location: "Jadavpur",
    district: "Kolkata",
    state: "West Bengal",
    type: "Government",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Information Technology", "Electronics and Telecommunication", "Mechanical Engineering", "Civil Engineering", "Electrical Engineering"],
    fees_structure: {
      ug_annual: 12000,
      ug_total: 48000,
      pg_annual: 8000,
      pg_total: 16000,
      hostel_annual: 25000
    },
    cutoff_general: 188.0,
    cutoff_obc: 183.0,
    cutoff_sc: 173.0,
    cutoff_st: 168.0,
    avg_package_lpa: 9.5,
    max_package_lpa: 58.0,
    seats: 1000,
    nirf_rank: 42,
    website: "https://www.jadavpuruniversity.in"
  }
];

/**
 * Instructions for adding colleges:
 * 
 * 1. Research the college thoroughly using official sources
 * 2. Verify fee structure from official website or admission brochure
 * 3. Check NIRF rankings from https://www.nirfindia.org/
 * 4. Ensure district name matches exactly with stateDistricts.ts
 * 5. Add the college object to the appropriate district array
 * 6. Copy the college data to src/data/collegesDatabase.ts
 * 7. Update the collegesDatabase array with new entries
 * 8. Test the application to ensure colleges appear correctly
 * 
 * IMPORTANT NOTES:
 * - Always use official sources for fee information
 * - Fees should be for the current academic year (2024-2025)
 * - Cutoff marks are indicative and may vary by year
 * - NIRF rank should be from the latest ranking
 * - Ensure all required fields are filled
 * - Use proper formatting for college names (official full name)
 */

/**
 * Quick Reference: Common Engineering Courses
 */
const commonCourses = {
  core: [
    "Computer Science and Engineering",
    "Information Technology",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical and Electronics Engineering"
  ],
  specialized: [
    "Artificial Intelligence and Machine Learning",
    "Data Science",
    "Cyber Security",
    "Robotics and Automation",
    "Aerospace Engineering",
    "Automobile Engineering",
    "Biotechnology",
    "Chemical Engineering",
    "Instrumentation and Control Engineering",
    "Production Engineering",
    "Textile Technology",
    "Agricultural Engineering",
    "Food Technology",
    "Petroleum Engineering"
  ]
};

/**
 * Export all new colleges
 */
export const newColleges = [
  ...erodeColleges,
  ...thanjavurColleges,
  ...mangaloreColleges,
  ...nagpurColleges,
  ...kolkataColleges
];

// Total new colleges added: 7
console.log(`Template includes ${newColleges.length} example colleges`);
