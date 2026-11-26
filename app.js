// ==========================================
// BATALHA CONTRA O CYBERBULLYING
// ==========================================

// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDdj12NqEP1Hxr-rqJ04ezLBheMuEZfqs",
  authDomain: "batalhateste.firebaseapp.com",
  projectId: "batalhateste",
  storageBucket: "batalhateste.firebasestorage.app",
  messagingSenderId: "761564956063",
  appId: "1:761564956063:web:b349d3ebaf67b109c7a9aa",
  measurementId: "G-D82NBCRT55"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let currentRoom = null;
let roomRef = null;
let unsubscribeRoom = null;

let busy = false;
let canAttack = false;
let questionPending = false;
let usedQuestions = [];

// ==========================================
// BANCO DE 30 QUESTÕES
// CYBERBULLYING E SEGURANÇA DIGITAL
// ==========================================

const questions = [
  {
    level: "Fácil",
    question: "O que é cyberbullying?",
    options: [
      "Uma brincadeira presencial",
      "Agressão ou intimidação realizada por meios digitais",
      "Um jogo de computador",
      "Uma conversa entre amigos"
    ],
    answer: 1,
    explanation: "Cyberbullying envolve agressões, humilhações ou intimidações por meios digitais."
  },
  {
    level: "Fácil",
    question: "Qual atitude pode ser considerada cyberbullying?",
    options: [
      "Enviar uma mensagem de apoio",
      "Compartilhar um trabalho escolar",
      "Publicar comentários ofensivos repetidamente sobre alguém",
      "Conversar respeitosamente"
    ],
    answer: 2,
    explanation: "Comentários ofensivos e repetidos para humilhar alguém podem caracterizar cyberbullying."
  },
  {
    level: "Fácil",
    question: "Se você receber uma mensagem ofensiva na internet, o que deve fazer?",
    options: [
      "Responder com outra ofensa",
      "Compartilhar com todos",
      "Guardar evidências e procurar ajuda",
      "Criar uma conta falsa para atacar"
    ],
    answer: 2,
    explanation: "Guardar provas e buscar ajuda de um adulto de confiança é uma atitude segura."
  },
  {
    level: "Fácil",
    question: "Qual atitude demonstra respeito nas redes sociais?",
    options: [
      "Ridicularizar fotos",
      "Compartilhar rumores",
      "Respeitar opiniões e diferenças",
      "Excluir alguém de propósito para humilhar"
    ],
    answer: 2,
    explanation: "Respeito e empatia são fundamentais nas interações online."
  },
  {
    level: "Fácil",
    question: "O que devemos fazer antes de compartilhar uma foto de outra pessoa?",
    options: [
      "Compartilhar imediatamente",
      "Pedir autorização",
      "Editar para ridicularizar",
      "Enviar para desconhecidos"
    ],
    answer: 1,
    explanation: "É importante respeitar a privacidade e pedir autorização antes de compartilhar imagens."
  },
  {
    level: "Fácil",
    question: "Qual é um exemplo de comportamento seguro na internet?",
    options: [
      "Compartilhar senhas",
      "Clicar em todos os links",
      "Manter informações pessoais protegidas",
      "Aceitar todos os desconhecidos"
    ],
    answer: 2,
    explanation: "Proteger informações pessoais ajuda a evitar riscos digitais."
  },
  {
    level: "Fácil",
    question: "O que significa empatia no ambiente digital?",
    options: [
      "Ignorar os sentimentos dos outros",
      "Pensar em como nossas atitudes afetam outras pessoas",
      "Publicar sem pensar",
      "Usar perfis falsos"
    ],
    answer: 1,
    explanation: "Empatia é considerar os sentimentos e a experiência do outro."
  },
  {
    level: "Fácil",
    question: "Você vê um colega sendo humilhado em um grupo. Qual atitude é mais adequada?",
    options: [
      "Curtir as mensagens",
      "Compartilhar as ofensas",
      "Não apoiar a agressão e procurar ajuda",
      "Criar mais memes sobre ele"
    ],
    answer: 2,
    explanation: "Não alimentar as agressões e buscar ajuda são atitudes responsáveis."
  },
  {
    level: "Fácil",
    question: "Por que devemos ter cuidado com fotos e informações que publicamos?",
    options: [
      "Porque podem ser copiadas e compartilhadas por outras pessoas",
      "Porque desaparecem sempre",
      "Porque ninguém consegue visualizar",
      "Porque não têm importância"
    ],
    answer: 0,
    explanation: "Conteúdos publicados podem ser copiados, armazenados ou compartilhados sem nosso controle."
  },
  {
    level: "Fácil",
    question: "Qual atitude NÃO ajuda a combater o cyberbullying?",
    options: [
      "Denunciar conteúdo ofensivo",
      "Acolher a vítima",
      "Compartilhar a postagem para aumentar a humilhação",
      "Buscar apoio de um adulto"
    ],
    answer: 2,
    explanation: "Compartilhar conteúdos ofensivos amplia a exposição e o sofrimento da vítima."
  },

  {
    level: "Médio",
    question: "Por que compartilhar uma postagem ofensiva, mesmo sem criá-la, pode ser prejudicial?",
    options: [
      "Porque ajuda a ampliar a exposição e a humilhação",
      "Porque apaga automaticamente o conteúdo",
      "Porque protege a vítima",
      "Porque impede novas publicações"
    ],
    answer: 0,
    explanation: "Compartilhar amplia o alcance da agressão e pode aumentar o sofrimento da vítima."
  },
  {
    level: "Médio",
    question: "O que é uma denúncia em uma rede social?",
    options: [
      "Uma forma de divulgar uma publicação",
      "Um recurso para informar a plataforma sobre conteúdo ou comportamento inadequado",
      "Um comentário público",
      "Uma maneira de aumentar seguidores"
    ],
    answer: 1,
    explanation: "A denúncia permite comunicar conteúdos ou comportamentos que violam as regras da plataforma."
  },
  {
    level: "Médio",
    question: "Por que guardar capturas de tela de mensagens de cyberbullying?",
    options: [
      "Para espalhar o conteúdo",
      "Para usar como meme",
      "Para registrar evidências do ocorrido",
      "Para provocar o agressor"
    ],
    answer: 2,
    explanation: "As capturas podem ajudar a documentar o ocorrido ao buscar apoio ou fazer uma denúncia."
  },
  {
    level: "Médio",
    question: "Uma pessoa cria um perfil falso para humilhar um colega. Qual problema existe nessa atitude?",
    options: [
      "Nenhum, porque o perfil é falso",
      "A identidade falsa não elimina a responsabilidade pelas agressões",
      "É permitido em qualquer situação",
      "A vítima não pode ser afetada"
    ],
    answer: 1,
    explanation: "Perfis falsos também podem ser usados para cometer agressões e causar danos."
  },
  {
    level: "Médio",
    question: "Qual é a melhor atitude ao receber um link suspeito enviado por desconhecido?",
    options: [
      "Abrir imediatamente",
      "Enviar para todos os amigos",
      "Não clicar e verificar a origem",
      "Informar a senha para acessar"
    ],
    answer: 2,
    explanation: "Links suspeitos podem levar a golpes ou páginas maliciosas."
  },
  {
    level: "Médio",
    question: "O que caracteriza uma atitude de testemunha responsável?",
    options: [
      "Apoiar as agressões",
      "Ficar incentivando o agressor",
      "Buscar formas seguras de ajudar a vítima",
      "Compartilhar o conteúdo"
    ],
    answer: 2,
    explanation: "A testemunha pode apoiar a vítima e buscar ajuda sem se expor a riscos."
  },
  {
    level: "Médio",
    question: "Por que uma mensagem escrita pode causar mal-entendidos?",
    options: [
      "Porque sempre contém imagens",
      "Porque pode não transmitir tom de voz ou expressão facial",
      "Porque não pode ser lida",
      "Porque desaparece instantaneamente"
    ],
    answer: 1,
    explanation: "Mensagens escritas podem não transmitir claramente emoções ou intenções."
  },
  {
    level: "Médio",
    question: "O que é privacidade digital?",
    options: [
      "Compartilhar tudo publicamente",
      "Controlar e proteger informações pessoais no ambiente digital",
      "Deixar todas as contas abertas",
      "Usar a mesma senha em tudo"
    ],
    answer: 1,
    explanation: "Privacidade digital envolve proteger informações pessoais e controlar seu uso."
  },
  {
    level: "Médio",
    question: "Qual atitude pode ajudar alguém que está sofrendo cyberbullying?",
    options: [
      "Dizer que é frescura",
      "Culpá-la pelas agressões",
      "Ouvir, acolher e ajudá-la a buscar apoio",
      "Expor a situação sem autorização"
    ],
    answer: 2,
    explanation: "Acolhimento, escuta e apoio são importantes para quem sofre agressões."
  },
  {
    level: "Médio",
    question: "Por que devemos verificar informações antes de compartilhá-las?",
    options: [
      "Para evitar espalhar notícias falsas ou prejudiciais",
      "Para aumentar o número de curtidas",
      "Para publicar mais rapidamente",
      "Porque toda mensagem é verdadeira"
    ],
    answer: 0,
    explanation: "Verificar informações ajuda a combater desinformação e danos causados por rumores."
  },

  {
    level: "Difícil",
    question: "Uma vítima recebe ataques em diferentes redes sociais. Qual conjunto de ações é mais adequado?",
    options: [
      "Responder a todos os ataques",
      "Guardar evidências, bloquear, denunciar e buscar apoio",
      "Apagar todas as provas e ficar em silêncio",
      "Criar perfis para retaliar"
    ],
    answer: 1,
    explanation: "Registrar evidências, usar ferramentas de proteção e procurar apoio são ações recomendadas."
  },
  {
    level: "Difícil",
    question: "Por que o cyberbullying pode ter efeitos mesmo quando ocorre fora da escola?",
    options: [
      "Porque o ambiente digital pode acompanhar a vítima em diferentes momentos e lugares",
      "Porque só acontece durante as aulas",
      "Porque não afeta emoções",
      "Porque desaparece quando o celular é desligado"
    ],
    answer: 0,
    explanation: "A exposição digital pode continuar sendo percebida e gerar sofrimento em diferentes contextos."
  },
  {
    level: "Difícil",
    question: "Qual alternativa descreve melhor a diferença entre conflito e cyberbullying?",
    options: [
      "São sempre a mesma coisa",
      "Cyberbullying envolve agressões e desequilíbrio de poder, podendo ser repetido; conflito pode ocorrer entre pessoas em condições semelhantes",
      "Conflito nunca existe na internet",
      "Cyberbullying só acontece entre adultos"
    ],
    answer: 1,
    explanation: "Cyberbullying pode envolver repetição, intenção de causar dano e desequilíbrio de poder."
  },
  {
    level: "Difícil",
    question: "Por que a divulgação de um conteúdo íntimo sem autorização é grave?",
    options: [
      "Porque pode violar privacidade e causar danos à pessoa exposta",
      "Porque aumenta a popularidade",
      "Porque é sempre uma brincadeira",
      "Porque não tem consequências"
    ],
    answer: 0,
    explanation: "A divulgação sem consentimento pode causar danos emocionais, sociais e também consequências legais."
  },
  {
    level: "Difícil",
    question: "Um estudante é pressionado a participar de um grupo que ridiculariza outro colega. Qual atitude demonstra responsabilidade?",
    options: [
      "Participar para não ser excluído",
      "Compartilhar as mensagens",
      "Não colaborar com as agressões e procurar apoio",
      "Criar novas ofensas"
    ],
    answer: 2,
    explanation: "Não participar das agressões e buscar ajuda contribui para interromper o ciclo de violência."
  },
  {
    level: "Difícil",
    question: "Qual é o papel da escola no enfrentamento do cyberbullying?",
    options: [
      "Ignorar porque ocorre online",
      "Promover orientação, acolhimento, prevenção e encaminhamentos",
      "Culpar sempre a vítima",
      "Incentivar exposição pública"
    ],
    answer: 1,
    explanation: "A escola pode desenvolver ações educativas, acolher envolvidos e acionar procedimentos adequados."
  },
  {
    level: "Difícil",
    question: "Por que não é adequado tentar resolver o cyberbullying apenas com vingança?",
    options: [
      "Porque pode intensificar as agressões e criar novos danos",
      "Porque a vingança sempre resolve",
      "Porque não existe internet",
      "Porque a vítima não tem direitos"
    ],
    answer: 0,
    explanation: "Retaliações podem ampliar o conflito e dificultar uma solução segura."
  },
  {
    level: "Difícil",
    question: "Qual é uma consequência possível do cyberbullying para a vítima?",
    options: [
      "Somente diversão",
      "Ansiedade, tristeza, isolamento ou dificuldades escolares",
      "Sempre melhora o desempenho",
      "Nenhuma consequência"
    ],
    answer: 1,
    explanation: "O cyberbullying pode afetar o bem-estar emocional, social e escolar."
  },
  {
    level: "Difícil",
    question: "O que significa agir com responsabilidade ao publicar algo na internet?",
    options: [
      "Publicar sem pensar",
      "Considerar consequências, privacidade e respeito às outras pessoas",
      "Compartilhar tudo que recebemos",
      "Usar anonimato para ofender"
    ],
    answer: 1,
    explanation: "Responsabilidade digital envolve pensar antes de publicar e respeitar outras pessoas."
  },
  {
    level: "Difícil",
    question: "Qual estratégia é mais eficaz para prevenir cyberbullying em uma comunidade escolar?",
    options: [
      "Punir sem conversar",
      "Ignorar as situações",
      "Combinar educação digital, empatia, canais de apoio e participação dos estudantes",
      "Proibir qualquer conversa"
    ],
    answer: 2,
    explanation: "Prevenção envolve educação, diálogo, apoio e ações coletivas contínuas."
  },
  {
    level: "Difícil",
    question: "Ao perceber que uma postagem está causando humilhação a um colega, qual atitude é mais responsável?",
    options: [
      "Repostar para mais pessoas",
      "Curtir e comentar",
      "Não ampliar o alcance, apoiar a pessoa e denunciar o conteúdo",
      "Fazer uma montagem"
    ],
    answer: 2,
    explanation: "Evitar compartilhar, apoiar a vítima e denunciar ajuda a reduzir a propagação da agressão."
  }
];

