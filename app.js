
const firebaseConfig = {
  apiKey: "AIzaSyDdj12NqEP1Hxr-rqlJO4ezLBheEZfqs",
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

const $ = id => document.getElementById(id);

let currentUser = null;
let currentRoom = null;
let roomUnsubscribe = null;
let currentRoomId = null;

let selectedShipIndex = 0;
let ships = [
  { size: 3, name: "Barco de 3 casas", cells: [] },
  { size: 2, name: "Barco de 2 casas", cells: [] },
  { size: 2, name: "Barco de 2 casas", cells: [] }
];

let orientation = "horizontal";
let selectedAttack = null;
let currentQuestion = null;
let answered = false;

const BOARD_SIZE = 8;

const QUESTIONS = [
  {
    level: "Fácil",
    topic: "Água",
    question: "Qual é a fórmula química da água?",
    options: ["CO₂", "H₂O", "O₂", "NaCl"],
    answer: 1
  },
  {
    level: "Fácil",
    topic: "Água",
    question: "Qual é a principal fonte de água para rios e lagos?",
    options: ["Chuva", "Petróleo", "Vento", "Minérios"],
    answer: 0
  },
  {
    level: "Fácil",
    topic: "Conservação",
    question: "Qual atitude ajuda a economizar água?",
    options: [
      "Deixar a torneira aberta",
      "Lavar calçadas diariamente",
      "Fechar a torneira ao escovar os dentes",
      "Tomar banhos mais longos"
    ],
    answer: 2
  },
  {
    level: "Fácil",
    topic: "Água potável",
    question: "O que significa água potável?",
    options: [
      "Água com sal",
      "Água própria para consumo humano",
      "Água de qualquer rio",
      "Água com resíduos"
    ],
    answer: 1
  },
  {
    level: "Fácil",
    topic: "Ciclo da água",
    question: "Como se chama a passagem da água líquida para vapor?",
    options: ["Condensação", "Solidificação", "Evaporação", "Fusão"],
    answer: 2
  },
  {
    level: "Fácil",
    topic: "Poluição",
    question: "Qual ação polui diretamente os rios?",
    options: [
      "Preservar as matas",
      "Descartar lixo na água",
      "Economizar água",
      "Reutilizar materiais"
    ],
    answer: 1
  },
  {
    level: "Fácil",
    topic: "Ciclo da água",
    question: "A água das nuvens retorna à superfície principalmente por meio de:",
    options: ["Precipitação", "Combustão", "Filtração", "Fusão"],
    answer: 0
  },
  {
    level: "Fácil",
    topic: "Conservação",
    question: "Uma torneira pingando pode:",
    options: [
      "Economizar água",
      "Aumentar o desperdício de água",
      "Purificar a água",
      "Diminuir a poluição do ar"
    ],
    answer: 1
  },
  {
    level: "Fácil",
    topic: "Saneamento",
    question: "Qual é a importância do tratamento de esgoto?",
    options: [
      "Aumentar a poluição",
      "Devolver resíduos aos rios",
      "Reduzir a contaminação da água",
      "Produzir água salgada"
    ],
    answer: 2
  },
  {
    level: "Fácil",
    topic: "Água",
    question: "Qual estado físico da água encontramos no gelo?",
    options: ["Gasoso", "Líquido", "Plasma", "Sólido"],
    answer: 3
  },

  {
    level: "Médio",
    topic: "Ciclo da água",
    question: "O que acontece durante a condensação?",
    options: [
      "O vapor se transforma em líquido",
      "O gelo vira vapor",
      "A água desaparece",
      "O líquido vira sólido"
    ],
    answer: 0
  },
  {
    level: "Médio",
    topic: "Ciclo da água",
    question: "Qual é o papel da vegetação no ciclo da água?",
    options: [
      "Impedir toda a chuva",
      "Contribuir para a evapotranspiração",
      "Eliminar os rios",
      "Transformar água em petróleo"
    ],
    answer: 1
  },
  {
    level: "Médio",
    topic: "Água subterrânea",
    question: "Onde parte da água da chuva pode ficar armazenada?",
    options: [
      "Apenas nas nuvens",
      "Dentro do Sol",
      "Nos aquíferos",
      "No espaço"
    ],
    answer: 2
  },
  {
    level: "Médio",
    topic: "Saneamento",
    question: "Qual processo pode remover partículas sólidas da água?",
    options: ["Filtração", "Combustão", "Fermentação", "Oxidação do plástico"],
    answer: 0
  },
  {
    level: "Médio",
    topic: "Conservação",
    question: "O que é uma bacia hidrográfica?",
    options: [
      "Uma piscina artificial",
      "Uma área drenada por um rio e seus afluentes",
      "Uma estação de tratamento",
      "Um reservatório de água salgada"
    ],
    answer: 1
  },
  {
    level: "Médio",
    topic: "Poluição",
    question: "O excesso de fertilizantes em rios pode provocar:",
    options: [
      "Aumento da potabilidade",
      "Desaparecimento da água",
      "Eutrofização",
      "Congelamento imediato"
    ],
    answer: 2
  },
  {
    level: "Médio",
    topic: "Conservação",
    question: "Por que a vegetação nas margens dos rios é importante?",
    options: [
      "Ajuda a proteger o solo e reduzir erosão",
      "Aumenta o lixo no rio",
      "Impede a vida aquática",
      "Aumenta a salinidade"
    ],
    answer: 0
  },
  {
    level: "Médio",
    topic: "Água potável",
    question: "Por que a água transparente não é necessariamente potável?",
    options: [
      "Porque pode conter microrganismos ou substâncias invisíveis",
      "Porque toda água transparente é salgada",
      "Porque a água não tem cor",
      "Porque a transparência indica congelamento"
    ],
    answer: 0
  },
  {
    level: "Médio",
    topic: "Consumo",
    question: "O que é água virtual?",
    options: [
      "Água criada por computador",
      "Água invisível no ambiente",
      "Água utilizada na produção de bens e alimentos",
      "Água encontrada apenas no espaço"
    ],
    answer: 2
  },
  {
    level: "Médio",
    topic: "Conservação",
    question: "Qual prática pode reduzir o consumo de água em uma residência?",
    options: [
      "Reutilizar água quando apropriado",
      "Deixar mangueira aberta",
      "Lavar roupa com pouca carga",
      "Ignorar vazamentos"
    ],
    answer: 0
  },

  {
    level: "Difícil",
    topic: "Água virtual",
    question: "Por que a produção de carne pode apresentar elevado consumo de água virtual?",
    options: [
      "Porque os animais não bebem água",
      "Porque envolve água para criação e produção de alimentos",
      "Porque a carne é feita de água pura",
      "Porque não utiliza agricultura"
    ],
    answer: 1
  },
  {
    level: "Difícil",
    topic: "Poluição",
    question: "O que pode ocorrer quando há excesso de nutrientes em um lago?",
    options: [
      "Eutrofização e redução do oxigênio dissolvido",
      "Aumento permanente da potabilidade",
      "Eliminação de todas as algas",
      "Congelamento do lago"
    ],
    answer: 0
  },
  {
    level: "Difícil",
    topic: "Saneamento",
    question: "Qual é uma consequência possível do despejo de esgoto sem tratamento?",
    options: [
      "Melhoria da biodiversidade",
      "Redução de doenças",
      "Contaminação da água e riscos à saúde",
      "Aumento da água potável"
    ],
    answer: 2
  },
  {
    level: "Difícil",
    topic: "Ciclo da água",
    question: "Como o desmatamento pode afetar o ciclo da água?",
    options: [
      "Pode reduzir a evapotranspiração e alterar o regime de chuvas",
      "Não interfere em nenhum processo",
      "Transforma toda água em gelo",
      "Elimina a evaporação dos oceanos"
    ],
    answer: 0
  },
  {
    level: "Difícil",
    topic: "Água subterrânea",
    question: "O que pode comprometer a qualidade dos aquíferos?",
    options: [
      "Proteção das áreas de recarga",
      "Contaminação por produtos químicos",
      "Plantio de árvores",
      "Uso racional da água"
    ],
    answer: 1
  },
  {
    level: "Difícil",
    topic: "Consumo",
    question: "O conceito de pegada hídrica considera:",
    options: [
      "Somente a água usada para beber",
      "Somente a água das chuvas",
      "A água direta e indireta associada a produtos e atividades",
      "Somente água de rios"
    ],
    answer: 2
  },
  {
    level: "Difícil",
    topic: "Conservação",
    question: "Por que a impermeabilização do solo urbano pode aumentar enchentes?",
    options: [
      "Porque reduz a infiltração da água no solo",
      "Porque aumenta a evaporação em 100%",
      "Porque elimina todos os rios",
      "Porque transforma água em gás"
    ],
    answer: 0
  },
  {
    level: "Difícil",
    topic: "Poluição",
    question: "O que é bioacumulação?",
    options: [
      "Redução de água nos oceanos",
      "Acúmulo de substâncias contaminantes nos organismos",
      "Filtração de água em rochas",
      "Produção de água potável"
    ],
    answer: 1
  },
  {
    level: "Difícil",
    topic: "Tratamento",
    question: "Por que a desinfecção é uma etapa importante no tratamento de água?",
    options: [
      "Para aumentar a quantidade de areia",
      "Para eliminar ou inativar microrganismos patogênicos",
      "Para tornar a água salgada",
      "Para aumentar a turbidez"
    ],
    answer: 1
  },
  {
    level: "Difícil",
    topic: "Recursos hídricos",
    question: "O que significa uso sustentável da água?",
    options: [
      "Utilizar toda a água disponível",
      "Usar água sem planejamento",
      "Atender às necessidades atuais sem comprometer sua disponibilidade futura",
      "Evitar qualquer uso da água"
    ],
    answer: 2
  }
];

// ---------------------------
// UTILS
// ---------------------------

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });

  $(screenId)?.classList.remove("hidden");
}

