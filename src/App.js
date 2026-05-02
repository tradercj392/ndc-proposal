import React, { useState, useEffect, useRef } from "react";

function uid() { return Math.random().toString(36).slice(2); }
const NDC_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABdwAAAXcCAYAAAA4NUxkAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAlghSURBVHja7N0JgBxlmf//73er+qq+7mT3vggBwuYRFDzeqKicoIKiIOCuoKKyC6hcIoqAiICCy4KyCniAoiKooIDHb9VFUQ9cvFBBkEVyd9/dVd31e14zgRASmJDkycz38yTde2Z2Zna3du93nuf5Pq+UxhgBAAAAAAAAAABHj6cEAAAAAAAAAADHjsAdAAAAAAAAAIBjQOAOAAAAAAAAAMAxIHAHAAAAAAAAAOAYELgDAAAAAAAAAHAMCNwBAAAAAAAAADgGBO4AAAAAAAAAABwDAncAAAAAAAAAAI4BgTsAAAAAAAAAAMeAwB0AAAAAAAAAgGNA4A4AAAAAAAAAwDEgcAcAAAAAAAAA4BgQuAMAAAAAAAAAcAwI3AEAAAAAAAAAOAYEco8BAAAAAAAAAADHjsAdAAAAAAAAAIBjQOAOAAAAAAAAAMAxIHAHAAAAAAAAAOAYELgDAAAAAAAAAHAMCNwBAAAAAAAAADgGBO4AAAAAAAAAABwDAncAAAAAAAAAAI4BgTsAAAAAAAAAAMeAwB0AAAAAAAAAgGNA4A4AAAAAAAAAwDEgcAcAAAAAAAAA4BgQuAMAAAAAAAAAcAwI3AEAAAAAAAAAOAYEHgSAO1mUqZABhgAAAABJRU5ErkJggg==";

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
  { id: uid(), name: "Exterior Paint (2 coats)", unit: "gallon", sqft: "", pieces: "", cost: "" },
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
  { id: uid(), name: "Exterior Paint (1st coat)", unit: "gallon", sqft: "", pieces: "", cost: "" },
  { id: uid(), name: "Exterior Paint (2nd coat)", unit: "gallon", sqft: "", pieces: "", cost: "" },
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

const makeInitialState = () => ({
  company: { name: "New Direction Construction", address: "820 Worth Rd, Jacksonville, FL 32259", phone: "(904) 891-9980", email: "", license: "CBC059304", logo: NDC_LOGO },
  customer: { name: "", address: "", email: "", phone: "", photo: null },
  services: [],
  siding: { walls: [{ id: uid(), label: "Wall 1", location: "", sqft: "", pricePerSqFt: "", currentSiding: "", removalRequired: "", osbSheathing: "", hardieProduct: "", hardieSize: "", hardieTexture: "", photo: null, notes: "" }], pricePerSqFt: "", sidingType: "HardiePlank Lap Siding" },
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
  pricing: { sidingPerSqFt: "", soffitPerLinFt: "", fasciaPerLinFt: "", paintPerSqFt: "", windowPerUnit: "", miscMarkup: "", adminSavingsDiscount: "8.35", monthlyPayment: "", clearanceDays: "14" },
  priceRevealed: false,
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
  const sidingArea = state.siding.walls.reduce((a,w)=>a+parseFloat(w.sqft||0),0);
  const sid = state.services.includes("siding") ? (p.sidingPerSqFt ? sidingArea * parseFloat(p.sidingPerSqFt) : parseFloat(calcSiding(state.siding).totalCost)) : 0;
  const soffitLinFt = state.soffit.items.reduce((a,i)=>a+parseFloat(i.linearFt||0),0);
  const sof = state.services.includes("soffit") ? (p.soffitPerLinFt ? soffitLinFt * parseFloat(p.soffitPerLinFt) : calcSoffit(state.soffit)) : 0;
  const fasciaLinFt = state.fascia.items.reduce((a,i)=>a+parseFloat(i.linearFt||0),0);
  const fas = state.services.includes("fascia") ? (p.fasciaPerLinFt ? fasciaLinFt * parseFloat(p.fasciaPerLinFt) : calcSoffit(state.fascia)) : 0;
  const paintSqFt = parseFloat(state.paint.combinedSqft||0);
  const pnt = state.services.includes("paint") ? (p.paintPerSqFt ? paintSqFt * parseFloat(p.paintPerSqFt) : calcPaint(state.paint)) : 0;
  const totalWindows = state.windows.reduce((a,w)=>a+parseFloat(w.qty||1),0);
  const win = state.services.includes("windows") ? (p.windowPerUnit ? totalWindows * parseFloat(p.windowPerUnit) : calcWindows(state.windows).reduce((a,w)=>a+parseFloat(w.total||0),0)) : 0;
  const msc = state.services.includes("misc") ? state.misc.items.reduce((a,i)=>a+parseFloat(i.qty||0)*parseFloat(i.unitPrice||0),0) : 0;
  return { sid, sof, fas, pnt, win, msc, total: sid+sof+fas+pnt+win+msc };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRICE GATE — shown after all services are filled, before pricing is revealed
// ─────────────────────────────────────────────────────────────────────────────
function PriceGateStep({ onConfirm, services }) {
  const serviceLabels = {
    siding: "James Hardie Siding",
    soffit: "Soffit Installation",
    fascia: "Fascia Installation",
    paint: "Exterior Paint",
    windows: "Window Replacement",
    misc: "Additional Items",
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: 560, padding: "40px 24px", textAlign: "center"
    }}>
      {/* Icon */}
      <div style={{
        width: 88, height: 88,
        background: "linear-gradient(135deg,#0ea5e9,#0369a1)",
        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 28, boxShadow: "0 16px 40px rgba(14,165,233,0.35)"
      }}>
        <span style={{ fontSize: 40 }}>💰</span>
      </div>

      {/* Heading */}
      <h2 style={{
        fontSize: 22, fontWeight: 800, color: "#0f172a",
        margin: "0 0 14px", lineHeight: 1.25, maxWidth: 360
      }}>
        Are you ready to go over the pricing for this project?
      </h2>

      {/* Project summary */}
      <div style={{
        background: "#f8fafc", border: "1.5px solid #e2e8f0",
        borderRadius: 12, padding: "14px 20px", marginBottom: 28,
        width: "100%", maxWidth: 400, textAlign: "left"
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
          We've covered all the details for:
        </div>
        {services.map(svc => (
          <div key={svc} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid #f1f5f9", fontSize: 12, color: "#334155" }}>
            <span style={{ color: "#22c55e", fontWeight: 800 }}>✓</span>
            <span>{serviceLabels[svc] || svc}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: "0 0 32px", maxWidth: 380 }}>
        Now let's review what it will take to bring this project to life — including your investment options and payment flexibility.
      </p>

      {/* CTA Button */}
      <button
        onClick={onConfirm}
        style={{
          background: "linear-gradient(135deg,#0ea5e9,#0369a1)", color: "white",
          border: "none", borderRadius: 14, padding: "16px 44px",
          fontWeight: 800, fontSize: 17, cursor: "pointer", letterSpacing: "-0.3px",
          boxShadow: "0 8px 28px rgba(14,165,233,0.35)", width: "100%", maxWidth: 400
        }}
      >
        Yes, Let's Review the Price
      </button>

      <div style={{ marginTop: 16, fontSize: 11, color: "#94a3b8" }}>
        Pricing is based on the full scope of work we reviewed together
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRICING STEP (Rep-only — accessed via floating button, not in client flow)
// ─────────────────────────────────────────────────────────────────────────────
function PricingStep({ state, onChange }) {
  var p = state.pricing || {};
  var services = state.services;
  function set(k, v) { onChange(Object.assign({}, p, { [k]: v })); }

  var sidingArea = state.siding.walls.reduce(function(a,w){ return a + parseFloat(w.sqft||0); }, 0);
  var soffitLinFt = state.soffit.items.reduce(function(a,i){ return a + parseFloat(i.linearFt||0); }, 0);
  var fasciaLinFt = state.fascia.items.reduce(function(a,i){ return a + parseFloat(i.linearFt||0); }, 0);
  var paintSqFt = parseFloat(state.paint.combinedSqft||0);
  var totalWindows = state.windows.reduce(function(a,w){ return a + parseFloat(w.qty||1); }, 0);
  var miscTotal = state.misc.items.reduce(function(a,i){ return a + parseFloat(i.qty||0)*parseFloat(i.unitPrice||0); }, 0);

  var sidTotal = services.includes("siding") ? sidingArea * parseFloat(p.sidingPerSqFt||0) : 0;
  var sofTotal = services.includes("soffit") ? soffitLinFt * parseFloat(p.soffitPerLinFt||0) : 0;
  var fasTotal = services.includes("fascia") ? fasciaLinFt * parseFloat(p.fasciaPerLinFt||0) : 0;
  var pntTotal = services.includes("paint") ? paintSqFt * parseFloat(p.paintPerSqFt||0) : 0;
  var winTotal = services.includes("windows") ? totalWindows * parseFloat(p.windowPerUnit||0) : 0;
  var grandTotal = sidTotal + sofTotal + fasTotal + pntTotal + winTotal + miscTotal;
  var discount = parseFloat(p.adminSavingsDiscount||8.35) / 100;
  var adminTotal = grandTotal * (1 - discount);

  var cardStyle = { background: "white", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 12 };
  var labelStyle = { fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 4 };
  var inputStyle = { width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#0f172a", outline: "none", background: "white" };

  function PriceBox(label, total) {
    return React.createElement("div", { style: { flex: 1, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "8px 12px" } },
      React.createElement("div", { style: { fontSize: 10, color: "#64748b", fontWeight: 700 } }, label),
      React.createElement("div", { style: { fontSize: 16, fontWeight: 800, color: "#0ea5e9" } }, fmt(total))
    );
  }

  function ServiceRow(label, qty, qtyLabel, rateKey, placeholder, total) {
    return React.createElement("div", { style: cardStyle, key: rateKey },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 6 } }, label),
      React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginBottom: 10 } },
        "Total: ", React.createElement("strong", null, qty + " " + qtyLabel)
      ),
      React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "flex-end" } },
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("label", { style: labelStyle }, "Price per " + qtyLabel + " ($)"),
          React.createElement("input", { style: inputStyle, type: "number", value: p[rateKey]||"", onChange: function(e){ set(rateKey, e.target.value); }, placeholder: placeholder })
        ),
        PriceBox("TOTAL", total)
      )
    );
  }

  return React.createElement("div", { style: { padding: "0 0 24px" } },
    React.createElement("h2", { style: { fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" } }, "Job Pricing"),
    React.createElement("p", { style: { color: "#64748b", fontSize: 13, margin: "0 0 20px", lineHeight: 1.5 } }, "Private — client does not see this step"),
    React.createElement("div", { style: { background: "#fef9c3", border: "1.5px solid #fde68a", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#92400e", fontWeight: 600 } },
      "This step is for your eyes only. Enter your pricing rates below."
    ),
    services.includes("siding") ? ServiceRow("James Hardie Siding", sidingArea.toFixed(0), "sq ft", "sidingPerSqFt", "e.g. 15.00", sidTotal) : null,
    services.includes("soffit") ? ServiceRow("Soffit Installation", soffitLinFt.toFixed(0), "linear ft", "soffitPerLinFt", "e.g. 8.00", sofTotal) : null,
    services.includes("fascia") ? ServiceRow("Fascia Installation", fasciaLinFt.toFixed(0), "linear ft", "fasciaPerLinFt", "e.g. 8.00", fasTotal) : null,
    services.includes("paint") ? ServiceRow("Exterior Paint", paintSqFt.toFixed(0), "sq ft", "paintPerSqFt", "e.g. 2.50", pntTotal) : null,
    services.includes("windows") ? ServiceRow("Window Installation", totalWindows, "units", "windowPerUnit", "e.g. 450.00", winTotal) : null,
    services.includes("misc") && miscTotal > 0 ? React.createElement("div", { style: cardStyle },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } },
        React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: "#0f172a" } }, "Miscellaneous"),
        React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: "#0ea5e9" } }, fmt(miscTotal))
      )
    ) : null,
    React.createElement("div", { style: cardStyle },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 6 } }, "Admin Savings Incentive Discount"),
      React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "flex-end" } },
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("label", { style: labelStyle }, "Discount % (default 8.35%)"),
          React.createElement("input", { style: inputStyle, type: "number", value: p.adminSavingsDiscount||"8.35", onChange: function(e){ set("adminSavingsDiscount", e.target.value); }, placeholder: "8.35" })
        ),
        PriceBox("ADMIN PRICE", adminTotal)
      )
    ),
    React.createElement("div", { style: cardStyle },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 6 } }, "Financing (Optional)"),
      React.createElement("label", { style: labelStyle }, "Monthly payment for Admin Savings price ($/mo)"),
      React.createElement("input", { style: inputStyle, type: "number", value: p.monthlyPayment||"", onChange: function(e){ set("monthlyPayment", e.target.value); }, placeholder: "e.g. 285.00" }),
      p.monthlyPayment ? React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginTop: 6 } },
        "Standard financing: ", React.createElement("strong", null, fmt(parseFloat(p.monthlyPayment)+47) + "/mo")
      ) : null
    ),
    React.createElement("div", { style: { ...cardStyle, borderColor: "#fde68a", background: "#fffbeb" } },
      React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: "#92400e", marginBottom: 4 } }, "Administrative Clearance Option"),
      React.createElement("div", { style: { fontSize: 11, color: "#a16207", marginBottom: 10, lineHeight: 1.5 } },
        "Client gets this many days to shop & find a lower price. If they do, provide a written estimate — we will review and beat it by 10%."
      ),
      React.createElement("label", { style: labelStyle }, "Shopping Period (days)"),
      React.createElement("input", { style: inputStyle, type: "number", value: p.clearanceDays||"14", onChange: function(e){ set("clearanceDays", e.target.value); }, placeholder: "e.g. 14" })
    ),
    React.createElement("div", { style: { background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: 12, padding: 16, marginTop: 4 } },
      React.createElement("div", { style: { fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 } }, "Job Summary"),
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 } },
        React.createElement("span", { style: { fontSize: 13, color: "rgba(255,255,255,0.8)" } }, "Standard Pricing"),
        React.createElement("span", { style: { fontSize: 16, fontWeight: 800, color: "white" } }, fmt(grandTotal))
      ),
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } },
        React.createElement("span", { style: { fontSize: 13, color: "#7dd3fc" } }, "Admin Savings Incentive"),
        React.createElement("span", { style: { fontSize: 16, fontWeight: 800, color: "#7dd3fc" } }, fmt(adminTotal))
      ),
      p.monthlyPayment ? React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 6 } },
        React.createElement("span", { style: { fontSize: 12, color: "rgba(255,255,255,0.5)" } }, "Financing (Admin price)"),
        React.createElement("span", { style: { fontSize: 13, color: "rgba(255,255,255,0.7)" } }, fmt(parseFloat(p.monthlyPayment)) + "/mo")
      ) : null
    )
  );
}

