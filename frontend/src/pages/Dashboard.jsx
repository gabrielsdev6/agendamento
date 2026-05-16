import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const statusConfig = {
  PENDING:   { label: 'Pendente',   bg: 'bg-amber-50',   text: 'text-amber-600',   dot: 'bg-amber-400' },
  CONFIRMED: { label: 'Confirmado', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' },
  CANCELLED: { label: 'Cancelado',  bg: 'bg-red-50',     text: 'text-red-500',     dot: 'bg-red-400' },
};

function StatusBadge({ status }) {
  const s = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
      {s.label}
    </span>
  );
}

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
    if (!confirm('Cancelar este agendamento?')) return;
    try {
      const res = await api.patch(`/appointments/${id}/cancel`);
      setAppointments((prev) => prev.map((a) => (a.id === id ? res.data : a)));
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao cancelar');
    }
  }

  const upcoming = appointments.filter(a => a.status !== 'CANCELLED');
  const cancelled = appointments.filter(a => a.status === 'CANCELLED');

  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto space-y-8">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta!</h1>
          <p className="text-gray-500 mt-1">Agende seus serviços e acompanhe seus horários.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total de agendamentos', value: appointments.length, color: 'from-indigo-500 to-indigo-600' },
            { label: 'Confirmados', value: appointments.filter(a => a.status === 'CONFIRMED').length, color: 'from-emerald-500 to-emerald-600' },
            { label: 'Pendentes', value: appointments.filter(a => a.status === 'PENDING').length, color: 'from-amber-400 to-amber-500' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-md`}>
              <p className="text-sm font-medium opacity-80">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Serviços disponíveis</h2>
          {services.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum serviço disponível no momento.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    {s.description && <p className="text-sm text-gray-400 mt-0.5">{s.description}</p>}
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                    <div>
                      <span className="text-xs text-gray-400">{s.duration} min</span>
                      <span className="mx-1.5 text-gray-200">·</span>
                      <span className="text-sm font-semibold text-gray-800">R$ {Number(s.price).toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => { setSelected(s); setSuccess(''); setError(''); }}
                      className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
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
          <section className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Agendar: {selected.name}</h2>
                <p className="text-sm text-gray-400">Escolha a data e o horário</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">{error}</p>}
            {success && <p className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-xl mb-4">{success}</p>}

            <form onSubmit={handleBook} className="flex flex-wrap gap-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
              >
                {loading ? 'Agendando...' : 'Confirmar'}
              </button>
            </form>
          </section>
        )}

        {upcoming.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Meus agendamentos</h2>
            <div className="space-y-3">
              {upcoming.map((a) => (
                <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{a.service.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(a.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                        {' às '}
                        {new Date(a.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={a.status} />
                    {a.status !== 'CANCELLED' && (
                      <button onClick={() => handleCancel(a.id)} className="text-xs text-gray-300 hover:text-red-400 transition font-medium">
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {cancelled.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-400 mb-3">Cancelados</h2>
            <div className="space-y-2">
              {cancelled.map((a) => (
                <div key={a.id} className="bg-gray-50 rounded-2xl border border-gray-100 p-4 flex items-center justify-between opacity-60">
                  <div>
                    <p className="font-medium text-gray-700 text-sm">{a.service.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(a.date).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(a.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <StatusBadge status="CANCELLED" />
                </div>
              ))}
            </div>
          </section>
        )}

        {appointments.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Nenhum agendamento ainda</p>
            <p className="text-gray-400 text-sm mt-1">Escolha um serviço acima para começar</p>
          </div>
        )}

      </div>
    </Layout>
  );
}