function showMessage(elementId, message, type = "") {
  const el = $(elementId);
  if (!el) return;

  el.textContent = message;
  el.className = "message";

  if (type) el.classList.add(type);
}

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function getOpponent(room) {
  return room.players.find(player => player.uid !== currentUser.uid);
}

function getMyPlayer(room) {
  return room.players.find(player => player.uid === currentUser.uid);
}

function cellsToKey(cells) {
  return cells.map(c => `${c.row}-${c.col}`);
}

function isCellOccupied(cells, row, col) {
  return cells.some(c => c.row === row && c.col === col);
}

function allShipsPlaced() {
  return ships.every(ship => ship.cells.length === ship.size);
}

function getAllShipCells() {
  return ships.flatMap(ship => ship.cells);
}

// ---------------------------
// AUTH
// ---------------------------

auth.signInAnonymously()
  .then(result => {
    currentUser = result.user;
    console.log("Firebase conectado:", currentUser.uid);
  })
  .catch(error => {
    console.error("Erro Firebase Auth:", error);
    alert("Erro ao conectar. Verifique a configuração do Firebase.");
  });

// ---------------------------
// CREATE ROOM
// ---------------------------

$("createRoomBtn")?.addEventListener("click", async () => {
  if (!currentUser) {
    showMessage("homeMessage", "Conectando ao Firebase...");
    return;
  }

  const name = $("playerName").value.trim();

  if (!name) {
    showMessage("homeMessage", "Digite seu nome.");
    return;
  }

  const roomCode = generateRoomCode();

  const room = {
    code: roomCode,
    status: "waiting",
    players: [
      {
        uid: currentUser.uid,
        name: name,
        ready: false,
        hits: 0,
        shots: 0
      }
    ],
    turn: null,
    shots: [],
    askedQuestions: [],
    questionLogs: [],
    winner: null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection("rooms").doc(roomCode).set(room);

    currentRoomId = roomCode;
    showScreen("lobbyScreen");
    listenToRoom(roomCode);
  } catch (error) {
    console.error(error);
    showMessage("homeMessage", "Não foi possível criar a sala.");
  }
});

