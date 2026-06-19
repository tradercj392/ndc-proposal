const { google } = require("googleapis");
const SHARE_WITH_EMAIL = "4xhelp@gmail.com";

function getAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : null;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  if (!privateKey || !clientEmail) throw new Error("Missing Google credentials");
  return new google.auth.GoogleAuth({
    credentials: { type: "service_account", project_id: "lucid-hook-499911-d7", private_key: privateKey, client_email: clientEmail },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
}

async function getDrive() {
  const auth = getAuth();
  return google.drive({ version: "v3", auth });
}

async function listProposals(drive) {
  const res = await drive.files.list({
    q: "mimeType='application/json' and trashed=false and name contains '_'",
    fields: "files(id,name,modifiedTime)",
    orderBy: "modifiedTime desc",
    spaces: "drive",
  });
  return res.data.files.map(f => ({
    driveId: f.id,
    name: f.name.replace(".json", ""),
    savedAt: f.modifiedTime,
  }));
}

async function saveProposal(drive, { fileName, data, driveId }) {
  const content = JSON.stringify(data);
  const media = { mimeType: "application/json", body: content };

  if (driveId) {
    await drive.files.update({
      fileId: driveId,
      requestBody: { name: fileName + ".json" },
      media,
    });
    return { driveId };
  } else {
    // Save to service account's own Drive (no parent folder needed)
    const res = await drive.files.create({
      requestBody: { name: fileName + ".json", mimeType: "application/json" },
      media,
      fields: "id",
    });
    // Share with NDC email so CJ can see it
    try {
      await drive.permissions.create({
        fileId: res.data.id,
        requestBody: { type: "user", role: "writer", emailAddress: SHARE_WITH_EMAIL },
        sendNotificationEmail: false,
      });
    } catch(e) {
      console.log("Share warning:", e.message);
    }
    return { driveId: res.data.id };
  }
}

async function loadProposal(drive, driveId) {
  const res = await drive.files.get({ fileId: driveId, alt: "media" });
  return res.data;
}

async function deleteProposal(drive, driveId) {
  await drive.files.delete({ fileId: driveId });
  return { success: true };
}

export default async function handler(req, res) {
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
      default:
        return res.status(400).json({ error: "Unknown action: " + action });
    }
  } catch (err) {
    console.error("Drive API error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
