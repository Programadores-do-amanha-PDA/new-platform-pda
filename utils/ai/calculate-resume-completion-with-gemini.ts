"use server";
import { AIMatchScoresT, MatchResultT } from "@/types/ai/ai-match";
import { JobT } from "@/types/jobs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdf from "pdf-parse";

async function getPdfText(pdfBuffer: ArrayBuffer): Promise<string> {
  try {
    const data = await pdf(Buffer.from(pdfBuffer));
    return data.text;
  } catch (error) {
    console.error("Erro ao parsear PDF:", error);
    throw new Error("Falha ao extrair texto do PDF.");
  }
}

function prepareJobDataForAI(job: JobT): string {
  const detailsArray = [];
  if (job.description) detailsArray.push(`Descrição: ${job.description}`);
  if (job.details?.languages?.length)
    detailsArray.push(
      `Tecnologias/Linguagens: ${job.details.languages.join(", ")}`
    );
  if (job.details?.workplace_type?.length)
    detailsArray.push(
      `Tipo de Trabalho: ${job.details.workplace_type.join(", ")}`
    );
  if (job.details?.locale?.length)
    detailsArray.push(`Localização da Vaga: ${job.details.locale.join(", ")}`);
  // Adicione outros campos relevantes da vaga aqui

  return `
Título da Vaga: ${job.title}
${detailsArray.join("\n")}
  `.trim();
}

async function getAIMatchScoresFromGemini(
  resumeText: string,
  jobText: string
): Promise<AIMatchScoresT> {
  if (!process.env.GEMINI_API_KEY) {
    console.error(
      "Chave da API Gemini não configurada. Defina GEMINI_API_KEY nas variáveis de ambiente."
    );
    return {
      area: 0,
      skills: 0,
      studies: 0,
      locale: 0,
      justification: "Erro de configuração: Chave da API Gemini ausente.",
    };
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = `
    Você é um especialista em recrutamento e seleção de talentos de IA. Sua tarefa é analisar o texto de um currículo e o texto de uma descrição de vaga de emprego e calcular um score de compatibilidade.

    Retorne um objeto JSON estritamente com a seguinte estrutura e siga as regras de pontuação para cada campo:
    {
      "area": number,      // Pontuação de 0 ou 1. Avalie se as áreas de interesse e experiência do candidato são compatíveis com o título e descrição da vaga.
      "skills": number,    // Pontuação de 0 a 3. Avalie a compatibilidade das habilidades e tecnologias do candidato com os requisitos da vaga. Considere a profundidade e relevância. Uma correspondência forte em tecnologias chave vale mais.
      "studies": number,   // Pontuação de 0 ou 1. Avalie se a formação acadêmica do candidato é compatível com os requisitos ou o campo de estudo desejado para a vaga.
      "locale": number,    // Pontuação de 0 ou 0.5. Avalie a compatibilidade da localização. Se a vaga for remota e o candidato estiver aberto a remoto, é 0.5. Se a vaga for presencial/híbrida, verifique se a localização do candidato é compatível (0.5) ou não (0). Se o candidato não especificar localização mas a vaga for remota, considere 0.5.
      "justification": string // Uma breve explicação (2-3 frases) em português sobre o porquê da pontuação geral.
    }

    Regras de Pontuação Detalhadas:
    - area: 1 se houver uma correspondência clara entre os objetivos/experiência do candidato e o domínio da vaga. 0 caso contrário.
    - skills:
        - 0: Nenhuma ou pouca sobreposição de habilidades relevantes.
        - 1: Alguma sobreposição, mas em habilidades secundárias ou poucas habilidades principais.
        - 2: Boa sobreposição, incluindo algumas habilidades principais.
        - 3: Excelente sobreposição, com forte correspondência nas habilidades e tecnologias chave exigidas.
    - studies: 1 se o grau e o campo de estudo do candidato estiverem alinhados com os requisitos explícitos ou implícitos da vaga. 0 caso contrário.
    - locale:
        - 0.5: Vaga remota e candidato aceita remoto OU vaga presencial/híbrida e localização do candidato é compatível.
        - 0: Vaga presencial/híbrida e localização do candidato incompatível, ou falta de informação crucial para determinar.

    Texto do Currículo:
    ---
    ${resumeText}
    ---

    Texto da Vaga:
    ---
    ${jobText}
    ---

    Objeto JSON de Resposta:
  `;

  try {
    console.log("Enviando prompt para Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();

    console.log("Resposta da Gemini (raw):", responseText);

    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    let aiScores;
    if (jsonMatch && jsonMatch[1]) {
      aiScores = JSON.parse(jsonMatch[1]);
    } else {
      aiScores = JSON.parse(responseText);
    }

    console.log("Scores da IA (parsed):", aiScores);

    return {
      area: aiScores.area === 1 ? 1 : 0,
      skills: Math.max(0, Math.min(3, Number(aiScores.skills) || 0)),
      studies: aiScores.studies === 1 ? 1 : 0,
      locale: aiScores.locale === 0.5 ? 0.5 : 0,
      justification:
        aiScores.justification || "Justificativa não fornecida pela IA.",
    };
  } catch (error) {
    console.error("Erro ao chamar API Gemini ou parsear resposta:", error);
    return {
      area: 0,
      skills: 0,
      studies: 0,
      locale: 0,
      justification:
        "Erro ao processar a compatibilidade com IA. Verifique o console do servidor para detalhes.",
    };
  }
}

export const calculateAIMatchPercentage = async (
  resumeFileBuffer: ArrayBuffer,
  job: JobT
): Promise<MatchResultT> => {
  let resumeText: string;
  try {
    resumeText = await getPdfText(resumeFileBuffer);
  } catch (error) {
    console.error(error);
    return {
      area: 0,
      language: 0,
      studies: 0,
      local: 0,
      total: 0,
      justification: "Falha ao ler o arquivo PDF do currículo.",
    };
  }

  const jobText = prepareJobDataForAI(job);

  const aiScores = await getAIMatchScoresFromGemini(resumeText, jobText);

  const matchPoints =
    aiScores.area + aiScores.skills + aiScores.studies + aiScores.locale;

  const totalPossiblePoints = 5.5;
  const percentage = (matchPoints / totalPossiblePoints) * 100;

  return {
    area: aiScores.area,
    language: aiScores.skills,
    studies: aiScores.studies,
    local: aiScores.locale,
    total: Math.min(Math.round(percentage * 100) / 100, 100),
    justification: aiScores.justification,
  };
};
