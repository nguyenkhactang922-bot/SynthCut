const packageJson = require("./package.json");

const certificateSha1 = process.env.WINDOWS_SIGN_CERT_SHA1;
const publisherName = process.env.WINDOWS_SIGN_PUBLISHER_NAME;

if (!certificateSha1) {
  throw new Error("WINDOWS_SIGN_CERT_SHA1 is required for the commercial signed build");
}
if (!publisherName) {
  throw new Error("WINDOWS_SIGN_PUBLISHER_NAME is required for the commercial signed build");
}

const base = packageJson.build;

module.exports = {
  ...base,
  forceCodeSigning: true,
  win: {
    ...base.win,
    signtoolOptions: {
      certificateSha1,
      publisherName,
      signingHashAlgorithms: ["sha256"],
      rfc3161TimeStampServer: "http://ts.ssl.com",
    },
  },
};
