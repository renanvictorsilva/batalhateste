// ==========================================
// QUÍMICA NO COTIDIANO - BATALHA QUÍMICA
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
// ==========================================

const questions = [
  {
    level: "Fácil",
    question: "Quando o gelo derrete, que transformação ocorre?",
    options: ["Solidificação", "Fusão", "Condensação", "Sublimação"],
    answer: 1,
    explanation: "Fusão é a passagem do estado sólido para o líquido."
  },
  {
    level: "Fácil",
    question: "Por que água e óleo não se misturam facilmente?",
    options: ["O óleo é mais pesado", "A água é quente", "Possuem polaridades diferentes", "O óleo evapora"],
    answer: 2,
    explanation: "A água é polar e o óleo é predominantemente apolar."
  },
  {
    level: "Fácil",
    question: "Qual é a função do detergente na lavagem?",
    options: ["Congelar a gordura", "Facilitar a remoção de gordura", "Produzir oxigênio", "Transformar água em óleo"],
    answer: 1,
    explanation: "O detergente ajuda a dispersar a gordura na água."
  },
  {
    level: "Fácil",
    question: "Sentimos o cheiro de perfume à distância devido à:",
    options: ["Fusão", "Decantação", "Difusão", "Solidificação"],
    answer: 2,
    explanation: "As partículas do perfume se espalham pelo ar."
  },
  {
    level: "Fácil",
    question: "Quando a água ferve e se transforma em vapor, ocorre:",
    options: ["Condensação", "Vaporização", "Solidificação", "Fusão"],
    answer: 1,
    explanation: "Vaporização é a passagem do líquido para o gasoso."
  },
  {
    level: "Fácil",
    question: "Quando o sal desaparece visualmente ao ser colocado na água, ocorre:",
    options: ["Combustão", "Dissolução", "Oxidação", "Solidificação"],
    answer: 1,
    explanation: "O sal se dissolve, formando uma mistura homogênea."
  },
  {
    level: "Fácil",
    question: "Por que alimentos duram mais na geladeira?",
    options: ["O frio elimina tudo", "Diminui a velocidade de reações e o crescimento microbiano", "Os alimentos perdem toda a água", "Ocorre combustão"],
    answer: 1,
    explanation: "A baixa temperatura desacelera processos de deterioração."
  },
  {
    level: "Fácil",
    question: "Qual gás do ar é essencial para a combustão de uma vela?",
    options: ["Nitrogênio", "Hidrogênio", "Oxigênio", "Hélio"],
    answer: 2,
    explanation: "O oxigênio participa da reação de combustão."
  },
  {
    level: "Fácil",
    question: "As roupas secam mesmo sem sol direto porque ocorre:",
    options: ["Evaporação", "Congelamento", "Combustão", "Fusão"],
    answer: 0,
    explanation: "A água evapora lentamente, passando para o estado gasoso."
  },
  {
    level: "Fácil",
    question: "A ferrugem formada em objetos de ferro é resultado de:",
    options: ["Transformação química", "Transformação nuclear", "Fusão", "Dissolução"],
    answer: 0,
    explanation: "O ferro reage com oxigênio e água, formando ferrugem."
  },
  {
    level: "Médio",
    question: "Por que o açúcar se dissolve mais rapidamente em água quente?",
    options: ["O açúcar desaparece", "As partículas se movimentam mais rapidamente", "A água fica apolar", "O açúcar vira gás"],
    answer: 1,
    explanation: "O aumento da temperatura acelera a dissolução."
  },
  {
    level: "Médio",
    question: "Por que uma colher de metal esquenta dentro de uma panela?",
    options: ["Condução térmica", "Combustão", "Condensação", "Dissolução"],
    answer: 0,
    explanation: "O calor se propaga pelo metal por condução."
  },
  {
    level: "Médio",
    question: "Por que refrigerantes liberam bolhas quando são abertos?",
    options: ["O açúcar vira oxigênio", "Ocorre congelamento", "O CO₂ dissolvido sai devido à queda da pressão", "O líquido entra em combustão"],
    answer: 2,
    explanation: "A redução da pressão favorece a saída do dióxido de carbono."
  },
  {
    level: "Médio",
    question: "Qual situação representa uma transformação química?",
    options: ["Cortar papel", "Derreter gelo", "Queimar madeira", "Quebrar vidro"],
    answer: 2,
    explanation: "Na queima, novas substâncias são formadas."
  },
  {
    level: "Médio",
    question: "Por que não devemos misturar água sanitária com outros produtos de limpeza?",
    options: ["Pode liberar gases tóxicos", "Tudo congela", "Sempre vira água", "A massa desaparece"],
    answer: 0,
    explanation: "Algumas misturas podem liberar gases perigosos."
  },
  {
    level: "Médio",
    question: "Por que o álcool evapora mais rapidamente que a água?",
    options: ["Possui maior massa", "Suas interações intermoleculares são menos intensas", "É sólido", "Não possui moléculas"],
    answer: 1,
    explanation: "As forças intermoleculares influenciam a evaporação."
  },
  {
    level: "Médio",
    question: "A ferrugem se forma principalmente na presença de:",
    options: ["Oxigênio e umidade", "Hélio e luz", "Apenas nitrogênio", "Açúcar e sal"],
    answer: 0,
    explanation: "O oxigênio e a água favorecem a corrosão do ferro."
  },
  {
    level: "Médio",
    question: "Quando aquecemos uma substância, normalmente suas partículas:",
    options: ["Param de se movimentar", "Desaparecem", "Movimentam-se mais intensamente", "Viraram átomos"],
    answer: 2,
    explanation: "O aquecimento aumenta a energia cinética média das partículas."
  },
  {
    level: "Médio",
    question: "Como o detergente facilita a retirada da gordura?",
    options: ["Congelando-a", "Facilitando sua dispersão na água", "Transformando-a em metal", "Aumentando sua massa"],
    answer: 1,
    explanation: "O detergente interage com a gordura e com a água, facilitando a limpeza."
  },
  {
    level: "Médio",
    question: "Como uma pilha fornece energia para um controle remoto?",
    options: ["Por reações químicas que geram energia elétrica", "Por evaporação", "Por fusão dos metais", "Por produção de água"],
    answer: 0,
    explanation: "A pilha transforma energia química em energia elétrica."
  },
  {
    level: "Difícil",
    question: "Por que alimentos cozinham mais rápido na panela de pressão?",
    options: ["A água fica mais fria", "A pressão eleva a temperatura de ebulição da água", "Não existe vapor", "O alimento perde toda a massa"],
    answer: 1,
    explanation: "A pressão aumenta o ponto de ebulição, permitindo temperaturas maiores."
  },
  {
    level: "Difícil",
    question: "A gasolina libera energia quando queimada. Esse processo é chamado:",
    options: ["Condensação", "Combustão", "Dissolução", "Neutralização"],
    answer: 1,
    explanation: "Combustão é uma reação que libera energia."
  },
  {
    level: "Difícil",
    question: "Qual gás liberado pela queima de combustíveis contribui para o efeito estufa?",
    options: ["Oxigênio", "Hélio", "Dióxido de carbono", "Argônio"],
    answer: 2,
    explanation: "O CO₂ é um gás de efeito estufa."
  },
  {
    level: "Difícil",
    question: "20 g de sal foram dissolvidos até completar 500 mL de solução. Qual a concentração em g/L?",
    options: ["10 g/L", "20 g/L", "40 g/L", "50 g/L"],
    answer: 2,
    explanation: "20 ÷ 0,5 = 40 g/L."
  },
  {
    level: "Difícil",
    question: "A reação entre bicarbonato de sódio e vinagre libera qual gás?",
    options: ["Oxigênio", "Dióxido de carbono", "Hidrogênio", "Nitrogênio"],
    answer: 1,
    explanation: "A reação libera CO₂, formando bolhas."
  },
  {
    level: "Difícil",
    question: "Qual alternativa diferencia corretamente substância pura e mistura?",
    options: ["Substância pura tem composição definida; mistura reúne substâncias", "Mistura sempre é sólida", "Substância pura sempre é líquida", "Não há diferença"],
    answer: 0,
    explanation: "Substância pura possui composição definida; mistura contém mais de uma substância."
  },
  {
    level: "Difícil",
    question: "Por que o gelo flutua na água?",
    options: ["É mais quente", "Possui menor densidade que a água líquida", "Não possui massa", "Água líquida não tem volume"],
    answer: 1,
    explanation: "O gelo possui menor densidade que a água líquida."
  },
  {
    level: "Difícil",
    question: "Por que aumentar a temperatura pode acelerar uma reação química?",
    options: ["Elimina moléculas", "Aumenta colisões efetivas entre partículas", "Impede colisões", "Transforma reagentes em gases"],
    answer: 1,
    explanation: "Partículas com maior energia têm mais chances de realizar colisões efetivas."
  },
  {
    level: "Difícil",
    question: "Por que reciclar alumínio economiza energia?",
    options: ["O alumínio reciclado não tem átomos", "Evita parte da produção a partir do minério", "Deixa de ser metal", "Não utiliza energia"],
    answer: 1,
    explanation: "Reciclar reduz a necessidade de extrair e processar minério."
  },
  {
    level: "Difícil",
    question: "Uma lâmpada transforma energia elétrica principalmente em:",
    options: ["Energia química e nuclear", "Energia luminosa e térmica", "Energia mecânica", "Energia sonora"],
    answer: 1,
    explanation: "A lâmpada produz luz e também calor."
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
    homeMessage.textContent = "Conectado! Você pode criar ou entrar em uma partida.";
  })
  .catch(error => {
    console.error("Erro Firebase:", error);
    homeMessage.textContent = "Erro de conexão Firebase: " + error.message;
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
  const name = playerNameInput.value.trim();
  return name || "Jogador";
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

      const overlap = cells.some(cell =>
        ships.flat().includes(cell)
      );

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

  let available = questions.filter((q, i) =>
    !usedQuestions.includes(i)
  );

  const index = Math.floor(Math.random() * available.length);
  const question = available[index];

  const originalIndex = questions.indexOf(question);
  usedQuestions.push(originalIndex);

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
// RENDERIZAR
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
    turnMessage.textContent = "🎯 É sua vez! Responda à pergunta para atacar.";
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
    answerFeedback.textContent = "✅ Resposta correta! Escolha uma posição no tabuleiro adversário.";
    canAttack = true;
    questionPending = false;
    renderGame();
  } else {
    selectedButton.classList.add("wrong");
    answerFeedback.textContent = "❌ Resposta incorreta! " + q.explanation + " A vez será passada.";

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
  const myIndex = getMyIndex();

  if (opponentIndex < 0 || myIndex < 0) return;

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

      if (enemyIndex < 0) throw new Error("Adversário não encontrado.");

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
    await roomRef.update({
      turn: currentRoom.players.find(p => p.uid !== currentUser.uid).uid
    });
  } catch (error) {
    console.error(error);
  } finally {
    busy = false;
  }
}

// ==========================================
// FINAL
// ==========================================

function renderEnd() {
  const winner = currentRoom.players.find(p =>
    p.uid === currentRoom.winner
  );

  winnerMessage.textContent = winner
    ? "🏆 " + winner.name + " venceu!"
    : "🏆 Fim de jogo!";

  finalMessage.textContent =
    "Todos os navios adversários foram encontrados. Parabéns pela batalha!";
}

// ==========================================
// ERROS GERAIS
// ==========================================

window.addEventListener("error", event => {
  console.error("Erro de script:", event.message);
});