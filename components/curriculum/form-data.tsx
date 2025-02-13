"use client";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { LoaderCircle, Plus, X } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";

const CurriculumFormData = () => {
  const [location, setLocation] = useState<{ state: string; city: string }>({
    state: "",
    city: "",
  });

  const [interestingAreas, setInterestingAreas] = useState<
    Array<{
      area: string;
      languages: Array<{
        language: string;
        language_technologies: string[];
      }>;
    }>
  >([
    {
      area: "",
      languages: [
        {
          language: "",
          language_technologies: [""],
        },
      ],
    },
  ]);

  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   setFullName(currentUser.profile?.full_name || "");
  //   setEmail(currentUser.email || "");
  //   setBio(currentUser.profile?.bio || "");
  // }, [currentUser]);

  // const handleSubmit = async () => {
  //   setLoading(true);

  //   try {
  //     const fullNameRegex = /^[a-zA-Z]{4,}(?: [a-zA-Z]+){0,2}$/gm;
  //     const emailRegex =
  //       /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  //     const passwordRegex =
  //       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{}|;:'",.<>?/~`-])[A-Za-z\d!@#$%^&*()_+=[\]{}|;:'",.<>?/~`-]{7,}$/;

  //     if (!fullName && !email) throw "fill the fields";
  //     if (
  //       fullName !== currentUser.profile?.full_name &&
  //       !fullNameRegex.test(fullName)
  //     )
  //       throw "Invalid full name";
  //     if (email !== currentUser.email && !emailRegex.test(email))
  //       throw "Invalid email";

  //     if (
  //       newPassword.length > 0 &&
  //       confirmNewPassword.length > 0 &&
  //       (newPassword !== confirmNewPassword ||
  //         (!passwordRegex.test(newPassword) &&
  //           !passwordRegex.test(confirmNewPassword)))
  //     )
  //       throw "Invalid password";
  //     if (bio !== currentUser.profile?.bio && bio.length > 190)
  //       throw "Invalid bio";

  //     const userData: Partial<UserAttributes & { password: string }> = {};

  //     if (email !== currentUser.email) {
  //       userData.email = email;
  //     }

  //     if (
  //       newPassword === confirmNewPassword &&
  //       newPassword.length > 0 &&
  //       confirmNewPassword.length > 0
  //     ) {
  //       console.log(
  //         "password",
  //         newPassword === confirmNewPassword &&
  //           newPassword.length > 0 &&
  //           confirmNewPassword.length > 0
  //       );
  //       userData.password = newPassword;
  //     }

  //     const userMetadata: UserMetadata = {};
  //     if (fullName !== currentUser.profile?.full_name) {
  //       userMetadata.full_name = fullName;
  //     }
  //     if (bio && bio !== currentUser.profile?.bio) {
  //       userMetadata.bio = bio;
  //     }

  //     if (email !== currentUser.email) {
  //       userMetadata.user_email = email;
  //     }

  //     if (Object.keys(userMetadata).length > 0) {
  //       userData.data = userMetadata;
  //     }

  //     const userUpdateResponse = await updateAuthUser(userData);
  //     if (!userUpdateResponse || !userUpdateResponse.user.id)
  //       throw "no edit user response";

  //     toast.success("Sucesso ao editar seus dados!");
  //     if (email !== currentUser.email) {
  //       toast.info(
  //         "Para concluir a troca de E-mail confirme a troca usando o email atual ou o novo e-mail!"
  //       );
  //     }
  //     onUpdateUser();

  //     setLoading(false);
  //   } catch (error) {
  //     console.log(error);
  //     switch (error) {
  //       case "fill the fields":
  //         toast.error("Por favor preencha todos os campos!");
  //         break;

  //       case "Invalid full name":
  //         toast.error("Nome completo inválido!");
  //         break;

  //       case "Invalid email":
  //         toast.error("E-mail inválido!");
  //         break;

  //       case "Invalid email":
  //         toast.error("Senha inválida!");
  //         break;

  //       case "Invalid bio":
  //         toast.error(
  //           "Bio inválida! A biografia não pode exceder 190 caracteres."
  //         );
  //         break;

  //       case "no edit user response":
  //         toast.error("Erro ao editar seus dados! Tente novamente mais tarde.");
  //         break;

  //       default:
  //         toast.error(
  //           "Erro ao atualizar seus dados! Tente novamente mais tarde."
  //         );
  //         break;
  //     }
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <form
        className="grid grid-cols-2 gap-8 my-8"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="col-span-2">
          <p className="text-left h-max text-base">Localização</p>
          <span className="text-sm text-muted-foreground">
            Os dados de localização são opcionais, porem ao preencher você
            garante uma melhor acurácia ao realizar o match entre seu currículo
            e as vagas disponíveis.
          </span>
        </div>
        <div className="grid grid-rows-[20px_1fr] items-center gap-4">
          <Label htmlFor="state" className="text-left h-max">
            Estado
          </Label>
          <Input
            id="state"
            type="text"
            value={location.state}
            onChange={(e) =>
              setLocation((s) => ({
                ...s,
                state: e.target.value,
              }))
            }
            className="col-span-3"
          />
        </div>

        <div className="grid grid-rows-[20px_1fr] items-center gap-4">
          <Label htmlFor="city" className="text-left h-max">
            Cidade
          </Label>
          <Input
            id="city"
            type="text"
            value={location.city}
            onChange={(e) =>
              setLocation((s) => ({ ...s, city: e.target.value }))
            }
            className="col-span-3"
          />
        </div>
        <Separator className="col-span-2" />

        <div className="col-span-2">
          <p className="text-left h-max text-base">Areas de interesse</p>
          <span className="text-sm text-muted-foreground">
            Declare aqui quais areas você tem interesse, quais linguagens da
            area você domina e quais os frameworks da linguagem você usa para
            desenvolver.
          </span>
        </div>
        {interestingAreas.map((interestingArea, interestingAreaIndex) => {
          return (
            <div
              key={interestingAreaIndex}
              className="flex flex-col space-y-4 col-span-2 p-4 "
            >
              <div className="h-10 flex max-w-96 items-start bg-zinc-50 rounded-xl border border-input truncate">
                <Label
                  htmlFor="area"
                  className="text-left h-full flex items-center p-3 border-r border-input"
                >
                  Area:
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
                  className="!border-none !ring-0 bg-card !rounded-none w-full h-full"
                />
              </div>
              {/* languages */}
              <ul className="flex flex-col space-y-4">
                {interestingArea.languages.map((language, languageIndex) => {
                  return (
                    <li key={languageIndex}>
                      <div className="ml-4 w-full p-4 rounded-lg flex flex-col gap-6 bg-card">
                        <div
                          className="h-10 flex max-w-96 items-start bg-zinc-50 rounded-xl border border-input truncate
"
                        >
                          <Label
                            htmlFor={`language-${languageIndex}`}
                            className="text-left h-full flex items-center p-3 border-r border-input"
                          >
                            Linguagem:
                          </Label>
                          <Input
                            id={`language-${languageIndex}`}
                            type="text"
                            value={language.language}
                            onChange={(e) =>
                              setInterestingAreas((prev) =>
                                prev.map((item, index) =>
                                  index === interestingAreaIndex
                                    ? {
                                        ...item,
                                        languages: item.languages.map(
                                          (lang, i) =>
                                            i === languageIndex
                                              ? {
                                                  ...lang,
                                                  language: e.target.value,
                                                }
                                              : lang
                                        ),
                                      }
                                    : item
                                )
                              )
                            }
                            className="!border-none !ring-0 bg-card !rounded-none !w-full !h-full"
                          />
                        </div>

                        <div className="ml-4 h-max w-max flex flex-col items-center bg-zinc-50 rounded-xl border border-input truncate space-y-4 pb-4">
                          <Label className="w-full flex items-center p-3 border-b border-input">
                            Tecnologias
                          </Label>

                          {language.language_technologies.map(
                            (technology, technologyIndex) => {
                              return (
                                <div
                                  key={technologyIndex}
                                  className="h-10 flex max-w-96 items-start bg-zinc-50 rounded-xl border border-input truncate mx-2"
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
                                                languages: item.languages.map(
                                                  (lang, langI) =>
                                                    langI === languageIndex
                                                      ? {
                                                          ...lang,
                                                          language_technologies:
                                                            lang.language_technologies.map(
                                                              (tech, i) =>
                                                                i ===
                                                                technologyIndex
                                                                  ? e.target
                                                                      .value
                                                                  : tech
                                                            ),
                                                        }
                                                      : lang
                                                ),
                                              }
                                            : item
                                        )
                                      )
                                    }
                                    placeholder=""
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
                                                languages: item.languages.map(
                                                  (lang, langI) =>
                                                    langI === languageIndex
                                                      ? {
                                                          ...lang,
                                                          language_technologies:
                                                            lang.language_technologies.filter(
                                                              (_, techI) =>
                                                                techI !==
                                                                technologyIndex
                                                            ),
                                                        }
                                                      : lang
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
                          {language.language_technologies.length < 3 && (
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
                                          languages: item.languages.map(
                                            (lang, langI) =>
                                              langI === languageIndex
                                                ? {
                                                    ...lang,
                                                    language_technologies:
                                                      lang.language_technologies.concat(
                                                        ""
                                                      ),
                                                  }
                                                : lang
                                          ),
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
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </form>

      <Button
        type="button"
        // onClick={() => (!loading ? handleSubmit() : null)}
        className="gap-2 flex font-semibold w-max self-end"
      >
        {loading && <LoaderCircle className="size-5 animate-spin" />}
        {loading ? "Salvando mudanças" : "Salvar mudanças"}
      </Button>
    </div>
  );
};

export default CurriculumFormData;