// ==========================================
// ELEMENTOS HTML
// ==========================================

const homeScreen = document.getElementById("homeScreen");
const lobbyScreen = document.getElementById("lobbyScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");

const playerNameInput = document.getElementById("playerName");
const roomCodeInput = document.getElementById("roomCodeInput");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");

const homeMessage = document.getElementById("homeMessage");
const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const copyCodeBtn = document.getElementById("copyCodeBtn");
const lobbyStatus = document.getElementById("lobbyStatus");
const playersList = document.getElementById("playersList");

const myBoard = document.getElementById("myBoard");
const enemyBoard = document.getElementById("enemyBoard");

const turnMessage = document.getElementById("turnMessage");
const gameStatus = document.getElementById("gameStatus");
const gameMessage = document.getElementById("gameMessage");

const questionArea = document.getElementById("questionArea");
const questionLevel = document.getElementById("questionLevel");
const questionText = document.getElementById("questionText");
const answerOptions = document.getElementById("answerOptions");
const answerFeedback = document.getElementById("answerFeedback");

const winnerMessage = document.getElementById("winnerMessage");
const finalMessage = document.getElementById("finalMessage");

// ==========================================
// AUTENTICAÇÃO
// ==========================================

auth.signInAnonymously()
  .then(result => {
    currentUser = result.user;
    homeMessage.textContent =
      "Conectado! Você pode criar ou entrar em uma partida.";
  })
  .catch(error => {
    console.error("Erro Firebase:", error);
    homeMessage.textContent =
      "Erro de conexão Firebase: " + error.message;
  });

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function showScreen(screen) {
  homeScreen.classList.add("hidden");
  lobbyScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  endScreen.classList.add("hidden");

  screen.classList.remove("hidden");
}

