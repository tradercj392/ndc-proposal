import React, { useState, useEffect, useRef } from "react";

function uid() { return Math.random().toString(36).slice(2); }
const NDC_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABdwAAAXcCAYAAAA4NUxkAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAlghSURBVHja7N0JgBxlmf//73er+qq+7mT3vggBwuYRFDzeqKicoIKiIOCuoKKyC6hcIoqAiICCy4KyCniAoiKooIDHb9VFUQ9cvFBBkEVyd9/dVd31e14zgRASmJDkycz38yTde2Z2Zna3du93nuf5Pq+UxhgBAAAAAAAAAADHj6cEAAAAAAAAAADHjsAdAAAAAAAAAIBjQOAOAAAAAAAAAMAxIHAHAAAAAAAAAOAYELgDAAAAAAAAAHAMCNwBAAAAAAAAADgGBO4AAAAAAAAAABwDAncAAAAAAAAAAI4BgTsAAAAAAAAAAMeAwB0AAAAAAAAAgGNA4A4AAAAAAAAAwDEgcAcAAAAAAAAA4BgQuAMAAAAAAAAAcAwI3AEAAAAAAAAAOAYEHgSAO1mUqZABhgAAAABJRU5ErkJggg==";

const fmt = (n) => Number(n).toLocaleString("en-US", { style: "currency", currency: "USD" });