function ServiceSelectStep({ selected, onChange }) {
  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  };
  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>What services does this job include?</h2>
      <p style={S.stepSub}>Select all that apply — only relevant sections will appear in the proposal.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ALL_SERVICES.map((svc) => {
          const active = selected.includes(svc.id);
          return (
            <div key={svc.id} onClick={() => toggle(svc.id)} style={{
              display: "flex", alignItems: "center", gap: 16,
              background: active ? "#f0f9ff" : "white",
              border: "2px solid " + (active ? "#0ea5e9" : "#e2e8f0"),
              borderRadius: 14, padding: "16px 20px", cursor: "pointer",
            }}>
              <div style={{ fontSize: 32 }}>{svc.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{svc.label}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{svc.sub}</div>
              </div>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                border: "2px solid " + (active ? "#0ea5e9" : "#cbd5e1"),
                background: active ? "#0ea5e9" : "white",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {active && <span style={{ color: "white", fontSize: 14, fontWeight: 800 }}>✓</span>}
              </div>
            </div>
          );
        })}
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
        <label style={{
          display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
          background: data.photo ? "#f0f9ff" : "#f8fafc",
          border: "1.5px dashed " + (data.photo ? "#0ea5e9" : "#cbd5e1"),
          borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#475569"
        }}>
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
    onChange("walls", [...data.walls, {
      ...last,
      id: uid(),
      label: "Wall " + (data.walls.length + 1),
      photo: null,
    }]);
  };
  const removeWall = (id) => onChange("walls", data.walls.filter((w) => w.id !== id));
  const updateWall = (id, key, val) => onChange("walls", data.walls.map((w) => (w.id === id ? { ...w, [key]: val } : w)));

  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Siding Measurements</h2>
      <p style={S.stepSub}>Measure each wall and document materials. Pricing is entered separately.</p>
      <div style={S.field}>
        <label style={S.label}>Siding Product Type</label>
        <select style={S.input} value={data.sidingType} onChange={(e) => onSidingTypeChange(e.target.value)}>
          <option>HardiePlank Lap Siding</option>
          <option>Board & Batten</option>
          <option>HardieShingle</option>
          <option>Mix (specify in notes)</option>
        </select>
      </div>

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
              <option>Front</option>
              <option>Rear</option>
              <option>Left Side</option>
              <option>Right Side</option>
              <option>Garage</option>
              <option>Gable End</option>
              <option>Other</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Current Siding Type</label>
              <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={wall.currentSiding} onChange={(e) => updateWall(wall.id, "currentSiding", e.target.value)}>
                <option value="">-- Select --</option>
                <option>Vinyl Siding</option>
                <option>Wood Siding</option>
                <option>T1-11 / OSB Panel</option>
                <option>Stucco</option>
                <option>Brick / Masonry</option>
                <option>Aluminum Siding</option>
                <option>Fiber Cement (existing)</option>
                <option>Cedar Shake</option>
                <option>No Existing Siding</option>
                <option>Other</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Removal Required?</label>
              <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={wall.removalRequired} onChange={(e) => updateWall(wall.id, "removalRequired", e.target.value)}>
                <option value="">-- Select --</option>
                <option>Yes - Full Removal</option>
                <option>Yes - Partial Removal</option>
                <option>No - Install Over Existing</option>
                <option>TBD / Inspect First</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>New OSB Sheathing Required?</label>
            <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={wall.osbSheathing} onChange={(e) => updateWall(wall.id, "osbSheathing", e.target.value)}>
              <option value="">-- Select --</option>
              <option>No - Existing Sheathing is Adequate</option>
              <option>Yes - Full Wall OSB Replacement</option>
              <option>Yes - Partial OSB Replacement</option>
              <option>TBD - Inspect After Removal</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Hardie Product</label>
              <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={wall.hardieProduct} onChange={(e) => updateWall(wall.id, "hardieProduct", e.target.value)}>
                <option value="">-- Select Product --</option>
                <option value="lap">HardiePlank Lap</option>
                <option value="panel">HardiePanel</option>
                <option value="shake">HardieShingle Shake</option>
              </select>
            </div>
          </div>

          {wall.hardieProduct === "lap" && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Lap Size</label>
                <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={wall.hardieSize} onChange={(e) => updateWall(wall.id, "hardieSize", e.target.value)}>
                  <option value="">-- Select Size --</option>
                  <option>5/16" x 6" - 5.25" Exposure</option>
                  <option>5/16" x 7-1/4" - 6" Exposure</option>
                  <option>5/16" x 8-1/4" - 7" Exposure</option>
                  <option>5/16" x 9-1/4" - 8" Exposure</option>
                  <option>5/16" x 12" - 11" Exposure</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Texture</label>
                <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={wall.hardieTexture} onChange={(e) => updateWall(wall.id, "hardieTexture", e.target.value)}>
                  <option value="">-- Select Texture --</option>
                  <option>Smooth</option>
                  <option>Sierra 8 (Cedar Grain)</option>
                  <option>Beaded Smooth</option>
                  <option>Beaded Cedar Mill</option>
                </select>
              </div>
            </div>
          )}

          {wall.hardieProduct === "panel" && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Panel Size</label>
                <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={wall.hardieSize} onChange={(e) => updateWall(wall.id, "hardieSize", e.target.value)}>
                  <option value="">-- Select Size --</option>
                  <option>4' x 8' Panel</option>
                  <option>4' x 9' Panel</option>
                  <option>4' x 10' Panel</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Texture</label>
                <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={wall.hardieTexture} onChange={(e) => updateWall(wall.id, "hardieTexture", e.target.value)}>
                  <option value="">-- Select Texture --</option>
                  <option>Smooth</option>
                  <option>Sierra 8 (Cedar Grain)</option>
                  <option>Stucco</option>
                </select>
              </div>
            </div>
          )}

          {wall.hardieProduct === "shake" && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Shake Size</label>
                <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={wall.hardieSize} onChange={(e) => updateWall(wall.id, "hardieSize", e.target.value)}>
                  <option value="">-- Select Size --</option>
                  <option>15/32" x 48" - 7" Exposure (Individual)</option>
                  <option>15/32" x 48" - 10" Exposure (Individual)</option>
                  <option>Straight Edge Panel - 7" Exposure</option>
                  <option>Staggered Edge Panel - 7" Exposure</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Texture</label>
                <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={wall.hardieTexture} onChange={(e) => updateWall(wall.id, "hardieTexture", e.target.value)}>
                  <option value="">-- Select Texture --</option>
                  <option>Cedar Mill</option>
                  <option>Smooth</option>
                </select>
              </div>
            </div>
          )}

          {/* Sq ft - NO price per sq ft shown to client */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Total Sq Ft</label>
              <input style={{ ...S.input, padding: "6px 8px", fontSize: 13, width: 120 }} type="number" value={wall.sqft} onChange={(e) => updateWall(wall.id, "sqft", e.target.value)} placeholder="0" />
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>WALL NOTES</label>
            <textarea
              style={{ ...S.input, height: 70, resize: "vertical", fontSize: 13 }}
              value={wall.notes || ""}
              onChange={(e) => updateWall(wall.id, "notes", e.target.value)}
              placeholder="e.g. rotted sheathing on left side, extra flashing needed at roofline..."
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>WALL PHOTO</label>
            <label style={{
              display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
              background: wall.photo ? "#f0f9ff" : "#f8fafc",
              border: "1.5px dashed " + (wall.photo ? "#0ea5e9" : "#cbd5e1"),
              borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#475569"
            }}>
              <span style={{ fontSize: 20 }}>{wall.photo ? "🖼️" : "📷"}</span>
              <span>{wall.photo ? "Photo attached — tap to replace" : "Tap to take photo or upload"}</span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                const file = e.target.files[0]; if (!file) return;
                compressImage(file, function(compressed) { updateWall(wall.id, "photo", compressed); });
              }} />
            </label>
            {wall.photo && (
              <div style={{ marginTop: 8, position: "relative", display: "inline-block" }}>
                <img src={wall.photo} alt={wall.label} style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 8, border: "1.5px solid #e2e8f0", display: "block" }} />
                <button onClick={() => updateWall(wall.id, "photo", null)} style={{ position: "absolute", top: 6, right: 6, background: "#0f172a99", border: "none", borderRadius: "50%", color: "white", width: 24, height: 24, cursor: "pointer", fontSize: 12 }}>×</button>
              </div>
            )}
          </div>
        </div>
      ))}
      <button style={S.addBtn} onClick={addWall}>+ Add Wall</button>
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 16px", fontSize: 12, color: "#64748b" }}>
        Total area: <strong>{state => state.siding.walls.reduce((a,w)=>a+parseFloat(w.sqft||0),0).toFixed(0)}</strong> sq ft — pricing reviewed after all services
      </div>
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

  const currentMaterials = title === "Fascia"
    ? ["Wood Fascia", "Aluminum Fascia", "Vinyl Fascia", "Fiber Cement Fascia", "No Existing Material", "Other"]
    : ["Wood Soffit", "Aluminum Soffit", "Vinyl Soffit", "T1-11 / Plywood Soffit", "Fiber Cement Soffit", "No Existing Material", "Other"];
  const newMaterials = title === "Fascia"
    ? ["Aluminum Fascia", "HardieTrim Fascia", "PVC Fascia", "Wood (painted)", "Other"]
    : ["Aluminum Vented Soffit", "Vinyl Vented Soffit", "Aluminum Solid Soffit", "Vinyl Solid Soffit", "Other"];

  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>{title}</h2>
      <p style={S.stepSub}>{"Document each " + title.toLowerCase() + " run with materials and measurements. Pricing reviewed separately."}</p>
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
                <option value="">-- Select --</option>
                {currentMaterials.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>New Material to Install</label>
              <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={item.newMaterial} onChange={(e) => update(item.id, "newMaterial", e.target.value)}>
                <option value="">-- Select --</option>
                {newMaterials.map(m => <option key={m}>{m}</option>)}
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

          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>PHOTO</label>
            {item.photo ? (
              <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                <img src={item.photo} alt="photo" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <button onClick={() => update(item.id, "photo", "")} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: 14 }}>×</button>
              </div>
            ) : (
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: "#f8fafc", border: "1.5px dashed #cbd5e1", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#64748b" }}>
                📷 Take or Upload Photo
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files[0]; if (f) compressImage(f, (img) => update(item.id, "photo", img)); }} />
              </label>
            )}
          </div>
        </div>
      ))}
      <button style={S.addBtn} onClick={add}>{"+ Add " + title + " Area"}</button>
    </div>
  );
}

