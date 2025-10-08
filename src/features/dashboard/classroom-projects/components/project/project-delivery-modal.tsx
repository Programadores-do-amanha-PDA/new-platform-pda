"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Trash2, Link as LinkIcon, Loader2, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ClassroomProjectT } from "../../types";
import { ProfileT } from "@/types/auth/user";
import useAuth from "@/hooks/use-auth";
import { MemberSelectionCombobox } from "../deliveries/member-selection-combobox";
import { useUsersStore } from "@/stores/modules/users/users-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDeliveryStore } from "../../stores/deliveries";
import { projectTypesLabels } from "../../utils";
import { useClassroomConfigStore } from "@/stores/modules/classrooms/configs";

type LinkType = {
  url: string;
};

const squads = Array.from({ length: 19 }, (_, i) => ({
  id: i === 0 ? "0" : i.toString(),
  name: i === 0 ? "Selecione sua Squad" : `Squad ${i}`,
}));

interface ProjectDeliveryModalProps {
  project: ClassroomProjectT;
  classroomId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectDeliveryModal = ({
  project,
  classroomId,
  isOpen,
  onClose,
}: ProjectDeliveryModalProps) => {
  const { user } = useAuth();
  const { createDelivery } = useDeliveryStore();
  const { users } = useUsersStore();
  const isMobile = useIsMobile();

  const squadRef = useRef<HTMLDivElement>(null);
  const membersRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  const [isProjectDelivered, setIsProjectDelivered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [classroomUsers, setClassroomUsers] = useState<ProfileT[]>([]);

  // Form states
  const [squadSelected, setSquadSelected] = useState<string>("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState<LinkType[]>([]);
  const [observation, setObservation] = useState("");

  const { configsByClassroom } = useClassroomConfigStore();
  const classroomModules =
    configsByClassroom[project.classroom_id].modules || [];
  const projectModule =
    classroomModules.find((module) => module.id === project.module)?.title ||
    `M${project.module}`;

  // Filter users by classroom
  useEffect(() => {
    if (users.length > 0 && classroomId) {
      const filteredUsers = users
        .filter((u) =>
          u.profile?.classrooms?.some((c) => c.classroom_id === classroomId)
        )
        .map((u) => u.profile!)
        .filter(Boolean);
      setClassroomUsers(filteredUsers);
    }
  }, [users, classroomId]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsProjectDelivered(false);
      setSquadSelected("");
      setSelectedMemberIds([]);
      setUrl("");
      setLinks([]);
      setObservation("");
    }
  }, [isOpen]);

  const validUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      toast.error("Link inválido! Por favor, insira um link válido!");
      return false;
    }
  };

  const handleAddLink = () => {
    if (validUrl(url)) {
      setLinks([...links, { url: url.trim() }]);
      setUrl("");
      toast.success("Link anexado com sucesso!");
    }
  };

  const handleRemoveLink = (index: number) => {
    if (index < links.length) {
      setLinks(links.filter((_, i) => i !== index));
      toast.success("Link removido com sucesso!");
    }
  };

  const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const handleSubmitDelivery = async () => {
    if (!project || !user?.profile) return;

    // Validations
    if (project.project_type === "end_module_project" && !squadSelected) {
      toast.error("Selecione sua Squad!");
      scrollToRef(squadRef);
      return;
    }

    // Para projetos finais, pelo menos um membro é obrigatório
    if (
      project.project_type === "end_module_project" &&
      selectedMemberIds.length === 0
    ) {
      toast.error("Selecione pelo menos um membro da equipe!");
      scrollToRef(membersRef);
      return;
    }

    if (links.length === 0) {
      toast.error("Adicione pelo menos um Link!");
      scrollToRef(linksRef);
      return;
    }

    setIsLoading(true);

    try {
      const deliveryData = {
        project_id: project.id,
        user_id: user.profile.id,
        members_id: selectedMemberIds,
        links: links.map((l) => l.url),
        observation: observation.trim(),
        classroom_id: classroomId,
      };

      const success = await createDelivery(deliveryData, classroomId);
      if (success) {
        setIsProjectDelivered(true);
      }
    } catch (error) {
      console.error("Error creating delivery:", error);
      toast.error("Erro ao criar entrega. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const isEnglishProject =
    project.project_type === "end_module_english_project";
  const isMiniProject = project.project_type === "mini_project";

  if (isProjectDelivered) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className={
            isMobile
              ? "w-full h-full max-w-none m-0 rounded-none"
              : "max-w-4xl max-h-[90vh] overflow-y-auto"
          }
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              {isEnglishProject
                ? `${projectModule} Final Project Delivery`
                : `Entrega do ${
                    projectTypesLabels[project.project_type]
                  } do ${projectModule}`}
            </DialogTitle>
          </DialogHeader>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="font-semibold text-green-700">
                  {isEnglishProject
                    ? "Delivery was successful!"
                    : "A entrega foi feita com sucesso!"}
                </p>
                <p className="text-sm text-green-600">
                  {isEnglishProject
                    ? "We will correct it and all members will receive feedback on the project in their emails!"
                    : isMiniProject
                    ? selectedMemberIds.length > 0
                      ? "Iremos corrigir e todos os integrantes receberão o feedback do projeto em seus emails!"
                      : "Iremos corrigir e você receberá o feedback do seu projeto em seu email!"
                    : "Iremos corrigir e todos os integrantes receberão o feedback do projeto em seus emails!"}
                </p>
                <p className="text-sm text-green-600">
                  {isEnglishProject
                    ? "Stay tuned and see you next time!"
                    : "Fique ligado e até próxima!"}
                </p>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={
          isMobile
            ? "w-full h-full max-w-none m-0 rounded-none"
            : "max-w-[700px]! max-h-[90vh] overflow-y-auto"
        }
      >
        <DialogHeader>
          <DialogTitle>
            {isEnglishProject
              ? `${project.module} Final Project Delivery`
              : `Entrega do ${
                  projectTypesLabels[project.project_type]
                } do ${projectModule}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="font-semibold text-muted-foreground">
                  {isEnglishProject
                    ? "Hello, hello! 🆙"
                    : "Salve Salve, queridíssimos e queridíssimas!"}
                </p>
                <p>
                  {isEnglishProject
                    ? "How were your projects? 🙆🏿‍♀️"
                    : "Arrasaram aí no projeto?"}
                </p>
                <p>
                  {isEnglishProject
                    ? "We are really excited!"
                    : "😎 Temos certeza que sim!"}
                </p>

                {!isMiniProject && (
                  <p>
                    {isEnglishProject
                      ? "Each SQUAD will have 7 minutes to present their Project"
                      : "Cada SQUAD terá 7 minutos para apresentar seu Projeto!"}
                  </p>
                )}

                {isMiniProject && (
                  <p>
                    Lembre-se que seu projeto só é considerado entregue se a sua
                    Parceria PdA também entregar o dele/a. 👯‍♂️
                  </p>
                )}

                <p className="font-semibold text-red-800">
                  {isEnglishProject
                    ? "🔴 EACH SQUAD MUST DELIVER THE PROJECT ONLY ONCE. 🔴"
                    : isMiniProject
                    ? "🔴 A ENTREGA DEVE SER FEITA DE FORMA UNITÁRIA 🔴"
                    : "🔴 SOMENTE UM INTEGRANTE DA SQUAD DEVE FAZER A ENTREGA 🔴"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Squad Selection */}
          {!isMiniProject && (
            <Card ref={squadRef}>
              <CardHeader>
                <CardTitle>
                  {isEnglishProject
                    ? "*Number of the SQUAD"
                    : "*Número da Squad"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={squadSelected} onValueChange={setSquadSelected}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione sua Squad" />
                  </SelectTrigger>
                  <SelectContent>
                    {squads.slice(1).map((squad) => (
                      <SelectItem key={squad.id} value={squad.id}>
                        {squad.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Members Section */}
          {!isMiniProject && (
            <Card ref={membersRef}>
              <CardHeader>
                <CardTitle>
                  {isEnglishProject ? "*List Members" : "*Listar Integrantes"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MemberSelectionCombobox
                  placeholder={
                    isEnglishProject
                      ? "Select team members..."
                      : "Selecionar membros da equipe..."
                  }
                  users={classroomUsers}
                  selectedUserIds={selectedMemberIds}
                  currentUserId={user?.profile?.id || ""}
                  onChange={setSelectedMemberIds}
                />
              </CardContent>
            </Card>
          )}

          {/* Members Section for Mini Projects */}
          {isMiniProject && (
            <Card ref={membersRef}>
              <CardHeader>
                <CardTitle>Integrantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current User Info */}
                  <p className="text-xs text-primary-foreground font-medium">
                    Responsável pela entrega
                  </p>
                  <div className="p-4 bg-primary/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user?.profile.avatar_url || ""} />
                        <AvatarFallback>
                          {user?.profile?.full_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="font-medium">
                          {user?.profile?.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user?.profile?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Members Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Outros membros (opcional)
                    </Label>
                    <MemberSelectionCombobox
                      placeholder="Selecionar outros membros do projeto..."
                      users={classroomUsers}
                      selectedUserIds={selectedMemberIds}
                      currentUserId={user?.profile?.id || ""}
                      onChange={setSelectedMemberIds}
                    />
                    <p className="text-xs text-muted-foreground">
                      Você pode adicionar outros membros que participaram do
                      projeto.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Links Section */}
          <Card ref={linksRef}>
            <CardHeader>
              <CardTitle>
                {isEnglishProject ? "*Attach Links" : "*Anexar Links"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://"
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddLink}>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    {isEnglishProject ? "Add Link" : "Anexar Link"}
                  </Button>
                </div>

                {links.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        <span className="font-semibold">
                          {links.length}{" "}
                          {isEnglishProject
                            ? "Links added"
                            : "Links adicionados"}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {links.map((link, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <p className="text-sm truncate flex-1 mr-2">
                              {link.url}
                            </p>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => handleRemoveLink(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Observation Section */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isEnglishProject ? "(Optional) Note" : "(Opcional) Observação"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="observation">
                  {isEnglishProject
                    ? "Is there anything we need to know when correcting?"
                    : "Tem algo que precisamos saber na hora da correção?"}
                </Label>
                <Textarea
                  id="observation"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  rows={3}
                  placeholder=""
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="font-medium">
                  {isEnglishProject
                    ? "Please, check all fields before submitting your response!"
                    : "Verifique todos os campos antes de enviar a sua resposta!"}
                </p>
                <Button
                  onClick={handleSubmitDelivery}
                  disabled={isLoading}
                  className="w-full md:w-auto"
                  size="lg"
                >
                  {isLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {isLoading
                    ? isEnglishProject
                      ? "Submitting..."
                      : "Enviando..."
                    : isEnglishProject
                    ? "Submit"
                    : "Enviar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDeliveryModal;
