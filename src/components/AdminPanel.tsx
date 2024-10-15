import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('es');
const localizer = momentLocalizer(moment);

interface Reservation {
  _id: string;
  name: string;
  email: string;
  people: number;
  date: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
}

const AdminPanel: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchReservations();
    }
  }, []);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch reservations');
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      setError('Error al cargar las reservas');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) throw new Error('Invalid credentials');
      const data = await response.json();
      localStorage.setItem('token', data.token);
      setIsLoggedIn(true);
      fetchReservations();
    } catch (error) {
      setError('Credenciales inválidas');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setReservations([]);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedReservation(event.resource);
  };

  const handleConfirmReservation = async () => {
    if (selectedReservation) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/reservations', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ id: selectedReservation._id, status: 'confirmed' })
        });
        if (!response.ok) throw new Error('Failed to confirm reservation');
        fetchReservations();
        setSelectedReservation(null);
      } catch (error) {
        setError('Error al confirmar la reserva');
      }
    }
  };

  const handleDeleteReservation = async () => {
    if (selectedReservation) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/reservations', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ id: selectedReservation._id })
        });
        if (!response.ok) throw new Error('Failed to delete reservation');
        fetchReservations();
        setSelectedReservation(null);
      } catch (error) {
        setError('Error al eliminar la reserva');
      }
    }
  };

  const events = reservations.map(reservation => ({
    title: `${reservation.name} (${reservation.people})`,
    start: new Date(reservation.date),
    end: new Date(new Date(reservation.date).getTime() + 2 * 60 * 60 * 1000),
    resource: reservation,
  }));

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block">Usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Iniciar sesión</button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1  className="text-4xl font-bold">Panel de Admin</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Cerrar sesión</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            onSelectEvent={handleSelectEvent}
            selectable
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Reservas</h2>
          {selectedReservation ? (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">{selectedReservation.name}</h3>
              <p>Email: {selectedReservation.email}</p>
              <p>{selectedReservation.people} personas</p>
              <p>{moment(selectedReservation.date).format('D [de] MMMM, YYYY')}</p>
              <p>{moment(selectedReservation.date).format('HH:mm')}</p>
              <p>Estado: {selectedReservation.status}</p>
              <div className="mt-4 space-y-2">
                <button
                  onClick={handleConfirmReservation}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                >
                  Confirmar reserva
                </button>
                <button
                  onClick={handleDeleteReservation}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                >
                  Eliminar reserva
                </button>
              </div>
            </div>
          ) : (
            <p>Selecciona una reserva en el calendario</p>
          )}
        </div>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default AdminPanel;