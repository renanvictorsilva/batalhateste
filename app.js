
/* =========================================================
   BATALHA DOS ALIMENTOS - QUÍMICA EM JOGO
   IFA - Tema: Alimentação
   ========================================================= */

// 1. FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDyDdj12NqEP1Hxr-rqLJ04ezLBheMuEZfqs",
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

// 2. ELEMENTOS HTML
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

// 3. VARIÁVEIS
let currentUser = null;
let currentRoomId = null;
let roomUnsubscribe = null;
let roomData = null;

let currentQuestion = null;
let answeredQuestionIds = [];

let canAttack = false;
let busy = false;
let questionPending = false;

// 4. BANCO DE QUESTÕES
const questions = [
  {
    id: 1,
    level: "FÁCIL",
    question: "Qual nutriente é a principal fonte de energia rápida para o organismo?",
    options: ["Vitaminas", "Carboidratos", "Água", "Sais minerais"],
    answer: 1,
    explanation: "Os carboidratos são uma importante fonte de energia para o organismo."
  },
  {
    id: 2,
    level: "FÁCIL",
    question: "Qual nutriente fornece aproximadamente 9 kcal por grama?",
    options: ["Carboidrato", "Proteína", "Lipídio", "Vitamina C"],
    answer: 2,
    explanation: "Os lipídios fornecem aproximadamente 9 kcal por grama."
  },
  {
    id: 3,
    level: "FÁCIL",
    question: "Qual nutriente é importante para a construção e reparação dos tecidos?",
    options: ["Proteínas", "Água", "Carboidratos", "Sais minerais"],
    answer: 0,
    explanation: "As proteínas participam da construção e reparação dos tecidos."
  },
  {
    id: 4,
    level: "FÁCIL",
    question: "Qual destas substâncias não fornece energia diretamente?",
    options: ["Carboidratos", "Lipídios", "Proteínas", "Vitaminas"],
    answer: 3,
    explanation: "Vitaminas não fornecem energia, mas são essenciais para o metabolismo."
  },
  {
    id: 5,
    level: "FÁCIL",
    question: "A água é importante para o organismo porque:",
    options: [
      "Fornece grande quantidade de calorias",
      "Participa de reações e transportes no organismo",
      "Substitui todos os nutrientes",
      "É fonte de gordura"
    ],
    answer: 1,
    explanation: "A água participa do transporte de substâncias e de diversas reações."
  },
  {
    id: 6,
    level: "FÁCIL",
    question: "Qual destes alimentos é uma fonte importante de proteínas?",
    options: ["Refrigerante", "Açúcar", "Ovo", "Óleo"],
    answer: 2,
    explanation: "O ovo contém proteínas."
  },
  {
    id: 7,
    level: "FÁCIL",
    question: "O consumo de fibras alimentares contribui principalmente para:",
    options: [
      "A saúde intestinal",
      "Aumentar o açúcar dos alimentos",
      "Eliminar toda a água do organismo",
      "Substituir proteínas"
    ],
    answer: 0,
    explanation: "As fibras ajudam no funcionamento intestinal."
  },
  {
    id: 8,
    level: "FÁCIL",
    question: "Qual destes alimentos costuma apresentar maior quantidade de açúcar?",
    options: ["Água", "Refrigerante comum", "Alface", "Ovo cozido"],
    answer: 1,
    explanation: "Refrigerantes convencionais geralmente apresentam grande quantidade de açúcar."
  },
  {
    id: 9,
    level: "FÁCIL",
    question: "A energia dos alimentos geralmente é expressa em:",
    options: ["Metros", "Litros", "Quilocalorias", "Graus Celsius"],
    answer: 2,
    explanation: "O valor energético pode ser expresso em quilocalorias (kcal)."
  },
  {
    id: 10,
    level: "FÁCIL",
    question: "Qual grupo de alimentos é fonte de vitaminas e minerais?",
    options: ["Frutas e verduras", "Óleos", "Balas", "Refrigerantes"],
    answer: 0,
    explanation: "Frutas e verduras fornecem vitaminas e minerais importantes."
  },

  {
    id: 11,
    level: "MÉDIO",
    question: "Um alimento contém 10 g de carboidratos. Considerando 4 kcal/g, qual a energia fornecida?",
    options: ["10 kcal", "20 kcal", "40 kcal", "90 kcal"],
    answer: 2,
    explanation: "10 × 4 = 40 kcal."
  },
  {
    id: 12,
    level: "MÉDIO",
    question: "Um alimento possui 20 g de carboidratos, 5 g de proteínas e 8 g de lipídios. Qual seu valor energético?",
    options: ["132 kcal", "152 kcal", "172 kcal", "192 kcal"],
    answer: 2,
    explanation: "20×4 + 5×4 + 8×9 = 172 kcal."
  },
  {
    id: 13,
    level: "MÉDIO",
    question: "Por que devemos observar a lista de ingredientes de um produto?",
    options: [
      "Ela mostra os ingredientes utilizados, geralmente em ordem decrescente de quantidade",
      "Ela apresenta somente as calorias",
      "Ela informa apenas o preço",
      "Ela é apenas decorativa"
    ],
    answer: 0,
    explanation: "A lista de ingredientes ajuda a conhecer a composição do produto."
  },
  {
    id: 14,
    level: "MÉDIO",
    question: "O que caracteriza um alimento ultraprocessado?",
    options: [
      "Ser necessariamente orgânico",
      "Possuir somente ingredientes naturais",
      "Ser produzido exclusivamente em casa",
      "Ser uma formulação industrial com diversos ingredientes e aditivos"
    ],
    answer: 3,
    explanation: "Ultraprocessados são formulações industriais, frequentemente com vários ingredientes e aditivos."
  },
  {
    id: 15,
    level: "MÉDIO",
    question: "O consumo excessivo de açúcar pode contribuir para:",
    options: [
      "Melhorar sempre a saúde",
      "Problemas de saúde quando associado a hábitos inadequados",
      "Eliminar a necessidade de água",
      "Substituir todas as vitaminas"
    ],
    answer: 1,
    explanation: "O consumo excessivo de açúcar pode contribuir para problemas de saúde."
  },
  {
    id: 16,
    level: "MÉDIO",
    question: "Qual alternativa representa uma refeição mais equilibrada?",
    options: [
      "Refrigerante e salgadinho",
      "Somente doces",
      "Arroz, feijão, legumes e uma fonte de proteína",
      "Apenas café"
    ],
    answer: 2,
    explanation: "A combinação de diferentes grupos alimentares contribui para uma alimentação variada."
  },
  {
    id: 17,
    level: "MÉDIO",
    question: "A anemia por deficiência de ferro está relacionada principalmente:",
    options: [
      "À falta de ferro para a produção adequada de hemoglobina",
      "Ao excesso de água",
      "Ao consumo de fibras",
      "À falta de carboidratos"
    ],
    answer: 0,
    explanation: "O ferro é essencial para a formação da hemoglobina."
  },
  {
    id: 18,
    level: "MÉDIO",
    question: "O que significa balanço energético?",
    options: [
      "A quantidade de água consumida",
      "A relação entre energia consumida e energia gasta",
      "A quantidade de vitaminas",
      "O peso de todos os alimentos"
    ],
    answer: 1,
    explanation: "O balanço energético relaciona a energia ingerida e a energia utilizada pelo organismo."
  },
  {
    id: 19,
    level: "MÉDIO",
    question: "Qual atitude ajuda a reduzir o desperdício de alimentos?",
    options: [
      "Servir mais do que será consumido",
      "Descartar alimentos sem verificar",
      "Planejar refeições e aproveitar alimentos adequadamente",
      "Comprar sem planejamento"
    ],
    answer: 2,
    explanation: "Planejamento e aproveitamento adequado ajudam a reduzir desperdícios."
  },
  {
    id: 20,
    level: "MÉDIO",
    question: "O sal de cozinha contém principalmente:",
    options: ["Cloreto de sódio", "Glicose", "Etanol", "Ácido acético"],
    answer: 0,
    explanation: "O sal de cozinha é constituído principalmente por cloreto de sódio (NaCl)."
  },

  {
    id: 21,
    level: "DIFÍCIL",
    question: "Um alimento possui 30 g de carboidratos, 6 g de proteínas e 10 g de lipídios. Qual o valor energético aproximado?",
    options: ["184 kcal", "214 kcal", "234 kcal", "294 kcal"],
    answer: 2,
    explanation: "30×4 + 6×4 + 10×9 = 234 kcal."
  },
  {
    id: 22,
    level: "DIFÍCIL",
    question: "Por que dois produtos de mesma massa podem apresentar valores calóricos diferentes?",
    options: [
      "Porque possuem proporções diferentes de nutrientes energéticos",
      "Porque todos possuem calorias iguais",
      "Porque a embalagem altera diretamente a energia",
      "Porque a massa não tem relação com alimentos"
    ],
    answer: 0,
    explanation: "A composição em carboidratos, proteínas e lipídios influencia o valor energético."
  },
  {
    id: 23,
    level: "DIFÍCIL",
    question: "O excesso de sódio na alimentação está associado principalmente a:",
    options: [
      "Aumento da vitamina C",
      "Redução de todas as calorias",
      "Maior risco de problemas relacionados à pressão arterial",
      "Produção de proteínas"
    ],
    answer: 2,
    explanation: "O consumo excessivo de sódio pode contribuir para a hipertensão."
  },
  {
    id: 24,
    level: "DIFÍCIL",
    question: "Qual situação representa uma escolha mais consciente ao comparar dois alimentos?",
    options: [
      "Escolher sempre a embalagem mais bonita",
      "Comparar ingredientes, porção, nutrientes e contexto de consumo",
      "Escolher somente pelo preço",
      "Ignorar o rótulo"
    ],
    answer: 1,
    explanation: "A análise de rótulos e da composição permite escolhas mais informadas."
  },
  {
    id: 25,
    level: "DIFÍCIL",
    question: "A digestão dos alimentos permite:",
    options: [
      "Que nutrientes sejam quebrados e processados para absorção",
      "Que o alimento permaneça sempre igual",
      "Que toda a energia seja eliminada",
      "Que a água deixe de ser necessária"
    ],
    answer: 0,
    explanation: "A digestão envolve processos que tornam nutrientes disponíveis para absorção."
  },
  {
    id: 26,
    level: "DIFÍCIL",
    question: "Qual alternativa apresenta uma consequência possível do desperdício de alimentos?",
    options: [
      "Redução automática da poluição",
      "Diminuição dos recursos usados na produção",
      "Desperdício de água, energia, solo e trabalho envolvidos na produção",
      "Aumento da disponibilidade de alimentos"
    ],
    answer: 2,
    explanation: "O desperdício também significa desperdiçar recursos usados para produzir alimentos."
  },
  {
    id: 27,
    level: "DIFÍCIL",
    question: "A lactose é:",
    options: ["Um lipídio", "Um açúcar presente no leite", "Uma vitamina", "Um mineral"],
    answer: 1,
    explanation: "Lactose é um carboidrato, especificamente um dissacarídeo presente no leite."
  },
  {
    id: 28,
    level: "DIFÍCIL",
    question: "Por que a tabela nutricional deve ser analisada considerando a porção indicada?",
    options: [
      "Porque os valores se referem à quantidade indicada e podem variar conforme o consumo",
      "Porque a porção não tem importância",
      "Porque todas as embalagens têm a mesma quantidade",
      "Porque os valores são sempre para o pacote inteiro"
    ],
    answer: 0,
    explanation: "A comparação exige observar a porção de referência e quanto será consumido."
  },
  {
    id: 29,
    level: "DIFÍCIL",
    question: "Qual processo libera energia a partir de moléculas orgânicas no organismo?",
    options: ["Somente congelamento", "Respiração celular", "Filtração", "Evaporação"],
    answer: 1,
    explanation: "A respiração celular libera energia a partir de moléculas orgânicas."
  },
  {
    id: 30,
    level: "DIFÍCIL",
    question: "Uma alimentação saudável deve:",
    options: [
      "Excluir obrigatoriamente todos os carboidratos",
      "Ser baseada apenas em um alimento",
      "Considerar variedade, equilíbrio e necessidades individuais",
      "Ser igual para todas as pessoas"
    ],
    answer: 2,
    explanation: "Alimentação adequada depende de variedade, equilíbrio e necessidades individuais."
  }
];

