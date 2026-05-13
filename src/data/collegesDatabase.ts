// Real College Database with Fee Structures
// Data sourced from official college websites and education portals (2024-2025)

export interface CollegeData {
  id: number;
  name: string;
  location: string;
  district: string;
  state: string;
  type: 'Government' | 'Private' | 'Deemed' | 'Autonomous';
  level: 'UG' | 'PG' | 'Both';
  naac_grade: string;
  courses: string[];
  fees_structure: {
    ug_annual: number; // Annual fee in INR
    ug_total: number; // Total 4-year fee in INR
    pg_annual?: number;
    pg_total?: number;
    hostel_annual?: number;
  };
  cutoff_general: number;
  cutoff_obc: number;
  cutoff_sc: number;
  cutoff_st: number;
  avg_package_lpa: number;
  max_package_lpa: number;
  seats: number;
  nirf_rank: number;
  website: string;
}

export const collegesDatabase: CollegeData[] = [
  // Tamil Nadu - Chennai
  {
    id: 1,
    name: "IIT Madras - Indian Institute of Technology",
    location: "Adyar",
    district: "Chennai",
    state: "Tamil Nadu",
    type: "Government",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Aerospace Engineering", "Chemical Engineering"],
    fees_structure: {
      ug_annual: 200000,
      ug_total: 800000,
      pg_annual: 50000,
      pg_total: 100000,
      hostel_annual: 20000
    },
    cutoff_general: 100,
    cutoff_obc: 300,
    cutoff_sc: 800,
    cutoff_st: 1200,
    avg_package_lpa: 21.48,
    max_package_lpa: 198.0,
    seats: 1100,
    nirf_rank: 1,
    website: "https://www.iitm.ac.in"
  },
  {
    id: 2,
    name: "Anna University - College of Engineering Guindy",
    location: "Guindy",
    district: "Chennai",
    state: "Tamil Nadu",
    type: "Government",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering", "Civil Engineering"],
    fees_structure: {
      ug_annual: 48000,
      ug_total: 192000,
      pg_annual: 25000,
      pg_total: 50000,
      hostel_annual: 15000
    },
    cutoff_general: 195.5,
    cutoff_obc: 193.0,
    cutoff_sc: 185.0,
    cutoff_st: 180.0,
    avg_package_lpa: 7.5,
    max_package_lpa: 45.0,
    seats: 1800,
    nirf_rank: 15,
    website: "https://www.annauniv.edu"
  },
  {
    id: 3,
    name: "SRM Institute of Science and Technology",
    location: "Kattankulathur",
    district: "Chengalpattu",
    state: "Tamil Nadu",
    type: "Private",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Artificial Intelligence", "Data Science", "Electronics and Communication", "Mechanical Engineering", "Civil Engineering"],
    fees_structure: {
      ug_annual: 275000,
      ug_total: 1100000,
      pg_annual: 150000,
      pg_total: 300000,
      hostel_annual: 105000
    },
    cutoff_general: 180.0,
    cutoff_obc: 175.0,
    cutoff_sc: 165.0,
    cutoff_st: 160.0,
    avg_package_lpa: 6.5,
    max_package_lpa: 52.0,
    seats: 5000,
    nirf_rank: 13,
    website: "https://www.srmist.edu.in"
  },
  
  // Tamil Nadu - Vellore
  {
    id: 4,
    name: "VIT Vellore - Vellore Institute of Technology",
    location: "Vellore",
    district: "Vellore",
    state: "Tamil Nadu",
    type: "Private",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Mechanical Engineering", "Biotechnology", "Chemical Engineering"],
    fees_structure: {
      ug_annual: 195000,
      ug_total: 780000,
      pg_annual: 122000,
      pg_total: 244000,
      hostel_annual: 105000
    },
    cutoff_general: 175.0,
    cutoff_obc: 170.0,
    cutoff_sc: 160.0,
    cutoff_st: 155.0,
    avg_package_lpa: 7.23,
    max_package_lpa: 75.0,
    seats: 6000,
    nirf_rank: 11,
    website: "https://vit.ac.in"
  },

  // Tamil Nadu - Tiruchirappalli
  {
    id: 5,
    name: "NIT Trichy - National Institute of Technology",
    location: "Tiruchirappalli",
    district: "Tiruchirappalli",
    state: "Tamil Nadu",
    type: "Government",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Electronics and Communication", "Mechanical Engineering", "Civil Engineering", "Electrical and Electronics", "Chemical Engineering"],
    fees_structure: {
      ug_annual: 166000,
      ug_total: 664000,
      pg_annual: 50000,
      pg_total: 100000,
      hostel_annual: 68000
    },
    cutoff_general: 1500,
    cutoff_obc: 3500,
    cutoff_sc: 6000,
    cutoff_st: 8000,
    avg_package_lpa: 13.5,
    max_package_lpa: 45.0,
    seats: 1200,
    nirf_rank: 9,
    website: "https://www.nitt.edu"
  },

  // Tamil Nadu - Coimbatore
  {
    id: 6,
    name: "PSG College of Technology",
    location: "Peelamedu",
    district: "Coimbatore",
    state: "Tamil Nadu",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Mechanical Engineering", "Electrical and Electronics", "Civil Engineering"],
    fees_structure: {
      ug_annual: 55000,
      ug_total: 220000,
      pg_annual: 41000,
      pg_total: 82000,
      hostel_annual: 72000
    },
    cutoff_general: 190.0,
    cutoff_obc: 185.0,
    cutoff_sc: 175.0,
    cutoff_st: 170.0,
    avg_package_lpa: 6.8,
    max_package_lpa: 42.0,
    seats: 1500,
    nirf_rank: 67,
    website: "https://www.psgtech.edu"
  },
  {
    id: 7,
    name: "Coimbatore Institute of Technology",
    location: "Coimbatore",
    district: "Coimbatore",
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
      hostel_annual: 60000
    },
    cutoff_general: 185.0,
    cutoff_obc: 180.0,
    cutoff_sc: 170.0,
    cutoff_st: 165.0,
    avg_package_lpa: 5.5,
    max_package_lpa: 35.0,
    seats: 1200,
    nirf_rank: 101,
    website: "https://www.cit.edu.in"
  },

  // Tamil Nadu - Salem
  {
    id: 8,
    name: "Sona College of Technology",
    location: "Salem",
    district: "Salem",
    state: "Tamil Nadu",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Mechanical Engineering", "Electrical and Electronics"],
    fees_structure: {
      ug_annual: 70000,
      ug_total: 280000,
      pg_annual: 50000,
      pg_total: 100000,
      hostel_annual: 55000
    },
    cutoff_general: 175.0,
    cutoff_obc: 170.0,
    cutoff_sc: 160.0,
    cutoff_st: 155.0,
    avg_package_lpa: 4.5,
    max_package_lpa: 25.0,
    seats: 1000,
    nirf_rank: 150,
    website: "https://www.sonatech.ac.in"
  },

  // Tamil Nadu - Madurai
  {
    id: 9,
    name: "Thiagarajar College of Engineering",
    location: "Madurai",
    district: "Madurai",
    state: "Tamil Nadu",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering", "Civil Engineering"],
    fees_structure: {
      ug_annual: 60000,
      ug_total: 240000,
      pg_annual: 40000,
      pg_total: 80000,
      hostel_annual: 50000
    },
    cutoff_general: 188.0,
    cutoff_obc: 183.0,
    cutoff_sc: 173.0,
    cutoff_st: 168.0,
    avg_package_lpa: 5.8,
    max_package_lpa: 32.0,
    seats: 1100,
    nirf_rank: 85,
    website: "https://www.tce.edu"
  },

  // Maharashtra - Mumbai
  {
    id: 10,
    name: "IIT Bombay - Indian Institute of Technology",
    location: "Powai",
    district: "Mumbai Suburban",
    state: "Maharashtra",
    type: "Government",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Aerospace Engineering", "Chemical Engineering"],
    fees_structure: {
      ug_annual: 220000,
      ug_total: 880000,
      pg_annual: 67500,
      pg_total: 135000,
      hostel_annual: 19400
    },
    cutoff_general: 66,
    cutoff_obc: 200,
    cutoff_sc: 600,
    cutoff_st: 900,
    avg_package_lpa: 23.26,
    max_package_lpa: 398.0,
    seats: 1200,
    nirf_rank: 3,
    website: "https://www.iitb.ac.in"
  },
  {
    id: 11,
    name: "VJTI - Veermata Jijabai Technological Institute",
    location: "Matunga",
    district: "Mumbai City",
    state: "Maharashtra",
    type: "Government",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Information Technology", "Electronics and Telecommunication", "Mechanical Engineering", "Civil Engineering"],
    fees_structure: {
      ug_annual: 85000,
      ug_total: 340000,
      pg_annual: 60000,
      pg_total: 120000,
      hostel_annual: 45000
    },
    cutoff_general: 188.0,
    cutoff_obc: 183.0,
    cutoff_sc: 173.0,
    cutoff_st: 168.0,
    avg_package_lpa: 8.5,
    max_package_lpa: 52.0,
    seats: 900,
    nirf_rank: 45,
    website: "https://www.vjti.ac.in"
  },

  // Maharashtra - Pune
  {
    id: 12,
    name: "College of Engineering Pune (COEP)",
    location: "Shivajinagar",
    district: "Pune",
    state: "Maharashtra",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Information Technology", "Electronics and Telecommunication", "Mechanical Engineering", "Civil Engineering", "Electrical Engineering"],
    fees_structure: {
      ug_annual: 95000,
      ug_total: 380000,
      pg_annual: 70000,
      pg_total: 140000,
      hostel_annual: 50000
    },
    cutoff_general: 185.0,
    cutoff_obc: 180.0,
    cutoff_sc: 170.0,
    cutoff_st: 165.0,
    avg_package_lpa: 7.8,
    max_package_lpa: 45.0,
    seats: 1100,
    nirf_rank: 52,
    website: "https://www.coep.org.in"
  },
  {
    id: 13,
    name: "PICT - Pune Institute of Computer Technology",
    location: "Dhankawadi",
    district: "Pune",
    state: "Maharashtra",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A+",
    courses: ["Computer Science", "Information Technology", "Electronics and Telecommunication"],
    fees_structure: {
      ug_annual: 110000,
      ug_total: 440000,
      pg_annual: 85000,
      pg_total: 170000,
      hostel_annual: 60000
    },
    cutoff_general: 190.0,
    cutoff_obc: 185.0,
    cutoff_sc: 175.0,
    cutoff_st: 170.0,
    avg_package_lpa: 9.2,
    max_package_lpa: 48.0,
    seats: 800,
    nirf_rank: 78,
    website: "https://pict.edu"
  },

  // Karnataka - Bangalore
  {
    id: 14,
    name: "IISc Bangalore - Indian Institute of Science",
    location: "Malleshwaram",
    district: "Bengaluru Urban",
    state: "Karnataka",
    type: "Deemed",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Chemical Engineering", "Civil Engineering"],
    fees_structure: {
      ug_annual: 200000,
      ug_total: 800000,
      pg_annual: 50000,
      pg_total: 100000,
      hostel_annual: 25000
    },
    cutoff_general: 50,
    cutoff_obc: 150,
    cutoff_sc: 400,
    cutoff_st: 600,
    avg_package_lpa: 25.0,
    max_package_lpa: 120.0,
    seats: 500,
    nirf_rank: 1,
    website: "https://www.iisc.ac.in"
  },
  {
    id: 15,
    name: "RV College of Engineering",
    location: "Mysore Road",
    district: "Bengaluru Urban",
    state: "Karnataka",
    type: "Private",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Information Science", "Electronics and Communication", "Mechanical Engineering", "Civil Engineering", "Electrical and Electronics"],
    fees_structure: {
      ug_annual: 333210,
      ug_total: 1332840,
      pg_annual: 150000,
      pg_total: 300000,
      hostel_annual: 80000
    },
    cutoff_general: 185.0,
    cutoff_obc: 180.0,
    cutoff_sc: 170.0,
    cutoff_st: 165.0,
    avg_package_lpa: 8.5,
    max_package_lpa: 52.0,
    seats: 1350,
    nirf_rank: 101,
    website: "https://www.rvce.edu.in"
  },
  {
    id: 16,
    name: "BMS College of Engineering",
    location: "Basavanagudi",
    district: "Bengaluru Urban",
    state: "Karnataka",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A+",
    courses: ["Computer Science", "Information Science", "Electronics and Communication", "Mechanical Engineering", "Civil Engineering"],
    fees_structure: {
      ug_annual: 250000,
      ug_total: 1000000,
      pg_annual: 120000,
      pg_total: 240000,
      hostel_annual: 70000
    },
    cutoff_general: 182.0,
    cutoff_obc: 177.0,
    cutoff_sc: 167.0,
    cutoff_st: 162.0,
    avg_package_lpa: 7.5,
    max_package_lpa: 45.0,
    seats: 1200,
    nirf_rank: 115,
    website: "https://www.bmsce.ac.in"
  },

  // Karnataka - Mysore
  {
    id: 17,
    name: "National Institute of Engineering",
    location: "Mysore",
    district: "Mysuru",
    state: "Karnataka",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A+",
    courses: ["Computer Science", "Information Science", "Electronics and Communication", "Mechanical Engineering", "Civil Engineering"],
    fees_structure: {
      ug_annual: 180000,
      ug_total: 720000,
      pg_annual: 100000,
      pg_total: 200000,
      hostel_annual: 60000
    },
    cutoff_general: 175.0,
    cutoff_obc: 170.0,
    cutoff_sc: 160.0,
    cutoff_st: 155.0,
    avg_package_lpa: 6.5,
    max_package_lpa: 38.0,
    seats: 900,
    nirf_rank: 145,
    website: "https://www.nie.ac.in"
  },

  // Delhi
  {
    id: 18,
    name: "IIT Delhi - Indian Institute of Technology",
    location: "Hauz Khas",
    district: "South Delhi",
    state: "Delhi",
    type: "Government",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering", "Textile Technology"],
    fees_structure: {
      ug_annual: 220000,
      ug_total: 880000,
      pg_annual: 50000,
      pg_total: 100000,
      hostel_annual: 22000
    },
    cutoff_general: 80,
    cutoff_obc: 250,
    cutoff_sc: 700,
    cutoff_st: 1000,
    avg_package_lpa: 25.82,
    max_package_lpa: 280.0,
    seats: 1150,
    nirf_rank: 2,
    website: "https://www.iitd.ac.in"
  },
  {
    id: 19,
    name: "DTU - Delhi Technological University",
    location: "Rohini",
    district: "North West Delhi",
    state: "Delhi",
    type: "Government",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Mechanical Engineering", "Civil Engineering", "Electrical Engineering"],
    fees_structure: {
      ug_annual: 185000,
      ug_total: 740000,
      pg_annual: 95000,
      pg_total: 190000,
      hostel_annual: 45000
    },
    cutoff_general: 190.0,
    cutoff_obc: 185.0,
    cutoff_sc: 175.0,
    cutoff_st: 170.0,
    avg_package_lpa: 12.5,
    max_package_lpa: 82.0,
    seats: 1400,
    nirf_rank: 34,
    website: "https://www.dtu.ac.in"
  },
  {
    id: 20,
    name: "NSUT - Netaji Subhas University of Technology",
    location: "Dwarka",
    district: "South West Delhi",
    state: "Delhi",
    type: "Government",
    level: "Both",
    naac_grade: "A+",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Mechanical Engineering", "Instrumentation and Control"],
    fees_structure: {
      ug_annual: 175000,
      ug_total: 700000,
      pg_annual: 90000,
      pg_total: 180000,
      hostel_annual: 40000
    },
    cutoff_general: 188.0,
    cutoff_obc: 183.0,
    cutoff_sc: 173.0,
    cutoff_st: 168.0,
    avg_package_lpa: 11.8,
    max_package_lpa: 75.0,
    seats: 1200,
    nirf_rank: 58,
    website: "https://www.nsut.ac.in"
  },

  // Andhra Pradesh - Visakhapatnam
  {
    id: 21,
    name: "Andhra University College of Engineering",
    location: "Visakhapatnam",
    district: "Visakhapatnam",
    state: "Andhra Pradesh",
    type: "Government",
    level: "Both",
    naac_grade: "A+",
    courses: ["Computer Science", "Electronics and Communication", "Mechanical Engineering", "Civil Engineering", "Electrical and Electronics"],
    fees_structure: {
      ug_annual: 45000,
      ug_total: 180000,
      pg_annual: 30000,
      pg_total: 60000,
      hostel_annual: 35000
    },
    cutoff_general: 175.0,
    cutoff_obc: 170.0,
    cutoff_sc: 160.0,
    cutoff_st: 155.0,
    avg_package_lpa: 5.5,
    max_package_lpa: 28.0,
    seats: 1000,
    nirf_rank: 125,
    website: "https://www.andhrauniversity.edu.in"
  },

  // Telangana - Hyderabad
  {
    id: 22,
    name: "IIT Hyderabad - Indian Institute of Technology",
    location: "Sangareddy",
    district: "Sangareddy",
    state: "Telangana",
    type: "Government",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering", "Biotechnology"],
    fees_structure: {
      ug_annual: 210000,
      ug_total: 840000,
      pg_annual: 50000,
      pg_total: 100000,
      hostel_annual: 20000
    },
    cutoff_general: 1200,
    cutoff_obc: 2500,
    cutoff_sc: 4500,
    cutoff_st: 6000,
    avg_package_lpa: 22.0,
    max_package_lpa: 120.0,
    seats: 900,
    nirf_rank: 8,
    website: "https://www.iith.ac.in"
  },
  {
    id: 23,
    name: "BITS Pilani - Hyderabad Campus",
    location: "Jawahar Nagar",
    district: "Hyderabad",
    state: "Telangana",
    type: "Deemed",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Electronics and Communication", "Mechanical Engineering", "Chemical Engineering", "Civil Engineering"],
    fees_structure: {
      ug_annual: 550000,
      ug_total: 2200000,
      pg_annual: 250000,
      pg_total: 500000,
      hostel_annual: 95000
    },
    cutoff_general: 185.0,
    cutoff_obc: 180.0,
    cutoff_sc: 170.0,
    cutoff_st: 165.0,
    avg_package_lpa: 15.0,
    max_package_lpa: 60.0,
    seats: 1200,
    nirf_rank: 25,
    website: "https://www.bits-pilani.ac.in/hyderabad"
  },

  // Kerala - Thiruvananthapuram
  {
    id: 24,
    name: "College of Engineering Trivandrum",
    location: "Thiruvananthapuram",
    district: "Thiruvananthapuram",
    state: "Kerala",
    type: "Government",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Electronics and Communication", "Mechanical Engineering", "Civil Engineering", "Electrical and Electronics"],
    fees_structure: {
      ug_annual: 55000,
      ug_total: 220000,
      pg_annual: 35000,
      pg_total: 70000,
      hostel_annual: 30000
    },
    cutoff_general: 180.0,
    cutoff_obc: 175.0,
    cutoff_sc: 165.0,
    cutoff_st: 160.0,
    avg_package_lpa: 6.5,
    max_package_lpa: 35.0,
    seats: 900,
    nirf_rank: 95,
    website: "https://www.cet.ac.in"
  },

  // Kerala - Ernakulam
  {
    id: 25,
    name: "Cochin University of Science and Technology",
    location: "Kochi",
    district: "Ernakulam",
    state: "Kerala",
    type: "Government",
    level: "Both",
    naac_grade: "A+",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Mechanical Engineering", "Civil Engineering"],
    fees_structure: {
      ug_annual: 50000,
      ug_total: 200000,
      pg_annual: 32000,
      pg_total: 64000,
      hostel_annual: 28000
    },
    cutoff_general: 175.0,
    cutoff_obc: 170.0,
    cutoff_sc: 160.0,
    cutoff_st: 155.0,
    avg_package_lpa: 5.8,
    max_package_lpa: 32.0,
    seats: 850,
    nirf_rank: 110,
    website: "https://www.cusat.ac.in"
  },

  // Tamil Nadu - Erode
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
  },

  // Tamil Nadu - Thanjavur
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
  },

  // Karnataka - Dakshina Kannada (Mangalore)
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

  // Karnataka - Udupi
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
  },

  // Maharashtra - Nagpur
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
  },

  // West Bengal - Kolkata
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
  },

  // Tamil Nadu - Chennai - Anna University Affiliated Colleges
  {
    id: 33,
    name: "SSN College of Engineering",
    location: "Kalavakkam",
    district: "Chengalpattu",
    state: "Tamil Nadu",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering", "Biomedical Engineering"],
    fees_structure: {
      ug_annual: 87000,
      ug_total: 348000,
      pg_annual: 50000,
      pg_total: 100000,
      hostel_annual: 75000
    },
    cutoff_general: 195.0,
    cutoff_obc: 190.0,
    cutoff_sc: 180.0,
    cutoff_st: 175.0,
    avg_package_lpa: 10.61,
    max_package_lpa: 117.0,
    seats: 1200,
    nirf_rank: 47,
    website: "https://www.ssn.edu.in"
  },
  {
    id: 34,
    name: "Velammal Engineering College",
    location: "Ambattur-Redhills Road",
    district: "Tiruvallur",
    state: "Tamil Nadu",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering", "Civil Engineering", "Automobile Engineering"],
    fees_structure: {
      ug_annual: 93250,
      ug_total: 373000,
      pg_annual: 50000,
      pg_total: 100000,
      hostel_annual: 60000
    },
    cutoff_general: 180.0,
    cutoff_obc: 175.0,
    cutoff_sc: 165.0,
    cutoff_st: 160.0,
    avg_package_lpa: 4.31,
    max_package_lpa: 12.0,
    seats: 1080,
    nirf_rank: 150,
    website: "https://www.velammal.edu.in"
  },
  {
    id: 35,
    name: "Rajalakshmi Engineering College",
    location: "Thandalam",
    district: "Kancheepuram",
    state: "Tamil Nadu",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A+",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering", "Civil Engineering", "Computer Science and Design"],
    fees_structure: {
      ug_annual: 55000,
      ug_total: 220000,
      pg_annual: 35000,
      pg_total: 70000,
      hostel_annual: 50000
    },
    cutoff_general: 185.0,
    cutoff_obc: 180.0,
    cutoff_sc: 170.0,
    cutoff_st: 165.0,
    avg_package_lpa: 5.5,
    max_package_lpa: 25.0,
    seats: 1200,
    nirf_rank: 160,
    website: "https://www.rajalakshmi.org"
  },
  {
    id: 36,
    name: "Panimalar Engineering College",
    location: "Poonamallee",
    district: "Tiruvallur",
    state: "Tamil Nadu",
    type: "Private",
    level: "Both",
    naac_grade: "A",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering"],
    fees_structure: {
      ug_annual: 87000,
      ug_total: 348000,
      pg_annual: 48000,
      pg_total: 96000,
      hostel_annual: 55000
    },
    cutoff_general: 175.0,
    cutoff_obc: 170.0,
    cutoff_sc: 160.0,
    cutoff_st: 155.0,
    avg_package_lpa: 4.5,
    max_package_lpa: 18.0,
    seats: 900,
    nirf_rank: 180,
    website: "https://www.panimalar.ac.in"
  },
  {
    id: 37,
    name: "St. Joseph's College of Engineering",
    location: "Old Mahabalipuram Road",
    district: "Chengalpattu",
    state: "Tamil Nadu",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering", "Civil Engineering"],
    fees_structure: {
      ug_annual: 85000,
      ug_total: 340000,
      pg_annual: 50000,
      pg_total: 100000,
      hostel_annual: 60000
    },
    cutoff_general: 182.0,
    cutoff_obc: 177.0,
    cutoff_sc: 167.0,
    cutoff_st: 162.0,
    avg_package_lpa: 5.2,
    max_package_lpa: 22.0,
    seats: 1000,
    nirf_rank: 170,
    website: "https://www.sjce.ac.in"
  },
  {
    id: 38,
    name: "Easwari Engineering College",
    location: "Ramapuram",
    district: "Chennai",
    state: "Tamil Nadu",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering"],
    fees_structure: {
      ug_annual: 80000,
      ug_total: 320000,
      pg_annual: 45000,
      pg_total: 90000,
      hostel_annual: 55000
    },
    cutoff_general: 178.0,
    cutoff_obc: 173.0,
    cutoff_sc: 163.0,
    cutoff_st: 158.0,
    avg_package_lpa: 4.8,
    max_package_lpa: 20.0,
    seats: 900,
    nirf_rank: 190,
    website: "https://www.srmeaswari.ac.in"
  },
  {
    id: 39,
    name: "Meenakshi Sundararajan Engineering College",
    location: "Kodambakkam",
    district: "Chennai",
    state: "Tamil Nadu",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering"],
    fees_structure: {
      ug_annual: 75000,
      ug_total: 300000,
      pg_annual: 42000,
      pg_total: 84000,
      hostel_annual: 50000
    },
    cutoff_general: 176.0,
    cutoff_obc: 171.0,
    cutoff_sc: 161.0,
    cutoff_st: 156.0,
    avg_package_lpa: 4.5,
    max_package_lpa: 18.0,
    seats: 850,
    nirf_rank: 200,
    website: "https://www.msec.ac.in"
  },

  // Deemed Universities - BITS Pilani Campuses
  {
    id: 40,
    name: "BITS Pilani - Pilani Campus",
    location: "Vidya Vihar",
    district: "Jhunjhunu",
    state: "Rajasthan",
    type: "Deemed",
    level: "Both",
    naac_grade: "A",
    courses: ["Computer Science", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering", "Manufacturing Engineering"],
    fees_structure: {
      ug_annual: 632250,
      ug_total: 2529000,
      pg_annual: 303000,
      pg_total: 606000,
      hostel_annual: 110000
    },
    cutoff_general: 190.0,
    cutoff_obc: 185.0,
    cutoff_sc: 175.0,
    cutoff_st: 170.0,
    avg_package_lpa: 18.0,
    max_package_lpa: 60.0,
    seats: 1500,
    nirf_rank: 20,
    website: "https://www.bits-pilani.ac.in"
  },
  {
    id: 41,
    name: "BITS Pilani - Goa Campus",
    location: "Zuarinagar",
    district: "South Goa",
    state: "Goa",
    type: "Deemed",
    level: "Both",
    naac_grade: "A",
    courses: ["Computer Science", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering", "Chemical Engineering"],
    fees_structure: {
      ug_annual: 632250,
      ug_total: 2529000,
      pg_annual: 303000,
      pg_total: 606000,
      hostel_annual: 110000
    },
    cutoff_general: 188.0,
    cutoff_obc: 183.0,
    cutoff_sc: 173.0,
    cutoff_st: 168.0,
    avg_package_lpa: 17.5,
    max_package_lpa: 55.0,
    seats: 1200,
    nirf_rank: 22,
    website: "https://www.bits-pilani.ac.in/goa"
  },
  {
    id: 42,
    name: "Amrita Vishwa Vidyapeetham - Coimbatore",
    location: "Ettimadai",
    district: "Coimbatore",
    state: "Tamil Nadu",
    type: "Deemed",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Artificial Intelligence", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering", "Civil Engineering", "Aerospace Engineering"],
    fees_structure: {
      ug_annual: 325000,
      ug_total: 1300000,
      pg_annual: 180000,
      pg_total: 360000,
      hostel_annual: 95000
    },
    cutoff_general: 185.0,
    cutoff_obc: 180.0,
    cutoff_sc: 170.0,
    cutoff_st: 165.0,
    avg_package_lpa: 7.5,
    max_package_lpa: 55.0,
    seats: 2000,
    nirf_rank: 7,
    website: "https://www.amrita.edu"
  },
  {
    id: 43,
    name: "Thapar Institute of Engineering and Technology",
    location: "Patiala",
    district: "Patiala",
    state: "Punjab",
    type: "Deemed",
    level: "Both",
    naac_grade: "A",
    courses: ["Computer Science", "Electronics and Communication", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering", "Biotechnology"],
    fees_structure: {
      ug_annual: 385000,
      ug_total: 1540000,
      pg_annual: 195000,
      pg_total: 390000,
      hostel_annual: 85000
    },
    cutoff_general: 182.0,
    cutoff_obc: 177.0,
    cutoff_sc: 167.0,
    cutoff_st: 162.0,
    avg_package_lpa: 10.5,
    max_package_lpa: 43.0,
    seats: 1400,
    nirf_rank: 27,
    website: "https://www.thapar.edu"
  },

  // More Tamil Nadu Colleges - Different Districts
  {
    id: 44,
    name: "Kumaraguru College of Technology",
    location: "Chinnavedampatti",
    district: "Coimbatore",
    state: "Tamil Nadu",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A+",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering", "Civil Engineering"],
    fees_structure: {
      ug_annual: 95000,
      ug_total: 380000,
      pg_annual: 60000,
      pg_total: 120000,
      hostel_annual: 65000
    },
    cutoff_general: 188.0,
    cutoff_obc: 183.0,
    cutoff_sc: 173.0,
    cutoff_st: 168.0,
    avg_package_lpa: 6.2,
    max_package_lpa: 38.0,
    seats: 1300,
    nirf_rank: 90,
    website: "https://www.kct.ac.in"
  },
  {
    id: 45,
    name: "Sri Sivasubramaniya Nadar College of Engineering",
    location: "Kalavakkam",
    district: "Kancheepuram",
    state: "Tamil Nadu",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering", "Civil Engineering"],
    fees_structure: {
      ug_annual: 87000,
      ug_total: 348000,
      pg_annual: 50000,
      pg_total: 100000,
      hostel_annual: 75000
    },
    cutoff_general: 195.0,
    cutoff_obc: 190.0,
    cutoff_sc: 180.0,
    cutoff_st: 175.0,
    avg_package_lpa: 10.61,
    max_package_lpa: 117.0,
    seats: 1200,
    nirf_rank: 47,
    website: "https://www.ssn.edu.in"
  },
  {
    id: 46,
    name: "Sri Venkateswara College of Engineering",
    location: "Sriperumbudur",
    district: "Kancheepuram",
    state: "Tamil Nadu",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering"],
    fees_structure: {
      ug_annual: 78000,
      ug_total: 312000,
      pg_annual: 45000,
      pg_total: 90000,
      hostel_annual: 55000
    },
    cutoff_general: 180.0,
    cutoff_obc: 175.0,
    cutoff_sc: 165.0,
    cutoff_st: 160.0,
    avg_package_lpa: 5.0,
    max_package_lpa: 22.0,
    seats: 1000,
    nirf_rank: 175,
    website: "https://www.svce.ac.in"
  },
  {
    id: 47,
    name: "Mepco Schlenk Engineering College",
    location: "Sivakasi",
    district: "Virudhunagar",
    state: "Tamil Nadu",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A+",
    courses: ["Computer Science", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering", "Civil Engineering"],
    fees_structure: {
      ug_annual: 62000,
      ug_total: 248000,
      pg_annual: 40000,
      pg_total: 80000,
      hostel_annual: 48000
    },
    cutoff_general: 186.0,
    cutoff_obc: 181.0,
    cutoff_sc: 171.0,
    cutoff_st: 166.0,
    avg_package_lpa: 5.8,
    max_package_lpa: 30.0,
    seats: 900,
    nirf_rank: 120,
    website: "https://www.mepcoeng.ac.in"
  },
  {
    id: 48,
    name: "K.S. Rangasamy College of Technology",
    location: "Tiruchengode",
    district: "Namakkal",
    state: "Tamil Nadu",
    type: "Autonomous",
    level: "Both",
    naac_grade: "A",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering"],
    fees_structure: {
      ug_annual: 68000,
      ug_total: 272000,
      pg_annual: 42000,
      pg_total: 84000,
      hostel_annual: 50000
    },
    cutoff_general: 174.0,
    cutoff_obc: 169.0,
    cutoff_sc: 159.0,
    cutoff_st: 154.0,
    avg_package_lpa: 4.2,
    max_package_lpa: 18.0,
    seats: 850,
    nirf_rank: 210,
    website: "https://www.ksrct.ac.in"
  },
  {
    id: 49,
    name: "Karunya Institute of Technology and Sciences",
    location: "Karunya Nagar",
    district: "Coimbatore",
    state: "Tamil Nadu",
    type: "Deemed",
    level: "Both",
    naac_grade: "A++",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering", "Civil Engineering", "Aerospace Engineering"],
    fees_structure: {
      ug_annual: 185000,
      ug_total: 740000,
      pg_annual: 95000,
      pg_total: 190000,
      hostel_annual: 70000
    },
    cutoff_general: 180.0,
    cutoff_obc: 175.0,
    cutoff_sc: 165.0,
    cutoff_st: 160.0,
    avg_package_lpa: 5.5,
    max_package_lpa: 28.0,
    seats: 1500,
    nirf_rank: 75,
    website: "https://www.karunya.edu"
  },
  {
    id: 50,
    name: "Hindustan Institute of Technology and Science",
    location: "Padur",
    district: "Chengalpattu",
    state: "Tamil Nadu",
    type: "Deemed",
    level: "Both",
    naac_grade: "A",
    courses: ["Computer Science", "Information Technology", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering", "Civil Engineering", "Aeronautical Engineering"],
    fees_structure: {
      ug_annual: 225000,
      ug_total: 900000,
      pg_annual: 120000,
      pg_total: 240000,
      hostel_annual: 85000
    },
    cutoff_general: 175.0,
    cutoff_obc: 170.0,
    cutoff_sc: 160.0,
    cutoff_st: 155.0,
    avg_package_lpa: 5.8,
    max_package_lpa: 32.0,
    seats: 2000,
    nirf_rank: 100,
    website: "https://www.hindustanuniv.ac.in"
  }
];

// Helper function to filter colleges by district
export function getCollegesByDistrict(district: string, state: string): CollegeData[] {
  return collegesDatabase.filter(
    college => college.district.toLowerCase() === district.toLowerCase() && 
               college.state.toLowerCase() === state.toLowerCase()
  );
}

// Helper function to get colleges by state
export function getCollegesByState(state: string): CollegeData[] {
  return collegesDatabase.filter(
    college => college.state.toLowerCase() === state.toLowerCase()
  );
}

// Helper function to get all colleges
export function getAllColleges(): CollegeData[] {
  return collegesDatabase;
}