function getPlayerName() {
  return playerNameInput.value.trim() || "Jogador";
}

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function createShips() {
  const ships = [];
  const lengths = [3, 2, 2];

  lengths.forEach(length => {
    let placed = false;

    while (!placed) {
      const horizontal = Math.random() < 0.5;
      const row = Math.floor(Math.random() * 8);
      const col = Math.floor(Math.random() * 8);

      const cells = [];

      for (let i = 0; i < length; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;

        if (r >= 8 || c >= 8) break;

        cells.push(r * 8 + c);
      }

      if (cells.length !== length) continue;

      const overlap = cells.some(cell => ships.flat().includes(cell));

      if (!overlap) {
        ships.push(cells);
        placed = true;
      }
    }
  });

  return ships.flat();
}

function createPlayer(name) {
  return {
    uid: currentUser.uid,
    name: name,
    ships: createShips(),
    hits: [],
    misses: []
  };
}

function getOpponentIndex() {
  if (!currentRoom) return -1;
  return currentRoom.players.findIndex(p => p.uid !== currentUser.uid);
}

function getMyIndex() {
  if (!currentRoom) return -1;
  return currentRoom.players.findIndex(p => p.uid === currentUser.uid);
}

function isMyTurn() {
  return currentRoom &&
    currentRoom.turn === currentUser.uid &&
    currentRoom.status === "playing";
}