// 5. FUNÇÕES DE APOIO
function showScreen(screen) {
  [homeScreen, lobbyScreen, gameScreen, endScreen].forEach(s => {
    s.classList.add("hidden");
  });
  screen.classList.remove("hidden");
}

function createCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function makeBoard() {
  return Array(64).fill(0);
}

function placeShips() {
  const board = makeBoard();
  const ships = [3, 2, 2];

  ships.forEach(size => {
    let placed = false;

    while (!placed) {
      const horizontal = Math.random() < 0.5;
      const row = Math.floor(Math.random() * 8);
      const col = Math.floor(Math.random() * 8);
      const positions = [];

      for (let i = 0; i < size; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;

        if (r >= 8 || c >= 8) {
          positions.length = 0;
          break;
        }

        positions.push(r * 8 + c);
      }

      if (positions.length && positions.every(p => board[p] === 0)) {
        positions.forEach(p => board[p] = 1);
        placed = true;
      }
    }
  });

  return board;
}

function getPlayerIndex(data) {
  return data.players.findIndex(p => p.uid === currentUser.uid);
}

function getOpponentIndex(data) {
  return data.players.findIndex(p => p.uid !== currentUser.uid);
}

function getMe(data) {
  return data.players[getPlayerIndex(data)];
}

function getOpponent(data) {
  return data.players[getOpponentIndex(data)];
}

