-- Rode no SQL Editor do Supabase antes de publicar a landing.

create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  contato     text not null,
  link        text,
  descricao   text not null,
  source      text not null default 'landing',
  status      text not null default 'novo'
              check (status in ('novo', 'respondido', 'proposta', 'fechado', 'perdido')),
  created_at  timestamptz not null default now()
);

create index if not exists leads_status_created_idx
  on leads (status, created_at desc);

-- RLS ligada e SEM policy = nenhum acesso via anon key.
-- A rota /api/lead usa service_role, que ignora RLS por design.
--
-- Isto não é detalhe: é exatamente a falha nº1 da lista que vocês vendem.
-- Deixar a tabela aberta na própria landing seria constrangedor.
alter table leads enable row level security;