function compressImage(file, callback) {
  var maxWidth = 800;
  var quality = 0.7;
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement('canvas');
      var width = img.width;
      var height = img.height;
      if (width > maxWidth) {
        height = Math.round(height * maxWidth / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

const ALL_SERVICES = [
  { id: "siding",   emoji: "🏠", label: "Siding",             sub: "HardiePlank, Board & Batten, Shingle" },
  { id: "soffit",   emoji: "🪵", label: "Soffits",             sub: "Vented soffit panels & installation" },
  { id: "fascia",   emoji: "🪚", label: "Fascia",              sub: "Fascia boards & trim" },
  { id: "paint",    emoji: "🎨", label: "Paint",              sub: "Exterior priming & painting" },
  { id: "windows",  emoji: "🪟", label: "Windows",        sub: "Replacement or new installation" },
  { id: "misc",     emoji: "🔧", label: "Miscellaneous",   sub: "Additional work not listed above" },
];

const defaultSidingMaterials = (type) => [
  { id: uid(), name: type + " panels", unit: "sq ft", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "House Wrap / Underlayment", unit: "sq ft", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "Trim & Fascia (HardieTrim)", unit: "ln ft", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "Galvanized Nails / Fasteners", unit: "box", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "Caulk & Paintable Sealant", unit: "tube", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "Exterior Primer", unit: "gallon", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "Exterior Paint — Four-Directional Spray", unit: "gallon", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "Metal Flashing", unit: "ln ft", sqft: "", pieces: "", cost: "" },
];

const defaultSoffitMaterials = () => [
  { id: uid(), name: "Vented Soffit Panels", unit: "sq ft", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "Fascia Board / HardieTrim Fascia", unit: "ln ft", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "J-Channel / F-Channel", unit: "ln ft", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "Galvanized Nails / Screws", unit: "box", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "Caulk & Sealant", unit: "tube", sqft: "", pieces: "", cost: "" },
];

const defaultPaintMaterials = () => [
  { id: uid(), name: "Exterior Primer", unit: "gallon", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "Exterior Paint — Four-Directional Spray (Pass 1/2)", unit: "gallon", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "Exterior Paint — Four-Directional Spray (Pass 3/4)", unit: "gallon", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "Caulk & Patching Compound", unit: "tube", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "Masking Tape & Plastic", unit: "roll", sqft: "", pieces: "", cost: "" },
];

const defaultWindowMaterials = () => [
  { id: uid(), name: "Window / Door Units", unit: "each", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "Sill Pan Flashing", unit: "ln ft", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "Low-Expansion Foam", unit: "can", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "Exterior Casing / Brick Mold", unit: "ln ft", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "Caulk & Sealant", unit: "tube", sqft: "", pieces: "", cost: "" },
];

const makeCreditApp = () => ({
  appType: "individual",
  // Project
  totalPrice: "", downPayment: "", amountFinanced: "",
  // Borrower personal
  bLast: "", bFirst: "", bMI: "", bSSN: "", bDOB: "", bPhone: "", bEmail: "", bYearsAddr: "",
  // Borrower address
  bStreet: "", bCity: "", bState: "", bZip: "",
  // Borrower prior address
  bPriorStreet: "", bPriorCity: "", bPriorState: "", bPriorZip: "",
  // Borrower employment
  bEmployer: "", bJobTime: "", bEmpStreet: "", bEmpCity: "", bEmpState: "", bEmpZip: "", bEmpPhone: "",
  bPosition: "", bSalary: "", bSalaryFreq: "monthly", bOtherIncome: "", bIncomeSource: "", bIncomeFreq: "monthly",
  // Borrower mortgage
  bMortgageHolder: "", bMortgagePayment: "", bMortgageBalance: "", bPurchasePrice: "", bCurrentValue: "",
  // Borrower DL
  bDLNum: "", bDLExp: "", bDLPhoto: null,
  // Borrower signature
  bSignature: "", bSigDate: "",
  // Borrower monitoring
  bNoFurnish: false, bEthnicity: "", bRace: [], bSex: "",
  // Co-borrower personal
  cbLast: "", cbFirst: "", cbMI: "", cbSSN: "", cbDOB: "",
  // Co-borrower employment
  cbEmployer: "", cbJobTime: "", cbEmpAddr: "", cbEmpPhone: "",
  cbPosition: "", cbSalary: "", cbSalaryFreq: "monthly", cbOtherIncome: "", cbIncomeSource: "", cbIncomeFreq: "monthly",
  // Co-borrower DL
  cbDLNum: "", cbDLExp: "", cbDLPhoto: null,
  // Co-borrower signature
  cbSignature: "", cbSigDate: "",
  // Co-borrower monitoring
  cbNoFurnish: false, cbEthnicity: "", cbRace: [], cbSex: "",
});

const makeInitialState = () => ({
  company: { name: "New Direction Construction", address: "820 Worth Rd, Jacksonville, FL 32259", phone: "(904) 891-9980", email: "", license: "CBC059304", logo: NDC_LOGO },
  customer: { name: "", address: "", email: "", phone: "", photo: null },
  services: [],
  isFinancing: false,
  siding: { walls: [{ id: uid(), label: "Wall 1", location: "", sqft: "", pricePerSqFt: "", currentSiding: "", removalRequired: "", osbSheathing: "", hardieProduct: "", hardieSize: "", hardieTexture: "", photos: [], notes: "" }], pricePerSqFt: "", sidingType: "HardiePlank Lap Siding" },
  soffit: { items: [{ id: uid(), label: "Soffit Area 1", currentMaterial: "", newMaterial: "", linearFt: "", pricePerLnFt: "", notes: "" }] },
  fascia: { items: [{ id: uid(), label: "Fascia Area 1", currentMaterial: "", newMaterial: "", linearFt: "", pricePerLnFt: "", notes: "" }] },
  paint: { walls: [{ id: uid(), paintProduct: "", colorName: "", sqft: "", pricePerSqFt: "", notes: "" }], trim: [{ id: uid(), paintProduct: "", colorName: "", sqft: "", pricePerSqFt: "", notes: "" }], other: [{ id: uid(), paintProduct: "", colorName: "", sqft: "", pricePerSqFt: "", notes: "" }] },
  windows: [{ id: uid(), label: "Window 1", location: "", manufacturer: "", manufacturerOther: "", frameType: "", frameColor: "", style: "", glassType: "", glassPack: "", grids: "", width: "", height: "", qty: "1", priceInstalled: "" }],
  sidingMaterials: defaultSidingMaterials("HardiePlank Lap Siding"),
  soffitMaterials: defaultSoffitMaterials(),
  paintMaterials: defaultPaintMaterials(),
  windowMaterials: defaultWindowMaterials(),
  misc: { items: [{ id: uid(), description: "", qty: "", unitPrice: "", notes: "" }] },
  notes: "",
  financing: { monthlyPayment: "", customPayment: "" },
  pricing: { sidingPerSqFt: "", sidingStandardMarkupPct: "", soffitPerLinFt: "", soffitStandardMarkupPct: "", fasciaPerLinFt: "", fasciaStandardMarkupPct: "", paintPerSqFt: "", paintStandardMarkupPct: "", windowPerUnit: "", windowStandardMarkupPct: "", miscMarkup: "", adminSavingsDiscount: "8.35", monthlyPayment: "", clearanceDays: "14", clearanceBeatPct: "10", standardFinancingAdd: "", daysToBegin: "", daysToComplete: "" },
  priceRevealed: false,
  creditApp: makeCreditApp(),
});

function calcSiding(siding) {
  let totalArea = 0;
  let totalCost = 0;
  siding.walls.forEach((w) => {
    const sqft = parseFloat(w.sqft || 0);
    const price = parseFloat(w.pricePerSqFt || 0);
    totalArea += sqft;
    totalCost += sqft * price;
  });
  return { totalArea: totalArea.toFixed(2), totalCost: totalCost.toFixed(2) };
}
function calcSoffit(soffit) {
  return soffit.items.reduce((a, i) => a + parseFloat(i.linearFt || 0) * parseFloat(i.pricePerLnFt || 0), 0);
}
function calcPaint(paint) {
  const combined = parseFloat(paint.combinedSqft || 0) * parseFloat(paint.combinedPrice || 0);
  const other = (paint.other || []).reduce((a, i) => a + parseFloat(i.sqft || 0) * parseFloat(i.pricePerSqFt || 0), 0);
  return combined + other;
}
function calcWindows(windows) {
  return windows.map((w) => ({ ...w, total: (parseFloat(w.qty || 0) * parseFloat(w.priceInstalled || 0)).toFixed(2) }));
}
function calcGrandTotal(state) {
  const p = state.pricing || {};
  const services = state.services || [];
  const sidingWalls = (state.siding && state.siding.walls) || [];
  const soffitItems = (state.soffit && state.soffit.items) || [];
  const fasciaItems = (state.fascia && state.fascia.items) || [];
  const windows     = state.windows || [];
  const miscItems   = (state.misc && state.misc.items) || [];
  const paintData   = state.paint || {};

  function applyMarkup(adminVal, markupKey) {
    const pct = p[markupKey] ? parseFloat(p[markupKey]) / 100 : null;
    return pct !== null ? adminVal * (1 + pct) : adminVal;
  }

  const sidingArea  = sidingWalls.reduce((a,w)=>a+parseFloat(w.sqft||0),0);
  const sid = services.includes("siding") ? (p.sidingPerSqFt ? sidingArea * parseFloat(p.sidingPerSqFt) : parseFloat(calcSiding(state.siding||{}).totalCost||0)) : 0;
  const sidStd = applyMarkup(sid, "sidingStandardMarkupPct");
  const soffitLinFt = soffitItems.reduce((a,i)=>a+parseFloat(i.linearFt||0),0);
  const sof = services.includes("soffit") ? (p.soffitPerLinFt ? soffitLinFt * parseFloat(p.soffitPerLinFt) : calcSoffit(state.soffit||{})) : 0;
  const sofStd = applyMarkup(sof, "soffitStandardMarkupPct");
  const fasciaLinFt = fasciaItems.reduce((a,i)=>a+parseFloat(i.linearFt||0),0);
  const fas = services.includes("fascia") ? (p.fasciaPerLinFt ? fasciaLinFt * parseFloat(p.fasciaPerLinFt) : calcSoffit(state.fascia||{})) : 0;
  const fasStd = applyMarkup(fas, "fasciaStandardMarkupPct");
  const paintSqFt   = parseFloat(paintData.combinedSqft||0);
  const pntAdmin = services.includes("paint") ? (p.paintPerSqFt ? paintSqFt * parseFloat(p.paintPerSqFt) : calcPaint(paintData)) : 0;
  const pntStandard = applyMarkup(pntAdmin, "paintStandardMarkupPct");
  const totalWindows = windows.reduce((a,w)=>a+parseFloat(w.qty||1),0);
  const win = services.includes("windows") ? (p.windowPerUnit ? totalWindows * parseFloat(p.windowPerUnit) : calcWindows(windows).reduce((a,w)=>a+parseFloat(w.total||0),0)) : 0;
  const winStd = applyMarkup(win, "windowStandardMarkupPct");
  const msc = services.includes("misc") ? miscItems.reduce((a,i)=>a+parseFloat(i.qty||0)*parseFloat(i.unitPrice||0),0) : 0;
  const total = sid + sof + fas + pntAdmin + win + msc;
  const standardTotal = sidStd + sofStd + fasStd + pntStandard + winStd + msc;
  return { sid, sidStd, sof, sofStd, fas, fasStd, pnt: pntAdmin, pntStandard, win, winStd, msc, total, standardTotal };
}

// ─────────────────────────────────────────────────────────────────────────────
// CREDIT APP STEP
// ─────────────────────────────────────────────────────────────────────────────
const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

function CreditAppStep({ data, onChange, projectTotal }) {
  // Use a ref for form data — completely uncontrolled inputs (defaultValue)
  // This means NO re-renders while typing, zero focus issues
  const formRef = useRef({ ...data });
  const setF = (k, v) => { formRef.current = { ...formRef.current, [k]: v }; };

  // Only these need to trigger visual re-renders (conditional sections, toggles)
  const [appType, setAppType] = useState(data.appType || "individual");
  const [yearsAddr, setYearsAddr] = useState(data.bYearsAddr || "");
  const [amountFinanced, setAmountFinanced] = useState(data.amountFinanced || "");

  const isJoint = appType === "joint";
  const showPriorAddr = parseInt(yearsAddr || "99") < 2;

  // Pre-fill project total
  useEffect(() => {
    if (projectTotal > 0 && !formRef.current.totalPrice) {
      formRef.current.totalPrice = "$" + projectTotal.toFixed(2);
    }
  }, []);

  // Recalc amount financed when prices change
  const calcFinanced = (total, down) => {
    const t = parseFloat((total || "0").replace(/[^0-9.]/g, "")) || 0;
    const d = parseFloat((down || "0").replace(/[^0-9.]/g, "")) || 0;
    return t - d > 0 ? "$" + (t - d).toFixed(2) : "";
  };

  // SVG-based signature state — survives re-renders because it's just data
  const [bStrokes, setBStrokes] = useState([]);
  const [cbStrokes, setCBStrokes] = useState([]);
  const [bCurrentStroke, setBCurrentStroke] = useState(null);
  const [cbCurrentStroke, setCBCurrentStroke] = useState(null);

  const getPos = (e, el) => {
    const rect = el.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = 600 / rect.width;
    const scaleY = 120 / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const sigStart = (e, setCurrentStroke) => {
    e.preventDefault();
    const pos = getPos(e, e.currentTarget);
    setCurrentStroke([pos]);
  };
  const sigMove = (e, currentStroke, setCurrentStroke) => {
    if (!currentStroke) return; e.preventDefault();
    const pos = getPos(e, e.currentTarget);
    setCurrentStroke(prev => prev ? [...prev, pos] : [pos]);
  };
  const sigEnd = (currentStroke, setCurrentStroke, setStrokes) => {
    if (!currentStroke || currentStroke.length < 2) { setCurrentStroke(null); return; }
    setStrokes(prev => [...prev, currentStroke]);
    setCurrentStroke(null);
  };

  const strokeToPath = (pts) => {
    if (!pts || pts.length < 2) return "";
    return "M" + pts[0].x.toFixed(1) + "," + pts[0].y.toFixed(1) +
      pts.slice(1).map(p => "L" + p.x.toFixed(1) + "," + p.y.toFixed(1)).join("");
  };

  const SigPad = ({ strokes, currentStroke, onStart, onMove, onEnd, onClear, hasSigned }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: 8 }}>
        Signature <span style={{ color: "#e85d04" }}>*</span>
      </label>
      <div style={{ position: "relative", border: "1.5px solid #e2e8f0", borderRadius: 8, background: "white", overflow: "hidden", height: 120, touchAction: "none", cursor: "crosshair" }}
        onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}
        onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}
      >
        <svg width="100%" height="120" viewBox="0 0 600 120" style={{ display: "block" }}>
          {strokes.map((pts, i) => (
            <path key={i} d={strokeToPath(pts)} fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {currentStroke && currentStroke.length > 1 && (
            <path d={strokeToPath(currentStroke)} fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
        {!hasSigned && strokes.length === 0 && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 12, color: "#cbd5e1", pointerEvents: "none", fontStyle: "italic" }}>Sign here</div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        {strokes.length > 0
          ? <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>✓ Signed</span>
          : <span style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic" }}>Draw your signature above</span>
        }
        <button onClick={onClear} style={{ fontSize: 10, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Clear</button>
      </div>
    </div>
  );

  // Convert strokes to SVG data URL for PDF
  const strokesToDataUrl = (strokes) => {
    const paths = strokes.map(pts => strokeToPath(pts)).join(" ");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="120" viewBox="0 0 600 120"><path d="${paths}" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    return "data:image/svg+xml;base64," + btoa(svg);
  };

  // Pre-fill project total from proposal pricing
  useEffect(() => {
    if (projectTotal > 0 && !formRef.current.totalPrice) {
      setF("totalPrice", "$" + projectTotal.toFixed(2));
    }
  }, []);

  const fmtCurr = (v) => {
    let val = v.replace(/[^0-9.]/g, "");
    const parts = val.split(".");
    if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
    if (parts[1]) val = parts[0] + "." + parts[1].slice(0, 2);
    return val ? "$" + val : "";
  };

  const fmtSSN = (v) => {
    let val = v.replace(/\D/g, "").slice(0, 9);
    if (val.length > 5) val = val.slice(0,3) + "-" + val.slice(3,5) + "-" + val.slice(5);
    else if (val.length > 3) val = val.slice(0,3) + "-" + val.slice(3);
    return val;
  };

  const fmtPhone = (v) => {
    let val = v.replace(/\D/g, "").slice(0, 10);
    if (val.length > 6) val = "(" + val.slice(0,3) + ") " + val.slice(3,6) + "-" + val.slice(6);
    else if (val.length > 3) val = "(" + val.slice(0,3) + ") " + val.slice(3);
    else if (val.length > 0) val = "(" + val;
    return val;
  };

  const sectionHead = (icon, title, sub) => (
    <div style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", borderRadius: "10px 10px 0 0", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, marginBottom: 0 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );

  const Card = ({ children, style }) => (
    <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden", marginBottom: 16, ...style }}>
      {children}
    </div>
  );

  const CardBody = ({ children }) => (
    <div style={{ padding: "18px 18px 14px" }}>{children}</div>
  );

  const Row = ({ children }) => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>{children}</div>
  );

  const F = ({ label, flex = 1, minWidth = 140, required, children }) => (
    <div style={{ flex, minWidth, marginBottom: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: 5 }}>
        {label}{required && <span style={{ color: "#e85d04", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );

  const inp = { width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "9px 12px", fontSize: 14, color: "#0f172a", outline: "none", background: "white", fontFamily: "inherit" };
  const sel = { ...inp, appearance: "none" };

  const StateSelect = ({ value, onChange }) => (
    <select style={sel} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">State</option>
      {US_STATES.map(s => <option key={s}>{s}</option>)}
    </select>
  );

  const RadioPill = ({ name, value, checked, onChange, label }) => (
    <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", padding: "7px 14px", border: "1.5px solid " + (checked ? "#0f172a" : "#e2e8f0"), borderRadius: 8, background: checked ? "#0f172a" : "white", transition: "all 0.15s", userSelect: "none" }}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} style={{ display: "none" }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: checked ? "white" : "#475569" }}>{label}</span>
    </label>
  );

  const CheckChip = ({ checked, onChange, label }) => (
    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "5px 11px", border: "1.5px solid " + (checked ? "#0f172a" : "#e2e8f0"), borderRadius: 6, background: checked ? "#0f172a" : "white", transition: "all 0.15s", userSelect: "none", fontSize: 12, color: checked ? "white" : "#334155" }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: "none" }} />
      {label}
    </label>
  );

  const PhotoUpload = ({ photoKey, label }) => {
    const photo = data[photoKey];
    return (
      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: 8 }}>{label}</label>
        {photo ? (
          <div style={{ position: "relative", display: "inline-block" }}>
            <img src={photo} alt="DL" style={{ maxWidth: "100%", maxHeight: 260, borderRadius: 8, border: "2px solid #0ea5e9", display: "block" }} />
            <button onClick={() => setF(photoKey, null)} style={{ position: "absolute", top: 6, right: 6, background: "rgba(15,23,42,0.7)", border: "none", borderRadius: "50%", color: "white", width: 26, height: 26, cursor: "pointer", fontSize: 13 }}>×</button>
          </div>
        ) : (
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: "#f8fafc", border: "1.5px dashed #cbd5e1", borderRadius: 8, padding: "14px 16px" }}>
            <span style={{ fontSize: 22 }}>📷</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Take photo or upload</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Front of Driver's License</div>
            </div>
            <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => {
              const file = e.target.files[0]; if (!file) return;
              compressImage(file, img => setF(photoKey, img));
            }} />
          </label>
        )}
      </div>
    );
  };

  // Monitoring state lifted up to avoid remount issue
  const [bNoFurnish, setBNoFurnish] = useState(data.bNoFurnish || false);
  const [bEthnicity, setBEthnicity] = useState(data.bEthnicity || "");
  const [bRace, setBRace] = useState(data.bRace || []);
  const [bSex, setBSex] = useState(data.bSex || "");
  const [cbNoFurnish, setCBNoFurnish] = useState(data.cbNoFurnish || false);
  const [cbEthnicity, setCBEthnicity] = useState(data.cbEthnicity || "");
  const [cbRace, setCBRace] = useState(data.cbRace || []);
  const [cbSex, setCBSex] = useState(data.cbSex || "");

  const renderMonitoring = (label, noFurnish, setNoFurnish, ethnicity, setEthnicity, race, setRace, sex, setSex, prefix) => {
    const toggleRace = (val) => {
      const next = race.includes(val) ? race.filter(r => r !== val) : [...race, val];
      setRace(next);
      setF(prefix + "Race", next);
    };
    return (
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 12, paddingBottom: 8, borderBottom: "1.5px solid #e2e8f0" }}>{label}</div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 14, userSelect: "none" }}>
          <input type="checkbox" checked={noFurnish} onChange={e => { setNoFurnish(e.target.checked); setF(prefix + "NoFurnish", e.target.checked); }} style={{ width: 16, height: 16, accentColor: "#0f172a" }} />
          <span style={{ fontSize: 12, color: "#334155" }}>I do not wish to furnish this information</span>
        </label>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Ethnicity</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Hispanic or Latino", "Not Hispanic or Latino"].map(opt => (
              <CheckChip key={opt} checked={ethnicity === opt} onChange={() => { const v = ethnicity === opt ? "" : opt; setEthnicity(v); setF(prefix + "Ethnicity", v); }} label={opt} />
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Race</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["American Indian or Alaska Native", "Asian", "Black or African American", "Native Hawaiian or Other Pacific Islander", "White"].map(opt => (
              <CheckChip key={opt} checked={race.includes(opt)} onChange={() => toggleRace(opt)} label={opt} />
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Sex</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Female", "Male"].map(opt => (
              <CheckChip key={opt} checked={sex === opt} onChange={() => { const v = sex === opt ? "" : opt; setSex(v); setF(prefix + "Sex", v); }} label={opt} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "20px 24px 40px" }}>
      <h2 style={S.stepTitle}>Credit Application</h2>
      <p style={S.stepSub}>Complete this financing application. This information stays separate from the proposal contract.</p>

      {/* App type toggle */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["individual", "joint"].map(type => (
          <button key={type} onClick={() => { setF("appType", type); setAppType(type); }} style={{ flex: 1, padding: "13px", border: "2px solid " + (appType === type ? "#0f172a" : "#e2e8f0"), borderRadius: 10, background: appType === type ? "#0f172a" : "white", color: appType === type ? "white" : "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
            {type === "individual" ? "👤 Individual Application" : "👥 Joint Application"}
          </button>
        ))}
      </div>

      {/* ── PROJECT INFO ── */}
      <Card>
        {sectionHead("🏗️", "Project Information", "Financing details")}
        <CardBody>
          <Row>
            <F label="Total Contract Price" required>
              <input style={inp} defaultValue={formRef.current.totalPrice} onChange={e => { const v = fmtCurr(e.target.value); setF("totalPrice", v); setAmountFinanced(calcFinanced(v, formRef.current.downPayment)); }} placeholder="$0.00" />
            </F>
            <F label="Down Payment">
              <input style={inp} defaultValue={formRef.current.downPayment} onChange={e => { const v = fmtCurr(e.target.value); setF("downPayment", v); setAmountFinanced(calcFinanced(formRef.current.totalPrice, v)); }} placeholder="$0.00" />
            </F>
            <F label="Amount Financed">
              <input style={{ ...inp, background: "#f8fafc", color: "#64748b" }} value={amountFinanced} readOnly placeholder="Auto-calculated" />
            </F>
          </Row>
        </CardBody>
      </Card>

      {/* ── BORROWER ── */}
      <Card>
        {sectionHead("👤", "Borrower Information", "Primary applicant")}
        <CardBody>
          {/* Name */}
          <div style={{ fontSize: 11, fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Personal</div>
          <Row>
            <F label="Last Name" flex={2} required><input style={inp} defaultValue={formRef.current.bLast} onChange={e => setF("bLast", e.target.value)} placeholder="Last name" /></F>
            <F label="First Name" flex={2} required><input style={inp} defaultValue={formRef.current.bFirst} onChange={e => setF("bFirst", e.target.value)} placeholder="First name" /></F>
            <F label="M.I." flex={0} minWidth={60}><input style={inp} defaultValue={formRef.current.bMI} onChange={e => setF("bMI", e.target.value)} placeholder="M" maxLength={2} /></F>
          </Row>
          <Row>
            <F label="Social Security Number" required><input style={inp} defaultValue={formRef.current.bSSN} onChange={e => setF("bSSN", fmtSSN(e.target.value))} placeholder="XXX-XX-XXXX" /></F>
            <F label="Date of Birth" required><input style={inp} type="date" defaultValue={formRef.current.bDOB} onChange={e => setF("bDOB", e.target.value)} /></F>
            <F label="Home Phone" required><input style={inp} defaultValue={formRef.current.bPhone} onChange={e => setF("bPhone", fmtPhone(e.target.value))} placeholder="(555) 000-0000" /></F>
          </Row>
          <Row>
            <F label="Email Address" flex={2} required><input style={inp} type="email" defaultValue={formRef.current.bEmail} onChange={e => setF("bEmail", e.target.value)} placeholder="email@example.com" /></F>
            <F label="Years at Present Address" required><input style={inp} type="number" defaultValue={formRef.current.bYearsAddr} onChange={e => { setF("bYearsAddr", e.target.value); setYearsAddr(e.target.value); }} placeholder="0" min="0" /></F>
          </Row>

          {/* Address */}
          <div style={{ height: 1, background: "#f1f5f9", margin: "8px 0 14px" }} />
          <div style={{ fontSize: 11, fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Current Address</div>
          <Row>
            <F label="Street" flex={3} required><input style={inp} defaultValue={formRef.current.bStreet} onChange={e => setF("bStreet", e.target.value)} placeholder="123 Main St" /></F>
            <F label="City" flex={2} required><input style={inp} defaultValue={formRef.current.bCity} onChange={e => setF("bCity", e.target.value)} placeholder="City" /></F>
          </Row>
          <Row>
            <F label="State" required><StateSelect defaultValue={formRef.current.bState} onChange={v => setF("bState", v)} /></F>
            <F label="Zip Code" required><input style={inp} defaultValue={formRef.current.bZip} onChange={e => setF("bZip", e.target.value.replace(/\D/g,"").slice(0,5))} placeholder="00000" /></F>
          </Row>

          {/* Prior address */}
          {showPriorAddr && (
            <>
              <div style={{ height: 1, background: "#f1f5f9", margin: "8px 0 14px" }} />
              <div style={{ fontSize: 11, fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Prior Address <span style={{ fontSize: 10, fontWeight: 400, color: "#94a3b8", textTransform: "none" }}>(less than 2 years at current)</span></div>
              <Row>
                <F label="Street" flex={3}><input style={inp} defaultValue={formRef.current.bPriorStreet} onChange={e => setF("bPriorStreet", e.target.value)} placeholder="Prior street address" /></F>
                <F label="City" flex={2}><input style={inp} defaultValue={formRef.current.bPriorCity} onChange={e => setF("bPriorCity", e.target.value)} placeholder="City" /></F>
              </Row>
              <Row>
                <F label="State"><StateSelect defaultValue={formRef.current.bPriorState} onChange={v => setF("bPriorState", v)} /></F>
                <F label="Zip"><input style={inp} defaultValue={formRef.current.bPriorZip} onChange={e => setF("bPriorZip", e.target.value.replace(/\D/g,"").slice(0,5))} placeholder="00000" /></F>
              </Row>
            </>
          )}

          {/* Employment */}
          <div style={{ height: 1, background: "#f1f5f9", margin: "8px 0 14px" }} />
          <div style={{ fontSize: 11, fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Employment</div>
          <Row>
            <F label="Employer Name" flex={3} required><input style={inp} defaultValue={formRef.current.bEmployer} onChange={e => setF("bEmployer", e.target.value)} placeholder="Employer name" /></F>
            <F label="Time on Job"><input style={inp} defaultValue={formRef.current.bJobTime} onChange={e => setF("bJobTime", e.target.value)} placeholder="e.g. 3 years" /></F>
          </Row>
          <Row>
            <F label="Employer Street" flex={3}><input style={inp} defaultValue={formRef.current.bEmpStreet} onChange={e => setF("bEmpStreet", e.target.value)} placeholder="Street address" /></F>
            <F label="City" flex={2}><input style={inp} defaultValue={formRef.current.bEmpCity} onChange={e => setF("bEmpCity", e.target.value)} placeholder="City" /></F>
          </Row>
          <Row>
            <F label="State"><StateSelect defaultValue={formRef.current.bEmpState} onChange={v => setF("bEmpState", v)} /></F>
            <F label="Zip"><input style={inp} defaultValue={formRef.current.bEmpZip} onChange={e => setF("bEmpZip", e.target.value.replace(/\D/g,"").slice(0,5))} placeholder="00000" /></F>
            <F label="Employer Phone"><input style={inp} defaultValue={formRef.current.bEmpPhone} onChange={e => setF("bEmpPhone", fmtPhone(e.target.value))} placeholder="(555) 000-0000" /></F>
          </Row>
          <Row>
            <F label="Current Position"><input style={inp} defaultValue={formRef.current.bPosition} onChange={e => setF("bPosition", e.target.value)} placeholder="Job title" /></F>
            <F label="Gross Salary" required><input style={inp} defaultValue={formRef.current.bSalary} onChange={e => setF("bSalary", fmtCurr(e.target.value))} placeholder="$0.00" /></F>
            <F label="Frequency">
              <div style={{ display: "flex", gap: 8 }}>
                <RadioPill name="bSalaryFreq" value="weekly" checked={data.bSalaryFreq === "weekly"} onChange={() => setF("bSalaryFreq", "weekly")} label="Weekly" />
                <RadioPill name="bSalaryFreq" value="monthly" checked={data.bSalaryFreq === "monthly"} onChange={() => setF("bSalaryFreq", "monthly")} label="Monthly" />
              </div>
            </F>
          </Row>
          <Row>
            <F label="Other Income"><input style={inp} defaultValue={formRef.current.bOtherIncome} onChange={e => setF("bOtherIncome", fmtCurr(e.target.value))} placeholder="$0.00" /></F>
            <F label="Source"><input style={inp} defaultValue={formRef.current.bIncomeSource} onChange={e => setF("bIncomeSource", e.target.value)} placeholder="e.g. Rental income" /></F>
            <F label="Frequency">
              <div style={{ display: "flex", gap: 8 }}>
                <RadioPill name="bIncomeFreq" value="weekly" checked={data.bIncomeFreq === "weekly"} onChange={() => setF("bIncomeFreq", "weekly")} label="Weekly" />
                <RadioPill name="bIncomeFreq" value="monthly" checked={data.bIncomeFreq === "monthly"} onChange={() => setF("bIncomeFreq", "monthly")} label="Monthly" />
              </div>
            </F>
          </Row>
          <p style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic", marginTop: 0, marginBottom: 12 }}>* Income from alimony, child support, or separate maintenance need not be revealed if you choose not to rely on it.</p>

          {/* Mortgage */}
          <div style={{ height: 1, background: "#f1f5f9", margin: "8px 0 14px" }} />
          <div style={{ fontSize: 11, fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Mortgage / Housing</div>
          <Row>
            <F label="Mortgage Holder" flex={3}><input style={inp} defaultValue={formRef.current.bMortgageHolder} onChange={e => setF("bMortgageHolder", e.target.value)} placeholder="Lender name" /></F>
            <F label="Monthly Payment"><input style={inp} defaultValue={formRef.current.bMortgagePayment} onChange={e => setF("bMortgagePayment", fmtCurr(e.target.value))} placeholder="$0.00" /></F>
          </Row>
          <Row>
            <F label="Current Balance"><input style={inp} defaultValue={formRef.current.bMortgageBalance} onChange={e => setF("bMortgageBalance", fmtCurr(e.target.value))} placeholder="$0.00" /></F>
            <F label="Purchase Price"><input style={inp} defaultValue={formRef.current.bPurchasePrice} onChange={e => setF("bPurchasePrice", fmtCurr(e.target.value))} placeholder="$0.00" /></F>
            <F label="Current Value"><input style={inp} defaultValue={formRef.current.bCurrentValue} onChange={e => setF("bCurrentValue", fmtCurr(e.target.value))} placeholder="$0.00" /></F>
          </Row>
        </CardBody>
      </Card>

      {/* ── CO-BORROWER ── */}
      <Card>
        {sectionHead("👥", "Co-Borrower Information", isJoint ? "Joint applicant" : "Not required for individual applications")}
        <CardBody>
          {!isJoint ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>👤</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Individual application selected</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Switch to Joint Application above to add a co-borrower</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Personal</div>
              <Row>
                <F label="Last Name" flex={2} required><input style={inp} defaultValue={formRef.current.cbLast} onChange={e => setF("cbLast", e.target.value)} placeholder="Last name" /></F>
                <F label="First Name" flex={2} required><input style={inp} defaultValue={formRef.current.cbFirst} onChange={e => setF("cbFirst", e.target.value)} placeholder="First name" /></F>
                <F label="M.I." flex={0} minWidth={60}><input style={inp} defaultValue={formRef.current.cbMI} onChange={e => setF("cbMI", e.target.value)} placeholder="M" maxLength={2} /></F>
              </Row>
              <Row>
                <F label="Social Security Number" required><input style={inp} defaultValue={formRef.current.cbSSN} onChange={e => setF("cbSSN", fmtSSN(e.target.value))} placeholder="XXX-XX-XXXX" /></F>
                <F label="Date of Birth" required><input style={inp} type="date" defaultValue={formRef.current.cbDOB} onChange={e => setF("cbDOB", e.target.value)} /></F>
              </Row>
              <div style={{ height: 1, background: "#f1f5f9", margin: "8px 0 14px" }} />
              <div style={{ fontSize: 11, fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Employment</div>
              <Row>
                <F label="Employer Name" flex={3}><input style={inp} defaultValue={formRef.current.cbEmployer} onChange={e => setF("cbEmployer", e.target.value)} placeholder="Employer name" /></F>
                <F label="Time on Job"><input style={inp} defaultValue={formRef.current.cbJobTime} onChange={e => setF("cbJobTime", e.target.value)} placeholder="e.g. 2 years" /></F>
              </Row>
              <Row>
                <F label="Employer Address" flex={3}><input style={inp} defaultValue={formRef.current.cbEmpAddr} onChange={e => setF("cbEmpAddr", e.target.value)} placeholder="Street, City, State, Zip" /></F>
                <F label="Employer Phone"><input style={inp} defaultValue={formRef.current.cbEmpPhone} onChange={e => setF("cbEmpPhone", fmtPhone(e.target.value))} placeholder="(555) 000-0000" /></F>
              </Row>
              <Row>
                <F label="Current Position"><input style={inp} defaultValue={formRef.current.cbPosition} onChange={e => setF("cbPosition", e.target.value)} placeholder="Job title" /></F>
                <F label="Gross Salary"><input style={inp} defaultValue={formRef.current.cbSalary} onChange={e => setF("cbSalary", fmtCurr(e.target.value))} placeholder="$0.00" /></F>
                <F label="Frequency">
                  <div style={{ display: "flex", gap: 8 }}>
                    <RadioPill name="cbSalaryFreq" value="weekly" checked={data.cbSalaryFreq === "weekly"} onChange={() => setF("cbSalaryFreq", "weekly")} label="Weekly" />
                    <RadioPill name="cbSalaryFreq" value="monthly" checked={data.cbSalaryFreq === "monthly"} onChange={() => setF("cbSalaryFreq", "monthly")} label="Monthly" />
                  </div>
                </F>
              </Row>
              <Row>
                <F label="Other Income"><input style={inp} defaultValue={formRef.current.cbOtherIncome} onChange={e => setF("cbOtherIncome", fmtCurr(e.target.value))} placeholder="$0.00" /></F>
                <F label="Source"><input style={inp} defaultValue={formRef.current.cbIncomeSource} onChange={e => setF("cbIncomeSource", e.target.value)} placeholder="e.g. Rental income" /></F>
                <F label="Frequency">
                  <div style={{ display: "flex", gap: 8 }}>
                    <RadioPill name="cbIncomeFreq" value="weekly" checked={data.cbIncomeFreq === "weekly"} onChange={() => setF("cbIncomeFreq", "weekly")} label="Weekly" />
                    <RadioPill name="cbIncomeFreq" value="monthly" checked={data.cbIncomeFreq === "monthly"} onChange={() => setF("cbIncomeFreq", "monthly")} label="Monthly" />
                  </div>
                </F>
              </Row>
              <p style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic", marginTop: 0 }}>* Income from alimony, child support, or separate maintenance need not be revealed if you choose not to rely on it.</p>
            </>
          )}
        </CardBody>
      </Card>

      {/* ── GOVERNMENT MONITORING ── */}
      <Card>
        {sectionHead("🏛️", "Government Monitoring", "Required by federal law — participation is voluntary")}
        <CardBody>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 14px", fontSize: 11, color: "#78350f", lineHeight: 1.6, marginBottom: 18 }}>
            The following information is requested by the federal government for certain types of loans related to a dwelling in order to monitor the lender's compliance with equal credit opportunity, fair housing and home mortgage disclosure laws. You are not required to furnish this information, but are encouraged to do so.
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {renderMonitoring("Borrower", bNoFurnish, setBNoFurnish, bEthnicity, setBEthnicity, bRace, setBRace, bSex, setBSex, "b")}
            {isJoint && renderMonitoring("Co-Borrower", cbNoFurnish, setCBNoFurnish, cbEthnicity, setCBEthnicity, cbRace, setCBRace, cbSex, setCBSex, "cb")}
          </div>
        </CardBody>
      </Card>

      {/* ── AUTHORIZATION & SIGNATURES ── */}
      <Card>
        {sectionHead("✍️", "Authorization & Signatures", "Review and sign to complete")}
        <CardBody>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px", fontSize: 11, color: "#334155", lineHeight: 1.7, marginBottom: 20 }}>
            I/we have read this "Financing Application" Quality Assurance and "Terms and Conditions" for the financing and by signing below, I/we agree to be bound by the requirements and provisions herein. I/we certify that the information I/we given is true and complete to the best of my/our knowledge. I/we authorize the lender of choice to verify any of the information given about me/us and obtain information from my/our employer(s) and to obtain credit reports in connection with this application for financing. <strong>THIS APPLICATION MAY BE SUBMITTED TO MORE THAN ONE POTENTIAL LENDER.</strong>
          </div>

          {/* Borrower sig block */}
          <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14 }}>Borrower</div>

            {/* Borrower Signature Pad */}
            <SigPad
              strokes={bStrokes}
              currentStroke={bCurrentStroke}
              hasSigned={bStrokes.length > 0}
              onStart={e => sigStart(e, setBCurrentStroke)}
              onMove={e => sigMove(e, bCurrentStroke, setBCurrentStroke)}
              onEnd={() => sigEnd(bCurrentStroke, setBCurrentStroke, setBStrokes)}
              onClear={() => { setBStrokes([]); setBCurrentStroke(null); }}
            />

            <Row>
              <F label="Date" required>
                <input style={inp} type="date" defaultValue={formRef.current.bSigDate} onChange={e => setF("bSigDate", e.target.value)} />
              </F>
            </Row>
            <Row>
              <F label="Driver's License No. & State" flex={2} required>
                <input style={inp} defaultValue={formRef.current.bDLNum} onChange={e => setF("bDLNum", e.target.value)} placeholder="e.g. D123456789 — FL" />
              </F>
              <F label="DL Expiration Date" required>
                <input style={inp} type="date" defaultValue={formRef.current.bDLExp} onChange={e => setF("bDLExp", e.target.value)} />
              </F>
            </Row>
            <PhotoUpload photoKey="bDLPhoto" label="Driver's License Photo" />
          </div>

          {/* Co-borrower sig block */}
          {isJoint && (
            <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14 }}>Co-Borrower</div>

              {/* Co-Borrower Signature Pad */}
              <SigPad
                strokes={cbStrokes}
                currentStroke={cbCurrentStroke}
                hasSigned={cbStrokes.length > 0}
                onStart={e => sigStart(e, setCBCurrentStroke)}
                onMove={e => sigMove(e, cbCurrentStroke, setCBCurrentStroke)}
                onEnd={() => sigEnd(cbCurrentStroke, setCBCurrentStroke, setCBStrokes)}
                onClear={() => { setCBStrokes([]); setCBCurrentStroke(null); }}
              />

              <Row>
                <F label="Date" required>
                  <input style={inp} type="date" defaultValue={formRef.current.cbSigDate} onChange={e => setF("cbSigDate", e.target.value)} />
                </F>
              </Row>
              <Row>
                <F label="Driver's License No. & State" flex={2} required>
                  <input style={inp} defaultValue={formRef.current.cbDLNum} onChange={e => setF("cbDLNum", e.target.value)} placeholder="e.g. D123456789 — FL" />
                </F>
                <F label="DL Expiration Date" required>
                  <input style={inp} type="date" defaultValue={formRef.current.cbDLExp} onChange={e => setF("cbDLExp", e.target.value)} />
                </F>
              </Row>
              <PhotoUpload photoKey="cbDLPhoto" label="Co-Borrower Driver's License Photo" />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Save as PDF button */}
      <button
        onClick={() => {
          // Inject current signature data from refs before building PDF
          // Sync formRef to parent before PDF
          onChange(formRef.current);
          const dataWithSigs = {
            ...formRef.current,
            bSignature: bStrokes.length > 0 ? strokesToDataUrl(bStrokes) : null,
            cbSignature: cbStrokes.length > 0 ? strokesToDataUrl(cbStrokes) : null,
          };
          const creditHtml = buildCreditAppPDF(dataWithSigs, projectTotal);
          const clientName = (formRef.current.bFirst + "_" + formRef.current.bLast).replace(/[^a-zA-Z0-9_]/g, "") || "Client";
          const dateStr = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }).replace(/\//g, "-");
          const newWin = window.open("", "_blank");
          if (newWin) {
            newWin.document.write(creditHtml);
            newWin.document.close();
            newWin.document.title = "NDC_CreditApp_" + clientName + "_" + dateStr;
            setTimeout(() => { newWin.focus(); newWin.print(); }, 800);
          }
        }}
        style={{ width: "100%", background: "linear-gradient(135deg,#0f172a,#1e3a5f)", color: "white", border: "none", borderRadius: 10, padding: "15px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}
      >
        ⬇️ Save Credit Application as PDF
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Credit App PDF builder
// ─────────────────────────────────────────────────────────────────────────────
function buildCreditAppPDF(data, projectTotal) {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const isJoint = data.appType === "joint";

  const css = `
    body{font-family:Arial,sans-serif;padding:28px;max-width:760px;margin:0 auto;color:#0f172a;font-size:11px}
    h1{font-size:16px;font-weight:800;margin:0 0 4px}
    .hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:2.5px solid #0f172a;margin-bottom:18px}
    .sec{margin-bottom:16px;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden}
    .sec-head{background:#0f172a;color:white;padding:8px 14px;font-size:10px;font-weight:800;letter-spacing:0.8px;text-transform:uppercase}
    .sec-body{padding:14px}
    .row{display:flex;gap:16px;margin-bottom:10px;flex-wrap:wrap}
    .field{flex:1;min-width:140px}
    .lbl{font-size:8.5px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;display:block;margin-bottom:3px}
    .val{font-size:11px;color:#0f172a;border-bottom:1px solid #e2e8f0;padding-bottom:3px;min-height:18px;font-weight:500}
    .val.blank{color:#cbd5e1}
    .divider{height:1px;background:#f1f5f9;margin:10px 0}
    .sub{font-size:9px;font-weight:800;color:#0ea5e9;text-transform:uppercase;letter-spacing:0.8px;margin:10px 0 8px}
    .note{font-size:9px;color:#94a3b8;font-style:italic;margin-top:4px}
    .cols{display:flex;gap:24px}
    .col{flex:1}
    .chip-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}
    .chip{padding:3px 10px;border:1px solid #e2e8f0;border-radius:12px;font-size:10px;color:#334155}
    .chip.on{background:#0f172a;color:white;border-color:#0f172a}
    .sig-box{border:1px solid #e2e8f0;border-radius:6px;background:#f8fafc;height:70px;margin-bottom:6px;display:flex;align-items:center;justify-content:center;font-size:13px;font-style:italic;color:#334155}
    .dl-img{max-width:480px;width:100%;max-height:280px;border:2px solid #0ea5e9;border-radius:6px;margin-top:8px;object-fit:contain}
    @media print{body{padding:12px}}
  `;

  const V = (v, fallback) => v || fallback || '<span class="blank">—</span>';
  const field = (label, value, flex) => `<div class="field"${flex ? ` style="flex:${flex}"` : ""}><span class="lbl">${label}</span><div class="val">${V(value)}</div></div>`;
  const divider = '<div class="divider"></div>';

  let body = `
  <div class="hdr">
    <div>
      <h1>New Direction Construction</h1>
      <div style="color:#64748b;font-size:10px">820 Worth Rd, Jacksonville, FL 32259 &nbsp;·&nbsp; (904) 891-9980 &nbsp;·&nbsp; Lic# CBC059304</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:14px;font-weight:800">Credit Application</div>
      <div style="font-size:9.5px;color:#64748b;margin-top:3px">${isJoint ? "Joint Application" : "Individual Application"} &nbsp;·&nbsp; ${today}</div>
    </div>
  </div>`;

  // Project info
  body += `<div class="sec"><div class="sec-head">Project Information</div><div class="sec-body">
    <div class="row">
      ${field("Total Contract Price", data.totalPrice)}
      ${field("Down Payment", data.downPayment)}
      ${field("Amount Financed", data.amountFinanced)}
    </div>
  </div></div>`;

  // Borrower
  body += `<div class="sec"><div class="sec-head">Borrower Information</div><div class="sec-body">
    <div class="sub">Personal</div>
    <div class="row">
      ${field("Last Name", data.bLast, 2)} ${field("First Name", data.bFirst, 2)} ${field("M.I.", data.bMI, 0.3)}
    </div>
    <div class="row">
      ${field("Social Security Number", data.bSSN ? "●●●-●●-" + data.bSSN.slice(-4) : "")}
      ${field("Date of Birth", data.bDOB)}
      ${field("Home Phone", data.bPhone)}
    </div>
    <div class="row">
      ${field("Email Address", data.bEmail, 2)}
      ${field("Years at Present Address", data.bYearsAddr)}
    </div>
    ${divider}
    <div class="sub">Current Address</div>
    <div class="row">
      ${field("Street", data.bStreet, 3)} ${field("City", data.bCity, 2)}
    </div>
    <div class="row">
      ${field("State", data.bState)} ${field("Zip", data.bZip)}
    </div>`;

  if (parseInt(data.bYearsAddr || "99") < 2) {
    body += `${divider}<div class="sub">Prior Address</div>
    <div class="row">
      ${field("Street", data.bPriorStreet, 3)} ${field("City", data.bPriorCity, 2)}
    </div>
    <div class="row">
      ${field("State", data.bPriorState)} ${field("Zip", data.bPriorZip)}
    </div>`;
  }

  body += `${divider}<div class="sub">Employment</div>
    <div class="row">
      ${field("Employer Name", data.bEmployer, 3)} ${field("Time on Job", data.bJobTime)}
    </div>
    <div class="row">
      ${field("Employer Street", data.bEmpStreet, 3)} ${field("City", data.bEmpCity, 2)}
    </div>
    <div class="row">
      ${field("State", data.bEmpState)} ${field("Zip", data.bEmpZip)} ${field("Employer Phone", data.bEmpPhone)}
    </div>
    <div class="row">
      ${field("Current Position", data.bPosition)}
      ${field("Gross Salary", data.bSalary + (data.bSalaryFreq ? " (" + data.bSalaryFreq + ")" : ""))}
    </div>
    <div class="row">
      ${field("Other Income", data.bOtherIncome ? data.bOtherIncome + (data.bIncomeFreq ? " (" + data.bIncomeFreq + ")" : "") : "")}
      ${field("Source", data.bIncomeSource)}
    </div>
    <p class="note">* Income from alimony, child support, or separate maintenance need not be revealed if you choose not to rely on it.</p>
    ${divider}
    <div class="sub">Mortgage / Housing</div>
    <div class="row">
      ${field("Mortgage Holder", data.bMortgageHolder, 2)} ${field("Monthly Payment", data.bMortgagePayment)}
    </div>
    <div class="row">
      ${field("Current Balance", data.bMortgageBalance)} ${field("Purchase Price", data.bPurchasePrice)} ${field("Current Value", data.bCurrentValue)}
    </div>
  </div></div>`;

  // Co-borrower
  if (isJoint) {
    body += `<div class="sec"><div class="sec-head">Co-Borrower Information</div><div class="sec-body">
      <div class="sub">Personal</div>
      <div class="row">
        ${field("Last Name", data.cbLast, 2)} ${field("First Name", data.cbFirst, 2)} ${field("M.I.", data.cbMI, 0.3)}
      </div>
      <div class="row">
        ${field("Social Security Number", data.cbSSN ? "●●●-●●-" + data.cbSSN.slice(-4) : "")}
        ${field("Date of Birth", data.cbDOB)}
      </div>
      ${divider}
      <div class="sub">Employment</div>
      <div class="row">
        ${field("Employer Name", data.cbEmployer, 3)} ${field("Time on Job", data.cbJobTime)}
      </div>
      <div class="row">
        ${field("Employer Address", data.cbEmpAddr, 2)} ${field("Employer Phone", data.cbEmpPhone)}
      </div>
      <div class="row">
        ${field("Current Position", data.cbPosition)}
        ${field("Gross Salary", data.cbSalary + (data.cbSalaryFreq ? " (" + data.cbSalaryFreq + ")" : ""))}
      </div>
      <div class="row">
        ${field("Other Income", data.cbOtherIncome ? data.cbOtherIncome + (data.cbIncomeFreq ? " (" + data.cbIncomeFreq + ")" : "") : "")}
        ${field("Source", data.cbIncomeSource)}
      </div>
    </div></div>`;
  }

  // Monitoring
  const monBlock = (prefix, label) => {
    const d = {
      noFurnish: data[prefix + "NoFurnish"],
      ethnicity: data[prefix + "Ethnicity"],
      race: data[prefix + "Race"] || [],
      sex: data[prefix + "Sex"],
    };
    const chipRow = (items, selected) => items.map(i => `<span class="chip${(Array.isArray(selected) ? selected.includes(i) : selected === i) ? " on" : ""}">${i}</span>`).join("");
    return `<div class="col">
      <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid #e2e8f0">${label}</div>
      ${d.noFurnish ? '<div style="font-size:10px;color:#64748b;font-style:italic">Does not wish to furnish information</div>' : `
        <div class="lbl" style="margin-top:6px">Ethnicity</div>
        <div class="chip-row">${chipRow(["Hispanic or Latino","Not Hispanic or Latino"], d.ethnicity)}</div>
        <div class="lbl" style="margin-top:8px">Race</div>
        <div class="chip-row">${chipRow(["American Indian or Alaska Native","Asian","Black or African American","Native Hawaiian or Other Pacific Islander","White"], d.race)}</div>
        <div class="lbl" style="margin-top:8px">Sex</div>
        <div class="chip-row">${chipRow(["Female","Male"], d.sex)}</div>
      `}
    </div>`;
  };

  body += `<div class="sec"><div class="sec-head">Information for Government Monitoring Purposes</div><div class="sec-body">
    <p style="font-size:9.5px;color:#64748b;margin:0 0 12px;line-height:1.6">The following information is requested by the federal government for certain types of loans related to a dwelling in order to monitor the lender's compliance with equal credit opportunity, fair housing and home mortgage disclosure laws. You are not required to furnish this information, but are encouraged to do so.</p>
    <div class="cols">
      ${monBlock("b", "Borrower")}
      ${isJoint ? monBlock("cb", "Co-Borrower") : ""}
    </div>
  </div></div>`;

  // Signatures
  const sigBlock = (prefix, label, sig, sigDate, dlNum, dlExp, dlPhoto) => `
    <div style="margin-bottom:${isJoint ? "20px" : "0"}">
      <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:10px">${label}</div>
      <div style="font-size:8.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:5px">Signature</div>
      ${sig
        ? `<img src="${sig}" style="width:100%;max-width:380px;height:80px;object-fit:contain;border:1px solid #e2e8f0;border-radius:6px;background:#f8fafc;display:block;margin-bottom:8px" alt="${label} Signature"/>`
        : `<div style="border:1px solid #e2e8f0;border-radius:6px;background:#f8fafc;height:80px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;color:#cbd5e1;font-size:10px;font-style:italic">No signature captured</div>`
      }
      <div style="display:flex;gap:16px;margin-bottom:10px;flex-wrap:wrap">
        ${field("Date", sigDate || new Date().toLocaleDateString("en-US"))}
        ${field("Driver's License No. & State", dlNum, 2)}
        ${field("DL Expiration Date", dlExp)}
      </div>
      ${dlPhoto ? `<div><span class="lbl">Driver's License Photo</span><br><img src="${dlPhoto}" class="dl-img" alt="DL Photo" /></div>` : '<div style="border:1px dashed #e2e8f0;border-radius:6px;padding:16px;text-align:center;color:#cbd5e1;font-size:10px;margin-top:6px">Driver\'s License Photo — not uploaded</div>'}
    </div>`;

  body += `<div class="sec"><div class="sec-head">Authorization & Signatures</div><div class="sec-body">
    <p style="font-size:9.5px;color:#64748b;margin:0 0 14px;line-height:1.65">I/we have read this "Financing Application" Quality Assurance and "Terms and Conditions" for the financing and by signing below, I/we agree to be bound by the requirements and provisions herein. I/we certify that the information I/we given is true and complete to the best of my/our knowledge. I/we authorize the lender of choice to verify any of the information given about me/us and obtain information from my/our employer(s) and to obtain credit reports. <strong>THIS APPLICATION MAY BE SUBMITTED TO MORE THAN ONE POTENTIAL LENDER.</strong></p>
    ${sigBlock("b", "Borrower", data.bSignature, data.bSigDate, data.bDLNum, data.bDLExp, data.bDLPhoto)}
    ${isJoint ? sigBlock("cb", "Co-Borrower", data.cbSignature, data.cbSigDate, data.cbDLNum, data.cbDLExp, data.cbDLPhoto) : ""}
  </div></div>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRICE GATE
// ─────────────────────────────────────────────────────────────────────────────
function PriceGateStep({ onConfirm, services }) {
  const serviceLabels = {
    siding: "James Hardie Siding", soffit: "Soffit Installation", fascia: "Fascia Installation",
    paint: "Exterior Paint", windows: "Window Replacement", misc: "Additional Items",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 560, padding: "40px 24px", textAlign: "center" }}>
      <div style={{ width: 88, height: 88, background: "linear-gradient(135deg,#0ea5e9,#0369a1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28, boxShadow: "0 16px 40px rgba(14,165,233,0.35)" }}>
        <span style={{ fontSize: 40 }}>💰</span>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 14px", lineHeight: 1.25, maxWidth: 360 }}>Are you ready to go over the pricing for this project?</h2>
      <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "14px 20px", marginBottom: 28, width: "100%", maxWidth: 400, textAlign: "left" }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>We've covered all the details for:</div>
        {services.map(svc => (
          <div key={svc} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid #f1f5f9", fontSize: 12, color: "#334155" }}>
            <span style={{ color: "#22c55e", fontWeight: 800 }}>✓</span><span>{serviceLabels[svc] || svc}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: "0 0 32px", maxWidth: 380 }}>Now let's review what it will take to bring this project to life — including your investment options and payment flexibility.</p>
      <button onClick={onConfirm} style={{ background: "linear-gradient(135deg,#0ea5e9,#0369a1)", color: "white", border: "none", borderRadius: 14, padding: "16px 44px", fontWeight: 800, fontSize: 17, cursor: "pointer", letterSpacing: "-0.3px", boxShadow: "0 8px 28px rgba(14,165,233,0.35)", width: "100%", maxWidth: 400 }}>
        Yes, Let's Review the Price
      </button>
      <div style={{ marginTop: 16, fontSize: 11, color: "#94a3b8" }}>Pricing is based on the full scope of work we reviewed together</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRICING STEP (Rep-only)
// ─────────────────────────────────────────────────────────────────────────────
function PricingStep({ state, onChange }) {
  var p = state.pricing || {};
  var services = state.services || [];
  function set(k, v) { onChange(Object.assign({}, p, { [k]: v })); }

  var sidingArea  = ((state.siding && state.siding.walls) || []).reduce(function(a,w){ return a + parseFloat(w.sqft||0); }, 0);
  var soffitLinFt = ((state.soffit && state.soffit.items) || []).reduce(function(a,i){ return a + parseFloat(i.linearFt||0); }, 0);
  var fasciaLinFt = ((state.fascia && state.fascia.items) || []).reduce(function(a,i){ return a + parseFloat(i.linearFt||0); }, 0);
  var paintSqFt = parseFloat(state.paint.combinedSqft||0);
  var totalWindows = state.windows.reduce(function(a,w){ return a + parseFloat(w.qty||1); }, 0);
  var miscTotal = state.misc.items.reduce(function(a,i){ return a + parseFloat(i.qty||0)*parseFloat(i.unitPrice||0); }, 0);

  var sidTotal = services.includes("siding") ? sidingArea * parseFloat(p.sidingPerSqFt||0) : 0;
  var sidStdTotal = sidTotal * (1 + parseFloat(p.sidingStandardMarkupPct||0) / 100);
  var sofTotal = services.includes("soffit") ? soffitLinFt * parseFloat(p.soffitPerLinFt||0) : 0;
  var sofStdTotal = sofTotal * (1 + parseFloat(p.soffitStandardMarkupPct||0) / 100);
  var fasTotal = services.includes("fascia") ? fasciaLinFt * parseFloat(p.fasciaPerLinFt||0) : 0;
  var fasStdTotal = fasTotal * (1 + parseFloat(p.fasciaStandardMarkupPct||0) / 100);
  var pntTotal = services.includes("paint") ? paintSqFt * parseFloat(p.paintPerSqFt||0) : 0;
  var pntStandardTotal = pntTotal * (1 + parseFloat(p.paintStandardMarkupPct||0) / 100);
  var winTotal = services.includes("windows") ? totalWindows * parseFloat(p.windowPerUnit||0) : 0;
  var winStdTotal = winTotal * (1 + parseFloat(p.windowStandardMarkupPct||0) / 100);
  var grandAdminTotal = sidTotal + sofTotal + fasTotal + pntTotal + winTotal + miscTotal;
  var grandStandardTotal = sidStdTotal + sofStdTotal + fasStdTotal + pntStandardTotal + winStdTotal + miscTotal;

  var cardStyle = { background: "white", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 12 };
  var labelStyle = { fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 4 };
  var inputStyle = { width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#0f172a", outline: "none", background: "white" };

  function PriceBox(label, total) {
    return React.createElement("div", { style: { flex: 1, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "8px 12px" } },
      React.createElement("div", { style: { fontSize: 10, color: "#64748b", fontWeight: 700 } }, label),
      React.createElement("div", { style: { fontSize: 16, fontWeight: 800, color: "#0ea5e9" } }, fmt(total))
    );
  }

  function ServicePricingCard(label, qty, qtyLabel, adminKey, markupKey, adminTotal, placeholder) {
    var markupPct = parseFloat(p[markupKey]||0);
    var stdTotal = adminTotal * (1 + markupPct / 100);
    return React.createElement("div", { style: cardStyle },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 4 } }, label),
      React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginBottom: 10 } }, "Total: ", React.createElement("strong", null, qty + " " + qtyLabel)),
      React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-end" } },
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("label", { style: { ...labelStyle, color: "#0369a1" } }, "Admin Savings price (per " + qtyLabel + ")"),
          React.createElement("div", { style: { fontSize: 10, color: "#64748b", marginBottom: 4 } }, "Admin Savings Incentive price"),
          React.createElement("input", { style: inputStyle, type: "number", value: p[adminKey]||"", onChange: function(e){ set(adminKey, e.target.value); }, placeholder: placeholder })
        ),
        PriceBox("ADMIN TOTAL", adminTotal)
      ),
      React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "flex-end" } },
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("label", { style: { ...labelStyle, color: "#475569" } }, "Standard pricing markup (%)"),
          React.createElement("div", { style: { fontSize: 10, color: "#64748b", marginBottom: 4 } }, "Standard = Admin price + this % on top"),
          React.createElement("input", { style: inputStyle, type: "number", value: p[markupKey]||"", onChange: function(e){ set(markupKey, e.target.value); }, placeholder: "e.g. 15" })
        ),
        PriceBox("STANDARD TOTAL", stdTotal)
      )
    );
  }

  return React.createElement("div", { style: { padding: "0 0 24px" } },
    React.createElement("h2", { style: { fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" } }, "Job Pricing"),
    React.createElement("p", { style: { color: "#64748b", fontSize: 13, margin: "0 0 20px", lineHeight: 1.5 } }, "Private — client does not see this step"),
    React.createElement("div", { style: { background: "#fef9c3", border: "1.5px solid #fde68a", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#92400e", fontWeight: 600 } }, "This step is for your eyes only. Enter your pricing rates below."),
    services.includes("siding")  ? ServicePricingCard("James Hardie Siding", sidingArea.toFixed(0), "sq ft", "sidingPerSqFt", "sidingStandardMarkupPct", sidTotal, "e.g. 15.00") : null,
    services.includes("soffit")  ? ServicePricingCard("Soffit Installation", soffitLinFt.toFixed(0), "linear ft", "soffitPerLinFt", "soffitStandardMarkupPct", sofTotal, "e.g. 8.00") : null,
    services.includes("fascia")  ? ServicePricingCard("Fascia Installation", fasciaLinFt.toFixed(0), "linear ft", "fasciaPerLinFt", "fasciaStandardMarkupPct", fasTotal, "e.g. 8.00") : null,
    services.includes("paint")   ? ServicePricingCard("Exterior Paint", paintSqFt.toFixed(0), "sq ft", "paintPerSqFt", "paintStandardMarkupPct", pntTotal, "e.g. 2.50") : null,
    services.includes("windows") ? React.createElement("div", { style: cardStyle },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 4 } }, "Window Installation"),
      React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginBottom: 10 } }, "Total: ", React.createElement("strong", null, totalWindows + " units")),
      React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-end" } },
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("label", { style: { ...labelStyle, color: "#0369a1" } }, "Admin Savings price (per unit)"),
          React.createElement("div", { style: { fontSize: 10, color: "#64748b", marginBottom: 4 } }, "Admin Savings Incentive price"),
          React.createElement("input", { style: inputStyle, type: "number", value: p.windowPerUnit||"", onChange: function(e){ set("windowPerUnit", e.target.value); }, placeholder: "e.g. 450.00" })
        ),
        PriceBox("ADMIN TOTAL", winTotal)
      ),
      React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-end" } },
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("label", { style: { ...labelStyle, color: "#475569" } }, "Standard pricing markup (%)"),
          React.createElement("div", { style: { fontSize: 10, color: "#64748b", marginBottom: 4 } }, "Standard = Admin price + this % on top"),
          React.createElement("input", { style: inputStyle, type: "number", value: p.windowStandardMarkupPct||"", onChange: function(e){ set("windowStandardMarkupPct", e.target.value); }, placeholder: "e.g. 15" })
        ),
        PriceBox("STANDARD TOTAL", p.windowStandardMarkupPct ? winTotal * (1 + parseFloat(p.windowStandardMarkupPct) / 100) : winTotal)
      )
    ) : null,
    services.includes("misc") && miscTotal > 0 ? React.createElement("div", { style: cardStyle },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } },
        React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: "#0f172a" } }, "Miscellaneous"),
        React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: "#0ea5e9" } }, fmt(miscTotal))
      )
    ) : null,
    React.createElement("div", { style: cardStyle },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 6 } }, "Financing (Optional)"),
      React.createElement("label", { style: labelStyle }, "Admin Savings monthly payment ($/mo)"),
      React.createElement("input", { style: inputStyle, type: "number", value: p.monthlyPayment||"", onChange: function(e){ set("monthlyPayment", e.target.value); }, placeholder: "e.g. 285.00" }),
      React.createElement("div", { style: { height: 10 } }),
      React.createElement("label", { style: labelStyle }, "Standard pricing — add-on amount ($/mo)"),
      React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginBottom: 6 } }, "Standard financing shown = this amount + Admin Savings amount"),
      React.createElement("input", { style: inputStyle, type: "number", value: p.standardFinancingAdd||"", onChange: function(e){ set("standardFinancingAdd", e.target.value); }, placeholder: "e.g. 47.00" }),
      p.monthlyPayment ? React.createElement("div", { style: { fontSize: 11, color: "#0369a1", marginTop: 8, fontWeight: 700 } },
        "Standard financing displays as: $" + (parseFloat(p.monthlyPayment) + parseFloat(p.standardFinancingAdd||0)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "/mo"
      ) : null
    ),
    React.createElement("div", { style: { ...cardStyle, borderColor: "#fde68a", background: "#fffbeb" } },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: "#92400e", marginBottom: 4 } }, "Administrative Clearance Option"),
      React.createElement("div", { style: { fontSize: 11, color: "#a16207", marginBottom: 10, lineHeight: 1.5 } }, "Set the shopping period and the percentage we will beat any matching quote by."),
      React.createElement("div", { style: { display: "flex", gap: 10 } },
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("label", { style: labelStyle }, "Shopping Period (days)"),
          React.createElement("input", { style: inputStyle, type: "number", value: p.clearanceDays||"14", onChange: function(e){ set("clearanceDays", e.target.value); }, placeholder: "e.g. 14" })
        ),
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("label", { style: labelStyle }, "Beat competing quote by (%)"),
          React.createElement("input", { style: inputStyle, type: "number", value: p.clearanceBeatPct||"10", onChange: function(e){ set("clearanceBeatPct", e.target.value); }, placeholder: "e.g. 10" })
        )
      )
    ),
    React.createElement("div", { style: { ...cardStyle, borderColor: "#c7d2fe", background: "#eef2ff" } },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: "#3730a3", marginBottom: 4 } }, "Project Timeline"),
      React.createElement("div", { style: { fontSize: 11, color: "#4338ca", marginBottom: 10, lineHeight: 1.5 } }, "These dates will appear on the contract."),
      React.createElement("div", { style: { display: "flex", gap: 10 } },
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("label", { style: labelStyle }, "Days to begin project"),
          React.createElement("input", { style: inputStyle, type: "number", value: p.daysToBegin||"", onChange: function(e){ set("daysToBegin", e.target.value); }, placeholder: "e.g. 21" })
        ),
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("label", { style: labelStyle }, "Days to complete project"),
          React.createElement("input", { style: inputStyle, type: "number", value: p.daysToComplete||"", onChange: function(e){ set("daysToComplete", e.target.value); }, placeholder: "e.g. 14" })
        )
      )
    ),
    React.createElement("div", { style: { background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: 12, padding: 16, marginTop: 4 } },
      React.createElement("div", { style: { fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 } }, "Job Summary"),
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 } },
        React.createElement("span", { style: { fontSize: 13, color: "rgba(255,255,255,0.8)" } }, "Standard Pricing"),
        React.createElement("span", { style: { fontSize: 16, fontWeight: 800, color: "white" } }, fmt(grandStandardTotal))
      ),
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } },
        React.createElement("span", { style: { fontSize: 13, color: "#7dd3fc" } }, "Admin Savings Incentive"),
        React.createElement("span", { style: { fontSize: 16, fontWeight: 800, color: "#7dd3fc" } }, fmt(grandAdminTotal))
      ),
      p.monthlyPayment ? React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 6 } },
        React.createElement("span", { style: { fontSize: 12, color: "rgba(255,255,255,0.5)" } }, "Financing (Admin price)"),
        React.createElement("span", { style: { fontSize: 13, color: "rgba(255,255,255,0.7)" } }, fmt(parseFloat(p.monthlyPayment)) + "/mo")
      ) : null
    )
  );
}

