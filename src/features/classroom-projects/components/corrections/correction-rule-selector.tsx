import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PROJECTS_RULES } from "../../utils/projects";
import { CorrectionRuleSelectorProps } from "../../types/corrections/correction-rule-selector";

const CorrectionRuleSelector = ({
    rulesSelected,
    handleSetRulesSelected,
    projectRulesId,
    rulesLabels,
}: CorrectionRuleSelectorProps) => {
    // Verificar se o projeto existe nas regras
    const projectData = PROJECTS_RULES[projectRulesId];
    if (!projectData) {
        return (
            <div className="w-full p-4 text-center text-gray-500">
                Regras do projeto não encontradas para: {projectRulesId}
                <br />
                Projetos disponíveis: {Object.keys(PROJECTS_RULES).join(", ")}
            </div>
        );
    }

    // Mapeamento de notas
    const getNoteValue = (index: number) => {
        const noteMap = { 0: 10, 1: 7, 2: 4, 3: 0 };
        return noteMap[index as keyof typeof noteMap] || 0;
    };

    return (
        <Accordion type="multiple" className="w-full rounded-xl border *:px-2">
            {rulesLabels.map((ruleLabel, index) => {
                // Buscar as regras específicas para esta categoria
                const categoryRules = projectData[ruleLabel];

                if (!categoryRules) {
                    console.error(`Categoria ${ruleLabel} não encontrada no projeto ${projectRulesId}`);
                    return (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-base font-bold">
                                {ruleLabel} / Categoria não encontrada
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="p-4 text-gray-500">
                                    Categoria {ruleLabel} não encontrada nas regras do projeto.
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                }

                const ruleKeys = Object.keys(categoryRules);
                const selectedRule = rulesSelected.find((r) => r.ruleL === ruleLabel);
                const selectedNote = selectedRule ? selectedRule.ruleNote : "Não selecionado";

                return (
                    <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-base font-bold">
                            {ruleLabel} / {selectedNote}
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="p-2">
                                <ul className="flex flex-col gap-3">
                                    {ruleKeys.map((ruleKey, ruleIndex) => {
                                        const isSelected = selectedRule?.rule === ruleKey;
                                        const noteValue = getNoteValue(ruleIndex);

                                        return (
                                            <li
                                                key={ruleKey}
                                                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                                    isSelected
                                                        ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                }`}
                                                onClick={() => handleSetRulesSelected(ruleLabel, ruleKey, noteValue)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-semibold text-lg">{ruleKey}</span>
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                                                        Nota: {noteValue}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                    {categoryRules[ruleKey]}
                                                </p>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
        </Accordion>
    );
};

export default CorrectionRuleSelector;
