"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckIcon, X } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  ProjectCorrectionFormT,
  projectCorrectionFormSchema,
  ProjectCorrectionPropsT,
} from "../../types/project-correction-form";
import { ProjectRuleSelector } from "./project-rule-selector";

// Mock data - replace with actual imports when available
const projectRules: Record<string, Record<string, object>> = {};
const messagesTemplatesTyped: Record<
  string,
  Record<string, Record<string, string>>
> = {};

const ProjectCorrection = ({
  selectedDelivery,
  project,
  allDeliveredEmails,
  handleRefreshDeliveries,
  handleCancel,
}: ProjectCorrectionPropsT) => {
  const form = useForm<ProjectCorrectionFormT>({
    resolver: zodResolver(projectCorrectionFormSchema),
    defaultValues: {
      teacherName: "",
      teacherEmail: "",
      rulesSelected: [],
      hits: "",
      improvements: "",
      next: "",
      finalNote: "",
      feedback: "",
    },
  });

  useEffect(() => {
    if (selectedDelivery.status !== "Pendente") {
      form.reset({
        teacherName: selectedDelivery.teacher_name || "",
        teacherEmail: selectedDelivery.teacher_email || "",
        rulesSelected: selectedDelivery.rules_selected || [],
        finalNote: selectedDelivery.final_note || "",
        feedback: selectedDelivery.final_considerations || "",
        hits: selectedDelivery.hits_itens || "",
        improvements: selectedDelivery.improvements_itens || "",
        next: selectedDelivery.next_itens || "",
      });
    } else {
      form.reset({
        teacherName: "",
        teacherEmail: "",
        rulesSelected: [],
        hits: "",
        improvements: "",
        next: "",
        finalNote: "",
        feedback: "",
      });
    }
  }, [selectedDelivery, form]);

  const rulesSelected = form.watch("rulesSelected");
  const finalNote = form.watch("finalNote");

  const projectRulesId = (() => {
    if (project?.project_type === "mini_project") {
      return `MP${project?.module}`;
    } else if (project?.project_type === "end_module_project") {
      return `P${project?.module}`;
    } else {
      return `PI${project?.module}`;
    }
  })();

  const projectRuleID = projectRules[projectRulesId] || {};
  const rulesLabels = Object.keys(projectRuleID);

  const handleSetRulesSelected = (
    ruleL: string,
    rule: string,
    note: number
  ) => {
    const ruleNote = note === 0 ? 10 : note === 1 ? 7 : note === 2 ? 4 : 0;
    const currentRules = form.getValues("rulesSelected");

    const index = currentRules.findIndex((r) => r.ruleL === ruleL);
    const newRule = { ruleL, rule, ruleNote };

    if (index === -1) {
      form.setValue("rulesSelected", [...currentRules, newRule]);
    } else {
      const updatedRules = [...currentRules];
      updatedRules[index] = newRule;
      form.setValue("rulesSelected", updatedRules);
    }
  };

  const finalProjectPlaceholder =
    rulesSelected
      .map((r) => r.ruleNote)
      ?.reduce((accum, curr) => accum + curr, 0) / rulesLabels?.length || 0;

  const onSubmit = async (data: ProjectCorrectionFormT) => {
    if (data.rulesSelected.length !== rulesLabels.length) {
      toast.error("É preciso selecionar uma regra de cada Métrica!");
      return;
    }

    if (selectedDelivery && selectedDelivery.id) {
      try {
        // Mock function - replace with actual implementation
        // const saveFireBase = await addCorrectionDelivery(selectedDelivery.id, {
        //   final_note: data.finalNote,
        //   final_considerations: data.feedback,
        //   teacher_name: data.teacherName,
        //   teacher_email: data.teacherEmail,
        //   rules_selected: data.rulesSelected,
        //   hits_itens: data.hits,
        //   improvements_itens: data.improvements,
        //   next_itens: data.next,
        //   status: "Corrigido",
        //   update_at: new Date(),
        // });

        // if (saveFireBase) {
        //   handleRefreshDeliveries();
        // }

        toast.success("Correção salva com sucesso!");
        handleRefreshDeliveries();
      } catch (error) {
        console.error(error);
        toast.error("Erro ao salvar correção");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <section className="w-full h-max flex flex-col gap-4">
          <h2 className="w-full text-lg dela-gothic">Dados da Entrega</h2>
          <section className="w-full h-max mt-3 max-h-96 flex rounded-xl border-2 dark:border-gray-50/15 border-gray-900/15 overflow-hidden">
            <div className="w-80 h-full border-r-2 dark:border-gray-50/15 border-gray-900/15 overflow-hidden flex flex-col">
              <div className="w-full h-16 flex items-center justify-start pl-4 border-b-2 dark:border-gray-50/15 border-gray-900/15 dark:border-gray-50">
                <p className="font-bold text-base">Integrantes</p>
              </div>
              <ul className="w-full h-full text-base flex flex-col items-center box-border py-6 px-2 gap-4 overflow-y-auto overflow-x-hidden">
                {selectedDelivery?.members.map((m, i) => (
                  <li
                    key={i}
                    className="w-full flex-col p-2 h-max first:border-t-0"
                  >
                    <p className="text-base font-semibold">{m.name}</p>
                    <p className="text-sm">{m.email}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full h-full flex flex-col p-4 gap-4">
              {project?.project_type === "Mini Projeto" && (
                <div className="w-full h-max flex flex-col gap-6">
                  <p className="font-bold text-base">Parecia PdA</p>
                  <ul className="flex-grow h-full px-1 flex gap-5 overflow-x-auto pb-3">
                    {selectedDelivery?.projectColleagues &&
                      selectedDelivery?.projectColleagues.map((p, i) =>
                        allDeliveredEmails.includes(p.email) ? (
                          <li
                            key={i}
                            className="w-max rounded-xl p-2 h-max list-disc flex gap-2 bg-green-300/55"
                          >
                            <CheckIcon className="size-5 text-green-400 stroke-2" />
                            <p className="text-sm">{p.email}</p>
                          </li>
                        ) : (
                          <li
                            key={i}
                            className="w-max rounded-xl p-2 h-max list-disc flex gap-2 bg-red-300/55"
                          >
                            <X className="size-5 text-red-400 stroke-2" />
                            <p className="text-sm">{p.email}</p>
                          </li>
                        )
                      )}
                  </ul>
                </div>
              )}
              <div className="w-full h-max flex flex-col">
                <p className="font-bold text-base">Links</p>
                <ul className="w-full h-full text-base flex flex-col items-center py-6 px-2 gap-1 overflow-y-auto overflow-x-hidden">
                  {selectedDelivery?.links.map((l, i) => (
                    <li key={i} className="w-full p-2 h-max list-disc">
                      <a
                        className="text-sm"
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {l.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full h-max flex flex-col gap-4">
                <p className="font-bold text-base">Observação</p>
                <span className="font-normal text-sm px-4">
                  {selectedDelivery?.observation}
                </span>
              </div>
            </div>
          </section>
        </section>

        <section className="w-full h-max flex flex-col gap-4">
          <h2 className="w-full text-lg dela-gothic mb-4">Correção</h2>
          <ProjectRuleSelector
            projectRulesId={projectRulesId}
            rulesSelected={rulesSelected}
            handleSetRulesSelected={handleSetRulesSelected}
            projectRuleID={projectRuleID}
            rulesLabels={rulesLabels}
          />

          <FormField
            control={form.control}
            name="hits"
            render={({ field }) => (
              <FormItem className="w-full h-max flex flex-col gap-2 border-b-2 dark:border-gray-50/15 border-gray-900/15 pb-6">
                <FormLabel className="w-full h-10 p-4 gap-8 rounded-t-xl flex items-center text-base font-bold">
                  {Number(finalNote) !== 0 && "*"}🏆 &nbsp; Pontos Fortes
                </FormLabel>
                <div className="w-full h-full flex flex-col p-4 py-6 pt-0 gap-6">
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={8}
                      placeholder="Destaque o que foi realizado. (min 10 caracteres)"
                      className="max-w-2xl"
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="improvements"
            render={({ field }) => (
              <FormItem className="w-full h-max flex flex-col gap-2 border-b-2 dark:border-gray-50/15 border-gray-900/15 pb-6">
                <FormLabel className="w-full h-10 p-4 gap-8 rounded-t-xl flex items-center text-base font-bold">
                  {Number(finalNote) !== 0 && "*"}⚔️ &nbsp; Áreas para Melhoria
                </FormLabel>
                <div className="w-full h-full flex flex-col p-4 py-6 pt-0 gap-6">
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={8}
                      placeholder="Explique o que pode ser melhorado e como. (min 10 caracteres)"
                      className="max-w-2xl"
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <section className="w-full h-max flex flex-col gap-2 border-b-2 dark:border-gray-50/15 border-gray-900/15 pb-6">
            <p className="w-full h-10 p-4 gap-8 rounded-t-xl flex items-center text-base font-bold">
              *Nota e Considerações Finais
            </p>
            <div className="w-full h-full flex flex-row flex-wrap p-4 py-6 gap-6 md:gap-0">
              <div className="w-full h-max md:h-full md:w-1/2">
                <FormField
                  control={form.control}
                  name="finalNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        *Nota final
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder={String(finalProjectPlaceholder)}
                          className="w-60"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full h-full md:w-1/2">
                <FormField
                  control={form.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        *Considerações Finais
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={8}
                          placeholder="Faça uma consideração final sobre o projeto e os possíveis próximos passos."
                          className="max-w-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </section>

          <FormField
            control={form.control}
            name="next"
            render={({ field }) => (
              <FormItem className="w-full h-max flex flex-col gap-2 border-b-2 dark:border-gray-50/15 border-gray-900/15 pb-6">
                <FormLabel className="w-full h-10 p-4 gap-8 rounded-t-xl flex items-center text-base font-bold">
                  🚀 &nbsp; Próximos Passos
                </FormLabel>
                <div className="w-full h-full flex flex-col p-4 py-6 pt-0 gap-6">
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Explique o que pode ser feito a mais."
                      className="max-w-2xl"
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </section>

        <section className="w-full h-max flex flex-col gap-4">
          <h2 className="w-full text-lg dela-gothic mb-4">Feedback</h2>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="automatic-messages">
              <AccordionTrigger className="text-base font-bold">
                Mensagens Automáticas
              </AccordionTrigger>
              <AccordionContent>
                <ul className="flex flex-wrap gap-4">
                  {rulesSelected.map((item, i) => (
                    <li
                      key={i}
                      className="w-max min-w-60 h-max flex flex-col border border-gray-200 rounded-xl p-2 gap-1"
                    >
                      <p className="text-base font-semibold">{item.ruleL}</p>
                      <span className="text-sm">
                        {messagesTemplatesTyped[projectRulesId]?.[item.ruleL]?.[
                          item.rule
                        ] || "Mensagem não encontrada"}
                      </span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <section className="w-full h-max flex flex-col gap-4 rounded-xl">
            <p className="w-full h-max p-4 gap-8 rounded-t-xl flex items-center justify-between">
              <span className="text-base font-bold">
                *Contato facilitador/a
              </span>
            </p>
            <div className="w-full h-full flex flex-wrap p-4 gap-8">
              <FormField
                control={form.control}
                name="teacherName"
                render={({ field }) => (
                  <FormItem className="w-80">
                    <FormLabel className="text-base font-semibold">
                      *Nome Facilitador/a
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="text" placeholder="Seu Nome" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teacherEmail"
                render={({ field }) => (
                  <FormItem className="w-80">
                    <FormLabel className="text-base font-semibold">
                      *E-mail Facilitador/a
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="...@programadoresdoamanha.org.br"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>
        </section>

        <footer className="w-full h-max flex justify-between border-t-2 pt-8 dark:border-gray-50/5 border-gray-900/5 px-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="w-full md:w-max bg-yellow-300/55 dark:bg-yellow-600/55 hover:bg-yellow-400/55 dark:hover:bg-yellow-700/55 border-2 hover:border-yellow-400 dark:hover:border-yellow-700 text-gray-900 dark:text-gray-100"
          >
            {selectedDelivery.status !== "Pendente"
              ? "Atualizar Correção"
              : "Salvar Correção"}
          </Button>
        </footer>
      </form>
    </Form>
  );
};

export default ProjectCorrection;
