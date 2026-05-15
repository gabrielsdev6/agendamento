import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Dashboard() {
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/services').then((r) => setServices(r.data));
    api.get('/appointments/my').then((r) => setAppointments(r.data));
  }, []);

  async function handleBook(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const datetime = new Date(`${date}T${time}:00`).toISOString();
      const res = await api.post('/appointments', { serviceId: selected.id, date: datetime });
      setAppointments((prev) => [...prev, res.data]);
      setSuccess('Agendamento realizado com sucesso!');
      setSelected(null);
      setDate('');
      setTime('');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao agendar');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    try {
      const res = await api.patch(`/appointments/${id}/cancel`);
      setAppointments((prev) => prev.map((a) => (a.id === id ? res.data : a)));
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao cancelar');
    }
  }

  const statusLabel = { PENDING: 'Pendente', CONFIRMED: 'Confirmado', CANCELLED: 'Cancelado' };
  const statusColor = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 space-y-8">

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Serviços disponíveis</h2>
          {services.length === 0 ? (
            <p className="text-gray-500">Nenhum serviço disponível no momento.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((s) => (
                <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2">
                  <h3 className="font-semibold text-gray-800">{s.name}</h3>
                  {s.description && <p className="text-sm text-gray-500">{s.description}</p>}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-500">{s.duration} min · R$ {Number(s.price).toFixed(2)}</span>
                    <button
                      onClick={() => setSelected(s)}
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition"
                    >
                      Agendar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {selected && (
          <section className="bg-white rounded-xl border border-blue-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Agendar: {selected.name}</h2>
            <p className="text-sm text-gray-500 mb-4">Escolha a data e o horário</p>

            {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</p>}
            {success && <p className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4">{success}</p>}

            <form onSubmit={handleBook} className="flex flex-col sm:flex-row gap-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Agendando...' : 'Confirmar'}
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg border border-gray-300 transition"
              >
                Cancelar
              </button>
            </form>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Meus agendamentos</h2>
          {appointments.length === 0 ? (
            <p className="text-gray-500">Você ainda não tem agendamentos.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{a.service.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(a.date).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(a.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[a.status]}`}>
                      {statusLabel[a.status]}
                    </span>
                    {a.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancel(a.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
