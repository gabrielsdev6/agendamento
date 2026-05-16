# Sistema de Agendamento

Aplicação fullstack de agendamento de serviços com dois perfis de acesso: cliente e administrador.

**Demo:** [agendamento-amber.vercel.app](https://agendamento-amber.vercel.app)

## Funcionalidades

**Cliente**
- Cadastro e login com JWT
- Visualização de serviços disponíveis
- Agendamento de horários
- Cancelamento de agendamentos

**Admin**
- Gerenciamento de serviços (criar, editar, desativar)
- Visualização de todos os agendamentos
- Confirmação e cancelamento de agendamentos

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | React, Tailwind CSS, Vite, Axios, React Router |
| Backend | Node.js, Express, Prisma ORM, JWT, bcrypt |
| Banco de dados | PostgreSQL |
| Deploy | Vercel (frontend) + Railway (backend + banco) |

## Como rodar localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL instalado e rodando

### Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env`:

```env
PORT=3333
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/agendamento"
JWT_SECRET="sua_chave_secreta"
```

```bash
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Crie o arquivo `.env`:

```env
VITE_API_URL=http://localhost:3333
```

```bash
npm run dev
```

Acesse `http://localhost:5173`.

## Estrutura do projeto

```
agendamento/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       └── index.js
└── frontend/
    └── src/
        ├── components/
        ├── contexts/
        ├── pages/
        └── services/
```

## Autor

Gabriel Pereira — estudante de Ciência da Computação