function showMessage(text) {
  gameMessage.textContent = text;
}

function randomQuestion() {
  if (usedQuestions.length >= questions.length) {
    usedQuestions = [];
  }

  const available = questions.filter((q, i) =>
    !usedQuestions.includes(i)
  );

  const index = Math.floor(Math.random() * available.length);
  const question = available[index];

  usedQuestions.push(questions.indexOf(question));

  return question;
}

// ==========================================
// CRIAR PARTIDA
// ==========================================

createRoomBtn.addEventListener("click", async () => {
  if (!currentUser) {
    homeMessage.textContent = "Aguarde a conexão com Firebase...";
    return;
  }

  busy = true;
  createRoomBtn.disabled = true;

  try {
    const code = generateRoomCode();
    const player = createPlayer(getPlayerName());

    roomRef = db.collection("rooms").doc(code);

    await roomRef.set({
      code: code,
      players: [player],
      turn: currentUser.uid,
      status: "waiting",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    currentRoom = null;

    roomCodeDisplay.textContent = code;
    showScreen(lobbyScreen);
    listenRoom(code);

  } catch (error) {
    console.error(error);
    homeMessage.textContent = "Erro ao criar partida: " + error.message;
  } finally {
    busy = false;
    createRoomBtn.disabled = false;
  }
});

// ==========================================
// ENTRAR EM PARTIDA
// ==========================================

joinRoomBtn.addEventListener("click", async () => {
  if (!currentUser) {
    homeMessage.textContent = "Aguarde a conexão com Firebase...";
    return;
  }

  const code = roomCodeInput.value.trim().toUpperCase();

  if (!code) {
    homeMessage.textContent = "Digite o código da sala.";
    return;
  }

  busy = true;
  joinRoomBtn.disabled = true;

  try {
    roomRef = db.collection("rooms").doc(code);
    const snapshot = await roomRef.get();

    if (!snapshot.exists) {
      homeMessage.textContent = "Sala não encontrada.";
      return;
    }

    const data = snapshot.data();

    if (data.players.some(p => p.uid === currentUser.uid)) {
      showScreen(lobbyScreen);
      roomCodeDisplay.textContent = code;
      listenRoom(code);
      return;
    }

    if (data.players.length >= 2) {
      homeMessage.textContent = "Essa sala já está cheia.";
      return;
    }

    if (data.status !== "waiting") {
      homeMessage.textContent = "Essa partida já começou.";
      return;
    }

    const player = createPlayer(getPlayerName());

    await roomRef.update({
      players: firebase.firestore.FieldValue.arrayUnion(player),
      status: "playing"
    });

    roomCodeDisplay.textContent = code;
    showScreen(lobbyScreen);
    listenRoom(code);

  } catch (error) {
    console.error(error);
    homeMessage.textContent = "Erro ao entrar: " + error.message;
  } finally {
    busy = false;
    joinRoomBtn.disabled = false;
  }
});

// ==========================================
// COPIAR CÓDIGO
// ==========================================

copyCodeBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(roomCodeDisplay.textContent);
    copyCodeBtn.textContent = "Copiado!";
    setTimeout(() => copyCodeBtn.textContent = "📋 Copiar", 1500);
  } catch {
    alert("Código da sala: " + roomCodeDisplay.textContent);
  }
});

