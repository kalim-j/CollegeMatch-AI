
import { NextResponse } from "next/server";
import { collegesDatabase, getCollegesByDistrict, getCollegesByState, getAllColleges } from "@/data/collegesDatabase";

export async function POST(req: Request) {
  try {
    const { studentProfile, searchOtherStates = false } = await req.json();

    // First, try to find colleges in the student's district
    let availableColleges = getCollegesByDistrict(studentProfile.district, studentProfile.state);
    
    let searchScope = "district";
    
    // If no colleges found in district and not searching other states, return empty with flag
    if (availableColleges.length === 0 && !searchOtherStates) {
      return NextResponse.json({ 
        colleges: [], 
        noCollegesInDistrict: true,
        district: studentProfile.district,
        state: studentProfile.state
      });
    }
    
    // If searching other states or no colleges in district, expand search
    if (availableColleges.length === 0 || searchOtherStates) {
      if (searchOtherStates) {
        availableColleges = getAllColleges();
        searchScope = "all_states";
      } else {
        availableColleges = getCollegesByState(studentProfile.state);
        searchScope = "state";
      }
    }

    // Filter colleges based on student profile
    const filteredColleges = availableColleges.filter(college => {
      // Filter by course level
      if (studentProfile.courseLevel === "UG" && college.level !== "UG" && college.level !== "Both") {
        return false;
      }
      if (studentProfile.courseLevel === "PG" && college.level !== "PG" && college.level !== "Both") {
        return false;
      }

      // Filter by budget
      if (studentProfile.budget === "Government" && college.type !== "Government") {
        return false;
      }
      if (studentProfile.budget === "Private" && college.type === "Government") {
        return false;
      }

      // Filter by stream - check if college offers related courses
      const streamKeywords = studentProfile.stream.toLowerCase();
      
      // If stream is Engineering or contains "engineering", match with engineering colleges
      if (streamKeywords.includes("engineering") || streamKeywords === "engineering") {
        // Check if college has engineering courses
        const hasEngineeringCourse = college.courses.some(course => 
          course.toLowerCase().includes("engineering") || 
          course.toLowerCase().includes("computer") ||
          course.toLowerCase().includes("mechanical") ||
          course.toLowerCase().includes("electronics") ||
          course.toLowerCase().includes("electrical") ||
          course.toLowerCase().includes("civil")
        );
        return hasEngineeringCourse;
      }
      
      // If stream is Medical, match with medical colleges
      if (streamKeywords.includes("medical") || streamKeywords === "medical") {
        const hasMedicalCourse = college.courses.some(course => 
          course.toLowerCase().includes("mbbs") || 
          course.toLowerCase().includes("md") ||
          course.toLowerCase().includes("ms") ||
          course.toLowerCase().includes("medical") ||
          course.toLowerCase().includes("nursing")
        );
        return hasMedicalCourse;
      }
      
      // If stream is Arts, match with arts colleges
      if (streamKeywords.includes("arts") || streamKeywords.includes("science")) {
        const hasArtsCourse = college.courses.some(course => 
          course.toLowerCase().includes("economics") || 
          course.toLowerCase().includes("english") ||
          course.toLowerCase().includes("history") ||
          course.toLowerCase().includes("mathematics") ||
          course.toLowerCase().includes("physics") ||
          course.toLowerCase().includes("chemistry") ||
          course.toLowerCase().includes("commerce")
        );
        return hasArtsCourse;
      }
      
      // If stream is Law, match with law colleges
      if (streamKeywords.includes("law") || streamKeywords === "law") {
        const hasLawCourse = college.courses.some(course => 
          course.toLowerCase().includes("law") || 
          course.toLowerCase().includes("llb") ||
          course.toLowerCase().includes("llm")
        );
        return hasLawCourse;
      }
      
      // If stream is MBA/Management, match with MBA colleges
      if (streamKeywords.includes("mba") || streamKeywords.includes("management")) {
        const hasMBACourse = college.courses.some(course => 
          course.toLowerCase().includes("mba") || 
          course.toLowerCase().includes("management") ||
          course.toLowerCase().includes("business")
        );
        return hasMBACourse;
      }
      
      // For other streams, check if college offers related courses
      const hasMatchingCourse = college.courses.some(course => 
        course.toLowerCase().includes(streamKeywords) || 
        streamKeywords.includes(course.toLowerCase().split(" ")[0])
      );
      
      return hasMatchingCourse;
    });

    // Calculate match scores and add AI reasoning
    const collegesWithScores = filteredColleges.map(college => {
      let matchScore = 70; // Base score

      // Location proximity bonus
      if (college.district.toLowerCase() === studentProfile.district.toLowerCase()) {
        matchScore += 15;
      } else if (college.state.toLowerCase() === studentProfile.state.toLowerCase()) {
        matchScore += 8;
      }

      // Cutoff matching
      const quotaCutoff = getQuotaCutoff(college, studentProfile.quota);
      const studentCutoff = parseFloat(studentProfile.cutoffMark) || 0;
      
      if (studentCutoff > 0) {
        if (studentProfile.cutoffRange === "-10") {
          // Safety colleges - student cutoff is higher than college cutoff
          if (studentCutoff >= quotaCutoff + 10) matchScore += 10;
          else if (studentCutoff >= quotaCutoff) matchScore += 5;
        } else if (studentProfile.cutoffRange === "+10") {
          // Dream colleges - student cutoff is close to or slightly below college cutoff
          if (studentCutoff >= quotaCutoff - 10 && studentCutoff <= quotaCutoff) matchScore += 10;
          else if (studentCutoff >= quotaCutoff - 20) matchScore += 5;
        } else {
          // Exact match
          if (Math.abs(studentCutoff - quotaCutoff) <= 5) matchScore += 10;
          else if (Math.abs(studentCutoff - quotaCutoff) <= 10) matchScore += 5;
        }
      }

      // Budget alignment
      if (studentProfile.budget === "Government" && college.type === "Government") {
        matchScore += 5;
      }

      // NIRF ranking bonus
      if (college.nirf_rank <= 50) matchScore += 5;
      else if (college.nirf_rank <= 100) matchScore += 3;

      // Cap at 100
      matchScore = Math.min(matchScore, 100);

      // Generate AI reasoning
      const whyFit = generateWhyFit(college, studentProfile, matchScore);

      return {
        ...college,
        match_score: matchScore,
        why_fit: whyFit,
        course: college.courses[0], // Primary course
        fees_approx: formatFees(college.fees_structure, studentProfile.courseLevel)
      };
    });

    // Sort by match score and take top 8
    const topColleges = collegesWithScores
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 8);

    return NextResponse.json({ 
      colleges: topColleges,
      searchScope,
      totalAvailable: filteredColleges.length
    });
  } catch (error: any) {
    console.error("College Matching Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getQuotaCutoff(college: any, quota: string): number {
  switch (quota.toLowerCase()) {
    case "obc":
    case "mbc":
    case "bc":
      return college.cutoff_obc;
    case "sc":
      return college.cutoff_sc;
    case "st":
      return college.cutoff_st;
    default:
      return college.cutoff_general;
  }
}

function formatFees(fees: any, level: string): string {
  if (level === "UG") {
    return `₹${(fees.ug_total / 100000).toFixed(2)} Lakhs (4 years)`;
  } else {
    return `₹${((fees.pg_total || fees.ug_total) / 100000).toFixed(2)} Lakhs (2 years)`;
  }
}

function generateWhyFit(college: any, profile: any, matchScore: number): string {
  const reasons = [];

  if (college.district.toLowerCase() === profile.district.toLowerCase()) {
    reasons.push(`Located in your home district ${profile.district}`);
  } else if (college.state.toLowerCase() === profile.state.toLowerCase()) {
    reasons.push(`Located in ${college.state}, your home state`);
  }

  if (college.type === "Government") {
    reasons.push("affordable government institution with quality education");
  } else if (college.type === "Private" && college.nirf_rank <= 50) {
    reasons.push("top-ranked private institution with excellent placement records");
  }

  if (college.nirf_rank <= 20) {
    reasons.push(`prestigious NIRF rank #${college.nirf_rank} institution`);
  }

  if (college.avg_package_lpa >= 10) {
    reasons.push(`strong placement record with ₹${college.avg_package_lpa} LPA average package`);
  }

  const quotaCutoff = getQuotaCutoff(college, profile.quota);
  const studentCutoff = parseFloat(profile.cutoffMark) || 0;
  
  if (studentCutoff > 0) {
    if (profile.cutoffRange === "-10" && studentCutoff >= quotaCutoff + 10) {
      reasons.push("safe choice with your cutoff score well above requirements");
    } else if (profile.cutoffRange === "+10" && studentCutoff >= quotaCutoff - 10) {
      reasons.push("aspirational choice that matches your ambitions");
    } else if (Math.abs(studentCutoff - quotaCutoff) <= 5) {
      reasons.push("excellent match for your cutoff score");
    }
  }

  if (reasons.length === 0) {
    reasons.push(`offers quality ${profile.stream} education with good infrastructure`);
  }

  return reasons.slice(0, 3).join(", ") + ".";
}