function getRoomRef() {
  return db.collection("rooms").doc(currentRoomId);
}

function isMyTurn() {
  return roomData && currentUser &&
    roomData.currentTurn === currentUser.uid;
}

function randomQuestion() {
  const remaining = questions.filter(
    q => !answeredQuestionIds.includes(q.id)
  );

  if (remaining.length === 0) {
    answeredQuestionIds = [];
    return questions[Math.floor(Math.random() * questions.length)];
  }

  const q = remaining[Math.floor(Math.random() * remaining.length)];
  answeredQuestionIds.push(q.id);
  return q;
}

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

// 6. AUTENTICAÇÃO
auth.signInAnonymously()
  .then(result => {
    currentUser = result.user;
    console.log("Firebase conectado.");
  })
  .catch(error => {
    console.error("Erro Firebase:", error);
    homeMessage.textContent =
      "Erro ao conectar ao Firebase. Confira sua API Key e autenticação.";
  });

// 7. CRIAR SALA
createRoomBtn.addEventListener("click", async () => {
  const name = playerNameInput.value.trim();

  if (!name) {
    homeMessage.textContent = "Digite seu nome antes de criar a partida.";
    return;
  }

  if (!currentUser) {
    homeMessage.textContent = "Conectando ao Firebase. Aguarde...";
    return;
  }

  createRoomBtn.disabled = true;

  try {
    const code = createCode();
    currentRoomId = code;

    const player = {
      uid: currentUser.uid,
      name,
      board: placeShips(),
      hits: [],
      misses: []
    };

    await db.collection("rooms").doc(code).set({
      code,
      status: "waiting",
      players: [player],
      currentTurn: currentUser.uid,
      winner: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    enterLobby(code);
  } catch (error) {
    console.error(error);
    homeMessage.textContent = "Não foi possível criar a partida.";
  } finally {
    createRoomBtn.disabled = false;
  }
});

// 8. ENTRAR NA SALA
joinRoomBtn.addEventListener("click", async () => {
  const name = playerNameInput.value.trim();
  const code = roomCodeInput.value.trim().toUpperCase();

  if (!name) {
    homeMessage.textContent = "Digite seu nome.";
    return;
  }

  if (!code) {
    homeMessage.textContent = "Digite o código da sala.";
    return;
  }

  if (!currentUser) {
    homeMessage.textContent = "Conectando ao Firebase. Aguarde...";
    return;
  }

  joinRoomBtn.disabled = true;

  try {
    const ref = db.collection("rooms").doc(code);
    const snap = await ref.get();

    if (!snap.exists) {
      homeMessage.textContent = "Sala não encontrada.";
      return;
    }

    const data = snap.data();

    if (data.status !== "waiting") {
      homeMessage.textContent = "Esta partida já começou ou terminou.";
      return;
    }

    if (data.players.length >= 2) {
      homeMessage.textContent = "Esta sala já está cheia.";
      return;
    }

    if (data.players.some(p => p.uid === currentUser.uid)) {
      enterLobby(code);
      return;
    }

    const player = {
      uid: currentUser.uid,
      name,
      board: placeShips(),
      hits: [],
      misses: []
    };

    await ref.update({
      players: firebase.firestore.FieldValue.arrayUnion(player),
      status: "playing",
      currentTurn: data.players[0].uid
    });

    enterLobby(code);
  } catch (error) {
    console.error(error);
    homeMessage.textContent = "Erro ao entrar na sala.";
  } finally {
    joinRoomBtn.disabled = false;
  }
});

// 9. SALA DE ESPERA / MONITORAMENTO
function enterLobby(code) {
  currentRoomId = code;
  roomCodeDisplay.textContent = code;
  showScreen(lobbyScreen);

  if (roomUnsubscribe) {
    roomUnsubscribe();
  }

  roomUnsubscribe = getRoomRef().onSnapshot(snapshot => {
    if (!snapshot.exists) return;

    roomData = snapshot.data();

    updateLobby();

    if (roomData.status === "playing") {
      showScreen(gameScreen);
      renderGame();
    }

    if (roomData.status === "finished") {
      showEndGame();
    }
  }, error => {
    console.error(error);
    lobbyStatus.textContent = "Erro ao acompanhar a partida.";
  });
}

function updateLobby() {
  if (!roomData) return;

  roomCodeDisplay.textContent = roomData.code;

  playersList.innerHTML = roomData.players
    .map(p => `<p>👤 ${escapeHTML(p.name)}</p>`)
    .join("");

  lobbyStatus.textContent = roomData.players.length < 2
    ? "Aguardando o segundo jogador..."
    : "Os jogadores estão prontos!";
}

// 10. COPIAR CÓDIGO DA SALA
copyCodeBtn.addEventListener("click", async () => {
  if (!currentRoomId) return;

  try {
    await navigator.clipboard.writeText(currentRoomId);
    copyCodeBtn.textContent = "✅ Código copiado!";

    setTimeout(() => {
      copyCodeBtn.textContent = "📋 Copiar código";
    }, 1500);
  } catch (error) {
    alert("Código da sala: " + currentRoomId);
  }
});

// 11. DESENHAR TABULEIROS
function renderGame() {
  if (!roomData || roomData.players.length !== 2 || !currentUser) return;

  const me = getMe(roomData);
  const opponent = getOpponent(roomData);

  if (!me || !opponent) return;

  myBoard.innerHTML = "";
  enemyBoard.innerHTML = "";

  for (let i = 0; i < 64; i++) {
    // TABULEIRO DO JOGADOR
    const myCell = document.createElement("div");
    myCell.className = "cell";

    if (me.board[i] === 1) {
      myCell.classList.add("ship-cell");
      myCell.textContent = "🚢";
    }

    if (me.hits.includes(i)) {
      myCell.classList.remove("ship-cell");
      myCell.classList.add("hit-cell");
      myCell.textContent = "💥";
    }

    if (me.misses.includes(i)) {
      myCell.classList.add("miss-cell");
      myCell.textContent = "•";
    }

    myBoard.appendChild(myCell);

    // TABULEIRO DO ADVERSÁRIO
    const enemyCell = document.createElement("div");
    enemyCell.className = "cell enemy-cell";

    if (opponent.hits.includes(i)) {
      enemyCell.classList.add("hit-cell");
      enemyCell.textContent = "💥";
    }

    if (opponent.misses.includes(i)) {
      enemyCell.classList.add("miss-cell");
      enemyCell.textContent = "•";
    }

    enemyCell.addEventListener("click", () => selectTarget(i));

    if (
      !isMyTurn() ||
      !canAttack ||
      busy ||
      opponent.hits.includes(i) ||
      opponent.misses.includes(i)
    ) {
      enemyCell.style.cursor = "default";
    }

    enemyBoard.appendChild(enemyCell);
  }

  updateTurnInfo();

  // Exibe uma pergunta automaticamente quando for a vez do jogador
  if (
    isMyTurn() &&
    questionArea.classList.contains("hidden") &&
    !busy &&
    !questionPending
  ) {
    startQuestion();
  }
}

function updateTurnInfo() {
  if (!roomData) return;

  if (isMyTurn()) {
    turnMessage.textContent = "🟢 Sua vez!";
    gameStatus.textContent = "Responda corretamente para liberar seu ataque.";
  } else {
    turnMessage.textContent = "🟡 Vez do adversário";
    gameStatus.textContent = "Aguarde seu adversário responder.";
  }
}

// 12. PERGUNTA
function startQuestion() {
  if (!isMyTurn() || busy || questionPending) return;

  questionPending = true;
  currentQuestion = randomQuestion();
  canAttack = false;

  questionArea.classList.remove("hidden");
  questionLevel.textContent = currentQuestion.level;
  questionText.textContent = currentQuestion.question;

  answerOptions.innerHTML = "";
  answerFeedback.textContent = "";
  gameMessage.textContent = "";

  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.textContent = `${String.fromCharCode(65 + index)}) ${option}`;

    button.addEventListener("click", () => answerQuestion(index));

    answerOptions.appendChild(button);
  });
}

