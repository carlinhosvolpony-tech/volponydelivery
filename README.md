
# Volpony Delivery 🍃

Aplicativo de delivery completo (PWA) moderno e rápido. Suporte a Restaurantes, Farmácias e Serviços diversos com integração via WhatsApp.

## 🚀 Como Iniciar Localmente

1. Instale as dependências: `npm install`
2. Configure a API Key no `.env` (VITE_API_KEY para a IA)
3. Inicie o desenvolvimento: `npm run dev`

## 📦 Como Commitar no GitHub (Sem Erros)

Se você está tendo problemas para subir os arquivos pelo site do GitHub, siga estes passos pelo seu terminal (na pasta do projeto):

1. **Inicie o Git:**
   ```bash
   git init
   ```

2. **Adicione o endereço do seu repositório:**
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   ```

3. **Adicione os arquivos (O arquivo .gitignore já impede a pasta node_modules):**
   ```bash
   git add .
   ```

4. **Faça o seu primeiro commit:**
   ```bash
   git commit -m "feat: versão final Volpony Delivery com integração WhatsApp"
   ```

5. **Suba os arquivos:**
   ```bash
   git branch -M principal
   git push -u origin principal
   ```

## 🛠️ Credenciais de Teste
- **Admin:** `admin` / `123` (Gerencia tudo)
- **Gestor da Loja:** `volpony` / `123` (Gerencia pedidos e cardápio da loja)
- **Motoboy:** `moto` / `123` (Visualiza entregas disponíveis)
- **Cliente:** `cliente` / `123` (Faz pedidos)

## ✨ Funcionalidades Principais
- **IA Assistente:** Volpony Bot ajuda o cliente a escolher pratos.
- **Cupom WhatsApp:** Ao finalizar, o cliente gera um cupom formatado para enviar à loja.
- **Painel Administrativo:** Gestão completa de categorias, usuários e lojas.
- **Multi-turno:** Suporte a estabelecimentos que abrem em dois horários no mesmo dia.
