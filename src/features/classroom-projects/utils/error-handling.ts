/**
 * Handles project-related errors with proper logging and user feedback
 * @param error - The error that occurred
 * @param context - Additional context about where the error occurred
 */
export const handleProjectError = (error: unknown, context: string): void => {
  // In a real application, this would integrate with a proper logging service
  // For now, we'll use console.error but this should be replaced with proper logging
  if (process.env.NODE_ENV === 'development') {
    console.error(`Project error in ${context}:`, error);
  }
  
  // TODO: Integrate with proper error logging service (e.g., Sentry, LogRocket)
  // logError(error, { context, timestamp: new Date().toISOString() });
};

/**
 * Creates a user-friendly error message from an error object
 * @param error - The error that occurred
 * @returns A user-friendly error message
 */
export const createUserFriendlyErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Map specific error messages to user-friendly ones
    switch (error.message) {
      case "Project ID is required":
        return "Erro interno: ID do projeto não encontrado.";
      default:
        return "Ocorreu um erro inesperado. Tente novamente.";
    }
  }
  
  return "Ocorreu um erro inesperado. Tente novamente.";
};