const PAINT_PRODUCTS = {
  "Sherwin Williams": [
    "SW Emerald Exterior (Highest Quality)",
    "SW Duration Exterior",
    "SW Resilience Exterior",
    "SW SuperPaint Exterior",
    "SW A-100 Exterior (Good Value)",
  ],
  "Behr": [
    "Behr Dynasty Exterior (Highest Quality)",
    "Behr Marquee Exterior",
    "Behr Premium Plus Ultra Exterior",
    "Behr Premium Plus Exterior",
    "Behr Exterior (Good Value)",
  ],
};

function PaintSection({ title, items, onChange }) {
  const add = () => {
    const last = items[items.length - 1];
    onChange([...items, { ...last, id: uid(), colorName: "", sqft: "", pricePerSqFt: "" }]);
  };
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
              <option value="">-- Select Brand & Product --</option>
              {Object.entries(PAINT_PRODUCTS).map(([brand, products]) => (
                <optgroup key={brand} label={brand}>
                  {products.map(p => <option key={p}>{p}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>COLOR NAME</label>
            <input style={{ ...S.input, fontSize: 13 }} value={item.colorName || ""} onChange={(e) => update(item.id, "colorName", e.target.value)} placeholder="e.g. Alabaster, Extra White..." />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOTES</label>
            <textarea style={{ ...S.input, height: 60, resize: "vertical", fontSize: 13 }} value={item.notes || ""} onChange={(e) => update(item.id, "notes", e.target.value)} placeholder="e.g. two coats required, prep work needed..." />
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>PHOTO</label>
            {item.photo ? (
              <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                <img src={item.photo} alt="paint" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <button onClick={() => update(item.id, "photo", "")} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: 14 }}>×</button>
              </div>
            ) : (
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: "#f8fafc", border: "1.5px dashed #cbd5e1", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#64748b" }}>
                📷 Take or Upload Photo
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files[0]; if (f) compressImage(f, (img) => update(item.id, "photo", img)); }} />
              </label>
            )}
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

      <div style={{ ...S.card, marginBottom: 20, background: "#f0f9ff", border: "1.5px solid #7dd3fc" }}>
        <label style={{ fontSize: 12, fontWeight: 800, color: "#0369a1", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Paint Area</label>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 120 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>TOTAL SQ FT (Walls & Trim)</label>
            <input style={{ ...S.input, fontSize: 15, fontWeight: 700 }} type="number" value={data.combinedSqft || ""} onChange={(e) => onChange({ ...data, combinedSqft: e.target.value })} placeholder="e.g. 1200" />
          </div>
        </div>
        <p style={{ fontSize: 11, color: "#64748b", margin: "8px 0 0" }}>Pricing per sq ft is entered in the Rep Pricing tool (🔧 button).</p>
      </div>

      <PaintSection title="Walls" items={data.walls} onChange={(v) => updateSection("walls", v)} />
      <PaintSection title="Trim" items={data.trim} onChange={(v) => updateSection("trim", v)} />
      <PaintSection title="Other" items={data.other} onChange={(v) => updateSection("other", v)} />
    </div>
  );
}

const WIN_OPTS = {
  manufacturers: ["PGT Innovations", "CGI Windows & Doors", "Impact Resistant Solutions (IRS)", "Andersen Windows", "Pella Windows", "Simonton Windows", "Jeld-Wen", "MI Windows", "Ply Gem / Atrium", "Thermoseal Windows", "Other"],
  frameTypes: ["Vinyl", "Aluminum", "Fiberglass", "Wood-Clad", "Composite"],
  frameColors: ["White", "Bronze", "Black", "Tan / Beige", "Gray", "Cream", "Custom Color"],
  styles: ["Single Hung", "Double Hung", "Sliding / Gliding", "Casement", "Awning", "Fixed / Picture", "Hopper", "Bay / Bow", "Garden"],
  glassTypes: ["Laminated (Impact)", "Tempered", "Laminated + Tempered", "Annealed (Standard)", "Obscure / Frosted"],
  glassPacks: ["Low-E 366 (Best Performance)", "Low-E 272", "Low-E 180", "Low-E 2 Coat", "Clear Insulated (IGU)", "Single Pane Clear"],
  grids: ["No Grids", "Colonial Grids", "Prairie Grids", "Diamond Grids", "Custom Grid Pattern"],
};

function WindowsStep({ windows, onChange }) {
  const add = () => {
    const last = windows[windows.length - 1];
    onChange([...windows, { ...last, id: uid(), label: "Window " + (windows.length + 1), width: "", height: "", qty: "1", priceInstalled: "" }]);
  };
  const remove = (id) => onChange(windows.filter((w) => w.id !== id));
  const update = (id, key, val) => onChange(windows.map((w) => (w.id === id ? { ...w, [key]: val } : w)));

  const WinSelect = ({ label, field, win, options }) => (
    <div style={{ flex: 1, minWidth: 150, marginBottom: 10 }}>
      <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>{label}</label>
      <select style={{ ...S.input, fontSize: 13, padding: "6px 8px" }} value={win[field] || ""} onChange={(e) => update(win.id, field, e.target.value)}>
        <option value="">-- Select --</option>
        {options.map(o => <option key={o}>{o}</option>)}
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
            <textarea style={{ ...S.input, height: 60, resize: "vertical", fontSize: 13 }} value={win.notes || ""} onChange={(e) => update(win.id, "notes", e.target.value)} placeholder="e.g. egress requirement, special trim, existing frame condition..." />
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>PHOTO</label>
            {win.photo ? (
              <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                <img src={win.photo} alt="window" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <button onClick={() => update(win.id, "photo", "")} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: 14 }}>×</button>
              </div>
            ) : (
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: "#f8fafc", border: "1.5px dashed #cbd5e1", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#64748b" }}>
                📷 Take or Upload Photo
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files[0]; if (f) compressImage(f, (img) => update(win.id, "photo", img)); }} />
              </label>
            )}
          </div>
        </div>
      ))}
      <button style={S.addBtn} onClick={add}>+ Add Window</button>
    </div>
  );
}