// ==========================================
// OUVIR SALA
// ==========================================

function listenRoom(code) {
  if (unsubscribeRoom) unsubscribeRoom();

  roomRef = db.collection("rooms").doc(code);

  unsubscribeRoom = roomRef.onSnapshot(snapshot => {
    if (!snapshot.exists) return;

    currentRoom = snapshot.data();
    renderRoom();

  }, error => {
    console.error("Erro ao acompanhar sala:", error);
    lobbyStatus.textContent = "Erro ao conectar à sala.";
  });
}

// ==========================================
// RENDERIZAR SALA
// ==========================================

function renderRoom() {
  if (!currentRoom) return;

  if (currentRoom.status === "waiting") {
    showScreen(lobbyScreen);
    lobbyStatus.textContent = "Aguardando outro jogador...";
    renderPlayers();
    return;
  }

  if (currentRoom.status === "playing") {
    showScreen(gameScreen);
    renderGame();
    return;
  }

  if (currentRoom.status === "finished") {
    showScreen(endScreen);
    renderEnd();
  }
}

function renderPlayers() {
  playersList.innerHTML = "";

  if (!currentRoom) return;

  currentRoom.players.forEach(player => {
    const div = document.createElement("div");
    div.className = "player-item";
    div.textContent = "👤 " + player.name;
    playersList.appendChild(div);
  });

  if (currentRoom.players.length === 2) {
    lobbyStatus.textContent = "Dois jogadores conectados! Iniciando...";
  }
}

