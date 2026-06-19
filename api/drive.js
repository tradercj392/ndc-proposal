// api/drive.js — Vercel Serverless Function
// Handles all Google Drive operations for NDC ProposalBuilder
// Credentials stored as Vercel Environment Variables — never exposed to browser

const { google } = require("googleapis");

const FOLDER_ID = "1uWtJjpp_eRJ1uG0mjpRCU9PNaHUDJhoS";
const PDFS_FOLDER_NAME = "PDFs";
const CONTRACTS_FOLDER_NAME = "Contracts";

function getAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : null;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error("Missing Google credentials in environment variables");
  }

  return new google.auth.GoogleAuth({
    credentials: {
      type: "service_account",
      project_id: "lucid-hook-499911-d7",
      private_key: privateKey,
      client_email: clientEmail,
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
}

async function getDrive() {
  const auth = getAuth();
  return google.drive({ version: "v3", auth });
}

// Find or create a subfolder inside the main NDC Proposals folder
async function getOrCreateSubfolder(drive, name) {
  const res = await drive.files.list({
    q: `'${FOLDER_ID}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id,name)",
  });
  if (res.data.files.length > 0) return res.data.files[0].id;
  const created = await drive.files.create({
    requestBody: { name, mimeType: "application/vnd.google-apps.folder", parents: [FOLDER_ID] },
    fields: "id",
  });
  return created.data.id;
}

// List all saved proposals
async function listProposals(drive) {
  const res = await drive.files.list({
    q: `'${FOLDER_ID}' in parents and mimeType='application/json' and trashed=false`,
    fields: "files(id,name,modifiedTime,description)",
    orderBy: "modifiedTime desc",
  });
  return res.data.files.map(f => ({
    driveId: f.id,
    name: f.name.replace(".json", ""),
    savedAt: f.modifiedTime,
    description: f.description || "",
  }));
}

// Save or update a proposal JSON
async function saveProposal(drive, { fileName, data, driveId }) {
  const content = JSON.stringify(data);
  const media = { mimeType: "application/json", body: content };

  if (driveId) {
    // Update existing file
    await drive.files.update({
      fileId: driveId,
      requestBody: { name: fileName + ".json" },
      media,
    });
    return { driveId };
  } else {
    // Create new file
    const res = await drive.files.create({
      requestBody: {
        name: fileName + ".json",
        parents: [FOLDER_ID],
        mimeType: "application/json",
      },
      media,
      fields: "id",
    });
    return { driveId: res.data.id };
  }
}

// Load a proposal by driveId
async function loadProposal(drive, driveId) {
  const res = await drive.files.get({
    fileId: driveId,
    alt: "media",
  });
  return res.data;
}

// Delete a proposal
async function deleteProposal(drive, driveId) {
  await drive.files.delete({ fileId: driveId });
  return { success: true };
}

// Save a PDF (base64 encoded) to PDFs or Contracts subfolder
async function savePDF(drive, { fileName, base64Data, type }) {
  const folderName = type === "contract" ? CONTRACTS_FOLDER_NAME : PDFS_FOLDER_NAME;
  const folderId = await getOrCreateSubfolder(drive, folderName);
  const buffer = Buffer.from(base64Data, "base64");
  const { Readable } = require("stream");
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  const res = await drive.files.create({
    requestBody: {
      name: fileName + ".pdf",
      parents: [folderId],
      mimeType: "application/pdf",
    },
    media: { mimeType: "application/pdf", body: stream },
    fields: "id,webViewLink",
  });
  return { driveId: res.data.id, link: res.data.webViewLink };
}

// ─── Main Handler ────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const drive = await getDrive();
    const { action } = req.query;

    switch (action) {
      case "list": {
        const proposals = await listProposals(drive);
        return res.status(200).json({ proposals });
      }

      case "save": {
        const { fileName, data, driveId } = req.body;
        if (!fileName || !data) return res.status(400).json({ error: "Missing fileName or data" });
        const result = await saveProposal(drive, { fileName, data, driveId });
        return res.status(200).json(result);
      }

      case "load": {
        const { driveId } = req.query;
        if (!driveId) return res.status(400).json({ error: "Missing driveId" });
        const data = await loadProposal(drive, driveId);
        return res.status(200).json({ data });
      }

      case "delete": {
        const { driveId } = req.body;
        if (!driveId) return res.status(400).json({ error: "Missing driveId" });
        const result = await deleteProposal(drive, driveId);
        return res.status(200).json(result);
      }

      case "savePDF": {
        const { fileName, base64Data, type } = req.body;
        if (!fileName || !base64Data) return res.status(400).json({ error: "Missing fileName or base64Data" });
        const result = await savePDF(drive, { fileName, base64Data, type });
        return res.status(200).json(result);
      }

      default:
        return res.status(400).json({ error: "Unknown action: " + action });
    }
  } catch (err) {
    console.error("Drive API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
