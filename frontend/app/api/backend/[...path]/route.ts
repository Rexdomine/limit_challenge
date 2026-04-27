import { NextRequest, NextResponse } from 'next/server';

function buildBackendUrl(request: NextRequest, path: string[]) {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!configuredBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL must be set on the server for backend proxying.');
  }

  const normalizedBaseUrl = configuredBaseUrl.endsWith('/')
    ? configuredBaseUrl.slice(0, -1)
    : configuredBaseUrl;
  const joinedPath = path.join('/');
  const search = request.nextUrl.search || '';
  return `${normalizedBaseUrl}/${joinedPath}/${search}`;
}

async function proxyRequest(request: NextRequest, path: string[]) {
  const targetUrl = buildBackendUrl(request, path);
  const headers = new Headers(request.headers);
  const requestBody =
    request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer();

  headers.delete('host');
  headers.delete('content-length');

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: requestBody,
    redirect: 'manual',
  });

  const proxyHeaders = new Headers(response.headers);
  proxyHeaders.delete('content-encoding');
  proxyHeaders.delete('content-length');
  proxyHeaders.delete('access-control-allow-origin');
  proxyHeaders.delete('access-control-allow-credentials');

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: proxyHeaders,
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
