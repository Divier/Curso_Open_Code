import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInvitationEmailParams {
  to: string;
  childName: string;
  staffName: string;
  code: string;
  activationUrl: string;
}

export async function sendInvitationEmail({
  to,
  childName,
  staffName,
  code,
  activationUrl,
}: SendInvitationEmailParams): Promise<{ error: string | null }> {
  try {
    const { error } = await resend.emails.send({
      from: "OpenDayCare <onboarding@resend.dev>",
      to,
      subject: `Te invitaron a seguir a ${childName} en OpenDayCare`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #d9583c;">¡Hola!</h1>
          <p><strong>${staffName}</strong> te ha invitado a seguir a <strong>${childName}</strong> en OpenDayCare.</p>
          <p>Para crear tu cuenta y empezar a recibir actualizaciones, usa el siguiente código:</p>
          <div style="background-color: #f6ecdf; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2e89a6;">${code}</span>
          </div>
          <p>O haz clic en el siguiente enlace para activar tu cuenta directamente:</p>
          <a href="${activationUrl}" style="display: inline-block; background-color: #d9583c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Activar mi cuenta</a>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">Este código expira en 7 días. Si no esperabas esta invitación, puedes ignorar este mensaje.</p>
        </div>
      `,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error sending email" };
  }
}
