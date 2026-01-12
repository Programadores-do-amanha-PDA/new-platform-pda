"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

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
import { useUsersStore } from "@/features/dashboard/shared/users/store";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";

import {useAuth} from "@/features/shared/auth";
import { useClassroomProjectCorrectionsStore } from "../../stores/corrections";
import CorrectionRuleSelector from "./correction-rule-selector";
import MemberListItem from "./member-list-item";
import {
  ClassroomProjectCorrection,
  ClassroomProjectCorrectionRulesSelectedT,
  CorrectionFormPropsT,
  CorrectionFormT,
} from "../../types";
import {
  PROJECTS_RULES,
  PROJECTS_RULES_FEEDBACKS,
  correctionFormSchema,
} from "../../utils";

const CorrectionForm = ({
  classroomId,
  selectedDelivery,
  handleClose,
  project,
}: CorrectionFormPropsT) => {
  const [loading, setLoading] = useState(false);
  const form = useForm<CorrectionFormT>({
    resolver: zodResolver(correctionFormSchema),
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
  const { corrections, createCorrection, updateCorrection } =
    useClassroomProjectCorrectionsStore();

  const classroomCorrections = corrections[classroomId];
  const classroomUsers = users.filter((user) =>
    user?.profile?.enrollments
      ?.map((enrollment) => enrollment.classroom_id)
      .includes(classroomId)
  );
  const currentCorrection = classroomCorrections?.find(
    (correction) => correction.delivery_id === selectedDelivery.id
  );

  useEffect(() => {
    if (currentCorrection) {
      const hitsArray = currentCorrection.hits_itens || [];
      const improvementsArray = currentCorrection.improvements_itens || [];
      const nextArray = currentCorrection.next_itens || [];

      form.reset({
        rulesSelected: currentCorrection.rules_selected || [],
        finalNote: currentCorrection.final_note || "",
        feedback: currentCorrection.final_considerations || "",
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
        teacherEmail: currentCorrection.teacher_email || "",
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
  }, [selectedDelivery, form, currentCorrection]);

  const rulesSelected = form.watch("rulesSelected");
  const finalNote = form.watch("finalNote");

  const projectRuleID =
    PROJECTS_RULES[project.rule_id] ||
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

  // Helper function to get only changed fields
  const getChangedFields = (
    current: ClassroomProjectCorrection,
    newData: {
      final_note: string;
      final_considerations: string;
      rules_selected: ClassroomProjectCorrectionRulesSelectedT[];
      hits_itens: string[];
      improvements_itens: string[];
      next_itens: string[];
    }
  ) => {
    const changes: Partial<ClassroomProjectCorrection> = {};

    if (current.final_note !== newData.final_note) {
      changes.final_note = newData.final_note;
    }

    if (current.final_considerations !== newData.final_considerations) {
      changes.final_considerations = newData.final_considerations;
    }

    // Deep comparison for arrays
    if (
      JSON.stringify(current.rules_selected) !==
      JSON.stringify(newData.rules_selected)
    ) {
      changes.rules_selected = newData.rules_selected;
    }

    if (
      JSON.stringify(current.hits_itens) !== JSON.stringify(newData.hits_itens)
    ) {
      changes.hits_itens = newData.hits_itens;
    }

    if (
      JSON.stringify(current.improvements_itens) !==
      JSON.stringify(newData.improvements_itens)
    ) {
      changes.improvements_itens = newData.improvements_itens;
    }

    if (
      JSON.stringify(current.next_itens) !== JSON.stringify(newData.next_itens)
    ) {
      changes.next_itens = newData.next_itens;
    }

    return changes;
  };

  const onSubmit = async (data: CorrectionFormT) => {
    if (data.rulesSelected.length !== rulesLabels.length) {
      toast.error(
        `É preciso selecionar uma regra de cada Métrica! (${data.rulesSelected.length}/${rulesLabels.length})`
      );
      return;
    }

    const formattedData = {
      final_note: data.finalNote,
      final_considerations: data.feedback,
      rules_selected: data.rulesSelected,
      hits_itens: [data.hits.item1, data.hits.item2, data.hits.item3].filter(
        (item): item is string => item !== undefined && item.trim() !== ""
      ),
      improvements_itens: [
        data.improvements.item1,
        data.improvements.item2,
        data.improvements.item3,
      ].filter(
        (item): item is string => item !== undefined && item.trim() !== ""
      ),
      next_itens: [data.next.item1, data.next.item2, data.next.item3].filter(
        (item): item is string => item !== undefined && item.trim() !== ""
      ),
    };

    if (!currentCorrection?.id) {
      if (selectedDelivery && selectedDelivery.id) {
        try {
          setLoading(true);
          await createCorrection(
            {
              project_id: project.id,
              delivery_id: selectedDelivery.id,
              teacher_id: user?.id,
              ...formattedData,
            },
            selectedDelivery.classroom_id
          );
        } catch (error) {
          console.error(error);
          toast.error("Erro ao salvar correção");
        } finally {
          setLoading(false);
        }
      }
    } else if (currentCorrection.id) {
      try {
        setLoading(true);
        const changedFields = getChangedFields(
          currentCorrection,
          formattedData
        );

        // Only update if there are actual changes
        if (Object.keys(changedFields).length > 0) {
          await updateCorrection(
            currentCorrection.id,
            changedFields,
            selectedDelivery?.classroom_id || classroomId
          );
        } else {
          toast.info("Nenhuma alteração detectada");
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao atualizar correção");
      } finally {
        setLoading(false);
      }
    }
  };
  const handleCancel = () => {
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
    handleClose();
  };

  return (
    <section className="flex flex-col p-0! border-t w-full h-max">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-6 overflow-hidden"
        >
          <section className="flex flex-col gap-4 p-4 w-full h-max">
            <Label className="w-full font-semibold text-lg">
              Dados da Entrega
            </Label>
            <section className="flex border border-gray-900/15 dark:border-gray-50/15 rounded-xl w-full h-max max-h-96 overflow-hidden">
              <div className="flex flex-col p-0 border-gray-900/15 dark:border-gray-50/15 border-r w-max h-full">
                <div className="flex justify-start items-center bg-muted px-4 border-gray-900/15 dark:border-gray-50 border-b w-full h-11">
                  <p className="font-bold text-base">
                    {project.project_type === "mini_project"
                      ? "Autor"
                      : "Integrantes"}
                  </p>
                </div>
                <ul className="box-border flex flex-col items-center *:last:border-0! w-max h-full overflow-y-auto">
                  {project.project_type === "mini_project" && (
                    <>
                      <MemberListItem
                        key={`delivery_member_${selectedDelivery.id}`}
                        memberId={selectedDelivery.user_id}
                        classroomUsers={classroomUsers}
                      />
                      <li className="flex flex-row justify-start items-center gap-2 bg-muted px-2 border-b w-full h-10 truncate">
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
                              className="flex-col p-2 first:border-t-0 w-full h-max"
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
                              className="flex-col p-2 first:border-t-0 w-full h-max"
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
              <div className="flex flex-col gap-4 p-4 w-full h-full">
                {selectedDelivery.links &&
                  selectedDelivery.links.length > 0 && (
                    <div className="flex flex-col w-full h-max">
                      <p className="font-bold text-base">Links</p>
                      <ul className="flex flex-col items-center gap-1 px-2 py-6 w-full h-full overflow-x-hidden overflow-y-auto text-base">
                        {selectedDelivery?.links.map((l, i) => (
                          <li key={i} className="p-2 w-full h-max list-decimal">
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
                    <div className="flex flex-col gap-4 w-full h-max">
                      <p className="font-bold text-base">Observação</p>
                      <span className="px-4 font-normal text-sm">
                        {selectedDelivery?.observation}
                      </span>
                    </div>
                  )}
              </div>
            </section>
          </section>

          <section className="flex flex-col gap-4 p-4 w-full h-max">
            <h2 className="w-full font-semibold text-lg">Correção</h2>
            <CorrectionRuleSelector
              rulesSelected={rulesSelected}
              handleSetRulesSelected={handleSetRulesSelected}
              projectRulesId={project.rule_id}
              rulesLabels={rulesLabels}
            />

            <div className="flex flex-col gap-2 pb-6 border-gray-900/15 dark:border-gray-50/15 border-b-2 w-full h-max">
              <Label className="flex items-center gap-8 p-4 rounded-t-xl w-full h-10 font-bold text-base">
                {Number(finalNote) !== 0 && "*"}🏆 &nbsp; Pontos Fortes
              </Label>
              <div className="flex flex-col gap-4 p-4 py-6 pt-0 w-full h-full">
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

            <div className="flex flex-col gap-2 pb-6 border-gray-900/15 dark:border-gray-50/15 border-b-2 w-full h-max">
              <Label className="flex items-center gap-8 p-4 rounded-t-xl w-full h-10 font-bold text-base">
                {Number(finalNote) !== 0 && "*"}⚔️ &nbsp; Áreas para Melhoria
              </Label>
              <div className="flex flex-col gap-4 p-4 py-6 pt-0 w-full h-full">
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

            <section className="flex flex-col gap-2 pb-6 border-gray-900/15 dark:border-gray-50/15 border-b-2 w-full h-max">
              <p className="flex items-center gap-8 p-4 rounded-t-xl w-full h-10 font-bold text-base">
                *Nota e Considerações Finais
              </p>
              <div className="flex flex-row flex-wrap gap-6 md:gap-0 p-4 py-6 w-full h-full">
                <div className="w-full md:w-1/2 h-max md:h-full">
                  <FormField
                    control={form.control}
                    name="finalNote"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-base">
                          *Nota final
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            defaultValue={Math.round(finalProjectPlaceholder)}
                            className="w-60"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-full md:w-1/2 h-full">
                  <FormField
                    control={form.control}
                    name="feedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-base">
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

            <div className="flex flex-col gap-2 pb-6 border-gray-900/15 dark:border-gray-50/15 border-b-2 w-full h-max">
              <Label className="flex items-center gap-8 p-4 rounded-t-xl w-full h-10 font-bold text-base">
                🚀 &nbsp; Próximos Passos
              </Label>
              <div className="flex flex-col gap-4 p-4 py-6 pt-0 w-full h-full">
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

          <section className="flex flex-col gap-4 px-4 w-full h-max">
            <Accordion
              type="single"
              collapsible
              defaultValue="automatic-messages"
              className="w-full"
            >
              <AccordionItem value="automatic-messages">
                <AccordionTrigger className="font-bold text-base">
                  Mensagens Automáticas
                </AccordionTrigger>
                <AccordionContent className="overflow-hidden">
                  <ul className="flex gap-4 pb-6 w-full overflow-x-auto">
                    {rulesSelected.map((item, i) => (
                      <Item
                        key={i}
                        variant="outline"
                        className="min-w-xs h-max"
                      >
                        <ItemContent>
                          <ItemHeader>
                            <ItemTitle className="font-semibold text-base">
                              {item.ruleL}
                            </ItemTitle>
                          </ItemHeader>
                          <ItemDescription className="text-sm line-clamp-none">
                            {PROJECTS_RULES_FEEDBACKS[project.rule_id]?.[
                              item.ruleL
                            ]?.[item.rule] || "Mensagem não encontrada"}
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <footer className="flex justify-between p-4 pt-8 border-gray-900/5 dark:border-gray-50/5 border-t-2 w-full h-max">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
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
              {currentCorrection?.id ? "Atualizar Correção" : "Salvar Correção"}
            </Button>
          </footer>
        </form>
      </Form>
    </section>
  );
};

export default CorrectionForm;
