const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || "lucas.benavenuto@lakle.fr";
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Atelier Jardin & Paysage <onboarding@resend.dev>";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

function sanitize(value) {
  return String(value || "").trim().slice(0, 2000);
}

function json(response, status, payload) {
  response.status(status).setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { message: "Méthode non autorisée." });
  }

  const body = request.body || {};

  if (sanitize(body.website)) {
    return json(response, 200, { message: "Demande envoyée." });
  }

  const name = sanitize(body.Nom);
  const phone = sanitize(body.Telephone);
  const city = sanitize(body.Commune);
  const project = sanitize(body.Projet);

  if (!name || !phone || !city || !project) {
    return json(response, 400, { message: "Merci de remplir tous les champs." });
  }

  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY environment variable.");
    return json(response, 500, { message: "Le formulaire n’est pas encore configuré." });
  }

  const text = [
    "Nouvelle demande de devis jardinage",
    "",
    `Nom: ${name}`,
    `Téléphone: ${phone}`,
    `Commune: ${city}`,
    "",
    "Projet:",
    project,
  ].join("\n");

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: CONTACT_FROM_EMAIL,
      to: [CONTACT_TO_EMAIL],
      subject: `Demande de devis jardinage - ${city}`,
      text,
      reply_to: CONTACT_TO_EMAIL,
    }),
  });

  if (!resendResponse.ok) {
    const details = await resendResponse.text();
    console.error("Resend error:", details);
    return json(response, 502, { message: "L’envoi du message a échoué." });
  }

  return json(response, 200, { message: "Demande envoyée." });
}
