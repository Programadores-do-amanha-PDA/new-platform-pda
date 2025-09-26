"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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
import { Label } from "@/components/ui/label";
import { useUsersStore } from "@/stores/modules/users/users-store";
import { useClassroomConfigStore } from "@/stores/modules/classrooms/configs";
import useAuth from "@/hooks/use-auth";

import {
  ProjectCorrectionFormT,
  projectCorrectionFormSchema,
  ProjectCorrectionPropsT,
} from "../../types/project-correction-form";
import { ProjectRuleSelector } from "./project-rule-selector";
import { useCorrectionStore } from "../../stores/corrections";
import MemberListItem from "./member-list-item";

import projectRulesJson from "../../utils/projectsRules.json";
import { LoaderCircle } from "lucide-react";
const projectRules = projectRulesJson as Record<
  string,
  Record<string, Record<string, string>>
>;

// Converter para tipo seguro
const messagesTemplatesTyped: Record<
  string,
  Record<string, Record<string, string>>
> = {};

const ProjectCorrection = ({
  classroomId,
  selectedDelivery,
  project,
}: ProjectCorrectionPropsT) => {
  const [loading, setLoading] = useState(false);
  const form = useForm<ProjectCorrectionFormT>({
    resolver: zodResolver(projectCorrectionFormSchema),
    defaultValues: {
      teacherName: "",
      teacherEmail: "",
      rulesSelected: [],
      hits: {
        item1: "",
        item2: "",
        item3: "",
      },
      improvements: {
        item1: "",
        item2: "",
        item3: "",
      },
      next: {
        item1: "",
        item2: "",
        item3: "",
      },
      finalNote: "",
      feedback: "",
    },
  });

  const { user } = useAuth();
  const { users } = useUsersStore();
  const { corrections, createCorrection } = useCorrectionStore();
  const { configsByClassroom } = useClassroomConfigStore();
  const classroomConfig = configsByClassroom[classroomId];

  const classroomUsers = users.filter((user) =>
    user?.profile?.classrooms
      ?.map((classroom) => classroom.classroom_id)
      .includes(classroomId)
  );
  const deliveryCorrection = corrections.find(
    (correction) => correction.delivery_id === selectedDelivery.id
  );

  useEffect(() => {
    if (deliveryCorrection) {
      const hitsArray = deliveryCorrection.hits_itens || [];
      const improvementsArray = deliveryCorrection.improvements_itens || [];
      const nextArray = deliveryCorrection.next_itens || [];

      form.reset({
        rulesSelected: deliveryCorrection.rules_selected || [],
        finalNote: deliveryCorrection.final_note || "",
        feedback: deliveryCorrection.final_considerations || "",
        hits: {
          item1: hitsArray[0] || "",
          item2: hitsArray[1] || "",
          item3: hitsArray[2] || "",
        },
        improvements: {
          item1: improvementsArray[0] || "",
          item2: improvementsArray[1] || "",
          item3: improvementsArray[2] || "",
        },
        next: {
          item1: nextArray[0] || "",
          item2: nextArray[1] || "",
          item3: nextArray[2] || "",
        },
        teacherEmail: deliveryCorrection.teacher_email || "",
      });
    } else {
      form.reset({
        teacherName: "",
        teacherEmail: "",
        rulesSelected: [],
        hits: {
          item1: "",
          item2: "",
          item3: "",
        },
        improvements: {
          item1: "",
          item2: "",
          item3: "",
        },
        next: {
          item1: "",
          item2: "",
          item3: "",
        },
        finalNote: "",
        feedback: "",
      });
    }
  }, [selectedDelivery, form, deliveryCorrection]);

  const rulesSelected = form.watch("rulesSelected");
  const finalNote = form.watch("finalNote");

  const projectRulesId = (() => {
    const moduleExtracted =
      classroomConfig.modules
        .find((module) => module.id === project?.module)
        ?.title.replace(/[^0-9]/g, "") || project.module;
    if (project?.project_type === "mini_project") {
      return `MP${moduleExtracted}`;
    } else if (project?.project_type === "end_module_project") {
      return `P${moduleExtracted}`;
    } else {
      return `PI${moduleExtracted}`;
    }
  })();

  const projectRuleID =
    projectRules[projectRulesId] ||
    ({} as Record<string, Record<string, string>>);
  const rulesLabels = Object.keys(projectRuleID);

  const handleSetRulesSelected = (
    ruleL: string,
    rule: string,
    ruleNote: number
  ) => {
    const currentRules = form.getValues("rulesSelected");

    const index = currentRules.findIndex((r) => r.ruleL === ruleL);
    const newRule = { ruleL, rule, ruleNote };

    if (index === -1) {
      const newRules = [...currentRules, newRule];
      form.setValue("rulesSelected", newRules);
    } else {
      const updatedRules = [...currentRules];
      updatedRules[index] = newRule;
      form.setValue("rulesSelected", updatedRules);
    }

    // Trigger validation
    form.trigger("rulesSelected");
  };

  const finalProjectPlaceholder =
    rulesSelected
      .map((r) => r.ruleNote)
      ?.reduce((accum, curr) => accum + curr, 0) / rulesLabels?.length || 0;

  const onSubmit = async (data: ProjectCorrectionFormT) => {
    if (data.rulesSelected.length !== rulesLabels.length) {
      toast.error(
        `É preciso selecionar uma regra de cada Métrica! (${data.rulesSelected.length}/${rulesLabels.length})`
      );
      return;
    }

    if (selectedDelivery && selectedDelivery.id) {
      try {
        setLoading(true);
        await createCorrection({
          project_id: project.id,
          delivery_id: selectedDelivery.id,
          final_note: data.finalNote,
          final_considerations: data.feedback,
          teacher_id: user?.id,
          rules_selected: data.rulesSelected,
          hits_itens: [
            data.hits.item1,
            data.hits.item2,
            data.hits.item3,
          ].filter(
            (item): item is string => item !== undefined && item.trim() !== ""
          ),
          improvements_itens: [
            data.improvements.item1,
            data.improvements.item2,
            data.improvements.item3,
          ].filter(
            (item): item is string => item !== undefined && item.trim() !== ""
          ),
          next_itens: [
            data.next.item1,
            data.next.item2,
            data.next.item3,
          ].filter(
            (item): item is string => item !== undefined && item.trim() !== ""
          ),
        });
      } catch (error) {
        console.error(error);
        toast.error("Erro ao salvar correção");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <section className="w-full h-max flex flex-col border-t p-0!">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 overflow-hidden flex flex-col"
        >
          <section className="w-full h-max flex flex-col gap-4 p-4">
            <Label className="w-full text-lg font-semibold">
              Dados da Entrega
            </Label>
            <section className="w-full h-max max-h-96 flex rounded-xl border dark:border-gray-50/15 border-gray-900/15 overflow-hidden">
              <div className="w-max h-full flex flex-col border-r dark:border-gray-50/15 border-gray-900/15 p-0">
                <div className="w-full h-11 flex items-center justify-start px-4 border-b bg-muted border-gray-900/15 dark:border-gray-50">
                  <p className="font-bold text-base">
                    {project.project_type === "mini_project"
                      ? "Autor"
                      : "Integrantes"}
                  </p>
                </div>
                <ul className="w-max h-full flex flex-col items-center box-border overflow-y-auto *:last:border-0!">
                  {project.project_type === "mini_project" && (
                    <>
                      <MemberListItem
                        key={`delivery_member_${selectedDelivery.id}`}
                        memberId={selectedDelivery.user_id}
                        classroomUsers={classroomUsers}
                      />
                      <li className="w-full h-10 border-b truncate flex flex-row gap-2 justify-start items-center px-2 bg-muted">
                        <p className="font-bold text-base">Parcerias</p>
                      </li>

                      {(selectedDelivery?.members !== null &&
                        selectedDelivery.members?.length > 0) ||
                      selectedDelivery.members_id.length > 0 ? (
                        selectedDelivery?.members !== null &&
                        selectedDelivery.members?.length > 0 ? (
                          selectedDelivery?.members.map((m, i) => (
                            <li
                              key={i}
                              className="w-full flex-col p-2 h-max first:border-t-0"
                            >
                              <p className="text-sm">{m}</p>
                            </li>
                          ))
                        ) : (
                          selectedDelivery?.members_id.map((m, i) => (
                            <MemberListItem
                              key={`delivery_member_${i}`}
                              memberId={m}
                              classroomUsers={classroomUsers}
                            />
                          ))
                        )
                      ) : (
                        <div>Nenhum membro encontrado</div>
                      )}
                    </>
                  )}
                  {project.project_type !== "mini_project" && (
                    <>
                      {(selectedDelivery?.members !== null &&
                        selectedDelivery.members?.length > 0) ||
                      selectedDelivery.members_id.length > 0 ? (
                        selectedDelivery?.members !== null &&
                        selectedDelivery.members?.length > 0 ? (
                          selectedDelivery?.members.map((m, i) => (
                            <li
                              key={i}
                              className="w-full flex-col p-2 h-max first:border-t-0"
                            >
                              <p className="text-sm">{m}</p>
                            </li>
                          ))
                        ) : (
                          [
                            selectedDelivery.user_id,
                            ...selectedDelivery?.members_id,
                          ].map((m, i) => (
                            <MemberListItem
                              key={`delivery_member_${i}`}
                              memberId={m}
                              classroomUsers={classroomUsers}
                            />
                          ))
                        )
                      ) : (
                        <div>Nenhum membro encontrado</div>
                      )}
                    </>
                  )}
                </ul>
              </div>
              <div className="w-full h-full flex flex-col p-4 gap-4">
                {selectedDelivery.links &&
                  selectedDelivery.links.length > 0 && (
                    <div className="w-full h-max flex flex-col">
                      <p className="font-bold text-base">Links</p>
                      <ul className="w-full h-full text-base flex flex-col items-center py-6 px-2 gap-1 overflow-y-auto overflow-x-hidden">
                        {selectedDelivery?.links.map((l, i) => (
                          <li key={i} className="w-full p-2 h-max list-decimal">
                            <a
                              className="text-sm"
                              href={l.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {l}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {selectedDelivery.observation &&
                  selectedDelivery.observation.length > 0 && (
                    <div className="w-full h-max flex flex-col gap-4">
                      <p className="font-bold text-base">Observação</p>
                      <span className="font-normal text-sm px-4">
                        {selectedDelivery?.observation}
                      </span>
                    </div>
                  )}
              </div>
            </section>
          </section>

          <section className="w-full h-max flex flex-col gap-4 p-4">
            <h2 className="w-full text-lg font-semibold">Correção</h2>
            <ProjectRuleSelector
              rulesSelected={rulesSelected}
              handleSetRulesSelected={handleSetRulesSelected}
              projectRulesId={projectRulesId}
              rulesLabels={rulesLabels}
            />

            <div className="w-full h-max flex flex-col gap-2 border-b-2 dark:border-gray-50/15 border-gray-900/15 pb-6">
              <Label className="w-full h-10 p-4 gap-8 rounded-t-xl flex items-center text-base font-bold">
                {Number(finalNote) !== 0 && "*"}🏆 &nbsp; Pontos Fortes
              </Label>
              <div className="w-full h-full flex flex-col p-4 py-6 pt-0 gap-4">
                <FormField
                  control={form.control}
                  name="hits.item1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ponto Forte 1</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Primeiro ponto forte"
                          className="max-w-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hits.item2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ponto Forte 2</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Segundo ponto forte"
                          className="max-w-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hits.item3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ponto Forte 3</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Terceiro ponto forte"
                          className="max-w-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="w-full h-max flex flex-col gap-2 border-b-2 dark:border-gray-50/15 border-gray-900/15 pb-6">
              <Label className="w-full h-10 p-4 gap-8 rounded-t-xl flex items-center text-base font-bold">
                {Number(finalNote) !== 0 && "*"}⚔️ &nbsp; Áreas para Melhoria
              </Label>
              <div className="w-full h-full flex flex-col p-4 py-6 pt-0 gap-4">
                <FormField
                  control={form.control}
                  name="improvements.item1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área para Melhoria 1</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Primeira área para melhoria"
                          className="max-w-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="improvements.item2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área para Melhoria 2</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Segunda área para melhoria"
                          className="max-w-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="improvements.item3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área para Melhoria 3</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Terceira área para melhoria"
                          className="max-w-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                            placeholder={String(
                              Math.round(finalProjectPlaceholder)
                            )}
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

            <div className="w-full h-max flex flex-col gap-2 border-b-2 dark:border-gray-50/15 border-gray-900/15 pb-6">
              <Label className="w-full h-10 p-4 gap-8 rounded-t-xl flex items-center text-base font-bold">
                🚀 &nbsp; Próximos Passos
              </Label>
              <div className="w-full h-full flex flex-col p-4 py-6 pt-0 gap-4">
                <FormField
                  control={form.control}
                  name="next.item1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Próximo Passo 1</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Primeiro próximo passo (opcional)"
                          className="max-w-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="next.item2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Próximo Passo 2</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Segundo próximo passo (opcional)"
                          className="max-w-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="next.item3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Próximo Passo 3</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Terceiro próximo passo (opcional)"
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

          <section className="w-full h-max flex flex-col gap-4 p-4">
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
                          {messagesTemplatesTyped[projectRulesId]?.[
                            item.ruleL
                          ]?.[item.rule] || "Mensagem não encontrada"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <footer className="w-full h-max flex justify-between border-t-2 pt-8 dark:border-gray-50/5 border-gray-900/5 p-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                // onClick={handleCancel}
              >
                Cancelar
              </Button>
            </div>
            <Button
              type="submit"
              variant="default"
              className="cursor-pointer"
              disabled={loading}
            >
              {loading && <LoaderCircle className="size-4 animate-spin" />}
              {deliveryCorrection?.id
                ? "Atualizar Correção"
                : "Salvar Correção"}
            </Button>
          </footer>
        </form>
      </Form>
    </section>
  );
};

export default ProjectCorrection;