// ---------------------------
// JOIN ROOM
// ---------------------------

$("joinRoomBtn")?.addEventListener("click", async () => {
  if (!currentUser) {
    showMessage("homeMessage", "Conectando ao Firebase...");
    return;
  }

  const name = $("playerName").value.trim();
  const roomCode = $("roomCodeInput").value.trim().toUpperCase();

  if (!name || !roomCode) {
    showMessage("homeMessage", "Digite seu nome e o código da sala.");
    return;
  }

  const roomRef = db.collection("rooms").doc(roomCode);

  try {
    const snapshot = await roomRef.get();

    if (!snapshot.exists) {
      showMessage("homeMessage", "Sala não encontrada.");
      return;
    }

    const room = snapshot.data();

    if (room.players.length >= 2) {
      showMessage("homeMessage", "Esta sala já está cheia.");
      return;
    }

    if (room.players.some(p => p.uid === currentUser.uid)) {
      currentRoomId = roomCode;
      showScreen("lobbyScreen");
      listenToRoom(roomCode);
      return;
    }

    const players = [...room.players, {
      uid: currentUser.uid,
      name: name,
      ready: false,
      hits: 0,
      shots: 0
    }];

    await roomRef.update({
      players: players,
      status: "setup"
    });

    currentRoomId = roomCode;
    showScreen("lobbyScreen");
    listenToRoom(roomCode);

  } catch (error) {
    console.error(error);
    showMessage("homeMessage", "Erro ao entrar na sala.");
  }
});

