# Volpony Delivery 🍃

Aplicativo de delivery completo (PWA) com suporte a Restaurantes, Farmácias e Táxi/Moto. Inclui Painel Administrativo, Área do Entregador e Interface do Cliente com IA.

## 🚀 Como colocar em Produção (Guia Rápido)

Este projeto utiliza **Vite + React** no frontend e **Supabase** como backend (Banco de Dados + Realtime).

### Passo 1: Configurar o Banco de Dados (Supabase)

1. Crie um projeto gratuito em [Supabase.com](https://supabase.com).
2. No menu lateral, vá em **SQL Editor** > **New Query**.
3. Copie e cole o código abaixo para criar a estrutura e habilitar o Realtime:

```sql
-- CRIAÇÃO DAS TABELAS
CREATE TABLE IF NOT EXISTS settings (id text PRIMARY KEY, data jsonb, updated_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS users (id text PRIMARY KEY, data jsonb, updated_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS restaurants (id text PRIMARY KEY, data jsonb, updated_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS orders (id text PRIMARY KEY, data jsonb, updated_at timestamptz DEFAULT now());

-- HABILITAR REALTIME (Para pedidos instantâneos)
ALTER PUBLICATION supabase_realtime ADD TABLE settings, users, restaurants, orders;

-- PERMISSÕES DE ACESSO (Público para MVP)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY; CREATE POLICY "Public" ON settings FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE users ENABLE ROW LEVEL SECURITY; CREATE POLICY "Public" ON users FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY; CREATE POLICY "Public" ON restaurants FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY; CREATE POLICY "Public" ON orders FOR ALL USING (true) WITH CHECK (true);
```

4. Clique em **Run**.
5. Vá em **Project Settings (Engrenagem) > API** e copie:
   - **Project URL**
   - **anon public key**

---

### Passo 2: Hospedar o Site (Vercel)

1. Faça o upload deste código para o seu **GitHub**.
2. Acesse [Vercel.com](https://vercel.com) e crie um **New Project**.
3. Importe o repositório do GitHub.
4. Na aba **Environment Variables**, adicione as chaves copiadas do Supabase:

| Nome da Variável | Valor (Exemplo) |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://xxyyzz.supabase.co` |
| `VITE_SUPABASE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5c...` |
| `VITE_API_KEY` | `AIzaSyD...` (Opcional: Google Gemini Key) |

5. Clique em **Deploy**.

---

### Passo 3: Usando o App

1. Acesse a URL gerada pela Vercel (ex: `https://volpony.vercel.app`).
2. **Primeiro Acesso:** O banco estará vazio.
3. Faça login com o usuário padrão que será criado automaticamente ou use o **Painel Admin** para criar novos.
   - **Login Admin:** `admin` / `123`
   - **Login Gestor:** `volpony` / `123`
   - **Login Motoboy:** `moto` / `123`

## 🛠️ Funcionalidades Técnicas

- **Sincronização Atômica:** Evita que dois motoboys peguem o mesmo pedido.
- **Offline-First:** Se a internet cair, o app avisa, mas continua mostrando os dados em cache.
- **PWA:** Pode ser instalado no celular como um app nativo.
- **IA Integrada:** Chatbot que lê o cardápio em tempo real.

## 📦 Scripts Locais

- `npm install`: Instalar dependências.
- `npm run dev`: Rodar localmente.
- `npm run build`: Criar versão de produção.
