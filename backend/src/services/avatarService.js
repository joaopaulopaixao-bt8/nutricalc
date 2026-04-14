const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const DEFAULT_BUCKET = process.env.SUPABASE_AVATAR_BUCKET || "avatars";
let supabaseClient = null;

const MIME_TO_EXTENSION = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function ensureAvatarDirectory() {
  // Storage persistente agora fica no Supabase Storage.
}

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para usar avatar persistente.");
  }

  supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return supabaseClient;
}

function extractStoragePath(avatarUrl) {
  if (!avatarUrl || typeof avatarUrl !== "string") return "";

  try {
    const parsed = new URL(avatarUrl);
    const marker = `/storage/v1/object/public/${DEFAULT_BUCKET}/`;
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return "";
    return decodeURIComponent(parsed.pathname.slice(index + marker.length));
  } catch (error) {
    return "";
  }
}

async function removeAvatarByUrl(avatarUrl) {
  const storagePath = extractStoragePath(avatarUrl);
  if (!storagePath) return;

  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(DEFAULT_BUCKET).remove([storagePath]);
  if (error) {
    throw new Error(`Nao foi possivel remover o avatar anterior: ${error.message}`);
  }
}

async function saveAvatarFromDataUrl(dataUrl, userId) {
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

  const supabase = getSupabaseClient();
  const fileName = `${userId}-${crypto.randomBytes(8).toString("hex")}.${extension}`;
  const storagePath = `users/${userId}/${fileName}`;
  const { error } = await supabase.storage.from(DEFAULT_BUCKET).upload(storagePath, buffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Nao foi possivel salvar o avatar: ${error.message}`);
  }

  const { data } = supabase.storage.from(DEFAULT_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

module.exports = {
  ensureAvatarDirectory,
  removeAvatarByUrl,
  saveAvatarFromDataUrl,
};
