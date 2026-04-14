const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const AVATAR_DIR = path.join(process.cwd(), "storage", "avatars");

const MIME_TO_EXTENSION = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function ensureAvatarDirectory() {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

function removeAvatarByUrl(avatarUrl) {
  if (!avatarUrl || !avatarUrl.startsWith("/uploads/avatars/")) return;
  const fileName = avatarUrl.split("/").pop();
  if (!fileName) return;
  const absolutePath = path.join(AVATAR_DIR, fileName);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}

function saveAvatarFromDataUrl(dataUrl, userId) {
  if (!dataUrl || typeof dataUrl !== "string") {
    return null;
  }

  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Formato de avatar invalido.");
  }

  const [, mimeType, base64Payload] = match;
  const extension = MIME_TO_EXTENSION[mimeType];
  if (!extension) {
    throw new Error("Tipo de avatar nao suportado. Use PNG, JPG ou WEBP.");
  }

  const buffer = Buffer.from(base64Payload, "base64");
  if (buffer.length > 2 * 1024 * 1024) {
    throw new Error("O avatar precisa ter no maximo 2 MB.");
  }

  ensureAvatarDirectory();
  const fileName = `${userId}-${crypto.randomBytes(8).toString("hex")}.${extension}`;
  const absolutePath = path.join(AVATAR_DIR, fileName);
  fs.writeFileSync(absolutePath, buffer);
  return `/uploads/avatars/${fileName}`;
}

module.exports = {
  ensureAvatarDirectory,
  removeAvatarByUrl,
  saveAvatarFromDataUrl,
};
