import type { APIRoute } from 'astro';
import dbConnect from '../../lib/db';
import { authenticateUser } from '../../lib/auth';

export const post: APIRoute = async ({ request }) => {
  await dbConnect();
  
  const body = await request.json();
  const { username, password } = body;

  const authResult = await authenticateUser(username, password);

  if (authResult) {
    return new Response(JSON.stringify(authResult), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } else {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};