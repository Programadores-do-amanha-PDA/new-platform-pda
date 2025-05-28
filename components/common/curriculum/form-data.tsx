"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { LoaderCircle, Plus, X } from "lucide-react";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { validateCurriculumForm } from "./form-data-validations";

import { StatesCombobox } from "./StatesCombobox";
import { StateCitiesCombobox } from "./state-cities-combobox";
import axios from "axios";
import {
  ResumeInterestingAreasT,
  ResumeStudiesT,
  ResumeLocationT,
  ResumeT,
} from "@/types/resume";
import { AuthUserWithProfileType } from "@/types/auth-types";
import { useAuth } from "@/context/auth-context";

const fetchAllBrazilianStates = async (
  setStates: (states: { id: number; nome: string; sigla: string }[]) => void
) => {
  try {
    const response = await axios.get(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
    );
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid data received from API");
    }
    setStates(response.data);
  } catch (error) {
    console.log(error);
    toast.error("Erro ao buscar os estados brasileiros!");
  }
};

const fetchAllStatesCities = async (
  states: { id: number; nome: string; sigla: string }[],
  location: ResumeLocationT,
  setStateCities: (stateCities: { id: number; nome: string }[]) => void
) => {
  try {
    const response = await axios.get(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${
        states.find((state) => state.nome === location.state)?.id
      }/municipios`
    );

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid data received from API");
    }

    setStateCities(response.data);
  } catch (error) {
    console.log(error);
    toast.error("Erro ao buscar as cidades do estado selecionado!");
  }
};

const ResumeFormData = ({
  currentResume,
  handleUpdateResume,
  handleCreateResume,
}: {
  currentResume: ResumeT | null;
  handleUpdateResume: (
    id: string,
    resumeData: Partial<ResumeT>
  ) => Promise<boolean>;
  handleCreateResume: (
    resumeData: ResumeT,
    user: AuthUserWithProfileType
  ) => Promise<boolean>;
}) => {
  const [openStateCombobox, setOpenStateCombobox] = useState(false);
  const [openCityCombobox, setOpenCityCombobox] = useState(false);
  const [location, setLocation] = useState<ResumeLocationT>({
    state: "",
    city: "",
  });

  const { user } = useAuth();

  const [states, setStates] = useState<
    { id: number; nome: string; sigla: string }[]
  >([]);

  const [stateCities, setStateCities] = useState<
    { id: number; nome: string }[]
  >([]);

  const [interestingAreas, setInterestingAreas] =
    useState<ResumeInterestingAreasT>([]);

  const [studies, setStudies] = useState<ResumeStudiesT>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocation(
      currentResume?.location || {
        state: "",
        city: "",
      }
    );
    setInterestingAreas(currentResume?.interesting_areas || []);
    setStudies(currentResume?.studies || []);
  }, [currentResume]);

  useEffect(() => {
    fetchAllBrazilianStates(setStates);
  }, []);

  useEffect(() => {
    if (states.find((state) => state.nome === location.state)?.id) {
      fetchAllStatesCities(states, location, setStateCities);
    }
  }, [states, location]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (!validateCurriculumForm(location, interestingAreas, studies) || !user)
        throw new Error("invalid form");

      if (!currentResume?.id) {
        const resumeData = {
          location: Object.prototype.hasOwnProperty.call(location, "state")
            ? { ...location }
            : { state: "", city: "" },
          interesting_areas: [...interestingAreas],
          studies: [...studies],
        };
        const response = await handleCreateResume(resumeData, user);
        if (!response) throw new Error("no resume response");

        toast.success("Currículo criado com sucesso!");
      } else if (currentResume?.id) {
        const response = await handleUpdateResume(currentResume?.id, {
          location,
          interesting_areas: interestingAreas,
          studies,
          updated_at: new Date(),
        });
        if (!response) throw new Error("no resume response");
        toast.success("Currículo atualizado com sucesso!");
      } else {
        toast.error(
          "Erro ao criar ou atualizar o seu currículo. Tente novamente mais tarde!"
        );
      }
      setLoading(false);
    } catch {
      if (!currentResume?.id) {
        toast.error(
          "Erro ao criar o seu currículo. Tente novamente mais tarde!"
        );
      } else if (currentResume?.id) {
        toast.error(
          "Erro ao atualizar o seu currículo. Tente novamente mais tarde!"
        );
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-max flex flex-col justify-between">
      <form
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="col-span-1 lg:col-span-2">
          <p className="text-left h-max text-base">Localização</p>
          <span className="text-sm text-muted-foreground">
            Os dados de localização são opcionais, porem ao preencher você
            garante uma melhor acurácia ao realizar o match entre seu currículo
            e as vagas disponíveis.
          </span>
        </div>
        <div className="grid grid-rows-[20px_1fr] items-center gap-4 col-span-1">
          <Label className="text-left h-max">Estado</Label>
          <StatesCombobox
            states={states}
            value={location.state}
            setValue={(value) =>
              setLocation((s) => ({
                ...s,
                state: value,
              }))
            }
            open={openStateCombobox}
            setOpen={setOpenStateCombobox}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-rows-[20px_1fr] items-center gap-4">
          <Label htmlFor="city" className="text-left h-max">
            Cidade
          </Label>
          <StateCitiesCombobox
            cities={stateCities}
            value={location.city}
            setValue={(value) =>
              setLocation((s) => ({
                ...s,
                city: value,
              }))
            }
            open={openCityCombobox}
            setOpen={setOpenCityCombobox}
            className="col-span-3"
          />
        </div>
        <Separator className="col-span-1 lg:col-span-2" />

        <div className="col-span-1 lg:col-span-2">
          <p className="text-left h-max text-base">Areas de interesse</p>
          <span className="text-sm text-muted-foreground">
            As areas de interesse são opcionais, porem ao declarar, você terá
            uma melhor experiencia no match entre as vagas e seu currículo!
            Declare até 3 areas que você tem interesse, e até 3
            linguagens/tecnologias você usa em cada area.
          </span>
        </div>
        {interestingAreas.map((interestingArea, interestingAreaIndex) => {
          return (
            <div
              key={interestingAreaIndex}
              className="flex flex-col space-y-4 col-span-1 lg:col-span-2 p-4"
            >
              <div className="h-10 flex max-w-96 items-start bg-zinc-50 rounded-xl border border-input truncate">
                <Label
                  htmlFor="area"
                  className="text-left h-full flex items-center p-3 border-r border-input"
                >
                  Area {interestingAreaIndex + 1}:
                </Label>
                <Input
                  id="area"
                  type="text"
                  value={interestingArea.area}
                  onChange={(e) =>
                    setInterestingAreas((s) => [
                      ...s.map((areas, i) =>
                        i === interestingAreaIndex
                          ? { ...interestingArea, area: e.target.value }
                          : areas
                      ),
                    ])
                  }
                  placeholder="Desenvolvimento Web..."
                  className="!border-none !ring-0 bg-card !rounded-none w-full h-full"
                />

                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={() =>
                    setInterestingAreas((prev) =>
                      prev.filter((_, i) => i !== interestingAreaIndex)
                    )
                  }
                  className="h-full rounded-l-none !bg-zinc-100 text-destructive border-l border-input"
                >
                  <X className="size-5" />
                </Button>
              </div>
              {/* technologies */}

              <div className="ml-4 h-max w-60 flex flex-col items-center bg-zinc-50 rounded-xl border border-input truncate space-y-4 pb-4">
                <Label className="w-full flex items-center p-3 border-b border-input">
                  Tecnologias
                </Label>

                {interestingArea.technologies.map(
                  (technology, technologyIndex) => {
                    return (
                      <div
                        key={technologyIndex}
                        className="h-10 flex items-start bg-zinc-50 rounded-xl border border-input truncate mx-2"
                      >
                        <Input
                          type="text"
                          value={technology}
                          onChange={(e) =>
                            setInterestingAreas((prev) =>
                              prev.map((item, index) =>
                                index === interestingAreaIndex
                                  ? {
                                      ...item,
                                      technologies:
                                        interestingArea.technologies.map(
                                          (tech, i) =>
                                            i === technologyIndex
                                              ? e.target.value
                                              : tech
                                        ),
                                    }
                                  : item
                              )
                            )
                          }
                          placeholder="Javascript..."
                          className="!border-none !ring-0 bg-card !rounded-none w-full h-full"
                        />

                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={() =>
                            setInterestingAreas((prev) =>
                              prev.map((item, index) =>
                                index === interestingAreaIndex
                                  ? {
                                      ...item,
                                      technologies:
                                        interestingArea.technologies.filter(
                                          (_, techI) =>
                                            techI !== technologyIndex
                                        ),
                                    }
                                  : item
                              )
                            )
                          }
                          className="h-full rounded-l-none !bg-zinc-100 text-destructive border-l border-input"
                        >
                          <X className="size-5" />
                        </Button>
                      </div>
                    );
                  }
                )}
                {interestingArea.technologies.length < 3 && (
                  <Button
                    type="button"
                    size={"icon"}
                    className="w-40"
                    onClick={() =>
                      setInterestingAreas((prev) =>
                        prev.map((item, index) =>
                          index === interestingAreaIndex
                            ? {
                                ...item,
                                technologies:
                                  interestingArea.technologies.concat(""),
                              }
                            : item
                        )
                      )
                    }
                    variant="outline"
                  >
                    <Plus />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        {interestingAreas.length < 3 && (
          <Button
            type="button"
            size={"icon"}
            className="max-w-60 w-full"
            onClick={() =>
              setInterestingAreas((prev) => [
                ...prev,
                {
                  area: "",
                  technologies: [""],
                },
              ])
            }
            variant="outline"
          >
            <Plus /> Adicionar Area de interesse
          </Button>
        )}
        <Separator className="col-span-1 lg:col-span-2" />

        <div className="col-span-1 lg:col-span-2">
          <p className="text-left h-max text-base">Estudos</p>
          <span className="text-sm text-muted-foreground">
            Os dados de estudos são opcionais, porem se você está atualmente
            estudando em uma universidade ou instituição de ensino, é
            recomendável fornecer essas informações para que você tenha uma
            melhor experiência de match entre as vagas e seu currículo.
          </span>
        </div>

        {studies.map((study, studyIndex) => (
          <div
            key={studyIndex}
            className="col-span-1 lg:col-span-2 flex flex-col gap-2 border rounded-xl truncate"
          >
            <div className="bg-zinc-50 pl-2 h-10 flex justify-between items-center">
              <p className="text-sm">Estudo {studyIndex + 1}</p>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={() =>
                  setStudies((prev) => prev.filter((_, i) => i !== studyIndex))
                }
                className="h-full !rounded-none !bg-zinc-50 text-destructive border-l border-input"
              >
                <X className="size-5" />
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 gap-y-4 p-4">
              <div className="grid grid-rows-[20px_1fr] items-center gap-4 col-span-1">
                <Label
                  htmlFor={`study-institution-${studyIndex}`}
                  className="text-left h-max"
                >
                  Instituição de ensino
                </Label>
                <Input
                  id={`study-institution-${studyIndex}`}
                  type="text"
                  value={study.institution}
                  onChange={(e) =>
                    setStudies((prev) =>
                      prev.map((s, i) =>
                        i === studyIndex
                          ? { ...s, institution: e.target.value }
                          : s
                      )
                    )
                  }
                  placeholder="Programadores do Amanhã"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-rows-[20px_1fr] items-center gap-4">
                <Label
                  htmlFor={`study-field-${studyIndex}`}
                  className="text-left h-max"
                >
                  Curso
                </Label>
                <Input
                  id={`study-field-${studyIndex}`}
                  type="text"
                  value={study.study_field}
                  onChange={(e) =>
                    setStudies((prev) =>
                      prev.map((s, i) =>
                        i === studyIndex
                          ? { ...s, study_field: e.target.value }
                          : s
                      )
                    )
                  }
                  placeholder="Sistemas para Internet..."
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-rows-[20px_1fr] items-center gap-4">
                <Label
                  htmlFor={`study-degree-${studyIndex}`}
                  className="text-left h-max"
                >
                  Grau
                </Label>
                <Input
                  id={`study-degree-${studyIndex}`}
                  type="text"
                  value={study.degree}
                  onChange={(e) =>
                    setStudies((prev) =>
                      prev.map((s, i) =>
                        i === studyIndex ? { ...s, degree: e.target.value } : s
                      )
                    )
                  }
                  placeholder="Ensino Superior..."
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-rows-[20px_1fr] items-center gap-4">
                <Label
                  htmlFor={`start-date-${studyIndex}`}
                  className="text-left h-max"
                >
                  Data de inicio
                </Label>
                <Input
                  id={`start-date-${studyIndex}`}
                  type="date"
                  value={study.start_date}
                  onChange={(e) =>
                    setStudies((prev) =>
                      prev.map((s, i) =>
                        i === studyIndex
                          ? { ...s, start_date: e.target.value }
                          : s
                      )
                    )
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-rows-[20px_1fr] items-center gap-4">
                <Label
                  htmlFor={`end-date-${studyIndex}`}
                  className="text-left h-max"
                >
                  Data de termino estimada
                </Label>
                <Input
                  id={`end-date-${studyIndex}`}
                  type="date"
                  value={study.end_date}
                  onChange={(e) =>
                    setStudies((prev) =>
                      prev.map((s, i) =>
                        i === studyIndex
                          ? { ...s, end_date: e.target.value }
                          : s
                      )
                    )
                  }
                  className="col-span-3"
                />
              </div>
            </div>
          </div>
        ))}
        {studies.length < 3 && (
          <Button
            type="button"
            size={"icon"}
            className="max-w-60 w-full"
            onClick={() =>
              setStudies((prev) => [
                ...prev,
                {
                  institution: "",
                  study_field: "",
                  degree: "",
                  start_date: "",
                  end_date: "",
                },
              ])
            }
            variant="outline"
          >
            <Plus /> Adicionar Estudo
          </Button>
        )}
      </form>

      <Button
        type="button"
        onClick={() => (!loading ? handleSubmit() : null)}
        className="gap-2 flex font-semibold w-max self-end"
      >
        {loading && <LoaderCircle className="size-5 animate-spin" />}
        {loading
          ? currentResume?.id
            ? "Salvando mudanças"
            : "Criando currículo"
          : currentResume?.id
          ? "Salvar mudanças"
          : "Criar currículo"}
      </Button>
    </div>
  );
};

export default ResumeFormData;
