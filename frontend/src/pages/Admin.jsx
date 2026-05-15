import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

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
          ...form,
          duration: Number(form.duration),
          price: Number(form.price),
        });
        setServices((prev) => prev.map((s) => (s.id === editing.id ? res.data : s)));
        setSuccess('Serviço atualizado!');
      } else {
        const res = await api.post('/services', {
          ...form,
          duration: Number(form.duration),
          price: Number(form.price),
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

  const statusLabel = { PENDING: 'Pendente', CONFIRMED: 'Confirmado', CANCELLED: 'Cancelado' };
  const statusColor = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('appointments')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'appointments' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            Agendamentos
          </button>
          <button
            onClick={() => setTab('services')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'services' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            Serviços
          </button>
        </div>

        {tab === 'appointments' && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Todos os agendamentos</h2>
            {appointments.length === 0 ? (
              <p className="text-gray-500">Nenhum agendamento encontrado.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((a) => (
                  <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-800">{a.service.name}</p>
                      <p className="text-sm text-gray-500">
                        {a.user.name} · {new Date(a.date).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(a.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[a.status]}`}>
                        {statusLabel[a.status]}
                      </span>
                      {a.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'CONFIRMED')}
                            className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'CANCELLED')}
                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition"
                          >
                            Cancelar
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
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {editing ? 'Editar serviço' : 'Novo serviço'}
              </h2>

              {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</p>}
              {success && <p className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4">{success}</p>}

              <form onSubmit={handleSaveService} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min)</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="sm:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                  >
                    {editing ? 'Salvar alterações' : 'Criar serviço'}
                  </button>
                  {editing && (
                    <button
                      type="button"
                      onClick={() => { setEditing(null); setForm({ name: '', description: '', duration: '', price: '' }); }}
                      className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg transition text-sm hover:bg-gray-50"
                    >
                      Cancelar edição
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Serviços cadastrados</h2>
              {services.length === 0 ? (
                <p className="text-gray-500">Nenhum serviço cadastrado.</p>
              ) : (
                <div className="space-y-3">
                  {services.map((s) => (
                    <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{s.name}</p>
                        <p className="text-sm text-gray-500">{s.duration} min · R$ {Number(s.price).toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(s)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteService(s.id)}
                          className="text-sm text-red-500 hover:underline"
                        >
                          Desativar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
