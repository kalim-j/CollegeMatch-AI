const fs = require('fs');
let code = fs.readFileSync('src/app/(protected)/interview/page.tsx', 'utf8');

// 1. Update formData initial state
const initialFormData = `  const [formData, setFormData] = useState<any>({
    courseLevel: "UG",
    stream: "",
    state: "Tamil Nadu",
    district: "",
    marks10thBoard: "State Board",
    marks10thOutOf: 500,
    marks10th: "",
    percentage10th: 0,
    marks10thGrade: "A",
    useCgpa10: false,
    cgpa10: "",
    marks12thBoard: "State Board",
    marks12thOutOf: 600,
    marks12th: "",
    percentage12th: 0,
    marks12thGrade: "A",
    useCgpa12: false,
    cgpa12: "",
    marks12SubjectWise: false,
    marks12Subjects: { subject1: 0, subject2: 0, subject3: 0, subject4: 0, subject5: 0, subject6: 0 },
    ugCgpa: "",
    cutoffMark: "",
    physicsMark: "",
    chemistryMark: "",
    mathsMark: "",
    manualCutoffMode: false,
    cutoffRange: "exact",
    budget: "Both",
    quota: "General",
    religion: "Hindu"
  });`;
code = code.replace(/const \[formData, setFormData\] = useState<any>\(\{[\s\S]*?religion: "Hindu"\s*\}\);/, initialFormData);

// 2. Add useEffects for calculations
const useEffects = `
  // 10th Marks Calculation
  useEffect(() => {
    let p = 0;
    if (formData.marks10thBoard === 'IGCSE') {
      const gradeMap: any = { 'A*': 95, 'A': 85, 'B': 75, 'C': 65, 'D': 55 };
      p = gradeMap[formData.marks10thGrade] || 0;
    } else if (formData.useCgpa10 && formData.marks10thBoard === 'CBSE') {
      p = (Number(formData.cgpa10) || 0) * 9.5;
    } else {
      const outOf = formData.marks10thOutOf || 500;
      p = Math.round(((Number(formData.marks10th) || 0) / outOf) * 100 * 10) / 10;
    }
    if (formData.percentage10th !== p) updateForm({ percentage10th: p });
  }, [formData.marks10thBoard, formData.marks10th, formData.marks10thOutOf, formData.marks10thGrade, formData.useCgpa10, formData.cgpa10]);

  // 12th Marks Calculation
  useEffect(() => {
    let p = 0;
    if (formData.marks12thBoard === 'IGCSE') {
      const gradeMap: any = { 'A*': 95, 'A': 85, 'B': 75, 'C': 65, 'D': 55 };
      p = gradeMap[formData.marks12thGrade] || 0;
    } else if (formData.useCgpa12 && formData.marks12thBoard === 'CBSE') {
      p = (Number(formData.cgpa12) || 0) * 9.5;
    } else {
      const outOf = formData.marks12thOutOf || 600;
      p = Math.round(((Number(formData.marks12th) || 0) / outOf) * 100 * 10) / 10;
    }
    if (formData.percentage12th !== p) updateForm({ percentage12th: p });
  }, [formData.marks12thBoard, formData.marks12th, formData.marks12thOutOf, formData.marks12thGrade, formData.useCgpa12, formData.cgpa12]);

  // Subject-wise sum for 12th
  useEffect(() => {
    if (formData.marks12SubjectWise) {
      const s = formData.marks12Subjects;
      const total = (Number(s.subject1)||0) + (Number(s.subject2)||0) + (Number(s.subject3)||0) + (Number(s.subject4)||0) + (Number(s.subject5)||0) + (Number(s.subject6)||0);
      if (formData.marks12th !== total) updateForm({ marks12th: total });
    }
  }, [formData.marks12Subjects, formData.marks12SubjectWise]);

  // Cutoff calculation
  useEffect(() => {
    if (!formData.manualCutoffMode) {
      const m = Number(formData.mathsMark) || 0;
      const p = Number(formData.physicsMark) || 0;
      const c = Number(formData.chemistryMark) || 0;
      if (m > 0 || p > 0 || c > 0) {
        const cutoff = m + (p / 2) + (c / 2);
        const rounded = Math.round(cutoff * 10) / 10;
        if (formData.cutoffMark !== rounded) updateForm({ cutoffMark: rounded });
      }
    }
  }, [formData.mathsMark, formData.physicsMark, formData.chemistryMark, formData.manualCutoffMode]);
`;
// Insert after searchScope state
code = code.replace(/const \[compareList, setCompareList\] = useState<College\[\]>\(\[\]\);/, "const [compareList, setCompareList] = useState<College[]>([]);\n" + useEffects);

