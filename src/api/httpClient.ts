export type ProblemDetails = {
  title?: string;
  detail?: string;
  status?: number;
  code?: string;
  traceId?: string;
};

export class HttpError extends Error {
  readonly status: number;
  readonly problem: ProblemDetails | null;

  constructor(status: number, problem: ProblemDetails | null, message = "Request failed") {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.problem = problem;
  }
}

type RequestJsonOptions<TBody> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TBody;
  retryOnNetworkError?: boolean;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
};

type AuthenticatedRequestJsonOptions<TBody> = Omit<RequestJsonOptions<TBody>, "headers" | "credentials"> & {
  accessToken: string;
  headers?: Record<string, string>;
};

export async function requestJson<TResponse, TBody = unknown>(
  url: string,
  options: RequestJsonOptions<TBody> = {},
): Promise<TResponse> {
  const execute = () =>
    fetch(url, {
      method: options.method ?? "GET",
      headers: options.body
        ? { "Content-Type": "application/json", ...(options.headers ?? {}) }
        : options.headers,
      credentials: options.credentials,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

  let response: Response;
  try {
    response = await execute();
  } catch (error) {
    if (options.retryOnNetworkError) {
      response = await execute();
    } else {
      throw error;
    }
  }

  if (!response.ok) {
    throw new HttpError(response.status, await readProblem(response), response.statusText);
  }

  return (await response.json()) as TResponse;
}

export async function requestNoContent<TBody = unknown>(
  url: string,
  options: RequestJsonOptions<TBody> = {},
): Promise<void> {
  const execute = () =>
    fetch(url, {
      method: options.method ?? "GET",
      headers: options.body
        ? { "Content-Type": "application/json", ...(options.headers ?? {}) }
        : options.headers,
      credentials: options.credentials,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

  let response: Response;
  try {
    response = await execute();
  } catch (error) {
    if (options.retryOnNetworkError) {
      response = await execute();
    } else {
      throw error;
    }
  }

  if (!response.ok) {
    throw new HttpError(response.status, await readProblem(response), response.statusText);
  }
}

export async function authenticatedRequestJson<TResponse, TBody = unknown>(
  url: string,
  options: AuthenticatedRequestJsonOptions<TBody>,
): Promise<TResponse> {
  return requestJson<TResponse, TBody>(url, {
    ...options,
    credentials: "omit",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${options.accessToken}`,
      ...(options.headers ?? {}),
    },
  });
}

export async function authenticatedRequestNoContent<TBody = unknown>(
  url: string,
  options: AuthenticatedRequestJsonOptions<TBody>,
): Promise<void> {
  return requestNoContent<TBody>(url, {
    ...options,
    credentials: "omit",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${options.accessToken}`,
      ...(options.headers ?? {}),
    },
  });
}

async function readProblem(response: Response): Promise<ProblemDetails | null> {
  try {
    return (await response.json()) as ProblemDetails;
  } catch {
    return null;
  }
}
