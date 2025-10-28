// src/utils/__tests__/feature-rules.test.ts

// Mock das páginas da classroom
jest.mock('@/providers/admin/sidebar-config', () => ({
  ADMIN_CLASSROOM_PAGES_KEYS: [
    'overview',
    'coodesh', 
    'zoom',
    'students',
    'assignments',
    'content',
    'analytics'
  ]
}));

import { ADMIN_CLASSROOM_PAGES_KEYS } from '@/providers/admin/sidebar-config';
import { ClassroomConfigUserModeT, UserModeFeatureRuleT } from '@/types';
import { DEFAULT_FEATURE_EXCLUSIONS, getAllFeaturesRules } from '../utils';

describe('Feature Rules Utilities', () => {
  // Dados de teste reutilizáveis
  const mockUserMode: ClassroomConfigUserModeT = {
    id: '1',
    title: 'Test Mode',
    key: 'test-mode',
    color: '#000000',
    featuresRules: [
      {
        id: 'students',
        isVisible: false,
        aggregateInMetric: false
      },
      {
        id: 'analytics',
        isVisible: true,
        aggregateInMetric: true
      }
    ]
  };

  const mockInvalidUserMode: ClassroomConfigUserModeT = {
    id: '2',
    title: 'Invalid Mode',
    key: 'invalid-mode',
    color: '#000000',
    featuresRules: [
      {
        id: 'students',
        isVisible: true,
        aggregateInMetric: true
      },
      // Rule inválida - falta propriedades
      {} as UserModeFeatureRuleT
    ]
  };

  describe('DEFAULT_FEATURE_EXCLUSIONS', () => {
    it('should have correct default hidden features', () => {
      expect(DEFAULT_FEATURE_EXCLUSIONS.hiddenFeatures).toEqual([
        'overview',
        'coodesh',
        'zoom'
      ]);
    });

    it('should have correct default excluded from metrics', () => {
      expect(DEFAULT_FEATURE_EXCLUSIONS.excludedFromMetrics).toEqual([
        'overview',
        'coodesh',
        'zoom'
      ]);
    });
  });

  describe('getAllFeaturesRules', () => {
    describe('when no user mode is provided', () => {
      it('should return default rules for all features', () => {
        const result = getAllFeaturesRules(null);

        expect(result).toHaveLength(ADMIN_CLASSROOM_PAGES_KEYS.length);
        
        // Verificar regras padrão
        result.forEach(rule => {
          expect(rule).toEqual({
            id: expect.any(String),
            isVisible: expect.any(Boolean),
            aggregateInMetric: expect.any(Boolean)
          });
        });
      });

      it('should apply default visibility rules correctly', () => {
        const result = getAllFeaturesRules(null);

        const overviewRule = result.find(rule => rule.id === 'overview');
        const studentsRule = result.find(rule => rule.id === 'students');

        expect(overviewRule?.isVisible).toBe(false);
        expect(studentsRule?.isVisible).toBe(true);
      });

      it('should apply default metric aggregation rules correctly', () => {
        const result = getAllFeaturesRules(null);

        const zoomRule = result.find(rule => rule.id === 'zoom');
        const assignmentsRule = result.find(rule => rule.id === 'assignments');

        expect(zoomRule?.aggregateInMetric).toBe(false);
        expect(assignmentsRule?.aggregateInMetric).toBe(true);
      });
    });

    describe('when user mode has no featuresRules', () => {
      it('should return default rules when featuresRules is empty array', () => {
        const userModeWithEmptyRules = { ...mockUserMode, featuresRules: [] };
        const result = getAllFeaturesRules(userModeWithEmptyRules);

        expect(result).toHaveLength(ADMIN_CLASSROOM_PAGES_KEYS.length);
        
        // Deve usar regras padrão
        const studentsRule = result.find(rule => rule.id === 'students');
        expect(studentsRule?.isVisible).toBe(true); // Valor padrão
      });
    });

    describe('when user mode has valid featuresRules', () => {
      it('should merge user rules with default rules', () => {
        const result = getAllFeaturesRules(mockUserMode);

        // Regras do usuário devem ser aplicadas
        const studentsRule = result.find(rule => rule.id === 'students');
        const analyticsRule = result.find(rule => rule.id === 'analytics');

        expect(studentsRule?.isVisible).toBe(false); // Override do usuário
        expect(studentsRule?.aggregateInMetric).toBe(false); // Override do usuário
        expect(analyticsRule?.isVisible).toBe(true); // Override do usuário
        expect(analyticsRule?.aggregateInMetric).toBe(true); // Override do usuário
      });

      it('should use default rules for features not overridden by user', () => {
        const result = getAllFeaturesRules(mockUserMode);

        // Features não especificadas no user mode devem manter valores padrão
        const contentRule = result.find(rule => rule.id === 'content');
        const overviewRule = result.find(rule => rule.id === 'overview');

        expect(contentRule?.isVisible).toBe(true); // Valor padrão
        expect(overviewRule?.isVisible).toBe(false); // Valor padrão (excluído)
      });
    });

    describe('when user mode has invalid feature rules', () => {
      it('should fall back to default rules for invalid rules', () => {
        const result = getAllFeaturesRules(mockInvalidUserMode);

        // Regra válida deve ser aplicada
        const studentsRule = result.find(rule => rule.id === 'students');
        expect(studentsRule?.isVisible).toBe(true); // Do user mode válido

        // Regras inválidas devem usar padrão
        const otherRules = result.filter(rule => rule.id !== 'students');
        otherRules.forEach(rule => {
          expect(rule.isVisible).toBe(!DEFAULT_FEATURE_EXCLUSIONS.hiddenFeatures.includes(rule.id as typeof DEFAULT_FEATURE_EXCLUSIONS.hiddenFeatures[number]));
        });
      });

      it('should handle rules with missing properties', () => {
        const userModeWithPartialRules: ClassroomConfigUserModeT = {
          ...mockUserMode,
          featuresRules: [
            {
              id: 'students'
              // Missing isVisible and aggregateInMetric
            } as UserModeFeatureRuleT
          ]
        };

        const result = getAllFeaturesRules(userModeWithPartialRules);
        const studentsRule = result.find(rule => rule.id === 'students');

        // Deve usar regra padrão para students
        expect(studentsRule?.isVisible).toBe(true);
        expect(studentsRule?.aggregateInMetric).toBe(true);
      });
    });

    describe('edge cases', () => {
      it('should handle user mode with non-existent feature IDs', () => {
        const userModeWithInvalidFeatures: ClassroomConfigUserModeT = {
          ...mockUserMode,
          featuresRules: [
            {
              id: 'non-existent-feature',
              isVisible: false,
              aggregateInMetric: false
            }
          ]
        };

        const result = getAllFeaturesRules(userModeWithInvalidFeatures);

        // Não deve afetar features existentes
        expect(result).toHaveLength(ADMIN_CLASSROOM_PAGES_KEYS.length);
        
        // A regra inválida não deve aparecer no resultado
        const invalidRule = result.find(rule => rule.id === 'non-existent-feature');
        expect(invalidRule).toBeUndefined();
      });
    });

    describe('type safety and validation', () => {
      it('should validate all returned rules have correct structure', () => {
        const result = getAllFeaturesRules(mockUserMode);

        result.forEach(rule => {
          expect(rule).toMatchObject({
            id: expect.any(String),
            isVisible: expect.any(Boolean),
            aggregateInMetric: expect.any(Boolean)
          });
        });
      });

      it('should maintain feature IDs integrity', () => {
        const result = getAllFeaturesRules(mockUserMode);

        const resultIds = result.map(rule => rule.id).sort();
        const expectedIds = [...ADMIN_CLASSROOM_PAGES_KEYS].sort();

        expect(resultIds).toEqual(expectedIds);
      });
    });
  });
});