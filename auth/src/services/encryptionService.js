const crypto = require("crypto");

const gcmAlgorithm = "aes-256-gcm";
const cbcAlgorithm = "aes-256-cbc";

const secretKey = crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_SECRET)
  .digest("base64")
  .substr(0, 32);

function encrypt(text) {
  const iv = crypto.randomBytes(12); // GCM standard IV size

  const cipher = crypto.createCipheriv(
    gcmAlgorithm,
    Buffer.from(secretKey),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return iv.toString("hex") + ":" + authTag + ":" + encrypted;
}

function decrypt(text) {
  const parts = text.split(":");

  if (parts.length === 3) {
      // AES-256-GCM
      const iv = Buffer.from(parts[0], "hex");
      const authTag = Buffer.from(parts[1], "hex");
      const encryptedText = parts[2];

      const decipher = crypto.createDecipheriv(
        gcmAlgorithm,
        Buffer.from(secretKey),
        iv
      );
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedText, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
  } else {
      // Fallback to AES-256-CBC for legacy tokens
      const iv = Buffer.from(parts[0], "hex");
      const encryptedText = parts[1];

      const decipher = crypto.createDecipheriv(
        cbcAlgorithm,
        Buffer.from(secretKey),
        iv
      );

      let decrypted = decipher.update(encryptedText, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
  }
}

module.exports = { encrypt, decrypt };