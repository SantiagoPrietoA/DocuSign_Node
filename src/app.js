// const cors = require("cors");
const docusign = require("docusign-esign"),
  path = require("path"),
  fs = require("fs"),
  process = require("process"),
  { promisify } = require("util"), // http://2ality.com/2017/05/util-promisify.html
  basePath = "https://demo.docusign.net/restapi",
  express = require("express"),
  envir = process.env;
const app = express();

// settings
app.set("port", process.env.PORT || 4000);

let baseUrl = envir.PORT || 4000;

async function openSigningCeremonyController(req, res) {
  const accessToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjY4MTg1ZmYxLTRlNTEtNGNlOS1hZjFjLTY4OTgxMjIwMzMxNyJ9.eyJUb2tlblR5cGUiOjUsIklzc3VlSW5zdGFudCI6MTU5MzEwMzQ2OSwiZXhwIjoxNTkzMTMyMjY5LCJVc2VySWQiOiI4MDRiODhmYi00NzFjLTRjOTMtYmM3Ni0xZmM0YmNjMDdiZTMiLCJzaXRlaWQiOjEsInNjcCI6WyJzaWduYXR1cmUiLCJjbGljay5tYW5hZ2UiLCJvcmdhbml6YXRpb25fcmVhZCIsInJvb21fZm9ybXMiLCJncm91cF9yZWFkIiwicGVybWlzc2lvbl9yZWFkIiwidXNlcl9yZWFkIiwidXNlcl93cml0ZSIsImFjY291bnRfcmVhZCIsImRvbWFpbl9yZWFkIiwiaWRlbnRpdHlfcHJvdmlkZXJfcmVhZCIsImR0ci5yb29tcy5yZWFkIiwiZHRyLnJvb21zLndyaXRlIiwiZHRyLmRvY3VtZW50cy5yZWFkIiwiZHRyLmRvY3VtZW50cy53cml0ZSIsImR0ci5wcm9maWxlLnJlYWQiLCJkdHIucHJvZmlsZS53cml0ZSIsImR0ci5jb21wYW55LnJlYWQiLCJkdHIuY29tcGFueS53cml0ZSJdLCJhdWQiOiJmMGYyN2YwZS04NTdkLTRhNzEtYTRkYS0zMmNlY2FlM2E5NzgiLCJhenAiOiJmMGYyN2YwZS04NTdkLTRhNzEtYTRkYS0zMmNlY2FlM2E5NzgiLCJpc3MiOiJodHRwczovL2FjY291bnQtZC5kb2N1c2lnbi5jb20vIiwic3ViIjoiODA0Yjg4ZmItNDcxYy00YzkzLWJjNzYtMWZjNGJjYzA3YmUzIiwiYW1yIjpbImludGVyYWN0aXZlIl0sImF1dGhfdGltZSI6MTU5MzEwMzQ2NywicHdpZCI6IjZlNzBmMDlmLTljMzYtNDZiNS1iM2IwLTgyMThjOGFmYzE0MyJ9.qOILaRKs5P7SB52OIhntYOoX7uZfwjCKcpZ9lsiX4du561I9Kfw-klC1HiPQQ8AtgqiLCNONvWyDng-k1S1K7KpR0pysM_Dc7Q01N6eC6ayFhn5NYMEg1bbfPdU2FO1dqoHyQPDd1Jo0xZmMZyRgO9RF3j_3roPMzmbqROAdeKV2mXRmS-SPo3jlqJwSvn5H_76i2feAs7B6dEbxIor34jdPEdMFYmV2iSjziiVIIQKYy_c_7IncvQjYmQ8dCiwLVIADfk5sFplvam1_oCdQFyEJkr2XHAXGkQ3Q986CQtbhQzZqNgSjugxFEIm4gCQnTANxqw4twRUX0GW9Ef1h4g";
  const accountId = "10859354";
  const signerName = "Santiago Prieto";
  const signerEmail = "santiagoprietoacero@gmail.com";
  const clientUserId = "123",
    authenticationMethod = "None";
  const fileName = "carta-formal.pdf";
  const envDef = new docusign.EnvelopeDefinition();
  envDef.emailSubject = "Please sign this document sent from the Node example";
  envDef.emailBlurb = "Please sign this document sent from the Node example.";
  const pdfBytes = fs.readFileSync(path.resolve(__dirname, fileName)),
    pdfBase64 = pdfBytes.toString("base64");

  const doc = docusign.Document.constructFromObject({
    documentBase64: pdfBase64,
    fileExtension: "pdf",
    name: "Sample document",
    documentId: "1",
  });

  envDef.documents = [doc];

  const signer = docusign.Signer.constructFromObject({
    name: signerName,
    email: signerEmail,
    routingOrder: "1",
    recipientId: "1",
    clientUserId: clientUserId,
  });

  const signHere = docusign.SignHere.constructFromObject({
    documentId: "1",
    pageNumber: "1",
    recipientId: "1",
    tabLabel: "SignHereTab",
    xPosition: "195",
    yPosition: "147",
  });

  signer.tabs = docusign.Tabs.constructFromObject({ signHereTabs: [signHere] });

  envDef.recipients = docusign.Recipients.constructFromObject({
    signers: [signer],
  });

  envDef.status = "sent";

  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(basePath);
  apiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);
  docusign.Configuration.default.setDefaultApiClient(apiClient);

  let envelopesApi = new docusign.EnvelopesApi(),
    createEnvelopePromise = promisify(envelopesApi.createEnvelope).bind(
      envelopesApi
    ),
    results;

  try {
    results = await createEnvelopePromise(accountId, {
      envelopeDefinition: envDef,
    });

    const envelopeId = results.envelopeId,
      recipientViewRequest = docusign.RecipientViewRequest.constructFromObject({
        authenticationMethod: authenticationMethod,
        clientUserId: clientUserId,
        recipientId: "1",
        returnUrl: baseUrl + "/dsreturn",
        userName: signerName,
        email: signerEmail,
      }),
      createRecipientViewPromise = promisify(
        envelopesApi.createRecipientView
      ).bind(envelopesApi);
    results = await createRecipientViewPromise(accountId, envelopeId, {
      recipientViewRequest: recipientViewRequest,
    });

    res.json(results);
  } catch (e) {
    res.status(e.response.status).json({ message: e.response });
  }
}

app.use("/api/docusing", openSigningCeremonyController);

module.exports = app;
