import { NextRequest, NextResponse } from "next/server";
import { logger } from "./index";
import { RequestLogOptions, LogContext } from "./types";

export interface LoggedResponse extends NextResponse {
  responseTime?: number;
}

/**
 * Helper para logar requisições em API Routes do Next.js
 * Uso: const result = await withRequestLogging(request, async () => { ... })
 */
export async function withRequestLogging<T>(
  request: NextRequest,
  handler: () => Promise<T>,
  options?: RequestLogOptions
): Promise<T> {
  const startTime = Date.now();
  const log = logger.child({ 
    module: options?.module || "api",
    requestId: crypto.randomUUID().slice(0, 8)
  });

  // Log da requisição inicial
  log.info({
    request: {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get("user-agent"),
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")
    }
  }, "API request received");

  try {
    const result = await handler();
    const responseTime = Date.now() - startTime;

    // Log de sucesso (opcional)
    if (options?.logSuccess !== false) {
      log.info({
        responseTime,
        method: request.method,
        url: request.url
      }, `Request completed in ${responseTime}ms`);
    }

    return result;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    log.error({
      err: error,
      responseTime,
      method: request.method,
      url: request.url
    }, "Request failed");

    throw error;
  }
}

/**
 * Helper para criar logger com contexto de requisição
 */
export function createRequestLogger(request: NextRequest, module: string, context?: LogContext) {
  return logger.child({
    module,
    requestId: crypto.randomUUID().slice(0, 8),
    method: request.method,
    url: request.url,
    ...context
  });
}