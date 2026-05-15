const prisma = require('../prisma');

async function createAppointment(req, res) {
  const { serviceId, date } = req.body;

  if (!serviceId || !date) {
    return res.status(400).json({ error: 'Serviço e data são obrigatórios' });
  }

  const service = await prisma.service.findUnique({ where: { id: Number(serviceId) } });
  if (!service || !service.active) {
    return res.status(404).json({ error: 'Serviço não encontrado' });
  }

  const conflict = await prisma.appointment.findFirst({
    where: {
      date: new Date(date),
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
  });
  if (conflict) {
    return res.status(409).json({ error: 'Horário já ocupado' });
  }

  const appointment = await prisma.appointment.create({
    data: {
      date: new Date(date),
      userId: req.userId,
      serviceId: Number(serviceId),
    },
    include: { service: true },
  });

  return res.status(201).json(appointment);
}

async function listMyAppointments(req, res) {
  const appointments = await prisma.appointment.findMany({
    where: { userId: req.userId },
    include: { service: true },
    orderBy: { date: 'asc' },
  });

  return res.json(appointments);
}

async function cancelAppointment(req, res) {
  const { id } = req.params;

  const appointment = await prisma.appointment.findUnique({ where: { id: Number(id) } });

  if (!appointment) {
    return res.status(404).json({ error: 'Agendamento não encontrado' });
  }
  if (appointment.userId !== req.userId) {
    return res.status(403).json({ error: 'Sem permissão para cancelar este agendamento' });
  }
  if (appointment.status === 'CANCELLED') {
    return res.status(400).json({ error: 'Agendamento já cancelado' });
  }

  const updated = await prisma.appointment.update({
    where: { id: Number(id) },
    data: { status: 'CANCELLED' },
    include: { service: true },
  });

  return res.json(updated);
}

async function listAllAppointments(req, res) {
  const appointments = await prisma.appointment.findMany({
    include: { service: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: { date: 'asc' },
  });

  return res.json(appointments);
}

async function updateAppointmentStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  const appointment = await prisma.appointment.update({
    where: { id: Number(id) },
    data: { status },
    include: { service: true, user: { select: { id: true, name: true, email: true } } },
  });

  return res.json(appointment);
}

module.exports = {
  createAppointment,
  listMyAppointments,
  cancelAppointment,
  listAllAppointments,
  updateAppointmentStatus,
};
