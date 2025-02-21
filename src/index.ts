import { Context, getInstance } from "@osaas/client-core";
import fastify from "fastify";
import basicAuth from '@fastify/basic-auth';

const SERVICE_ID = process.env.SERVICE_ID || 'eyevinn-hls-monitor';
const USERNAME = process.env.USERNAME || 'myuser';
const PASSWORD = process.env.PASSWORD || 'changeme';

let lastRefreshedTs: number | undefined;

async function refreshToken(ctx: Context): Promise<string> {
  const token = await ctx.getServiceAccessToken(SERVICE_ID);
  lastRefreshedTs = Date.now();
  return token;
}

async function main() {
  const ctx = new Context();
  const server = fastify();
  const authenticate = { realm: 'Restricted Area' };
  const validate = async (username: string, password: string) => {
    if(username === USERNAME && password === PASSWORD) {
      return;
    }
    throw new Error('Unauthorized');
  };
  server.register(basicAuth, { validate, authenticate });
  server.after(() => {
    server.addHook('onRequest', server.basicAuth);
    let token: string | undefined = undefined;
  
    server.get('/', async (request, reply) => {
      reply.send('Hello World');
    });

    server.get<{
      Params: { instanceName: string };
    }>('/:instanceName/*', async (request, reply) => {
      try {
        const upstreamPath = request.originalUrl.replace(`/${request.params.instanceName}`, '');
        const tokenExpired = lastRefreshedTs && Date.now() - lastRefreshedTs > 3600 * 1000;
        const instaneName = request.params.instanceName;
        if (!token || tokenExpired) {
          token = await refreshToken(ctx);
        }
        const instance = await getInstance(ctx, SERVICE_ID, instaneName, token);
        const res = await fetch(new URL(upstreamPath, instance.url), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.headers.get('content-type') === 'application/json') {
          const data = await res.json();
          const headers = Object.fromEntries(res.headers.entries());
          reply.headers(headers).code(res.status).send(data);
        } else {
          const data = await res.text();
          const headers = Object.fromEntries(res.headers.entries());
          reply.headers(headers).code(res.status).send(data);
        }
      } catch (err) {
        reply.code(500).send(err);
      }
    });
  });

  server.listen({ host: '0.0.0.0', port: process.env.PORT ? Number(process.env.PORT) : 8080 }, (err, address) => {
    if (err) console.error(err);
    console.log(`Server listening at ${address}`);
  });
}

main();