import nodemailer from "nodemailer";
import path from "path";
import fs from "fs/promises";
import { UserCredentialsInput } from "./validations";
import { extractValuesAndKeys } from "../../utils/extractValuesAndKeys";
import { getUsersCredentialsTemplate } from "../template/useTemplate";

export class UserCredentialsEmailService {
  static async sendUserCredentialsEmail(params: UserCredentialsInput) {
    const templatePath = path.resolve(
      process.cwd(),
      "src/features/api/emails/user-credentials/template/index.html"
    );

    // Verifica se o arquivo existe
    try {
      await fs.access(templatePath);
    } catch {
      throw new Error(`Template não encontrado`);
    }

    const htmlTemplate = await extractValuesAndKeys(templatePath);

    if (!htmlTemplate.text || !htmlTemplate.keys) {
      throw new Error("Falha ao carregar o template de email");
    }

    const finalTemplate = getUsersCredentialsTemplate({
      htmlTemplate: {
        text: htmlTemplate.text,
        keys: htmlTemplate.keys,
      },
      values: params.values,
    });

    // Get email credentials from environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      throw new Error("Email credentials not configured");
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      to: params.email,
      subject: params.subject,
      html: finalTemplate,
    };

    await transporter.sendMail(mailOptions);
  }
}