// ---------------------------
// ROOM LISTENER
// ---------------------------

function listenToRoom(roomCode) {
  if (roomUnsubscribe) roomUnsubscribe();

  roomUnsubscribe = db.collection("rooms")
    .doc(roomCode)
    .onSnapshot(snapshot => {
      if (!snapshot.exists) return;

      currentRoom = snapshot.data();
      renderRoom(currentRoom);
    });
}

function renderRoom(room) {
  $("roomCodeDisplay").textContent = room.code;

  const playersList = $("playersList");
  playersList.innerHTML = "";

  room.players.forEach((player, index) => {
    const item = document.createElement("div");
    item.className = "player-item";

    item.innerHTML = `
      <span>🌊 ${player.name}</span>
      <span>${player.ready ? "✅ Pronto" : "⏳ Aguardando"}</span>
    `;

    playersList.appendChild(item);
  });

  if (room.players.length < 2) {
    $("lobbyStatus").textContent = "Esperando outro jogador entrar...";
    showScreen("lobbyScreen");
    return;
  }

  if (room.status === "setup") {
    const me = getMyPlayer(room);

    if (me?.ready) {
      $("lobbyStatus").textContent = "Você já posicionou sua frota. Esperando o adversário...";
      showScreen("lobbyScreen");
    } else {
      showSetup();
    }

    return;
  }

  if (room.status === "playing") {
    showGame(room);
    return;
  }

  if (room.status === "finished") {
    showEnd(room);
  }
}

// ---------------------------
// LOBBY
// ---------------------------

$("copyCodeBtn")?.addEventListener("click", async () => {
  if (!currentRoomId) return;

  try {
    await navigator.clipboard.writeText(currentRoomId);
    $("copyCodeBtn").textContent = "Copiado!";
    setTimeout(() => {
      $("copyCodeBtn").textContent = "Copiar código";
    }, 1500);
  } catch {
    alert("Código da sala: " + currentRoomId);
  }
});

// ---------------------------
// SHIP PLACEMENT
// ---------------------------

function showSetup() {
  showScreen("setupScreen");
  renderFleetStatus();
  renderSetupBoard();
}

function renderFleetStatus() {
  const ids = ["ship3Status", "ship2aStatus", "ship2bStatus"];

  ships.forEach((ship, index) => {
    const el = $(ids[index]);
    if (!el) return;

    el.classList.toggle("placed", ship.cells.length === ship.size);

    if (ship.cells.length === ship.size) {
      el.textContent = `${ship.name} ✓`;
    } else {
      el.textContent = `${ship.name} (${ship.size} casas)`;
    }
  });

  selectedShipIndex = ships.findIndex(ship => ship.cells.length === 0);

  $("confirmShipsBtn").disabled = !allShipsPlaced();
}

