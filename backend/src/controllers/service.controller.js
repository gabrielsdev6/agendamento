const prisma = require('../prisma');

async function listServices(req, res) {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });
  return res.json(services);
}

async function createService(req, res) {
  const { name, description, duration, price } = req.body;

  if (!name || !duration || price === undefined) {
    return res.status(400).json({ error: 'Nome, duração e preço são obrigatórios' });
  }

  const service = await prisma.service.create({
    data: { name, description, duration: Number(duration), price: Number(price) },
  });

  return res.status(201).json(service);
}

async function updateService(req, res) {
  const { id } = req.params;
  const { name, description, duration, price, active } = req.body;

  const service = await prisma.service.update({
    where: { id: Number(id) },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(duration !== undefined && { duration: Number(duration) }),
      ...(price !== undefined && { price: Number(price) }),
      ...(active !== undefined && { active }),
    },
  });

  return res.json(service);
}

async function deleteService(req, res) {
  const { id } = req.params;

  await prisma.service.update({
    where: { id: Number(id) },
    data: { active: false },
  });

  return res.status(204).send();
}

module.exports = { listServices, createService, updateService, deleteService };
