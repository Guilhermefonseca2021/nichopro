# NichoPro

Aplicação de login e cadastro para a biblioteca de prompts NichoPro, feita com
Next.js, TypeScript, Tailwind CSS, Zustand e Supabase Auth.

## Rodar localmente

1. Crie um projeto no [Supabase](https://supabase.com/) e habilite autenticação
   por e-mail e senha.
2. Copie `.env.example` para `.env.local` e preencha as credenciais públicas do
   projeto:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel
   ```

   A chave publicável também pode ser uma chave `anon` legada. Nunca use uma
   `service_role` ou outra chave secreta em variáveis `NEXT_PUBLIC_*`.
3. Instale as dependências e inicie o servidor:

   ```bash
   npm install
   npm run dev
   ```

4. Acesse <http://localhost:3000>.

O nome, o e-mail e o identificador do usuário ficam associados à conta do
Supabase Auth. A senha é gerenciada com segurança pelo provedor e não é salva
em texto puro pelo Zustand nem pela aplicação. O Zustand mantém somente o
estado de usuário na interface; a sessão persistente é gerenciada pelo
Supabase.

## Deploy econômico

O projeto pode ser publicado em um serviço com plano gratuito compatível com
Next.js e usar o plano gratuito do Supabase, observados os limites e as
condições vigentes de cada serviço. Configure as mesmas duas variáveis de
ambiente no provedor de deploy e adicione o domínio de produção às URLs
permitidas de autenticação no painel do Supabase.
