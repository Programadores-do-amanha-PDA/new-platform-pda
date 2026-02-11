import projectsRulesJson from "./projects-rules.json";
import projectsRulesFeedbacksJson from "./projects-rules-feedbacks.json";

export const PROJECTS_RULES = projectsRulesJson as Record<
  string,
  Record<string, Record<string, string>>
>;

export const PROJECTS_RULES_FEEDBACKS = projectsRulesFeedbacksJson as Record<
  string,
  Record<string, Record<string, string>>
>;

// Re-export for backward compatibility
export const projectsRules = PROJECTS_RULES;
