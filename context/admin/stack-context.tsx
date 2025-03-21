"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import LoadingComponent from "@/components/loading-component";

import { AuthUser } from "@supabase/supabase-js";
import {
  createJob,
  deleteJob,
  getAllJobsWithApplications,
  updateJob,
} from "@/app/actions/jobs";
import { getAllProfiles, getProfileById } from "@/app/actions/profiles";

import { JobType, JobWithApplications } from "@/types/jobs";
import { AuthUserWithProfileType, RolesType } from "@/types/auth";
import {
  createUser,
  deleteUser,
  getAllUsers,
  updateUser,
} from "@/app/actions/auth_admin";
import {
  deleteUserRoleWithUserId,
  insertUserRoleWithUserId,
  updateUserRoleWIthUserId,
} from "@/app/actions/roles";
import { TeamPeriodsType, TeamType } from "@/types/teams";
import {
  createTeam,
  deleteTeam,
  getAllTeams,
  updateTeam,
} from "@/app/actions/team";

import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Book, Briefcase, Users } from "lucide-react";
import { createTeamCoodeshAssessment, updateTeamCoodeshAssessment } from "@/app/actions/team/coodesh";
import {
  AssessmentPayloadType,
  TeamCoodeshAssessments,
} from "@/types/assessments";
import axios from "axios";