// 13. RESPONDER
async function answerQuestion(index) {
  if (!currentQuestion || busy || !isMyTurn()) return;

  busy = true;

  Array.from(answerOptions.children).forEach(button => {
    button.disabled = true;
  });

  const correct = index === currentQuestion.answer;

  if (correct) {
    answerFeedback.textContent =
      "✅ Resposta correta! Você liberou seu ataque!";
    answerFeedback.style.color = "#228a55";

    canAttack = true;
    busy = false;

    gameMessage.textContent =
      "🎯 Clique em uma posição do tabuleiro adversário.";
  } else {
    answerFeedback.textContent =
      "❌ Resposta incorreta! " + currentQuestion.explanation;
    answerFeedback.style.color = "#d05243";

    canAttack = false;
    gameMessage.textContent = "Sua vez será passada ao adversário.";

    setTimeout(async () => {
      await passTurn();
      questionArea.classList.add("hidden");
      questionPending = false;
      busy = false;
    }, 2200);
  }
}

// 14. ATAQUE
async function selectTarget(index) {
  if (!canAttack || busy || !isMyTurn()) return;

  const opponent = getOpponent(roomData);

  if (
    opponent.hits.includes(index) ||
    opponent.misses.includes(index)
  ) {
    gameMessage.textContent =
      "Você já atacou essa posição. Escolha outra.";
    return;
  }

  busy = true;
  canAttack = false;

  try {
    await db.runTransaction(async transaction => {
      const ref = getRoomRef();
      const snap = await transaction.get(ref);

      if (!snap.exists) {
        throw new Error("Partida não encontrada.");
      }

      const data = snap.data();

      if (data.currentTurn !== currentUser.uid) {
        throw new Error("Não é sua vez.");
      }

      const meIndex = data.players.findIndex(
        p => p.uid === currentUser.uid
      );

      const enemyIndex = data.players.findIndex(
        p => p.uid !== currentUser.uid
      );

      const updatedPlayers = data.players.map(p => ({
        ...p,
        hits: [...(p.hits || [])],
        misses: [...(p.misses || [])]
      }));

      const enemy = updatedPlayers[enemyIndex];
      const hit = enemy.board[index] === 1;

      if (hit) {
        enemy.hits.push(index);
      } else {
        enemy.misses.push(index);
      }

      const shipPositions = enemy.board
        .map((value, i) => value === 1 ? i : -1)
        .filter(i => i !== -1);

      const allShipsHit = shipPositions.every(
        position => enemy.hits.includes(position)
      );

      transaction.update(ref, {
        players: updatedPlayers,
        currentTurn: allShipsHit
          ? currentUser.uid
          : data.players[enemyIndex].uid,
        status: allShipsHit ? "finished" : "playing",
        winner: allShipsHit ? currentUser.uid : null
      });
    });

    questionArea.classList.add("hidden");
    questionPending = false;
    gameMessage.textContent = "⚓ Ataque realizado!";
  } catch (error) {
    console.error(error);
    gameMessage.textContent = error.message || "Erro ao realizar ataque.";
  } finally {
    busy = false;
  }
}

// 15. PASSAR TURNO
async function passTurn() {
  try {
    const snap = await getRoomRef().get();

    if (!snap.exists) return;

    const data = snap.data();

    if (data.currentTurn !== currentUser.uid) return;

    const opponent = data.players.find(
      p => p.uid !== currentUser.uid
    );

    if (!opponent) return;

    await getRoomRef().update({
      currentTurn: opponent.uid
    });
  } catch (error) {
    console.error("Erro ao passar turno:", error);
  }
}

// 16. FIM DE JOGO
function showEndGame() {
  showScreen(endScreen);

  const winner = roomData.players.find(
    p => p.uid === roomData.winner
  );

  const loser = roomData.players.find(
    p => p.uid !== roomData.winner
  );

  winnerMessage.textContent = winner
    ? `🏆 ${winner.name} venceu a Batalha dos Alimentos!`
    : "Fim de jogo!";

  finalMessage.textContent = loser
    ? `${loser.name}, continue estudando Química e tente novamente!`
    : "Parabéns pela partida!";
}
