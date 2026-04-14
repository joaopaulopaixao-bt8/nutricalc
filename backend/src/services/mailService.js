function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variavel de ambiente ausente: ${name}`);
  }
  return value;
}

function buildResetPasswordUrl(token) {
  const explicitUrl = process.env.RESET_PASSWORD_URL;
  const frontendUrl = process.env.FRONTEND_URL;
  const baseUrl = explicitUrl || frontendUrl;

  if (!baseUrl) {
    throw new Error("Defina RESET_PASSWORD_URL ou FRONTEND_URL para enviar o link de redefinicao.");
  }

  const url = new URL(baseUrl);
  url.searchParams.set("resetToken", token);
  return url.toString();
}

async function sendPasswordResetEmail({ email, name, token }) {
  const apiKey = getRequiredEnv("RESEND_API_KEY");
  const from = getRequiredEnv("RESEND_FROM_EMAIL");
  const resetUrl = buildResetPasswordUrl(token);
  const safeName = name || "usuario";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Redefina sua senha no NutriCalc",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
          <h2 style="margin-bottom:8px">NutriCalc</h2>
          <p>Ola, ${safeName}.</p>
          <p>Recebemos um pedido para redefinir sua senha.</p>
          <p>
            <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#84cc16;color:#0f172a;text-decoration:none;font-weight:700">
              Redefinir senha
            </a>
          </p>
          <p>Se voce nao pediu essa alteracao, pode ignorar este email.</p>
          <p>Este link expira em 30 minutos.</p>
        </div>
      `,
      text: `Ola, ${safeName}. Redefina sua senha acessando: ${resetUrl}. Este link expira em 30 minutos.`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao enviar email de redefinicao: ${errorText || response.status}`);
  }
}

module.exports = {
  buildResetPasswordUrl,
  sendPasswordResetEmail,
};