// ==========================================
// TABULEIROS
// ==========================================

function renderBoard(element, cells, isEnemy) {
  element.innerHTML = "";

  for (let i = 0; i < 64; i++) {
    const cell = document.createElement("button");
    cell.className = "cell";

    if (cells.ships && cells.ships.includes(i) && !isEnemy) {
      cell.classList.add("ship-cell");
      cell.textContent = "🚢";
    }

    if (cells.hits && cells.hits.includes(i)) {
      cell.classList.add("hit-cell");
      cell.textContent = "💥";
    }

    if (cells.misses && cells.misses.includes(i)) {
      cell.classList.add("miss-cell");
      cell.textContent = "⭕";
    }

    if (isEnemy) {
      cell.classList.add("enemy-cell");

      if (cells.hits && cells.hits.includes(i)) {
        cell.textContent = "💥";
        cell.classList.add("hit-cell");
      } else if (cells.misses && cells.misses.includes(i)) {
        cell.textContent = "⭕";
        cell.classList.add("miss-cell");
      } else {
        cell.textContent = "❓";
      }

      cell.disabled = !isMyTurn() || !canAttack ||
        (cells.hits && cells.hits.includes(i)) ||
        (cells.misses && cells.misses.includes(i));

      cell.addEventListener("click", () => attack(i));
    }

    element.appendChild(cell);
  }
}

function renderGame() {
  const myIndex = getMyIndex();
  const opponentIndex = getOpponentIndex();

  if (myIndex < 0 || opponentIndex < 0) return;

  const me = currentRoom.players[myIndex];
  const opponent = currentRoom.players[opponentIndex];

  renderBoard(myBoard, me, false);
  renderBoard(enemyBoard, opponent, true);

  if (isMyTurn()) {
    turnMessage.textContent =
      "🎯 É sua vez! Responda à pergunta para atacar.";

    gameStatus.textContent = "Sua vez";
    gameStatus.style.background = "#d9f7e5";
    gameStatus.style.color = "#16733c";

    if (!canAttack && !questionPending) {
      startQuestion();
    }

  } else {
    turnMessage.textContent = "⏳ Aguardando jogada do adversário...";
    gameStatus.textContent = "Aguardando";
    gameStatus.style.background = "#e8f1f8";
    gameStatus.style.color = "#45708c";

    canAttack = false;
    questionPending = false;
    questionArea.classList.add("hidden");
  }
}

// ==========================================
// PERGUNTAS
// ==========================================

