import nodemailer from "nodemailer";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";
import { ApiError } from "@/lib/errors/api-error";
import { ProjectFeedbackInput } from "./validations";
import { extractValuesAndKeys } from "../../utils/extractValuesAndKeys";
import { getProjectFeedbackTemplate } from "../template/useTemplate";

export class ProjectFeedbackEmailService {
  static async sendProjectFeedbackEmail(params: ProjectFeedbackInput) {
    const templatePath = path.resolve(
      process.cwd(),
      "src/features/api/emails/project-feedbacks-emails/template/index.html"
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

    let finalTemplate = getProjectFeedbackTemplate({
      htmlTemplate: {
        text: htmlTemplate.text,
        keys: htmlTemplate.keys,
      },
      values: params.values,
    });

    // Unique CID for the image
    const cid = `main_pda_logo_${randomUUID()}`;
    finalTemplate = finalTemplate.replace("[[image_cid]]", cid);

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

    const imagePath = path.join(
      process.cwd(),
      "public",
      "Logo_PDA_Principal_FundoAmarelo.png"
    );

    // Verifica se a imagem existe
    try {
      await fs.access(imagePath);
    } catch {
      throw new ApiError(403, "Imagem de logo não encontrada");
    }

    const mailOptions = {
      to: params.email,
      subject: params.subject,
      html: finalTemplate,
      attachments: [
        {
          filename: "image.png",
          path: imagePath,
          cid: cid,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  }
}
