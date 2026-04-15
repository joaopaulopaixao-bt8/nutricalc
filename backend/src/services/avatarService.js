const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const DEFAULT_BUCKET = process.env.SUPABASE_AVATAR_BUCKET || "avatars";
let supabaseClient = null;
let bucketReadyPromise = null;

const MIME_TO_EXTENSION = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function normalizeMimeType(value) {
  if (!value || typeof value !== "string") return "";
  return value.split(";")[0].trim().toLowerCase();
}

async function uploadAvatarBuffer(buffer, mimeType, userId) {
  const normalizedMimeType = normalizeMimeType(mimeType);
  const extension = MIME_TO_EXTENSION[normalizedMimeType];
  if (!extension) {
    throw new Error("Tipo de avatar nao suportado. Use PNG, JPG ou WEBP.");
  }

  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error("Conteudo de avatar invalido.");
  }

  if (buffer.length > 2 * 1024 * 1024) {
    throw new Error("O avatar precisa ter no maximo 2 MB.");
  }

  const supabase = getSupabaseClient();
  await ensureAvatarBucketExists();
  const fileName = `${userId}-${crypto.randomBytes(8).toString("hex")}.${extension}`;
  const storagePath = `users/${userId}/${fileName}`;
  const { error } = await supabase.storage.from(DEFAULT_BUCKET).upload(storagePath, buffer, {
    contentType: normalizedMimeType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Nao foi possivel salvar o avatar: ${error.message}`);
  }

  return buildPublicAvatarUrl(storagePath);
}

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

function getPublicBaseUrl() {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("Configure SUPABASE_URL para montar a URL publica do avatar.");
  }
  return supabaseUrl.replace(/\/+$/, "");
}

async function ensureAvatarBucketExists() {
  if (bucketReadyPromise) {
    return bucketReadyPromise;
  }

  bucketReadyPromise = (async () => {
    const supabase = getSupabaseClient();

    const { data: existingBucket, error: getBucketError } = await supabase.storage.getBucket(DEFAULT_BUCKET);
    if (!getBucketError && existingBucket) {
      return existingBucket;
    }

    const { data: createdBucket, error: createBucketError } = await supabase.storage.createBucket(DEFAULT_BUCKET, {
      public: true,
      fileSizeLimit: 2 * 1024 * 1024,
      allowedMimeTypes: Object.keys(MIME_TO_EXTENSION),
    });

    if (createBucketError) {
      const message = createBucketError.message || "";
      const alreadyExists = /already exists|duplicate/i.test(message);
      if (!alreadyExists) {
        bucketReadyPromise = null;
        throw new Error(`Nao foi possivel preparar o bucket de avatar: ${message}`);
      }
    }

    return createdBucket || true;
  })();

  return bucketReadyPromise;
}

function buildPublicAvatarUrl(storagePath) {
  return `${getPublicBaseUrl()}/storage/v1/object/public/${DEFAULT_BUCKET}/${encodeURI(storagePath)}`;
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
  const buffer = Buffer.from(base64Payload, "base64");
  return uploadAvatarBuffer(buffer, mimeType, userId);
}

async function importAvatarFromRemoteUrl(remoteUrl, userId) {
  if (!remoteUrl || typeof remoteUrl !== "string") {
    return null;
  }

  const response = await fetch(remoteUrl, {
    headers: {
      Accept: "image/webp,image/jpeg,image/png,image/*;q=0.8,*/*;q=0.5",
    },
  });

  if (!response.ok) {
    throw new Error(`Nao foi possivel baixar o avatar remoto: ${response.status}`);
  }

  const mimeType = normalizeMimeType(response.headers.get("content-type"));
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return uploadAvatarBuffer(buffer, mimeType, userId);
}

module.exports = {
  ensureAvatarDirectory,
  importAvatarFromRemoteUrl,
  removeAvatarByUrl,
  saveAvatarFromDataUrl,
};
