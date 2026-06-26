import React, { useState, useEffect, useRef } from "react";

function uid() { return Math.random().toString(36).slice(2); }
const GOOGLE_REVIEW_URL = "https://g.page/r/CeWCvoI8IFUHEAE/review";
const GOOGLE_REVIEW_QR = "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=" + encodeURIComponent("https://g.page/r/CeWCvoI8IFUHEAE/review");
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
  { id: "doors",    emoji: "🚪", label: "Doors",           sub: "Entry, sliding glass, French doors" },
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
  customer: { name: "", address: "", email: "", phone: "", photo: null, county: "" },
  proposalVersion: 1,
  services: [],
  isFinancing: false,
  siding: { walls: [{ id: uid(), label: "Wall 1", location: "", sqft: "", pricePerSqFt: "", currentSiding: "", removalRequired: "", osbSheathing: "", hardieProduct: "", hardieSize: "", hardieTexture: "", photos: [], notes: "" }], pricePerSqFt: "", sidingType: "HardiePlank Lap Siding" },
  soffit: { items: [{ id: uid(), label: "Soffit Area 1", currentMaterial: "", newMaterial: "", linearFt: "", pricePerLnFt: "", notes: "" }] },
  fascia: { items: [{ id: uid(), label: "Fascia Area 1", currentMaterial: "", newMaterial: "", linearFt: "", pricePerLnFt: "", notes: "" }] },
  paint: { walls: [{ id: uid(), paintProduct: "", colorName: "", sqft: "", pricePerSqFt: "", notes: "" }], trim: [{ id: uid(), paintProduct: "", colorName: "", sqft: "", pricePerSqFt: "", notes: "" }], other: [{ id: uid(), paintProduct: "", colorName: "", sqft: "", pricePerSqFt: "", notes: "" }] },
  windows: [{ id: uid(), label: "Window 1", location: "", manufacturer: "", manufacturerOther: "", frameType: "", frameColor: "", style: "", glassType: "", glassPack: "", grids: "", width: "", height: "", qty: "1", priceInstalled: "" }],
  doors: [{ id: uid(), label: "Door 1", doorType: "", manufacturer: "", manufacturerOther: "", series: "", cwsConfig: "", material: "", glassOption: "", impactOption: "", color: "", hardwareFinish: "", swingDirection: "", width: "", height: "", hasSidelights: false, sidelightPosition: "", jambMaterial: "", thresholdFinish: "", notes: "", adminPrice: "", standardMarkupPct: "" }],
  sidingMaterials: defaultSidingMaterials("HardiePlank Lap Siding"),
  soffitMaterials: defaultSoffitMaterials(),
  paintMaterials: defaultPaintMaterials(),
  windowMaterials: defaultWindowMaterials(),
  misc: { items: [{ id: uid(), description: "", qty: "", unitPrice: "", notes: "" }] },
  notes: "",
  financing: { monthlyPayment: "", customPayment: "" },
  pricing: { sidingPerSqFt: "", sidingStandardMarkupPct: "", soffitPerLinFt: "", soffitStandardMarkupPct: "", fasciaPerLinFt: "", fasciaStandardMarkupPct: "", paintPerSqFt: "", paintStandardMarkupPct: "", windowPerUnit: "", windowStandardMarkupPct: "", miscMarkup: "", adminSavingsDiscount: "8.35", monthlyPayment: "", clearanceDays: "14", clearanceBeatPct: "10", standardFinancingAdd: "", daysToBegin: "", daysToComplete: "", showClearance: false },
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
  const win = services.includes("windows") ? windows.reduce((a,w) => {
    const adminPrice = parseFloat(w.adminPrice || w.priceInstalled || p.windowPerUnit || 0);
    return a + adminPrice * parseFloat(w.qty || 1);
  }, 0) : 0;
  const winStd = services.includes("windows") ? windows.reduce((a,w) => {
    const adminPrice = parseFloat(w.adminPrice || w.priceInstalled || p.windowPerUnit || 0);
    const markupPct = parseFloat(w.standardMarkupPct || p.windowStandardMarkupPct || 0) / 100;
    return a + adminPrice * parseFloat(w.qty || 1) * (1 + markupPct);
  }, 0) : 0;
  const doors = state.doors || [];
  const door = services.includes("doors") ? doors.reduce((a,d) => a + parseFloat(d.adminPrice||0), 0) : 0;
  const doorStd = services.includes("doors") ? doors.reduce((a,d) => { const ap = parseFloat(d.adminPrice||0); const mp = parseFloat(d.standardMarkupPct||0)/100; return a + ap*(1+mp); }, 0) : 0;
  const msc = services.includes("misc") ? miscItems.reduce((a,i)=>a+parseFloat(i.qty||0)*parseFloat(i.unitPrice||0),0) : 0;
  const total = sid + sof + fas + pntAdmin + win + msc;
  const standardTotal = sidStd + sofStd + fasStd + pntStandard + winStd + doorStd + msc;
  return { sid, sidStd, sof, sofStd, fas, fasStd, pnt: pntAdmin, pntStandard, win, winStd, door, doorStd, msc, total: sid + sof + fas + pntAdmin + win + door + msc, standardTotal };
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
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
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
// Credit App PDF builder───────────────────────────────────────────────────────────────────────
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
function PricingStep({ state, onChange, onWindowsChange, onDoorsChange }) {
  var p = state.pricing || {};
  var services = state.services || [];
  function set(k, v) { onChange(Object.assign({}, p, { [k]: v })); }

  // Wire up per-window price editing via global callback
  window.__ndcSetWindowPrice = function(idx, k, v) {
    var updated = (state.windows || []).map(function(w, i){ return i === idx ? Object.assign({}, w, { [k]: v }) : w; });
    if (onWindowsChange) onWindowsChange(updated);
  };
  window.__ndcSetDoorPrice = function(idx, k, v) {
    var updated = (state.doors || []).map(function(d, i){ return i === idx ? Object.assign({}, d, { [k]: v }) : d; });
    if (onDoorsChange) onDoorsChange(updated);
  };

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
  var winTotal = services.includes("windows") ? state.windows.reduce(function(a,w){ return a + parseFloat(w.adminPrice||0) * parseFloat(w.qty||1); }, 0) : 0;
  var winStdTotal = services.includes("windows") ? state.windows.reduce(function(a,w){ var ap = parseFloat(w.adminPrice||0); var mp = parseFloat(w.standardMarkupPct||0)/100; return a + ap * parseFloat(w.qty||1) * (1+mp); }, 0) : 0;
  var grandAdminTotal = sidTotal + sofTotal + fasTotal + pntTotal + winTotal + miscTotal;
  var doorAdminTotal = services.includes("doors") ? (state.doors||[]).reduce(function(a,d){ return a + parseFloat(d.adminPrice||0); }, 0) : 0;
  var doorStdTotal = services.includes("doors") ? (state.doors||[]).reduce(function(a,d){ var ap=parseFloat(d.adminPrice||0); var mp=parseFloat(d.standardMarkupPct||0)/100; return a+ap*(1+mp); }, 0) : 0;
  var grandStandardTotal = sidStdTotal + sofStdTotal + fasStdTotal + pntStandardTotal + winStdTotal + doorStdTotal + miscTotal;

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
      React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginBottom: 10 } }, "Enter the Direct-Commitment price and standard markup % for each window size"),
      state.windows.map(function(w, idx) {
        var adminPrice = parseFloat(w.adminPrice||0);
        var markupPct = parseFloat(w.standardMarkupPct||0);
        var lineAdminTotal = adminPrice * parseFloat(w.qty||1);
        var lineStdTotal = lineAdminTotal * (1 + markupPct/100);
        var _idx = idx;
        var label = w.label || ("Window " + (idx+1));
        var desc = [w.manufacturer === "Other" ? w.manufacturerOther : w.manufacturer, w.series, w.impactOption, w.style, w.width && w.height ? w.width+"×"+w.height : ""].filter(Boolean).join(" — ");
        return React.createElement("div", { key: w.id, style: { borderTop: idx > 0 ? "1px solid #f1f5f9" : "none", paddingTop: idx > 0 ? 12 : 0, marginBottom: 12 } },
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#0f172a", marginBottom: 2 } }, label + (desc ? " — " + desc : "") + " (qty: " + (w.qty||1) + ")"),
          React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "flex-end" } },
            React.createElement("div", { style: { flex: 1 } },
              React.createElement("label", { style: { ...labelStyle, color: "#0369a1" } }, "Direct-Commitment price ($/unit)"),
              React.createElement("input", { style: inputStyle, type: "number", value: w.adminPrice||"", onChange: function(e){ var val = e.target.value; if (typeof window.__ndcSetWindowPrice === "function") window.__ndcSetWindowPrice(_idx, "adminPrice", val); }, placeholder: "e.g. 450.00" })
            ),
            React.createElement("div", { style: { flex: 1 } },
              React.createElement("label", { style: { ...labelStyle, color: "#475569" } }, "Standard markup (%)"),
              React.createElement("input", { style: inputStyle, type: "number", value: w.standardMarkupPct||"", onChange: function(e){ var val = e.target.value; if (typeof window.__ndcSetWindowPrice === "function") window.__ndcSetWindowPrice(_idx, "standardMarkupPct", val); }, placeholder: "e.g. 15" })
            ),
            React.createElement("div", { style: { display: "flex", gap: 6 } },
              PriceBox("ADMIN", lineAdminTotal),
              PriceBox("STD", lineStdTotal)
            )
          )
        );
      }),
      React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "2px solid #e2e8f0", paddingTop: 10, marginTop: 4 } },
        PriceBox("ADMIN TOTAL", winTotal),
        PriceBox("STANDARD TOTAL", winStdTotal)
      )
    ) : null,
    services.includes("doors") ? React.createElement("div", { style: cardStyle },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 4 } }, "Door Installation"),
      React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginBottom: 10 } }, "Enter the Direct-Commitment price and standard markup % for each door"),
      (state.doors||[]).map(function(d, idx) {
        var adminPrice = parseFloat(d.adminPrice||0);
        var markupPct = parseFloat(d.standardMarkupPct||0);
        var lineAdminTotal = adminPrice;
        var lineStdTotal = adminPrice * (1 + markupPct/100);
        var _idx = idx;
        var label = d.label || ("Door " + (idx+1));
        var desc = [d.doorType, d.manufacturer === "Other" ? d.manufacturerOther : d.manufacturer, d.width && d.height ? d.width+"x"+d.height : ""].filter(Boolean).join(" — ");
        return React.createElement("div", { key: d.id, style: { borderTop: idx > 0 ? "1px solid #f1f5f9" : "none", paddingTop: idx > 0 ? 12 : 0, marginBottom: 12 } },
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#0f172a", marginBottom: 6 } }, label + (desc ? " — " + desc : "")),
          React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "flex-end" } },
            React.createElement("div", { style: { flex: 1 } },
              React.createElement("label", { style: { ...labelStyle, color: "#0369a1" } }, "Direct-Commitment price ($)"),
              React.createElement("input", { style: inputStyle, type: "number", value: d.adminPrice||"", onChange: function(e){ var val=e.target.value; if(typeof window.__ndcSetDoorPrice==="function") window.__ndcSetDoorPrice(_idx,"adminPrice",val); }, placeholder: "e.g. 1200.00" })
            ),
            React.createElement("div", { style: { flex: 1 } },
              React.createElement("label", { style: { ...labelStyle, color: "#475569" } }, "Standard markup (%)"),
              React.createElement("input", { style: inputStyle, type: "number", value: d.standardMarkupPct||"", onChange: function(e){ var val=e.target.value; if(typeof window.__ndcSetDoorPrice==="function") window.__ndcSetDoorPrice(_idx,"standardMarkupPct",val); }, placeholder: "e.g. 15" })
            ),
            React.createElement("div", { style: { display: "flex", gap: 6 } },
              PriceBox("ADMIN", lineAdminTotal),
              PriceBox("STD", lineStdTotal)
            )
          )
        );
      }),
      React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "2px solid #e2e8f0", paddingTop: 10, marginTop: 4 } },
        PriceBox("ADMIN TOTAL", doorAdminTotal),
        PriceBox("STANDARD TOTAL", doorStdTotal)
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
    React.createElement("div", { style: { ...cardStyle, borderColor: p.showClearance ? "#f59e0b" : "#e2e8f0", background: p.showClearance ? "#fffbeb" : "#f8fafc" } },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: p.showClearance ? 10 : 0 } },
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: p.showClearance ? "#92400e" : "#64748b" } }, "Administrative Clearance Option"),
          React.createElement("div", { style: { fontSize: 10, color: p.showClearance ? "#a16207" : "#94a3b8", marginTop: 2 } }, p.showClearance ? "Visible to client — last resort option" : "Hidden from client")
        ),
        React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" } },
          React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: p.showClearance ? "#a16207" : "#94a3b8" } }, p.showClearance ? "ON" : "OFF"),
          React.createElement("div", {
            onClick: function() { set("showClearance", !p.showClearance); },
            style: { position: "relative", width: 42, height: 24, borderRadius: 12, background: p.showClearance ? "#f59e0b" : "#cbd5e1", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }
          },
            React.createElement("div", { style: { position: "absolute", top: 3, left: p.showClearance ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" } })
          )
        )
      ),
      p.showClearance ? React.createElement("div", null,
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
      ) : null
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

function ServiceSelectStep({ selected, onChange, isFinancing, onFinancingChange, savedCount, onShowSaved, currentProposalId }) {
  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  };
  return (
    <div style={S.stepWrap}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <h2 style={{ ...S.stepTitle, marginBottom: 2 }}>What services does this job include?</h2>
          {currentProposalId && <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 700, marginBottom: 4 }}>✓ Proposal saved</div>}
        </div>
        <button onClick={onShowSaved} style={{ background: savedCount > 0 ? "#f0fdf4" : "#f8fafc", border: "1.5px solid " + (savedCount > 0 ? "#86efac" : "#e2e8f0"), borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: savedCount > 0 ? "#16a34a" : "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          💾 {savedCount > 0 ? savedCount + " Saved" : "Saved"}
        </button>
      </div>
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

function CustomerStep({ data, fullState, onChange }) {
  const [countyLoading, setCountyLoading] = React.useState(false);

  const detectCounty = React.useCallback(async (address) => {
    if (!address || address.length < 10) return;
    setCountyLoading(true);
    try {
      const url = "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=" + encodeURIComponent(address + ", Florida");
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      if (data && data[0] && data[0].address) {
        const county = data[0].address.county || data[0].address.state_district || "";
        if (county) onChange("county", county);
      }
    } catch(e) {}
    setCountyLoading(false);
  }, [onChange]);

  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Customer Info</h2>
      <p style={S.stepSub}>Who are you sending this proposal to?</p>
      <Field label="Customer Name" value={data.name} onChange={(v) => onChange("name", v)} placeholder="John Smith" />
      <div style={S.field}>
        <label style={S.label}>Job Address</label>
        <input style={S.input} value={data.address || ""} placeholder="123 Main St, City, ST 12345"
          onChange={(e) => onChange("address", e.target.value)}
          onBlur={(e) => detectCounty(e.target.value)}
        />
        {(countyLoading || data.county) && (
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
            {countyLoading
              ? <div style={{ fontSize: 11, color: "#64748b", fontStyle: "italic" }}>🔍 Detecting county...</div>
              : <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>📍 {data.county}</div>
            }
            <button onClick={() => onChange("county", "")} style={{ fontSize: 10, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: 0 }}>✕ clear</button>
          </div>
        )}
        {!countyLoading && !data.county && data.address && data.address.length > 10 && (
          <div style={{ marginTop: 4 }}>
            <select style={{ ...S.input, fontSize: 12, padding: "6px 10px", marginTop: 2 }} value="" onChange={(e) => { if (e.target.value) onChange("county", e.target.value); }}>
              <option value="">County not detected — select manually</option>
              <option>Duval County</option>
              <option>Clay County</option>
              <option>St. Johns County</option>
              <option>Nassau County</option>
              <option>Flagler County</option>
              <option>Putnam County</option>
              <option>Other Florida County</option>
            </select>
          </div>
        )}
      </div>
      <Field label="Customer Email" value={data.email} onChange={(v) => onChange("email", v)} placeholder="customer@email.com" type="email" />
      <Field label="Customer Phone" value={data.phone} onChange={(v) => onChange("phone", v)} placeholder="(555) 000-0000" />

      {/* Google Contacts Button */}
      {(data.name || data.phone || data.email) && (
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => {
            const params = new URLSearchParams();
            if (data.name) params.set("name", data.name);
            if (data.phone) params.set("phone", data.phone);
            if (data.email) params.set("email", data.email);
            if (data.address) params.set("address", data.address);
            // Build notes
            const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
            let notes = "NDC Proposal — " + today + "\n";
            if (fullState && fullState.services && fullState.services.length > 0) {
              notes += "Services: " + fullState.services.join(", ") + "\n";
            }
            if (fullState.siding && fullState.siding.walls && fullState.siding.walls.length > 0) {
              const sidingSqft = fullState.siding.walls.reduce((a, w) => a + parseFloat(w.sqft || 0), 0);
              if (sidingSqft > 0) notes += "Siding: " + sidingSqft.toFixed(0) + " sq ft\n";
            }
            if (fullState.soffit && fullState.soffit.items && fullState.soffit.items.length > 0) {
              const soffitLf = fullState.soffit.items.reduce((a, i) => a + parseFloat(i.linearFt || 0), 0);
              if (soffitLf > 0) notes += "Soffit: " + soffitLf.toFixed(0) + " linear ft\n";
            }
            if (fullState.fascia && fullState.fascia.items && fullState.fascia.items.length > 0) {
              const fasciaLf = fullState.fascia.items.reduce((a, i) => a + parseFloat(i.linearFt || 0), 0);
              if (fasciaLf > 0) notes += "Fascia: " + fasciaLf.toFixed(0) + " linear ft\n";
            }
            if (fullState.windows && fullState.windows.length > 0) {
              const totalWin = fullState.windows.reduce((a, w) => a + parseFloat(w.qty || 1), 0);
              notes += "Windows: " + totalWin + " unit(s)\n";
            }
            if (fullState.doors && fullState.doors.length > 0) {
              notes += "Doors: " + fullState.doors.length + " unit(s)\n";
            }
            if (data.pricing) {
              const t = calcGrandTotal(fullState || {});
              if (t.standardTotal > 0) notes += "Contract Total: $" + t.standardTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            params.set("note", notes);
            window.open("https://contacts.google.com/new?" + params.toString(), "_blank");
          }} style={{ width: "100%", background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 10, padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#0369a1", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            📱 Save to Google Contacts
          </button>
          <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", marginTop: 4 }}>Includes date, services, sq ft, and contract total — always pulls current info</div>
        </div>
      )}
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
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
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
  manufacturers: [
    "CWS (Custom Window Systems)",
    "PGT WinGuard",
    "ES Windows",
    "Andersen Windows",
    "Pella Windows",
    "Simonton Windows",
    "Alside Mezzo",
    "Jeld-Wen",
    "MI Windows",
    "Ply Gem / Atrium",
    "Other"
  ],
  seriesByManufacturer: {
    "CWS (Custom Window Systems)": ["StormStrong (Vinyl Impact)", "WindPact (Vinyl Impact)", "WindPact Plus (Vinyl Impact - Energy Star)", "Hurricane Guard (Vinyl Impact)", "ComfortShield (Vinyl Non-Impact)", "Fortify (Vinyl Non-Impact)", "ICON Series (Aluminum Impact)", "Aria (Aluminum Impact)", "Zephyr (Aluminum Impact)", "Epic (Vinyl)"],
    "PGT WinGuard": ["WinGuard Aluminum (Impact)", "WinGuard Vinyl (Impact)", "Sparta (Impact - Budget)", "WinDoor (Impact - Premium)"],
    "Andersen Windows": ["100 Series (Fibrex)", "200 Series", "400 Series", "A-Series", "E-Series"],
    "Pella Windows": ["250 Series (Vinyl)", "350 Series", "Impervia (Fiberglass)", "Reserve (Clad-Wood)", "Architect Series", "Lifestyle Series"],
    "Simonton Windows": ["PassageLine", "Reflections 5500", "StormBreaker Plus (Impact)", "DaylightMax", "ProFinish Brickmould"],
    "Alside Mezzo": ["Mezzo (Standard)", "Mezzo (Triple Pane)", "Sheffield", "UltraMaxx"],
    "Jeld-Wen": ["V-2500 (Vinyl)", "W-2500 (Wood)", "Smooth-Pro (Fiberglass)", "Aurora (Steel)"],
  },
  colorsByManufacturer: {
    "Alside Mezzo": ["White", "Beige", "Classic Clay", "Desert Clay", "Sand Dune", "Castle Gray", "Silver", "Alside Black", "Architectural Bronze", "American Terra", "Hudson Khaki", "English Red", "Forest Green", "Custom Color"],
    "PGT WinGuard": ["White", "Bronze", "Black", "Beige", "Clear Anodized"],
    "CWS (Custom Window Systems)": ["White", "Bronze", "Black", "Tan / Beige", "Gray", "Custom Color"],
    "Simonton Windows": ["White", "Desert Sand", "Bronze", "Tan", "Black"],
    "Pella Windows": ["White", "Brown", "Black", "Custom Color"],
    "default": ["White", "Bronze", "Black", "Tan / Beige", "Gray", "Cream", "Custom Color"],
  },
  glassTintsByManufacturer: {
    "PGT WinGuard": ["Clear", "Bronze Tint", "Gray Tint", "Green Tint", "Solarcool Bronze", "Graylite II"],
    "default": ["Clear", "Lightly Tinted", "Bronze Tint", "Gray Tint"],
  },
  glassPacksByManufacturer: {
    "PGT WinGuard": ["Standard Laminated PVB (Impact)", "PVB-Plus Enhanced (Impact)", "SentryGlas SGP (Impact - Premium)", "Low-E Insulated"],
    "Alside Mezzo": ["ClimaTech Dual Pane Low-E", "ClimaTech PriME (ENERGY STAR Most Efficient)", "ClimaTech Triple Pane Low-E"],
    "Pella Windows": ["InsulShield Low-E (Dual Pane)", "InsulShield Triple Pane", "Between-Glass Blinds", "Low-E with Argon"],
    "CWS (Custom Window Systems)": ["Laminated Impact (Standard)", "Laminated Impact Low-E", "Low-E Non-Impact", "Triple Pane Low-E"],
    "default": ["Low-E Dual Pane (Standard)", "Low-E Triple Pane", "Clear Insulated (IGU)", "Single Pane Clear"],
  },
  frameTypes: ["Vinyl", "Aluminum", "Fiberglass", "Wood-Clad", "Composite"],
  styles: ["Single Hung", "Double Hung", "Sliding / Horizontal Roller", "Casement", "Awning", "Fixed / Picture", "Hopper", "Bay / Bow", "Garden"],
  grids: ["No Grids", "Colonial", "Prairie", "Diamond", "Craftsman", "Double Prairie", "Custom Pattern"],
  impactOptions: ["Impact (Laminated)", "Non-Impact"],
  // Size limits: { minW, maxW, minH, maxH } all in inches
  sizeLimits: {
    "Single Hung": {
      "PGT WinGuard": { minW: 16, maxW: 48, minH: 24, maxH: 72 },
      "CWS (Custom Window Systems)": { minW: 16, maxW: 48, minH: 24, maxH: 72 },
      "Alside Mezzo": { minW: 16, maxW: 48, minH: 24, maxH: 72 },
      "Pella Windows": { minW: 16, maxW: 48, minH: 24, maxH: 96 },
      "Simonton Windows": { minW: 16, maxW: 48, minH: 24, maxH: 72 },
      "Andersen Windows": { minW: 16, maxW: 48, minH: 24, maxH: 72 },
      "Jeld-Wen": { minW: 16, maxW: 48, minH: 24, maxH: 72 },
      "default": { minW: 16, maxW: 48, minH: 24, maxH: 72 },
    },
    "Double Hung": {
      "PGT WinGuard": { minW: 16, maxW: 48, minH: 24, maxH: 72 },
      "Pella Windows": { minW: 16, maxW: 48, minH: 24, maxH: 96 },
      "Alside Mezzo": { minW: 16, maxW: 48, minH: 24, maxH: 72 },
      "default": { minW: 16, maxW: 48, minH: 24, maxH: 72 },
    },
    "Sliding / Horizontal Roller": {
      "PGT WinGuard": { minW: 24, maxW: 96, minH: 24, maxH: 60 },
      "Alside Mezzo": { minW: 24, maxW: 84, minH: 24, maxH: 60 },
      "Pella Windows": { minW: 24, maxW: 84, minH: 24, maxH: 60 },
      "default": { minW: 24, maxW: 84, minH: 24, maxH: 60 },
    },
    "Casement": {
      "Pella Windows": { minW: 14, maxW: 36, minH: 24, maxH: 78 },
      "Andersen Windows": { minW: 14, maxW: 36, minH: 24, maxH: 72 },
      "Jeld-Wen": { minW: 14, maxW: 36, minH: 24, maxH: 78 },
      "Simonton Windows": { minW: 14, maxW: 36, minH: 24, maxH: 72 },
      "default": { minW: 14, maxW: 36, minH: 24, maxH: 78 },
    },
    "Awning": {
      "default": { minW: 24, maxW: 46, minH: 20, maxH: 92 },
    },
    "Fixed / Picture": {
      "PGT WinGuard": { minW: 12, maxW: 96, minH: 12, maxH: 96 },
      "default": { minW: 12, maxW: 96, minH: 12, maxH: 96 },
    },
    "default": { minW: 12, maxW: 96, minH: 12, maxH: 96 },
  },
};

function getWinSizeLimits(manufacturer, style) {
  const styleMap = WIN_OPTS.sizeLimits[style] || WIN_OPTS.sizeLimits["default"];
  if (typeof styleMap === "object" && styleMap.minW !== undefined) return styleMap;
  return styleMap[manufacturer] || styleMap["default"] || { minW: 12, maxW: 96, minH: 12, maxH: 96 };
}

function validateWinSize(manufacturer, style, width, height) {
  if (!width && !height) return null;
  const limits = getWinSizeLimits(manufacturer, style);
  const w = parseFloat(width);
  const h = parseFloat(height);
  const errors = [];
  if (width && w < limits.minW) errors.push("Width " + w + "in is below minimum " + limits.minW + "in");
  if (width && w > limits.maxW) errors.push("Width " + w + "in exceeds maximum " + limits.maxW + "in");
  if (height && h < limits.minH) errors.push("Height " + h + "in is below minimum " + limits.minH + "in");
  if (height && h > limits.maxH) errors.push("Height " + h + "in exceeds maximum " + limits.maxH + "in");
  if (errors.length === 0 && width && height) return { valid: true };
  return errors.length > 0 ? { valid: false, errors } : null;
}

function WindowsStep({ windows, onChange }) {
  const add = () => { const last = windows[windows.length - 1]; onChange([...windows, { ...last, id: uid(), label: "Window " + (windows.length + 1), width: "", height: "", qty: "1", priceInstalled: "", adminPrice: "", standardMarkupPct: "" }]); };
  const remove = (id) => onChange(windows.filter((w) => w.id !== id));
  const update = (id, key, val) => onChange(windows.map((w) => (w.id === id ? { ...w, [key]: val } : w)));

  const Sel = ({ label, field, win, options, highlight }) => (
    <div style={{ flex: 1, minWidth: 150, marginBottom: 10 }}>
      <label style={{ fontSize: 11, color: highlight ? "#0369a1" : "#64748b", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      <select style={{ ...S.input, fontSize: 13, padding: "6px 8px", borderColor: highlight ? "#bae6fd" : undefined }} value={win[field] || ""} onChange={(e) => update(win.id, field, e.target.value)}>
        <option value="">-- Select --</option>{options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Windows</h2>
      <p style={S.stepSub}>Document each window. Pricing is reviewed after all services are complete.</p>
      {windows.map((win) => {
        const series = WIN_OPTS.seriesByManufacturer[win.manufacturer] || null;
        const colors = WIN_OPTS.colorsByManufacturer[win.manufacturer] || WIN_OPTS.colorsByManufacturer["default"];
        const glassPacks = WIN_OPTS.glassPacksByManufacturer[win.manufacturer] || WIN_OPTS.glassPacksByManufacturer["default"];
        const glassTints = WIN_OPTS.glassTintsByManufacturer[win.manufacturer] || WIN_OPTS.glassTintsByManufacturer["default"];
        const sizeCheck = validateWinSize(win.manufacturer, win.style, win.width, win.height);
        const seriesIndicatesImpact = win.series && (win.series.toLowerCase().includes("impact") || win.series.toLowerCase().includes("non-impact"));
        const showImpactToggle = !seriesIndicatesImpact;
        return (
          <div key={win.id} style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 20 }}>🪟</div>
                <input style={{ ...S.input, fontWeight: 700, width: 160, fontSize: 13 }} value={win.label} onChange={(e) => update(win.id, "label", e.target.value)} />
              </div>
              {windows.length > 1 && <button style={S.removeBtn} onClick={() => remove(win.id)}>×</button>}
            </div>

            {/* Manufacturer */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: "#0369a1", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>MANUFACTURER</label>
              <select style={{ ...S.input, fontSize: 13, padding: "6px 8px", borderColor: "#bae6fd" }} value={win.manufacturer || ""} onChange={(e) => update(win.id, "manufacturer", e.target.value)}>
                <option value="">-- Select Manufacturer --</option>
                {WIN_OPTS.manufacturers.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            {/* Series — shown when manufacturer has series */}
            {series && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: "#0369a1", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>SERIES / PRODUCT LINE</label>
                <select style={{ ...S.input, fontSize: 13, padding: "6px 8px", borderColor: "#bae6fd" }} value={win.series || ""} onChange={(e) => update(win.id, "series", e.target.value)}>
                  <option value="">-- Select Series --</option>
                  {series.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            )}

            {win.manufacturer === "Other" && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" }}>MANUFACTURER NAME</label>
                <input style={{ ...S.input, fontSize: 13 }} value={win.manufacturerOther || ""} onChange={(e) => update(win.id, "manufacturerOther", e.target.value)} placeholder="Enter manufacturer name..." />
              </div>
            )}

            {/* Impact / Non-Impact — hidden when series already indicates impact status */}
            {showImpactToggle && (
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: "#0369a1", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>IMPACT / NON-IMPACT</label>
              <div style={{ display: "flex", gap: 8 }}>
                {WIN_OPTS.impactOptions.map(opt => (
                  <div key={opt} onClick={() => update(win.id, "impactOption", opt)} style={{ flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 8, border: "2px solid " + (win.impactOption === opt ? "#0369a1" : "#e2e8f0"), background: win.impactOption === opt ? "#f0f9ff" : "white", cursor: "pointer", fontSize: 12, fontWeight: 700, color: win.impactOption === opt ? "#0369a1" : "#64748b" }}>
                    {opt}
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Style + Frame Type */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Sel label="WINDOW STYLE" field="style" win={win} options={WIN_OPTS.styles} />
              <Sel label="FRAME TYPE" field="frameType" win={win} options={WIN_OPTS.frameTypes} />
            </div>

            {/* Frame Color — manufacturer specific */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>FRAME COLOR</label>
              <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={win.frameColor || ""} onChange={(e) => update(win.id, "frameColor", e.target.value)}>
                <option value="">-- Select --</option>
                {colors.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            {/* Glass Pack — manufacturer specific */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>GLASS PACKAGE</label>
              <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={win.glassPack || ""} onChange={(e) => update(win.id, "glassPack", e.target.value)}>
                <option value="">-- Select --</option>
                {glassPacks.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            {/* Glass Tint */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 150, marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>GLASS TINT</label>
                <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={win.glassTint || ""} onChange={(e) => update(win.id, "glassTint", e.target.value)}>
                  <option value="">-- Select --</option>
                  {glassTints.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 150, marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>GRIDS</label>
                <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={win.grids || ""} onChange={(e) => update(win.id, "grids", e.target.value)}>
                  <option value="">-- Select --</option>
                  {WIN_OPTS.grids.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* Dimensions with size validation */}
            <div style={{ marginBottom: 4 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>DIMENSIONS</label>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Width (in)</label>
                  <input style={{ ...S.input, padding: "6px 8px", fontSize: 13, width: 90, borderColor: sizeCheck && !sizeCheck.valid ? "#ef4444" : sizeCheck && sizeCheck.valid ? "#22c55e" : undefined }} type="number" value={win.width} onChange={(e) => update(win.id, "width", e.target.value)} placeholder="0" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Height (in)</label>
                  <input style={{ ...S.input, padding: "6px 8px", fontSize: 13, width: 90, borderColor: sizeCheck && !sizeCheck.valid ? "#ef4444" : sizeCheck && sizeCheck.valid ? "#22c55e" : undefined }} type="number" value={win.height} onChange={(e) => update(win.id, "height", e.target.value)} placeholder="0" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Qty</label>
                  <input style={{ ...S.input, padding: "6px 8px", fontSize: 13, width: 70 }} type="number" value={win.qty} onChange={(e) => update(win.id, "qty", e.target.value)} placeholder="1" />
                </div>
                {sizeCheck && (
                  <div style={{ display: "flex", alignItems: "center", paddingTop: 22 }}>
                    {sizeCheck.valid
                      ? <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "#16a34a", fontWeight: 700 }}>✓ Size OK</div>
                      : <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "#dc2626", fontWeight: 700 }}>⚠ {sizeCheck.errors.join(" | ")}</div>
                    }
                  </div>
                )}
              </div>
              {win.manufacturer && win.style && (
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
                  {(() => { const l = getWinSizeLimits(win.manufacturer, win.style); return "Size range: W " + l.minW + "in\u2013" + l.maxW + "in \u00d7 H " + l.minH + "in\u2013" + l.maxH + "in"; })()}
                </div>
              )}
            </div>

            {/* Notes */}
            <div style={{ marginTop: 10, marginBottom: 6 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOTES</label>
              <textarea style={{ ...S.input, height: 60, resize: "vertical", fontSize: 13 }} value={win.notes || ""} onChange={(e) => update(win.id, "notes", e.target.value)} placeholder="e.g. egress requirement, special trim, location notes..." />
            </div>
          </div>
        );
      })}
      <button style={S.addBtn} onClick={add}>+ Add Window</button>
    </div>
  );
}

const DOOR_OPTS = {
  doorTypes: ["Sliding Glass Door", "Front Door", "Single French Door", "Double French Door"],
  manufacturersByType: {
    "Sliding Glass Door": ["CWS (Custom Window Systems)", "Pella", "Simonton", "PGT WinGuard", "Other"],
    "Front Door": ["Therma-Tru", "ProVia", "Other"],
    "Single French Door": ["CWS (Custom Window Systems)", "Jeld-Wen", "ProVia", "Therma-Tru", "Other"],
    "Double French Door": ["CWS (Custom Window Systems)", "Jeld-Wen", "ProVia", "Therma-Tru", "Other"],
  },
  seriesByManufacturer: {
    "CWS (Custom Window Systems)": ["WindPact Plus (Vinyl Impact - Sliding)", "ComfortShield (Vinyl Non-Impact - Sliding)", "StormStrong (Vinyl Impact - Sliding)", "WindPact Plus (Vinyl Impact - French)", "ComfortShield (Vinyl Non-Impact - French)", "ICON Series (Aluminum Impact - French)", "Aria (Aluminum Impact - French)"],
    "Therma-Tru": ["Smooth-Star (Fiberglass)", "Fiber-Classic (Fiberglass)", "Classic-Craft (Premium Fiberglass)", "Veris (Modern Aluminum/Fiberglass)", "Smooth-Star Steel"],
    "ProVia": ["Heritage (Fiberglass)", "Signet (Premium Fiberglass)", "Legacy (Steel)", "Embarq (Premium)"],
    "Jeld-Wen": ["Smooth-Pro (Fiberglass)", "W-2500 (Wood)", "Aurora (Steel)", "V-2500 (Vinyl)"],
    "Pella": ["250 Series (Vinyl)", "350 Series", "Impervia (Fiberglass)", "Reserve (Clad-Wood)", "Lifestyle Series"],
    "Simonton": ["PassageLine", "Reflections 5500", "StormBreaker Plus (Impact)", "Contemporary"],
    "PGT WinGuard": ["WinGuard Aluminum (Impact)", "WinGuard Vinyl (Impact)", "WinDoor (Premium Impact)"],
  },
  cwsSlidingConfigs: ["XO (2-panel)", "OX (2-panel)", "OXO (3-panel)", "OXXO (4-panel)", "OOX (3-panel)", "XOO (3-panel)", "OOXXOO (6-panel)"],
  materialsByManufacturer: {
    "CWS (Custom Window Systems)": ["Vinyl", "Aluminum"],
    "Therma-Tru": ["Fiberglass", "Steel"],
    "ProVia": ["Fiberglass", "Steel"],
    "Jeld-Wen": ["Fiberglass", "Steel", "Wood-Clad", "Vinyl"],
    "Pella": ["Vinyl", "Fiberglass", "Wood-Clad"],
    "Simonton": ["Vinyl"],
    "PGT WinGuard": ["Aluminum", "Vinyl"],
    "default": ["Fiberglass", "Steel", "Vinyl", "Wood-Clad"],
  },
  colorsByManufacturer: {
    "CWS (Custom Window Systems)": ["White", "Bronze", "Black", "Tan", "Custom Color"],
    "Therma-Tru": ["White", "Black", "Fiesta Red", "Coastal Blue", "Cypress", "Wicker", "Custom Paint (Any Color)"],
    "ProVia": ["White", "Black (Coal Black)", "Coffee Bean", "Sea Green", "Snow Mist White", "American Cherry Stain", "Custom Color"],
    "Jeld-Wen": ["White", "Black", "Earl Grey", "Warm Toffee", "Primed (Paintable)", "Natural Wood Stain", "Custom Color"],
    "Pella": ["White", "Brown", "Black", "Custom Color"],
    "Simonton": ["White", "Desert Sand", "Bronze", "Tan", "Black"],
    "default": ["White", "Bronze", "Black", "Tan / Beige", "Gray", "Cream", "Custom Color"],
  },
  glassOptions: ["Full Lite (Full Glass)", "3/4 Lite", "1/2 Lite (Half Glass)", "1/4 Lite (Quarter Glass)", "Blinds Between Glass", "Decorative / Art Glass", "Privacy Glass", "No Glass / Solid Panel"],
  impactOptions: ["Impact (Laminated)", "Non-Impact"],
  hardwareFinishes: ["Brushed Nickel", "Oil Rubbed Bronze", "Matte Black", "Satin Brass", "Chrome", "Antique Brass", "Aged Bronze", "Client Supplying Own Hardware"],
  swingDirections: ["Left-Hand Inswing", "Right-Hand Inswing", "Left-Hand Outswing", "Right-Hand Outswing"],
  sidelightPositions: ["Left Side Only", "Right Side Only", "Both Sides"],
  jambMaterials: ["Composite", "Wood-Clad"],
  thresholdFinishes: ["Mill Finish Aluminum (Standard)", "Black Aluminum", "Stainless Steel (Coastal)"],
  // Size limits in inches
  sizeLimits: {
    "Sliding Glass Door": {
      "Pella": { minW: 60, maxW: 144, minH: 78, maxH: 96 },
      "Simonton": { minW: 60, maxW: 120, minH: 78, maxH: 96 },
      "CWS (Custom Window Systems)": { minW: 60, maxW: 120, minH: 78, maxH: 96 },
      "PGT WinGuard": { minW: 60, maxW: 120, minH: 78, maxH: 96 },
      "default": { minW: 60, maxW: 120, minH: 78, maxH: 96 },
    },
    "Front Door": {
      "default": { minW: 30, maxW: 42, minH: 80, maxH: 96 },
    },
    "Single French Door": {
      "default": { minW: 30, maxW: 42, minH: 80, maxH: 96 },
    },
    "Double French Door": {
      "default": { minW: 60, maxW: 84, minH: 80, maxH: 96 },
    },
  },
};

function getDoorSizeLimits(doorType, manufacturer) {
  const typeMap = DOOR_OPTS.sizeLimits[doorType] || {};
  return typeMap[manufacturer] || typeMap["default"] || { minW: 24, maxW: 144, minH: 78, maxH: 96 };
}

function validateDoorSize(doorType, manufacturer, width, height) {
  if (!width && !height) return null;
  const limits = getDoorSizeLimits(doorType, manufacturer);
  const w = parseFloat(width);
  const h = parseFloat(height);
  const errors = [];
  if (width && w < limits.minW) errors.push("Width " + w + "in is below minimum " + limits.minW + "in");
  if (width && w > limits.maxW) errors.push("Width " + w + "in exceeds maximum " + limits.maxW + "in");
  if (height && h < limits.minH) errors.push("Height " + h + "in is below minimum " + limits.minH + "in");
  if (height && h > limits.maxH) errors.push("Height " + h + "in exceeds maximum " + limits.maxH + "in");
  if (errors.length === 0 && width && height) return { valid: true };
  return errors.length > 0 ? { valid: false, errors } : null;
}

function DoorsStep({ doors, onChange }) {
  const add = () => { onChange([...doors, { id: uid(), label: "Door " + (doors.length + 1), doorType: "", manufacturer: "", manufacturerOther: "", series: "", cwsConfig: "", material: "", glassOption: "", impactOption: "", color: "", hardwareFinish: "", swingDirection: "", width: "", height: "", hasSidelights: false, sidelightPosition: "", jambMaterial: "", thresholdFinish: "", notes: "", adminPrice: "", standardMarkupPct: "" }]); };
  const remove = (id) => onChange(doors.filter(d => d.id !== id));
  const update = (id, key, val) => onChange(doors.map(d => d.id === id ? { ...d, [key]: val } : d));

  const Sel = ({ label, field, door, options, highlight }) => (
    React.createElement("div", { style: { marginBottom: 10 } },
      React.createElement("label", { style: { fontSize: 11, color: highlight ? "#0369a1" : "#64748b", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" } }, label),
      React.createElement("select", { style: { ...S.input, fontSize: 13, padding: "6px 8px", borderColor: highlight ? "#bae6fd" : undefined }, value: door[field] || "", onChange: e => update(door.id, field, e.target.value) },
        React.createElement("option", { value: "" }, "-- Select --"),
        options.map(o => React.createElement("option", { key: o }, o))
      )
    )
  );

  const hasSidelightOption = (d) => ["Front Door", "Single French Door", "Double French Door"].includes(d.doorType);

  return (
    React.createElement("div", { style: S.stepWrap },
      React.createElement("h2", { style: S.stepTitle }, "Door Installation"),
      React.createElement("p", { style: S.stepSub }, "Add entry doors, sliding glass doors, and French doors with full specifications."),
      doors.map((door) => {
        const mfrs = door.doorType ? (DOOR_OPTS.manufacturersByType[door.doorType] || ["Other"]) : null;
        const series = door.manufacturer ? (DOOR_OPTS.seriesByManufacturer[door.manufacturer] || null) : null;
        const materials = door.manufacturer ? (DOOR_OPTS.materialsByManufacturer[door.manufacturer] || DOOR_OPTS.materialsByManufacturer["default"]) : DOOR_OPTS.materialsByManufacturer["default"];
        const colors = door.manufacturer ? (DOOR_OPTS.colorsByManufacturer[door.manufacturer] || DOOR_OPTS.colorsByManufacturer["default"]) : DOOR_OPTS.colorsByManufacturer["default"];
        const sizeCheck = validateDoorSize(door.doorType, door.manufacturer, door.width, door.height);
        const limits = door.doorType ? getDoorSizeLimits(door.doorType, door.manufacturer) : null;
        return React.createElement("div", { key: door.id, style: { ...S.card, marginBottom: 16 } },
          // Header
          React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
              React.createElement("div", { style: { fontSize: 20 } }, "🚪"),
              React.createElement("input", { style: { ...S.input, fontWeight: 800, fontSize: 14, width: 160 }, value: door.label, onChange: e => update(door.id, "label", e.target.value) })
            ),
            doors.length > 1 && React.createElement("button", { onClick: () => remove(door.id), style: { background: "none", border: "none", color: "#ef4444", fontSize: 18, cursor: "pointer" } }, "✕")
          ),

          // Door Type
          React.createElement(Sel, { label: "DOOR TYPE", field: "doorType", door, options: DOOR_OPTS.doorTypes, highlight: true }),

          // Manufacturer — filtered by door type
          mfrs && React.createElement(Sel, { label: "MANUFACTURER", field: "manufacturer", door, options: mfrs }),
          door.manufacturer === "Other" && React.createElement("div", { style: { marginBottom: 10 } },
            React.createElement("label", { style: { fontSize: 11, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" } }, "MANUFACTURER NAME"),
            React.createElement("input", { style: { ...S.input, fontSize: 13 }, value: door.manufacturerOther || "", onChange: e => update(door.id, "manufacturerOther", e.target.value), placeholder: "Enter manufacturer..." })
          ),

          // Series
          series && React.createElement(Sel, { label: "SERIES / PRODUCT LINE", field: "series", door, options: series, highlight: true }),

          // CWS Sliding Configuration
          door.manufacturer === "CWS (Custom Window Systems)" && door.doorType === "Sliding Glass Door" && React.createElement("div", { style: { marginBottom: 10 } },
            React.createElement("label", { style: { fontSize: 11, color: "#0369a1", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" } }, "PANEL CONFIGURATION"),
            React.createElement("select", { style: { ...S.input, fontSize: 13, padding: "6px 8px", borderColor: "#bae6fd" }, value: door.cwsConfig || "", onChange: e => update(door.id, "cwsConfig", e.target.value) },
              React.createElement("option", { value: "" }, "-- Select Configuration --"),
              DOOR_OPTS.cwsSlidingConfigs.map(o => React.createElement("option", { key: o }, o))
            )
          ),

          // Material
          React.createElement(Sel, { label: "DOOR MATERIAL", field: "material", door, options: materials }),

          // Impact toggle
          React.createElement("div", { style: { marginBottom: 10 } },
            React.createElement("label", { style: { fontSize: 11, color: "#0369a1", fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" } }, "IMPACT / NON-IMPACT"),
            React.createElement("div", { style: { display: "flex", gap: 8 } },
              DOOR_OPTS.impactOptions.map(opt => React.createElement("div", { key: opt, onClick: () => update(door.id, "impactOption", opt), style: { flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 8, border: "2px solid " + (door.impactOption === opt ? "#0369a1" : "#e2e8f0"), background: door.impactOption === opt ? "#f0f9ff" : "white", cursor: "pointer", fontSize: 12, fontWeight: 700, color: door.impactOption === opt ? "#0369a1" : "#64748b" } }, opt))
            )
          ),

          // Glass + Color + Swing grid
          React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
            React.createElement(Sel, { label: "GLASS OPTION", field: "glassOption", door, options: DOOR_OPTS.glassOptions }),
            React.createElement(Sel, { label: "COLOR", field: "color", door, options: colors }),
            React.createElement(Sel, { label: "SWING DIRECTION", field: "swingDirection", door, options: DOOR_OPTS.swingDirections }),
            React.createElement(Sel, { label: "HARDWARE FINISH", field: "hardwareFinish", door, options: DOOR_OPTS.hardwareFinishes }),
            React.createElement(Sel, { label: "JAMB MATERIAL", field: "jambMaterial", door, options: DOOR_OPTS.jambMaterials }),
            React.createElement(Sel, { label: "THRESHOLD FINISH", field: "thresholdFinish", door, options: DOOR_OPTS.thresholdFinishes }),
          ),

          // Measurements with validation
          React.createElement("div", { style: { marginBottom: 10 } },
            React.createElement("label", { style: { fontSize: 11, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" } }, "DIMENSIONS"),
            React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" } },
              React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } },
                React.createElement("label", { style: { fontSize: 11, color: "#64748b", fontWeight: 600 } }, "Width (in)"),
                React.createElement("input", { style: { ...S.input, padding: "6px 8px", fontSize: 13, width: 90, borderColor: sizeCheck && !sizeCheck.valid ? "#ef4444" : sizeCheck && sizeCheck.valid ? "#22c55e" : undefined }, type: "number", value: door.width || "", onChange: e => update(door.id, "width", e.target.value), placeholder: "e.g. 36" })
              ),
              React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } },
                React.createElement("label", { style: { fontSize: 11, color: "#64748b", fontWeight: 600 } }, "Height (in)"),
                React.createElement("input", { style: { ...S.input, padding: "6px 8px", fontSize: 13, width: 90, borderColor: sizeCheck && !sizeCheck.valid ? "#ef4444" : sizeCheck && sizeCheck.valid ? "#22c55e" : undefined }, type: "number", value: door.height || "", onChange: e => update(door.id, "height", e.target.value), placeholder: "e.g. 80" })
              ),
              sizeCheck && React.createElement("div", { style: { display: "flex", alignItems: "center", paddingTop: 22 } },
                sizeCheck.valid
                  ? React.createElement("div", { style: { background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "#16a34a", fontWeight: 700 } }, "✓ Size OK")
                  : React.createElement("div", { style: { background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "#dc2626", fontWeight: 700 } }, "⚠ " + sizeCheck.errors.join(" | "))
              )
            ),
            limits && React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", marginTop: 4 } }, "Size range: W " + limits.minW + "in\u2013" + limits.maxW + "in \u00d7 H " + limits.minH + "in\u2013" + limits.maxH + "in")
          ),

          // Sidelights
          hasSidelightOption(door) && React.createElement("div", { style: { marginBottom: 10 } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: door.hasSidelights ? 8 : 0, cursor: "pointer" }, onClick: () => update(door.id, "hasSidelights", !door.hasSidelights) },
              React.createElement("div", { style: { position: "relative", width: 38, height: 22, borderRadius: 11, background: door.hasSidelights ? "#0ea5e9" : "#cbd5e1", cursor: "pointer", flexShrink: 0 } },
                React.createElement("div", { style: { position: "absolute", top: 2, left: door.hasSidelights ? 18 : 2, width: 18, height: 18, borderRadius: "50%", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" } })
              ),
              React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: door.hasSidelights ? "#0369a1" : "#64748b" } }, "Includes Sidelights")
            ),
            door.hasSidelights && React.createElement(Sel, { label: "SIDELIGHT POSITION", field: "sidelightPosition", door, options: DOOR_OPTS.sidelightPositions })
          ),

          // Notes
          React.createElement("div", { style: { marginTop: 6 } },
            React.createElement("label", { style: { fontSize: 11, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" } }, "NOTES"),
            React.createElement("textarea", { style: { ...S.input, height: 60, resize: "vertical", fontSize: 13 }, value: door.notes || "", onChange: e => update(door.id, "notes", e.target.value), placeholder: "e.g. remove existing door, demo frame, coastal hardware required..." })
          )
        );
      }),
      React.createElement("button", { style: S.addBtn, onClick: add }, "+ Add Door")
    )
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
        {state.services.includes("doors") && <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: 12, color: "#334155", padding: "2px 0" }}><span>Doors</span><span>{fmt(t.door)}</span></div>}
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
    pricing:  { adminSavingsDiscount: "8.35", monthlyPayment: "", clearanceDays: "14", clearanceBeatPct: "10", standardFinancingAdd: "", daysToBegin: "", daysToComplete: "", sidingStandardMarkupPct: "", soffitStandardMarkupPct: "", fasciaStandardMarkupPct: "", paintStandardMarkupPct: "", windowStandardMarkupPct: "", showClearance: false, ...(state.pricing || {}) },
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

  // Labeled scope items: type "fbc" = Florida Minimum Building Code, "warranty" = Hardie Warranty Requirement
  const FBC = "fbc";
  const WAR = "warranty";
  const scopeMap = {
    siding: { label: sidingLabel + " — Siding Installation", bullets: [
      { type: FBC, text: removalBullet },
      { type: FBC, text: "Inspect and prepare substrate — repair damaged areas as needed" },
      { type: FBC, text: osbBullet },
      { type: FBC, text: "Install continuous weather-resistive barrier (WRB) over entire wall surface" },
      { type: WAR, text: "Tape all WRB seams and penetrations — junction flashing at all openings" },
      { type: FBC, text: "Install metal flashing at all windows, doors, and roof lines" },
      { type: FBC, text: "Install starter strip at base of wall — level and secure" },
      ...usedProducts.map(p => ({ type: FBC, text: "Install " + (prodNameMap[p] || p) + " per manufacturer specifications" })),
      { type: WAR, text: "Stainless steel fasteners — required for coastal regions (Jacksonville)" },
      { type: WAR, text: "Blind nail all siding — no over-driving, no angling, no countersinking" },
      { type: WAR, text: "Install 6-inch metal flashing behind every butt joint — no caulk substitution" },
      { type: WAR, text: "Butt joints staggered minimum 2-bay pattern" },
      { type: WAR, text: "HZ10 product verified for Florida climate zone — wrong zone voids 30-year warranty" },
      { type: WAR, text: "Low-expansion foam insulation ONLY at penetrations — no high-pressure or latex foam" },
      { type: WAR, text: "Primed product must be painted within 180 days — 100% acrylic topcoat required" },
      hasHardie ? { type: FBC, text: "Install HardieTrim at all corners, windows, doors, and eaves" } : { type: FBC, text: "Install trim at all corners, windows, doors, and eaves" },
      hasHardie ? { type: FBC, text: "Final inspection per James Hardie installation requirements" } : { type: FBC, text: "Final inspection per manufacturer installation requirements" },
    ].filter(b => b && b.text), detail: [...state.siding.walls.map(w => {
      const prodName = prodNameMap[w.hardieProduct] || "Siding";
      return (w.location || w.label) + ": " + prodName + (w.sqft ? " — " + w.sqft + " sq ft" : "") + (w.notes ? " (" + w.notes + ")" : "");
    }), "Total: " + state.siding.walls.reduce((a, w) => a + parseFloat(w.sqft || 0), 0).toFixed(0) + " sq ft"] },

    soffit: { label: "Soffit Installation", bullets: [
      { type: FBC, text: "Remove deteriorated soffit panels" },
      { type: WAR, text: "Inspect and repair any damaged framing or substrate before installation" },
      { type: FBC, text: "Install new vented soffit panels" },
      { type: FBC, text: "Install J-channel and F-channel" },
      { type: WAR, text: "Fasteners at both wall and subfascia per FBC R704.2.1" },
      { type: WAR, text: "Intermediate nailer strips installed if soffit span exceeds 12 inches" },
      { type: WAR, text: "Stainless steel fasteners — coastal region requirement" },
      { type: WAR, text: "Seal all cut edges with primer immediately after cutting" },
      { type: WAR, text: "Paint within 180 days — 100% acrylic topcoat required" },
      { type: FBC, text: "Final inspection" },
    ], detail: [...state.soffit.items.map(i => (i.label || "Area") + ": " + (i.newMaterial || "Material TBD") + (i.linearFt ? " — " + i.linearFt + " linear ft" : "") + (i.notes ? " — " + i.notes : "")), "Total: " + state.soffit.items.reduce((a,i) => a + parseFloat(i.linearFt||0), 0).toFixed(0) + " linear ft"] },

    fascia: { label: "Fascia Installation", bullets: [
      { type: FBC, text: "Remove deteriorated fascia boards" },
      { type: WAR, text: "Inspect rafter tails — replace any rotted wood before installation" },
      { type: FBC, text: "Install new fascia material" },
      { type: WAR, text: "Stainless steel finish nails — minimum 2-inch 16-gauge" },
      { type: WAR, text: "Fasteners no closer than ½ inch from edges, 1 inch from ends, max 16 inches o.c." },
      { type: FBC, text: "Caulk all joints and end caps" },
      { type: WAR, text: "Seal all cut edges with primer immediately after cutting" },
      { type: WAR, text: "Paint within 180 days — 100% acrylic topcoat required" },
      { type: FBC, text: "Final inspection" },
    ], detail: [...state.fascia.items.map(i => (i.label || "Area") + ": " + (i.newMaterial || "Material TBD") + (i.linearFt ? " — " + i.linearFt + " linear ft" : "") + (i.notes ? " — " + i.notes : "")), "Total: " + state.fascia.items.reduce((a,i) => a + parseFloat(i.linearFt||0), 0).toFixed(0) + " linear ft"] },

    paint: { label: "Exterior Paint" + (state.paint.paintScope ? " — " + state.paint.paintScope : ""), bullets: [
      { type: FBC, text: "Pressure wash all exterior surfaces" },
      { type: FBC, text: "Fill all cracks and gaps with elastomeric caulk" },
      { type: FBC, text: "Apply paint using four-directional spray method" },
      { type: FBC, text: "Hand-paint all trim and detail areas" },
      { type: FBC, text: "Final walk-through to confirm coverage" },
    ].filter(Boolean), detail: [
      ...state.paint.walls.filter(a => a.paintProduct || a.colorName || a.notes).map(a => "Walls: " + [a.paintProduct, a.colorName, a.notes].filter(Boolean).join(" — ")),
      ...state.paint.trim.filter(a => a.paintProduct || a.colorName || a.notes).map(a => "Trim: " + [a.paintProduct, a.colorName, a.notes].filter(Boolean).join(" — ")),
      ...(state.paint.other || []).filter(a => a.paintProduct || a.colorName || a.notes).map(a => "Other: " + [a.paintProduct, a.colorName, a.notes].filter(Boolean).join(" — ")),
      "Total: " + (parseFloat(state.paint.combinedSqft||0) > 0 ? parseFloat(state.paint.combinedSqft||0).toFixed(0) + " sq ft" : "See details above"),
    ] },

    windows: { label: "Window Installation", bullets: [
      { type: FBC, text: "Pull permit — Florida Product Approval (FL#) verified for each product" },
      { type: FBC, text: "Remove existing window unit" },
      { type: FBC, text: "Prepare rough opening — inspect framing, repair as needed" },
      { type: FBC, text: "Flash head, jambs, and sill per FBC R703.4 — integrated with WRB" },
      { type: WAR, text: "Dry fit window — verify level, plumb, and square before anchoring" },
      { type: WAR, text: "Shim at every anchor point — maximum 1/4-inch shim gap" },
      { type: FBC, text: "Install new unit per product-specific NOA anchor pattern" },
      { type: WAR, text: "Anchor spacing and embedment depth per NOA — not field judgment" },
      { type: FBC, text: "Air seal gaps with low-expansion foam only — never high-pressure foam" },
      { type: FBC, text: "Perimeter sealant per AAMA 800 / ASTM C920 — all joints sealed" },
      { type: WAR, text: "Manufacturer warranty label left on glass until final inspection" },
      { type: WAR, text: "Genuine manufacturer-approved accessories only — third-party parts void warranty" },
      { type: FBC, text: "Install exterior casing and trim" },
      { type: FBC, text: "Final inspection — product approval verified, operation and egress confirmed, permit closed" },
      { type: WAR, text: "Wind mitigation documentation provided — qualifies for insurance discount" },
    ], detail: state.windows.map(w => (w.label || "Window") + ": " + [w.manufacturer === "Other" ? w.manufacturerOther || "Other" : w.manufacturer, w.series, w.impactOption, w.style, w.glassPack, w.glassTint && w.glassTint !== "Clear" ? w.glassTint : null, w.frameColor, w.width && w.height ? w.width + "x" + w.height : null, "qty " + (w.qty || 1), w.notes].filter(Boolean).join(" — ")) },

    doors: { label: "Door Installation", bullets: [
      { type: FBC, text: "Pull permit — Florida Product Approval (FL#) verified" },
      { type: FBC, text: "Remove and dispose of existing door unit" },
      { type: FBC, text: "Prepare rough opening — shim and level" },
      { type: WAR, text: "Inspect and repair rough opening framing before installation" },
      { type: FBC, text: "Install new door unit per manufacturer specifications" },
      { type: WAR, text: "Anchor spacing per product NOA — shim at all anchor points" },
      { type: WAR, text: "Continuous perimeter sealant — no gaps, per AAMA 800 / ASTM C920" },
      { type: FBC, text: "Install weather stripping and threshold" },
      { type: FBC, text: "Caulk and seal all exterior gaps" },
      { type: WAR, text: "Low-expansion foam only at gaps — never high-pressure foam" },
      { type: FBC, text: "Install hardware and adjust for proper operation" },
      { type: FBC, text: "Final inspection" },
    ], detail: (state.doors||[]).map(d => (d.label||"Door") + ": " + [d.doorType, d.manufacturer==="Other"?d.manufacturerOther:d.manufacturer, d.series, d.cwsConfig?"Config: "+d.cwsConfig:null, d.material, d.impactOption, d.glassOption, d.swingDirection, d.width&&d.height?d.width+"x"+d.height:null, d.hasSidelights?"Sidelights: "+d.sidelightPosition:null, d.hardwareFinish==="Client Supplying Own Hardware"?"Client Supplying Hardware":d.hardwareFinish, d.jambMaterial?"Jamb: "+d.jambMaterial:null, d.notes].filter(Boolean).join(" — ")) },

    misc: { label: "Additional Items", bullets: state.misc.items.filter(i => i.description).map(i => ({ type: FBC, text: i.description + (i.notes ? " — " + i.notes : "") })), detail: [] },
  };

  const proposalVer = state.proposalVersion || 1;
  let body = `<div class='hdr'><div><div style='font-size:20px;font-weight:800;line-height:1.2'>${state.company.name}</div><div style='color:#64748b;font-size:11px;margin-top:4px'>${state.company.address}</div><div style='color:#64748b;font-size:11px'>${state.company.phone} · Lic# ${state.company.license}</div></div><div style='text-align:right'><div style='font-size:9.5px;font-weight:800;color:#0ea5e9;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px'>Prepared For</div><div style='font-size:18px;font-weight:800'>${state.customer.name || "—"}</div><div style='color:#64748b;font-size:11px;margin-top:4px'>${state.customer.address || ""}</div><div style='color:#64748b;font-size:11px'>${state.customer.phone || ""}</div><div style='color:#94a3b8;font-size:10px;margin-top:4px'>${today} &nbsp;·&nbsp; Valid 30 Days</div><div style='display:inline-block;background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:2px 8px;font-size:9px;font-weight:800;color:#0369a1;margin-top:4px'>Version ${proposalVer}</div></div></div>`;

  if (state.customer.photo) {
    body += `<div class='sec'><div class='lbl'>Property</div><img src='${state.customer.photo}' style='max-width:100%;max-height:220px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0'/></div>`;
  }

  const SERVICE_ORDER = ["siding", "soffit", "fascia", "paint", "windows", "doors", "misc"];
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
    body += `<div class='sec'><div class='lbl'>${info.label} — Scope of Work</div>`;
    const warrantyLabel = ["windows", "doors"].includes(svc) ? "⭐ Manufacturer Warranty Requirement" : "⭐ Hardie Warranty Requirement";
    body += `<div style='display:flex;gap:12px;margin-bottom:8px;flex-wrap:wrap'>`;
    body += `<div style='display:flex;align-items:center;gap:4px;font-size:9px;font-weight:700;color:#0369a1'><span style='background:#dbeafe;border:1px solid #93c5fd;border-radius:10px;padding:2px 7px;color:#1d4ed8'>🏛️ Florida Minimum Building Code</span></div>`;
    body += `<div style='display:flex;align-items:center;gap:4px;font-size:9px;font-weight:700'><span style='background:#dcfce7;border:1px solid #86efac;border-radius:10px;padding:2px 7px;color:#166534'>${warrantyLabel}</span></div>`;
    body += `</div>`;
    body += `<div style='border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:12px'>`;
    info.bullets.forEach((b, i) => {
      const isFbc = !b.type || b.type === "fbc";
      const text = b.text || b;
      const warrantBadgeLabel = ["windows", "doors"].includes(svc) ? "⭐ Mfr. Warranty" : "⭐ Warranty";
      const badge = isFbc
        ? `<span style='display:inline-block;background:#dbeafe;border:1px solid #93c5fd;border-radius:10px;padding:1px 7px;font-size:8px;font-weight:800;color:#1d4ed8;white-space:nowrap;margin-right:6px;flex-shrink:0'>🏛️ FL Min</span>`
        : `<span style='display:inline-block;background:#dcfce7;border:1px solid #86efac;border-radius:10px;padding:1px 7px;font-size:8px;font-weight:800;color:#166534;white-space:nowrap;margin-right:6px;flex-shrink:0'>${warrantBadgeLabel}</span>`;
      body += `<div style='padding:7px 12px;font-size:11px;color:#334155;line-height:1.6;background:${i % 2 === 0 ? "white" : "#f8fafc"};border-bottom:1px solid #f1f5f9;display:flex;align-items:flex-start'>${badge}<span>${text}</span></div>`;
    });
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

      // Siding product info
      const sidingProdMap = { lap: "HardiePlank Lap", panel: "HardiePanel", shake: "HardieShingle Shake", vinyl: "Vinyl Siding", lp: "LP SmartSide", wood: "Wood / Cedar", stucco: "Stucco", t111: "T1-11", other: "Siding" };
      const usedSidingProds = [...new Set(state.siding.walls.map(w => w.hardieProduct).filter(Boolean))];
      const isHardie = usedSidingProds.every(p => ["lap","panel","shake"].includes(p));
      const hasHardieProd = usedSidingProds.some(p => ["lap","panel","shake"].includes(p));
      const osbWalls = state.siding.walls.filter(w => w.osbSheathing && w.osbSheathing.includes("Yes"));
      const osbSqft = osbWalls.reduce((a, w) => a + parseFloat(w.sqft || 0), 0);

      let mats = [];
      if (svc === "siding" && totalSqFt > 0) {
        const sqftWaste = Math.ceil(totalSqFt * 1.10);
        // Siding panels — one row per unique product
        usedSidingProds.forEach(p => {
          const wallsWithProd = state.siding.walls.filter(w => w.hardieProduct === p);
          const prodSqFt = wallsWithProd.reduce((a, w) => a + parseFloat(w.sqft || 0), 0);
          const prodSqFtWaste = Math.ceil(prodSqFt * 1.10);
          mats.push([(sidingProdMap[p] || "Siding") + " panels", prodSqFtWaste + " sq ft", prodSqFt.toFixed(0) + " sq ft + 10% waste"]);
        });
        // WRB — all siding types need it
        mats.push(["House Wrap / WRB", Math.ceil(totalSqFt * 1.15) + " sq ft", "Full wall coverage + 15% seam overlap"]);
        mats.push(["WRB Seam Tape", Math.ceil(totalSqFt / 1000) + " roll(s)", "All seams and penetrations"]);
        // Trim — Hardie-specific vs generic
        if (hasHardieProd) {
          mats.push(["HardieTrim — Corners", "Measure on site", "All exterior corners"]);
          mats.push(["HardieTrim — Windows & Doors", "Measure on site", "All opening surrounds"]);
          mats.push(["HardieTrim — Eave Termination", "Measure on site", "Eave line"]);
        } else {
          mats.push(["Corner Trim", "Measure on site", "All exterior corners"]);
          mats.push(["Window & Door Trim", "Measure on site", "All opening surrounds"]);
          mats.push(["Eave Trim", "Measure on site", "Eave line"]);
        }
        mats.push(["Metal Drip Cap / Head Flashing", "Measure on site", "Above all windows and doors"]);
        mats.push(["Step Flashing", "Measure on site", "All roof-wall intersections"]);
        mats.push(["Metal Starter Strip", "Measure on site", "Base of each wall"]);
        // Fasteners — Hardie vs generic
        if (hasHardieProd) {
          mats.push(["Hot-Dipped Galvanized Nails 6d/8d", Math.ceil(totalSqFt / 100) + " lb(s)", "Corrosion-resistant — per Hardie fastener spec"]);
        } else {
          mats.push(["Corrosion-Resistant Fasteners", Math.ceil(totalSqFt / 100) + " lb(s)", "Per manufacturer specification"]);
        }
        mats.push(["Paintable Elastomeric Caulk", Math.ceil(totalSqFt / 150) + " tube(s)", "All trim joints, penetrations, transitions"]);
        mats.push(["Exterior Primer", Math.ceil(totalSqFt / 350) + " gal", "Applied to all cut ends and bare surfaces"]);
        mats.push(["Exterior Paint", Math.ceil(totalSqFt / 350) * 2 + " gal", "Four-directional spray method"]);
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
        if (svc === "siding") body += `<p class='note'>* ${hasHardieProd ? "All James Hardie products installed per HardieZone requirements. " : ""}Quantities include standard waste factors and are subject to field verification.</p>`;
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
      // Investment Breakdown above cards
      body += `<div style='background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 18px;margin-bottom:16px'>`;
      body += `<div style='font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px'>Investment Breakdown</div>`;
      if (state.services.includes("siding"))  body += `<div style='display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:11px'><span style='color:#334155'>James Hardie Siding</span><span style='font-weight:700;color:#0f172a'>${fmt(tLocal.sidStd)}</span></div>`;
      if (state.services.includes("soffit"))  body += `<div style='display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:11px'><span style='color:#334155'>Soffit Installation</span><span style='font-weight:700;color:#0f172a'>${fmt(tLocal.sofStd)}</span></div>`;
      if (state.services.includes("fascia"))  body += `<div style='display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:11px'><span style='color:#334155'>Fascia Installation</span><span style='font-weight:700;color:#0f172a'>${fmt(tLocal.fasStd)}</span></div>`;
      if (state.services.includes("paint"))   body += `<div style='display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:11px'><span style='color:#334155'>Exterior Paint</span><span style='font-weight:700;color:#0f172a'>${fmt(tLocal.pntStandard)}</span></div>`;
      if (state.services.includes("windows")) body += `<div style='display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:11px'><span style='color:#334155'>Window Installation</span><span style='font-weight:700;color:#0f172a'>${fmt(tLocal.winStd)}</span></div>`;
      if (state.services.includes("doors"))   body += `<div style='display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:11px'><span style='color:#334155'>Door Installation</span><span style='font-weight:700;color:#0f172a'>${fmt(tLocal.doorStd)}</span></div>`;
      if (state.services.includes("misc"))    body += `<div style='display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:11px'><span style='color:#334155'>Miscellaneous</span><span style='font-weight:700;color:#0f172a'>${fmt(tLocal.msc)}</span></div>`;
      body += `<div style='display:flex;justify-content:space-between;padding:8px 0 0;font-size:13px'><span style='font-weight:800;color:#0f172a'>Standard Total</span><span style='font-weight:800;color:#0f172a'>${fmt(tLocal.standardTotal)}</span></div>`;
      body += `</div>`;
      body += `<div class='opt ${selectedOption === "standard" ? "sel" : ""}' onclick="window.parent.postMessage({type:'selectOption',option:'standard'},'*')"><div style='display:flex;justify-content:space-between;align-items:center'><div style='display:flex;align-items:center'><div class='radio ${selectedOption === "standard" ? "on" : ""}'>${selectedOption === "standard" ? "<div class='dot'></div>" : ""}</div><div><div style='font-weight:800;font-size:14px;color:#0f172a'>Standard Pricing</div><div style='font-size:10px;color:#64748b;font-weight:600;margin-top:2px'>Email proposal — no contract today</div></div></div><div style='text-align:right'><div style='font-size:24px;font-weight:800;color:#334155'>${fmt(standard)}</div>${standardMonthly ? "<div style='font-size:12px;color:#64748b;font-weight:600;margin-top:2px'>Financing: $" + standardMonthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "/mo</div>" : ""}</div></div><div style='font-size:12px;font-weight:800;color:#0f172a;line-height:1.7;margin-top:10px;padding-top:10px;border-top:1px solid #f1f5f9'>Standard pricing includes built-in allowances for follow-up visits, site re-assessments, and extended coordination overhead.</div></div>`;
      const savings = standard - priority;
      body += `<div class='opt' onclick="window.parent.postMessage({type:'selectOption',option:'priority'},'*')" style='background:#f0fdf4;border:2px solid ${selectedOption === "priority" ? "#16a34a" : "#86efac"};cursor:pointer'><div style='display:flex;align-items:center;gap:10px;margin-bottom:8px'><div style='width:22px;height:22px;border-radius:50%;border:2px solid ${selectedOption === "priority" ? "#16a34a" : "#86efac"};background:${selectedOption === "priority" ? "#16a34a" : "white"};display:flex;align-items:center;justify-content:center;flex-shrink:0'>${selectedOption === "priority" ? "<div style='width:8px;height:8px;border-radius:50%;background:white'></div>" : ""}</div><div style='font-weight:800;font-size:14px;color:#0f172a'>Direct-Commitment Savings — Ability to Finalize the Project Today</div></div>${selectedOption === "priority" ? "<div style='display:flex;align-items:baseline;gap:12px;margin-bottom:4px'><div style='font-size:30px;font-weight:800;color:#16a34a'>" + fmt(priority) + "</div><div style='background:#dcfce7;color:#166534;font-size:11px;font-weight:800;padding:3px 10px;border-radius:20px;border:1px solid #86efac'>You save " + fmt(savings) + "</div></div>" + (standardMonthly ? "<div style='font-size:11px;color:#166534;font-weight:600;margin-top:4px'>Financing Available: $" + monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "/mo</div>" : "") : "<div style='display:flex;justify-content:space-between;align-items:center;margin-top:8px'><div style='font-size:12px;font-weight:800;color:#0f172a;line-height:1.7;max-width:55%'>An opportunity to lower the investment for clients with the ability to finalize today</div><div style='display:flex;flex-direction:column;align-items:center;background:#dcfce7;border:2px solid #16a34a;border-radius:12px;padding:8px 16px;min-width:110px'><div style='font-size:10px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:0.5px'>You Save</div><div style='font-size:26px;font-weight:900;color:#16a34a;line-height:1.1'>" + fmt(savings) + "</div></div></div>"}</div>`;
      if (state.pricing && state.pricing.showClearance) {
        body += `<div class='opt ${selectedOption === "clearance" ? "sel" : ""}' onclick="window.parent.postMessage({type:'selectOption',option:'clearance'},'*')" style='border-color:${selectedOption === "clearance" ? "#f59e0b" : "#e2e8f0"};background:${selectedOption === "clearance" ? "#fffbeb" : "white"}'><div style='display:flex;align-items:center;gap:10px'><div class='radio' style='border-color:${selectedOption === "clearance" ? "#f59e0b" : "#cbd5e1"};background:${selectedOption === "clearance" ? "#f59e0b" : "white"};flex-shrink:0'>${selectedOption === "clearance" ? "<div class='dot'></div>" : ""}</div><div style='font-weight:800;font-size:14px;color:#0f172a'>Administrative Clearance</div></div>${selectedOption === "clearance" ? "<div style='margin-top:8px;font-size:11px;color:#92400e;font-weight:700;text-align:center'>Administrative Clearance Selected</div>" : ""}</div>`;
      }
    } else {
      if (selectedOption === "priority") {
        body += `<div class='row' style='font-size:13px'><span style='font-weight:700;color:#0369a1'>Direct-Commitment Savings</span><span style='font-weight:800;color:#0ea5e9'>${fmt(priority)}</span></div><div style='background:#dcfce7;color:#166534;border-radius:8px;padding:8px 14px;margin-top:6px;font-size:11px;font-weight:700'>You save ${fmt(standard - priority)}</div>`;
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
    body += `<div class='sec' style='border:2px solid #0f172a;border-radius:10px;padding:0;overflow:hidden;margin-bottom:16px'>`;
    body += `<div style='background:#0f172a;padding:12px 16px;display:flex;align-items:center;gap:10px'>`;
    body += `<div style='font-size:18px'>🏛️</div>`;
    body += `<div style='color:white;font-size:13px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase'>Permit &amp; Code Compliance</div>`;
    body += `</div>`;
    body += `<div style='padding:16px;background:white'>`;
    body += `<div style='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px'>`;

    const complianceBadges = [
      { icon: "✅", title: "Permit Pulled by NDC", desc: "New Direction Construction pulls all required permits. Clients are never responsible for permitting." },
      { icon: "📋", title: "Florida Building Code 8th Edition", desc: "All work performed in full compliance with the 2023 FBC 8th Edition, effective December 31, 2023." },
      { icon: "🔍", title: "Florida Product Approval", desc: "All products carry valid Florida Product Approval numbers. Documentation provided upon request." },
      { icon: "🏗️", title: "Final Inspection Coordinated by NDC", desc: "NDC schedules and coordinates all required post-installation inspections with the local building department." },
      { icon: "🌊", title: "Water-Resistive Barrier (WRB)", desc: "All siding installations include a properly installed WRB with penetration and junction flashing per FBC requirements." },
      { icon: "💨", title: "Wind Load Compliance", desc: "All fenestration products meet or exceed Design Pressure ratings for the project location per ASCE 7-22 wind load criteria." },
    ];

    complianceBadges.forEach(b => {
      body += `<div style='border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;background:#f8fafc'>`;
      body += `<div style='display:flex;align-items:center;gap:6px;margin-bottom:4px'>`;
      body += `<span style='font-size:14px'>${b.icon}</span>`;
      body += `<span style='font-size:10.5px;font-weight:800;color:#0f172a'>${b.title}</span>`;
      body += `</div>`;
      body += `<div style='font-size:9.5px;color:#475569;line-height:1.6'>${b.desc}</div>`;
      body += `</div>`;
    });

    body += `</div>`;
    body += `<div style='background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:10px 14px;font-size:9.5px;color:#0369a1;line-height:1.7'>`;
    body += `<strong>Jurisdiction Notice:</strong> This project falls under the jurisdiction of `;

    const county = (state.customer && state.customer.county) ? state.customer.county : "the applicable Florida county";
    body += `${county} Building Department. All work is subject to local building department review, approval, and inspection. `;
    body += `Permit fees, where applicable, are included in the project investment. `;
    body += `<strong>Note:</strong> The Florida Building Code 9th Edition takes effect December 31, 2026. Projects permitted after that date will comply with the updated edition.`;
    body += `</div>`;
    body += `</div></div>`;

    body += `<div class='sec' style='border:1.5px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin-bottom:16px;display:flex;align-items:center;gap:20px;background:#f8fafc'>`;
    body += `<div style='flex-shrink:0;text-align:center'>`;
    body += `<img src='https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(GOOGLE_REVIEW_URL)}' style='width:90px;height:90px;border-radius:6px;border:1px solid #e2e8f0;display:block;margin:0 auto 4px'/>`;
    body += `<div style='font-size:8px;color:#64748b;font-weight:600'>Scan to Review</div>`;
    body += `</div>`;
    body += `<div style='flex:1'>`;
    body += `<div style='font-size:13px;font-weight:800;color:#0f172a;margin-bottom:4px'>Enjoyed Working With NDC?</div>`;
    body += `<div style='font-size:11px;color:#475569;line-height:1.7;margin-bottom:6px'>We'd love to hear about your experience. Your review helps other homeowners in Jacksonville make confident decisions about their home improvement projects.</div>`;
    body += `<div style='font-size:10px;color:#0369a1;font-weight:700'>&#11088; Scan the QR code or visit: new-direction-construction.com</div>`;
    body += `</div></div>`;

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
  const [loanMonths, setLoanMonths] = useState("");
  const [loanRate, setLoanRate] = useState("10.99");
  const [showCalc, setShowCalc] = useState(false);

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
          {state.services.includes("doors")    && <button onClick={() => setStep(steps.findIndex(s => s.key === "doors"))}    style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Edit Doors</button>}
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
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0369a1" }}>{selectedOption === "priority" ? "Direct-Commitment Savings" : selectedOption === "clearance" ? "Administrative Clearance" : "Standard Pricing"}</span>
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
                { key: "priority", label: "Direct-Commitment Savings", color: "#0369a1", total: priority },
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
                      const adminMonthly = state.pricing && state.pricing.monthlyPayment ? parseFloat(state.pricing.monthlyPayment) : null;
                      const stdAdd = state.pricing && state.pricing.standardFinancingAdd ? parseFloat(state.pricing.standardFinancingAdd) : 0;
                      const applicableMonthly = selectedOption === "standard" && adminMonthly ? adminMonthly + stdAdd : adminMonthly;
                      return <>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #f0f9ff" }}><span style={{ fontSize: 11, color: "#475569" }}>Total job cost</span><span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{fmt(chosenTotal)}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #f0f9ff", background: "#f0f9ff" }}><span style={{ fontSize: 11, color: "#0369a1", fontWeight: 600 }}>Financed ({financingPct}%)</span><span style={{ fontSize: 13, fontWeight: 800, color: "#0369a1" }}>{fmt(chosenTotal * financingPct / 100)}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: applicableMonthly ? "1px solid #f0f9ff" : "none" }}><span style={{ fontSize: 11, color: "#475569" }}>Due out of pocket ({100 - financingPct}%)</span><span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{fmt(chosenTotal * (100 - financingPct) / 100)}</span></div>
                        {applicableMonthly ? <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#ecfdf5", borderTop: "1px solid #bbf7d0" }}><span style={{ fontSize: 11, color: "#166534", fontWeight: 700 }}>Est. Monthly Payment</span><span style={{ fontSize: 18, fontWeight: 800, color: "#166534" }}>${applicableMonthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span style={{ fontSize: 11, fontWeight: 600, color: "#6ee7b7" }}>/mo*</span></span></div> : null}
                        {applicableMonthly ? <div style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic", padding: "4px 12px 8px" }}>* Approx. — based on credit &amp; DTI</div> : null}
                      </>;
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Loan Calculator */}
            <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: 16, marginBottom: 12 }}>
              <div onClick={() => setShowCalc(c => !c)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 20 }}>🧮</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Financing Calculator</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Estimate monthly payment for client</div>
                  </div>
                </div>
                <div style={{ fontSize: 18, color: "#94a3b8", fontWeight: 700 }}>{showCalc ? "▲" : "▼"}</div>
              </div>
              {showCalc && (() => {
                const calcBase = selectedOption === "standard" ? t.standardTotal : t.total;
                const loanAmt = calcBase > 0 ? calcBase : 0;
                const months = parseInt(loanMonths) || 0;
                const rate = parseFloat(loanRate) || 0;
                const monthlyRate = rate / 100 / 12;
                const monthly = months > 0 && monthlyRate > 0
                  ? loanAmt * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1)
                  : months > 0 ? loanAmt / months : 0;
                const totalPaid = monthly * months;
                const totalInterest = totalPaid - loanAmt;
                return (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Loan Amount</div>
                        <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{fmt(loanAmt)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Duration (Months)</div>
                        <input type="number" value={loanMonths} onChange={e => setLoanMonths(e.target.value)} placeholder="e.g. 120" style={{ width: "100%", boxSizing: "border-box", background: "white", border: "1.5px solid #bae6fd", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontWeight: 700, color: "#0f172a", outline: "none" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Interest Rate (%)</div>
                        <input type="number" step="0.01" value={loanRate} onChange={e => setLoanRate(e.target.value)} placeholder="10.99" style={{ width: "100%", boxSizing: "border-box", background: "white", border: "1.5px solid #bae6fd", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontWeight: 700, color: "#0f172a", outline: "none" }} />
                      </div>
                    </div>
                    {monthly > 0 && (
                      <div style={{ background: "#f0fdf4", border: "2px solid #86efac", borderRadius: 10, padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#166534" }}>Est. Monthly Payment</div>
                          <div style={{ fontSize: 28, fontWeight: 800, color: "#16a34a" }}>${monthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span style={{ fontSize: 13, color: "#6ee7b7", fontWeight: 600 }}>/mo</span></div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid #bbf7d0" }}>
                          <span style={{ fontSize: 11, color: "#166534" }}>Total paid over {months} months</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#166534" }}>{fmt(totalPaid)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                          <span style={{ fontSize: 11, color: "#166534" }}>Total interest</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#166534" }}>{fmt(totalInterest)}</span>
                        </div>
                        <div style={{ fontSize: 10, color: "#6ee7b7", fontStyle: "italic", marginTop: 4 }}>* Estimate only — subject to credit approval and lender terms</div>
                      </div>
                    )}
                  </div>
                );
              })()}
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
                const ver = state.proposalVersion || 1;
                const fileName = "NDC_Proposal_" + clientName + "_" + dateStr + "_v" + ver;
                const newWin = window.open("", "_blank");
                if (newWin) { newWin.document.write(pdfHtml); newWin.document.close(); newWin.document.title = fileName; setTimeout(() => { newWin.focus(); newWin.print(); }, 800); }
                setState(s => ({ ...s, proposalVersion: (s.proposalVersion || 1) + 1 }));
                // Save to Google Drive
                try {
                  fetch("/api/drive?action=saveFile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName, htmlContent: pdfHtml, type: "proposal" }) });
                } catch(e) { console.warn("Drive file save failed:", e); }
              }}>
                Save / Print PDF {state.proposalVersion > 1 ? "(v" + state.proposalVersion + ")" : ""}
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
  const [showReviewPopup, setShowReviewPopup] = useState(false);

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
          const contractFileName = "NDC_Contract_" + clientName + "_" + dateStr;
          const sigBlock2 = `<div style='padding:20px;border-top:2px solid #0f172a;margin-top:8px'><div style='font-size:9.5px;font-weight:800;color:#0ea5e9;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px'>Client Signature</div>${sigDataUrl ? `<img src='${sigDataUrl}' style='width:100%;max-width:420px;height:90px;object-fit:contain;border:1px solid #e2e8f0;border-radius:6px;background:#f8fafc;display:block;margin-bottom:8px'/>` : `<div style='border:1px solid #e2e8f0;border-radius:6px;background:#f8fafc;height:90px;margin-bottom:8px'></div>`}<div style='display:flex;justify-content:space-between;font-size:10px;color:#64748b;border-top:1.5px solid #0f172a;padding-top:6px'><span>${state.customer.name || "Client"} &nbsp;&nbsp; Date: ${today}</span><span>NDC Rep: ${repName} &nbsp;&nbsp; Date: ${today}</span></div></div>`;
          const reviewBlock2 = `<div style='margin-top:20px;border:1.5px solid #e2e8f0;border-radius:10px;padding:14px 16px;display:flex;align-items:center;gap:16px;background:#f8fafc'><div style='flex-shrink:0;text-align:center'><img src='https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(GOOGLE_REVIEW_URL)}' style='width:80px;height:80px;border-radius:6px;border:1px solid #e2e8f0;display:block;margin:0 auto 3px'/><div style='font-size:8px;color:#64748b;font-weight:600'>Scan to Review</div></div><div style='flex:1'><div style='font-size:12px;font-weight:800;color:#0f172a;margin-bottom:3px'>Thank You for Choosing NDC!</div><div style='font-size:10px;color:#475569;line-height:1.6'>We'd love to hear about your experience.</div></div></div>`;
          const pdfWithSig = contractPdfHtml.replace("</body>", sigBlock2 + reviewBlock2 + "</body>");
          const newWin = window.open("", "_blank");
          if (newWin) { newWin.document.write(pdfWithSig); newWin.document.close(); newWin.document.title = contractFileName; setTimeout(() => { newWin.focus(); newWin.print(); }, 800); }
          setTimeout(() => setShowReviewPopup(true), 1200);
          try { fetch("/api/drive?action=saveFile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: contractFileName, htmlContent: pdfWithSig, type: "contract" }) }); } catch(e) {}
          // Trigger CRM popup
          setTimeout(() => {
            const t = calcGrandTotal(state);
            const contractAmt = selectedOption === "standard" ? (t.standardTotal || t.total) : t.total;
            setCrmPopupData({
              clientName: state.customer.name || "",
              address: state.customer.address || "",
              phone: state.customer.phone || "",
              email: state.customer.email || "",
              services: (state.services || []).join(", "),
              contractAmount: contractAmt,
            });
            setShowCRMPopup(true);
          }, 3000);
        }}>
          🖨️ Save / Print Contract PDF
        </button>
      </div>

      {/* Google Review Popup */}
      {showReviewPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, maxWidth: 360, width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Thank You, {state.customer.name ? state.customer.name.split(" ")[0] : ""}!</div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, marginBottom: 20 }}>We truly appreciate your business. Would you take 60 seconds to share your experience on Google? It means the world to us.</div>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(GOOGLE_REVIEW_URL)}`} style={{ width: 140, height: 140, borderRadius: 10, border: "1px solid #e2e8f0", display: "block", margin: "0 auto 16px" }} alt="Review QR" />
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 20 }}>Scan with your phone camera to leave a review</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { window.open(GOOGLE_REVIEW_URL, "_blank"); setShowReviewPopup(false); }} style={{ flex: 1, background: "#F07B21", color: "white", border: "none", borderRadius: 10, padding: "12px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Leave a Review ⭐
              </button>
              <button onClick={() => setShowReviewPopup(false)} style={{ flex: 1, background: "white", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

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
  if (services.includes("doors"))   steps.push({ key: "doors",    label: "Doors"    });
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
function CRMPopup({ crmPopupData, saveCRMRecord, setShowCRMPopup, setCrmPopupData }) {
  const [outcome, setOutcome] = React.useState("sold");
  const [lossReason, setLossReason] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const contractAmt = crmPopupData.contractAmount || 0;
  const commission = (contractAmt * 0.10).toFixed(2);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, padding: 24, maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>📋 Save to CRM</div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Track this client in your sales records</div>
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{crmPopupData.clientName}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>{crmPopupData.address}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>{crmPopupData.services}</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Outcome</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["sold", "✅ Sold", "#16a34a", "#f0fdf4"], ["not_sold", "❌ Not Sold", "#dc2626", "#fef2f2"], ["follow_up", "🔄 Follow Up", "#0369a1", "#f0f9ff"]].map(([val, label, color, bg]) => (
              <div key={val} onClick={() => setOutcome(val)} style={{ flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 8, border: "2px solid " + (outcome === val ? color : "#e2e8f0"), background: outcome === val ? bg : "white", cursor: "pointer", fontSize: 11, fontWeight: 700, color: outcome === val ? color : "#64748b" }}>{label}</div>
            ))}
          </div>
        </div>
        {outcome === "sold" && (
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: 12, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#166534" }}>Contract Amount</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#16a34a" }}>${parseFloat(contractAmt).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#166534" }}>Commission (10%)</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#16a34a" }}>${commission}</span>
            </div>
          </div>
        )}
        {outcome === "not_sold" && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Loss Reason</div>
            <select value={lossReason} onChange={e => setLossReason(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13 }}>
              <option value="">-- Select reason --</option>
              <option>Price too high</option>
              <option>Went with competitor</option>
              <option>Needs to think about it</option>
              <option>Financing did not go through</option>
              <option>Homeowner not ready</option>
              <option>No decision maker present</option>
              <option>Other</option>
            </select>
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Notes</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes..." style={{ width: "100%", height: 60, padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 12, resize: "none" }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => {
            const record = { id: "crm_" + Date.now(), date: new Date().toISOString(), clientName: crmPopupData.clientName, address: crmPopupData.address, phone: crmPopupData.phone, email: crmPopupData.email, services: crmPopupData.services, outcome, contractAmount: outcome === "sold" ? contractAmt : 0, commission: outcome === "sold" ? parseFloat(commission) : 0, commissionPaid: false, lossReason: outcome === "not_sold" ? lossReason : "", notes };
            saveCRMRecord(record);
            setShowCRMPopup(false);
            setCrmPopupData(null);
          }} style={{ flex: 1, background: "#0f172a", color: "white", border: "none", borderRadius: 10, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save to CRM</button>
          <button onClick={() => { setShowCRMPopup(false); setCrmPopupData(null); }} style={{ background: "white", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", fontSize: 13, cursor: "pointer" }}>Skip</button>
        </div>
      </div>
    </div>
  );
}

function CRMScreen({ crmRecords, setShowCRM, updateCRMRecord }) {
  const [crmTab, setCrmTab] = React.useState("sold");
  const [filterMonth, setFilterMonth] = React.useState("");
  const months = [...new Set(crmRecords.map(r => r.date ? r.date.slice(0, 7) : ""))].filter(Boolean).sort().reverse();
  const filtered = crmRecords.filter(r => {
    if (crmTab === "sold" && r.outcome !== "sold") return false;
    if (crmTab === "not_sold" && r.outcome !== "not_sold") return false;
    if (crmTab === "follow_up" && r.outcome !== "follow_up") return false;
    if (filterMonth && r.date && !r.date.startsWith(filterMonth)) return false;
    return true;
  });
  const soldRecords = crmRecords.filter(r => r.outcome === "sold" && (!filterMonth || r.date.startsWith(filterMonth)));
  const totalRevenue = soldRecords.reduce((a, r) => a + (r.contractAmount || 0), 0);
  const totalCommission = soldRecords.reduce((a, r) => a + (r.commission || 0), 0);
  const paidCommission = soldRecords.filter(r => r.commissionPaid).reduce((a, r) => a + (r.commission || 0), 0);
  const pendingCommission = totalCommission - paidCommission;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#f1f5f9", zIndex: 9000, display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <div style={{ background: "#0f172a", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "white" }}>📊 CRM — Sales Tracker</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>New Direction Construction · CJ Shires</div>
        </div>
        <button onClick={() => setShowCRM(false)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "white", padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>✕ Close</button>
      </div>
      <div style={{ padding: "16px", maxWidth: 860, margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, maxWidth: 200 }}>
            <option value="">All Time</option>
            {months.map(m => <option key={m} value={m}>{new Date(m + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Jobs Sold", value: soldRecords.length, color: "#16a34a", bg: "#f0fdf4", border: "#86efac" },
            { label: "Total Revenue", value: "$" + totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 0 }), color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" },
            { label: "Commission Earned", value: "$" + totalCommission.toLocaleString("en-US", { minimumFractionDigits: 0 }), color: "#7c3aed", bg: "#faf5ff", border: "#d8b4fe" },
            { label: "Commission Pending", value: "$" + pendingCommission.toLocaleString("en-US", { minimumFractionDigits: 0 }), color: "#d97706", bg: "#fffbeb", border: "#fcd34d" },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: "1.5px solid " + s.border, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[["sold", "✅ Sold", crmRecords.filter(r => r.outcome === "sold").length], ["not_sold", "❌ Not Sold", crmRecords.filter(r => r.outcome === "not_sold").length], ["follow_up", "🔄 Follow Up", crmRecords.filter(r => r.outcome === "follow_up").length]].map(([val, label, count]) => (
            <button key={val} onClick={() => setCrmTab(val)} style={{ padding: "8px 16px", borderRadius: 8, border: "1.5px solid " + (crmTab === val ? "#0f172a" : "#e2e8f0"), background: crmTab === val ? "#0f172a" : "white", color: crmTab === val ? "white" : "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {label} ({count})
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8", background: "white", borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No records yet</div>
          </div>
        ) : filtered.map(r => (
          <div key={r.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{r.clientName}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{r.address}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{r.services}</div>
                {r.lossReason && <div style={{ fontSize: 11, color: "#dc2626", marginTop: 2 }}>Reason: {r.lossReason}</div>}
                {r.notes && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontStyle: "italic" }}>{r.notes}</div>}
                {r.phone && <div style={{ fontSize: 11, color: "#0369a1", marginTop: 4 }}>📞 {r.phone}{r.email ? " · ✉️ " + r.email : ""}</div>}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{r.date ? new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</div>
                {r.outcome === "sold" && (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#16a34a", marginTop: 4 }}>${parseFloat(r.contractAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 0 })}</div>
                    <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700 }}>Comm: ${parseFloat(r.commission || 0).toLocaleString("en-US", { minimumFractionDigits: 0 })}</div>
                    <div onClick={() => updateCRMRecord(r.id, { commissionPaid: !r.commissionPaid })} style={{ marginTop: 6, display: "inline-block", background: r.commissionPaid ? "#f0fdf4" : "#fffbeb", border: "1px solid " + (r.commissionPaid ? "#86efac" : "#fcd34d"), borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 800, color: r.commissionPaid ? "#16a34a" : "#d97706", cursor: "pointer" }}>
                      {r.commissionPaid ? "✓ Commission Paid" : "⏳ Commission Pending"}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
        doors:     Array.isArray(parsed.doors)     ? parsed.doors     : defaults.doors,
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

  // ── Saved Proposals ──────────────────────────────────────────────────────
  const [savedProposals, setSavedProposals] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ndc_saved_proposals") || "[]"); } catch { return []; }
  });
  const [showSavedList, setShowSavedList] = useState(false);
  const [currentProposalId, setCurrentProposalId] = useState(() => localStorage.getItem("ndc_current_id") || null);

  const [driveStatus, setDriveStatus] = useState(null); // null | "saving" | "saved" | "error"

  const saveCurrentProposal = async () => {
    const name = state.customer && state.customer.name ? state.customer.name.trim() : null;
    if (!name) { alert("Please enter a customer name before saving."); return; }
    const dateStr = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }).replace(/\//g, "-");
    const fileName = name + "_" + dateStr;
    const id = currentProposalId || uid();
    const proposal = {
      id,
      name: fileName,
      clientName: name,
      savedAt: new Date().toISOString(),
      services: state.services,
      state: state,
      step: step,
    };

    // Save to localStorage immediately
    const existing = savedProposals.find(p => p.id === id);
    const updated = existing
      ? savedProposals.map(p => p.id === id ? proposal : p)
      : [proposal, ...savedProposals];
    setSavedProposals(updated);
    setCurrentProposalId(id);
    localStorage.setItem("ndc_saved_proposals", JSON.stringify(updated));
    localStorage.setItem("ndc_current_id", id);

    // Save to Google Drive
    setDriveStatus("saving");
    try {
      const driveId = proposal.driveId || null;
      const res = await fetch("/api/drive?action=save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, data: proposal, driveId }),
      });
      const json = await res.json();
      if (json.driveId) {
        const withDriveId = { ...proposal, driveId: json.driveId };
        const finalList = updated.map(p => p.id === id ? withDriveId : p);
        setSavedProposals(finalList);
        localStorage.setItem("ndc_saved_proposals", JSON.stringify(finalList));
        setDriveStatus("saved");
        setTimeout(() => setDriveStatus(null), 3000);
      }
    } catch (e) {
      console.warn("Drive save failed:", e);
      setDriveStatus("error");
      setTimeout(() => setDriveStatus(null), 4000);
    }
  };

  // Load proposals from Drive on first mount
  useEffect(() => {
    fetch("/api/drive?action=list")
      .then(r => r.json())
      .then(json => {
        if (json.proposals && json.proposals.length > 0) {
          // Merge Drive proposals with local — Drive is source of truth
          setSavedProposals(prev => {
            const merged = [...json.proposals.map(p => ({ ...p, id: p.driveId }))];
            return merged;
          });
        }
      })
      .catch(() => {}); // fail silently — local storage still works
  }, []);

  const loadProposal = (proposal) => {
    const defaults = makeInitialState();
    const parsed = proposal.state;
    setState({
      ...defaults, ...parsed,
      services:  Array.isArray(parsed.services)  ? parsed.services  : defaults.services,
      windows:   Array.isArray(parsed.windows)   ? parsed.windows   : defaults.windows,
      doors:     Array.isArray(parsed.doors)     ? parsed.doors     : defaults.doors,
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
    });
    setStep(proposal.step || 0);
    setCurrentProposalId(proposal.id);
    localStorage.setItem("ndc_current_id", proposal.id);
    setShowSavedList(false);
    setSelectedOption(null);
  };

  const deleteProposal = (id) => {
    const updated = savedProposals.filter(p => p.id !== id);
    setSavedProposals(updated);
    localStorage.setItem("ndc_saved_proposals", JSON.stringify(updated));
    if (currentProposalId === id) { setCurrentProposalId(null); localStorage.removeItem("ndc_current_id"); }
  };

  const startNewProposal = () => {
    setState(makeInitialState());
    setStep(0);
    setCurrentProposalId(null);
    setSelectedOption(null);
    setSelectedPayment(null);
    localStorage.removeItem("ndc_current_id");
  };

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
  const [showCRM, setShowCRM] = useState(false);
  const [crmRecords, setCrmRecords] = useState(() => { try { return JSON.parse(localStorage.getItem("ndc_crm") || "[]"); } catch { return []; } });
  const [showCRMPopup, setShowCRMPopup] = useState(false);
  const [crmPopupData, setCrmPopupData] = useState(null);

  const saveCRMRecord = async (record) => {
    const updated = [record, ...crmRecords.filter(r => r.id !== record.id)];
    setCrmRecords(updated);
    localStorage.setItem("ndc_crm", JSON.stringify(updated));
    // Save to Google Sheets CRM tab
    try {
      await fetch("/api/drive?action=saveCRM", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ record }),
      });
    } catch(e) { console.warn("CRM save failed:", e); }
  };

  const updateCRMRecord = (id, updates) => {
    const updated = crmRecords.map(r => r.id === id ? { ...r, ...updates } : r);
    setCrmRecords(updated);
    localStorage.setItem("ndc_crm", JSON.stringify(updated));
  };

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
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => setShowCRM(true)} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "white", padding: "6px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              📊 CRM
            </button>
            <button onClick={() => setShowPricingModal(true)} title="Rep Pricing Tool" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "white", padding: "6px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              🔧 Rep Pricing
            </button>
            {driveStatus && (
              <div style={{ background: driveStatus === "saved" ? "rgba(22,163,74,0.3)" : driveStatus === "error" ? "rgba(220,38,38,0.3)" : "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "white", padding: "6px 10px", fontSize: 11, fontWeight: 700 }}>
                {driveStatus === "saving" ? "☁️ Saving..." : driveStatus === "saved" ? "✓ Saved to Drive" : "⚠ Drive error — saved locally"}
              </div>
            )}
          </div>
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
              <PricingStep state={state} onChange={(v) => setState(s => ({ ...s, pricing: v, financing: { ...s.financing, monthlyPayment: v.monthlyPayment || "" } }))} onWindowsChange={(v) => setState(s => ({ ...s, windows: v }))} onDoorsChange={(v) => setState(s => ({ ...s, doors: v }))} />
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
        {currentKey === "services"  && <ServiceSelectStep selected={state.services} onChange={(v) => setState((s) => ({ ...s, services: v }))} isFinancing={state.isFinancing} onFinancingChange={(v) => setState(s => ({ ...s, isFinancing: v }))} savedCount={savedProposals.length} onShowSaved={() => setShowSavedList(true)} currentProposalId={currentProposalId} />}
        {currentKey === "customer"  && <CustomerStep data={state.customer} fullState={state} onChange={(k, v) => update("customer", k, v)} />}
        {currentKey === "siding"    && <SidingStep data={state.siding} onChange={(k, v) => setState((s) => ({ ...s, siding: { ...s.siding, [k]: v } }))} onSidingTypeChange={(type) => setState((s) => ({ ...s, siding: { ...s.siding, sidingType: type }, sidingMaterials: defaultSidingMaterials(type) }))} state={state} />}
        {currentKey === "soffit"    && <SoffitStepSimple title="Soffits" data={state.soffit} onChange={(v) => setState((s) => ({ ...s, soffit: v }))} />}
        {currentKey === "fascia"    && <SoffitStepSimple title="Fascia" data={state.fascia} onChange={(v) => setState((s) => ({ ...s, fascia: v }))} />}
        {currentKey === "paint"     && <PaintStep data={state.paint} onChange={(v) => setState((s) => ({ ...s, paint: v }))} />}
        {currentKey === "windows"   && <WindowsStep windows={state.windows} onChange={(v) => setState((s) => ({ ...s, windows: v }))} />}
        {currentKey === "doors"     && <DoorsStep doors={state.doors||[]} onChange={(v) => setState((s) => ({ ...s, doors: v }))} />}
        {currentKey === "misc"      && <MiscStep data={state.misc} onChange={(v) => setState((s) => ({ ...s, misc: v }))} />}
        {currentKey === "preview"   && <PreviewStep state={state} setState={setState} setStep={setStep} steps={steps} selectedOption={selectedOption} setSelectedOption={setSelectedOption} selectedPayment={selectedPayment} setSelectedPayment={setSelectedPayment} showDeposit={showDeposit} setShowDeposit={setShowDeposit} depositOption={depositOption} setDepositOption={setDepositOption} customDepositText={customDepositText} setCustomDepositText={setCustomDepositText} usingFinancing={usingFinancing} setUsingFinancing={setUsingFinancing} financingPct={financingPct} setFinancingPct={setFinancingPct} />}
        {currentKey === "contract"  && <ContractStep state={state} selectedOption={selectedOption} setStep={setStep} steps={steps} showDeposit={showDeposit} depositOption={depositOption} customDepositText={customDepositText} usingFinancing={usingFinancing} financingPct={financingPct} />}
        {currentKey === "creditapp" && <CreditAppStep data={state.creditApp} onChange={(v) => setState(s => ({ ...s, creditApp: v }))} projectTotal={projectTotal} />}
      </div>

      {/* Nav buttons */}
      {step < lastStep && currentKey !== "preview" && currentKey !== "contract" && currentKey !== "creditapp" && (
        <div style={S.nav}>
          {step > 0 && <button style={S.secondaryBtn} onClick={() => setStep(step - 1)}>← Back</button>}
          <button style={{ background: "#16a34a", color: "white", border: "none", borderRadius: 10, padding: "12px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }} onClick={saveCurrentProposal}>💾</button>
          <button style={{ ...S.primaryBtn, marginLeft: "auto", opacity: canNext() ? 1 : 0.5 }} disabled={!canNext()} onClick={() => setStep(step + 1)}>Next →</button>
        </div>
      )}

      {(currentKey === "preview" || currentKey === "contract") && (
        <div style={S.nav}>
          <button style={S.secondaryBtn} onClick={() => setStep(step - 1)}>← Back</button>
          <button style={{ ...S.primaryBtn, background: "#16a34a", flex: 1 }} onClick={saveCurrentProposal}>💾 Save</button>
          <button style={{ ...S.secondaryBtn }} onClick={() => {
            if (window.confirm("Start a new proposal? Save first if you want to keep this one.")) { startNewProposal(); }
          }}>New Proposal</button>
        </div>
      )}

      {currentKey === "creditapp" && (
        <div style={S.nav}>
          <button style={S.secondaryBtn} onClick={() => setStep(step - 1)}>← Back to Contract</button>
          <button style={{ ...S.primaryBtn, background: "#16a34a", flex: 1 }} onClick={saveCurrentProposal}>💾 Save</button>
          <button style={{ ...S.secondaryBtn }} onClick={() => {
            if (window.confirm("Start a new proposal? Save first if you want to keep this one.")) { startNewProposal(); }
          }}>New Proposal</button>
        </div>
      )}

      {/* Saved Proposals Panel */}
      {showSavedList && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 600, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>💾 Saved Proposals</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{savedProposals.length} saved</div>
              </div>
              <button onClick={() => setShowSavedList(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <div style={{ overflowY: "auto", flex: 1, padding: "12px 16px" }}>
              {savedProposals.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>No saved proposals yet</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>Tap 💾 Save Proposal to save your current work</div>
                </div>
              )}
              {savedProposals.map(p => {
                const saved = new Date(p.savedAt);
                const dateLabel = saved.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                const timeLabel = saved.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                const isActive = p.id === currentProposalId;
                return (
                  <div key={p.id} style={{ background: isActive ? "#f0fdf4" : "#f8fafc", border: "1.5px solid " + (isActive ? "#86efac" : "#e2e8f0"), borderRadius: 10, padding: "14px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }} onClick={() => loadProposal(p)} style={{ flex: 1, cursor: "pointer" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>
                        {isActive && <span style={{ background: "#16a34a", color: "white", fontSize: 8, fontWeight: 800, padding: "1px 6px", borderRadius: 10, marginRight: 6, textTransform: "uppercase" }}>Active</span>}
                        {p.clientName}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{dateLabel} at {timeLabel}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{(p.services || []).join(", ")}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginLeft: 12 }}>
                      <button onClick={() => loadProposal(p)} style={{ background: "#0f172a", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Resume</button>
                      <button onClick={() => { if (window.confirm("Delete this proposal?")) deleteProposal(p.id); }} style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 10px", fontSize: 12, cursor: "pointer" }}>🗑</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: "12px 16px", borderTop: "1px solid #e2e8f0" }}>
              <button onClick={() => { setShowSavedList(false); startNewProposal(); }} style={{ width: "100%", background: "#0f172a", color: "white", border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                + Start New Proposal
              </button>
            </div>
          </div>
        </div>
      )}
      {showCRMPopup && crmPopupData && <CRMPopup crmPopupData={crmPopupData} saveCRMRecord={saveCRMRecord} setShowCRMPopup={setShowCRMPopup} setCrmPopupData={setCrmPopupData} />}
      {showCRM && <CRMScreen crmRecords={crmRecords} setShowCRM={setShowCRM} updateCRMRecord={updateCRMRecord} />}
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