function MiscStep({ data, onChange }) {
  const add = () => {
    const last = data.items[data.items.length - 1];
    onChange({ ...data, items: [...data.items, { ...last, id: uid(), description: "", qty: "", unitPrice: "", notes: "" }] });
  };
  const remove = (id) => onChange({ ...data, items: data.items.filter((i) => i.id !== id) });
  const update = (id, key, val) => onChange({ ...data, items: data.items.map((i) => (i.id === id ? { ...i, [key]: val } : i)) });

  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Miscellaneous Items</h2>
      <p style={S.stepSub}>Add any additional work items. Pricing reviewed after all services are complete.</p>
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
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>PHOTO</label>
            {item.photo ? (
              <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                <img src={item.photo} alt="item" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <button onClick={() => update(item.id, "photo", "")} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: 14 }}>×</button>
              </div>
            ) : (
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: "#f8fafc", border: "1.5px dashed #cbd5e1", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#64748b" }}>
                📷 Take or Upload Photo
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files[0]; if (f) compressImage(f, (img) => update(item.id, "photo", img)); }} />
              </label>
            )}
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
      <p style={S.stepSub}>Enter the monthly payment amount to display under Administrative Savings Incentive on the proposal.</p>

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
        <input
          style={{ ...S.input, fontSize: 22, fontWeight: 700, color: "#0ea5e9" }}
          type="number"
          value={data.monthlyPayment}
          onChange={(e) => onChange({ ...data, monthlyPayment: e.target.value })}
          placeholder="e.g. 485.00"
        />
        {data.monthlyPayment && (
          <div style={{ marginTop: 12, background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ fontSize: 11, color: "#0369a1", fontWeight: 700, marginBottom: 4 }}>Will display on proposal as:</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
              {"$" + parseFloat(data.monthlyPayment).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "/month"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NotesStep({ notes, onChange }) {
  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Proposal Notes</h2>
      <p style={S.stepSub}>Add any warranty info, timeline, payment terms, or other details for the customer.</p>
      <textarea style={{ ...S.input, height: 140, resize: "vertical" }} value={notes} onChange={(e) => onChange(e.target.value)} placeholder="Warranty, timeline, payment terms, start date, special conditions..." />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared proposal HTML builder
// mode: "scope"   = overview + scope only, NO pricing, ends with reveal button
// mode: "preview" = overview + scope + interactive pricing options
// mode: "pdf"     = overview + scope + pricing (static) + full materials list
// ─────────────────────────────────────────────────────────────────────────────
function buildProposalHTML(state, selectedOption, mode) {
  const t = calcGrandTotal(state);
  const priority = t.total;
  const standard = t.total * 1.0835;
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const monthlyPayment = state.financing && state.financing.monthlyPayment ? parseFloat(state.financing.monthlyPayment) : null;
  const clearanceDays = (state.pricing && state.pricing.clearanceDays) ? state.pricing.clearanceDays : "14";

  const css = `
    body{font-family:Georgia,serif;padding:28px;max-width:820px;margin:0 auto;color:#0f172a;font-size:12px}
    .hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:18px;border-bottom:2.5px solid #0f172a;margin-bottom:22px}
    .sec{margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid #e2e8f0}
    .lbl{font-size:9.5px;font-weight:800;color:#0ea5e9;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:10px}
    .check{color:#22c55e;font-weight:800;margin-right:6px}
    .row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:11px}
    .opt{border:2px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:12px;cursor:pointer}
    .opt.sel{border-color:#0ea5e9;background:#f0f9ff}
    .radio{width:18px;height:18px;border-radius:50%;border:2px solid #cbd5e1;background:white;display:inline-flex;align-items:center;justify-content:center;margin-right:10px;vertical-align:middle;flex-shrink:0}
    .radio.on{border-color:#0ea5e9;background:#0ea5e9}
    .dot{width:7px;height:7px;border-radius:50%;background:white}
    .badge{background:#dcfce7;color:#166534;border-radius:20px;padding:3px 12px;display:inline-block;font-size:10px;font-weight:800;margin-top:6px}
    table{width:100%;border-collapse:collapse;font-size:10.5px;margin-bottom:8px}
    th{background:#0f172a;color:white;padding:7px 10px;text-align:left;font-size:9.5px;font-weight:700;letter-spacing:0.5px}
    td{padding:6px 10px;border-bottom:1px solid #f1f5f9;color:#334155}
    tr:nth-child(even) td{background:#f8fafc}
    .note{font-size:9px;color:#94a3b8;margin-top:8px;font-style:italic}
    @media print{body{padding:12px}}
  `;

  // ── Scope bullets per service ──────────────────────────────────────────────
  const scopeMap = {
    siding: {
      label: "James Hardie " + (state.siding.sidingType || "Siding"),
      bullets: [
        state.siding.walls.some(w => w.removalRequired && w.removalRequired.includes("Yes")) ? "Remove and dispose of existing exterior siding" : null,
        "Inspect and prepare substrate — repair damaged sheathing as needed",
        "Install continuous weather-resistive barrier (WRB) and tape all seams",
        "Install metal flashing at all windows, doors, roof lines, and penetrations",
        "Install " + (state.siding.sidingType || "James Hardie siding") + " per manufacturer specifications",
        "Install HardieTrim at all corners, windows, doors, and eaves",
        "Caulk all joints and penetrations with paintable elastomeric sealant",
        "Apply primer and two coats of exterior paint using directional spray",
        "Final inspection per James Hardie installation requirements",
      ].filter(Boolean),
      detail: state.siding.walls.map(w => {
        const prod = w.hardieProduct === "lap" ? "HardiePlank Lap" : w.hardieProduct === "panel" ? "HardiePanel" : w.hardieProduct === "shake" ? "HardieShingle" : "Hardie";
        return (w.location || w.label) + ": " + prod + (w.hardieSize ? " " + w.hardieSize : "") + (w.hardieTexture ? ", " + w.hardieTexture : "") + (w.sqft ? " — " + w.sqft + " sq ft" : "") + (w.notes ? " (" + w.notes + ")" : "");
      }),
    },
    soffit: {
      label: "Soffit Installation",
      bullets: [
        "Remove deteriorated soffit panels and J/F-channel",
        "Inspect rafter tails for rot, damage, or pest intrusion — repair as needed",
        "Install new vented soffit panels with proper ventilation clearances",
        "Install J-channel, F-channel, and corner trim for clean finished appearance",
        "Final inspection — verify ventilation, fastener spacing, and water drainage",
      ],
      detail: state.soffit.items.map(i => (i.label || "Area") + ": " + (i.newMaterial || "Material TBD") + (i.linearFt ? " — " + i.linearFt + " linear ft" : "") + (i.notes ? " (" + i.notes + ")" : "")),
    },
    fascia: {
      label: "Fascia Installation",
      bullets: [
        "Remove deteriorated fascia boards and trim",
        "Inspect and repair rafter tails as needed",
        "Install new fascia — secure plumb and level at each rafter tail",
        "Install drip edge at roof-to-fascia junction to direct water away",
        "Caulk all joints and end caps",
      ],
      detail: state.fascia.items.map(i => (i.label || "Area") + ": " + (i.newMaterial || "Material TBD") + (i.linearFt ? " — " + i.linearFt + " linear ft" : "") + (i.notes ? " (" + i.notes + ")" : "")),
    },
    paint: {
      label: "Exterior Paint",
      bullets: [
        "Pressure wash all exterior surfaces — allow to fully dry",
        "Fill all cracks, gaps, and holes with exterior-grade elastomeric caulk",
        "Mask all windows, doors, fixtures, and landscaping",
        "Seal all bare wood and repaired areas with surface sealer",
        "Apply first coat using directional spray technique for full penetration",
        "Apply second coat using directional spray for uniform coverage",
        "Hand-paint all trim, corners, shutters, and detail areas",
        "Remove masking, clean overspray, dispose of materials properly",
        "Final walk-through to confirm coverage and finish quality",
      ],
      detail: [
        ...state.paint.walls.filter(a => a.paintProduct || a.colorName).map(a => "Walls: " + (a.paintProduct || "") + (a.colorName ? " — " + a.colorName : "") + (a.notes ? " (" + a.notes + ")" : "")),
        ...state.paint.trim.filter(a => a.paintProduct || a.colorName).map(a => "Trim: " + (a.paintProduct || "") + (a.colorName ? " — " + a.colorName : "") + (a.notes ? " (" + a.notes + ")" : "")),
        ...(state.paint.other || []).filter(a => a.paintProduct || a.colorName || a.notes).map(a => "Other: " + (a.paintProduct || "") + (a.colorName ? " — " + a.colorName : "") + (a.notes ? " (" + a.notes + ")" : "")),
      ],
    },
    windows: {
      label: "Window Installation",
      bullets: [
        "Verify rough opening dimensions match ordered units",
        "Remove existing windows — preserve trim where possible",
        "Inspect framing, sill, and flashing for rot or damage — repair as needed",
        "Install new unit plumb, level, and square — shim as needed",
        "Air seal gaps with low-expansion foam only (per Pella installation requirements)",
        "Install exterior casing or brick mold — caulk all seams",
        "Install interior casing and trim as needed",
        "Install all hardware, adjust operation, verify locks and weatherstripping",
        "Final inspection — test operation and weathertightness",
      ],
      detail: state.windows.map(w => {
        const mfr = w.manufacturer === "Other" ? (w.manufacturerOther || "Other") : (w.manufacturer || "");
        return (w.label || "Window") + ": " + mfr + (w.style ? " " + w.style : "") + (w.width && w.height ? " " + w.width + "×" + w.height + '"' : "") + (w.frameColor ? ", " + w.frameColor : "") + (w.glassType ? ", " + w.glassType : "") + " — qty " + (w.qty || 1) + (w.notes ? " (" + w.notes + ")" : "");
      }),
    },
    misc: {
      label: "Additional Items",
      bullets: state.misc.items.filter(i => i.description).map(i => i.description + (i.notes ? " — " + i.notes : "")),
      detail: [],
    },
  };

  // ── Materials list (pdf only) ──────────────────────────────────────────────
  function sidingMats() {
    const totalSqFt = state.siding.walls.reduce((a, w) => a + parseFloat(w.sqft || 0), 0);
    const sqftWaste = Math.ceil(totalSqFt * 1.10);
    const wrbSqft = Math.ceil(totalSqFt * 1.15);
    const nailLbs = Math.ceil(totalSqFt / 100);
    const caulkTubes = Math.ceil(totalSqFt / 150);
    const osbWalls = state.siding.walls.filter(w => w.osbSheathing && w.osbSheathing.includes("Yes"));
    const osbSqft = osbWalls.reduce((a, w) => a + parseFloat(w.sqft || 0), 0);
    const osbSheets = Math.ceil((osbSqft * 1.05) / 32);
    const prod = state.siding.walls[0] && state.siding.walls[0].hardieProduct;
    const panelName = prod === "panel" ? "HardiePanel" : prod === "shake" ? "HardieShingle Shake" : "HardiePlank Lap";
    const rows = [
      [panelName + " panels", sqftWaste + " sq ft", "Total " + totalSqFt.toFixed(0) + " sq ft + 10% waste"],
      ["House Wrap / WRB", wrbSqft + " sq ft", "Full wall coverage + 15% seam overlap"],
      ["WRB Seam Tape", Math.ceil(wrbSqft / 1000) + " roll(s)", "All seams and penetrations"],
      ["HardieTrim — Corners", "Measure on site", "All exterior corners"],
      ["HardieTrim — Windows & Doors", "Measure on site", "All opening surrounds"],
      ["HardieTrim — Eave Termination", "Measure on site", "Eave line"],
      ["Metal Drip Cap / Head Flashing", "Measure on site", "Above all windows and doors"],
      ["Step Flashing", "Measure on site", "All roof-wall intersections"],
      ["Metal Starter Strip", "Measure on site", "Base of each wall"],
      ["Hot-Dipped Galvanized Nails 6d/8d", nailLbs + " lb(s)", "Corrosion-resistant — per Hardie fastener spec"],
      ["Paintable Elastomeric Caulk", caulkTubes + " tube(s)", "All trim joints, penetrations, transitions"],
      ["Exterior Primer", Math.ceil(totalSqFt / 350) + " gal", "Applied to all cut ends and bare surfaces"],
      ["Exterior Paint (2 coats)", Math.ceil(totalSqFt / 350) * 2 + " gal", "Two-coat directional spray application"],
    ];
    if (osbWalls.length > 0) {
      rows.push(["OSB Sheathing 7/16\"", osbSheets + " sheet(s)", osbSqft.toFixed(0) + " sq ft replacement area"]);
      rows.push(["Sheathing Fasteners", "1 box", "Code-compliant per replaced sheathing area"]);
    }
    return rows;
  }

  function soffitMats() {
    const totalLnFt = state.soffit.items.reduce((a, i) => a + parseFloat(i.linearFt || 0), 0);
    return [
      ["Vented Soffit Panels", Math.ceil(totalLnFt * 1.5) + " sq ft", "Based on " + totalLnFt.toFixed(0) + " lf + 10% waste"],
      ["J-Channel (wall side)", totalLnFt.toFixed(0) + " lf", "Along all wall edges"],
      ["F-Channel (fascia side)", totalLnFt.toFixed(0) + " lf", "Along all fascia edges"],
      ["Aluminum / Vinyl Fascia Cover Wrap", "Measure on site", "Over existing or new fascia boards"],
      ["Galvanized Roofing Nails or Screws", Math.ceil(totalLnFt / 50) + " box(es)", "Per panel per manufacturer spacing"],
      ["Drip Edge", totalLnFt.toFixed(0) + " lf", "Roof-to-fascia junction"],
    ];
  }

  function paintMats() {
    const sqFt = parseFloat(state.paint.combinedSqft || 0);
    const gal = Math.ceil(sqFt / 350) || 1;
    return [
      ["Exterior Elastomeric Caulk", Math.ceil(sqFt / 200) + " tube(s)", "All cracks, gaps, seams prior to painting"],
      ["Exterior Patching Compound", "As needed", "Holes and surface repairs"],
      ["Masking Tape & Plastic Sheeting", "As needed", "Windows, doors, fixtures, landscaping"],
      ["Exterior Surface Sealer", "As needed", "Bare wood and repaired areas"],
      ["Exterior Paint — 1st coat", gal + " gal", "~350 sq ft per gallon"],
      ["Exterior Paint — 2nd coat", gal + " gal", "Full second coat for lasting adhesion"],
      ["Trim Paint", "As needed", "Hand-applied to all trim and detail areas"],
    ];
  }

  function windowMats() {
    const qty = state.windows.reduce((a, w) => a + parseFloat(w.qty || 0), 0);
    return [
      ["Window Units", qty + " unit(s)", "Per window schedule"],
      ["Sill Pan Flashing", qty + " unit(s)", "One per rough opening — integrated with WRB"],
      ["Flashing Tape (self-adhering)", "As needed", "Head, jamb, and sill integration"],
      ["Low-Expansion Foam Insulation", Math.ceil(qty * 0.5) + " can(s)", "ONLY low-expansion foam per Pella specs"],
      ["Composite Shims", qty + " pack(s)", "Sill, jamb, and head — plumb, level, square"],
      ["Corrosion-Resistant Nails / Screws", "1 box", "Nailing fin attachment per manufacturer"],
      ["Exterior-Grade Elastomeric Caulk", Math.ceil(qty * 0.5) + " tube(s)", "Perimeter seal at all unit flanges"],
      ["Backer Rod", Math.ceil(qty * 12) + " lf", "Behind exterior sealant bead"],
      ["Interior Casing / Trim", "Measure on site", "All openings — match existing profile"],
    ];
  }

  // ── Build the HTML ─────────────────────────────────────────────────────────
  let body = "";

  // Header
  body += `<div class='hdr'>
    <div>
      <div style='font-size:20px;font-weight:800;line-height:1.2'>${state.company.name}</div>
      <div style='color:#64748b;font-size:11px;margin-top:4px'>${state.company.address}</div>
      <div style='color:#64748b;font-size:11px'>${state.company.phone} &nbsp;·&nbsp; Lic# ${state.company.license}</div>
    </div>
    <div style='text-align:right'>
      <div style='font-size:9.5px;font-weight:800;color:#0ea5e9;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px'>Prepared For</div>
      <div style='font-size:18px;font-weight:800'>${state.customer.name || "—"}</div>
      <div style='color:#64748b;font-size:11px;margin-top:4px'>${state.customer.address || ""}</div>
      <div style='color:#64748b;font-size:11px'>${state.customer.phone || ""}</div>
      <div style='color:#94a3b8;font-size:10px;margin-top:6px'>${today} &nbsp;·&nbsp; Valid 30 days</div>
    </div>
  </div>`;

  // Property photo (if any)
  if (state.customer.photo) {
    body += `<div class='sec'><div class='lbl'>Property</div><img src='${state.customer.photo}' style='max-width:100%;max-height:220px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0'/></div>`;
  }

  // Project overview — all services in one list
  body += `<div class='sec'><div class='lbl'>Project Overview</div>`;
  state.services.forEach(svc => {
    if (!scopeMap[svc]) return;
    body += `<div style='display:flex;align-items:center;padding:4px 0;border-bottom:1px solid #f8fafc;font-size:11px;color:#334155'><span class='check'>✓</span><span style='font-weight:700'>${scopeMap[svc].label}</span></div>`;
  });
  body += `</div>`;

  // Detailed scope per service
  state.services.forEach(svc => {
    if (!scopeMap[svc]) return;
    const info = scopeMap[svc];
    body += `<div class='sec'><div class='lbl'>${info.label} — Scope of Work</div>`;
    body += `<div style='border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:12px'>`;
    info.bullets.forEach((b, i) => {
      body += `<div style='padding:7px 12px;font-size:11px;color:#334155;line-height:1.6;background:${i % 2 === 0 ? "white" : "#f8fafc"};border-bottom:1px solid #f1f5f9'>${b}</div>`;
    });
    body += `</div>`;
    // Detail rows (wall elevations, window schedule, etc.)
    if (info.detail && info.detail.length > 0) {
      body += `<div style='font-size:9.5px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px'>Details</div>`;
      info.detail.forEach((d, i) => {
        body += `<div style='font-size:10.5px;color:#334155;line-height:1.8;padding:3px 0;border-bottom:1px solid #f8fafc'>&bull; ${d}</div>`;
      });
    }

    // Materials — PDF only
    if (mode === "pdf") {
      let mats = [];
      if (svc === "siding")  mats = sidingMats();
      if (svc === "soffit")  mats = soffitMats();
      if (svc === "fascia")  mats = soffitMats(); // similar structure
      if (svc === "paint")   mats = paintMats();
      if (svc === "windows") mats = windowMats();
      if (mats.length > 0) {
        body += `<div style='font-size:9.5px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.8px;margin:14px 0 6px'>Materials List</div>`;
        body += `<table><thead><tr><th>Material</th><th>Quantity</th><th>Specification</th></tr></thead><tbody>`;
        mats.forEach(m => {
          body += `<tr><td style='font-weight:600'>${m[0]}</td><td style='color:#0369a1;font-weight:700;white-space:nowrap'>${m[1]}</td><td style='color:#64748b'>${m[2]}</td></tr>`;
        });
        body += `</tbody></table>`;
        if (svc === "siding") body += `<p class='note'>* All James Hardie products installed per HardieZone requirements. Quantities include standard waste factors and are subject to field verification.</p>`;
        if (svc === "windows") body += `<p class='note'>* Low-expansion foam ONLY. High-pressure or latex foam is NOT permitted per Pella installation requirements.</p>`;
      }
    }
    body += `</div>`;
  });

  // ── Investment options — depends on mode ───────────────────────────────────
  if (mode === "scope") {
    // No pricing shown — end with a reveal button
    body += `
    <div style='text-align:center;padding:32px 24px 40px'>
      <div style='font-size:13px;color:#64748b;margin-bottom:20px;line-height:1.6'>
        We've reviewed everything that goes into this project together.<br>
        Ready to go over the investment?
      </div>
      <button
        onclick="window.parent.postMessage({type:'revealPricing'},'*')"
        style='background:linear-gradient(135deg,#0ea5e9,#0369a1);color:white;border:none;border-radius:14px;padding:18px 48px;font-size:17px;font-weight:800;cursor:pointer;box-shadow:0 8px 28px rgba(14,165,233,0.35);letter-spacing:-0.3px;width:100%;max-width:400px'
      >
        Yes, Let's Review the Pricing
      </button>
      <div style='font-size:11px;color:#94a3b8;margin-top:14px'>
        Pricing is based on the full scope of work we just reviewed
      </div>
    </div>`;
  } else {
    // preview or pdf — show investment options
    body += `<div class='sec'><div class='lbl'>Investment Options</div>`;
    if (mode === "preview") {
      body += `
      <div class='opt ${selectedOption === "standard" ? "sel" : ""}' onclick="window.parent.postMessage({type:'selectOption',option:'standard'},'*')">
        <div style='display:flex;justify-content:space-between;align-items:center'>
          <div style='display:flex;align-items:center'>
            <div class='radio ${selectedOption === "standard" ? "on" : ""}'>${selectedOption === "standard" ? "<div class='dot'></div>" : ""}</div>
            <div>
              <div style='font-weight:800;font-size:13px'>Standard Pricing</div>
              <div style='font-size:10px;color:#64748b;margin-top:2px'>Email proposal — no contract today</div>
            </div>
          </div>
          <div style='font-size:24px;font-weight:800;color:#334155'>${fmt(standard)}</div>
        </div>
      </div>
      <div class='opt ${selectedOption === "priority" ? "sel" : ""}' onclick="window.parent.postMessage({type:'selectOption',option:'priority'},'*')">
        <div style='display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px'>
          <div style='display:flex;align-items:center'>
            <div class='radio ${selectedOption === "priority" ? "on" : ""}'>${selectedOption === "priority" ? "<div class='dot'></div>" : ""}</div>
            <div style='font-size:9.5px;font-weight:800;color:#0369a1;text-transform:uppercase;letter-spacing:1px'>Administrative Savings Incentive — Sign Today</div>
          </div>
          <div style='font-size:24px;font-weight:800;color:#0ea5e9'>${fmt(priority)}</div>
        </div>
        <div class='badge'>You save ${fmt(standard - priority)}</div>
        ${monthlyPayment ? "<div style='margin-top:12px;padding-top:12px;border-top:1px solid #bae6fd'><div style='font-size:10px;font-weight:800;color:#0369a1;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px'>Or Finance For</div><div style='font-size:24px;font-weight:800;color:#0f172a'>$" + monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "<span style='font-size:14px;color:#64748b;font-weight:600'>/mo</span></div><div style='font-size:10px;color:#94a3b8;margin-top:3px'>Subject to credit approval</div></div>" : ""}
      </div>
      <div class='opt ${selectedOption === "clearance" ? "sel" : ""}' onclick="window.parent.postMessage({type:'selectOption',option:'clearance'},'*')" style='border-color:${selectedOption === "clearance" ? "#f59e0b" : "#e2e8f0"};background:${selectedOption === "clearance" ? "#fffbeb" : "white"}'>
        <div style='display:flex;justify-content:space-between;align-items:center'>
          <div style='display:flex;align-items:center'>
            <div class='radio' style='border-color:${selectedOption === "clearance" ? "#f59e0b" : "#cbd5e1"};background:${selectedOption === "clearance" ? "#f59e0b" : "white"}'>${selectedOption === "clearance" ? "<div class='dot'></div>" : ""}</div>
            <div>
              <div style='font-weight:800;font-size:13px;color:#92400e'>Administrative Clearance</div>
              <div style='font-size:10px;color:#a16207;margin-top:2px'>Shop &amp; compare — we'll beat any matching quote by 10%</div>
            </div>
          </div>
          <div style='font-size:24px;font-weight:800;color:#f59e0b'>${fmt(standard)}</div>
        </div>
        ${selectedOption === "clearance" ? "<div style='margin-top:12px;padding-top:12px;border-top:1px solid #fde68a;background:#fef3c7;border-radius:8px;padding:12px 14px;font-size:11px;color:#92400e;line-height:1.7'>You have <strong>" + clearanceDays + " days</strong> to shop and find a lower price for the exact same scope of work.<br><br>If you find a lower price, provide us with a <strong>written estimate on the competing company's official letterhead</strong> covering the exact same materials, specifications, and scope. We will review it to confirm it matches our proposal exactly.<br><br><strong>If it matches — we will not only meet their price, we will beat it by 10%.</strong></div>" : ""}
      </div>`;
    } else {
      // pdf — static
      body += `<div class='row' style='font-size:12px'><span>Standard Pricing</span><span style='font-weight:800'>${fmt(standard)}</span></div>`;
      body += `<div class='row' style='font-size:13px'><span style='font-weight:700;color:#0369a1'>Administrative Savings Incentive</span><span style='font-weight:800;color:#0ea5e9'>${fmt(priority)}</span></div>`;
      body += `<div style='background:#dcfce7;color:#166534;border-radius:8px;padding:8px 14px;margin-top:6px;font-size:11px;font-weight:700'>You save ${fmt(standard - priority)} by signing today</div>`;
      if (monthlyPayment) {
        body += `<div style='margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0'><div style='font-size:10px;font-weight:800;color:#0369a1;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px'>Or Finance For</div><div style='font-size:22px;font-weight:800;color:#0f172a'>$${monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span style='font-size:13px;color:#64748b;font-weight:600'>/mo</span></div><div style='font-size:10px;color:#94a3b8;margin-top:3px'>Subject to credit approval</div></div>`;
      }
      body += `<div style='margin-top:14px;border:2px solid #fde68a;border-radius:8px;padding:12px 14px;background:#fffbeb'>`;
      body += `<div style='font-size:10px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px'>Administrative Clearance Option</div>`;
      body += `<div style='font-size:11px;color:#78350f;line-height:1.7'>You have <strong>${clearanceDays} days</strong> to shop and find a lower price for the exact same scope of work. If you find a lower price, provide a <strong>written estimate on the competing company's official letterhead</strong> covering the exact same materials, specifications, and scope. We will review it carefully to confirm it matches our proposal exactly. <strong>If it matches — we will not only meet their price, we will beat it by 10%.</strong></div>`;
      body += `</div>`;
    }
    body += `</div>`;
  }

  // Notes section if any
  if (state.notes) {
    body += `<div class='sec'><div class='lbl'>Notes</div><div style='font-size:11px;color:#334155;line-height:1.8;white-space:pre-wrap'>${state.notes}</div></div>`;
  }

  const script = mode !== "pdf"
    ? `<script>
        function selectOption(o){window.parent.postMessage({type:'selectOption',option:o},'*');}
      </script>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset='utf-8'><style>${css}</style></head><body>${body}${script}</body></html>`;
}

function PreviewStep({ state, setStep, steps, selectedOption, setSelectedOption, selectedPayment, setSelectedPayment }) {
  const [sending, setSending] = useState(false);
  const [emailOverride, setEmailOverride] = useState(state.customer.email);
  const [bccEmail, setBccEmail] = useState("");
  // Two-phase: scope-only first, then pricing revealed
  const [pricingRevealed, setPricingRevealed] = useState(false);

  const handleSend = async () => {
    if (!emailOverride) { alert("Please enter a customer email address."); return; }
    setSending(true);
    alert("Email integration: Connect EmailJS or SendGrid to enable real delivery. Download the PDF and email manually, or integrate your email service.");
    setSending(false);
  };

  useEffect(() => {
    function handler(e) {
      if (!e.data) return;
      if (e.data.type === "revealPricing") setPricingRevealed(true);
      if (e.data.type === "selectOption")  setSelectedOption(e.data.option);
      if (e.data.type === "selectPayment") setSelectedPayment(e.data.payment);
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const t = calcGrandTotal(state);
  const priority = t.total;
  const standard = t.total * 1.0835;

  // Scope-only HTML — overview + scope, ends with "Ready to review pricing?" button
  const scopeHtml    = buildProposalHTML(state, selectedOption, "scope");
  // Full preview HTML — scope + interactive pricing options
  const previewHtml  = buildProposalHTML(state, selectedOption, "preview");
  // PDF HTML — scope + static pricing + full materials list
  const pdfHtml      = buildProposalHTML(state, selectedOption, "pdf");

  // What the iframe shows depends on whether pricing has been revealed
  const iframeHtml = pricingRevealed ? previewHtml : scopeHtml;

  return (
    <div style={{ padding: "0 0 24px" }}>
      <div style={{ padding: "16px 24px 8px", fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Proposal Preview</div>
      <div style={{ padding: "0 24px 12px", borderBottom: "1px solid #e2e8f0", marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>Tap any section to edit and come back</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button onClick={() => setStep(steps.findIndex(s => s.key === "customer"))} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Edit Customer</button>
          {state.services.includes("siding") && <button onClick={() => setStep(steps.findIndex(s => s.key === "siding"))} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Edit Siding</button>}
          {state.services.includes("soffit") && <button onClick={() => setStep(steps.findIndex(s => s.key === "soffit"))} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Edit Soffits</button>}
          {state.services.includes("fascia") && <button onClick={() => setStep(steps.findIndex(s => s.key === "fascia"))} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Edit Fascia</button>}
          {state.services.includes("paint") && <button onClick={() => setStep(steps.findIndex(s => s.key === "paint"))} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Edit Paint</button>}
          {state.services.includes("windows") && <button onClick={() => setStep(steps.findIndex(s => s.key === "windows"))} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Edit Windows</button>}
          {state.services.includes("misc") && <button onClick={() => setStep(steps.findIndex(s => s.key === "misc"))} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Edit Misc</button>}
          <button onClick={() => setStep(0)} style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#dc2626", cursor: "pointer" }}>Edit Services</button>
          <span style={{ fontSize: 10, color: "#94a3b8", alignSelf: "center", whiteSpace: "nowrap" }}>Pricing &amp; financing → 🔧 Rep Pricing</span>
        </div>
      </div>
      {/* IFRAME — scope-only until pricing revealed, then full pricing view */}
      <iframe
        srcDoc={iframeHtml}
        style={{ width: "100%", height: pricingRevealed ? 680 : 600, border: "none", display: "block" }}
        title="Proposal"
      />

      <div style={{ padding: "16px 24px 0" }}>
        {/* Pricing revealed status */}
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

        {/* Selected option badge */}
        {pricingRevealed && selectedOption && (
          <div style={{
            background: selectedOption === "clearance" ? "#fffbeb" : "#f0f9ff",
            border: "1.5px solid " + (selectedOption === "clearance" ? "#fde68a" : "#bae6fd"),
            borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: selectedOption === "clearance" ? "#92400e" : "#0369a1" }}>
              {selectedOption === "priority" ? "Administrative Savings Incentive" : selectedOption === "clearance" ? "Administrative Clearance" : "Standard Pricing"}
            </span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
              {selectedOption === "priority" ? fmt(priority) : fmt(standard)}
            </span>
          </div>
        )}

        {/* Proceed to contract — for priority or clearance */}
        {pricingRevealed && (selectedOption === "priority" || selectedOption === "clearance") && (
          <button
            style={{ background: selectedOption === "clearance" ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#0ea5e9,#0369a1)", color: "white", border: "none", borderRadius: 10, padding: "14px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%", marginBottom: 12 }}
            onClick={() => setStep(steps.findIndex(s => s.key === "contract"))}
          >
            Proceed to Contract & Sign
          </button>
        )}

        {/* Email / PDF — only shown after pricing revealed */}
        {pricingRevealed && (
          <>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Customer Email</label>
              <input style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 15, color: "#1e293b", outline: "none" }} type="email" value={emailOverride} onChange={e => setEmailOverride(e.target.value)} placeholder="customer@email.com" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>BCC — Your Email</label>
              <input style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 15, color: "#1e293b", outline: "none" }} type="email" value={bccEmail} onChange={e => setBccEmail(e.target.value)} placeholder="yourname@email.com" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                style={{ background: "linear-gradient(135deg,#0ea5e9,#0369a1)", color: "white", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%", opacity: sending ? 0.7 : 1 }}
                onClick={handleSend} disabled={sending}
              >
                {sending ? "Sending..." : "Send Proposal by Email (with Materials List)"}
              </button>
              <button
                style={{ background: "white", color: "#0f172a", border: "1.5px solid #0f172a", borderRadius: 10, padding: "12px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%" }}
                onClick={() => {
                  const clientName = state.customer.name ? state.customer.name.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/ /g, "_") : "Client";
                  const dateStr = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }).replace(/\//g, "-");
                  const filename = "NDC_Proposal_" + clientName + "_" + dateStr;
                  const newWin = window.open("", "_blank");
                  if (newWin) {
                    newWin.document.write(pdfHtml);
                    newWin.document.close();
                    newWin.document.title = filename;
                    setTimeout(() => { newWin.focus(); newWin.print(); }, 800);
                  }
                }}
              >
                Save / Print PDF (includes Materials List)
              </button>
            </div>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 10, textAlign: "center", lineHeight: 1.5 }}>
              Preview shows overview & scope only. PDF includes full materials list.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function ContractStep({ state, selectedOption, selectedPayment, setStep, steps }) {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const canvasRef = useRef(null);
  const [isSigning, setIsSigning] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [repName, setRepName] = useState("CJ Shires");

  const t = calcGrandTotal(state);
  const priority = t.total;
  const standard = t.total * 1.0835;
  const chosenTotal = selectedOption === "priority" ? priority : standard;

  const startDraw = (e) => {
    setIsSigning(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.beginPath(); ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isSigning) return; e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.strokeStyle = "#0f172a";
    ctx.lineTo(x, y); ctx.stroke();
  };

  const endDraw = () => {
    setIsSigning(false);
    const canvas = canvasRef.current;
    setSignatureData(canvas.toDataURL('image/png'));
    setHasSigned(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false); setSignatureData(null);
  };

  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Contract & Signature</h2>
      <p style={S.stepSub}>Review with your client and collect their signature below.</p>

      <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, paddingBottom: 16, borderBottom: "2px solid #0f172a" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>New Direction Construction</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>820 Worth Rd, Jacksonville, FL 32259</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>(904) 891-9980 | Lic# CBC059304</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0ea5e9" }}>PREPARED FOR</div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{state.customer.name}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{state.customer.address}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{today}</div>
          </div>
        </div>

        <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Agreed Investment</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: selectedOption === "clearance" ? 12 : 0 }}>
            <div style={{ fontSize: 12, color: "#334155", fontWeight: 600 }}>
              {selectedOption === "priority" ? "Administrative Savings Incentive" : selectedOption === "clearance" ? "Administrative Clearance" : "Standard Pricing"}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{fmt(chosenTotal)}</div>
          </div>
          {selectedOption === "clearance" && (
            <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 8, padding: "12px 14px", fontSize: 11, color: "#78350f", lineHeight: 1.7 }}>
              <div style={{ fontWeight: 800, color: "#92400e", marginBottom: 6, textTransform: "uppercase", fontSize: 10, letterSpacing: "0.5px" }}>Administrative Clearance Terms</div>
              Client has <strong>{(state.pricing && state.pricing.clearanceDays) || "14"} days</strong> from the date of this signed agreement to shop and find a lower price for the exact same scope of work. Any competing quote must be submitted in writing on the competing company's official letterhead, must cover the exact same materials, specifications, and scope, and must be presented to a New Direction Construction representative within the shopping period.<br /><br />
              If a qualifying written quote is presented that is lower in price and matches the scope exactly, <strong>New Direction Construction will not only meet that price — we will beat it by 10%.</strong>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Client Signature</div>
          <div style={{ position: "relative", border: "1.5px solid #e2e8f0", borderRadius: 8, background: "#f8fafc", overflow: "hidden", height: 120 }}>
            <canvas
              ref={canvasRef} width={600} height={120}
              style={{ display: "block", width: "100%", height: 120, touchAction: "none", cursor: "crosshair" }}
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
            />
            {!hasSigned && (
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 12, color: "#cbd5e1", pointerEvents: "none", fontStyle: "italic" }}>
                Sign here
              </div>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>{state.customer.name} · {today}</div>
            <button onClick={clearSignature} style={{ fontSize: 10, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Clear</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
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

      {hasSigned && <div style={{ background: "#dcfce7", border: "1.5px solid #86efac", borderRadius: 8, padding: "12px 16px", marginBottom: 12, fontSize: 12, fontWeight: 700, color: "#166534", textAlign: "center" }}>Contract Signed — Ready to Send!</div>}

      <button
        style={{ background: hasSigned ? "linear-gradient(135deg,#0ea5e9,#0369a1)" : "#e2e8f0", color: hasSigned ? "white" : "#94a3b8", border: "none", borderRadius: 10, padding: "14px 24px", fontWeight: 700, fontSize: 15, cursor: hasSigned ? "pointer" : "default", width: "100%" }}
        onClick={() => hasSigned && setStep(steps.findIndex(s => s.key === "preview"))}
      >
        {hasSigned ? "Back to Preview & Send" : "Sign Contract to Continue"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// buildSteps — preview handles the pricing gate internally
function buildSteps(services) {
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
  return steps;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper components
// ─────────────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={S.field}>
      <label style={S.label}>{label}</label>
      <input style={S.input} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App — main component
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  const [step, setStep] = useState(() => {
    try { return parseInt(localStorage.getItem("ndc_step") || "0"); } catch { return 0; }
  });
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem("ndc_state");
      if (!saved) return makeInitialState();
      const parsed = JSON.parse(saved);
      const defaults = makeInitialState();
      // Merge top-level keys so new fields (like clearanceDays) always exist
      return {
        ...defaults,
        ...parsed,
        pricing: { ...defaults.pricing, ...(parsed.pricing || {}) },
        financing: { ...defaults.financing, ...(parsed.financing || {}) },
        company: { ...defaults.company, ...(parsed.company || {}) },
        customer: { ...defaults.customer, ...(parsed.customer || {}) },
        siding: { ...defaults.siding, ...(parsed.siding || {}) },
        soffit: { ...defaults.soffit, ...(parsed.soffit || {}) },
        fascia: { ...defaults.fascia, ...(parsed.fascia || {}) },
        paint: { ...defaults.paint, ...(parsed.paint || {}) },
        misc: { ...defaults.misc, ...(parsed.misc || {}) },
      };
    } catch { return makeInitialState(); }
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const steps = buildSteps(state.services);

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

  return (
    <div style={S.app}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={S.headerTitle}>ProposalBuilder</div>
            <div style={S.headerSub}>New Direction Construction · On-Site Estimator</div>
          </div>
          {/* Rep-only pricing tool button */}
          <button
            onClick={() => setShowPricingModal(true)}
            title="Rep Pricing Tool (not visible to client)"
            style={{
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8, color: "white", padding: "6px 10px", cursor: "pointer",
              fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4
            }}
          >
            🔧 Rep Pricing
          </button>
        </div>
      </div>

      {/* Rep Pricing Modal */}
      {showPricingModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)", zIndex: 1000,
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          overflowY: "auto", padding: "20px 0"
        }}>
          <div style={{
            background: "white", borderRadius: 16, width: "100%", maxWidth: 640,
            margin: "0 16px", boxShadow: "0 24px 64px rgba(0,0,0,0.3)"
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 20px", borderBottom: "1px solid #e2e8f0",
              background: "#fef9c3", borderRadius: "16px 16px 0 0"
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#92400e" }}>🔧 Rep Pricing Tool</div>
                <div style={{ fontSize: 11, color: "#a16207" }}>Private — for your eyes only, not shown to client</div>
              </div>
              <button onClick={() => setShowPricingModal(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#64748b" }}>×</button>
            </div>
            <div style={{ padding: "0 4px 16px" }}>
              <PricingStep
                state={state}
                onChange={(v) => setState(s => ({ ...s, pricing: v, financing: { ...s.financing, monthlyPayment: v.monthlyPayment || "" } }))}
              />
              {/* Notes — also rep-only, edited here */}
              <div style={{ padding: "0 20px 8px" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Proposal Notes</div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>Add warranty, timeline, payment terms, or any other details to include on the proposal.</div>
                <textarea
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#1e293b", outline: "none", background: "white", height: 100, resize: "vertical" }}
                  value={state.notes || ""}
                  onChange={(e) => setState(s => ({ ...s, notes: e.target.value }))}
                  placeholder="e.g. 1-year labor warranty, work begins within 3 weeks of signing, 50% due at signing..."
                />
              </div>
            </div>
            <div style={{ padding: "0 20px 20px" }}>
              <button onClick={() => setShowPricingModal(false)} style={{ background: "linear-gradient(135deg,#0ea5e9,#0369a1)", color: "white", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", width: "100%" }}>
                Done — Save Pricing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ ...S.progress, overflowX: "auto" }}>
        {steps.map((s, i) => (
          <div key={s.key} style={{ ...S.progressStep, cursor: i < step ? "pointer" : "default", minWidth: 44 }} onClick={() => i < step && setStep(i)}>
            <div style={{ ...S.progressDot, background: i <= step ? "#0ea5e9" : "#e2e8f0" }}>{i < step ? "✓" : i + 1}</div>
            <span style={{ fontSize: 8, marginTop: 3, color: i <= step ? "#0ea5e9" : "#94a3b8", fontWeight: i === step ? 700 : 400, whiteSpace: "nowrap" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step body */}
      <div style={S.body}>
        {currentKey === "services"   && <ServiceSelectStep selected={state.services} onChange={(v) => setState((s) => ({ ...s, services: v }))} />}
        {currentKey === "customer"   && <CustomerStep data={state.customer} onChange={(k, v) => update("customer", k, v)} />}
        {currentKey === "siding"     && <SidingStep data={state.siding} onChange={(k, v) => setState((s) => ({ ...s, siding: { ...s.siding, [k]: v } }))} onSidingTypeChange={(type) => setState((s) => ({ ...s, siding: { ...s.siding, sidingType: type }, sidingMaterials: defaultSidingMaterials(type) }))} state={state} />}
        {currentKey === "soffit"     && <SoffitStepSimple title="Soffits" data={state.soffit} onChange={(v) => setState((s) => ({ ...s, soffit: v }))} />}
        {currentKey === "fascia"     && <SoffitStepSimple title="Fascia" data={state.fascia} onChange={(v) => setState((s) => ({ ...s, fascia: v }))} />}
        {currentKey === "paint"      && <PaintStep data={state.paint} onChange={(v) => setState((s) => ({ ...s, paint: v }))} />}
        {currentKey === "windows"    && <WindowsStep windows={state.windows} onChange={(v) => setState((s) => ({ ...s, windows: v }))} />}
        {currentKey === "misc"       && <MiscStep data={state.misc} onChange={(v) => setState((s) => ({ ...s, misc: v }))} />}
        {currentKey === "preview"    && <PreviewStep state={state} setStep={setStep} steps={steps} selectedOption={selectedOption} setSelectedOption={setSelectedOption} selectedPayment={selectedPayment} setSelectedPayment={setSelectedPayment} />}
        {currentKey === "contract"   && <ContractStep state={state} selectedOption={selectedOption} selectedPayment={selectedPayment} setStep={setStep} steps={steps} />}
      </div>

      {/* Nav buttons */}
      {step < lastStep && currentKey !== "preview" && currentKey !== "contract" && (
        <div style={S.nav}>
          {step > 0 && <button style={S.secondaryBtn} onClick={() => setStep(step - 1)}>← Back</button>}
          <button style={{ ...S.primaryBtn, marginLeft: "auto", opacity: canNext() ? 1 : 0.5 }} disabled={!canNext()} onClick={() => setStep(step + 1)}>
            Next →
          </button>
        </div>
      )}

      {(currentKey === "preview" || currentKey === "contract") && (
        <div style={S.nav}>
          <button style={S.secondaryBtn} onClick={() => setStep(step - 1)}>← Back</button>
          <button style={{ ...S.secondaryBtn, marginLeft: "auto" }} onClick={() => {
            if (window.confirm("Clear all proposal data and start a new proposal?")) {
              localStorage.removeItem("ndc_state");
              localStorage.removeItem("ndc_step");
              setState(makeInitialState());
              setStep(0);
              setSelectedOption(null);
              setSelectedPayment(null);
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
