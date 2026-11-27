
/* =========================================================
   BATALHA NAVAL - CADA GOTA CONTA
   Multiplayer | Firebase | Tabuleiro 8x8
   Frota: 1 barco de 3 + 2 barcos de 2
   ========================================================= */

// ---------------- FIREBASE ----------------

const firebaseConfig = {
  apiKey: "AIzaSyDdj12NqEP1Hxr-rqlJO4ezLBheEZfqs",
  authDomain: "batalhateste.firebaseapp.com",
  projectId: "batalhateste",
  storageBucket: "batalhateste.firebasestorage.app",
  messagingSenderId: "761564956063",
  appId: "1:761564956063:web:b349d3ebaf67b109c7a9aa",
  measurementId: "G-D82NBCRT55"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// ---------------- CONFIGURAÇÕES ----------------

const BOARD_SIZE = 8;
const FLEET_SIZES = [3, 2, 2];

let currentUser = null;
let currentRoomId = null;
let currentRoom = null;
let roomUnsubscribe = null;

let orientation = "horizontal";
let selectedAttack = null;
let currentQuestion = null;
let answered = false;
let ships = createFleet();

// ---------------- PERGUNTAS ----------------

const QUESTIONS = [
  {level:"Fácil",topic:"Água",question:"Qual é a fórmula química da água?",options:["CO₂","H₂O","O₂","NaCl"],answer:1},
  {level:"Fácil",topic:"Conservação",question:"Qual atitude ajuda a economizar água?",options:["Deixar a torneira aberta","Lavar calçada todo dia com mangueira","Fechar a torneira ao escovar os dentes","Tomar banhos mais longos"],answer:2},
  {level:"Fácil",topic:"Água potável",question:"O que significa água potável?",options:["Água própria para consumo humano","Água com sal","Água de qualquer rio","Água com resíduos"],answer:0},
  {level:"Fácil",topic:"Ciclo da água",question:"Como se chama a passagem da água líquida para vapor?",options:["Condensação","Solidificação","Evaporação","Fusão"],answer:2},
  {level:"Fácil",topic:"Poluição",question:"Qual ação polui diretamente rios e lagos?",options:["Preservar a mata","Descartar lixo na água","Economizar água","Reutilizar materiais"],answer:1},
  {level:"Fácil",topic:"Ciclo da água",question:"Como a água das nuvens retorna à superfície?",options:["Precipitação","Combustão","Filtração","Fusão"],answer:0},
  {level:"Fácil",topic:"Conservação",question:"Uma torneira pingando pode causar:",options:["Economia de água","Desperdício de água","Purificação","Redução da poluição"],answer:1},
  {level:"Fácil",topic:"Saneamento",question:"Qual é a importância do tratamento de esgoto?",options:["Aumentar poluição","Devolver resíduos aos rios","Reduzir contaminação","Produzir água salgada"],answer:2},
  {level:"Fácil",topic:"Água",question:"Em qual estado físico encontramos o gelo?",options:["Gasoso","Líquido","Plasma","Sólido"],answer:3},
  {level:"Fácil",topic:"Água",question:"Qual é a maior fonte de água do planeta?",options:["Oceanos","Rios","Lagos","Nuvens"],answer:0},

  {level:"Médio",topic:"Ciclo da água",question:"O que acontece na condensação?",options:["Vapor transforma-se em líquido","Gelo vira vapor","Água desaparece","Líquido vira sólido"],answer:0},
  {level:"Médio",topic:"Ciclo da água",question:"Qual é o papel da vegetação no ciclo da água?",options:["Impedir a chuva","Contribuir para a evapotranspiração","Eliminar rios","Transformar água em petróleo"],answer:1},
  {level:"Médio",topic:"Água subterrânea",question:"Onde parte da água da chuva pode ficar armazenada?",options:["Somente nas nuvens","Dentro do Sol","Nos aquíferos","No espaço"],answer:2},
  {level:"Médio",topic:"Tratamento",question:"Qual processo remove partículas sólidas da água?",options:["Filtração","Combustão","Fermentação","Evaporação"],answer:0},
  {level:"Médio",topic:"Recursos hídricos",question:"O que é uma bacia hidrográfica?",options:["Uma piscina","Área drenada por um rio e seus afluentes","Uma estação de tratamento","Um reservatório salgado"],answer:1},
  {level:"Médio",topic:"Poluição",question:"O excesso de fertilizantes em rios pode provocar:",options:["Potabilidade","Desaparecimento da água","Eutrofização","Congelamento"],answer:2},
  {level:"Médio",topic:"Conservação",question:"Por que a vegetação às margens dos rios é importante?",options:["Protege o solo e reduz erosão","Aumenta o lixo","Impede a vida aquática","Aumenta salinidade"],answer:0},
  {level:"Médio",topic:"Água potável",question:"Por que água transparente não é necessariamente potável?",options:["Pode conter microrganismos ou substâncias invisíveis","Toda água transparente é salgada","Transparência significa congelamento","Não contém oxigênio"],answer:0},
  {level:"Médio",topic:"Consumo",question:"O que é água virtual?",options:["Água criada por computador","Água invisível","Água utilizada na produção de bens e alimentos","Água espacial"],answer:2},
  {level:"Médio",topic:"Conservação",question:"Qual prática reduz o consumo de água em casa?",options:["Reutilizar água quando apropriado","Deixar a mangueira aberta","Lavar roupa com pouca carga","Ignorar vazamentos"],answer:0},

  {level:"Difícil",topic:"Água virtual",question:"Por que a produção de carne pode apresentar elevado consumo de água virtual?",options:["Animais não bebem água","Envolve criação e produção de alimentos para animais","Carne é feita de água pura","Não utiliza agricultura"],answer:1},
  {level:"Difícil",topic:"Poluição",question:"O que pode ocorrer com excesso de nutrientes em um lago?",options:["Eutrofização e redução do oxigênio dissolvido","Aumento permanente da potabilidade","Eliminação de todas as algas","Congelamento"],answer:0},
  {level:"Difícil",topic:"Saneamento",question:"Qual consequência do despejo de esgoto sem tratamento?",options:["Melhoria da biodiversidade","Redução de doenças","Contaminação da água e riscos à saúde","Aumento de água potável"],answer:2},
  {level:"Difícil",topic:"Ciclo da água",question:"Como o desmatamento pode afetar o ciclo da água?",options:["Reduz evapotranspiração e pode alterar chuvas","Não interfere","Transforma água em gelo","Elimina evaporação dos oceanos"],answer:0},
  {level:"Difícil",topic:"Água subterrânea",question:"O que pode comprometer a qualidade dos aquíferos?",options:["Proteção das áreas de recarga","Contaminação por produtos químicos","Plantio de árvores","Uso racional"],answer:1},
  {level:"Difícil",topic:"Consumo",question:"O conceito de pegada hídrica considera:",options:["Somente água para beber","Somente chuva","Água direta e indireta associada a produtos e atividades","Somente água de rios"],answer:2},
  {level:"Difícil",topic:"Conservação",question:"Por que a impermeabilização do solo urbano pode aumentar enchentes?",options:["Reduz infiltração no solo","Aumenta evaporação em 100%","Elimina rios","Transforma água em gás"],answer:0},
  {level:"Difícil",topic:"Poluição",question:"O que é bioacumulação?",options:["Redução da água dos oceanos","Acúmulo de contaminantes nos organismos","Filtração de água em rochas","Produção de água potável"],answer:1},
  {level:"Difícil",topic:"Tratamento",question:"Por que a desinfecção é importante no tratamento da água?",options:["Aumenta areia","Inativa microrganismos patogênicos","Torna água salgada","Aumenta turbidez"],answer:1},
  {level:"Difícil",topic:"Recursos hídricos",question:"O que significa uso sustentável da água?",options:["Utilizar toda água disponível","Usar sem planejamento","Atender necessidades atuais sem comprometer o futuro","Evitar qualquer uso"],answer:2}
];

// =========================================================
// UTILITÁRIOS
// =========================================================

function $(id) {
  return document.getElementById(id);
}

function createFleet() {
  return FLEET_SIZES.map(size => ({
    size,
    cells: []
  }));
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  $(id)?.classList.remove("hidden");
}

function message(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({length:5}, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

function getMe(room = currentRoom) {
  return room?.players?.find(p => p.uid === currentUser?.uid);
}

function getOpponent(room = currentRoom) {
  return room?.players?.find(p => p.uid !== currentUser?.uid);
}

function allShipsPlaced() {
  return ships.every(s => s.cells.length === s.size);
}

function allShipCells() {
  return ships.flatMap(s => s.cells);
}

function occupied(cells, row, col) {
  return cells.some(c => c.row === row && c.col === col);
}

function cellKey(row, col) {
  return `${row}-${col}`;
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function safeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// =========================================================
// AUTHENTICAÇÃO
// =========================================================

auth.signInAnonymously()
  .then(result => {
    currentUser = result.user;
    console.log("Firebase conectado. UID:", currentUser.uid);
  })
  .catch(error => {
    console.error("Erro de autenticação:", error);
    message("homeMessage", "Não foi possível conectar ao Firebase.");
  });

// =========================================================
// CRIAR SALA
// =========================================================

$("createRoomBtn")?.addEventListener("click", async () => {
  if (!currentUser) {
    message("homeMessage", "Aguarde a conexão com o Firebase...");
    return;
  }

  const name = $("playerName")?.value.trim();

  if (!name) {
    message("homeMessage", "Digite seu nome.");
    return;
  }

  const code = makeCode();

  const room = {
    code,
    status: "waiting",
    players: [{
      uid: currentUser.uid,
      name,
      ready: false,
      hits: 0,
      shots: 0
    }],
    turn: null,
    shots: [],
    askedQuestions: [],
    questionLogs: [],
    winner: null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection("rooms").doc(code).set(room);
    currentRoomId = code;
    showScreen("lobbyScreen");
    subscribeRoom(code);
  } catch (error) {
    console.error(error);
    message("homeMessage", "Erro ao criar sala. Confira o Firebase.");
  }
});

// =========================================================
// ENTRAR NA SALA
// =========================================================

$("joinRoomBtn")?.addEventListener("click", async () => {
  if (!currentUser) {
    message("homeMessage", "Aguarde a conexão...");
    return;
  }

  const name = $("playerName")?.value.trim();
  const code = $("roomCodeInput")?.value.trim().toUpperCase();

  if (!name || !code) {
    message("homeMessage", "Digite seu nome e o código da sala.");
    return;
  }

  const ref = db.collection("rooms").doc(code);

  try {
    await db.runTransaction(async transaction => {
      const snap = await transaction.get(ref);

      if (!snap.exists) throw new Error("Sala não encontrada.");

      const room = snap.data();

      if (room.players.some(p => p.uid === currentUser.uid)) {
        return;
      }

      if (room.players.length >= 2) {
        throw new Error("Sala cheia.");
      }

      if (room.status !== "waiting") {
        throw new Error("Esta partida já começou.");
      }

      transaction.update(ref, {
        players: [...room.players, {
          uid: currentUser.uid,
          name,
          ready: false,
          hits: 0,
          shots: 0
        }],
        status: "setup"
      });
    });

    currentRoomId = code;
    showScreen("lobbyScreen");
    subscribeRoom(code);

  } catch (error) {
    console.error(error);
    message("homeMessage", error.message || "Erro ao entrar na sala.");
  }
});

// =========================================================
// OBSERVAR SALA
// =========================================================

function subscribeRoom(code) {
  if (roomUnsubscribe) roomUnsubscribe();

  roomUnsubscribe = db.collection("rooms")
    .doc(code)
    .onSnapshot(snapshot => {
      if (!snapshot.exists) {
        message("lobbyStatus", "A sala não existe mais.");
        return;
      }

      currentRoom = snapshot.data();
      renderRoom(currentRoom);
    }, error => {
      console.error("Erro ao observar sala:", error);
    });
}

function renderRoom(room) {
  if ($("roomCodeDisplay")) {
    $("roomCodeDisplay").textContent = room.code;
  }

  const list = $("playersList");
  if (list) {
    list.innerHTML = "";

    room.players.forEach(player => {
      const item = document.createElement("div");
      item.className = "player-item";

      const name = document.createElement("span");
      name.textContent = "🌊 " + player.name;

      const status = document.createElement("span");
      status.textContent = player.ready ? "✅ Pronto" : "⏳ Aguardando";

      item.append(name, status);
      list.appendChild(item);
    });
  }

  if (room.players.length < 2) {
    message("lobbyStatus", "Esperando outro jogador entrar...");
    showScreen("lobbyScreen");
    return;
  }

  if (room.status === "setup") {
    const me = getMe(room);

    if (me?.ready) {
      message("lobbyStatus", "Frota confirmada. Aguardando o adversário...");
      showScreen("lobbyScreen");
    } else {
      renderSetup();
    }
    return;
  }

  if (room.status === "playing") {
    renderGame(room);
    return;
  }

  if (room.status === "finished") {
    renderEnd(room);
  }
}

// =========================================================
// COPIAR CÓDIGO
// =========================================================

$("copyCodeBtn")?.addEventListener("click", async () => {
  if (!currentRoomId) return;

  try {
    await navigator.clipboard.writeText(currentRoomId);
    const btn = $("copyCodeBtn");
    if (btn) {
      const old = btn.textContent;
      btn.textContent = "Copiado!";
      setTimeout(() => btn.textContent = old, 1500);
    }
  } catch {
    alert("Código da sala: " + currentRoomId);
  }
});

// =========================================================
// POSICIONAMENTO DA FROTA
// =========================================================

function renderSetup() {
  showScreen("setupScreen");
  renderSetupBoard();
  renderFleet();
}

function renderFleet() {
  const ids = ["ship3Status", "ship2aStatus", "ship2bStatus"];

  ships.forEach((ship, index) => {
    const el = $(ids[index]);
    if (!el) return;

    const placed = ship.cells.length === ship.size;
    el.classList.toggle("placed", placed);
    el.textContent = placed
      ? `Barco ${ship.size} casas ✓`
      : `Barco ${ship.size} casas`;
  });

  if ($("confirmShipsBtn")) {
    $("confirmShipsBtn").disabled = !allShipsPlaced();
  }
}

function renderSetupBoard() {
  const board = $("setupBoard");
  if (!board) return;

  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${BOARD_SIZE},1fr)`;

  const cells = allShipCells();

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const button = document.createElement("button");
      button.className = "cell";
      button.dataset.row = row;
      button.dataset.col = col;

      if (occupied(cells, row, col)) {
        button.classList.add("ship-cell");
        button.textContent = "🚢";
      }

      button.addEventListener("click", () => placeShip(row, col));
      board.appendChild(button);
    }
  }

  renderFleet();
}

function placeShip(row, col) {
  const index = ships.findIndex(ship => ship.cells.length === 0);

  if (index === -1) {
    message("setupMessage", "Todos os barcos já estão posicionados.");
    return;
  }

  const ship = ships[index];
  const newCells = [];

  for (let i = 0; i < ship.size; i++) {
    const r = orientation === "vertical" ? row + i : row;
    const c = orientation === "horizontal" ? col + i : col;

    if (r >= BOARD_SIZE || c >= BOARD_SIZE) {
      message("setupMessage", "O barco não cabe nessa posição.");
      return;
    }

    newCells.push({row:r, col:c});
  }

  const alreadyPlaced = allShipCells();

  if (newCells.some(c => occupied(alreadyPlaced, c.row, c.col))) {
    message("setupMessage", "Os barcos não podem se sobrepor.");
    return;
  }

  ship.cells = newCells;
  message("setupMessage", "Barco posicionado! Posicione o próximo.");
  renderSetupBoard();
}

$("rotateShipBtn")?.addEventListener("click", () => {
  orientation = orientation === "horizontal" ? "vertical" : "horizontal";

  const btn = $("rotateShipBtn");
  if (btn) {
    btn.textContent = orientation === "horizontal"
      ? "↔ Horizontal"
      : "↕ Vertical";
  }

  message("setupMessage", `Orientação: ${orientation}`);
});

$("randomShipsBtn")?.addEventListener("click", () => {
  ships = createFleet();

  for (const ship of ships) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 1000) {
      attempts++;

      const dir = Math.random() < 0.5 ? "horizontal" : "vertical";
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);

      const candidate = [];

      for (let i = 0; i < ship.size; i++) {
        const r = dir === "vertical" ? row + i : row;
        const c = dir === "horizontal" ? col + i : col;

        if (r >= BOARD_SIZE || c >= BOARD_SIZE) break;
        candidate.push({row:r, col:c});
      }

      if (candidate.length !== ship.size) continue;

      if (candidate.some(c => occupied(allShipCells(), c.row, c.col))) {
        continue;
      }

      ship.cells = candidate;
      placed = true;
    }
  }

  message("setupMessage", "Frota sorteada! Confirme ou sorteie novamente.");
  renderSetupBoard();
});

// =========================================================
// CONFIRMAR FROTA
// =========================================================

$("confirmShipsBtn")?.addEventListener("click", async () => {
  if (!allShipsPlaced() || !currentRoomId || !currentUser) return;

  try {
    const roomRef = db.collection("rooms").doc(currentRoomId);
    const privateRef = roomRef.collection("privateBoards").doc(currentUser.uid);

    await privateRef.set({
      uid: currentUser.uid,
      ships: ships.map(ship => ship.cells),
      confirmed: true,
      updatedAt: Date.now()
    });

    await db.runTransaction(async transaction => {
      const snap = await transaction.get(roomRef);
      if (!snap.exists) throw new Error("Sala não encontrada.");

      const room = snap.data();

      const players = room.players.map(player =>
        player.uid === currentUser.uid
          ? {...player, ready:true}
          : player
      );

      const allReady = players.length === 2 &&
        players.every(player => player.ready);

      transaction.update(roomRef, {
        players,
        status: allReady ? "playing" : "setup",
        turn: allReady ? players[0].uid : null
      });
    });

    message("setupMessage", "Frota confirmada!");

  } catch (error) {
    console.error(error);
    message("setupMessage", "Erro ao confirmar frota.");
  }
});

// =========================================================
// TABULEIROS DURANTE A PARTIDA
// =========================================================

function renderGame(room) {
  showScreen("gameScreen");

  const me = getMe(room);
  const opponent = getOpponent(room);
  if (!me || !opponent) return;

  const myTurn = room.turn === currentUser.uid;

  if ($("turnMessage")) {
    $("turnMessage").textContent = myTurn
      ? "🎯 Sua vez!"
      : `⏳ Vez de ${opponent.name}`;
  }

  if ($("gameStatus")) {
    $("gameStatus").textContent = `${me.name} × ${opponent.name}`;
  }

  renderMyBoard(room);
  renderEnemyBoard(room);

  if (currentQuestion && !answered) {
    renderQuestion();
  } else if ($("questionArea")) {
    $("questionArea").classList.add("hidden");
  }
}

async function renderMyBoard(room) {
  const board = $("myBoard");
  if (!board) return;

  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${BOARD_SIZE},1fr)`;

  let myShips = [];

  try {
    const snap = await db.collection("rooms")
      .doc(currentRoomId)
      .collection("privateBoards")
      .doc(currentUser.uid)
      .get();

    if (snap.exists) myShips = snap.data().ships.flat();
  } catch (error) {
    console.error(error);
  }

  const shipKeys = new Set(myShips.map(c => cellKey(c.row,c.col)));

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      const key = cellKey(row,col);
      if (shipKeys.has(key)) cell.classList.add("ship-cell");

      const shot = room.shots?.find(s =>
        s.targetUid === currentUser.uid &&
        s.row === row && s.col === col
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
  board.style.gridTemplateColumns = `repeat(${BOARD_SIZE},1fr)`;

  const opponent = getOpponent(room);
  if (!opponent) return;

  const myTurn = room.turn === currentUser.uid;

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const button = document.createElement("button");
      button.className = "cell enemy-cell";

      const shot = room.shots?.find(s =>
        s.targetUid === opponent.uid &&
        s.row === row && s.col === col
      );

      if (shot) {
        button.classList.add(shot.hit ? "hit-cell" : "miss-cell");
        button.textContent = shot.hit ? "💥" : "•";
        button.disabled = true;
      } else {
        button.textContent = "🌊";
        button.disabled = !myTurn || !!selectedAttack;

        button.addEventListener("click", () => {
          if (!myTurn || selectedAttack) return;
          selectedAttack = {row,col};
          beginQuestion();
        });
      }

      board.appendChild(button);
    }
  }
}

// =========================================================
// SISTEMA DE PERGUNTAS
// =========================================================

function beginQuestion() {
  if (!selectedAttack || !currentRoom) return;

  const used = currentRoom.askedQuestions || [];
  const available = QUESTIONS.filter(q => !used.includes(q.question));

  currentQuestion = randomItem(available.length ? available : QUESTIONS);
  answered = false;

  renderQuestion();
}

function renderQuestion() {
  if (!currentQuestion) return;

  if ($("questionLevel")) {
    $("questionLevel").textContent = currentQuestion.level;
  }

  if ($("questionText")) {
    $("questionText").textContent = currentQuestion.question;
  }

  const options = $("answerOptions");
  if (!options) return;

  options.innerHTML = "";

  currentQuestion.options.forEach((option,index) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.textContent = option;
    button.addEventListener("click", () => submitAnswer(index));
    options.appendChild(button);
  });

  if ($("answerFeedback")) $("answerFeedback").textContent = "";
  $("questionArea")?.classList.remove("hidden");
}

async function submitAnswer(index) {
  if (answered || !currentQuestion || !selectedAttack) return;

  answered = true;

  const correct = index === currentQuestion.answer;

  document.querySelectorAll(".answer-btn").forEach((button,i) => {
    button.disabled = true;

    if (i === currentQuestion.answer) button.classList.add("correct");
    else if (i === index && !correct) button.classList.add("wrong");
  });

  if ($("answerFeedback")) {
    $("answerFeedback").textContent = correct
      ? "✅ Resposta correta! Ataque liberado!"
      : `❌ Incorreto! Resposta: ${currentQuestion.options[currentQuestion.answer]}`;
  }

  try {
    await processTurn(index, correct);
  } catch (error) {
    console.error(error);
    if ($("answerFeedback")) {
      $("answerFeedback").textContent += " Não foi possível registrar a jogada.";
    }
    answered = false;
  }
}

// =========================================================
// PROCESSAR ATAQUE
// =========================================================

async function processTurn(selectedIndex, correct) {
  const roomRef = db.collection("rooms").doc(currentRoomId);

  const snap = await roomRef.get();
  if (!snap.exists) throw new Error("Sala não encontrada.");

  const room = snap.data();

  if (room.turn !== currentUser.uid) {
    selectedAttack = null;
    currentQuestion = null;
    return;
  }

  const opponent = room.players.find(p => p.uid !== currentUser.uid);
  if (!opponent) throw new Error("Adversário não encontrado.");

  let hit = false;

  // Consulta o tabuleiro adversário.
  // IMPORTANTE: no Spark e com regras abertas, esta arquitetura
  // não é segura contra jogadores que inspecionam o banco.
  if (correct) {
    const opponentSnap = await roomRef
      .collection("privateBoards")
      .doc(opponent.uid)
      .get();

    const opponentShips = opponentSnap.exists
      ? opponentSnap.data().ships.flat()
      : [];

    hit = occupied(opponentShips, selectedAttack.row, selectedAttack.col);
  }

  const log = {
    uid: currentUser.uid,
    playerName: getMe(room)?.name || "",
    question: currentQuestion.question,
    topic: currentQuestion.topic,
    level: currentQuestion.level,
    options: currentQuestion.options,
    selectedAnswer: currentQuestion.options[selectedIndex],
    correctAnswer: currentQuestion.options[currentQuestion.answer],
    correct,
    targetRow: selectedAttack.row,
    targetCol: selectedAttack.col,
    shotMade: correct,
    hit: correct && hit,
    timestamp: Date.now()
  };

  const asked = [...(room.askedQuestions || []), currentQuestion.question];
  const logs = [...(room.questionLogs || []), log];
  const shots = [...(room.shots || [])];

  const players = room.players.map(player => {
    if (player.uid !== currentUser.uid) return player;

    return {
      ...player,
      shots: (player.shots || 0) + (correct ? 1 : 0),
      hits: (player.hits || 0) + (correct && hit ? 1 : 0)
    };
  });

  // Acerto de resposta libera o ataque.
  if (correct) {
    shots.push({
      shooterUid: currentUser.uid,
      targetUid: opponent.uid,
      row: selectedAttack.row,
      col: selectedAttack.col,
      hit,
      timestamp: Date.now()
    });
  }

  // Verificar vitória.
  const boardSnap = await roomRef
    .collection("privateBoards")
    .doc(opponent.uid)
    .get();

  const enemyCells = boardSnap.exists
    ? boardSnap.data().ships.flat()
    : [];

  const enemyKeys = new Set(enemyCells.map(c => cellKey(c.row,c.col)));
  const hitKeys = new Set(
    shots
      .filter(s => s.targetUid === opponent.uid && s.hit)
      .map(s => cellKey(s.row,s.col))
  );

  const totalHits = [...hitKeys].filter(k => enemyKeys.has(k)).length;
  const victory = enemyKeys.size > 0 && totalHits >= enemyKeys.size;

  const nextTurn = correct && !victory
    ? currentUser.uid
    : opponent.uid;

  await roomRef.update({
    shots,
    players,
    askedQuestions: asked,
    questionLogs: logs,
    turn: nextTurn,
    status: victory ? "finished" : "playing",
    winner: victory ? currentUser.uid : null,
    finishedAt: victory ? Date.now() : null
  });

  selectedAttack = null;
  currentQuestion = null;
  answered = false;
}

// =========================================================
// FINAL DA PARTIDA
// =========================================================

function renderEnd(room) {
  showScreen("endScreen");

  const winner = room.players.find(p => p.uid === room.winner);

  if ($("winnerMessage")) {
    $("winnerMessage").textContent = winner
      ? `🏆 ${winner.name} venceu!`
      : "Fim de jogo!";
  }

  if ($("finalMessage")) {
    $("finalMessage").textContent =
      "A batalha pela água chegou ao fim! Continue aprendendo e cuidando desse recurso.";
  }
}

$("playAgainBtn")?.addEventListener("click", () => {
  if (roomUnsubscribe) roomUnsubscribe();
  location.reload();
});

// =========================================================
// INICIALIZAÇÃO
// =========================================================

showScreen("homeScreen");

console.log("Batalha Naval - Cada Gota Conta carregado.");