function renderSetupBoard() {
  const board = $("setupBoard");
  if (!board) return;

  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;

  const occupied = getAllShipCells();

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;

      if (isCellOccupied(occupied, row, col)) {
        cell.classList.add("ship-cell");
        cell.textContent = "🚢";
      }

      cell.addEventListener("click", () => placeShip(row, col));

      board.appendChild(cell);
    }
  }

  renderFleetStatus();
}

function placeShip(row, col) {
  if (selectedShipIndex < 0) {
    showMessage("setupMessage", "Todos os barcos já foram posicionados.");
    return;
  }

  const ship = ships[selectedShipIndex];

  let newCells = [];

  for (let i = 0; i < ship.size; i++) {
    const r = orientation === "vertical" ? row + i : row;
    const c = orientation === "horizontal" ? col + i : col;

    if (r >= BOARD_SIZE || c >= BOARD_SIZE) {
      showMessage("setupMessage", "O barco não cabe nessa posição.");
      return;
    }

    newCells.push({ row: r, col: c });
  }

  const occupied = getAllShipCells();

  if (newCells.some(cell => isCellOccupied(occupied, cell.row, cell.col))) {
    showMessage("setupMessage", "Os barcos não podem ocupar a mesma casa.");
    return;
  }

  ship.cells = newCells;

  selectedShipIndex = ships.findIndex(s => s.cells.length === 0);

  showMessage("setupMessage", "Barco posicionado! Continue com o próximo.");

  renderSetupBoard();
}

$("rotateShipBtn")?.addEventListener("click", () => {
  orientation = orientation === "horizontal" ? "vertical" : "horizontal";

  $("rotateShipBtn").textContent =
    orientation === "horizontal" ? "↔ Horizontal" : "↕ Vertical";

  showMessage("setupMessage", `Orientação: ${orientation}`);
});

$("randomShipsBtn")?.addEventListener("click", () => {
  ships.forEach(ship => ship.cells = []);

  for (const ship of ships) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 500) {
      attempts++;

      const dir = Math.random() < 0.5 ? "horizontal" : "vertical";
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);

      const cells = [];

      for (let i = 0; i < ship.size; i++) {
        const r = dir === "vertical" ? row + i : row;
        const c = dir === "horizontal" ? col + i : col;

        if (r >= BOARD_SIZE || c >= BOARD_SIZE) break;
        cells.push({ row: r, col: c });
      }

      if (cells.length !== ship.size) continue;

      const occupied = getAllShipCells();

      if (cells.some(cell => isCellOccupied(occupied, cell.row, cell.col))) {
        continue;
      }

      ship.cells = cells;
      placed = true;
    }
  }

  showMessage("setupMessage", "Frota sorteada! Você pode confirmar ou sortear novamente.");
  renderSetupBoard();
});

$("confirmShipsBtn")?.addEventListener("click", async () => {
  if (!allShipsPlaced() || !currentRoomId) return;

  try {
    const roomRef = db.collection("rooms").doc(currentRoomId);
    const privateRef = roomRef.collection("privateBoards").doc(currentUser.uid);

    // Guarda o tabuleiro do jogador.
    await privateRef.set({
      uid: currentUser.uid,
      ships: ships.map(ship => ship.cells),
      confirmed: true
    });

    const roomSnap = await roomRef.get();
    const room = roomSnap.data();

    const players = room.players.map(player => {
      if (player.uid === currentUser.uid) {
        return { ...player, ready: true };
      }
      return player;
    });

    const allReady = players.length === 2 && players.every(player => player.ready);

    await roomRef.update({
      players,
      status: allReady ? "playing" : "setup",
      turn: allReady ? players[0].uid : null
    });

    showMessage("setupMessage", "Frota confirmada!");

  } catch (error) {
    console.error(error);
    showMessage("setupMessage", "Erro ao confirmar frota.");
  }
});

// ---------------------------
// GAME
// ---------------------------

