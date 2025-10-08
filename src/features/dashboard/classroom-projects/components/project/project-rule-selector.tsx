"use client";

import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemGroup,
  ItemMedia,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

import { ProjectRuleSelectorPropsT } from "../../types";
import { projectsRules } from "../../utils";

const ProjectRuleSelector = ({
  handleSetRuleId,
  currentProjectRulesId,
}: ProjectRuleSelectorPropsT) => {
  const ruleIds = Object.keys(projectsRules);

  if (ruleIds.length === 0) {
    return (
      <div className="p-6 text-center border rounded-lg bg-muted/20">
        <p className="text-sm text-muted-foreground">
          Nenhuma rubrica disponível
        </p>
      </div>
    );
  }

  return (
    <ItemGroup className="w-full space-y-2">
      {ruleIds.map((ruleId) => {
        const isSelected = currentProjectRulesId === ruleId;
        const rules = Object.keys(projectsRules[ruleId]);

        return (
          <Item
            key={ruleId}
            variant="outline"
            className={cn(
              "cursor-pointer transition-all duration-200 hover:bg-muted/50",
              isSelected && "bg-primary/5 border-primary/30 hover:bg-primary/10"
            )}
            onClick={() => handleSetRuleId(ruleId)}
          >
            <ItemMedia variant="icon" className={cn(isSelected && "bg-primary border-0")}>
              {isSelected && (
                <Check className="size-5 text-primary-foreground" />
              )}
            </ItemMedia>

            <ItemContent>
              <ItemTitle
                className={cn(
                  isSelected
                    ? "text-primary-foreground font-semibold"
                    : "text-foreground"
                )}
              >
                {ruleId}
              </ItemTitle>

              <div className="flex flex-wrap gap-1 mt-2">
                {rules.map((rule) => (
                  <Badge key={rule} variant="outline" className="text-xs">
                    {rule}
                  </Badge>
                ))}
                {/* {rules.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{rules.length - 3} mais
                  </Badge>
                )} */}
              </div>
            </ItemContent>
          </Item>
        );
      })}
    </ItemGroup>
  );
};

export default ProjectRuleSelector;