function startQuestion() {
  if (!isMyTurn() || questionPending || canAttack) return;

  questionPending = true;
  answerFeedback.textContent = "";

  const q = randomQuestion();

  questionLevel.textContent = q.level;
  questionText.textContent = q.question;
  answerOptions.innerHTML = "";

  q.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.textContent = String.fromCharCode(65 + index) + ") " + option;

    button.addEventListener("click", () => answerQuestion(index, q, button));

    answerOptions.appendChild(button);
  });

  questionArea.classList.remove("hidden");
}

function answerQuestion(index, q, selectedButton) {
  if (!questionPending || !isMyTurn()) return;

  const buttons = answerOptions.querySelectorAll("button");
  buttons.forEach(button => button.disabled = true);

  if (index === q.answer) {
    selectedButton.classList.add("correct");
    answerFeedback.textContent =
      "✅ Resposta correta! Escolha uma posição no tabuleiro adversário.";

    canAttack = true;
    questionPending = false;
    renderGame();

  } else {
    selectedButton.classList.add("wrong");
    answerFeedback.textContent =
      "❌ Resposta incorreta! " + q.explanation + " A vez será passada.";

    questionPending = false;
    canAttack = false;

    setTimeout(() => passTurn(), 2200);
  }
}

// ==========================================
// ATAQUE
// ==========================================

async function attack(index) {
  if (busy || !canAttack || !isMyTurn()) return;

  const opponentIndex = getOpponentIndex();

  if (opponentIndex < 0) return;

  const opponent = currentRoom.players[opponentIndex];

  if (opponent.hits.includes(index) || opponent.misses.includes(index)) {
    return;
  }

  busy = true;
  canAttack = false;
  questionPending = false;
  questionArea.classList.add("hidden");

  try {
    await db.runTransaction(async transaction => {
      const snapshot = await transaction.get(roomRef);
      const data = snapshot.data();

      if (data.status !== "playing" || data.turn !== currentUser.uid) {
        throw new Error("Não é sua vez.");
      }

      const players = data.players;
      const enemyIndex = players.findIndex(p => p.uid !== currentUser.uid);

      if (enemyIndex < 0) {
        throw new Error("Adversário não encontrado.");
      }

      const enemy = players[enemyIndex];

      if (enemy.hits.includes(index) || enemy.misses.includes(index)) {
        throw new Error("Esta posição já foi atacada.");
      }

      const isHit = enemy.ships.includes(index);

      if (isHit) {
        enemy.hits.push(index);
      } else {
        enemy.misses.push(index);
      }

      const allHit = enemy.ships.every(shipCell =>
        enemy.hits.includes(shipCell)
      );

      if (allHit) {
        transaction.update(roomRef, {
          players: players,
          status: "finished",
          winner: currentUser.uid
        });
      } else {
        const nextPlayer = players.find(p => p.uid !== currentUser.uid);

        transaction.update(roomRef, {
          players: players,
          turn: nextPlayer.uid
        });
      }
    });

    showMessage("Ataque realizado!");

  } catch (error) {
    console.error(error);
    showMessage(error.message);

  } finally {
    busy = false;
  }
}

// ==========================================
// PASSAR A VEZ
// ==========================================

async function passTurn() {
  if (!isMyTurn() || busy) return;

  busy = true;

  try {
    const nextPlayer = currentRoom.players.find(
      p => p.uid !== currentUser.uid
    );

    if (!nextPlayer) return;

    await roomRef.update({
      turn: nextPlayer.uid
    });

  } catch (error) {
    console.error(error);

  } finally {
    busy = false;
  }
}

// ==========================================
// FINAL DO JOGO
// ==========================================

function renderEnd() {
  const winner = currentRoom.players.find(
    p => p.uid === currentRoom.winner
  );

  winnerMessage.textContent = winner
    ? "🏆 " + winner.name + " venceu!"
    : "🏆 Fim de jogo!";

  finalMessage.textContent =
    "Todos os navios adversários foram encontrados. Parabéns pela batalha!";
}

// ==========================================
// ERROS
// ==========================================

window.addEventListener("error", event => {
  console.error("Erro de script:", event.message);
});