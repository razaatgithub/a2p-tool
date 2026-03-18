import { useState, useEffect } from "react";

const STEPS = ["agency", "business", "generating", "results"];

const businessTypes = [
  "Home Services", "Cleaning Services", "HVAC", "Plumbing", "Electrical",
  "Real Estate", "Insurance", "Legal Services", "Medical/Healthcare",
  "Dental", "Auto Services", "Restaurant", "Retail", "E-Commerce",
  "Financial Services", "Education", "Non-Profit", "Other"
];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function generateUUID() {
  return "uid-" + Date.now() + "-" + Math.floor(Math.random() * 999999);
}

const LoadingDots = () => {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const i = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 400);
    return () => clearInterval(i);
  }, []);
  return <span>{dots}</span>;
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} style={{
      background: copied ? "#10b981" : "#6366f1",
      color: "#fff", border: "none", borderRadius: 8,
      padding: "6px 16px", fontSize: 13, cursor: "pointer",
      fontFamily: "inherit", transition: "all 0.2s", fontWeight: 600,
      display: "flex", alignItems: "center", gap: 6
    }}>
      {copied ? "✓ Copied!" : "📋 Copy"}
    </button>
  );
}

function CopyBlock({ label, value, badge }) {
  return (
    <div style={{
      background: "#0f172a", border: "1px solid #1e293b",
      borderRadius: 12, padding: 20, marginBottom: 16
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
          {label}
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {badge && <span style={{ background: "#10b981", color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{badge}</span>}
          <CopyButton text={value} />
        </div>
      </div>
      <p style={{ color: "#e2e8f0", fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{value}</p>
    </div>
  );
}

export default function A2PTool() {
  const [step, setStep] = useState("agency");
  const [form, setForm] = useState({
    agencyName: "", agencyEmail: "",
    businessName: "", businessAddress: "", businessEmail: "",
    businessPhone: "", businessType: "", businessDescription: "",
    hasWebsite: null,
    businessWebsite: "",
    agreed: false
  });
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Initializing...");
  const [errors, setErrors] = useState({});

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validateAgency = () => {
    const e = {};
    if (!form.agencyName.trim()) e.agencyName = "Required";
    if (!form.agencyEmail.trim() || !form.agencyEmail.includes("@")) e.agencyEmail = "Valid email required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateBusiness = () => {
    const e = {};
    if (!form.businessName.trim()) e.businessName = "Required";
    if (!form.businessAddress.trim()) e.businessAddress = "Required";
    if (!form.businessEmail.trim() || !form.businessEmail.includes("@")) e.businessEmail = "Valid email required";
    if (form.hasWebsite === null) e.hasWebsite = "Please select yes or no";
    if (form.hasWebsite === false && !form.businessType) e.businessType = "Required";
    if (form.hasWebsite === false && !form.businessDescription.trim()) e.businessDescription = "Required";
    if (!form.agreed) e.agreed = "You must confirm compliance";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const generateAssets = async () => {
    if (!validateBusiness()) return;
    setStep("generating");

    const labels = [
      [10, "Creating your compliance website..."],
      [25, "Generating brand registration copy..."],
      [45, "Crafting sample messages..."],
      [60, "Building opt-in descriptions..."],
      [75, "Generating privacy policy..."],
      [88, "Finalizing your compliance kit..."],
      [95, "Almost ready..."],
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < labels.length) {
        setProgress(labels[idx][0]);
        setProgressLabel(labels[idx][1]);
        idx++;
      }
    }, 1200);

    const uuid = generateUUID();

    try {
      const response = await fetch("https://shabbirraza-n8n.hf.space/webhook/a2p-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName: form.agencyName,
          agencyEmail: form.agencyEmail,
          businessName: form.businessName,
          businessType: form.businessType,
          businessAddress: form.businessAddress,
          businessEmail: form.businessEmail,
          businessPhone: form.businessPhone,
          businessDescription: form.businessDescription,
          businessWebsite: form.businessWebsite || null,
          uuid
        })
      });

      const data = await response.json();

      if (!data.success) throw new Error("Workflow failed");

      clearInterval(interval);
      setProgress(100);
      setProgressLabel("Complete! 🎉");

      setTimeout(() => {
        setResults(data);
        setStep("results");
      }, 800);

    } catch (err) {
      clearInterval(interval);
      console.error(err);
      setProgressLabel("Error generating. Please try again.");
    }
  };

  const inputStyle = (field) => ({
    width: "100%", padding: "14px 16px", borderRadius: 10,
    border: `1.5px solid ${errors[field] ? "#ef4444" : "#1e293b"}`,
    background: "#0f172a", color: "#f1f5f9", fontSize: 15,
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s"
  });

  const labelStyle = { color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" };
  const fieldStyle = { marginBottom: 18 };
  const errorStyle = { color: "#ef4444", fontSize: 12, marginTop: 4 };

  return (
    <div style={{
      minHeight: "100vh", background: "#020817",
      fontFamily: "'DM Sans', system-ui, sans-serif", color: "#f1f5f9"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        borderBottom: "1px solid #1e293b", padding: "16px 32px",
        display: "flex", alignItems: "center", gap: 12
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18
        }}>⚡</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>A2P<span style={{ color: "#818cf8" }}>Pro</span></div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Compliance Automation Platform</div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px" }}>

        {/* STEP: AGENCY */}
        {step === "agency" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{
                display: "inline-block", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: 16, padding: "12px 20px", fontSize: 32, marginBottom: 16
              }}>🧙‍♂️</div>
              <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px", letterSpacing: -1 }}>
                Get A2P Approved — Fast
              </h1>
              <p style={{ color: "#64748b", fontSize: 16, margin: 0 }}>
                Fill out the form to generate a fully compliant A2P kit in seconds.
              </p>
            </div>

            {/* Progress indicator */}
            <div style={{ display: "flex", gap: 8, marginBottom: 32, justifyContent: "center" }}>
              {["Your Info", "Client Info", "Generate", "Results"].map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", fontSize: 12, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: i === 0 ? "#6366f1" : "#1e293b",
                    color: i === 0 ? "#fff" : "#475569"
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 13, color: i === 0 ? "#a5b4fc" : "#475569" }}>{s}</span>
                  {i < 3 && <div style={{ width: 20, height: 1, background: "#1e293b" }} />}
                </div>
              ))}
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 24px", color: "#e2e8f0" }}>
                Step 1 — Your Agency / Owner Info
              </h2>

              <div style={fieldStyle}>
                <label style={labelStyle}>Your Name (Agency or Owner) *</label>
                <input style={inputStyle("agencyName")} placeholder="e.g. John Smith or Smith Agency"
                  value={form.agencyName} onChange={e => update("agencyName", e.target.value)} />
                {errors.agencyName && <div style={errorStyle}>{errors.agencyName}</div>}
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Your Email *</label>
                <input style={inputStyle("agencyEmail")} placeholder="john@youragency.com" type="email"
                  value={form.agencyEmail} onChange={e => update("agencyEmail", e.target.value)} />
                {errors.agencyEmail && <div style={errorStyle}>{errors.agencyEmail}</div>}
                <div style={{ color: "#475569", fontSize: 12, marginTop: 6 }}>
                  This is YOUR agency contact info — not the client's.
                </div>
              </div>

              <button onClick={() => { if (validateAgency()) setStep("business"); }} style={{
                width: "100%", padding: "16px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff",
                fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: 0.3
              }}>
                Continue → Client Details
              </button>
            </div>
          </div>
        )}

        {/* STEP: BUSINESS */}
        {step === "business" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 32, justifyContent: "center" }}>
              {["Your Info", "Client Info", "Generate", "Results"].map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", fontSize: 12, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: i <= 1 ? "#6366f1" : "#1e293b",
                    color: i <= 1 ? "#fff" : "#475569"
                  }}>{i < 1 ? "✓" : i + 1}</div>
                  <span style={{ fontSize: 13, color: i <= 1 ? "#a5b4fc" : "#475569" }}>{s}</span>
                  {i < 3 && <div style={{ width: 20, height: 1, background: "#1e293b" }} />}
                </div>
              ))}
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: "#e2e8f0" }}>
                Step 2 — Client A2P Registration Details
              </h2>
              <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 24px" }}>
                Enter the client's BUSINESS information exactly as it appears on their EIN documentation.
              </p>

              <div style={fieldStyle}>
                <label style={labelStyle}>Client Legal Business Name *</label>
                <input style={inputStyle("businessName")} placeholder="e.g. Naples Cleaning Services LLC"
                  value={form.businessName} onChange={e => update("businessName", e.target.value)} />
                {errors.businessName && <div style={errorStyle}>{errors.businessName}</div>}
                <div style={{ color: "#475569", fontSize: 12, marginTop: 6 }}>
                  Type exactly as it is on the EIN form. No special characters (&, ', commas).
                </div>
              </div>

              {/* Does business have a website? */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Does this business have a website? *</label>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  {["Yes", "No"].map(opt => (
                    <button key={opt} type="button" onClick={() => update("hasWebsite", opt === "Yes")}
                      style={{
                        flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer",
                        fontFamily: "inherit", fontSize: 14, fontWeight: 600, transition: "all 0.2s",
                        background: form.hasWebsite === (opt === "Yes") ? "#6366f1" : "#0f172a",
                        color: form.hasWebsite === (opt === "Yes") ? "#fff" : "#64748b",
                        border: `1.5px solid ${form.hasWebsite === (opt === "Yes") ? "#6366f1" : "#1e293b"}`,
                      }}>
                      {opt === "Yes" ? "✅ Yes, they have a website" : "❌ No website"}
                    </button>
                  ))}
                </div>
                {errors.hasWebsite && <div style={errorStyle}>{errors.hasWebsite}</div>}
              </div>

              {/* If YES: show website field */}
              {form.hasWebsite === true && (
                <div style={fieldStyle}>
                  <label style={labelStyle}>Business Website URL <span style={{fontSize:11,color:'#10b981',fontWeight:600}}>✨ Auto-scrapes logo + content</span></label>
                  <input style={inputStyle("businessWebsite")} placeholder="https://www.naplescleaning.com"
                    value={form.businessWebsite} onChange={e => update("businessWebsite", e.target.value)} />
                  <div style={{ color: "#475569", fontSize: 12, marginTop: 6 }}>
                    We'll automatically extract logo, services, and description from their website.
                  </div>
                </div>
              )}

              {/* If NO: show business type + description */}
              {form.hasWebsite === false && (
                <>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Business Type *</label>
                    <select style={{ ...inputStyle("businessType"), cursor: "pointer" }}
                      value={form.businessType} onChange={e => update("businessType", e.target.value)}>
                      <option value="">Select industry...</option>
                      {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.businessType && <div style={errorStyle}>{errors.businessType}</div>}
                  </div>
                </>
              )}

              <div style={fieldStyle}>
                <label style={labelStyle}>Client Business Address *</label>
                <input style={inputStyle("businessAddress")} placeholder="1234 Main St, Naples, FL 34102"
                  value={form.businessAddress} onChange={e => update("businessAddress", e.target.value)} />
                {errors.businessAddress && <div style={errorStyle}>{errors.businessAddress}</div>}
                <div style={{ color: "#475569", fontSize: 12, marginTop: 6 }}>Same address as on EIN paperwork.</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
                <div>
                  <label style={labelStyle}>Client Support Email *</label>
                  <input style={inputStyle("businessEmail")} placeholder="support@business.com" type="email"
                    value={form.businessEmail} onChange={e => update("businessEmail", e.target.value)} />
                  {errors.businessEmail && <div style={errorStyle}>{errors.businessEmail}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Client Business Phone</label>
                  <input style={inputStyle("businessPhone")} placeholder="(239) 555-0198"
                    value={form.businessPhone} onChange={e => update("businessPhone", e.target.value)} />
                </div>
              </div>



              {/* Compliance checkbox */}
              <div style={{
                background: "#0a0f1e", border: `1px solid ${errors.agreed ? "#ef4444" : "#1e293b"}`,
                borderRadius: 10, padding: 16, marginBottom: 24, display: "flex", gap: 12, alignItems: "flex-start"
              }}>
                <input type="checkbox" checked={form.agreed} onChange={e => update("agreed", e.target.checked)}
                  style={{ marginTop: 2, width: 16, height: 16, cursor: "pointer", accentColor: "#6366f1" }} />
                <div>
                  <span style={{ color: "#e2e8f0", fontSize: 13, lineHeight: 1.5 }}>
                    I confirm this client has met all requirements for TCPA and A2P 10DLC compliance.
                    The generated output will be used as a representation of their opt-in compliance. *
                  </span>
                  {errors.agreed && <div style={errorStyle}>{errors.agreed}</div>}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setStep("agency")} style={{
                  padding: "14px 24px", borderRadius: 12, border: "1px solid #1e293b",
                  background: "transparent", color: "#94a3b8", fontSize: 15, cursor: "pointer", fontFamily: "inherit"
                }}>← Back</button>
                <button onClick={generateAssets} style={{
                  flex: 1, padding: "16px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff",
                  fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: 0.3
                }}>
                  ✨ Submit & Generate Compliance Kit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: GENERATING */}
        {step === "generating" && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{
              background: "linear-gradient(135deg, #1e1b4b, #312e81)",
              border: "1px solid #4338ca", borderRadius: 24, padding: 48, maxWidth: 480, margin: "0 auto"
            }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🧙‍♂️✨</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Summoning Your A2P Assets</h2>
              <p style={{ color: "#94a3b8", margin: "0 0 32px" }}>
                Please wait while we conjure your assets. This usually takes about 10 seconds.
              </p>

              <div style={{
                background: "#0f172a", borderRadius: 12, height: 8, overflow: "hidden", marginBottom: 16
              }}>
                <div style={{
                  height: "100%", borderRadius: 12,
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
                  width: `${progress}%`, transition: "width 0.8s ease"
                }} />
              </div>

              <div style={{ color: "#818cf8", fontSize: 14, fontWeight: 600 }}>
                {progressLabel} {progress < 100 && <LoadingDots />}
              </div>
              <div style={{ color: "#475569", fontSize: 13, marginTop: 8 }}>{progress}% complete</div>
            </div>
          </div>
        )}

        {/* STEP: RESULTS */}
        {step === "results" && results && (
          <div>
            {/* Success banner */}
            <div style={{
              background: "linear-gradient(135deg, #064e3b, #065f46)",
              border: "1px solid #10b981", borderRadius: 16, padding: 24,
              textAlign: "center", marginBottom: 28
            }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", color: "#6ee7b7" }}>
                Your A2P Compliance Kit is Ready!
              </h2>
              <p style={{ color: "#34d399", margin: 0, fontSize: 14 }}>
                Everything below is copy-paste ready for your campaign registration.
              </p>
            </div>

            {/* Website URL */}
            <div style={{
              background: "linear-gradient(135deg, #1e1b4b, #1e293b)",
              border: "1px solid #6366f1", borderRadius: 16, padding: 24, marginBottom: 20
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 15, color: "#a5b4fc" }}>🌐 Compliance Website (Opt-In Page)</h3>
                <span style={{ background: "#10b981", color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>LIVE</span>
              </div>
              <div style={{
                background: "#0f172a", borderRadius: 10, padding: "12px 16px",
                fontFamily: "monospace", fontSize: 14, color: "#6ee7b7",
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12
              }}>
                <span style={{ wordBreak: "break-all" }}>{results.optinUrl}</span>
                <CopyButton text={results.optinUrl} />
              </div>
              <p style={{ color: "#475569", fontSize: 12, margin: "10px 0 0" }}>
                ✅ Fully functioning website with Terms of Service, Privacy Policy, and opt-in form. Use this as your opt-in URL in registration.
              </p>
            </div>

            {/* Instructions */}
            <div style={{
              background: "#1a0a00", border: "1px solid #92400e", borderRadius: 12,
              padding: 20, marginBottom: 20
            }}>
              <h3 style={{ color: "#fbbf24", margin: "0 0 10px", fontSize: 14 }}>🛑 STOP — Read This First</h3>
              <p style={{ color: "#d97706", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                Have you already been rejected? If so, open a support ticket with HighLevel (or your CRM) and ask them to wipe the brand registration and start fresh. Select <strong>"Self Serve Campaign"</strong> when registering to use your generated website.
              </p>
            </div>

            {/* All copy-paste fields */}
            <h3 style={{ color: "#94a3b8", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "24px 0 16px" }}>
              📋 Copy These Exactly Into Your Application
            </h3>

            <CopyBlock label="Step 1: Brand Description" value={results.brandDescription} badge="TCR Field" />
            <CopyBlock label="Step 2: Use Case Description" value={results.useCaseDescription} badge="TCR Field" />

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>
                Step 3: Sample Messages
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ color: "#64748b", fontSize: 12 }}>Sample Message 1</span>
                  <CopyButton text={results.sampleMessage1} />
                </div>
                <p style={{ color: "#e2e8f0", fontSize: 14, lineHeight: 1.6, margin: 0, background: "#0a0f1e", padding: "12px 14px", borderRadius: 8 }}>
                  {results.sampleMessage1}
                </p>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ color: "#64748b", fontSize: 12 }}>Sample Message 2</span>
                  <CopyButton text={results.sampleMessage2} />
                </div>
                <p style={{ color: "#e2e8f0", fontSize: 14, lineHeight: 1.6, margin: 0, background: "#0a0f1e", padding: "12px 14px", borderRadius: 8 }}>
                  {results.sampleMessage2}
                </p>
              </div>
            </div>

            <CopyBlock label="Step 4: Opt-In Method" value="Website form" />
            <CopyBlock label="Step 5: Opt-In URL (paste exactly)" value={results.optinUrl} badge="Copy Exactly" />
            <CopyBlock label="Step 6: How Contacts Opt-In" value={results.optinDescription} />
            <CopyBlock label="Step 7: Opt-In Confirmation Message" value={results.optinMessage} badge="TCPA Required" />

            {/* Pro tips */}
            <div style={{
              background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 12,
              padding: 20, marginBottom: 20
            }}>
              <h3 style={{ color: "#818cf8", margin: "0 0 12px", fontSize: 14 }}>💡 Tips for Approval</h3>
              <ul style={{ color: "#94a3b8", fontSize: 13, lineHeight: 2, margin: 0, paddingLeft: 20 }}>
                <li>Submit between 8am–11am on weekdays for faster processing</li>
                <li>Use a fresh number/campaign if resubmitting after rejection</li>
                <li>Brand approval usually takes ~15 minutes to a few hours</li>
                <li>Update your business profile in HighLevel to match these details</li>
                <li>Set business email to match the one on your generated site</li>
              </ul>
            </div>

            {/* Start over */}
            <button onClick={() => { setStep("agency"); setResults(null); setProgress(0); setErrors({}); }} style={{
              width: "100%", padding: 16, borderRadius: 12, border: "1px solid #1e293b",
              background: "transparent", color: "#94a3b8", fontSize: 15, cursor: "pointer",
              fontFamily: "inherit", marginBottom: 40
            }}>
              ← Start New Registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
