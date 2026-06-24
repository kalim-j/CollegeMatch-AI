import re

with open(r'd:\CollegeMatch-AI\src\app\discover\page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# We'll replace the state declarations
state_repl = """  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [otherText, setOtherText] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [results, setResults] = useState<DiscoveryResult | null>(null);
  const [discoveryId, setDiscoveryId] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);"""

code = re.sub(r'  const \[currentStep, setCurrentStep\] = useState\(0\);.*?  const \[direction, setDirection\] = useState\(1\);', state_repl, code, flags=re.DOTALL)

# Handle Start function
start_repl = """  const handleStart = () => {
    setDirection(1); 
    setCurrentStep(1);
    setCurrentQuestion({
      question: "What's your favourite subject in school right now?",
      options: [
        { id: "math", label: "Mathematics", icon: "📐" },
        { id: "science", label: "Science (Physics/Chem/Bio)", icon: "🔬" },
        { id: "computers", label: "Computer Science", icon: "💻" },
        { id: "other", label: "Other", icon: "✍️" }
      ]
    });
  };"""

code = re.sub(r'  const handleStart = \(\) => \{ setDirection\(1\); setCurrentStep\(1\); \};', start_repl, code)

# We need to replace handleOptionSelect and handleNext entirely, since auto-advance replaces handleNext for most steps.
# According to BUG 3: Stream selection auto-advance (remove Continue)
# "On the Stream selection screens (Questions), as soon as the user selects an option (or types "Other" and hits Enter), it should auto-advance to the next question."

funcs_repl = """  const handleOptionSelect = async (optionId: string, label: string) => {
    setSelectedOption(optionId);
    
    if (optionId === 'other') {
      setShowOtherInput(true);
      return; // wait for text input
    }
    
    await submitAnswer(label);
  };

  const handleOtherSubmit = async (e: React.KeyboardEvent | React.FocusEvent) => {
    // Only proceed on Enter key if it's a keyboard event
    if ('key' in e && e.key !== 'Enter') return;
    
    if (otherText.trim().length > 0) {
      await submitAnswer(otherText.trim());
    }
  };

  const submitAnswer = async (answerText: string) => {
    const newAnswers = [...answers, { q: currentQuestion.question, a: answerText }];
    setAnswers(newAnswers);
    
    // Auto-advance logic
    if (currentStep < 10) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
      setLoadingQuestion(true);
      setShowOtherInput(false);
      setOtherText('');
      setSelectedOption(null);
      
      try {
        const res = await fetch('/api/generate-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ previousAnswers: newAnswers, step: currentStep + 1 })
        });
        const data = await res.json();
        setCurrentQuestion(data.nextQuestion);
      } catch(err) {
        setAiError("Failed to generate next question");
      } finally {
        setLoadingQuestion(false);
      }
    } else {
      // Final step -> generate result
      setDirection(1);
      setCurrentStep(11); // Loading
      try {
        const res = await fetch('/api/discover-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: newAnswers, studentName: user.displayName || 'Student' }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || 'Failed');
        const data = await res.json();
        if (data.results) {
          setResults(data.results);
          const newDocRef = doc(collection(db, `discoveries/${user.uid}/sessions`));
          await setDoc(newDocRef, { timestamp: serverTimestamp(), answers: newAnswers, results: data.results, selectedStream: null });
          setDiscoveryId(newDocRef.id);
          setCurrentStep(12);
        }
      } catch (err: any) {
        setAiError(err.message || 'AI is temporarily unavailable.');
        setCurrentStep(10);
      }
    }
  };"""

code = re.sub(r'  const handleOptionSelect = .*?  const handleNext = async \(\) => \{.*?\n  \};\n', funcs_repl + '\n', code, flags=re.DOTALL)

# Remove discoveryQuestions import if it's there
code = re.sub(r"import \{ discoveryQuestions \} from '@/data/discoveryQuestions';\n", "", code)

# Update the render portion for Step 1-10
render_repl = """  // ── QUIZ SCREEN (Steps 1–10) ─────────────────────────────────────────────────
  const progress = (currentStep / 10) * 100;
  const cat = { from: '#7F77DD', to: '#a89ef8', shadow: 'rgba(127,119,221,0.35)' };

  return (
    <div style={{ minHeight: '100vh', background: bgPage, display: 'flex', flexDirection: 'column', padding: '0 16px 80px', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient blobs */}
      <div style={{ position: 'fixed', top: '-20%', right: '-15%', width: '55%', height: '55%', background: `radial-gradient(circle, ${cat.from}12 0%, transparent 70%)`, pointerEvents: 'none', transition: 'background 0.5s' }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '45%', height: '45%', background: `radial-gradient(circle, ${cat.to}0e 0%, transparent 70%)`, pointerEvents: 'none', transition: 'background 0.5s' }} />

      {/* Top bar */}
      <div style={{ maxWidth: 720, width: '100%', margin: '0 auto', paddingTop: 24, paddingBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Logo size="sm" showTagline={false} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: txtMuted, fontWeight: 600 }}>Question {currentStep} of 10</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: cat.from, background: `${cat.from}15`, padding: '3px 10px', borderRadius: 20, border: `1px solid ${cat.from}30`, letterSpacing: '0.04em' }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: 6, background: border, borderRadius: 6, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${cat.from}, ${cat.to})` }}
          />
        </div>
      </div>

      {/* Quiz card */}
      <div style={{ maxWidth: 720, width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

        {aiError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 20, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 14, padding: '16px 20px', textAlign: 'center' }}
          >
            <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: 6 }}>Something went wrong</p>
            <p style={{ color: txtMuted, fontSize: 13, marginBottom: 12 }}>{aiError}</p>
            <button onClick={() => setAiError(null)} style={{ background: `${cat.from}18`, border: `1px solid ${cat.from}40`, borderRadius: 10, color: cat.from, padding: '8px 20px', cursor: 'pointer' }}>Try again</button>
          </motion.div>
        )}

        {loadingQuestion ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-t-[#7F77DD] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#4a4370] dark:text-gray-400 font-medium">AI is thinking of the next question...</p>
          </div>
        ) : (
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            className="step-enter"
            initial={{ opacity: 0, x: direction * 60, rotateY: direction * 6 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: direction * -60, rotateY: direction * -6 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: '1200px' }}
          >
            <div className={selectedOption ? 'card-selected' : ''} style={{ background: bgCard, backdropFilter: 'blur(24px)', border: `1px solid ${border}`, borderRadius: 24, padding: '36px 32px 32px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>

              {/* Category badge + question */}
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: cat.from, background: `${cat.from}12`, border: `1px solid ${cat.from}28` }}>
                  Question {currentStep}
                </span>
                <h2 style={{ fontSize: 'clamp(18px, 3.5vw, 26px)', fontWeight: 900, color: txtPri, marginTop: 14, marginBottom: 8, lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                  {currentQuestion?.question}
                </h2>
              </div>

              {/* Options grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 }}>
                {currentQuestion?.options?.map((option: any, oIdx: number) => {
                  const isSelected = selectedOption === option.id;
                  return (
                    <div key={option.id}>
                    <motion.button
                      onClick={() => handleOptionSelect(option.id, option.label)}
                      initial={{ opacity: 0, y: 18, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: oIdx * 0.06, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ scale: 1.025, y: -3, boxShadow: isSelected ? `0 12px 32px ${cat.shadow}` : '0 6px 20px rgba(0,0,0,0.08)' }}
                      whileTap={{ scale: 0.975 }}
                      style={{
                        width: '100%',
                        display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 16px',
                        borderRadius: 16,
                        border: `1.5px solid ${isSelected ? cat.from : border}`,
                        background: isSelected ? `linear-gradient(135deg, ${cat.from}16, ${cat.to}0c)` : bgCard,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'border-color 0.2s, background 0.2s',
                        position: 'relative',
                        boxShadow: isSelected ? `0 0 0 1px ${cat.from}30, 0 4px 20px ${cat.shadow}` : 'none',
                      }}
                    >
                      {/* Emoji icon box */}
                      <div style={{
                        flexShrink: 0, width: 48, height: 48, borderRadius: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                        background: isSelected ? `linear-gradient(135deg, ${cat.from}, ${cat.to})` : `${cat.from}12`,
                        boxShadow: isSelected ? `0 4px 16px ${cat.shadow}` : 'none',
                        transition: 'background 0.25s',
                      }}>
                        <span role="img" aria-label={option.label}>{option.icon}</span>
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', height: 48 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: isSelected ? cat.from : txtPri, lineHeight: 1.3, margin: 0 }}>
                          {option.label}
                        </h4>
                      </div>

                      {/* Checkmark */}
                      {isSelected && option.id !== 'other' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          style={{ position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: '50%', background: `linear-gradient(135deg, ${cat.from}, ${cat.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <i className="ti ti-check" style={{ color: '#fff', fontSize: 12 }} />
                        </motion.div>
                      )}
                    </motion.button>
                    
                    {/* Other Text Input Field */}
                    {option.id === 'other' && showOtherInput && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                        className="w-full"
                      >
                        <input
                          type="text"
                          value={otherText}
                          onChange={(e) => setOtherText(e.target.value)}
                          onKeyDown={handleOtherSubmit}
                          placeholder="Type your answer and press Enter..."
                          autoFocus
                          style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '12px',
                            border: `2px solid ${cat.from}`,
                            background: bgCardH,
                            color: txtPri,
                            fontSize: '15px',
                            outline: 'none',
                            boxShadow: `0 4px 20px ${cat.shadow}`
                          }}
                        />
                      </motion.div>
                    )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        )}
      </div>

      {/* Navigation */}
      <div style={{ maxWidth: 720, width: '100%', margin: '20px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <motion.button
          onClick={handleBack}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
          style={{ padding: '12px 24px', borderRadius: 14, border: `1px solid ${border}`, background: bgCard, color: txtMuted, fontWeight: 600, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <i className="ti ti-arrow-left" /> Back
        </motion.button>

        {/* Removed 'Next' button entirely - handled by auto-advance in OptionSelect/OtherSubmit */}
      </div>
    </div>
  );
}"""

code = re.sub(r'  // ── QUIZ SCREEN \(Steps 1–10\) ─────────────────────────────────────────────────.*\}', render_repl, code, flags=re.DOTALL)

with open(r'd:\CollegeMatch-AI\src\app\discover\page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