function showGame(room) {
  showScreen("gameScreen");

  const me = getMyPlayer(room);
  const opponent = getOpponent(room);

  if (!me || !opponent) return;

  const myTurn = room.turn === currentUser.uid;

  $("turnMessage").textContent = myTurn
    ? "🎯 Sua vez!"
    : `⏳ Vez de ${opponent.name}`;

  $("gameStatus").textContent = `${me.name} × ${opponent.name}`;

  renderMyBoard(room);
  renderEnemyBoard(room);

  if (currentQuestion && !answered) {
    renderQuestion();
  } else {
    $("questionArea").classList.add("hidden");
  }
}

async function renderMyBoard(room) {
  const board = $("myBoard");
  if (!board) return;

  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;

  let myShips = [];

  try {
    const snapshot = await db.collection("rooms")
      .doc(currentRoomId)
      .collection("privateBoards")
      .doc(currentUser.uid)
      .get();

    if (snapshot.exists) {
      myShips = snapshot.data().ships.flat();
    }
  } catch (e) {
    console.error(e);
  }

  const myShipKeys = new Set(cellsToKey(myShips));

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      const key = `${row}-${col}`;

      if (myShipKeys.has(key)) {
        cell.classList.add("ship-cell");
      }

      const shot = room.shots.find(s =>
        s.targetUid === currentUser.uid &&
        s.row === row &&
        s.col === col
      );

      if (shot) {
        cell.classList.add(shot.hit ? "hit-cell" : "miss-cell");
        cell.textContent = shot.hit ? "💥" : "•";
      }

      board.appendChild(cell);
    }
  }
}

function renderEnemyBoard(room) {
  const board = $("enemyBoard");
  if (!board) return;

  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;

  const opponent = getOpponent(room);
  if (!opponent) return;

  const myTurn = room.turn === currentUser.uid;

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = document.createElement("button");
      cell.className = "cell enemy-cell";

      const shot = room.shots.find(s =>
        s.targetUid === opponent.uid &&
        s.row === row &&
        s.col === col
      );

      if (shot) {
        cell.classList.add(shot.hit ? "hit-cell" : "miss-cell");
        cell.textContent = shot.hit ? "💥" : "•";
        cell.disabled = true;
      } else {
        cell.textContent = "🌊";
        cell.disabled = !myTurn;

        cell.addEventListener("click", () => {
          if (!myTurn || selectedAttack) return;
          selectedAttack = { row, col };
          startQuestion();
        });
      }

      board.appendChild(cell);
    }
  }
}

// ---------------------------
// QUESTIONS
// ---------------------------

function startQuestion() {
  if (!selectedAttack) return;

  const room = currentRoom;
  if (!room) return;

  const available = QUESTIONS.filter(q =>
    !room.askedQuestions?.includes(q.question)
  );

  const pool = available.length ? available : QUESTIONS;

  currentQuestion = pool[Math.floor(Math.random() * pool.length)];
  answered = false;

  $("questionArea").classList.remove("hidden");
  renderQuestion();
}

function renderQuestion() {
  if (!currentQuestion) return;

  $("questionLevel").textContent = currentQuestion.level;
  $("questionText").textContent = currentQuestion.question;

  const options = $("answerOptions");
  options.innerHTML = "";

  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.textContent = option;

    button.addEventListener("click", () => answerQuestion(index));

    options.appendChild(button);
  });

  $("answerFeedback").textContent = "";
  $("questionArea").classList.remove("hidden");
}

async function answerQuestion(selectedIndex) {
  if (answered || !currentQuestion || !selectedAttack) return;

  answered = true;

  const isCorrect = selectedIndex === currentQuestion.answer;

  const buttons = document.querySelectorAll(".answer-btn");

  buttons.forEach((button, index) => {
    button.disabled = true;

    if (index === currentQuestion.answer) {
      button.classList.add("correct");
    } else if (index === selectedIndex && !isCorrect) {
      button.classList.add("wrong");
    }
  });

  const feedback = $("answerFeedback");

  feedback.textContent = isCorrect
    ? "✅ Resposta correta! Você pode atacar!"
    : `❌ Resposta incorreta. Resposta correta: ${currentQuestion.options[currentQuestion.answer]}`;

  try {
    await processAnswer(selectedIndex, isCorrect);
  } catch (error) {
    console.error(error);
    feedback.textContent += " Erro ao salvar a jogada.";
  }
}

