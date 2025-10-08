export type RuleItem = {
  rule: string;
  ruleL: string;
  ruleNote: number;
};

export interface CorrectionRuleSelectorProps {
  rulesSelected: RuleItem[];
  handleSetRulesSelected: (ruleL: string, rule: string, note: number) => void;
  projectRulesId: string;
  rulesLabels: string[];
}