// 3. Helper to get color info
const helperFunctions = `
  const getPercentageColor = (p: number) => {
    if (p >= 90) return { color: "text-emerald-400", label: "Excellent", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (p >= 75) return { color: "text-teal-400", label: "Good", bg: "bg-teal-500/10", border: "border-teal-500/20" };
    if (p >= 60) return { color: "text-amber-400", label: "Average", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    return { color: "text-white/40", label: "Keep trying", bg: "bg-white/5", border: "border-white/10" };
  };

  const getCutoffColor = (c: number) => {
    if (c >= 190) return { color: "text-emerald-400", label: "Outstanding", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (c >= 175) return { color: "text-teal-400", label: "Excellent", bg: "bg-teal-500/10", border: "border-teal-500/20" };
    if (c >= 160) return { color: "text-blue-400", label: "Good", bg: "bg-blue-500/10", border: "border-blue-500/20" };
    if (c >= 145) return { color: "text-amber-400", label: "Average", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    return { color: "text-white/40", label: "Needs improvement", bg: "bg-white/5", border: "border-white/10" };
  };
`;
code = code.replace(/const renderStep = \(\) => \{/, helperFunctions + "\n  const renderStep = () => {");

// 4. Update Steps 4 & 5
const step45Pattern = /case 4:\s+case 5:\s+const is12th = step === 5;[\s\S]*?return \([\s\S]*?<\/div>\s+\);\s+case 6:/;
const step45Replacement = `case 4:
      case 5:
        const is12th = step === 5;
        const levelKey = is12th ? "12th" : "10th";
        const pColor = getPercentageColor(formData[\`percentage\${levelKey}\`] || 0);
        return (
          <div className="space-y-12 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
                <BookOpen size={14} className="text-purple-400" />
                <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">{levelKey} Academic Records</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter">{levelKey} Standards</h2>
              <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Step {step}: Academic performance verification</p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[3rem] p-12 space-y-8 shadow-2xl">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Board of Education</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {BOARDS.map(b => (
                            <button
                                key={b}
                                className={cn(
                                    "h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                    formData[\`marks\${levelKey}Board\`] === b 
                                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40" 
                                      : "bg-white/[0.05] text-white/30 border-white/5 hover:border-white/10"
                                )}
                                onClick={() => {
                                  let outOf = is12th ? 600 : 500;
                                  if (b === 'ICSE') outOf = 500;
                                  updateForm({ [\`marks\${levelKey}Board\`]: b, [\`marks\${levelKey}OutOf\`]: outOf } as any);
                                }}
                            >
                                {b}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-6">
                        {formData[\`marks\${levelKey}Board\`] === "IGCSE" ? (
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Overall Grade</label>
                              <div className="grid grid-cols-5 gap-2">
                                {['A*', 'A', 'B', 'C', 'D'].map(g => (
                                  <button
                                    key={g}
                                    className={cn("h-14 rounded-xl font-black transition-all border", formData[\`marks\${levelKey}Grade\`] === g ? "bg-purple-500/20 text-purple-300 border-purple-500/40" : "bg-white/5 text-white/30 border-white/5")}
                                    onClick={() => updateForm({ [\`marks\${levelKey}Grade\`]: g } as any)}
                                  >{g}</button>
                                ))}
                              </div>
                           </div>
                        ) : formData[\`useCgpa\${levelKey}\`] && formData[\`marks\${levelKey}Board\`] === "CBSE" ? (
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">CGPA (Out of 10)</label>
                              <input 
                                  type="number" min="0" max="10" step="0.1"
                                  className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white text-2xl font-black outline-none focus:border-purple-500/50"
                                  value={formData[\`cgpa\${levelKey}\`]}
                                  onChange={(e) => updateForm({ [\`cgpa\${levelKey}\`]: e.target.value } as any)}
                                  placeholder="e.g. 9.2"
                              />
                           </div>
                        ) : (
                           <div className="space-y-4">
                              <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Total Marks</label>
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Out of {formData[\`marks\${levelKey}OutOf\`]}</span>
                              </div>
                              <input 
                                  type="number" min="0" max={formData[\`marks\${levelKey}OutOf\`]}
                                  disabled={is12th && formData.marks12SubjectWise}
                                  className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white text-2xl font-black outline-none focus:border-purple-500/50 disabled:opacity-50"
                                  value={formData[\`marks\${levelKey}\`]}
                                  onChange={(e) => updateForm({ [\`marks\${levelKey}\`]: Number(e.target.value) } as any)}
                                  placeholder={\`Total out of \${formData[\`marks\${levelKey}OutOf\`]}\`}
                              />
                           </div>
                        )}

                        {formData[\`marks\${levelKey}Board\`] === "CBSE" && (
                          <button onClick={() => updateForm({ [\`useCgpa\${levelKey}\`]: !formData[\`useCgpa\${levelKey}\`] } as any)} className="text-[11px] font-bold text-purple-400 hover:text-purple-300">
                            {formData[\`useCgpa\${levelKey}\`] ? "Enter marks instead" : "Enter CGPA instead"}
                          </button>
                        )}

                        {is12th && formData.marks12thBoard !== "IGCSE" && !formData.useCgpa12 && (
                          <button onClick={() => updateForm({ marks12SubjectWise: !formData.marks12SubjectWise } as any)} className="text-[11px] font-bold text-purple-400 hover:text-purple-300 block">
                            {formData.marks12SubjectWise ? "Enter total directly" : "Calculate from subject marks"}
                          </button>
                        )}
                        
                        {is12th && formData.marks12SubjectWise && (
                          <div className="grid grid-cols-2 gap-4 mt-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                            {['Language', 'English', 'Maths/Bio', 'Physics', 'Chemistry', 'Optional'].map((sub, i) => (
                              <div key={i}>
                                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">{sub}</label>
                                <input type="number" min="0" max="100" className="w-full h-10 bg-white/5 rounded-lg px-3 text-white text-sm font-bold outline-none focus:border-purple-500/50 border border-transparent"
                                  value={(formData.marks12Subjects as any)[\`subject\${i+1}\`]}
                                  onChange={e => updateForm({ marks12Subjects: { ...formData.marks12Subjects, [\`subject\${i+1}\`]: Number(e.target.value) } })}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Live Percentage</label>
                        <div className={cn("h-40 rounded-3xl border flex flex-col items-center justify-center p-6 text-center transition-all", pColor.bg, pColor.border)}>
                          <span className={cn("text-5xl font-black tabular-nums tracking-tighter", pColor.color)}>
                            {formData[\`percentage\${levelKey}\`]}%
                          </span>
                          <span className={cn("text-[11px] font-black uppercase tracking-widest mt-2", pColor.color)}>
                            {pColor.label}
                          </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <button onClick={handleBack} className="btn-ghost flex-1 h-16 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <button 
                      className="btn-primary flex-[2] h-16 text-lg flex items-center justify-center gap-3 font-black uppercase tracking-widest"
                      onClick={() => {
                        if (!formData[\`percentage\${levelKey}\`] || formData[\`percentage\${levelKey}\`] === 0) {
                          toast.error("Please enter your marks");
                          return;
                        }
                        handleNext();
                      }}
                  >
                      Continue <ChevronRight size={20} />
                  </button>
                </div>
            </div>
          </div>
        );
      case 6:`;
code = code.replace(step45Pattern, step45Replacement);

// 5. Update Step 6
const step6Pattern = /case 6:[\s\S]*?return \([\s\S]*?<\/div>\s+\);\s+case 7:/;
const step6Replacement = `case 6:
        const cColor = getCutoffColor(formData.cutoffMark || 0);
        return (
          <div className="space-y-12 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Competitive Edge</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter">Your Subject Marks</h2>
              <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Step 6: We'll calculate your cutoff automatically</p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[3rem] p-12 space-y-8 shadow-2xl">
                
                {formData.courseLevel === "PG" ? (
                    <div className="space-y-4 max-w-xl mx-auto">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">UG CGPA (Out of 10)</label>
                        <input 
                            type="number" step="0.01"
                            className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white text-3xl font-black outline-none focus:border-indigo-500/50 text-center"
                            value={formData.ugCgpa}
                            onChange={(e) => updateForm({ ugCgpa: Number(e.target.value) })}
                            placeholder="8.5"
                        />
                    </div>
                ) : formData.manualCutoffMode ? (
                    <div className="space-y-4 max-w-xl mx-auto text-center">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Manual Cutoff Mark</label>
                        <input 
                            type="number" step="0.01"
                            className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white text-3xl font-black outline-none focus:border-indigo-500/50 text-center"
                            value={formData.cutoffMark}
                            onChange={(e) => updateForm({ cutoffMark: Number(e.target.value) })}
                            placeholder="e.g. 185.5"
                        />
                        <button onClick={() => updateForm({ manualCutoffMode: false })} className="text-[11px] font-bold text-indigo-400 mt-2">Calculate from subject marks instead</button>
                    </div>
                ) : (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-3xl bg-white/5 border border-white/5 p-6 space-y-3">
                          <div>
                            <h4 className="font-black text-white text-lg">Mathematics</h4>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Out of 100</p>
                          </div>
                          <input type="number" min="0" max="100" className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-black text-xl outline-none focus:border-indigo-500/50" value={formData.mathsMark} onChange={e => updateForm({ mathsMark: Number(e.target.value) })} />
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-white/40">× 1 (full)</span>
                            <span className="text-indigo-400">{formData.mathsMark || 0} marks</span>
                          </div>
                        </div>
                        <div className="rounded-3xl bg-white/5 border border-white/5 p-6 space-y-3">
                          <div>
                            <h4 className="font-black text-white text-lg">Physics</h4>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Out of 100</p>
                          </div>
                          <input type="number" min="0" max="100" className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-black text-xl outline-none focus:border-indigo-500/50" value={formData.physicsMark} onChange={e => updateForm({ physicsMark: Number(e.target.value) })} />
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-white/40">÷ 2 (half)</span>
                            <span className="text-indigo-400">{((Number(formData.physicsMark)||0)/2).toFixed(1)} marks</span>
                          </div>
                        </div>
                        <div className="rounded-3xl bg-white/5 border border-white/5 p-6 space-y-3">
                          <div>
                            <h4 className="font-black text-white text-lg">Chemistry</h4>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Out of 100</p>
                          </div>
                          <input type="number" min="0" max="100" className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-black text-xl outline-none focus:border-indigo-500/50" value={formData.chemistryMark} onChange={e => updateForm({ chemistryMark: Number(e.target.value) })} />
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-white/40">÷ 2 (half)</span>
                            <span className="text-indigo-400">{((Number(formData.chemistryMark)||0)/2).toFixed(1)} marks</span>
                          </div>
                        </div>
                      </div>

                      <div className={cn("rounded-3xl border flex flex-col md:flex-row items-center justify-between p-8 transition-all", cColor.bg, cColor.border)}>
                        <div className="text-center md:text-left mb-4 md:mb-0">
                          <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", cColor.color)}>Calculated TNEA Cutoff</p>
                          <p className="text-white/50 text-xs font-mono font-bold tracking-tight">
                            {formData.mathsMark||0} + {((Number(formData.physicsMark)||0)/2).toFixed(1)} + {((Number(formData.chemistryMark)||0)/2).toFixed(1)} = 
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={cn("text-5xl md:text-6xl font-black tabular-nums tracking-tighter leading-none", cColor.color)}>
                            {formData.cutoffMark || 0}
                          </span>
                          <span className={cn("px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest mt-3", cColor.color, cColor.border, cColor.bg)}>
                            {cColor.label}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <button onClick={() => updateForm({ manualCutoffMode: true })} className="text-[11px] font-bold text-white/40 hover:text-white/80 transition-colors">
                          I know my cutoff directly &rarr;
                        </button>
                      </div>
                    </div>
                )}
                
                <div className="space-y-4 pt-8 border-t border-white/5">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Analysis Strategy</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { val: "-10", label: "Safety", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
                            { val: "exact", label: "Exact", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
                            { val: "+10", label: "Dream", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" }
                        ].map((r) => (
                            <button
                                key={r.val}
                                className={cn(
                                    "h-16 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all border",
                                    formData.cutoffRange === r.val 
                                      ? \`\${r.bg} \${r.color} \${r.border} shadow-lg\` 
                                      : "bg-white/[0.03] text-white/30 border-white/5 hover:border-white/10"
                                )}
                                onClick={() => updateForm({ cutoffRange: r.val as any })}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <button onClick={handleBack} className="btn-ghost flex-1 h-16 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <button 
                      className="btn-primary flex-[2] h-16 text-lg flex items-center justify-center gap-3 font-black uppercase tracking-widest"
                      onClick={() => {
                        if (!formData.cutoffMark && formData.courseLevel !== "PG") {
                          toast.error("Please enter or calculate your cutoff");
                          return;
                        }
                        handleNext();
                      }} 
                  >
                      Continue <ChevronRight size={20} />
                  </button>
                </div>
            </div>
          </div>
        );
      case 7:`;
code = code.replace(step6Pattern, step6Replacement);

fs.writeFileSync('src/app/(protected)/interview/page.tsx', code);
console.log('Successfully refactored interview page');
