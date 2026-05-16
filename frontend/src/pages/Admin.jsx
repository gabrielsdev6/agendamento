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
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${status === 'PENDING' ? 'animate-pulse' : ''}`} />
      {s.label}
    </span>
  );
}

export default function Admin() {
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('appointments');
  const [form, setForm] = useState({ name: '', description: '', duration: '', price: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/services').then((r) => setServices(r.data));
    api.get('/appointments/all').then((r) => setAppointments(r.data));
  }, []);

  async function handleSaveService(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editing) {
        const res = await api.put(`/services/${editing.id}`, {
          ...form, duration: Number(form.duration), price: Number(form.price),
        });
        setServices((prev) => prev.map((s) => (s.id === editing.id ? res.data : s)));
        setSuccess('Serviço atualizado!');
      } else {
        const res = await api.post('/services', {
          ...form, duration: Number(form.duration), price: Number(form.price),
        });
        setServices((prev) => [...prev, res.data]);
        setSuccess('Serviço criado!');
      }
      setForm({ name: '', description: '', duration: '', price: '' });
      setEditing(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar serviço');
    }
  }

  function startEdit(s) {
    setEditing(s);
    setForm({ name: s.name, description: s.description || '', duration: s.duration, price: s.price });
    setSuccess('');
    setError('');
  }

  async function handleDeleteService(id) {
    if (!confirm('Desativar este serviço?')) return;
    await api.delete(`/services/${id}`);
    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleUpdateStatus(id, status) {
    const res = await api.patch(`/appointments/${id}/status`, { status });
    setAppointments((prev) => prev.map((a) => (a.id === id ? res.data : a)));
  }

  const pending = appointments.filter(a => a.status === 'PENDING').length;

  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto space-y-8">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-500 mt-1">Gerencie agendamentos e serviços.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total de agendamentos', value: appointments.length, color: 'from-indigo-500 to-indigo-600' },
            { label: 'Aguardando confirmação', value: pending, color: 'from-amber-400 to-amber-500' },
            { label: 'Serviços ativos', value: services.length, color: 'from-emerald-500 to-emerald-600' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-md`}>
              <p className="text-sm font-medium opacity-80">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {[
            { id: 'appointments', label: 'Agendamentos', count: pending },
            { id: 'services', label: 'Serviços' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                tab === t.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.id ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-600'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'appointments' && (
          <section>
            {appointments.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-400">Nenhum agendamento encontrado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((a) => (
                  <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <span className="text-indigo-500 font-bold text-sm">
                          {a.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{a.service.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {a.user.name} · {new Date(a.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                          {' às '}
                          {new Date(a.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={a.status} />
                      {a.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'CONFIRMED')}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'CANCELLED')}
                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium transition"
                          >
                            Recusar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === 'services' && (
          <section className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-5">
                {editing ? 'Editar serviço' : 'Novo serviço'}
              </h2>

              {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">{error}</p>}
              {success && <p className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-xl mb-4">{success}</p>}

              <form onSubmit={handleSaveService} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Nome', key: 'name', type: 'text', placeholder: 'Ex: Corte de cabelo', required: true },
                  { label: 'Descrição', key: 'description', type: 'text', placeholder: 'Opcional' },
                  { label: 'Duração (min)', key: 'duration', type: 'number', placeholder: '30', required: true },
                  { label: 'Preço (R$)', key: 'price', type: 'number', placeholder: '0.00', required: true, step: '0.01' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      value={form[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      step={field.step}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required={field.required}
                    />
                  </div>
                ))}
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition">
                    {editing ? 'Salvar alterações' : 'Criar serviço'}
                  </button>
                  {editing && (
                    <button
                      type="button"
                      onClick={() => { setEditing(null); setForm({ name: '', description: '', duration: '', price: '' }); }}
                      className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="space-y-3">
              {services.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.duration} min · R$ {Number(s.price).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => startEdit(s)} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition">
                      Editar
                    </button>
                    <button onClick={() => handleDeleteService(s.id)} className="text-xs text-red-400 hover:text-red-600 font-medium transition">
                      Desativar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </Layout>
  );
}