function ServiceSelectStep({ selected, onChange, isFinancing, onFinancingChange }) {
  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  };
  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>What services does this job include?</h2>
      <p style={S.stepSub}>Select all that apply — only relevant sections will appear in the proposal.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {ALL_SERVICES.map((svc) => {
          const active = selected.includes(svc.id);
          return (
            <div key={svc.id} onClick={() => toggle(svc.id)} style={{ display: "flex", alignItems: "center", gap: 16, background: active ? "#f0f9ff" : "white", border: "2px solid " + (active ? "#0ea5e9" : "#e2e8f0"), borderRadius: 14, padding: "16px 20px", cursor: "pointer" }}>
              <div style={{ fontSize: 32 }}>{svc.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{svc.label}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{svc.sub}</div>
              </div>
              <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid " + (active ? "#0ea5e9" : "#cbd5e1"), background: active ? "#0ea5e9" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {active && <span style={{ color: "white", fontSize: 14, fontWeight: 800 }}>✓</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Financing toggle ── */}
      <div style={{ borderTop: "1.5px solid #e2e8f0", paddingTop: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>Payment Method</div>
        <div
          onClick={() => onFinancingChange(!isFinancing)}
          style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", border: "2px solid " + (isFinancing ? "#0ea5e9" : "#e2e8f0"), borderRadius: 14, background: isFinancing ? "#f0f9ff" : "white", cursor: "pointer", transition: "all 0.2s" }}
        >
          <div style={{ fontSize: 32 }}>💳</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Client is Financing</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Adds a Credit Application step at the end of this proposal</div>
          </div>
          <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid " + (isFinancing ? "#0ea5e9" : "#cbd5e1"), background: isFinancing ? "#0ea5e9" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {isFinancing && <span style={{ color: "white", fontSize: 14, fontWeight: 800 }}>✓</span>}
          </div>
        </div>
        {isFinancing && (
          <div style={{ marginTop: 10, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#0369a1", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>ℹ️</span>
            <span>A <strong>Credit Application</strong> step will appear after the contract. Client info stays separate from the proposal PDF.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerStep({ data, onChange }) {
  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Customer Info</h2>
      <p style={S.stepSub}>Who are you sending this proposal to?</p>
      <Field label="Customer Name" value={data.name} onChange={(v) => onChange("name", v)} placeholder="John Smith" />
      <Field label="Job Address" value={data.address} onChange={(v) => onChange("address", v)} placeholder="123 Main St, City, ST 12345" />
      <Field label="Customer Email" value={data.email} onChange={(v) => onChange("email", v)} placeholder="customer@email.com" type="email" />
      <Field label="Customer Phone" value={data.phone} onChange={(v) => onChange("phone", v)} placeholder="(555) 000-0000" />
      <div style={S.field}>
        <label style={S.label}>Property Street View Photo</label>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: data.photo ? "#f0f9ff" : "#f8fafc", border: "1.5px dashed " + (data.photo ? "#0ea5e9" : "#cbd5e1"), borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#475569" }}>
          <span style={{ fontSize: 22 }}>{data.photo ? "🖼️" : "📷"}</span>
          <span>{data.photo ? "Photo attached — tap to replace" : "Tap to take photo or upload street view"}</span>
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
            const file = e.target.files[0]; if (!file) return;
            compressImage(file, function(compressed) { onChange("photo", compressed); });
          }} />
        </label>
        {data.photo && (
          <div style={{ marginTop: 8, position: "relative", display: "inline-block" }}>
            <img src={data.photo} alt="Property" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, border: "1.5px solid #e2e8f0", display: "block" }} />
            <button onClick={() => onChange("photo", null)} style={{ position: "absolute", top: 6, right: 6, background: "#0f172a99", border: "none", borderRadius: "50%", color: "white", width: 26, height: 26, cursor: "pointer", fontSize: 13 }}>×</button>
          </div>
        )}
      </div>
    </div>
  );
}

function SidingStep({ data, onChange, onSidingTypeChange }) {
  const addWall = () => {
    const last = data.walls[data.walls.length - 1];
    onChange("walls", [...data.walls, { ...last, id: uid(), label: "Wall " + (data.walls.length + 1), photos: [] }]);
  };
  const removeWall = (id) => onChange("walls", data.walls.filter((w) => w.id !== id));
  const updateWall = (id, key, val) => onChange("walls", data.walls.map((w) => (w.id === id ? { ...w, [key]: val } : w)));

  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Siding Measurements</h2>
      <p style={S.stepSub}>Measure each wall and document materials. Pricing is entered separately.</p>
      {data.walls.map((wall) => (
        <div key={wall.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <input style={{ ...S.input, fontWeight: 700, width: 130, fontSize: 13 }} value={wall.label} onChange={(e) => updateWall(wall.id, "label", e.target.value)} />
            {data.walls.length > 1 && <button style={S.removeBtn} onClick={() => removeWall(wall.id)}>×</button>}
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>WALL LOCATION</label>
            <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={wall.location || ""} onChange={(e) => updateWall(wall.id, "location", e.target.value)}>
              <option value="">-- Select Location --</option>
              <option>Front</option><option>Rear</option><option>Left Side</option><option>Right Side</option><option>Garage</option><option>Gable End</option><option>Other</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Current Siding Type</label>
              <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={wall.currentSiding} onChange={(e) => updateWall(wall.id, "currentSiding", e.target.value)}>
                <option value="">-- Select --</option>
                <option>Vinyl Siding</option><option>Wood Siding</option><option>T1-11 / OSB Panel</option><option>Stucco</option><option>Brick / Masonry</option><option>Aluminum Siding</option><option>Fiber Cement (existing)</option><option>Cedar Shake</option><option>No Existing Siding</option><option>Other</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Removal Required?</label>
              <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={wall.removalRequired} onChange={(e) => updateWall(wall.id, "removalRequired", e.target.value)}>
                <option value="">-- Select --</option>
                <option>Yes - Full Removal</option><option>Yes - Partial Removal</option><option>No - Install Over Existing</option><option>TBD / Inspect First</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>New OSB Sheathing Required?</label>
            <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={wall.osbSheathing} onChange={(e) => updateWall(wall.id, "osbSheathing", e.target.value)}>
              <option value="">-- Select --</option>
              <option>No - Existing Sheathing is Adequate</option>
              <option>No - No Sheathing Being Installed</option>
              <option>Yes - Full Wall OSB Replacement</option>
              <option>Yes - Partial OSB Replacement</option>
              <option>TBD - Inspect After Removal</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>New Siding Product</label>
              <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={wall.hardieProduct} onChange={(e) => updateWall(wall.id, "hardieProduct", e.target.value)}>
                <option value="">-- Select Product --</option>
                <optgroup label="James Hardie">
                  <option value="lap">HardiePlank Lap</option>
                  <option value="panel">HardiePanel</option>
                  <option value="shake">HardieShingle Shake</option>
                </optgroup>
                <optgroup label="Other Products">
                  <option value="vinyl">Vinyl Siding</option>
                  <option value="lp">LP SmartSide</option>
                  <option value="wood">Wood / Cedar</option>
                  <option value="stucco">Stucco</option>
                  <option value="t111">T1-11</option>
                  <option value="other">Other</option>
                </optgroup>
              </select>
            </div>
          </div>
          {wall.hardieProduct === "lap" && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Lap Size</label>
                <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={wall.hardieSize} onChange={(e) => updateWall(wall.id, "hardieSize", e.target.value)}>
                  <option value="">-- Select Size --</option>
                  <option>5/16" x 6" - 5.25" Exposure</option><option>5/16" x 7-1/4" - 6" Exposure</option><option>5/16" x 8-1/4" - 7" Exposure</option><option>5/16" x 9-1/4" - 8" Exposure</option><option>5/16" x 12" - 11" Exposure</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Texture</label>
                <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={wall.hardieTexture} onChange={(e) => updateWall(wall.id, "hardieTexture", e.target.value)}>
                  <option value="">-- Select Texture --</option>
                  <option>Smooth</option><option>Sierra 8 (Cedar Grain)</option><option>Beaded Smooth</option><option>Beaded Cedar Mill</option>
                </select>
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Total Sq Ft</label>
              <input style={{ ...S.input, padding: "6px 8px", fontSize: 13, width: 120 }} type="number" value={wall.sqft} onChange={(e) => updateWall(wall.id, "sqft", e.target.value)} placeholder="0" />
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>WALL NOTES</label>
            <textarea style={{ ...S.input, height: 70, resize: "vertical", fontSize: 13 }} value={wall.notes || ""} onChange={(e) => updateWall(wall.id, "notes", e.target.value)} placeholder="e.g. rotted sheathing on left side, extra flashing needed at roofline..." />
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>WALL PHOTOS</label>
            {/* Photo grid */}
            {(wall.photos && wall.photos.length > 0) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                {wall.photos.map((photo, idx) => (
                  <div key={idx} style={{ position: "relative", width: "calc(50% - 4px)" }}>
                    <img src={photo} alt={wall.label + " " + (idx + 1)} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, border: "1.5px solid #e2e8f0", display: "block" }} />
                    <button onClick={() => updateWall(wall.id, "photos", wall.photos.filter((_, i) => i !== idx))} style={{ position: "absolute", top: 4, right: 4, background: "#0f172a99", border: "none", borderRadius: "50%", color: "white", width: 22, height: 22, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                  </div>
                ))}
              </div>
            )}
            {/* Add photo button */}
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: "#f8fafc", border: "1.5px dashed #cbd5e1", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#475569" }}>
              <span style={{ fontSize: 20 }}>📷</span>
              <span>{wall.photos && wall.photos.length > 0 ? "Add another photo (" + wall.photos.length + " added)" : "Tap to take photo or upload"}</span>
              <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => {
                const file = e.target.files[0]; if (!file) return;
                compressImage(file, function(compressed) {
                  updateWall(wall.id, "photos", [...(wall.photos || []), compressed]);
                });
                e.target.value = "";
              }} />
            </label>
          </div>
        </div>
      ))}
      <button style={S.addBtn} onClick={addWall}>+ Add Wall</button>
    </div>
  );
}

function SoffitStepSimple({ data, onChange, title = "Soffits" }) {
  const add = () => {
    const last = data.items[data.items.length - 1];
    onChange({ ...data, items: [...data.items, { ...last, id: uid(), label: "Area " + (data.items.length + 1), linearFt: "", notes: "" }] });
  };
  const remove = (id) => onChange({ ...data, items: data.items.filter((i) => i.id !== id) });
  const update = (id, key, val) => onChange({ ...data, items: data.items.map((i) => (i.id === id ? { ...i, [key]: val } : i)) });
  const currentMaterials = title === "Fascia" ? ["Wood Fascia", "Aluminum Fascia", "Vinyl Fascia", "Fiber Cement Fascia", "No Existing Material", "Other"] : ["Wood Soffit", "Aluminum Soffit", "Vinyl Soffit", "T1-11 / Plywood Soffit", "Fiber Cement Soffit", "No Existing Material", "Other"];
  const newMaterials = title === "Fascia" ? ["Aluminum Fascia", "HardieTrim Fascia", "PVC Fascia", "Wood (painted)", "Other"] : ["James Hardie Vented Soffit", "Aluminum Vented Soffit", "Vinyl Vented Soffit", "Aluminum Solid Soffit", "Vinyl Solid Soffit", "Other"];
  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>{title}</h2>
      <p style={S.stepSub}>{"Document each " + title.toLowerCase() + " run with materials and measurements."}</p>
      {data.items.map((item) => (
        <div key={item.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <input style={{ ...S.input, fontWeight: 700, width: 160, fontSize: 13 }} value={item.label} onChange={(e) => update(item.id, "label", e.target.value)} />
            {data.items.length > 1 && <button style={S.removeBtn} onClick={() => remove(item.id)}>×</button>}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Current Material</label>
              <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={item.currentMaterial} onChange={(e) => update(item.id, "currentMaterial", e.target.value)}>
                <option value="">-- Select --</option>{currentMaterials.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>New Material to Install</label>
              <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={item.newMaterial} onChange={(e) => update(item.id, "newMaterial", e.target.value)}>
                <option value="">-- Select --</option>{newMaterials.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Linear Ft</label>
              <input style={{ ...S.input, padding: "6px 8px", fontSize: 13, width: 120 }} type="number" value={item.linearFt} onChange={(e) => update(item.id, "linearFt", e.target.value)} placeholder="0" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOTES</label>
            <textarea style={{ ...S.input, height: 60, resize: "vertical", fontSize: 13 }} value={item.notes || ""} onChange={(e) => update(item.id, "notes", e.target.value)} placeholder="e.g. rotted fascia on north side..." />
          </div>
        </div>
      ))}
      <button style={S.addBtn} onClick={add}>{"+ Add " + title + " Area"}</button>
    </div>
  );
}

const PAINT_PRODUCTS = {
  "Sherwin Williams": ["SW Emerald Exterior (Highest Quality)", "SW Duration Exterior", "SW Resilience Exterior", "SW SuperPaint Exterior", "SW A-100 Exterior (Good Value)"],
  "Behr": ["Behr Dynasty Exterior (Highest Quality)", "Behr Marquee Exterior", "Behr Premium Plus Ultra Exterior", "Behr Premium Plus Exterior", "Behr Exterior (Good Value)"],
};

function PaintSection({ title, items, onChange }) {
  const add = () => { const last = items[items.length - 1]; onChange([...items, { ...last, id: uid(), colorName: "", sqft: "", pricePerSqFt: "" }]); };
  const remove = (id) => onChange(items.filter((a) => a.id !== id));
  const update = (id, key, val) => onChange(items.map((a) => (a.id === id ? { ...a, [key]: val } : a)));
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 10, paddingBottom: 6, borderBottom: "2px solid #e2e8f0" }}>{title}</div>
      {items.map((item) => (
        <div key={item.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>{title} Area</span>
            {items.length > 1 && <button style={S.removeBtn} onClick={() => remove(item.id)}>×</button>}
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>PAINT BRAND & PRODUCT</label>
            <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={item.paintProduct || ""} onChange={(e) => update(item.id, "paintProduct", e.target.value)}>
              <option value="">-- Select Brand &amp; Product --</option>
              {Object.entries(PAINT_PRODUCTS).map(([brand, products]) => (<optgroup key={brand} label={brand}>{products.map(p => <option key={p}>{p}</option>)}</optgroup>))}
            </select>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>COLOR NAME</label>
            <input style={{ ...S.input, fontSize: 13 }} value={item.colorName || ""} onChange={(e) => update(item.id, "colorName", e.target.value)} placeholder="e.g. Alabaster, Extra White..." />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOTES</label>
            <textarea style={{ ...S.input, height: 60, resize: "vertical", fontSize: 13 }} value={item.notes || ""} onChange={(e) => update(item.id, "notes", e.target.value)} placeholder="e.g. four-directional spray method required..." />
          </div>
        </div>
      ))}
      <button style={S.addBtn} onClick={add}>{"+ Add " + title + " Section"}</button>
    </div>
  );
}

function PaintStep({ data, onChange }) {
  const updateSection = (key, val) => onChange({ ...data, [key]: val });
  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Paint</h2>
      <p style={S.stepSub}>Select paint products and colors. Enter the total area — pricing is reviewed after all services.</p>
      <div style={{ ...S.card, marginBottom: 16, background: "white", border: "1.5px solid #e2e8f0" }}>
        <label style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Paint Scope</label>
        <select style={{ ...S.input, fontWeight: 700, fontSize: 14, background: "white" }} value={data.paintScope || ""} onChange={e => onChange({ ...data, paintScope: e.target.value })}>
          <option value="">-- Select Scope --</option>
          <option value="Whole House">Whole House</option>
          <option value="Partial — Front Only">Partial — Front Only</option>
          <option value="Partial — Rear Only">Partial — Rear Only</option>
          <option value="Partial — Selected Sides">Partial — Selected Sides</option>
          <option value="Trim Only">Trim Only</option>
          <option value="Accent Areas Only">Accent Areas Only</option>
        </select>
        {data.paintScope && data.paintScope.startsWith("Partial") && (
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Describe which areas/sides</label>
            <input style={{ ...S.input }} type="text" value={data.paintScopeDetail || ""} onChange={e => onChange({ ...data, paintScopeDetail: e.target.value })} placeholder="e.g. Front and left side only" />
          </div>
        )}
      </div>
      <div style={{ ...S.card, marginBottom: 20, background: "#f0f9ff", border: "1.5px solid #7dd3fc" }}>
        <label style={{ fontSize: 12, fontWeight: 800, color: "#0369a1", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Paint Area</label>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 120 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>TOTAL SQ FT (Walls &amp; Trim)</label>
            <input style={{ ...S.input, fontSize: 15, fontWeight: 700 }} type="number" value={data.combinedSqft || ""} onChange={(e) => onChange({ ...data, combinedSqft: e.target.value })} placeholder="e.g. 1200" />
          </div>
        </div>
      </div>
      <PaintSection title="Walls" items={data.walls} onChange={(v) => updateSection("walls", v)} />
      <PaintSection title="Trim" items={data.trim} onChange={(v) => updateSection("trim", v)} />
      <PaintSection title="Other" items={data.other} onChange={(v) => updateSection("other", v)} />
    </div>
  );
}

const WIN_OPTS = {
  manufacturers: ["PGT Innovations", "CGI Windows & Doors", "Impact Resistant Solutions (IRS)", "Andersen Windows", "Pella Windows", "Simonton Windows", "Alside Mezzo", "Jeld-Wen", "MI Windows", "Ply Gem / Atrium", "Thermoseal Windows", "Other"],
  frameTypes: ["Vinyl", "Aluminum", "Fiberglass", "Wood-Clad", "Composite"],
  frameColors: ["White", "Bronze", "Black", "Tan / Beige", "Gray", "Cream", "Custom Color"],
  styles: ["Single Hung", "Double Hung", "Sliding / Gliding", "Casement", "Awning", "Fixed / Picture", "Hopper", "Bay / Bow", "Garden"],
  glassTypes: ["Laminated (Impact)", "Tempered", "Laminated + Tempered", "Annealed (Standard)", "Obscure / Frosted"],
  glassPacks: ["Low-E 366 (Best Performance)", "Low-E 272", "Low-E 180", "Low-E 2 Coat", "Clear Insulated (IGU)", "Single Pane Clear"],
  grids: ["No Grids", "Colonial Grids", "Prairie Grids", "Diamond Grids", "Custom Grid Pattern"],
};

function WindowsStep({ windows, onChange }) {
  const add = () => { const last = windows[windows.length - 1]; onChange([...windows, { ...last, id: uid(), label: "Window " + (windows.length + 1), width: "", height: "", qty: "1", priceInstalled: "" }]); };
  const remove = (id) => onChange(windows.filter((w) => w.id !== id));
  const update = (id, key, val) => onChange(windows.map((w) => (w.id === id ? { ...w, [key]: val } : w)));
  const WinSelect = ({ label, field, win, options }) => (
    <div style={{ flex: 1, minWidth: 150, marginBottom: 10 }}>
      <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>{label}</label>
      <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={win[field] || ""} onChange={(e) => update(win.id, field, e.target.value)}>
        <option value="">-- Select --</option>{options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Windows</h2>
      <p style={S.stepSub}>Document each window. Pricing is reviewed after all services are complete.</p>
      {windows.map((win) => (
        <div key={win.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <input style={{ ...S.input, fontWeight: 700, width: 160, fontSize: 13 }} value={win.label} onChange={(e) => update(win.id, "label", e.target.value)} />
            {windows.length > 1 && <button style={S.removeBtn} onClick={() => remove(win.id)}>×</button>}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <WinSelect label="NEW MANUFACTURER" field="manufacturer" win={win} options={WIN_OPTS.manufacturers} />
          </div>
          {win.manufacturer === "Other" && (
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>MANUFACTURER NAME</label>
              <input style={{ ...S.input, fontSize: 13 }} value={win.manufacturerOther || ""} onChange={(e) => update(win.id, "manufacturerOther", e.target.value)} placeholder="Enter manufacturer name..." />
            </div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <WinSelect label="FRAME TYPE" field="frameType" win={win} options={WIN_OPTS.frameTypes} />
            <WinSelect label="FRAME COLOR" field="frameColor" win={win} options={WIN_OPTS.frameColors} />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <WinSelect label="WINDOW STYLE" field="style" win={win} options={WIN_OPTS.styles} />
            <WinSelect label="GLASS TYPE" field="glassType" win={win} options={WIN_OPTS.glassTypes} />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <WinSelect label="GLASS PACK" field="glassPack" win={win} options={WIN_OPTS.glassPacks} />
            <WinSelect label="GRIDS" field="grids" win={win} options={WIN_OPTS.grids} />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginTop: 4 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Width (in)</label>
              <input style={{ ...S.input, padding: "6px 8px", fontSize: 13, width: 100 }} type="number" value={win.width} onChange={(e) => update(win.id, "width", e.target.value)} placeholder="0" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Height (in)</label>
              <input style={{ ...S.input, padding: "6px 8px", fontSize: 13, width: 100 }} type="number" value={win.height} onChange={(e) => update(win.id, "height", e.target.value)} placeholder="0" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Qty</label>
              <input style={{ ...S.input, padding: "6px 8px", fontSize: 13, width: 80 }} type="number" value={win.qty} onChange={(e) => update(win.id, "qty", e.target.value)} placeholder="1" />
            </div>
          </div>
          <div style={{ marginTop: 10, marginBottom: 6 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOTES</label>
            <textarea style={{ ...S.input, height: 60, resize: "vertical", fontSize: 13 }} value={win.notes || ""} onChange={(e) => update(win.id, "notes", e.target.value)} placeholder="e.g. egress requirement, special trim..." />
          </div>
        </div>
      ))}
      <button style={S.addBtn} onClick={add}>+ Add Window</button>
    </div>
  );
}

function MiscStep({ data, onChange }) {
  const add = () => { const last = data.items[data.items.length - 1]; onChange({ ...data, items: [...data.items, { ...last, id: uid(), description: "", qty: "", unitPrice: "", notes: "" }] }); };
  const remove = (id) => onChange({ ...data, items: data.items.filter((i) => i.id !== id) });
  const update = (id, key, val) => onChange({ ...data, items: data.items.map((i) => (i.id === id ? { ...i, [key]: val } : i)) });
  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Miscellaneous Items</h2>
      <p style={S.stepSub}>Add any additional work items.</p>
      {data.items.map((item) => (
        <div key={item.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Item</span>
            {data.items.length > 1 && <button style={S.removeBtn} onClick={() => remove(item.id)}>×</button>}
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>DESCRIPTION</label>
            <input style={{ ...S.input, fontSize: 13 }} value={item.description} onChange={(e) => update(item.id, "description", e.target.value)} placeholder="e.g. Caulking, pressure washing, dumpster rental..." />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Qty</label>
              <input style={{ ...S.input, padding: "6px 8px", fontSize: 13, width: 100 }} type="number" value={item.qty} onChange={(e) => update(item.id, "qty", e.target.value)} placeholder="0" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOTES</label>
            <textarea style={{ ...S.input, height: 60, resize: "vertical", fontSize: 13 }} value={item.notes || ""} onChange={(e) => update(item.id, "notes", e.target.value)} placeholder="Additional details..." />
          </div>
        </div>
      ))}
      <button style={S.addBtn} onClick={add}>+ Add Item</button>
    </div>
  );
}

function FinancingStep({ data, onChange, state }) {
  const t = calcGrandTotal(state);
  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Financing Option</h2>
      <p style={S.stepSub}>Enter the monthly payment amount to display on the proposal.</p>
      <div style={{ ...S.summaryBox, flexDirection: "column", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "#0369a1", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Job Cost</div>
        {state.services.includes("siding")  && <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: 12, color: "#334155", padding: "2px 0" }}><span>Siding</span><span>{fmt(t.sid)}</span></div>}
        {state.services.includes("soffit")  && <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: 12, color: "#334155", padding: "2px 0" }}><span>Soffits</span><span>{fmt(t.sof)}</span></div>}
        {state.services.includes("fascia")  && <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: 12, color: "#334155", padding: "2px 0" }}><span>Fascia</span><span>{fmt(t.fas)}</span></div>}
        {state.services.includes("paint")   && <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: 12, color: "#334155", padding: "2px 0" }}><span>Paint</span><span>{fmt(t.pnt)}</span></div>}
        {state.services.includes("windows") && <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: 12, color: "#334155", padding: "2px 0" }}><span>Windows</span><span>{fmt(t.win)}</span></div>}
        {state.services.includes("misc")    && <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: 12, color: "#334155", padding: "2px 0" }}><span>Miscellaneous</span><span>{fmt(t.msc)}</span></div>}
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: 15, fontWeight: 800, color: "#0f172a", marginTop: 8, paddingTop: 8, borderTop: "1.5px solid #bae6fd" }}>
          <span>Total</span><span style={{ color: "#0ea5e9" }}>{fmt(t.total)}</span>
        </div>
      </div>
      <div style={S.card}>
        <label style={{ ...S.label, marginBottom: 8 }}>Monthly Payment Amount ($)</label>
        <input style={{ ...S.input, fontSize: 22, fontWeight: 700, color: "#0ea5e9" }} type="number" value={data.monthlyPayment} onChange={(e) => onChange({ ...data, monthlyPayment: e.target.value })} placeholder="e.g. 485.00" />
        {data.monthlyPayment && (
          <div style={{ marginTop: 12, background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ fontSize: 11, color: "#0369a1", fontWeight: 700, marginBottom: 4 }}>Will display on proposal as:</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{"$" + parseFloat(data.monthlyPayment).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "/month"}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// buildProposalHTML — unchanged from original (full implementation preserved)
// ─────────────────────────────────────────────────────────────────────────────
function buildProposalHTML(state, selectedOption, mode, extras) {
  extras = extras || {};
  const usingFinancing   = extras.usingFinancing   || false;
  const financingPct     = extras.financingPct     || 100;
  const depositOption    = extras.depositOption    || null;
  const customDepositText = extras.customDepositText || "";
  const safe = {
    ...state,
    services: state.services || [],
    siding:   { walls: [], sidingType: "", ...(state.siding || {}) },
    soffit:   { items: [], ...(state.soffit || {}) },
    fascia:   { items: [], ...(state.fascia || {}) },
    paint:    { walls: [], trim: [], other: [], combinedSqft: "", ...(state.paint || {}) },
    windows:  state.windows || [],
    misc:     { items: [], ...(state.misc || {}) },
    pricing:  { adminSavingsDiscount: "8.35", monthlyPayment: "", clearanceDays: "14", clearanceBeatPct: "10", standardFinancingAdd: "", daysToBegin: "", daysToComplete: "", sidingStandardMarkupPct: "", soffitStandardMarkupPct: "", fasciaStandardMarkupPct: "", paintStandardMarkupPct: "", windowStandardMarkupPct: "", ...(state.pricing || {}) },
    financing: { monthlyPayment: "", ...(state.financing || {}) },
    customer:  { name: "", address: "", phone: "", email: "", photo: "", ...(state.customer || {}) },
    company:   { name: "", address: "", phone: "", license: "", ...(state.company || {}) },
    notes:     state.notes || "",
  };
  state = safe;
  const t = calcGrandTotal(state);
  const priority = t.total;
  const standard = t.standardTotal || t.total;
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const monthlyPayment = state.financing && state.financing.monthlyPayment ? parseFloat(state.financing.monthlyPayment) : null;
  const standardFinancingAdd = (state.pricing && state.pricing.standardFinancingAdd) ? parseFloat(state.pricing.standardFinancingAdd) : null;
  const standardMonthly = monthlyPayment ? (standardFinancingAdd ? monthlyPayment + standardFinancingAdd : monthlyPayment) : null;
  const clearanceDays = (state.pricing && state.pricing.clearanceDays) ? state.pricing.clearanceDays : "14";

  const css = `body{font-family:Georgia,serif;padding:28px;max-width:820px;margin:0 auto;color:#0f172a;font-size:12px}.hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:18px;border-bottom:2.5px solid #0f172a;margin-bottom:22px}.sec{margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid #e2e8f0}.lbl{font-size:9.5px;font-weight:800;color:#0ea5e9;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:10px}.check{color:#22c55e;font-weight:800;margin-right:6px}.row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:11px}.opt{border:2px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:12px;cursor:pointer}.opt.sel{border-color:#0ea5e9;background:#f0f9ff}.radio{width:18px;height:18px;border-radius:50%;border:2px solid #cbd5e1;background:white;display:inline-flex;align-items:center;justify-content:center;margin-right:10px;vertical-align:middle;flex-shrink:0}.radio.on{border-color:#0ea5e9;background:#0ea5e9}.dot{width:7px;height:7px;border-radius:50%;background:white}.badge{background:#dcfce7;color:#166534;border-radius:20px;padding:3px 12px;display:inline-block;font-size:10px;font-weight:800;margin-top:6px}table{width:100%;border-collapse:collapse;font-size:10.5px;margin-bottom:8px}th{background:#0f172a;color:white;padding:7px 10px;text-align:left;font-size:9.5px;font-weight:700;letter-spacing:0.5px}td{padding:6px 10px;border-bottom:1px solid #f1f5f9;color:#334155}tr:nth-child(even) td{background:#f8fafc}.note{font-size:9px;color:#94a3b8;margin-top:8px;font-style:italic}@media print{body{padding:12px}}`;

  const sidingWallsForScope = state.siding.walls || [];
  const anyFullRemoval    = sidingWallsForScope.some(w => w.removalRequired && w.removalRequired.includes("Full Removal"));
  const anyPartialRemoval = sidingWallsForScope.some(w => w.removalRequired && w.removalRequired.includes("Partial Removal"));
  const anyInstallOver    = sidingWallsForScope.some(w => w.removalRequired && w.removalRequired.includes("Install Over"));
  const anyOSBFull        = sidingWallsForScope.some(w => w.osbSheathing && w.osbSheathing.includes("Full Wall"));
  const anyOSBPartial     = sidingWallsForScope.some(w => w.osbSheathing && w.osbSheathing.includes("Partial"));
  const anyOSBTBD         = sidingWallsForScope.some(w => w.osbSheathing && w.osbSheathing.includes("TBD"));
  const anyOSBNone        = sidingWallsForScope.some(w => w.osbSheathing && w.osbSheathing.includes("No Sheathing"));
  const removalWalls      = sidingWallsForScope.filter(w => w.removalRequired && w.removalRequired.includes("Removal")).map(w => w.location || w.label).join(", ");
  const osbWallsList      = sidingWallsForScope.filter(w => w.osbSheathing && (w.osbSheathing.includes("Full") || w.osbSheathing.includes("Partial"))).map(w => w.location || w.label).join(", ");

  // Determine products used across all walls
  const prodNameMap = { lap: "HardiePlank Lap", panel: "HardiePanel", shake: "HardieShingle Shake", vinyl: "Vinyl Siding", lp: "LP SmartSide", wood: "Wood / Cedar", stucco: "Stucco", t111: "T1-11", other: "Other" };
  const usedProducts = [...new Set(sidingWallsForScope.map(w => w.hardieProduct).filter(Boolean))];
  const isHardieOnly = usedProducts.every(p => ["lap","panel","shake"].includes(p));
  const hasHardie    = usedProducts.some(p => ["lap","panel","shake"].includes(p));
  const productNames = usedProducts.map(p => prodNameMap[p] || p).join(", ") || "Siding";
  const sidingLabel  = isHardieOnly ? "James Hardie " + productNames : productNames;

  const removalBullet = anyFullRemoval
    ? "Remove and dispose of all existing exterior siding" + (removalWalls ? " (" + removalWalls + ")" : "")
    : anyPartialRemoval
    ? "Partial removal of existing exterior siding" + (removalWalls ? " (" + removalWalls + ")" : "")
    : anyInstallOver
    ? "Install over existing siding — no removal required"
    : null;

  const osbBullet = anyOSBFull
    ? "Install new 7/16\" OSB wall sheathing — full replacement" + (osbWallsList ? " (" + osbWallsList + ")" : "")
    : anyOSBPartial
    ? "Install new 7/16\" OSB wall sheathing — partial replacement" + (osbWallsList ? " (" + osbWallsList + ")" : "")
    : anyOSBTBD
    ? "OSB sheathing replacement to be determined after removal and inspection"
    : anyOSBNone
    ? "No new sheathing being installed — siding applied directly over existing substrate"
    : null;

  const scopeMap = {
    siding: { label: sidingLabel + " — Siding Installation", bullets: [
      removalBullet,
      "Inspect and prepare substrate — repair damaged areas as needed",
      osbBullet,
      "Install continuous weather-resistive barrier (WRB) and tape all seams",
      "Install metal flashing at all windows, doors, and roof lines",
      ...usedProducts.map(p => "Install " + (prodNameMap[p] || p) + " per manufacturer specifications"),
      hasHardie ? "Install HardieTrim at all corners, windows, doors, and eaves" : "Install trim at all corners, windows, doors, and eaves",
      hasHardie ? "Final inspection per James Hardie installation requirements" : "Final inspection per manufacturer installation requirements",
    ].filter(Boolean), detail: [...state.siding.walls.map(w => {
      const prodName = prodNameMap[w.hardieProduct] || "Siding";
      return (w.location || w.label) + ": " + prodName + (w.sqft ? " — " + w.sqft + " sq ft" : "") + (w.notes ? " (" + w.notes + ")" : "");
    }), "Total: " + state.siding.walls.reduce((a, w) => a + parseFloat(w.sqft || 0), 0).toFixed(0) + " sq ft"] },
    soffit: { label: "Soffit Installation", bullets: ["Remove deteriorated soffit panels", "Install new vented soffit panels", "Install J-channel and F-channel", "Final inspection"], detail: state.soffit.items.map(i => (i.label || "Area") + ": " + (i.newMaterial || "Material TBD") + (i.linearFt ? " — " + i.linearFt + " linear ft" : "") + (i.notes ? " — " + i.notes : "")) },
    fascia: { label: "Fascia Installation", bullets: ["Remove deteriorated fascia boards", "Install new fascia material", "Caulk all joints and end caps"], detail: state.fascia.items.map(i => (i.label || "Area") + ": " + (i.newMaterial || "Material TBD") + (i.linearFt ? " — " + i.linearFt + " linear ft" : "") + (i.notes ? " — " + i.notes : "")) },
    paint: { label: "Exterior Paint" + (state.paint.paintScope ? " — " + state.paint.paintScope : ""), bullets: ["Pressure wash all exterior surfaces", "Fill all cracks and gaps with elastomeric caulk", "Apply paint using four-directional spray method", "Hand-paint all trim and detail areas", "Final walk-through to confirm coverage"].filter(Boolean), detail: [
      ...state.paint.walls.filter(a => a.paintProduct || a.colorName || a.notes).map(a => "Walls: " + [a.paintProduct, a.colorName, a.notes].filter(Boolean).join(" — ")),
      ...state.paint.trim.filter(a => a.paintProduct || a.colorName || a.notes).map(a => "Trim: " + [a.paintProduct, a.colorName, a.notes].filter(Boolean).join(" — ")),
      ...(state.paint.other || []).filter(a => a.paintProduct || a.colorName || a.notes).map(a => "Other: " + [a.paintProduct, a.colorName, a.notes].filter(Boolean).join(" — ")),
    ] },
    windows: { label: "Window Installation", bullets: ["Verify rough opening dimensions", "Remove existing windows", "Install new unit plumb, level, and square", "Air seal gaps with low-expansion foam", "Install exterior casing, caulk all seams", "Final inspection"], detail: state.windows.map(w => (w.label || "Window") + ": " + (w.manufacturer === "Other" ? w.manufacturerOther || "Other" : w.manufacturer || "") + (w.style ? " " + w.style : "") + " — qty " + (w.qty || 1) + (w.notes ? " — " + w.notes : "")) },
    misc: { label: "Additional Items", bullets: state.misc.items.filter(i => i.description).map(i => i.description + (i.notes ? " — " + i.notes : "")), detail: [] },
  };

  let body = `<div class='hdr'><div><div style='font-size:20px;font-weight:800;line-height:1.2'>${state.company.name}</div><div style='color:#64748b;font-size:11px;margin-top:4px'>${state.company.address}</div><div style='color:#64748b;font-size:11px'>${state.company.phone} · Lic# ${state.company.license}</div></div><div style='text-align:right'><div style='font-size:9.5px;font-weight:800;color:#0ea5e9;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px'>Prepared For</div><div style='font-size:18px;font-weight:800'>${state.customer.name || "—"}</div><div style='color:#64748b;font-size:11px;margin-top:4px'>${state.customer.address || ""}</div><div style='color:#64748b;font-size:11px'>${state.customer.phone || ""}</div><div style='color:#94a3b8;font-size:10px;margin-top:6px'>${today}</div></div></div>`;

  if (state.customer.photo) {
    body += `<div class='sec'><div class='lbl'>Property</div><img src='${state.customer.photo}' style='max-width:100%;max-height:220px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0'/></div>`;
  }

  const SERVICE_ORDER = ["siding", "soffit", "fascia", "paint", "windows", "misc"];
  const orderedServices = SERVICE_ORDER.filter(svc => state.services.includes(svc));

  body += `<div class='sec'><div class='lbl'>Project Overview</div>`;
  orderedServices.forEach(svc => {
    if (!scopeMap[svc]) return;
    body += `<div style='display:flex;align-items:center;padding:4px 0;border-bottom:1px solid #f8fafc;font-size:11px;color:#334155'><span class='check'>✓</span><span style='font-weight:700'>${scopeMap[svc].label}</span></div>`;
  });
  body += `</div>`;

  orderedServices.forEach(svc => {
    if (!scopeMap[svc]) return;
    const info = scopeMap[svc];
    body += `<div class='sec'><div class='lbl'>${info.label} — Scope of Work</div><div style='border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:12px'>`;
    info.bullets.forEach((b, i) => { body += `<div style='padding:7px 12px;font-size:11px;color:#334155;line-height:1.6;background:${i % 2 === 0 ? "white" : "#f8fafc"};border-bottom:1px solid #f1f5f9'>${b}</div>`; });
    body += `</div>`;
    if (info.detail && info.detail.length > 0) {
      body += `<div style='font-size:9.5px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px'>Details</div>`;
      info.detail.forEach(d => { const isTotal = d.startsWith("Total:"); body += isTotal ? `<div style='font-size:11px;color:#0f172a;font-weight:800;line-height:1.8;padding:5px 0;border-top:1.5px solid #e2e8f0;margin-top:2px'>${d}</div>` : `<div style='font-size:10.5px;color:#334155;line-height:1.8;padding:3px 0;border-bottom:1px solid #f8fafc'>&bull; ${d}</div>`; });
    }

    // Wall photos — siding only
    if (svc === "siding" && mode === "pdf") {
      const wallsWithPhotos = state.siding.walls.filter(w => (w.photos && w.photos.length > 0) || w.photo);
      if (wallsWithPhotos.length > 0) {
        body += `<div style='font-size:9.5px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.8px;margin:12px 0 8px'>Wall Photos</div>`;
        body += `<div style='display:flex;flex-wrap:wrap;gap:8px'>`;
        wallsWithPhotos.forEach(w => {
          const photos = w.photos && w.photos.length > 0 ? w.photos : (w.photo ? [w.photo] : []);
          photos.forEach((photo, idx) => {
            body += `<div style='flex:0 0 calc(50% - 4px)'><div style='font-size:9px;color:#64748b;margin-bottom:3px'>${w.location || w.label}${photos.length > 1 ? " (" + (idx + 1) + ")" : ""}</div><img src='${photo}' style='width:100%;height:140px;object-fit:cover;border-radius:6px;border:1px solid #e2e8f0'/></div>`;
          });
        });
        body += `</div>`;
      }
    }

    // ── Materials list — pdf only ──
    if (mode === "pdf") {
      const totalSqFt   = state.siding.walls.reduce((a, w) => a + parseFloat(w.sqft || 0), 0);
      const totalSoffitLf = state.soffit.items.reduce((a, i) => a + parseFloat(i.linearFt || 0), 0);
      const totalPaintSqFt = parseFloat(state.paint.combinedSqft || 0);
      const totalWinQty = state.windows.reduce((a, w) => a + parseFloat(w.qty || 0), 0);
      const prod = state.siding.walls[0] && state.siding.walls[0].hardieProduct;
      const panelName = prod === "panel" ? "HardiePanel" : prod === "shake" ? "HardieShingle Shake" : "HardiePlank Lap";
      const osbWalls = state.siding.walls.filter(w => w.osbSheathing && w.osbSheathing.includes("Yes"));
      const osbSqft = osbWalls.reduce((a, w) => a + parseFloat(w.sqft || 0), 0);

      let mats = [];
      if (svc === "siding" && totalSqFt > 0) {
        const sqftWaste = Math.ceil(totalSqFt * 1.10);
        mats = [
          [panelName + " panels",                    sqftWaste + " sq ft",                      "Total " + totalSqFt.toFixed(0) + " sq ft + 10% waste"],
          ["House Wrap / WRB",                       Math.ceil(totalSqFt * 1.15) + " sq ft",    "Full wall coverage + 15% seam overlap"],
          ["WRB Seam Tape",                          Math.ceil(totalSqFt / 1000) + " roll(s)",   "All seams and penetrations"],
          ["HardieTrim — Corners",                   "Measure on site",                          "All exterior corners"],
          ["HardieTrim — Windows & Doors",           "Measure on site",                          "All opening surrounds"],
          ["HardieTrim — Eave Termination",          "Measure on site",                          "Eave line"],
          ["Metal Drip Cap / Head Flashing",         "Measure on site",                          "Above all windows and doors"],
          ["Step Flashing",                          "Measure on site",                          "All roof-wall intersections"],
          ["Metal Starter Strip",                    "Measure on site",                          "Base of each wall"],
          ["Hot-Dipped Galvanized Nails 6d/8d",      Math.ceil(totalSqFt / 100) + " lb(s)",      "Corrosion-resistant — per Hardie fastener spec"],
          ["Paintable Elastomeric Caulk",            Math.ceil(totalSqFt / 150) + " tube(s)",    "All trim joints, penetrations, transitions"],
          ["Exterior Primer",                        Math.ceil(totalSqFt / 350) + " gal",        "Applied to all cut ends and bare surfaces"],
          ["Exterior Paint",                         Math.ceil(totalSqFt / 350) * 2 + " gal",   "Four-directional spray method"],
        ];
        if (osbWalls.length > 0) {
          mats.push(["OSB Sheathing 7/16\"", Math.ceil((osbSqft * 1.05) / 32) + " sheet(s)", osbSqft.toFixed(0) + " sq ft replacement area"]);
          mats.push(["Sheathing Fasteners", "1 box", "Code-compliant per replaced sheathing area"]);
        }
      }
      if (svc === "soffit" && totalSoffitLf > 0) {
        mats = [
          ["Vented Soffit Panels",             Math.ceil(totalSoffitLf * 1.5) + " sq ft",   "Based on " + totalSoffitLf.toFixed(0) + " lf + 10% waste"],
          ["J-Channel (wall side)",            totalSoffitLf.toFixed(0) + " lf",             "Along all wall edges"],
          ["F-Channel (fascia side)",          totalSoffitLf.toFixed(0) + " lf",             "Along all fascia edges"],
          ["Aluminum / Vinyl Fascia Wrap",     "Measure on site",                            "Over existing or new fascia boards"],
          ["Galvanized Roofing Nails/Screws",  Math.ceil(totalSoffitLf / 50) + " box(es)",   "Per panel per manufacturer spacing"],
          ["Drip Edge",                        totalSoffitLf.toFixed(0) + " lf",             "Roof-to-fascia junction"],
        ];
      }
      if (svc === "fascia") {
        const totalFasciaLf = state.fascia.items.reduce((a, i) => a + parseFloat(i.linearFt || 0), 0);
        if (totalFasciaLf > 0) {
          mats = [
            ["Fascia Material",               totalFasciaLf.toFixed(0) + " lf",              "Per fascia schedule"],
            ["Drip Edge",                     totalFasciaLf.toFixed(0) + " lf",              "Roof-to-fascia junction"],
            ["Galvanized Nails / Screws",     Math.ceil(totalFasciaLf / 50) + " box(es)",    "Per manufacturer spacing"],
            ["Elastomeric Caulk",             Math.ceil(totalFasciaLf / 200) + " tube(s)",   "All joints and end caps"],
          ];
        }
      }
      if (svc === "paint" && totalPaintSqFt > 0) {
        const gal = Math.ceil(totalPaintSqFt / 350) || 1;
        mats = [
          ["Exterior Elastomeric Caulk",   Math.ceil(totalPaintSqFt / 200) + " tube(s)",  "All cracks, gaps, seams prior to painting"],
          ["Exterior Patching Compound",   "As needed",                                    "Holes and surface repairs"],
          ["Masking Tape & Plastic",       "As needed",                                    "Windows, doors, fixtures, landscaping"],
          ["Exterior Surface Sealer",      "As needed",                                    "Bare wood and repaired areas"],
          ["Exterior Paint",               gal * 2 + " gal",                               "Four-directional spray method"],
          ["Trim Paint",                   "As needed",                                    "Hand-applied to all trim and detail areas"],
        ];
      }
      if (svc === "windows" && totalWinQty > 0) {
        mats = [
          ["Window Units",                    totalWinQty + " unit(s)",                     "Per window schedule"],
          ["Sill Pan Flashing",               totalWinQty + " unit(s)",                     "One per rough opening"],
          ["Flashing Tape (self-adhering)",   "As needed",                                  "Head, jamb, and sill integration"],
          ["Low-Expansion Foam",              Math.ceil(totalWinQty * 0.5) + " can(s)",     "ONLY low-expansion foam per manufacturer specs"],
          ["Composite Shims",                 totalWinQty + " pack(s)",                     "Sill, jamb, and head — plumb, level, square"],
          ["Corrosion-Resistant Nails/Screws","1 box",                                      "Nailing fin attachment per manufacturer"],
          ["Exterior-Grade Elastomeric Caulk",Math.ceil(totalWinQty * 0.5) + " tube(s)",   "Perimeter seal at all unit flanges"],
          ["Backer Rod",                      Math.ceil(totalWinQty * 12) + " lf",          "Behind exterior sealant bead"],
          ["Interior Casing / Trim",          "Measure on site",                            "All openings — match existing profile"],
        ];
      }

      if (mats.length > 0) {
        body += `<div style='font-size:9.5px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.8px;margin:14px 0 6px'>Materials List</div>`;
        body += `<table><thead><tr><th>Material</th><th>Quantity</th><th>Specification</th></tr></thead><tbody>`;
        mats.forEach(m => { body += `<tr><td style='font-weight:600'>${m[0]}</td><td style='color:#0369a1;font-weight:700;white-space:nowrap'>${m[1]}</td><td style='color:#64748b'>${m[2]}</td></tr>`; });
        body += `</tbody></table>`;
        if (svc === "siding") body += `<p class='note'>* All James Hardie products installed per HardieZone requirements. Quantities include standard waste factors and are subject to field verification.</p>`;
        if (svc === "windows") body += `<p class='note'>* Low-expansion foam ONLY. High-pressure or latex foam is NOT permitted per manufacturer installation requirements.</p>`;
      }
    }

    body += `</div>`;
  });

  if (mode === "scope") {
    body += `<div style='text-align:center;padding:32px 24px 40px'><div style='font-size:13px;color:#64748b;margin-bottom:20px;line-height:1.6'>We've reviewed everything that goes into this project together.<br>Ready to go over the investment?</div><button onclick="window.parent.postMessage({type:'revealPricing'},'*')" style='background:linear-gradient(135deg,#0ea5e9,#0369a1);color:white;border:none;border-radius:14px;padding:18px 48px;font-size:17px;font-weight:800;cursor:pointer;box-shadow:0 8px 28px rgba(14,165,233,0.35);letter-spacing:-0.3px;width:100%;max-width:400px'>Yes, Let\'s Review the Pricing</button><div style='font-size:11px;color:#94a3b8;margin-top:14px'>Pricing is based on the full scope of work we just reviewed</div></div>`;
  } else {
    body += `<div class='sec'><div class='lbl'>Investment Options</div>`;
    if (mode === "preview") {
      const tLocal = calcGrandTotal(state);
      body += `<div class='opt ${selectedOption === "standard" ? "sel" : ""}' onclick="window.parent.postMessage({type:'selectOption',option:'standard'},'*')"><div style='display:flex;justify-content:space-between;align-items:center'><div style='display:flex;align-items:center'><div class='radio ${selectedOption === "standard" ? "on" : ""}'>${selectedOption === "standard" ? "<div class='dot'></div>" : ""}</div><div style='font-weight:800;font-size:13px'>Standard Pricing</div></div><div style='text-align:right'><div style='font-size:24px;font-weight:800;color:#334155'>${fmt(standard)}</div>${standardMonthly ? "<div style='font-size:18px;font-weight:800;color:#0f172a;margin-top:4px'>$" + standardMonthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "<span style='font-size:13px;color:#64748b;font-weight:600'>/mo*</span></div><div style='font-size:9px;color:#94a3b8;font-style:italic'>* Approx. — based on credit &amp; DTI</div>" : ""}</div></div></div>`;
      body += `<div class='opt ${selectedOption === "priority" ? "sel" : ""}' onclick="window.parent.postMessage({type:'selectOption',option:'priority'},'*')"><div style='display:flex;justify-content:space-between;align-items:center'><div style='display:flex;align-items:center'><div class='radio ${selectedOption === "priority" ? "on" : ""}'>${selectedOption === "priority" ? "<div class='dot'></div>" : ""}</div><div style='font-weight:800;font-size:13px;color:#0369a1'>Administrative Savings Incentive</div></div>${selectedOption === "priority" ? "<div style='text-align:right'><div style='font-size:24px;font-weight:800;color:#0ea5e9'>" + fmt(priority) + "</div>" + (monthlyPayment ? "<div style='font-size:18px;font-weight:800;color:#0f172a;margin-top:4px'>$" + monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "<span style='font-size:13px;color:#64748b;font-weight:600'>/mo*</span></div><div style='font-size:9px;color:#94a3b8;font-style:italic'>* Approx. — based on credit &amp; DTI</div>" : "") + "</div>" : ""}</div>${selectedOption === "priority" ? "<div style='font-size:20px;font-weight:800;color:#166534;margin-top:8px'>You save " + fmt(standard - priority) + "</div>" : ""}</div>`;
      body += `<div class='opt ${selectedOption === "clearance" ? "sel" : ""}' onclick="window.parent.postMessage({type:'selectOption',option:'clearance'},'*')" style='border-color:${selectedOption === "clearance" ? "#f59e0b" : "#e2e8f0"};background:${selectedOption === "clearance" ? "#fffbeb" : "white"}'><div style='display:flex;justify-content:space-between;align-items:center'><div style='display:flex;align-items:center'><div class='radio' style='border-color:${selectedOption === "clearance" ? "#f59e0b" : "#cbd5e1"};background:${selectedOption === "clearance" ? "#f59e0b" : "white"}'>${selectedOption === "clearance" ? "<div class='dot'></div>" : ""}</div><div style='font-weight:800;font-size:13px;color:#92400e'>Administrative Clearance</div></div></div></div>`;
    } else {
      if (selectedOption === "priority") {
        body += `<div class='row' style='font-size:13px'><span style='font-weight:700;color:#0369a1'>Administrative Savings Incentive</span><span style='font-weight:800;color:#0ea5e9'>${fmt(priority)}</span></div><div style='background:#dcfce7;color:#166534;border-radius:8px;padding:8px 14px;margin-top:6px;font-size:11px;font-weight:700'>You save ${fmt(standard - priority)}</div>`;
        if (monthlyPayment && !depositOption) { body += `<div style='margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0'><div style='font-size:10px;font-weight:800;color:#0369a1;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px'>Financing</div><div style='font-size:22px;font-weight:800;color:#0f172a'>$${monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span style='font-size:13px;color:#64748b;font-weight:600'>/mo*</span></div><div style='font-size:9.5px;color:#94a3b8;margin-top:4px;font-style:italic'>* Approximate payment. Actual rate based on credit score &amp; debt-to-income ratio.</div></div>`; }
      } else if (selectedOption === "clearance") {
        body += `<div class='row' style='font-size:13px'><span style='font-weight:700;color:#92400e'>Administrative Clearance</span><span style='font-weight:800;color:#f59e0b'>${fmt(priority)}</span></div>`;
      } else {
        body += `<div class='row' style='font-size:12px'><span>Standard Pricing</span><span style='font-weight:800'>${fmt(standard)}</span></div>`;
        if (standardMonthly && !depositOption) { body += `<div style='margin-top:8px;padding-top:8px;border-top:1px solid #e2e8f0'><div style='font-size:10px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px'>Financing</div><div style='font-size:22px;font-weight:800;color:#0f172a'>$${standardMonthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span style='font-size:13px;color:#64748b;font-weight:600'>/mo*</span></div><div style='font-size:9.5px;color:#94a3b8;margin-top:4px;font-style:italic'>* Approximate payment. Actual rate based on credit score &amp; debt-to-income ratio.</div></div>`; }
      }
    }
    body += `</div>`;
  }

  if (mode === "pdf") {
    const chosenTotal = selectedOption === "standard" ? standard : priority;
    const finAmt   = chosenTotal * financingPct / 100;
    const oopAmt   = chosenTotal * (100 - financingPct) / 100;
    const monthlyPaymentNum = (state.financing && state.financing.monthlyPayment) ? parseFloat(state.financing.monthlyPayment) : null;
    const stdFinAdd = (state.pricing && state.pricing.standardFinancingAdd) ? parseFloat(state.pricing.standardFinancingAdd) : 0;
    const applicableMonthlyNum = selectedOption === "standard"
      ? (monthlyPaymentNum ? monthlyPaymentNum + stdFinAdd : null)
      : monthlyPaymentNum;

    // Payment & Financing Terms — always show
    body += `<div class='sec'><div class='lbl'>Payment &amp; Financing Terms</div>`;
    body += `<div style='background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:8px;padding:14px 16px;font-size:11px;color:#0f172a;line-height:1.9'>`;

    // Agreed total line
    body += `<div style='display:flex;justify-content:space-between;padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid #e2e8f0'>`;
    body += `<span style='font-weight:700'>Total Contract Price</span>`;
    body += `<span style='font-weight:800;font-size:13px'>${fmt(chosenTotal)}</span>`;
    body += `</div>`;

    if (usingFinancing) {
      // Financing statement
      body += `<div style='background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:8px;padding:12px 14px;margin-bottom:10px'>`;
      body += `<div style='font-size:9.5px;font-weight:800;color:#0369a1;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px'>Aqua Financing Agreement</div>`;
      body += `<p style='margin:0 0 8px'>The client agrees to finance <strong>${financingPct}%</strong> of the total contract price through <strong>Aqua Financing</strong>, in the amount of <strong>${fmt(finAmt)}</strong>.</p>`;
      if (financingPct < 100) {
        body += `<p style='margin:0 0 8px'>The remaining balance of <strong>${fmt(oopAmt)}</strong> (${100 - financingPct}% of the total) is due out of pocket and shall be paid directly to New Direction Construction upon completion of the work.</p>`;
      }
      if (applicableMonthlyNum) {
        body += `<p style='margin:0 0 8px'>The estimated monthly payment through Aqua Financing is approximately <strong>$${applicableMonthlyNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month</strong>. This is an estimate only — the actual monthly payment will be determined based on the client's credit score, debt-to-income ratio, and the final terms approved by Aqua Financing.</p>`;
      }
      body += `<p style='margin:0'>The client acknowledges that financing is subject to credit approval. New Direction Construction shall have no liability in the event financing is not approved. In such event, the client remains responsible for the full contract amount by alternative means.</p>`;
      body += `</div>`;

      // Summary table
      body += `<div style='display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:11px'><span style='color:#475569'>Financed through Aqua (${financingPct}%)</span><span style='font-weight:700;color:#0369a1'>${fmt(finAmt)}</span></div>`;
      if (financingPct < 100) {
        body += `<div style='display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:11px'><span style='color:#475569'>Due out of pocket (${100 - financingPct}%)</span><span style='font-weight:700'>${fmt(oopAmt)}</span></div>`;
      }

    } else if (depositOption) {
      // Deposit statement
      body += `<div style='background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:8px;padding:12px 14px;margin-bottom:10px'>`;
      body += `<div style='font-size:9.5px;font-weight:800;color:#0369a1;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px'>Agreed Payment Schedule</div>`;
      if (depositOption === "50") {
        body += `<p style='margin:0 0 6px'>A deposit of <strong>${fmt(chosenTotal * 0.5)}</strong> (50% of the total contract price) is due at the time of signing this agreement.</p>`;
        body += `<p style='margin:0'>The remaining balance of <strong>${fmt(chosenTotal * 0.5)}</strong> is due upon satisfactory completion of all work.</p>`;
      } else if (depositOption === "33") {
        body += `<p style='margin:0 0 6px'>Payment shall be made in three equal installments:</p>`;
        body += `<p style='margin:0 0 4px'><strong>1st payment — ${fmt(chosenTotal * 0.33)}</strong> (33%) due at the time of signing.</p>`;
        body += `<p style='margin:0 0 4px'><strong>2nd payment — ${fmt(chosenTotal * 0.33)}</strong> (33%) due upon delivery of materials and commencement of work.</p>`;
        body += `<p style='margin:0'><strong>3rd payment — ${fmt(chosenTotal - chosenTotal * 0.33 * 2)}</strong> (remaining balance) due upon satisfactory completion of all work.</p>`;
      } else if (customDepositText) {
        body += `<p style='margin:0'>${customDepositText}</p>`;
      }
      body += `</div>`;

    } else {
      // No financing or deposit selected — full payment due on completion
      body += `<div style='background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:8px;padding:12px 14px'>`;
      body += `<div style='font-size:9.5px;font-weight:800;color:#0369a1;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px'>Payment Terms</div>`;
      body += `<p style='margin:0'>The full contract amount of <strong>${fmt(chosenTotal)}</strong> is due upon satisfactory completion of all work unless otherwise agreed in writing by both parties.</p>`;
      body += `</div>`;
    }

    body += `</div></div>`;

    if (state.notes) { body += `<div class='sec'><div class='lbl'>Notes</div><div style='font-size:11px;color:#334155;line-height:1.8;white-space:pre-wrap'>${state.notes}</div></div>`; }

    if (state.pricing && (state.pricing.daysToBegin || state.pricing.daysToComplete)) {
      body += `<div class='sec'><div class='lbl'>Project Timeline</div><div style='background:#eef2ff;border:1.5px solid #c7d2fe;border-radius:8px;padding:12px 14px;font-size:11px;color:#0f172a;line-height:1.8'>${state.pricing.daysToBegin ? `New Direction Construction agrees to begin work within <strong>${state.pricing.daysToBegin} days</strong> of the signed contract date.` : ""}${state.pricing.daysToComplete ? ` The project is expected to be completed within <strong>${state.pricing.daysToComplete} days</strong> of commencement.` : ""}</div></div>`;
    }

    const tcItems = [
      { n: 1,  title: "Office Approval", body: "All contracts are subject to approval by Company manager and/or officer of the Company." },
      { n: 2,  title: "Damages for Cancellation", body: "You have a limited right to cancel this contract. You may do so only in the time stated in the contract or allowed by law." },
      { n: 3,  title: "Amount of Cancellation Damages", body: "The agreed damages are 25% of the contracted price. If any part of the work has been completed, the agreed damages are the proportionate price of the work completed plus 24% of the balance of the cash contracted price. You will also be liable for court costs, interest and our attorney fees. The buyer is liable for all costs incurred for special ordered material and/or products if cancelled after the cancellation time frame allowed by law." },
      { n: 4,  title: "Access", body: "You will permit us to go onto the premises. The premises include the land and the buildings. You will obtain any consent needed for us to go onto the premises to complete work. If we are prevented from completing the work, because of denial of access, then we have no further duty to perform the contract. You will then immediately pay us agreed damages as stated in Paragraph 3." },
      { n: 5,  title: "Insurance", body: "We have Public Liability Insurance, Property Damage Insurance and Installer/Applicators have Workers Compensation Insurance." },
      { n: 6,  title: "Debris", body: "We will remove the job related debris." },
      { n: 7,  title: "Interference and Performance", body: "We are not responsible for any interference with performance for reason beyond our reasonable control. This includes strikes, fires, weather, inability to obtain materials, etc." },
      { n: 8,  title: "Warranties", body: "The only express warranties which apply to labor or materials furnished under this contract are those in our warranty certificates. The only remedies for breach of warranty are those stated in our warranty certificates. We have no liability for incidental or consequential damages." },
      { n: 9,  title: "Option to Declare Balance Due", body: "We may declare the contract cancelled by you and collect both for work completed and agreed damages if: (a) You sell, mortgage or transfer any interest of the premises before full payment to us; (b) Anyone places an attachment, writ, lien or any other process against the premises; (c) There is a default in payment of taxes on the premises." },
      { n: 10, title: "Consumer Credit Contract Notice", body: "NOTICE: Any holder of this consumer credit contract is subject to all claims and defenses which the debtor could assert against the seller of goods or services obtained herewith. Recovery hereunder by the debtor shall not exceed amounts paid by the debtor hereunder." },
      { n: 11, title: "Entire Agreement", body: "This contract sets forth the entire agreement between the parties and supersedes any and all prior understandings, agreements or representations made by Company, its agents or representatives. This contract can only be changed in writing by an amendment signed by both Company and you." },
      { n: 12, title: "Compliance with Law", body: "If any provision or term contained herein shall be construed to be invalid, unenforceable or in violation of any law, rule or regulation, then this contract shall be interpreted as if said provision or term has been omitted and the validity of the remaining provisions shall not be affected." },
      { n: 13, title: "Florida Homeowner's Construction Recovery Fund (F.S.489)", body: "Payment may be available from the Homeowner's Construction Recovery Fund if you lose money on a project performed under contract where the loss results from specified violations of Florida Law by a licensed contractor. Contact: Florida Homeowner's Construction Recovery Fund, 1940 N. Monroe Street, Suite 60, Tallahassee, FL 32339." },
      { n: 14, title: "Binding Arbitration Agreement", body: "Any disputes arising in any manner relating to this agreement that cannot be resolved by negotiation shall be subject to mandatory exclusive and binding arbitration. Neither party may take any other action by way of request for injunctive relief or otherwise. The purchaser and dealer agree to abide by the ruling of the Arbitration Association in lieu of filing a lawsuit." },
      { n: 15, title: "Transfer", body: "You may not transfer your duties under this contract to any person without written consent by us." },
      { n: 16, title: "Successors", body: "This contract binds your heirs, executors and administrators." },
      { n: 17, title: "Verification", body: "Our construction specialists check the measurements and calculations made by the sales representative. If a significant mistake or special construction problems occur, we reserve the right to cancel the contract without liability and will refund any down payment made by you." },
      { n: 18, title: "Notice to all Florida Residents", body: "Florida law requires that sixty days before you file a lawsuit for defective construction, you must deliver written notice of any construction conditions you allege are defective and provide the contractor the opportunity to inspect. There are strict deadlines and procedures under Florida Law." },
      { n: 19, title: "Direct Contract Mandatory Provisions (F.S. 713)", body: "According to Florida's Construction Lien Law (Florida Statutes 713.001-713.37), those who work on your property or provide materials and have not been paid in full have a right to enforce their claim for payment against your property. This claim is known as a construction lien. Florida's Construction Lien Law is complex and it is recommended you consult an attorney whenever a specific problem arises." },
      { n: 20, title: "Scope Inclusions", body: "This contract includes all necessary permits, labor, and materials required to complete the agreed scope of work. This also includes all finish work as needed to deliver a complete and professional final result." },
    ];
    body += `<div class='sec'><div class='lbl'>Terms and Conditions</div>`;
    tcItems.forEach((tc, i) => {
      body += `<div style='margin-bottom:9px;padding-bottom:9px;${i < tcItems.length - 1 ? "border-bottom:1px solid #f8fafc" : ""}'>`;
      body += `<div style='font-size:11px;font-weight:800;color:#0f172a;margin-bottom:2px'>${tc.n}. ${tc.title}</div>`;
      body += `<div style='font-size:10.5px;color:#475569;line-height:1.75'>${tc.body}</div>`;
      body += `</div>`;
    });
    body += `</div>`;
  }

  const script = mode !== "pdf" ? `<script>function selectOption(o){window.parent.postMessage({type:'selectOption',option:o},'*');}</script>` : "";
  return `<!DOCTYPE html><html><head><meta charset='utf-8'><style>${css}</style></head><body>${body}${script}</body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PreviewStep — full implementation preserved from original
// ─────────────────────────────────────────────────────────────────────────────
function PreviewStep({ state, setState, setStep, steps, selectedOption, setSelectedOption, selectedPayment, setSelectedPayment, showDeposit, setShowDeposit, depositOption, setDepositOption, customDepositText, setCustomDepositText, usingFinancing, setUsingFinancing, financingPct, setFinancingPct }) {
  const [sending, setSending] = useState(false);
  const [emailOverride, setEmailOverride] = useState(state.customer.email);
  const [bccEmail, setBccEmail] = useState("");
  const [pricingRevealed, setPricingRevealed] = useState(false);

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const t = calcGrandTotal(state);
  const priority = t.total;
  const standard = t.standardTotal || t.total;
  const chosenTotal = selectedOption === "standard" ? standard : priority;
  const monthlyPayment = state.financing && state.financing.monthlyPayment ? parseFloat(state.financing.monthlyPayment) : null;
  const standardFinancingAdd = state.pricing && state.pricing.standardFinancingAdd ? parseFloat(state.pricing.standardFinancingAdd) : null;
  const standardMonthly = monthlyPayment ? (standardFinancingAdd ? monthlyPayment + standardFinancingAdd : monthlyPayment) : null;
  const applicableMonthly = selectedOption === "standard" ? standardMonthly : monthlyPayment;

  useEffect(() => {
    function handler(e) {
      if (!e.data) return;
      if (e.data.type === "revealPricing") { setPricingRevealed(true); setSelectedOption(prev => prev || "standard"); }
      if (e.data.type === "selectOption")  setSelectedOption(prev => prev === e.data.option ? null : e.data.option);
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const scopeHtml   = (() => { try { return buildProposalHTML(state, selectedOption, "scope");   } catch(e) { return "<html><body><p style='padding:20px;color:red'>Error: " + e.message + "</p></body></html>"; } })();
  const previewHtml = (() => { try { return buildProposalHTML(state, selectedOption, "preview"); } catch(e) { return "<html><body><p style='padding:20px;color:red'>Error: " + e.message + "</p></body></html>"; } })();
  const pdfHtml     = (() => { try { return buildProposalHTML(state, selectedOption, "pdf");     } catch(e) { return "<html><body><p style='padding:20px;color:red'>Error: " + e.message + "</p></body></html>"; } })();
  const iframeHtml  = pricingRevealed ? previewHtml : scopeHtml;

  return (
    <div style={{ padding: "0 0 24px" }}>
      <div style={{ padding: "16px 24px 8px", fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Proposal Preview</div>
      <div style={{ padding: "0 24px 12px", borderBottom: "1px solid #e2e8f0", marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>Tap any section to edit and come back</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button onClick={() => setStep(steps.findIndex(s => s.key === "customer"))} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Edit Customer</button>
          {state.services.includes("siding")   && <button onClick={() => setStep(steps.findIndex(s => s.key === "siding"))}   style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Edit Siding</button>}
          {state.services.includes("paint")    && <button onClick={() => setStep(steps.findIndex(s => s.key === "paint"))}    style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Edit Paint</button>}
          {state.services.includes("windows")  && <button onClick={() => setStep(steps.findIndex(s => s.key === "windows"))}  style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Edit Windows</button>}
          <button onClick={() => setStep(0)} style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#dc2626", cursor: "pointer" }}>Edit Services</button>
        </div>
      </div>

      <div style={{ padding: "0 24px 12px" }}>
        <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>📝 Proposal Notes</label>
          <textarea style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#0f172a", outline: "none", resize: "vertical", height: 80, lineHeight: 1.6, fontFamily: "inherit" }} value={state.notes || ""} onChange={e => setState(s => ({ ...s, notes: e.target.value }))} placeholder="e.g. Work begins within 3 weeks of signing. 1-year labor warranty included..." />
        </div>
      </div>

      <iframe srcDoc={iframeHtml} style={{ width: "100%", height: pricingRevealed ? 680 : 600, border: "none", display: "block" }} title="Proposal" />

      <div style={{ padding: "16px 24px 0" }}>
        {pricingRevealed ? (
          <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#166534" }}>✓ Pricing revealed to client</span>
            <button onClick={() => { setPricingRevealed(false); setSelectedOption(null); }} style={{ fontSize: 11, color: "#64748b", background: "none", border: "1px solid #d1fae5", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>Hide Pricing</button>
          </div>
        ) : (
          <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 11, color: "#92400e", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15 }}>👆</span>
            <span>Scroll to the bottom of the proposal and tap <strong>"Yes, Let's Review the Pricing"</strong> when ready.</span>
          </div>
        )}

        {pricingRevealed && selectedOption && (
          <div style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0369a1" }}>{selectedOption === "priority" ? "Administrative Savings Incentive" : selectedOption === "clearance" ? "Administrative Clearance" : "Standard Pricing"}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{selectedOption === "standard" ? fmt(standard) : fmt(priority)}</span>
          </div>
        )}

        {pricingRevealed && (
          <>
            {/* Option selector */}
            <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Select Investment Option</div>
              {[
                { key: "standard", label: "Standard Pricing", color: "#334155", total: standard },
                { key: "priority", label: "Administrative Savings Incentive", color: "#0369a1", total: priority },
                { key: "clearance", label: "Administrative Clearance", color: "#92400e", total: priority },
              ].map(opt => (
                <div key={opt.key} onClick={() => setSelectedOption(prev => prev === opt.key ? null : opt.key)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", border: "1.5px solid " + (selectedOption === opt.key ? "#0ea5e9" : "#e2e8f0"), borderRadius: 8, background: selectedOption === opt.key ? "#f0f9ff" : "white", cursor: "pointer", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid " + (selectedOption === opt.key ? "#0ea5e9" : "#cbd5e1"), background: selectedOption === opt.key ? "#0ea5e9" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {selectedOption === opt.key && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} />}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: opt.color }}>{opt.label}</div>
                  </div>
                  {selectedOption === opt.key && <div style={{ fontSize: 20, fontWeight: 800, color: opt.color }}>{fmt(opt.total)}</div>}
                </div>
              ))}
            </div>

            {/* Aqua Financing toggle */}
            <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: 16, marginBottom: 12 }}>
              <div onClick={() => { const next = !usingFinancing; setUsingFinancing(next); setState(s => ({ ...s, isFinancing: next })); }} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, border: "2px solid " + (usingFinancing ? "#0ea5e9" : "#cbd5e1"), background: usingFinancing ? "#0ea5e9" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {usingFinancing && <span style={{ color: "white", fontSize: 13, fontWeight: 800, lineHeight: 1 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Client is utilizing Aqua Financing</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Configure how much is financed vs. out of pocket</div>
                </div>
              </div>
              {usingFinancing && (
                <div style={{ marginTop: 12, background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Amount Being Financed</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    {[25, 50, 75, 100].map(pct => (
                      <button key={pct} onClick={() => setFinancingPct(pct)} style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid " + (financingPct === pct ? "#0ea5e9" : "#bae6fd"), background: financingPct === pct ? "#0ea5e9" : "white", color: financingPct === pct ? "white" : "#0369a1", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{pct}%</button>
                    ))}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input type="number" min="1" max="100" value={financingPct} onChange={e => setFinancingPct(Math.min(100, Math.max(1, parseInt(e.target.value) || 0)))} style={{ width: 60, border: "1.5px solid #bae6fd", borderRadius: 8, padding: "6px 8px", fontSize: 13, fontWeight: 700, color: "#0f172a", outline: "none", textAlign: "center" }} />
                      <span style={{ fontSize: 12, color: "#64748b" }}>% custom</span>
                    </div>
                  </div>
                  <div style={{ background: "white", borderRadius: 8, border: "1px solid #bae6fd", overflow: "hidden" }}>
                    {(() => {
                      const chosenTotal = selectedOption === "standard" ? (calcGrandTotal(state).standardTotal || calcGrandTotal(state).total) : calcGrandTotal(state).total;
                      return <>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #f0f9ff" }}><span style={{ fontSize: 11, color: "#475569" }}>Total job cost</span><span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{fmt(chosenTotal)}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #f0f9ff", background: "#f0f9ff" }}><span style={{ fontSize: 11, color: "#0369a1", fontWeight: 600 }}>Financed ({financingPct}%)</span><span style={{ fontSize: 13, fontWeight: 800, color: "#0369a1" }}>{fmt(chosenTotal * financingPct / 100)}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px" }}><span style={{ fontSize: 11, color: "#475569" }}>Due out of pocket ({100 - financingPct}%)</span><span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{fmt(chosenTotal * (100 - financingPct) / 100)}</span></div>
                      </>;
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Deposit toggle */}
            <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: 16, marginBottom: 12 }}>
              <div onClick={() => setShowDeposit(d => !d)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, border: "2px solid " + (showDeposit ? "#0ea5e9" : "#cbd5e1"), background: showDeposit ? "#0ea5e9" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {showDeposit && <span style={{ color: "white", fontSize: 13, fontWeight: 800, lineHeight: 1 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Deposit & Payment Schedule</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Select how payments will be collected</div>
                </div>
              </div>
              {showDeposit && (
                <div style={{ marginTop: 12 }}>
                  {[{ key: "50", label: "50% Deposit" }, { key: "33", label: "33/33/33 — Three Payments" }].map(opt => (
                    <div key={opt.key} onClick={() => setDepositOption(opt.key)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1.5px solid " + (depositOption === opt.key ? "#0ea5e9" : "#e2e8f0"), borderRadius: 8, background: depositOption === opt.key ? "#f0f9ff" : "white", cursor: "pointer", marginBottom: 8 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid " + (depositOption === opt.key ? "#0ea5e9" : "#cbd5e1"), background: depositOption === opt.key ? "#0ea5e9" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {depositOption === opt.key && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} />}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{opt.label}</div>
                    </div>
                  ))}
                  {/* Custom payment terms option */}
                  <div onClick={() => setDepositOption("custom")} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", border: "1.5px solid " + (depositOption === "custom" ? "#0ea5e9" : "#e2e8f0"), borderRadius: 8, background: depositOption === "custom" ? "#f0f9ff" : "white", cursor: "pointer" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid " + (depositOption === "custom" ? "#0ea5e9" : "#cbd5e1"), background: depositOption === "custom" ? "#0ea5e9" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      {depositOption === "custom" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Custom Payment Terms</div>
                      {depositOption === "custom"
                        ? <textarea
                            value={customDepositText}
                            onChange={e => setCustomDepositText(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            placeholder="e.g. $5,000 due at signing, remainder financed through Aqua..."
                            style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #bae6fd", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#0f172a", outline: "none", height: 80, resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }}
                          />
                        : <div style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>Tap to enter custom payment terms</div>
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>

            {selectedOption && (
              <button style={{ background: "linear-gradient(135deg,#0ea5e9,#0369a1)", color: "white", border: "none", borderRadius: 10, padding: "14px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%", marginBottom: 10 }} onClick={() => setStep(steps.findIndex(s => s.key === "contract"))}>
                ✍️ Proceed to Contract &amp; Sign
              </button>
            )}

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Customer Email</label>
              <input style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 15, color: "#1e293b", outline: "none" }} type="email" value={emailOverride} onChange={e => setEmailOverride(e.target.value)} placeholder="customer@email.com" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button style={{ background: "white", color: "#0f172a", border: "1.5px solid #0f172a", borderRadius: 10, padding: "12px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%" }} onClick={() => {
                const clientName = state.customer.name ? state.customer.name.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/ /g, "_") : "Client";
                const dateStr = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }).replace(/\//g, "-");
                const newWin = window.open("", "_blank");
                if (newWin) { newWin.document.write(pdfHtml); newWin.document.close(); newWin.document.title = "NDC_Proposal_" + clientName + "_" + dateStr; setTimeout(() => { newWin.focus(); newWin.print(); }, 800); }
              }}>
                Save / Print PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ContractStep — full implementation preserved
// ─────────────────────────────────────────────────────────────────────────────
function ContractStep({ state, selectedOption, setStep, steps, showDeposit, depositOption, customDepositText, usingFinancing, financingPct }) {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const canvasRef = useRef(null);
  const [isSigning, setIsSigning] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [sigDataUrl, setSigDataUrl] = useState(null);
  const [repName, setRepName] = useState("CJ Shires");
  const [sending, setSending] = useState(false);
  const [emailOverride, setEmailOverride] = useState((state.customer && state.customer.email) || "");

  const t = calcGrandTotal(state);
  const priority = t.total;
  const standard = t.standardTotal || t.total;
  const chosenTotal = selectedOption === "standard" ? standard : priority;

  const startDraw = (e) => { setIsSigning(true); const canvas = canvasRef.current; const ctx = canvas.getContext("2d"); const rect = canvas.getBoundingClientRect(); const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left; const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top; ctx.beginPath(); ctx.moveTo(x, y); };
  const draw = (e) => { if (!isSigning) return; e.preventDefault(); const canvas = canvasRef.current; const ctx = canvas.getContext("2d"); const rect = canvas.getBoundingClientRect(); const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left; const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.strokeStyle = "#0f172a"; ctx.lineTo(x, y); ctx.stroke(); };
  const endDraw = () => { setIsSigning(false); setHasSigned(true); setSigDataUrl(canvasRef.current.toDataURL("image/png")); };
  const clearSig = () => { canvasRef.current.getContext("2d").clearRect(0, 0, 600, 120); setHasSigned(false); setSigDataUrl(null); };

  const contractPdfHtml = (() => { try { return buildProposalHTML(state, selectedOption, "pdf", { usingFinancing, financingPct, depositOption, customDepositText }); } catch(e) { return ""; } })();

  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Contract &amp; Signature</h2>
      <p style={S.stepSub}>Review the full contract with your client, then collect their signature below.</p>

      <div style={{ marginBottom: 16, border: "1.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", background: "#0f172a", color: "white", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>Full Contract — Scope, Materials &amp; Terms</div>
        <iframe srcDoc={contractPdfHtml} style={{ width: "100%", height: 700, border: "none", display: "block" }} title="Contract" />
      </div>

      <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Client Signature</div>
        <div style={{ fontSize: 10.5, color: "#475569", lineHeight: 1.7, marginBottom: 10, fontStyle: "italic" }}>
          By signing below, I acknowledge that I have read and agree to all terms and conditions and authorize New Direction Construction to proceed with the scope of work above for <strong>{fmt(chosenTotal)}</strong>.
        </div>
        <div style={{ position: "relative", border: "1.5px solid #e2e8f0", borderRadius: 8, background: "#f8fafc", overflow: "hidden", height: 120 }}>
          <canvas ref={canvasRef} width={600} height={120} style={{ display: "block", width: "100%", height: 120, touchAction: "none", cursor: "crosshair" }} onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
          {!hasSigned && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 12, color: "#cbd5e1", pointerEvents: "none", fontStyle: "italic" }}>Sign here</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <div style={{ fontSize: 10, color: "#64748b" }}>{state.customer.name} · {today}</div>
          <button onClick={clearSig} style={{ fontSize: 10, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Clear</button>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          <div style={{ flex: 2 }}>
            <input value={repName} onChange={e => setRepName(e.target.value)} style={{ width: "100%", borderBottom: "1.5px solid #0f172a", borderTop: "none", borderLeft: "none", borderRight: "none", outline: "none", fontSize: 14, fontFamily: "Georgia, serif", color: "#0f172a", background: "transparent", boxSizing: "border-box", marginBottom: 4 }} />
            <div style={{ fontSize: 10, color: "#64748b" }}>NDC Representative</div>
          </div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: 2, marginBottom: 4 }}>{today}</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>Date</div>
          </div>
        </div>
      </div>

      {hasSigned && <div style={{ background: "#dcfce7", border: "1.5px solid #86efac", borderRadius: 8, padding: "12px 16px", marginBottom: 12, fontSize: 12, fontWeight: 700, color: "#166534", textAlign: "center" }}>✓ Contract Signed!</div>}

      <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: 16, marginBottom: 12 }}>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Customer Email</label>
          <input style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "#1e293b", outline: "none" }} type="email" value={emailOverride} onChange={e => setEmailOverride(e.target.value)} placeholder="customer@email.com" />
        </div>
        <button style={{ background: "white", color: "#0f172a", border: "1.5px solid #0f172a", borderRadius: 10, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", width: "100%" }} onClick={() => {
          const clientName = (state.customer.name || "Client").replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/ /g, "_");
          const dateStr = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }).replace(/\//g, "-");
          const sigBlock = `<div style='padding:20px;border-top:2px solid #0f172a;margin-top:8px'><div style='font-size:9.5px;font-weight:800;color:#0ea5e9;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px'>Client Signature</div>${sigDataUrl ? `<img src='${sigDataUrl}' style='width:100%;max-width:420px;height:90px;object-fit:contain;border:1px solid #e2e8f0;border-radius:6px;background:#f8fafc;display:block;margin-bottom:8px'/>` : `<div style='border:1px solid #e2e8f0;border-radius:6px;background:#f8fafc;height:90px;margin-bottom:8px'></div>`}<div style='display:flex;justify-content:space-between;font-size:10px;color:#64748b;border-top:1.5px solid #0f172a;padding-top:6px'><span>${state.customer.name || "Client"} &nbsp;&nbsp; Date: ${today}</span><span>NDC Rep: ${repName} &nbsp;&nbsp; Date: ${today}</span></div></div>`;
          const pdfWithSig = contractPdfHtml.replace("</body>", sigBlock + "</body>");
          const newWin = window.open("", "_blank");
          if (newWin) { newWin.document.write(pdfWithSig); newWin.document.close(); newWin.document.title = "NDC_Contract_" + clientName + "_" + dateStr; setTimeout(() => { newWin.focus(); newWin.print(); }, 800); }
        }}>
          🖨️ Save / Print Contract PDF
        </button>
      </div>

      <button onClick={() => setStep(steps.findIndex(s => s.key === "preview"))} style={{ background: "white", color: "#475569", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "12px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%", marginBottom: usingFinancing ? 10 : 0 }}>
        ← Back to Proposal
      </button>

      {usingFinancing && (
        <button onClick={() => {
          const idx = steps.findIndex(s => s.key === "creditapp");
          setStep(idx >= 0 ? idx : steps.length - 1);
        }} style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", color: "white", border: "2px solid #0ea5e9", borderRadius: 10, padding: "14px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%" }}>
          💳 Proceed to Credit Application
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// buildSteps — credit app added at end when financing is selected
// ─────────────────────────────────────────────────────────────────────────────
function buildSteps(services, isFinancing) {
  const steps = [
    { key: "services", label: "Services" },
    { key: "customer", label: "Customer" },
  ];
  if (services.includes("siding"))  steps.push({ key: "siding",   label: "Siding"   });
  if (services.includes("soffit"))  steps.push({ key: "soffit",   label: "Soffits"  });
  if (services.includes("fascia"))  steps.push({ key: "fascia",   label: "Fascia"   });
  if (services.includes("paint"))   steps.push({ key: "paint",    label: "Paint"    });
  if (services.includes("windows")) steps.push({ key: "windows",  label: "Windows"  });
  if (services.includes("misc"))    steps.push({ key: "misc",     label: "Misc"     });
  steps.push({ key: "preview",   label: "Preview"  });
  steps.push({ key: "contract",  label: "Contract" });
  if (isFinancing) steps.push({ key: "creditapp", label: "Credit App", emoji: "💳" });
  return steps;
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={S.field}>
      <label style={S.label}>{label}</label>
      <input style={S.input} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  const [step, setStep] = useState(() => { try { return parseInt(localStorage.getItem("ndc_step") || "0"); } catch { return 0; } });
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem("ndc_state");
      if (!saved) return makeInitialState();
      const parsed = JSON.parse(saved);
      const defaults = makeInitialState();
      return {
        ...defaults, ...parsed,
        services:  Array.isArray(parsed.services)  ? parsed.services  : defaults.services,
        windows:   Array.isArray(parsed.windows)   ? parsed.windows   : defaults.windows,
        isFinancing: parsed.isFinancing || false,
        pricing:   { ...defaults.pricing,  ...(parsed.pricing  || {}) },
        financing: { ...defaults.financing, ...(parsed.financing || {}) },
        company:   { ...defaults.company,   ...(parsed.company   || {}) },
        customer:  { ...defaults.customer,  ...(parsed.customer  || {}) },
        siding:    { ...defaults.siding,    ...(parsed.siding    || {}), walls: Array.isArray(parsed.siding && parsed.siding.walls) ? parsed.siding.walls : defaults.siding.walls },
        soffit:    { ...defaults.soffit,    ...(parsed.soffit    || {}), items: Array.isArray(parsed.soffit && parsed.soffit.items) ? parsed.soffit.items : defaults.soffit.items },
        fascia:    { ...defaults.fascia,    ...(parsed.fascia    || {}), items: Array.isArray(parsed.fascia && parsed.fascia.items) ? parsed.fascia.items : defaults.fascia.items },
        paint:     { ...defaults.paint,     ...(parsed.paint     || {}), walls: Array.isArray(parsed.paint && parsed.paint.walls) ? parsed.paint.walls : defaults.paint.walls, trim: Array.isArray(parsed.paint && parsed.paint.trim) ? parsed.paint.trim : defaults.paint.trim },
        misc:      { ...defaults.misc,      ...(parsed.misc      || {}), items: Array.isArray(parsed.misc && parsed.misc.items) ? parsed.misc.items : defaults.misc.items },
        creditApp: { ...defaults.creditApp, ...(parsed.creditApp || {}) },
      };
    } catch { return makeInitialState(); }
  });

  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositOption, setDepositOption] = useState(null);
  const [customDepositText, setCustomDepositText] = useState("");
  const [usingFinancing, setUsingFinancing] = useState(state.isFinancing || false);
  const [financingPct, setFinancingPct] = useState(100);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const steps = buildSteps(state.services, state.isFinancing);

  useEffect(() => {
    try {
      localStorage.setItem("ndc_state", JSON.stringify(state));
      localStorage.setItem("ndc_step", String(step));
    } catch(e) { console.warn("Save failed:", e); }
  }, [state, step]);

  const currentKey = steps[step] && steps[step].key;
  const lastStep = steps.length - 1;
  const update = (section, key, val) => setState((s) => ({ ...s, [section]: { ...s[section], [key]: val } }));

  const canNext = () => {
    if (currentKey === "services") return state.services.length > 0;
    if (currentKey === "customer") return state.customer.name.trim().length > 0;
    return true;
  };

  // Grand total for pre-filling credit app
  const t = calcGrandTotal(state);
  const projectTotal = selectedOption === "standard" ? (t.standardTotal || t.total) : t.total;

  return (
    <div style={S.app}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={S.headerTitle}>ProposalBuilder</div>
            <div style={S.headerSub}>New Direction Construction · On-Site Estimator</div>
          </div>
          <button onClick={() => setShowPricingModal(true)} title="Rep Pricing Tool" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "white", padding: "6px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
            🔧 Rep Pricing
          </button>
        </div>
      </div>

      {/* Rep Pricing Modal */}
      {showPricingModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "20px 0" }}>
          <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 640, margin: "0 16px", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #e2e8f0", background: "#fef9c3", borderRadius: "16px 16px 0 0" }}>
              <div><div style={{ fontSize: 14, fontWeight: 800, color: "#92400e" }}>🔧 Rep Pricing Tool</div><div style={{ fontSize: 11, color: "#a16207" }}>Private — for your eyes only</div></div>
              <button onClick={() => setShowPricingModal(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#64748b" }}>×</button>
            </div>
            <div style={{ padding: "0 4px 16px" }}>
              <PricingStep state={state} onChange={(v) => setState(s => ({ ...s, pricing: v, financing: { ...s.financing, monthlyPayment: v.monthlyPayment || "" } }))} />
            </div>
            <div style={{ padding: "0 20px 20px" }}>
              <button onClick={() => setShowPricingModal(false)} style={{ background: "linear-gradient(135deg,#0ea5e9,#0369a1)", color: "white", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", width: "100%" }}>Done — Save Pricing</button>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ ...S.progress, overflowX: "auto" }}>
        {steps.map((s, i) => (
          <div key={s.key} style={{ ...S.progressStep, cursor: i < step ? "pointer" : "default", minWidth: 44 }} onClick={() => i < step && setStep(i)}>
            <div style={{ ...S.progressDot, background: i <= step ? (s.key === "creditapp" ? "#0ea5e9" : "#0ea5e9") : "#e2e8f0" }}>
              {i < step ? "✓" : s.emoji || (i + 1)}
            </div>
            <span style={{ fontSize: 8, marginTop: 3, color: i <= step ? "#0ea5e9" : "#94a3b8", fontWeight: i === step ? 700 : 400, whiteSpace: "nowrap" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Credit App step indicator banner */}
      {currentKey === "creditapp" && (
        <div style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", padding: "10px 24px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>💳</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "white" }}>Credit Application</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Separate from proposal — for financing only</div>
          </div>
        </div>
      )}

      {/* Step body */}
      <div style={S.body}>
        {currentKey === "services"  && <ServiceSelectStep selected={state.services} onChange={(v) => setState((s) => ({ ...s, services: v }))} isFinancing={state.isFinancing} onFinancingChange={(v) => setState(s => ({ ...s, isFinancing: v }))} />}
        {currentKey === "customer"  && <CustomerStep data={state.customer} onChange={(k, v) => update("customer", k, v)} />}
        {currentKey === "siding"    && <SidingStep data={state.siding} onChange={(k, v) => setState((s) => ({ ...s, siding: { ...s.siding, [k]: v } }))} onSidingTypeChange={(type) => setState((s) => ({ ...s, siding: { ...s.siding, sidingType: type }, sidingMaterials: defaultSidingMaterials(type) }))} state={state} />}
        {currentKey === "soffit"    && <SoffitStepSimple title="Soffits" data={state.soffit} onChange={(v) => setState((s) => ({ ...s, soffit: v }))} />}
        {currentKey === "fascia"    && <SoffitStepSimple title="Fascia" data={state.fascia} onChange={(v) => setState((s) => ({ ...s, fascia: v }))} />}
        {currentKey === "paint"     && <PaintStep data={state.paint} onChange={(v) => setState((s) => ({ ...s, paint: v }))} />}
        {currentKey === "windows"   && <WindowsStep windows={state.windows} onChange={(v) => setState((s) => ({ ...s, windows: v }))} />}
        {currentKey === "misc"      && <MiscStep data={state.misc} onChange={(v) => setState((s) => ({ ...s, misc: v }))} />}
        {currentKey === "preview"   && <PreviewStep state={state} setState={setState} setStep={setStep} steps={steps} selectedOption={selectedOption} setSelectedOption={setSelectedOption} selectedPayment={selectedPayment} setSelectedPayment={setSelectedPayment} showDeposit={showDeposit} setShowDeposit={setShowDeposit} depositOption={depositOption} setDepositOption={setDepositOption} customDepositText={customDepositText} setCustomDepositText={setCustomDepositText} usingFinancing={usingFinancing} setUsingFinancing={setUsingFinancing} financingPct={financingPct} setFinancingPct={setFinancingPct} />}
        {currentKey === "contract"  && <ContractStep state={state} selectedOption={selectedOption} setStep={setStep} steps={steps} showDeposit={showDeposit} depositOption={depositOption} customDepositText={customDepositText} usingFinancing={usingFinancing} financingPct={financingPct} />}
        {currentKey === "creditapp" && <CreditAppStep data={state.creditApp} onChange={(v) => setState(s => ({ ...s, creditApp: v }))} projectTotal={projectTotal} />}
      </div>

      {/* Nav buttons */}
      {step < lastStep && currentKey !== "preview" && currentKey !== "contract" && currentKey !== "creditapp" && (
        <div style={S.nav}>
          {step > 0 && <button style={S.secondaryBtn} onClick={() => setStep(step - 1)}>← Back</button>}
          <button style={{ ...S.primaryBtn, marginLeft: "auto", opacity: canNext() ? 1 : 0.5 }} disabled={!canNext()} onClick={() => setStep(step + 1)}>Next →</button>
        </div>
      )}

      {(currentKey === "preview" || currentKey === "contract") && (
        <div style={S.nav}>
          <button style={S.secondaryBtn} onClick={() => setStep(step - 1)}>← Back</button>
          <button style={{ ...S.secondaryBtn, marginLeft: "auto" }} onClick={() => {
            if (window.confirm("Clear all proposal data and start a new proposal?")) {
              localStorage.removeItem("ndc_state"); localStorage.removeItem("ndc_step");
              setState(makeInitialState()); setStep(0); setSelectedOption(null); setSelectedPayment(null);
            }
          }}>New Proposal</button>
        </div>
      )}

      {currentKey === "creditapp" && (
        <div style={S.nav}>
          <button style={S.secondaryBtn} onClick={() => setStep(step - 1)}>← Back to Contract</button>
          <button style={{ ...S.secondaryBtn, marginLeft: "auto" }} onClick={() => {
            if (window.confirm("Clear all proposal data and start a new proposal?")) {
              localStorage.removeItem("ndc_state"); localStorage.removeItem("ndc_step");
              setState(makeInitialState()); setStep(0); setSelectedOption(null);
            }
          }}>New Proposal</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const S = {
  app: { fontFamily: "'Georgia', serif", background: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 700, margin: "0 auto" },
  header: { background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "white", padding: "20px 24px 16px" },
  headerTitle: { fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" },
  headerSub: { fontSize: 13, color: "#7dd3fc", marginTop: 2 },
  progress: { display: "flex", justifyContent: "space-between", padding: "14px 16px 0", background: "white", borderBottom: "1px solid #e2e8f0" },
  progressStep: { display: "flex", flexDirection: "column", alignItems: "center", flex: 1 },
  progressDot: { width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white" },
  body: { flex: 1, padding: "0 0 24px" },
  nav: { display: "flex", padding: "12px 24px", borderTop: "1px solid #e2e8f0", background: "white", gap: 10 },
  stepWrap: { padding: "20px 24px" },
  stepTitle: { fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" },
  stepSub: { color: "#64748b", fontSize: 13, margin: "0 0 20px", lineHeight: 1.5 },
  field: { marginBottom: 14 },
  label: { display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" },
  input: { width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 15, color: "#1e293b", outline: "none", background: "white" },
  card: { background: "white", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: 14, marginBottom: 12 },
  addBtn: { background: "none", border: "1.5px dashed #0ea5e9", borderRadius: 8, padding: "8px 16px", color: "#0ea5e9", fontWeight: 700, fontSize: 13, cursor: "pointer", width: "100%", marginBottom: 12 },
  removeBtn: { background: "#fef2f2", border: "none", borderRadius: 6, color: "#ef4444", fontWeight: 700, cursor: "pointer", padding: "2px 8px", fontSize: 13 },
  summaryBox: { background: "#f0f9ff", border: "1.5px solid #7dd3fc", borderRadius: 10, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8 },
  primaryBtn: { background: "linear-gradient(135deg, #0ea5e9, #0369a1)", color: "white", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer" },
  secondaryBtn: { background: "white", color: "#475569", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "12px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer" },
};

export default App;
