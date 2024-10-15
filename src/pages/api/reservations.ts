import type { APIRoute } from 'astro';
import dbConnect from '../../lib/db';
import Reservation from '../../models/Reservation';
import { verifyToken } from '../../lib/auth';

export const get: APIRoute = async ({ request }) => {
  await dbConnect();
  
  const token = request.headers.get('Authorization')?.split(' ')[1];
  const user = verifyToken(token!);

  if (!user || !user.isAdmin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const reservations = await Reservation.find({});
    return new Response(JSON.stringify(reservations), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch reservations' }), { status: 500 });
  }
};

export const post: APIRoute = async ({ request }) => {
  await dbConnect();
  
  const token = request.headers.get('Authorization')?.split(' ')[1];
  const user = verifyToken(token!);

  if (!user || !user.isAdmin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const reservation = new Reservation(body);
    await reservation.save();
    return new Response(JSON.stringify(reservation), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create reservation' }), { status: 500 });
  }
};

export const put: APIRoute = async ({ request }) => {
  await dbConnect();
  
  const token = request.headers.get('Authorization')?.split(' ')[1];
  const user = verifyToken(token!);

  if (!user || !user.isAdmin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    const reservation = await Reservation.findByIdAndUpdate(id, updateData, { new: true });
    if (!reservation) {
      return new Response(JSON.stringify({ error: 'Reservation not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(reservation), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update reservation' }), { status: 500 });
  }
};

export const del: APIRoute = async ({ request }) => {
  await dbConnect();
  
  const token = request.headers.get('Authorization')?.split(' ')[1];
  const user = verifyToken(token!);

  if (!user || !user.isAdmin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;
    const reservation = await Reservation.findByIdAndDelete(id);
    if (!reservation) {
      return new Response(JSON.stringify({ error: 'Reservation not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ message: 'Reservation deleted successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete reservation' }), { status: 500 });
  }
};