interface AdminStackContextProps {
  usersStack: {
    users: Partial<AuthUserWithProfileType>[];
    handleCreateNewUser: (
      user: Partial<AuthUser & { password: string }>
    ) => Promise<string | false>;
    handleUpdateUser: (
      userID: string,
      user: Partial<AuthUser & { password: string }>
    ) => Promise<boolean>;
    handleDeleteUser: (userId: string) => Promise<boolean>;
  };
  userRoleStack: {
    handleAddUserRole: (userId: string, role: RolesType) => Promise<boolean>;
    handleUpdateUserRole: (userId: string, role: RolesType) => Promise<boolean>;
    handleDeleteUserRole: (userId: string) => Promise<boolean>;
  };
  teamsStack: {
    teams: TeamType[];
    handleCreateTeam: (teamData: {
      name: string;
      period: TeamPeriodsType;
    }) => Promise<boolean | string>;
    handleUpdateTeam: (
      teamId: string,
      updates: Partial<TeamType>
    ) => Promise<boolean>;
    handleDeleteTeam: (teamId: string) => Promise<boolean>;
    coodesh: {
      handleCreateTeamAssessment: (
        assessmentData: Partial<TeamCoodeshAssessments>
      ) => Promise<boolean>;
      handleUpdateTeamAssessment: (
        assessmentId: string,
        assessmentData: Partial<TeamCoodeshAssessments>
      ) => Promise<boolean>;
      api: {
        assessments: AssessmentPayloadType[];
        handleGetAssessments: () => Promise<boolean>;
      };
    };
  };
  jobsStack: {
    jobs: JobWithApplications[];
    handleCreateJob: (job: Partial<JobType>) => Promise<boolean>;
    handleUpdateJob: (jobId: string, job: Partial<JobType>) => Promise<boolean>;
    handleDeleteJob: (id: string) => Promise<boolean>;
    handleCurateJob: (jobId: string) => Promise<boolean>;
    handleResendJobToCuration: (jobId: string) => Promise<boolean>;
    handleArchiveJob: (jobId: string) => Promise<boolean>;
    handleJobIsOnDiscord: (jobId: string) => Promise<boolean>;
  };
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const AdminStackContext = createContext<AdminStackContextProps>({
  usersStack: {
    users: [],
    handleCreateNewUser: () => Promise.resolve(false),
    handleUpdateUser: () => Promise.resolve(false),
    handleDeleteUser: () => Promise.resolve(false),
  },
  userRoleStack: {
    handleAddUserRole: () => Promise.resolve(false),
    handleUpdateUserRole: () => Promise.resolve(false),
    handleDeleteUserRole: () => Promise.resolve(false),
  },
  teamsStack: {
    teams: [],
    handleCreateTeam: () => Promise.resolve(false),
    handleUpdateTeam: () => Promise.resolve(false),
    handleDeleteTeam: () => Promise.resolve(false),
    coodesh: {
      handleCreateTeamAssessment: () => Promise.resolve(false),
      handleUpdateTeamAssessment: () => Promise.resolve(false),
      api: {
        assessments: [],
        handleGetAssessments: () => Promise.resolve(false),
      },
    },
  },
  jobsStack: {
    jobs: [],
    handleCreateJob: () => Promise.resolve(false),
    handleUpdateJob: () => Promise.resolve(false),
    handleDeleteJob: () => Promise.resolve(false),
    handleCurateJob: () => Promise.resolve(false),
    handleResendJobToCuration: () => Promise.resolve(false),
    handleArchiveJob: () => Promise.resolve(false),
    handleJobIsOnDiscord: () => Promise.resolve(false),
  },
  loading: true,
  setLoading: () => {},
});

const exampleAssessment = {
  total: 27,
  limit: 150,
  payload: [
    {
      assessment_id: "67b362e1e4e70b59c67d48e3",
      name: "[M3] Teste de Código - Turma #06",
      description: "Teste de conhecimentos de banco de dados com linguagem SQL",
      default_locale: "pt",
      duration: 30,
      duration_unit: "minute",
      questions: [
        {
          name: "Questionário SQL",
          description:
            "Esse teste contem 20 questões, você tem 30 minutos para responder as questões e elas te avaliarão sobre conceitos do SQL",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "67af9390bf88aa880e4134f2",
      name: "<Academia PdA> [M2] - Teste de módul",
      description: "",
      default_locale: "pt",
      duration: 3,
      duration_unit: "hour",
      questions: [
        {
          name: "IMC",
          description:
            "# Descrição\nEscreva uma função que recebe o peso em kg e a altura em metros de uma pessoa e retorna o seu IMC (Índice de Massa Corpórea).\n# TABELA:\n- Menor que 18,5 — Abaixo do peso\n- Entre 18,5 (inclusivo) e 25 (exclusivo) — Peso normal ou adequado\n- Entre 25 (inclusivo) e 30 (exclusivo) — Sobrepeso\n- Entre 30 (inclusivo) e 35 (exclusivo) — Obesidade Grau I\n- Entre 35 (inclusivo) e 40 (exclusivo) — Obesidade Grau II\n- Maior que 40 (inclusivo) — Obesidade Grau III",
          type: "coding",
          type_formatted: "Programação",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 15,
          duration_unit: "minute",
        },
        {
          name: "Informar o número faltante ou o próximo",
          description:
            "# Descrição:\nVocê recebeu um array de números e deve retornar o número faltante ou o próximo número do array.\n## Nota:\n- Todos os números são válidos Int32 , sem necessidade de validá-los.\n- Será enviado um array com a sequência de números positivos e/ou negativos em ordem crescente, contendo no mínimo 5 itens e no máximo 500 items.\n# Código de exemplo:\n```bash\n[0,1,2,3,5] = 4\n[0,1,2,3,4,5,6,7,8,9,10] = 11\n```",
          type: "coding",
          type_formatted: "Programação",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "Qual é a diferença entre if e operador ternário em Conditional rendering?",
          description:
            "Qual é a diferença entre if e operador ternário em Conditional rendering?",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 5,
          duration_unit: "minute",
        },
        {
          name: "Maior número de 5 dígitos em uma série",
          description:
            "# Descrição\n\nComplete a solução para que ela retorne a maior sequência de cinco dígitos consecutivos encontrados dentro do número dado. \n\nO número será passado como uma **string** formada somente por dígitos. Ele deve retornar um número inteiro de cinco dígitos. O número passado pode ter até 1000 dígitos.\n\n## Exemplo\n\n```\nsolution(1234567890) // 67890 é a maior sequência de cinco dígitos.\n\n```",
          type: "coding",
          type_formatted: "Programação",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "Encontre os divisores",
          description:
            '# Descrição\n\nCrie uma função chamada divisors que recebe um inteiro **_n > 1_** e retorna uma matriz com todos os divisores do inteiro (exceto 1 e o próprio número), do menor para o maior. \n\nSe o número for primo, retorne a string `(integer) is prime`.\n\n## Código de Exemplo:\n\n```\ndivisors(12); // should return "2, 3, 4, 6"\ndivisors(25); // should return "5"\ndivisors(13); // should return "13 is prime"\n```',
          type: "coding",
          type_formatted: "Programação",
          level: "advanced",
          level_formatted: "Avançado",
          duration: 60,
          duration_unit: "minute",
        },
        {
          name: "Soma de números primos",
          description:
            "**Descrição**\n\nA soma dos primos abaixo de **10** é **2 + 3 + 5 + 7 = 17**. Com base nesta informação, implemente a função **sumPrimes** para encontrar a soma dos números primos fornecidos no parâmetro **n**.\n\nA variável **n** possui valores entre 0 > N > Int32\n\n**Nota**:\n\nO tempo máximo de execução do código é de 4 segundos, então considere a performance em sua implementação.",
          type: "coding",
          type_formatted: "Programação",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "Validação de Movimentos de Xadrez",
          description:
            '### **Descrição**\n\nO problema consiste em verificar se um movimento no xadrez é válido, considerando a peça utilizada e as coordenadas de partida e destino. A função deve receber a inicial da peça em inglês, as coordenadas de início e de destino, e retornar um valor booleano indicando se o movimento é válido para aquela peça.\n\nNeste exemplo abaixo, o tabuleiro começa com as peças de xadrez em suas posições iniciais. As letras maiúsculas representam as peças brancas e as minúsculas representam as peças pretas. Os pontos (`.`) indicam casas vazias. Os números à esquerda representam as linhas (1-8), enquanto as letras no topo e na parte inferior representam as colunas (a-h).\n\n```\n   a b c d e f g h\n +----------------+\n8| r n b q k b n r |\n7| p p p p p p p p |\n6| . . . . . . . . |\n5| . . . . . . . . |\n4| . . . . . . . . |\n3| . . . . . . . . |\n2| P P P P P P P P |\n1| R N B Q K B N R |\n +----------------+\n```\n\n**Parâmetros**\n\nO método solution deve aceitar os seguintes parâmetros:\n\n*   piece: Inicial da peça a ser movida. As iniciais das peças são: "R" para torre (Rook), "N" para cavalo (Knight), "B" para bispo (Bishop), "Q" para rainha (Queen), "K" para rei (King), e "P" para peão (Pawn).\n    \n*   fromPosition: array com dois valores\n    \n*   toPosition: array com dois números\n    \n\nAs coordenadas de entrada para o tabuleiro variam entre 1 e 8 para linhas e colunas.\n\n**Exemplos**\n\n```python\n# Torre: movimento válido na mesma coluna\nprint(movimento_xadrez("R", (1, 1), (5, 1)))  # Saída esperada: True\n\n# Cavalo: movimento válido em L\nprint(movimento_xadrez("N", (1, 1), (3, 2)))  # Saída esperada: True\n\n# Bispo: movimento válido na diagonal\nprint(movimento_xadrez("B", (1, 1), (4, 4)))  # Saída esperada: True\n\n# Rainha: movimento válido em linha reta\nprint(movimento_xadrez("Q", (1, 1), (1, 8)))  # Saída esperada: True\n\n# Rei: movimento válido para casa adjacente\nprint(movimento_xadrez("K", (1, 1), (2, 2)))  # Saída esperada: True\n\n# Peão: movimento válido de duas casas no primeiro movimento\nprint(movimento_xadrez("P", (2, 1), (4, 1)))  # Saída esperada: True\n\n# Peão: movimento inválido (tenta mover para trás)\nprint(movimento_xadrez("P", (2, 1), (1, 1)))  # Saída esperada: False\n```',
          type: "coding",
          type_formatted: "Programação",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 15,
          duration_unit: "minute",
        },
        {
          name: "Condicionais em JavaScript",
          description: "Para que serve o switch & case em JavaScript?",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 5,
          duration_unit: "minute",
        },
        {
          name: "Funções com parâmetros e retorno em JavaScript",
          description:
            "Considere a seguinte função em JavaScript:\n\n```javascript\nfunction calcularDesconto(preco) {\n\n  let valorDesconto = preco * 0.1;\n\n  return preco - valorDesconto;\n}\n```\n\nQual será o valor retornado pela função calcularDesconto(preco) se o parâmetro preco for 200?",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "advanced",
          level_formatted: "Avançado",
          duration: 5,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "67acc042ffda66324c134895",
      name: "[M1] Teste de Código - Turma Crucilândia",
      description: "Nivelamento do M1 - Introdução lógica 🧠",
      default_locale: "pt",
      duration: 30,
      duration_unit: "minute",
      questions: [
        {
          name: "Introdução ao Desenvolvimento Web",
          description:
            "Esse teste contém 10 questões sobre o Introdução ao Desenvolvimento Web. Você tem 30 minutos para responder as questões.",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "67ab69a1501bc659a9fca965",
      name: "[MODELO][M1] Teste de Código - Turma Crucilândia",
      description: "Nivelamento do M1 - Introdução lógica 🧠",
      default_locale: "pt",
      duration: 30,
      duration_unit: "minute",
      questions: [
        {
          name: "Introdução ao Desenvolvimento Web",
          description:
            "Esse teste contém 10 questões sobre o Introdução ao Desenvolvimento Web. Você tem 30 minutos para responder as questões.",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "679774c82cff48b06f3f8df4",
      name: "[Simulador de PS] Desenvolvedor Junior Fullstack",
      description: "",
      default_locale: "pt",
      duration: 2,
      duration_unit: "hour",
      questions: [
        {
          name: "React.js",
          description:
            "Esse teste contém 20 questões sobre React.js. Você tem 30 minutos para responder as questões.",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "Javascript",
          description:
            "Esse teste contem 10 questões, você tem 50 minutos para responder as questões e elas te avaliarão sobre conhecimentos técnicos do Javascript",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 50,
          duration_unit: "minute",
        },
        {
          name: "Questionário SQL",
          description:
            "Esse teste contem 20 questões, você tem 30 minutos para responder as questões e elas te avaliarão sobre conceitos do SQL",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "Node.js & Express",
          description:
            "Esse teste contém 20 questões sobre Node.js. Você tem 30 minutos para responder as questões.",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "Introdução ao Desenvolvimento Web",
          description:
            "Esse teste contém 10 questões sobre o Introdução ao Desenvolvimento Web. Você tem 30 minutos para responder as questões.",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "679266309bc8f19a52f805cb",
      name: "[Simulador PS] Live-coding",
      description: "",
      default_locale: "pt",
      duration: 15,
      duration_unit: "minute",
      questions: [
        {
          name: "[Simulador PS] Informar o número faltante ou o próximo",
          description:
            "# Descrição:\nVocê recebeu um array de números e deve retornar o número faltante ou o próximo número do array.\n## Nota:\n- Todos os números são válidos Int32 , sem necessidade de validá-los.\n- Será enviado um array com a sequência de números positivos e/ou negativos em ordem crescente, contendo no mínimo 5 itens e no máximo 500 items.\n# Código de exemplo:\n```bash\n[0,1,2,3,5] = 4\n[0,1,2,3,4,5,6,7,8,9,10] = 11\n```",
          type: "coding",
          type_formatted: "Programação",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "6787ca686880ac8c0ee335c4",
      name: "[Avaliação delta de aprendizagem] Nivelando experiencias 🧠 - Turma #06 - 2/3",
      description: "",
      default_locale: "pt",
      duration: 2,
      duration_unit: "hour",
      questions: [
        {
          name: "</HTML, CSS e Javascript> Nivelamento do M1",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em HTML, CSS e JavaScript referente ao Módulo 1 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "</JavaScript> Nivelamento do M2",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em JavaScript referente ao Módulo 2 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "</MySQL> Nivelamento do M3",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em MySQL referente ao Módulo 3 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "</Node.js & Express> Nivelamento do M4",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em Node.js e Express referente ao Módulo 4 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "</React.js> Nivelamento do M5",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em React.js referente ao Módulo 5 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "675c69fc6c77d7f02aaf6750",
      name: "<Academia PdA> [M1] - Teste de módulo",
      description: "",
      default_locale: "pt",
      duration: 5,
      duration_unit: "hour",
      questions: [
        {
          name: "Qual operador tem maior precedência?",
          description: "Qual destes operadores tem maior precedência?",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 5,
          duration_unit: "minute",
        },
        {
          name: "Compreendendo o escopo de variáveis em Python",
          description:
            "Considere o seguinte trecho de código em Python:\n\n```python\n\ndef funcao1():\n\n    x = 10\n\n    def funcao2():\n\n        nonlocal x\n\n        x = 20\n\n    funcao2()\n\n    return x\n\n\n\nx = 30\n\ny = funcao1()\n\nprint(x, y)\n\n```\n\nQual será a saída deste código?",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 5,
          duration_unit: "minute",
        },
        {
          name: "Diferenças entre let, const e var em TypeScript e JavaScript ES6+",
          description:
            "Em TypeScript e JavaScript ES6+, existem três maneiras de declarar variáveis: usando 'var', 'let' e 'const'. Qual das opções a seguir descreve corretamente as diferenças entre essas três declarações?",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 5,
          duration_unit: "minute",
        },
        {
          name: "Divisibilidade",
          description:
            "**Descrição**\n\nA partir do número **_n_,** retorne todos os inteiros **_i_** que sejam divisíveis por **_x_** e que não são divisíveis por **_y_**, onde 1 < i <n <100000.\n\n**Entrada**\n\nO método do teste receberá as seguintes variáveis:\n\n*   n: número inteiro, sendo n < 100000\n    \n*   x: número inteiro, sendo **x** < **n** e **x** não é divisível por **y**\n    \n*   y: número inteiro\n    \n\n**Saída**\n\nRetorne uma string contendo os números solicitados na descrição do problema separados por um único espaço em ordem crescente.\n\n**Exemplo**\n\n```javascript\ndivisors(7, 2, 4) // retorna 2 6\ndivisors(35, 5, 12) // 5 10 15 20 25 30\ndivisors(35, 5, 15) // 5 10 20 25\n```",
          type: "coding",
          type_formatted: "Programação",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 330,
          duration_unit: "minute",
        },
        {
          name: "Tipos de Dados",
          description:
            '<img id="986a42ab-9d89-4127-9615-8f60acd483cc" src="https://cdn.coodesh.com/library/655d17a9eff89f0012383f8c/question/675c6c216c77d7f02aaf83e6-52f4f6a7-e298-4197-b8ea-6612de0ee806.png" width="894px" height="672px">\n\nO exemplo acima refere-se a qual tipo de dado?',
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 3,
          duration_unit: "minute",
        },
        {
          name: "Operadores",
          description:
            "Qual operador representa resto da divisão em JavaScript?",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 3,
          duration_unit: "minute",
        },
        {
          name: "Métodos de Array",
          description:
            "Qual método permite alterar as informações de um array, retornando um novo array em JavaScript.",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 3,
          duration_unit: "minute",
        },
        {
          name: "Operadores lógicos",
          description: "Em JavaScript 0 === ‘0’ retorna verdadeiro?",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 2,
          duration_unit: "minute",
        },
        {
          name: "Tipos de dados numéricos",
          description:
            "Qual tipo de dado numério representa o seguinte número: ¾ em Python",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 3,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "6756bb58df75ad8727750c3d",
      name: "[Teste 2] Empregabilidade Já - Fullstack",
      description: " Teste Proeficiência Técnica Empregabilidade Já",
      default_locale: "pt",
      duration: 95,
      duration_unit: "minute",
      questions: [
        {
          name: "React",
          description:
            "Esse teste contem 20 questões, você tem 30 minutos para responder as questões e elas te avaliarão sobre conceitos do ReactJS",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "SQL",
          description:
            "Esse teste contem 20 questões, você tem 30 minutos para responder as questões e elas te avaliarão sobre conceitos do SQL",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "ReactJS Hooks",
          description:
            "Esse teste contem 10 questões, você tem 15 minutos para responder as questões e elas te avaliarão sobre conceitos básicos do ReactJS na parte de Hooks e Eventos",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 15,
          duration_unit: "minute",
        },
        {
          name: "ReactJS Basics",
          description:
            "Esse teste contem 20 questões, você tem 30 minutos para responder as questões e elas te avaliarão sobre conceitos básicos do ReactJS na parte de ciclo de vida, renderização, props e entre outros",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "ReactJS Create",
          description:
            "Esse teste contem 10 questões, você tem 15 minutos para responder as questões e elas te avaliarão sobre conceitos básicos do ReactJS na na CRA, NPM, WebPack, Babel",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 15,
          duration_unit: "minute",
        },
        {
          name: "Node.js e Banco de Dados",
          description:
            "Esse teste contém 10 questões, você tem 15 minutos para responder as questões e elas te avaliarão sobre conceitos de banco de dados",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 15,
          duration_unit: "minute",
        },
        {
          name: "CSS",
          description:
            "Esse teste contém 10 questões sobre CSS. Você tem 15 minutos para responder as questões.",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 15,
          duration_unit: "minute",
        },
        {
          name: "Múltiplo de 3 ou 5",
          description:
            "# **Descrição**\n\nSe listarmos todos os números naturais abaixo de 10 que são múltiplos de 3 ou 5, obtemos 3, 5, 6 e 9\\. A soma desses múltiplos é 23.\n\nImplemente uma solução para que ela retorne a soma de todos os múltiplos de 3 ou 5 abaixo do número passado. Além disso, se o número for negativo, retorne 0.\n\nSe o número for múltiplo de 3 e 5 ao mesmo tempo, conte-o apenas uma vez.\n\n## Exemplos\n\n```\nmultipleOf3Or5(10) // 23\nmultipleOf3Or5(20) // 78\nmultipleOf3Or5(30) // 195\nmultipleOf3Or5(40) // 368 \n\n```",
          type: "coding",
          type_formatted: "Programação",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 15,
          duration_unit: "minute",
        },
        {
          name: "Node.js",
          description:
            "Esse teste contém 20 questões sobre Node.js. Você tem 30 minutos para responder as questões.",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "Soma de números primos",
          description:
            "**Descrição**\n\nA soma dos primos abaixo de **10** é **2 + 3 + 5 + 7 = 17**. Com base nesta informação, implemente a função **sumPrimes** para encontrar a soma dos números primos fornecidos no parâmetro **n**.\n\nA variável **n** possui valores entre 0 > N > Int32\n\n**Nota**:\n\nO tempo máximo de execução do código é de 4 segundos, então considere a performance em sua implementação.",
          type: "coding",
          type_formatted: "Programação",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "Javascript Basics",
          description:
            "Esse teste contem 9 questões, você tem 1 hora e 30 minutos para responder as questões e elas te avaliarão sobre conceitos do Javascript",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 90,
          duration_unit: "minute",
        },
        {
          name: "Node & Express - Questões técicas",
          description:
            "Em 1 hora vocês devem realizar as questões técnicas de Node.js e Express. Para isso analisem a pergunta e assinale o código correto que resolva a pergunta.\n\nTodo o conteúdo dos testes foram passados durante o M4 do curso de programação web da Programadores do amanhã.",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 60,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "67506ddc18637312ec7154f2",
      name: "[M2] Teste de Código - Turma #06",
      description: "",
      default_locale: "pt",
      duration: 82,
      duration_unit: "minute",
      questions: [
        {
          name: "IMC",
          description:
            "# Descrição\nEscreva uma função que recebe o peso em kg e a altura em metros de uma pessoa e retorna o seu IMC (Índice de Massa Corpórea).\n# TABELA:\n- Menor que 18,5 — Abaixo do peso\n- Entre 18,5 (inclusivo) e 25 (exclusivo) — Peso normal ou adequado\n- Entre 25 (inclusivo) e 30 (exclusivo) — Sobrepeso\n- Entre 30 (inclusivo) e 35 (exclusivo) — Obesidade Grau I\n- Entre 35 (inclusivo) e 40 (exclusivo) — Obesidade Grau II\n- Maior que 40 (inclusivo) — Obesidade Grau III",
          type: "coding",
          type_formatted: "Programação",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 15,
          duration_unit: "minute",
        },
        {
          name: "Múltiplo de 3 ou 5",
          description:
            "# **Descrição**\n\nSe listarmos todos os números naturais abaixo de 10 que são múltiplos de 3 ou 5, obtemos 3, 5, 6 e 9\\. A soma desses múltiplos é 23.\n\nImplemente uma solução para que ela retorne a soma de todos os múltiplos de 3 ou 5 abaixo do número passado. Além disso, se o número for negativo, retorne 0.\n\nSe o número for múltiplo de 3 e 5 ao mesmo tempo, conte-o apenas uma vez.\n\n## Exemplos\n\n```\nmultipleOf3Or5(10) // 23\nmultipleOf3Or5(20) // 78\nmultipleOf3Or5(30) // 195\nmultipleOf3Or5(40) // 368 \n\n```",
          type: "coding",
          type_formatted: "Programação",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 15,
          duration_unit: "minute",
        },
        {
          name: "Javascript",
          description:
            "Esse teste contem 10 questões, você tem 50 minutos para responder as questões e elas te avaliarão sobre conhecimentos técnicos do Javascript",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 50,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "6745e4a7d5af0fa00fbda3f1",
      name: "[Avaliação delta de aprendizagem] Nivelando experiencias 🧠 - Turma Crucilândia - 1/3",
      description: "",
      default_locale: "pt",
      duration: 2,
      duration_unit: "hour",
      questions: [
        {
          name: "</HTML, CSS e Javascript> Nivelamento do M1",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em HTML, CSS e JavaScript referente ao Módulo 1 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "</JavaScript> Nivelamento do M2",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em JavaScript referente ao Módulo 2 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "</MySQL> Nivelamento do M3",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em MySQL referente ao Módulo 3 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "</Node.js & Express> Nivelamento do M4",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em Node.js e Express referente ao Módulo 4 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "</React.js> Nivelamento do M5",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em React.js referente ao Módulo 5 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "672cf9c6e4e48c00c6a96e74",
      name: "[Teste 1] Empregabilidade Já - Fullstack",
      description: " Teste Proeficiência Técnica Empregabilidade Já",
      default_locale: "pt",
      duration: 119,
      duration_unit: "minute",
      questions: [
        {
          name: "SQL",
          description:
            "Esse teste contem 20 questões, você tem 30 minutos para responder as questões e elas te avaliarão sobre conceitos do SQL",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "Maior e menor número",
          description:
            '# Descrição\n\nNesta pequena tarefa, você recebe uma sequência de números separados por espaços e deve retornar o número mais alto e o mais baixo.\n\n## Nota:\n\n- Todos os números são válidos Int32 , sem necessidade de validá-los.\n- Sempre haverá pelo menos um número na STRING de entrada.\n- A STRING de saída deve ser dois números separados por um único espaço, e o número mais alto é o primeiro.\n\n### Código de Exemplo:\n\n- highAndLow("1 2 3 4 5"); // retorna "5 1"\n- highAndLow("1 2 -3 4 5"); // retorna "5 -3"\n- highAndLow("1 9 3 4 -5"); // retorna "9 -5',
          type: "coding",
          type_formatted: "Programação",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 15,
          duration_unit: "minute",
        },
        {
          name: "Informar o número faltante ou o próximo",
          description:
            "# Descrição:\nVocê recebeu um array de números e deve retornar o número faltante ou o próximo número do array.\n## Nota:\n- Todos os números são válidos Int32 , sem necessidade de validá-los.\n- Será enviado um array com a sequência de números positivos e/ou negativos em ordem crescente, contendo no mínimo 5 itens e no máximo 500 items.\n# Código de exemplo:\n```bash\n[0,1,2,3,5] = 4\n[0,1,2,3,4,5,6,7,8,9,10] = 11\n```",
          type: "coding",
          type_formatted: "Programação",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "ReactJS Hooks",
          description:
            "Esse teste contem 10 questões, você tem 15 minutos para responder as questões e elas te avaliarão sobre conceitos básicos do ReactJS na parte de Hooks e Eventos",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 15,
          duration_unit: "minute",
        },
        {
          name: "ReactJS Basics",
          description:
            "Esse teste contem 20 questões, você tem 30 minutos para responder as questões e elas te avaliarão sobre conceitos básicos do ReactJS na parte de ciclo de vida, renderização, props e entre outros",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "ReactJS Create",
          description:
            "Esse teste contem 10 questões, você tem 15 minutos para responder as questões e elas te avaliarão sobre conceitos básicos do ReactJS na na CRA, NPM, WebPack, Babel",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 15,
          duration_unit: "minute",
        },
        {
          name: "O que é uma API RESTful?",
          description: "O que é uma API RESTful?",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 5,
          duration_unit: "minute",
        },
        {
          name: "Node.js e Banco de Dados",
          description:
            "Esse teste contém 10 questões, você tem 15 minutos para responder as questões e elas te avaliarão sobre conceitos de banco de dados",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 15,
          duration_unit: "minute",
        },
        {
          name: "HTML5",
          description:
            "Esse teste contém 20 questões sobre o HTML5. Você tem 30 minutos para responder as questões.",
          type: "fast",
          type_formatted: "Questionário",
          level: "advanced",
          level_formatted: "Avançado",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "CSS",
          description:
            "Esse teste contém 10 questões sobre CSS. Você tem 15 minutos para responder as questões.",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 15,
          duration_unit: "minute",
        },
        {
          name: "Promises e async/await",
          description:
            "Considere o seguinte trecho de código JavaScript que utiliza Promises e `async/await` para tratamento de erros. Com base neste código, qual das seguintes afirmações é verdadeira?\n```\nasync function fetchData(url) {\n  try {\n    let response = await fetch(url);\n    if (!response.ok) {\n      throw new Error(`HTTP error! status: ${response.status}`);\n    }\n    let data = await response.json();\n    return data;\n  } catch (e) {\n    console.log(`Erro ao buscar os dados:`, e.message);\n    return null;\n  }\n}\n```",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 5,
          duration_unit: "minute",
        },
        {
          name: "Comportamento do useEffect com Dependências",
          description:
            "Considere o seguinte trecho de código de um componente funcional em React. Com base nesse código, selecione as afirmações corretas.\n```\nimport React, { useState, useEffect } from 'react';\nfunction ExampleComponent() {\n  const [count, setCount] = useState(0);\n  const [name, setName] = useState('React');\n  useEffect(() => {\n    document.title = `You clicked ${count} times`;\n  }, [count]);\n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>Click me</button>\n      <button onClick={() => setName('ReactJS')}>Change name</button>\n    </div>\n  );\n}\n```",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 5,
          duration_unit: "minute",
        },
        {
          name: "Node.js",
          description:
            "Esse teste contém 20 questões sobre Node.js. Você tem 30 minutos para responder as questões.",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "Implementar um Simulador de Paginação",
          description:
            "Escreva uma função que simule o comportamento de um paginador para listas de dados em um sistema de gerenciamento de conteúdo. A função deve aceitar três parâmetros: uma lista de itens (`data`), o número da página atual (`page_number`), e o número de itens por página (`page_size`).\n\nA função deve retornar uma string que represente os itens da página solicitada. Considere que a numeração das páginas começa em 1. Se a página solicitada estiver fora do intervalo, a função deve retornar uma lista vazia. Além disso, a função deve ser capaz de lidar com listas vazias e valores inválidos para `page_number` e `page_size` de forma graciosa, retornando uma lista vazia nesses casos.\n\nExemplos:\n\n*   Dados: `[1, 2, 3, 4, 5]`, Número da página: `2`, Tamanho da página: `2` => Resultado: `[3, 4]`\n    \n*   Dados: `[1, 2, 3, 4, 5, 6, 7, 8, 9]`, Número da página: `3`, Tamanho da página: `3` => Resultado: `[7, 8, 9]`\n    \n*   Dados: `[]`, Número da página: `1`, Tamanho da página: `3` => Resultado: `[]`\n    \n*   Dados: `[1, 2, 3]`, Número da página: `5`, Tamanho da página: `1` => Resultado: `[]`",
          type: "coding",
          type_formatted: "Programação",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "Contexto em React",
          description: "O que é o Contexto em React?",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "advanced",
          level_formatted: "Avançado",
          duration: 5,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "67222360aefc3b941b283a27",
      name: "[Avaliação delta de aprendizagem] Nivelando experiências 🧠 - Turma #05",
      description: "",
      default_locale: "pt",
      duration: 2,
      duration_unit: "hour",
      questions: [
        {
          name: "</HTML, CSS e Javascript> Nivelamento do M1",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em HTML, CSS e JavaScript referente ao Módulo 1 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "</JavaScript> Nivelamento do M2",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em JavaScript referente ao Módulo 2 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "</MySQL> Nivelamento do M3",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em MySQL referente ao Módulo 3 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "</Node.js & Express> Nivelamento do M4",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em Node.js e Express referente ao Módulo 4 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "</React.js> Nivelamento do M5",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em React.js referente ao Módulo 5 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "66faae031ec276c1011a8ce9",
      name: "[M5] Teste de Código - Turma #05",
      description: "Nivelamento do M5 - Reações 😄😭",
      default_locale: "pt",
      duration: 30,
      duration_unit: "minute",
      questions: [
        {
          name: "</React.js> Nivelamento do M5",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em React.js referente ao Módulo 5 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "66f544a9d4dc605af0d45f17",
      name: "[M1] Teste de Código - Turma #06",
      description: "Nivelamento do M1 - Introdução lógica 🧠",
      default_locale: "pt",
      duration: 30,
      duration_unit: "minute",
      questions: [
        {
          name: "</HTML, CSS e Javascript> Nivelamento do M1",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em HTML, CSS e JavaScript referente ao Módulo 1 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "66cc8d149fa3acf62f37faa0",
      name: "<Academia PdA> [M0] - Teste de módulo",
      description: "Testes baseados no currículo da Academia PdA - Módulo 0",
      default_locale: "pt",
      duration: 44,
      duration_unit: "minute",
      questions: [
        {
          name: "Algoritmo",
          description:
            "Marque a resposta que mais se aproxima do conceito de Algoritmo.",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 5,
          duration_unit: "minute",
        },
        {
          name: "Características Fundamentais de Algoritmos",
          description:
            "Qual das alternativas abaixo é uma característica fundamental de um algoritmo?",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 3,
          duration_unit: "minute",
        },
        {
          name: "Pensamento Computacional",
          description: "O que seria pensamento computacional?",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 5,
          duration_unit: "minute",
        },
        {
          name: "Explique a importância da análise de causa raiz na resolução de problemas.",
          description:
            "Por que entender a causa raiz é crucial para resolver um problema de maneira eficaz?",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 5,
          duration_unit: "minute",
        },
        {
          name: "Pensamento Computacional e Algoritmos",
          description:
            "Como os algoritmos se relacionam com o pensamento computacional?",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 5,
          duration_unit: "minute",
        },
        {
          name: "Formulando Hipóteses",
          description:
            "Como a formulação de hipóteses pode ajudar na resolução de problemas?",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 5,
          duration_unit: "minute",
        },
        {
          name: "Decomposição de Problemas Complexos",
          description:
            "Como a decomposição inadequada pode prejudicar a solução final de um problema?",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "advanced",
          level_formatted: "Avançado",
          duration: 5,
          duration_unit: "minute",
        },
        {
          name: "Decomposição de problemas complexos e Algoritmos",
          description:
            "Qual é o impacto da decomposição de problemas na complexidade algorítmica?",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "advanced",
          level_formatted: "Avançado",
          duration: 7,
          duration_unit: "minute",
        },
        {
          name: "Decomposição de problemas e desenvolvimento de software",
          description:
            "Qual é a relação entre decomposição de problemas e modularização no desenvolvimento de software?",
          type: "question",
          type_formatted: "Múltipla escolha",
          level: "advanced",
          level_formatted: "Avançado",
          duration: 4,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "66bcb6e6583ef709559e627d",
      name: "[MODELO][M3] Arquitetura e modelagem de dados",
      description: "Teste de conhecimentos de banco de dados com linguagem SQL",
      default_locale: "pt",
      duration: 30,
      duration_unit: "minute",
      questions: [
        {
          name: "Questionário SQL",
          description:
            "Esse teste contem 20 questões, você tem 30 minutos para responder as questões e elas te avaliarão sobre conceitos do SQL",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "66bcb6aebf5aa6a1382455ca",
      name: "[MODELO][M4] Teste de Código",
      description: "",
      default_locale: "pt",
      duration: 30,
      duration_unit: "minute",
      questions: [
        {
          name: "Node.js & Express",
          description:
            "Esse teste contém 20 questões sobre Node.js. Você tem 30 minutos para responder as questões.",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "66a299464d6f173757ce6ae5",
      name: "[M4] Teste de Código - Turma #05",
      description: "",
      default_locale: "pt",
      duration: 60,
      duration_unit: "minute",
      questions: [
        {
          name: "Node & Express - Questões técicas",
          description:
            "Em 1 hora vocês devem realizar as questões técnicas de Node.js e Express. Para isso analisem a pergunta e assinale o código correto que resolva a pergunta.\n\nTodo o conteúdo dos testes foram passados durante o M4 do curso de programação web da Programadores do amanhã.",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 60,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "669012716ecc2fcad13708ce",
      name: "[Avaliação delta de aprendizagem] Nivelando experiencias 🧠 - Turma #06 - 1/3",
      description: "",
      default_locale: "pt",
      duration: 2,
      duration_unit: "hour",
      questions: [
        {
          name: "</HTML, CSS e Javascript> Nivelamento do M1",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em HTML, CSS e JavaScript referente ao Módulo 1 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "</JavaScript> Nivelamento do M2",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em JavaScript referente ao Módulo 2 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "</MySQL> Nivelamento do M3",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em MySQL referente ao Módulo 3 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "</Node.js & Express> Nivelamento do M4",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em Node.js e Express referente ao Módulo 4 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "</React.js> Nivelamento do M5",
          description:
            "Este questionário é para nivelar seu conhecimento prévio em React.js referente ao Módulo 5 do curso de programação web da Programadores do Amanhã.\n\nEntão se acaso você não souber a resposta ainda, selecione a opção “Não sei ainda” para garantirmos uma melhor experiência do curso para todos/as/es",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "66900670d79e5bf81c4ea2c3",
      name: "[MODELO][M5] Teste de Código",
      description: "Nivelamento do M5 - Reações 😄😭",
      default_locale: "pt",
      duration: 30,
      duration_unit: "minute",
      questions: [
        {
          name: "React.js",
          description:
            "Esse teste contém 20 questões sobre React.js. Você tem 30 minutos para responder as questões.",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "668ffa4205bc8e68b8972933",
      name: "[MODELO] [M2] JavaScript",
      description: "",
      default_locale: "pt",
      duration: 70,
      duration_unit: "minute",
      questions: [
        {
          name: "Múltiplo de 3 ou 5",
          description:
            "# **Descrição**\n\nSe listarmos todos os números naturais abaixo de 10 que são múltiplos de 3 ou 5, obtemos 3, 5, 6 e 9\\. A soma desses múltiplos é 23.\n\nImplemente uma solução para que ela retorne a soma de todos os múltiplos de 3 ou 5 abaixo do número passado. Além disso, se o número for negativo, retorne 0.\n\nSe o número for múltiplo de 3 e 5 ao mesmo tempo, conte-o apenas uma vez.\n\n## Exemplos\n\n```\nmultipleOf3Or5(10) // 23\nmultipleOf3Or5(20) // 78\nmultipleOf3Or5(30) // 195\nmultipleOf3Or5(40) // 368 \n\n```",
          type: "coding",
          type_formatted: "Programação",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 15,
          duration_unit: "minute",
        },
        {
          name: "Javascript",
          description:
            "Esse teste contem 10 questões, você tem 50 minutos para responder as questões e elas te avaliarão sobre conhecimentos técnicos do Javascript",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 50,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "668ff1f641dda6fc59bba074",
      name: "[MODELO][M1] Teste de Código",
      description: "Nivelamento do M1 - Introdução lógica 🧠",
      default_locale: "pt",
      duration: 30,
      duration_unit: "minute",
      questions: [
        {
          name: "Introdução ao Desenvolvimento Web",
          description:
            "Esse teste contém 10 questões sobre o Introdução ao Desenvolvimento Web. Você tem 30 minutos para responder as questões.",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "666b1a1ac1f1f6f070646bfd",
      name: "[M3] Teste de Código - Turma #05",
      description: "Teste de conhecimentos de banco de dados com linguagem SQL",
      default_locale: "pt",
      duration: 60,
      duration_unit: "minute",
      questions: [
        {
          name: "SQL",
          description:
            "Descrever corretamente os códigos necessários para cada retorno solicitado e a utilidade de cada termo ao longo das perguntas",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 60,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "6642657135bd50fa54bd76cc",
      name: "</Trilha de IA> Teste de competência",
      description: "",
      default_locale: "pt",
      duration: 45,
      duration_unit: "minute",
      questions: [
        {
          name: "IA Generativa",
          description:
            "Usando o conhecimento adquirido durante a trilha de IA responda as 10 perguntas a seguir",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 15,
          duration_unit: "minute",
        },
        {
          name: "Sentiment Analytics - bert-base-multilingual-uncased",
          description:
            "Usando o código desenvolvido na trilha de IA, executem as frases de cada teste e selecione a opção correta.",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 30,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "663a5617ed2ae82c219f03c4",
      name: "</Trilha de Visibilidade> Teste de competência",
      description: "",
      default_locale: "pt",
      duration: 3,
      duration_unit: "hour",
      questions: [
        {
          name: "Node.js & Express",
          description:
            "Esse teste contém algumas questões sobre Node.js. Você tem 40 minutos para responder as questões.",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 40,
          duration_unit: "minute",
        },
        {
          name: "Javascript Basics",
          description:
            "Esse teste contem 9 questões, você tem 1 hora e 30 minutos para responder as questões e elas te avaliarão sobre conceitos do Javascript",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 90,
          duration_unit: "minute",
        },
        {
          name: "ReactJS Styling & Tailwind CSS",
          description:
            "Esse teste contem 6 questões, você tem 45 minutos para responder as questões e elas te avaliarão sobre conceitos do ReactJS na parte de Estilos e Componentes",
          type: "fast",
          type_formatted: "Questionário",
          level: "advanced",
          level_formatted: "Avançado",
          duration: 45,
          duration_unit: "minute",
        },
        {
          name: "React.js",
          description:
            "Esse teste contém 15 questões sobre React.js. Você tem 50 minutos para responder as questões.",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 50,
          duration_unit: "minute",
        },
      ],
    },
    {
      assessment_id: "663a4ca0ed2ae82c219ef7f4",
      name: "</Trilha de Revisão> Teste de competência",
      description: "",
      default_locale: "pt",
      duration: 3,
      duration_unit: "hour",
      questions: [
        {
          name: "ReactJS Basics",
          description:
            "Esse teste contem 20 questões, você tem 30 minutos para responder as questões e elas te avaliarão sobre conceitos básicos do ReactJS na parte de ciclo de vida, renderização, props e entre outros",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 30,
          duration_unit: "minute",
        },
        {
          name: "Múltiplo de 3 ou 5",
          description:
            "# **Descrição**\n\nSe listarmos todos os números naturais abaixo de 10 que são múltiplos de 3 ou 5, obtemos 3, 5, 6 e 9\\. A soma desses múltiplos é 23.\n\nImplemente uma solução para que ela retorne a soma de todos os múltiplos de 3 ou 5 abaixo do número passado. Além disso, se o número for negativo, retorne 0.\n\nSe o número for múltiplo de 3 e 5 ao mesmo tempo, conte-o apenas uma vez.\n\n## Exemplos\n\n```\nmultipleOf3Or5(10) // 23\nmultipleOf3Or5(20) // 78\nmultipleOf3Or5(30) // 195\nmultipleOf3Or5(40) // 368 \n\n```",
          type: "coding",
          type_formatted: "Programação",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 15,
          duration_unit: "minute",
        },
        {
          name: "Sólides Profiler (DISC)",
          description:
            "Profiler é combinação DISC com mais 6 testes de perfil comportamental, a Sólides criou a melhor metodologia de mapeamento do mercado com 97% de precisão.",
          type: "softskill",
          type_formatted: "Personalidade e Cultura",
          duration: 10,
          duration_unit: "minute",
        },
        {
          name: "Node.js & Express",
          description:
            "Esse teste contém algumas questões sobre Node.js. Você tem 40 minutos para responder as questões.",
          type: "fast",
          type_formatted: "Questionário",
          level: "intermediate",
          level_formatted: "Praticante",
          duration: 40,
          duration_unit: "minute",
        },
        {
          name: "Javascript Basics",
          description:
            "Esse teste contem 9 questões, você tem 1 hora e 30 minutos para responder as questões e elas te avaliarão sobre conceitos do Javascript",
          type: "fast",
          type_formatted: "Questionário",
          level: "beginner",
          level_formatted: "Iniciante",
          duration: 90,
          duration_unit: "minute",
        },
      ],
    },
  ],
};

export const AdminStackProvider = ({
  children,
  user,
  userRole,
}: {
  children: React.ReactNode;
  user: AuthUserWithProfileType;
  userRole: string;
}) => {
  const [users, setUsers] = useState<Partial<AuthUserWithProfileType>[]>([]);
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [coodeshAPIAssessment, setCoodeshAPIAssessment] = useState<
    AssessmentPayloadType[]
  >(exampleAssessment.payload);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const usersResponse = await getAllUsers();
        if (!usersResponse) throw "no users response";

        const profilesResponse = await getAllProfiles();
        if (!profilesResponse) throw "no users profile response";

        const usersWithProfiles = usersResponse.map((user) => {
          const userProfile = profilesResponse.find(
            (profile) => profile.id === user.id
          );

          return {
            ...user,
            profile: userProfile,
          };
        });
        setUsers(usersWithProfiles);

        const teamsResponse = await getAllTeams();
        if (!teamsResponse) throw "no teams response";
        console.log(teamsResponse);
        setTeams(teamsResponse);

        const jobsResponse = await getAllJobsWithApplications();
        if (!jobsResponse) throw "no jobs response";
        setJobs(jobsResponse);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Users
  const handleCreateNewUser = async (
    userData: Partial<AuthUser & { password: string }>
  ) => {
    try {
      if (
        !userData.email ||
        !userData.password ||
        !userData.user_metadata ||
        !userData.user_metadata.full_name ||
        !userData.user_metadata.user_email
      ) {
        throw new Error("invalid user data");
      }

      const userResponse = await createUser(userData);
      if (!userResponse) throw new Error("no user response");

      const userProfileResponse = await getProfileById(userResponse.id);
      if (!userProfileResponse) throw new Error("no user profile response");

      setUsers((users) => [
        ...users,
        { ...userResponse, profile: userProfileResponse },
      ]);
      toast.success("Novo usuário criado com sucesso!");
      return userResponse.id;
    } catch (error) {
      toast.error("Erro ao criar novo usuário!");
      console.log(error);
      return false;
    }
  };

  const handleUpdateUser = async (
    userID: string | undefined,
    updates: Partial<AuthUser & { password: string }>
  ) => {
    try {
      if (!userID || !updates) {
        throw new Error("id and updates fields are required");
      }

      const userUpdatedResponse = await updateUser(userID, updates);
      if (!userUpdatedResponse) throw new Error("no update user response");

      setUsers((users) =>
        users.map((currentUser) => {
          if (currentUser.id === userID) {
            const userUpdatedData: AuthUserWithProfileType = {
              ...currentUser,
              ...userUpdatedResponse,
              profile: {
                ...currentUser.profile,
                email: userUpdatedResponse.user_metadata.user_email as string,
                full_name: userUpdatedResponse.user_metadata
                  .full_name as string,
              },
              user_metadata: {
                ...currentUser.user_metadata,
                ...userUpdatedResponse.user_metadata,
              },
            };

            return userUpdatedData;
          }
          return currentUser;
        })
      );
      toast.success("Usuário atualizado com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao atualizar o usuário!");
      return false;
    }
  };

  const handleDeleteUser = async (userId: string | undefined) => {
    try {
      if (!userId) throw new Error("user id is required to delete");

      const response = await deleteUser(userId);
      if (!response) throw new Error("no delete user response");

      setUsers((users) => users.filter((user) => user.id !== userId));
      toast.success("Usuário deletado com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao deletar usuário. tente novamente mais tarde!");
      return false;
    }
  };

  // User_Roles
  const handleAddUserRole = async (userId: string, role: RolesType) => {
    try {
      if (!userId || !role) {
        throw new Error("user id and role fields are required");
      }
      const response = await insertUserRoleWithUserId(userId, role);
      if (!response) throw new Error("no insert user role response");

      setUsers((users) =>
        users.map((user) =>
          user.id === userId && user.profile
            ? {
                ...user,
                profile: {
                  ...user.profile,
                  id: user.profile.id || "",
                  user_roles: [{ role: role }],
                },
              }
            : user
        )
      );
      toast.success("Cargo adicionado com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao adicionar cargo ao usuário!");
      return false;
    }
  };

  const handleUpdateUserRole = async (userId: string, role: RolesType) => {
    try {
      if (!userId || !role) {
        throw new Error("role and id fields are required");
      }
      const responseData = await updateUserRoleWIthUserId(userId, role);
      if (!responseData) {
        throw new Error("no update user role data was returned");
      }
      setUsers((users) =>
        users.map((user) =>
          user.id === userId && user.profile
            ? {
                ...user,
                profile: {
                  ...user.profile,
                  user_roles: [{ role }],
                },
              }
            : user
        )
      );
      toast.success("Cargo atualizado com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao atualizar cargo do usuário!");
      return false;
    }
  };

  const handleDeleteUserRole = async (userId: string) => {
    try {
      if (!userId) throw new Error("role and id fields are required");
      const responseData = await deleteUserRoleWithUserId(userId);
      if (!responseData)
        throw new Error("no update user role data was returned");

      setUsers((users) =>
        users.map((user) =>
          user.id === userId && user.profile
            ? {
                ...user,
                profile: {
                  ...user.profile,
                  user_roles: [],
                },
              }
            : user
        )
      );
      toast.success("Cargo removido com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao remover cargo do usuário!");
      return false;
    }
  };

  // Team
  const handleCreateTeam = async (teamData: {
    name: string;
    period: TeamPeriodsType;
  }) => {
    try {
      if (
        !teamData.name ||
        teamData.name.trim().length === 0 ||
        teams.map((t) => t.name).includes(teamData.name)
      ) {
        toast.error("Nome da turma é inválido ou já existe!");
        throw new Error("invalid team name");
      }

      if (!teamData.period) {
        toast.error("Período da turma é inválido!");
        throw new Error("invalid team period");
      }

      const newTeam = await createTeam(teamData);
      if (!newTeam) throw new Error("no team create response");

      setTeams((teams) => [...teams, { ...newTeam }]);
      toast.success(`Turma ${newTeam.name} criada com sucesso!`);
      return newTeam.id;
    } catch (error) {
      toast.error("Erro ao criar novo usuário!");
      console.log(error);
      return false;
    }
  };

  const handleUpdateTeam = async (
    teamId: string,
    updates: Partial<TeamType>
  ) => {
    try {
      if (!teamId || !updates) {
        throw new Error("id and updates fields are required");
      }

      const teamUpdated = await updateTeam(teamId, updates);
      if (!teamUpdated) throw new Error("no update team response");

      setTeams((teams) =>
        teams.map((team) => (team.id === teamId ? teamUpdated : team))
      );
      toast.success("Turma atualizada com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao atualizar a turma!");
      return false;
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      if (!teamId) throw new Error("team id is required to delete");

      const response = await deleteTeam(teamId);
      if (!response) throw new Error("no delete team response");

      setTeams((teams) => teams.filter((team) => team.id !== teamId));
      toast.success("Turma deletada com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao deletar turma. Tente novamente mais tarde!");
      return false;
    }
  };

  //  Team - Coodesh
  const handleCreateTeamAssessment = async (
    assessmentData: Partial<TeamCoodeshAssessments>
  ) => {
    try {
      if (!assessmentData.team_id || !assessmentData.assessment_id)
        throw new Error("required fields");

      const assessmentCreated = await createTeamCoodeshAssessment(
        assessmentData
      );
      if (!assessmentCreated)
        throw new Error("no assessment created successfully");

      setTeams((teams) =>
        teams.map((team) =>
          team.id === assessmentData.team_id
            ? {
                ...team,
                team_coodesh_assessments: team.team_coodesh_assessments
                  ? [...team.team_coodesh_assessments, assessmentCreated]
                  : [assessmentCreated],
              }
            : team
        )
      );
      toast.success("Avaliação anexada com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao anexar a avaliação! Tente novamente mais tarde!");
      return false;
    }
  };

  const handleUpdateTeamAssessment = async (
    assessmentId: string,
    updatedData: Partial<TeamCoodeshAssessments>
  ) => {
    try {
      const updatedAssessment = await updateTeamCoodeshAssessment(
        assessmentId,
        updatedData
      );
      if (!updatedAssessment)
        throw new Error("no assessment updated successfully");
      toast.success("Avaliação atualizada com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao atualizar a avaliação! Tente novamente mais tarde!");
      return false;
    }
  };

  const handleGetCoodeshAPIAssessments = async () => {
    try {
      const assessments = await axios.get("/api/coodesh/assessments");
      console.log(assessments.data.assessments);
      if (!assessments) throw "no assessments fetched successfully";
      setCoodeshAPIAssessment((prevAssessments) => [
        ...prevAssessments,
        assessments.data.assessments.payload,
      ]);
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao buscar avaliações! Tente novamente mais tarde!");
      return false;
    }
  };

  // Jobs
  const handleCreateJob = async (newJob: Partial<JobType>) => {
    try {
      const jobCreated = await createJob(newJob);

      if (!jobCreated) throw "job is not created successfully";

      setJobs((jobs) => [...jobs, jobCreated]);
      toast.success("Sucesso ao criar a vaga!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao criar a vaga. Tente novamente mais tarde!");
      return false;
    }
  };

  const handleUpdateJob = async (jobId: string, updates: Partial<JobType>) => {
    try {
      const jobUpdated = await updateJob(jobId, updates);

      if (!jobUpdated) throw new Error("job is not updated successfully");

      setJobs((jobs) =>
        jobs.map((job) => (job.id === jobId ? jobUpdated : job))
      );
      toast.success("Sucesso ao editar vaga!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao editar vaga. Tente novamente mais tarde!");
      return false;
    }
  };

  const handleCurateJob = async (jobId: string) => {
    try {
      const jobUpdated = await updateJob(jobId, {
        curated: true,
        is_archived: false,
      });

      if (!jobUpdated) throw new Error("job is not updated successfully");

      setJobs((jobs) =>
        jobs.map((job) => (job.id === jobId ? jobUpdated : job))
      );

      toast.success("Vaga aprovada com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao aprovar vaga. Tente novamente mais tarde!");
      return false;
    }
  };

  const handleResendJobToCuration = async (jobId: string) => {
    try {
      const jobUpdated = await updateJob(jobId, {
        curated: false,
        is_archived: false,
      });

      if (!jobUpdated) throw new Error("job is not updated successfully");

      setJobs((jobs) =>
        jobs.map((job) => (job.id === jobId ? jobUpdated : job))
      );

      toast.success("Vaga reenviada a curadoria com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error(
        "Erro ao reenviada vaga a curadoria. Tente novamente mais tarde!"
      );
      return false;
    }
  };

  const handleJobIsOnDiscord = async (jobId: string) => {
    try {
      const jobUpdated = await updateJob(jobId, {
        is_on_discord: true,
      });

      if (!jobUpdated) throw new Error("job is not updated successfully");

      setJobs((jobs) =>
        jobs.map((job) =>
          job.id === jobId ? { ...job, is_on_discord: true } : job
        )
      );

      toast.success("Vaga reenviada a curadoria com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error(
        "Erro ao reenviada vaga a curadoria. Tente novamente mais tarde!"
      );
      return false;
    }
  };

  const handleArchiveJob = async (jobId: string | null) => {
    try {
      if (!jobId) throw new Error("Invalid job ID");

      const response = await updateJob(jobId, {
        curated: false,
        is_archived: true,
      });
      if (!response) throw new Error("failed to update job");

      setJobs((jobs) =>
        jobs.map((job) =>
          job.id === jobId ? { ...job, curated: false, is_archived: true } : job
        )
      );

      toast.success("Vaga arquivada com sucesso!");
      return true;
    } catch (error) {
      console.error("Error to curate job:", error);
      toast.error("Erro ao arquivar a vaga.");
      return false;
    }
  };

  const handleDeleteJob = async (jobId: string | null) => {
    try {
      if (!jobId) throw new Error("Invalid job ID");

      const response = await deleteJob(jobId);

      if (!response) throw new Error("no delete job response");

      setJobs((jobs) => jobs.filter((job) => job.id !== jobId));
      toast.success("Vaga deletada com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao deletar vaga. tente novamente mais tarde!");
      return false;
    }
  };

  if (loading) {
    return <LoadingComponent />;
  }

  const sidebarData = {
    user: user,
    userRole: userRole,
    team: {
      name: "Administrador",
      logo: () => (
        <Avatar className="size-8">
          <AvatarImage src="/assets/logos/simbolo_pda_fundo_branco.png" />
          <AvatarFallback>PdA</AvatarFallback>
        </Avatar>
      ),
    },
    navMain: [
      {
        title: "Usuários",
        url: "/dashboard/admin/users",
        icon: Users,
        items: [
          {
            title: "Todos os usuários",
            url: "/dashboard/admin/users/all",
          },
        ],
      },
      {
        title: "Vagas",
        url: "/dashboard/admin/jobs",
        icon: Briefcase,
        isActive: true,
        items: [
          {
            title: "Vagas curadas",
            url: "/dashboard/admin/jobs/curated",
          },
          {
            title: "Curadoria de vagas",
            url: "/dashboard/admin/jobs/curation",
          },
          {
            title: "Vagas arquivadas",
            url: "/dashboard/admin/jobs/archives",
          },
        ],
      },
      {
        title: "Turmas",
        url: "/dashboard/admin/teams",
        icon: Book,
        isActive: true,
        items: teams.map((team) => ({
          title: team.name,
          url: `/dashboard/admin/teams/${team.id}`,
          items: [
            {
              title: "Coodesh",
              url: `/dashboard/admin/teams/${team.id}/coodesh`,
            },
          ],
        })),
      },
    ],
    projects: [],
  };

  return (
    <AdminStackContext.Provider
      value={{
        usersStack: {
          users,
          handleUpdateUser,
          handleCreateNewUser,
          handleDeleteUser,
        },
        userRoleStack: {
          handleAddUserRole,
          handleUpdateUserRole,
          handleDeleteUserRole,
        },
        teamsStack: {
          teams,
          handleCreateTeam,
          handleUpdateTeam,
          handleDeleteTeam,
          coodesh: {
            handleCreateTeamAssessment,
            handleUpdateTeamAssessment,
            api: {
              assessments: coodeshAPIAssessment,
              handleGetAssessments: handleGetCoodeshAPIAssessments,
            },
          },
        },
        jobsStack: {
          jobs,
          handleCreateJob,
          handleUpdateJob,
          handleDeleteJob,
          handleCurateJob,
          handleResendJobToCuration,
          handleArchiveJob,
          handleJobIsOnDiscord,
        },
        loading,
        setLoading,
      }}
    >
      <AppSidebar loading={loading} data={sidebarData} />
      {children}
    </AdminStackContext.Provider>
  );
};

export const useAdminStackContext = () => useContext(AdminStackContext);
