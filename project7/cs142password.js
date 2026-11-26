const crypto = require("crypto");
function makePasswordEntry(clearTextPassword) {
  const salt = crypto.randomBytes(8).toString("hex");
  const hash = crypto.createHash("sha1").update(salt + clearTextPassword).digest("hex");
  return { salt, hash };
}
function doesPasswordMatch(hash, salt, clearTextPassword) {
  if (typeof hash !== "string" || !/^[a-f0-9]{40}$/i.test(hash) || typeof salt !== "string" || typeof clearTextPassword !== "string") return false;
  const actual = crypto.createHash("sha1").update(salt + clearTextPassword).digest();
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), actual);
}
module.exports = { makePasswordEntry, doesPasswordMatch };