// ---------------------------
// PROCESS ANSWER + SHOT
// ---------------------------

async function processAnswer(selectedIndex, isCorrect) {
  const roomRef = db.collection("rooms").doc(currentRoomId);

  const roomSnap = await roomRef.get();
  const room = roomSnap.data();

  if (room.turn !== currentUser.uid) {
    selectedAttack = null;
    currentQuestion = null;
    return;
  }

  const opponent = room.players.find(p => p.uid !== currentUser.uid);
  if (!opponent) return;

  let hit = false;

  if (isCorrect) {
    const opponentBoardSnap = await roomRef
      .collection("privateBoards")
      .doc(opponent.uid)
      .get();

    const opponentShips = opponentBoardSnap.exists
      ? opponentBoardSnap.data().ships.flat()
      : [];

    hit = isCellOccupied(
      opponentShips,
      selectedAttack.row,
      selectedAttack.col
    );
  }

  const questionLog = {
    uid: currentUser.uid,
    playerName: getMyPlayer(room)?.name || "",
    question: currentQuestion.question,
    topic: currentQuestion.topic,
    level: currentQuestion.level,
    options: currentQuestion.options,
    selectedAnswer: currentQuestion.options[selectedIndex],
    correctAnswer: currentQuestion.options[currentQuestion.answer],
    correct: isCorrect,
    targetRow: selectedAttack.row,
    targetCol: selectedAttack.col,
    shotMade: isCorrect,
    hit: isCorrect ? hit : false,
    timestamp: Date.now()
  };

  const askedQuestions = [
    ...(room.askedQuestions || []),
    currentQuestion.question
  ];

  const questionLogs = [
    ...(room.questionLogs || []),
    questionLog
  ];

  const shots = [...(room.shots || [])];

  const updatedPlayers = room.players.map(player => {
    if (player.uid !== currentUser.uid) return player;

    return {
      ...player,
      shots: (player.shots || 0) + (isCorrect ? 1 : 0),
      hits: (player.hits || 0) + (isCorrect && hit ? 1 : 0)
    };
  });

  if (isCorrect) {
    shots.push({
      shooterUid: currentUser.uid,
      targetUid: opponent.uid,
      row: selectedAttack.row,
      col: selectedAttack.col,
      hit,
      timestamp: Date.now()
    });
  }

  // Verifica vitória.
  const opponentBoardSnap = await roomRef
    .collection("privateBoards")
    .doc(opponent.uid)
    .get();

  const opponentShips = opponentBoardSnap.exists
    ? opponentBoardSnap.data().ships.flat()
    : [];

  const opponentShipKeys = new Set(cellsToKey(opponentShips));

  const opponentHitKeys = new Set(
    shots
      .filter(s => s.targetUid === opponent.uid && s.hit)
      .map(s => `${s.row}-${s.col}`)
  );

  const totalOpponentShipCells = opponentShipKeys.size;
  const totalHits = [...opponentHitKeys].filter(key =>
    opponentShipKeys.has(key)
  ).length;

  const gameWon = totalOpponentShipCells > 0 &&
    totalHits >= totalOpponentShipCells;

  const newTurn = isCorrect && !gameWon
    ? currentUser.uid
    : opponent.uid;

  await roomRef.update({
    shots,
    players: updatedPlayers,
    askedQuestions,
    questionLogs,
    turn: newTurn,
    status: gameWon ? "finished" : "playing",
    winner: gameWon ? currentUser.uid : null,
    finishedAt: gameWon ? Date.now() : null
  });

  selectedAttack = null;
  currentQuestion = null;
  answered = false;
}

// ---------------------------
// END GAME
// ---------------------------

function showEnd(room) {
  showScreen("endScreen");

  const winner = room.players.find(p => p.uid === room.winner);

  $("winnerMessage").textContent = winner
    ? `🏆 ${winner.name} venceu!`
    : "Fim de jogo!";

  $("finalMessage").textContent = "Parabéns! A batalha pela água chegou ao fim.";
}

$("playAgainBtn")?.addEventListener("click", () => {
  location.reload();
});

// ---------------------------
// INITIAL UI
// ---------------------------

showScreen("homeScreen");
