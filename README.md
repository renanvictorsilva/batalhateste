# Batalha Naval Química — protótipo multiplayer

## O que está incluído
- `index.html`: jogo para dois alunos, cada um em um computador.
- `firestore.rules`: regras iniciais do banco.
- Perguntas fáceis de Química, tabuleiro 8×8 e frota automática.

## Para colocar online (Firebase + GitHub Pages)

1. Acesse https://console.firebase.google.com/ e crie um projeto.
2. No projeto, adicione um aplicativo Web e copie a configuração Firebase.
3. Em Authentication > Sign-in method, habilite **Anonymous**.
4. Em Firestore Database, crie um banco de dados.
5. Abra `index.html` e substitua os valores `SUA_API_KEY`, `SEU_PROJETO` e `SEU_PROJECT_ID` pelos dados do seu app Firebase (incluindo `appId`).
6. Em Firestore > Rules, publique o conteúdo de `firestore.rules`.
7. Publique `index.html` em um repositório GitHub e habilite GitHub Pages (Settings > Pages > Deploy from branch).
8. Abra o endereço publicado nos computadores do laboratório.

## Como jogar
- Cada aluno digita seu nome.
- Um aluno clica em **Criar partida** e compartilha o código de 5 letras.
- O adversário informa o mesmo código e clica em **Entrar na partida**.
- Na vez do jogador, ele escolhe uma casa do tabuleiro adversário.
- Responde à pergunta; se acertar, o disparo é registrado. Se errar, a vez passa.
- Vence quem acertar todas as casas ocupadas pelos navios adversários.

## Observações
Este é um MVP para teste em ambiente escolar. A configuração inicial de regras permite leitura e atualização por qualquer usuário autenticado; ela é simples para validar a dinâmica, mas não é adequada para um torneio público sem endurecimento das regras e validação das jogadas no servidor. As respostas são validadas no navegador, portanto um aluno com conhecimento técnico poderia adulterar o jogo.
