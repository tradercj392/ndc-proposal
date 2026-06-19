const { google } = require("googleapis");

const SHEET_ID = "1_1H-pk-iZsNQ8G7irB6WI3YZCogtHPhmK6GSK8e30Xg";
const SHEET_NAME = "Sheet1";

function getAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : null;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  if (!privateKey || !clientEmail) throw new Error("Missing Google credentials");
  return new google.auth.GoogleAuth({
    credentials: { type: "service_account", project_id: "lucid-hook-499911-d7", private_key: privateKey, client_email: clientEmail },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

// Ensure header row exists
async function ensureHeaders(sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1:F1`,
  });
  if (!res.data.values || res.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [["ID", "Client Name", "Services", "Saved At", "Step", "Data"]] },
    });
  }
}

async function listProposals(sheets) {
  await ensureHeaders(sheets);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:F1000`,
  });
  const rows = res.data.values || [];
  return rows.filter(r => r[0]).map(r => ({
    driveId: r[0],
    clientName: r[1] || "",
    services: r[2] || "",
    savedAt: r[3] || "",
    step: parseInt(r[4] || "0"),
    name: (r[1] || "Unknown") + "_" + (r[3] || "").split("T")[0],
  })).reverse();
}

async function findRowById(sheets, id) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:A1000`,
  });
  const rows = res.data.values || [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === id) return i + 2; // 1-indexed, +1 for header
  }
  return null;
}

async function saveProposal(sheets, { fileName, data, driveId }) {
  await ensureHeaders(sheets);
  const id = driveId || ("ndc_" + Date.now());
  const clientName = (data.state && data.state.customer && data.state.customer.name) || fileName;
  const services = (data.services || []).join(", ");
  const savedAt = new Date().toISOString();
  const step = data.step || 0;
  const jsonData = JSON.stringify(data);
  const rowData = [id, clientName, services, savedAt, step, jsonData];

  if (driveId) {
    // Update existing row
    const rowNum = await findRowById(sheets, driveId);
    if (rowNum) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A${rowNum}:F${rowNum}`,
        valueInputOption: "RAW",
        requestBody: { values: [rowData] },
      });
      return { driveId };
    }
  }

  // Append new row
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [rowData] },
  });
  return { driveId: id };
}

async function loadProposal(sheets, driveId) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:F1000`,
  });
  const rows = res.data.values || [];
  const row = rows.find(r => r[0] === driveId);
  if (!row) throw new Error("Proposal not found");
  return JSON.parse(row[5]);
}

async function deleteProposal(sheets, driveId) {
  const rowNum = await findRowById(sheets, driveId);
  if (!rowNum) throw new Error("Proposal not found");
  // Clear the row
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowNum}:F${rowNum}`,
  });
  return { success: true };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const sheets = await getSheets();
    const { action } = req.query;

    switch (action) {
      case "list": {
        const proposals = await listProposals(sheets);
        return res.status(200).json({ proposals });
      }
      case "save": {
        const { fileName, data, driveId } = req.body;
        if (!fileName || !data) return res.status(400).json({ error: "Missing fileName or data" });
        const result = await saveProposal(sheets, { fileName, data, driveId });
        return res.status(200).json(result);
      }
      case "load": {
        const { driveId } = req.query;
        if (!driveId) return res.status(400).json({ error: "Missing driveId" });
        const data = await loadProposal(sheets, driveId);
        return res.status(200).json({ data });
      }
      case "delete": {
        const { driveId } = req.body;
        if (!driveId) return res.status(400).json({ error: "Missing driveId" });
        const result = await deleteProposal(sheets, driveId);
        return res.status(200).json(result);
      }
      default:
        return res.status(400).json({ error: "Unknown action: " + action });
    }
  } catch (err) {
    console.error("Sheets API error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
