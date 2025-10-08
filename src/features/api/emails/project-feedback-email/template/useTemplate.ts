import { ProjectFeedbackTemplateT } from "../types";

export const getProjectFeedbackTemplate = ({
  htmlTemplate,
  values,
}: ProjectFeedbackTemplateT) => {
  let projectFeedbackTemplate = htmlTemplate.text;

  for (let i = 0; i < htmlTemplate.keys.length; i++) {
    const key = htmlTemplate.keys[i];

    if (key === "hits_itens") {
      if (Array.isArray(values.hits_itens)) {
        const hitsItens = values.hits_itens.map(
          (item) => `<li
    style="
      box-sizing: border-box;
      margin-top: 4px;
      margin-bottom: 4px;
      display: flex;
      padding: 0;
    "
  >
    <p
      style="
        box-sizing: border-box;
        margin-top: 0;
        margin-bottom: 0;
        padding: 0;
        font-size: 16px;
      "
    >
      ${item.emoji}&ensp;${item.text}
    </p>
  </li>
  `
        );

        projectFeedbackTemplate = projectFeedbackTemplate.replace(
          `[[hits_itens]]`,
          `<ul class="dark-text-gray-50" style="
          box-sizing: border-box;
          list-style-type: none;
          padding-left: 16px;
          padding-right: 16px;
          padding-bottom: 16px;
          color: #1f2937;
        ">
        ${hitsItens.join(" ")}
        </ul>`
        );
      } else if (typeof values.hits_itens === "string") {
        const hitsItens = `<p class="dark-text-gray-50" style="box-sizing: border-box; padding: 0 16px 16px; font-size: 16px; color: #1f2937">${values.hits_itens}</p>`;

        projectFeedbackTemplate = projectFeedbackTemplate.replace(
          `[[hits_itens]]`,
          hitsItens
        );
      }
    }
    if (key === "improvements_itens") {
      if (Array.isArray(values.improvements_itens)) {
        const improvementsItens = values.improvements_itens.map(
          (item) => `<li
        style="
          box-sizing: border-box;
          margin-top: 4px;
          margin-bottom: 4px;
          display: flex;
          padding: 0;
        "
      >
        <p
          style="
            box-sizing: border-box;
            margin-top: 0;
            margin-bottom: 0;
            padding: 0;
            font-size: 16px;
          "
        >
          ${item.emoji}&ensp;${item.text}
        </p>
      </li>
      `
        );

        projectFeedbackTemplate = projectFeedbackTemplate.replace(
          `[[improvements_itens]]`,
          `<ul class="dark-text-gray-50" style="
          box-sizing: border-box;
          list-style-type: none;
          padding-left: 16px;
          padding-right: 16px;
          padding-bottom: 16px;
          color: #1f2937;
        ">
        ${improvementsItens.join(" ")}
        </ul>`
        );
      } else if (typeof values.improvements_itens === "string") {
        const improvementsItens = `<p class="dark-text-gray-50" style="box-sizing: border-box; padding: 0 16px 16px; font-size: 16px; color: #1f2937">${values.improvements_itens}</p>`;

        projectFeedbackTemplate = projectFeedbackTemplate.replace(
          `[[improvements_itens]]`,
          improvementsItens
        );
      }
    }
    if (key === "rubric_itens") {
      const rubricItens = values.rubric_itens.map(
        (item) => `<div
  style="
    box-sizing: border-box;
    border: 2px solid #e5e7eb;
    margin-bottom: 16px;
    margin-top: 0;
    display: block;
    height: max-content;
    width: 100%;
    border-radius: 12px;
    padding: 8px;
  "
>
  <p
    style="
      box-sizing: border-box;
      margin-top: 0;
      margin-bottom: 8px;
      font-size: 16px;
      font-weight: 700;
    "
  >
        ${item.label}
  </p>
  <span style="box-sizing: border-box; margin-top: 8px; font-size: 16px">
    ${item.text}
  </span>
</div>

    `
      );

      projectFeedbackTemplate = projectFeedbackTemplate.replace(
        `[[rubric_itens]]`,
        rubricItens.join(" ")
      );
    }

    if (key === "next_itens") {
      if (
        values.next_itens &&
        Array.isArray(values.next_itens) &&
        values.next_itens.length > 0
      ) {
        const nextItens = values.next_itens.map(
          (item) => `<li
            style="
              box-sizing: border-box;
              margin-top: 4px;
              margin-bottom: 4px;
              display: flex;
              padding: 0;
            "
          >
            <p
              style="
                box-sizing: border-box;
                margin-top: 0;
                margin-bottom: 0;
                padding: 0;
                font-size: 16px;
              "
            >
              ${item.emoji}&ensp;${
            item.text !== undefined && typeof item.text === "string"
              ? item.text
              : "Reenvie <a style='box-sizing: border-box; color: #ca8a04'>por aqui</a> a versão revisada até [nova data entrega]."
          }
            </p>
          </li>
          `
        );

        projectFeedbackTemplate = projectFeedbackTemplate.replace(
          `[[next_itens]]`,
          `<h3 class="dark-text-gray-50" style=" width: 100%; padding: 16px 16px 8px; font-size: 18px; font-weight: 900; color: #1f2937; font-family: 'Dela Gothic One', Roboto, sans-serif; box-sizing: border-box;"> 🚀&ensp;Próximos Passos:</h3> <ul class="dark-text-gray-50" style=" box-sizing: border-box; list-style-type: none; padding-left: 16px; padding-right: 16px; padding-bottom: 16px; color: #1f2937;"> ${nextItens.join(
            " "
          )} </ul> <hr class="divider-border" style="box-sizing: border-box; height: 1px; width: 100%; border-width: 0px; border-color: rgb(17 24 39 / 0.15); background-color: rgb(17 24 39 / 0.15); color: rgb(17 24 39 / 0.15)">`
        );
      } else if (
        Number(values.final_note) <= 6 &&
        Number(values.final_note) > 0
      ) {
        const nextItens = `<h3 class="dark-text-gray-50" style=" width: 100%; padding: 16px 16px 8px; font-size: 18px; font-weight: 900; color: #1f2937; font-family: 'Dela Gothic One', Roboto, sans-serif; box-sizing: border-box;"> 🚀&ensp;Próximos Passos:</h3> <p class="dark-text-gray-50" style="box-sizing: border-box; padding: 0 16px 16px; font-size: 16px; color: #1f2937">Como seu projeto não atingiu a nota mínima de 7, é necessário que você revise e melhore seu trabalho de acordo com os pontos de melhoria destacados. Recomendo que você entre em contato com seus facilitadores e com a pessoa analista de jornada da sua turma para obter orientações valiosas sobre como aprimorar seu projeto e identificar as datas disponíveis para reenviá-lo. Estamos aqui para lhe apoiar! Boa sorte!</p> <hr class="divider-border" style="box-sizing: border-box; height: 1px; width: 100%; border-width: 0px; border-color: rgb(17 24 39 / 0.15); background-color: rgb(17 24 39 / 0.15); color: rgb(17 24 39 / 0.15)">`;

        projectFeedbackTemplate = projectFeedbackTemplate.replace(
          `[[next_itens]]`,
          nextItens
        );
      } else if (Number(values.final_note) > 6) {
        projectFeedbackTemplate = projectFeedbackTemplate.replace(
          `[[next_itens]]`,
          ""
        );
      } else if (Number(values.final_note) === 0) {
        projectFeedbackTemplate = projectFeedbackTemplate.replace(
          `[[next_itens]]`,
          `<h3 class="dark-text-gray-50" style=" width: 100%; padding: 16px 16px 8px; font-size: 18px; font-weight: 900; color: #1f2937; font-family: 'Dela Gothic One', Roboto, sans-serif; box-sizing: border-box;"> 🚀&ensp;Próximos Passos:</h3> <p class="dark-text-gray-50" style="box-sizing: border-box; padding: 0 16px 16px; font-size: 16px; color: #1f2937">Infelizmente, não conseguimos avaliar o seu projeto. É fundamental que você revise e o reenvie, prestando atenção especial aos links e dados inseridos no formulário de entrega. Se tiver alguma dúvida, recomendamos que entre em contato com seus facilitadores e com o analista de jornada da sua turma. Eles poderão fornecer orientações valiosas e informar sobre as datas disponíveis para o reenvio. Estamos aqui para lhe apoiar! Boa sorte!</p> <hr class="divider-border" style="box-sizing: border-box; height: 1px; width: 100%; border-width: 0px; border-color: rgb(17 24 39 / 0.15); background-color: rgb(17 24 39 / 0.15); color: rgb(17 24 39 / 0.15)">`
        );
      }
    }

    if (key === "project_type") {
      projectFeedbackTemplate = projectFeedbackTemplate.replace(
        `[[project_type]]`,
        values.project_type
      );
    }
    if (key === "project_module") {
      projectFeedbackTemplate = projectFeedbackTemplate.replace(
        `[[project_module]]`,
        values.project_module
      );
    }
    if (key === "teacher_name") {
      projectFeedbackTemplate = projectFeedbackTemplate.replace(
        `[[teacher_name]]`,
        values.teacher_name
      );
    }
    if (key === "teacher_email") {
      projectFeedbackTemplate = projectFeedbackTemplate.replace(
        `[[teacher_email]]`,
        values.teacher_email
      );
    }
    if (key === "to_name") {
      projectFeedbackTemplate = projectFeedbackTemplate.replace(
        `[[to_name]]`,
        values.to_name
      );
    }
    if (key === "final_note") {
      projectFeedbackTemplate = projectFeedbackTemplate.replace(
        `[[final_note]]`,
        values.final_note
      );
    }
    if (key === "final_considerations") {
      projectFeedbackTemplate = projectFeedbackTemplate.replace(
        `[[final_considerations]]`,
        values.final_considerations
      );
    }
  }

  return projectFeedbackTemplate;
};
