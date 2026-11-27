
// =====================================================
// BATALHA NAVAL - CADA GOTA CONTA
// Versao simplificada - barcos automaticos
// Firestore: barcos armazenados em array plano
// Tabuleiro: 8 x 8
// =====================================================

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdj12NqEP1Hxr-rqlJO4ezLBheMuEZfqs",
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

const SIZE = 8;
const FLEET_LENGTHS = [3, 2, 2];
const TOTAL_SHIP_CELLS = 7;

let user = null;
let roomId = null;
let room = null;
let unsubscribe = null;
let selectedTarget = null;
let currentQuestion = null;
let answerLocked = false;
let busy = false;

// =====================================================
// BANCO DE QUESTOES
// =====================================================

const QUESTIONS = [
  {level:"Fácil",topic:"Água",q:"Qual é a fórmula química da água?",o:["CO₂","H₂O","O₂","NaCl"],a:1},
  {level:"Fácil",topic:"Conservação",q:"Qual atitude economiza água?",o:["Deixar torneira aberta","Banho longo","Fechar torneira ao escovar os dentes","Lavar calçada todo dia"],a:2},
  {level:"Fácil",topic:"Água potável",q:"O que é água potável?",o:["Água própria para consumo","Água salgada","Água com lixo","Qualquer água de rio"],a:0},
  {level:"Fácil",topic:"Ciclo da água",q:"Como se chama a passagem da água líquida para vapor?",o:["Condensação","Solidificação","Evaporação","Fusão"],a:2},
  {level:"Fácil",topic:"Poluição",q:"Qual atitude polui os rios?",o:["Preservar a mata","Jogar lixo na água","Economizar água","Reciclar"],a:1},
  {level:"Fácil",topic:"Ciclo da água",q:"Como a água retorna das nuvens à superfície?",o:["Precipitação","Combustão","Filtração","Fusão"],a:0},
  {level:"Fácil",topic:"Conservação",q:"Uma torneira pingando causa:",o:["Economia","Desperdício","Purificação","Nenhum efeito"],a:1},
  {level:"Fácil",topic:"Saneamento",q:"Por que tratar o esgoto?",o:["Poluir mais","Devolver lixo aos rios","Reduzir contaminação","Produzir sal"],a:2},
  {level:"Fácil",topic:"Água",q:"O gelo está em qual estado físico?",o:["Gasoso","Líquido","Plasma","Sólido"],a:3},
  {level:"Fácil",topic:"Água",q:"Onde está a maior parte da água do planeta?",o:["Oceanos","Rios","Lagos","Nuvens"],a:0},

  {level:"Médio",topic:"Ciclo da água",q:"O que acontece na condensação?",o:["Vapor vira líquido","Gelo vira vapor","Água desaparece","Líquido vira sólido"],a:0},
  {level:"Médio",topic:"Vegetação",q:"Como a vegetação contribui para o ciclo da água?",o:["Impede a chuva","Contribui para evapotranspiração","Elimina rios","Transforma água em petróleo"],a:1},
  {level:"Médio",topic:"Água subterrânea",q:"Onde a água pode ficar armazenada no subsolo?",o:["Nuvens","Sol","Aquíferos","Espaço"],a:2},
  {level:"Médio",topic:"Tratamento",q:"Qual processo remove partículas da água?",o:["Filtração","Combustão","Fermentação","Queima"],a:0},
  {level:"Médio",topic:"Recursos hídricos",q:"O que é uma bacia hidrográfica?",o:["Uma piscina","Área drenada por rios e afluentes","Uma estação","Um oceano"],a:1},
  {level:"Médio",topic:"Poluição",q:"Excesso de nutrientes na água pode provocar:",o:["Potabilidade","Desaparecimento da água","Eutrofização","Congelamento"],a:2},
  {level:"Médio",topic:"Conservação",q:"A mata ciliar é importante porque:",o:["Protege margens e reduz erosão","Aumenta lixo","Impede vida aquática","Aumenta salinidade"],a:0},
  {level:"Médio",topic:"Água potável",q:"Por que água transparente pode não ser potável?",o:["Pode conter microrganismos invisíveis","Toda água transparente é salgada","É sempre gelo","Não tem oxigênio"],a:0},
  {level:"Médio",topic:"Consumo",q:"O que é água virtual?",o:["Água digital","Água invisível","Água usada na produção de bens e alimentos","Água espacial"],a:2},
  {level:"Médio",topic:"Conservação",q:"Qual prática ajuda a economizar água?",o:["Reutilizar água quando possível","Deixar mangueira aberta","Ignorar vazamentos","Lavar poucas peças"],a:0},

  {level:"Difícil",topic:"Água virtual",q:"Por que a carne pode ter elevada pegada hídrica?",o:["Animais não bebem","Produção envolve criação e alimento dos animais","Carne é água pura","Não usa agricultura"],a:1},
  {level:"Difícil",topic:"Poluição",q:"O excesso de nutrientes em lagos pode causar:",o:["Eutrofização e redução do oxigênio","Mais potabilidade","Eliminação de algas","Congelamento"],a:0},
  {level:"Difícil",topic:"Saneamento",q:"O despejo de esgoto sem tratamento pode causar:",o:["Biodiversidade maior","Água mais limpa","Contaminação e doenças","Água potável"],a:2},
  {level:"Difícil",topic:"Ciclo da água",q:"Como o desmatamento pode alterar o ciclo da água?",o:["Reduz evapotranspiração e pode alterar chuvas","Não interfere","Congela rios","Elimina oceanos"],a:0},
  {level:"Difícil",topic:"Aquíferos",q:"O que pode contaminar águas subterrâneas?",o:["Proteção de nascentes","Produtos químicos infiltrados","Plantio de árvores","Uso racional"],a:1},
  {level:"Difícil",topic:"Consumo",q:"Pegada hídrica considera:",o:["Só água para beber","Só chuva","Água direta e indireta de atividades e produtos","Só rios"],a:2},
  {level:"Difícil",topic:"Urbanização",q:"Por que a impermeabilização do solo aumenta enchentes?",o:["Diminui a infiltração da água","Elimina a chuva","Aumenta rios","Congela a água"],a:0},
  {level:"Difícil",topic:"Poluição",q:"O que é bioacumulação?",o:["Redução dos oceanos","Acúmulo de contaminantes nos organismos","Filtração natural","Produção de água"],a:1},
  {level:"Difícil",topic:"Tratamento",q:"Por que a água passa por desinfecção?",o:["Adicionar areia","Inativar microrganismos causadores de doenças","Torná-la salgada","Aumentar turbidez"],a:1},
  {level:"Difícil",topic:"Sustentabilidade",q:"O que significa uso sustentável da água?",o:["Usar tudo agora","Não planejar","Atender necessidades atuais sem prejudicar o futuro","Nunca utilizar água"],a:2}
];

// =====================================================
// UTILITARIOS
// =====================================================

function el(id) {
  return document.getElementById(id);
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });
  el(id)?.classList.remove("hidden");
}

function setMessage(id, text) {
  const element = el(id);
  if (element) element.textContent = text;
}

function getRoomRef() {
  return db.collection("rooms").doc(roomId);
}

function myPlayer() {
  return room?.players?.find(player => player.uid === user?.uid);
}

function opponentPlayer() {
  return room?.players?.find(player => player.uid !== user?.uid);
}

function hasShip(uid, position, boards = room?.boards) {
  return (boards?.[uid] || []).includes(position);
}

function randomQuestion() {
  const used = room?.usedQuestions || [];
  let pool = QUESTIONS.filter(q => !used.includes(q.q));
  if (pool.length === 0) pool = QUESTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function makeRoomCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += characters[Math.floor(Math.random() * characters.length)];
  }
  return code;
}

// =====================================================
// GERAR FROTA AUTOMATICA
// RETORNA ARRAY SIMPLES DE NUMEROS (SEM ARRAY DENTRO DE ARRAY)
// =====================================================

function generateFleet() {
  const occupied = [];

  for (const length of FLEET_LENGTHS) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 500) {
      attempts++;

      const horizontal = Math.random() < 0.5;
      const row = Math.floor(Math.random() * SIZE);
      const col = Math.floor(Math.random() * SIZE);

      const shipPositions = [];

      for (let i = 0; i < length; i++) {
        const r = row + (horizontal ? 0 : i);
        const c = col + (horizontal ? i : 0);

        if (r >= SIZE || c >= SIZE) break;

        shipPositions.push(r * SIZE + c);
      }

      if (shipPositions.length !== length) continue;

      if (shipPositions.some(position => occupied.includes(position))) {
        continue;
      }

      occupied.push(...shipPositions);
      placed = true;
    }

    if (!placed) {
      throw new Error("Não foi possível posicionar os barcos.");
    }
  }

  // Array plano: [pos1,pos2,pos3,pos4,pos5,pos6,pos7]
  return occupied;
}

// =====================================================
// AUTENTICACAO FIREBASE
// =====================================================

auth.signInAnonymously()
  .then(result => {
    user = result.user;
    console.log("Firebase conectado. UID:", user.uid);
  })
  .catch(error => {
    console.error("Erro de autenticação Firebase:", error);
    setMessage("homeMessage", "Erro ao conectar ao Firebase: " + error.message);
  });

// =====================================================
// CRIAR PARTIDA
// =====================================================

el("createRoomBtn")?.addEventListener("click", async () => {
  if (!user) {
    setMessage("homeMessage", "Aguarde a conexão com o Firebase.");
    return;
  }

  const name = el("playerName")?.value.trim();

  if (!name) {
    setMessage("homeMessage", "Digite seu nome antes de criar a partida.");
    return;
  }

  let code = makeRoomCode();

  try {
    // Garante que o código da sala não exista
    let existing = await db.collection("rooms").doc(code).get();
    while (existing.exists) {
      code = makeRoomCode();
      existing = await db.collection("rooms").doc(code).get();
    }

    const myFleet = generateFleet();

    // IMPORTANTE: boards.uid contém array plano de números.
    // Não há array dentro de array.
    const roomData = {
      code: code,
      status: "waiting",
      players: [
        {
          uid: user.uid,
          name: name,
          ready: true
        }
      ],
      boards: {
        [user.uid]: myFleet
      },
      shots: [],
      usedQuestions: [],
      questionLogs: [],
      turn: "",
      winner: "",
      createdAt: Date.now()
    };

    await db.collection("rooms").doc(code).set(roomData);

    roomId = code;
    subscribeRoom(code);
    showScreen("lobbyScreen");

  } catch (error) {
    console.error("Erro ao criar sala:", error);
    setMessage("homeMessage", "Erro ao criar sala: " + error.message);
  }
});

// =====================================================
// ENTRAR NA PARTIDA
// =====================================================

el("joinRoomBtn")?.addEventListener("click", async () => {
  if (!user) {
    setMessage("homeMessage", "Aguarde a conexão com o Firebase.");
    return;
  }

  const name = el("playerName")?.value.trim();
  const code = el("roomCodeInput")?.value.trim().toUpperCase();

  if (!name || !code) {
    setMessage("homeMessage", "Digite seu nome e o código da partida.");
    return;
  }

  const ref = db.collection("rooms").doc(code);

  try {
    await db.runTransaction(async transaction => {
      const snapshot = await transaction.get(ref);

      if (!snapshot.exists) {
        throw new Error("Sala não encontrada.");
      }

      const data = snapshot.data();

      if (data.players.some(player => player.uid === user.uid)) {
        return;
      }

      if (data.players.length >= 2) {
        throw new Error("Esta sala já está cheia.");
      }

      if (data.status !== "waiting") {
        throw new Error("Esta partida já começou.");
      }

      const players = [...data.players, {
        uid: user.uid,
        name: name,
        ready: true
      }];

      const boards = { ...(data.boards || {}) };
      boards[user.uid] = generateFleet();

      transaction.update(ref, {
        players: players,
        boards: boards,
        status: "playing",
        turn: data.players[0].uid
      });
    });

    roomId = code;
    subscribeRoom(code);
    showScreen("lobbyScreen");

  } catch (error) {
    console.error("Erro ao entrar na sala:", error);
    setMessage("homeMessage", "Erro ao entrar: " + error.message);
  }
});

// =====================================================
// ACOMPANHAR SALA
// =====================================================

function subscribeRoom(code) {
  if (unsubscribe) unsubscribe();

  unsubscribe = db.collection("rooms").doc(code).onSnapshot(snapshot => {
    if (!snapshot.exists) {
      setMessage("lobbyStatus", "Sala não encontrada.");
      return;
    }

    room = snapshot.data();
    renderRoom();

  }, error => {
    console.error("Erro ao acompanhar partida:", error);
  });
}

function renderRoom() {
  if (el("roomCodeDisplay")) {
    el("roomCodeDisplay").textContent = room.code || roomId;
  }

  const list = el("playersList");
  if (list) {
    list.innerHTML = "";

    (room.players || []).forEach(player => {
      const item = document.createElement("div");
      item.className = "player-item";
      item.textContent = "🌊 " + player.name;
      list.appendChild(item);
    });
  }

  if ((room.players || []).length < 2) {
    setMessage("lobbyStatus", "Esperando outro jogador entrar...");
    showScreen("lobbyScreen");
    return;
  }

  if (room.status === "finished") {
    renderEndScreen();
    return;
  }

  if (room.status === "playing") {
    renderGame();
  }
}

// =====================================================
// COPIAR CODIGO DA SALA
// =====================================================

el("copyCodeBtn")?.addEventListener("click", async () => {
  if (!roomId) return;

  try {
    await navigator.clipboard.writeText(roomId);
    setMessage("lobbyStatus", "Código copiado: " + roomId);
  } catch {
    alert("Código da partida: " + roomId);
  }
});

// =====================================================
// RENDERIZAR JOGO
// =====================================================

function renderGame() {
  showScreen("gameScreen");

  const me = myPlayer();
  const enemy = opponentPlayer();

  if (!me || !enemy) return;

  if (room.turn === user.uid) {
    setMessage("turnMessage", "🎯 SUA VEZ DE JOGAR!");
  } else {
    setMessage("turnMessage", "⏳ Vez de " + enemy.name);
  }

  setMessage("gameStatus", me.name + " × " + enemy.name);

  drawBoard(el("myBoard"), user.uid, false);
  drawBoard(el("enemyBoard"), enemy.uid, true);

  if (selectedTarget && currentQuestion && !answerLocked) {
    renderQuestion();
  } else {
    el("questionArea")?.classList.add("hidden");
  }
}

// =====================================================
// DESENHAR TABULEIROS
// =====================================================

function drawBoard(boardElement, boardUid, isEnemy) {
  if (!boardElement) return;

  boardElement.innerHTML = "";
  boardElement.style.gridTemplateColumns = "repeat(8, 1fr)";

  const fleet = room.boards?.[boardUid] || [];
  const myTurn = room.turn === user.uid;

  for (let position = 0; position < SIZE * SIZE; position++) {
    const cell = isEnemy
      ? document.createElement("button")
      : document.createElement("div");

    cell.className = "cell";

    const ship = fleet.includes(position);
    const shot = (room.shots || []).find(s =>
      s.targetUid === boardUid && s.pos === position
    );

    if (!isEnemy && ship) {
      cell.classList.add("ship-cell");
      cell.textContent = "🚢";
    }

    if (shot) {
      cell.classList.add(shot.hit ? "hit-cell" : "miss-cell");
      cell.textContent = shot.hit ? "💥" : "•";
    }

    if (isEnemy && !shot) {
      cell.textContent = "🌊";

      const alreadyAttacked = (room.shots || []).some(s =>
        s.targetUid === boardUid && s.pos === position
      );

      cell.disabled = !myTurn || !!selectedTarget || busy || alreadyAttacked;

      cell.addEventListener("click", () => {
        if (!myTurn || selectedTarget || busy || alreadyAttacked) return;

        selectedTarget = {
          uid: boardUid,
          pos: position
        };

        currentQuestion = randomQuestion();
        answerLocked = false;
        renderQuestion();
      });
    }

    boardElement.appendChild(cell);
  }
}

// =====================================================
// MOSTRAR PERGUNTA
// =====================================================

function renderQuestion() {
  if (!currentQuestion || !selectedTarget) return;

  el("questionArea")?.classList.remove("hidden");

  setMessage("questionLevel", currentQuestion.level);
  setMessage("questionText", currentQuestion.q);
  setMessage("answerFeedback", "");

  const optionsElement = el("answerOptions");
  if (!optionsElement) return;

  optionsElement.innerHTML = "";

  currentQuestion.o.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.textContent = option;

    button.addEventListener("click", () => {
      submitAnswer(index);
    });

    optionsElement.appendChild(button);
  });
}

// =====================================================
// RESPONDER
// =====================================================

async function submitAnswer(selectedIndex) {
  if (answerLocked || busy || !currentQuestion || !selectedTarget) return;

  answerLocked = true;
  busy = true;

  const correct = selectedIndex === currentQuestion.a;

  document.querySelectorAll(".answer-btn").forEach((button, index) => {
    button.disabled = true;

    if (index === currentQuestion.a) {
      button.classList.add("correct");
    } else if (index === selectedIndex && !correct) {
      button.classList.add("wrong");
    }
  });

  setMessage(
    "answerFeedback",
    correct
      ? "✅ Resposta correta! Ataque liberado!"
      : "❌ Resposta incorreta! A resposta certa era: " +
        currentQuestion.o[currentQuestion.a]
  );

  try {
    await performAttack(selectedIndex, correct);
  } catch (error) {
    console.error("Erro ao registrar ataque:", error);
    setMessage("answerFeedback", "Erro ao registrar jogada: " + error.message);
    answerLocked = false;
  } finally {
    busy = false;
  }
}

// =====================================================
// REGISTRAR ATAQUE
// =====================================================

async function performAttack(selectedIndex, correct) {
  const targetCopy = { ...selectedTarget };
  const questionCopy = { ...currentQuestion };
  const ref = getRoomRef();

  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);

    if (!snapshot.exists) {
      throw new Error("A partida não existe mais.");
    }

    const data = snapshot.data();

    if (data.status !== "playing") {
      throw new Error("A partida não está em andamento.");
    }

    if (data.turn !== user.uid) {
      throw new Error("Não é sua vez.");
    }

    const opponent = data.players.find(player => player.uid !== user.uid);
    if (!opponent) throw new Error("Adversário não encontrado.");

    const shots = [...(data.shots || [])];

    const alreadyShot = shots.some(shot =>
      shot.targetUid === targetCopy.uid && shot.pos === targetCopy.pos
    );

    if (alreadyShot) {
      throw new Error("Essa casa já foi atacada.");
    }

    let hit = false;

    // Somente resposta correta gera disparo.
    if (correct) {
      hit = (data.boards?.[targetCopy.uid] || []).includes(targetCopy.pos);

      shots.push({
        shooterUid: user.uid,
        targetUid: targetCopy.uid,
        pos: targetCopy.pos,
        hit: hit,
        timestamp: Date.now()
      });
    }

    const playerName = data.players.find(p => p.uid === user.uid)?.name || "";

    const logEntry = {
      uid: user.uid,
      playerName: playerName,
      question: questionCopy.q,
      topic: questionCopy.topic,
      level: questionCopy.level,
      selectedAnswer: questionCopy.o[selectedIndex],
      correctAnswer: questionCopy.o[questionCopy.a],
      correct: correct,
      hit: correct && hit,
      timestamp: Date.now()
    };

    const usedQuestions = [
      ...(data.usedQuestions || []),
      questionCopy.q
    ];

    const questionLogs = [
      ...(data.questionLogs || []),
      logEntry
    ];

    // FROTA DO OPONENTE É ARRAY PLANO
    const enemyFleet = data.boards?.[opponent.uid] || [];

    const enemyHits = new Set(
      shots
        .filter(shot => shot.targetUid === opponent.uid && shot.hit)
        .map(shot => shot.pos)
    );

    const victory = enemyFleet.length === TOTAL_SHIP_CELLS &&
      enemyFleet.every(position => enemyHits.has(position));

    // Acertou a questão? Continua jogando.
    // Errou? Passa a vez.
    const nextTurn = correct && !victory
      ? user.uid
      : opponent.uid;

    const updates = {
      shots: shots,
      usedQuestions: usedQuestions,
      questionLogs: questionLogs,
      turn: nextTurn,
      status: victory ? "finished" : "playing"
    };

    if (victory) {
      updates.winner = user.uid;
      updates.finishedAt = Date.now();
    }

    transaction.update(ref, updates);
  });

  selectedTarget = null;
  currentQuestion = null;
  answerLocked = false;
}

// =====================================================
// TELA FINAL
// =====================================================

function renderEndScreen() {
  showScreen("endScreen");

  const winner = (room.players || []).find(player =>
    player.uid === room.winner
  );

  setMessage(
    "winnerMessage",
    winner ? "🏆 " + winner.name + " venceu!" : "Fim da partida!"
  );

  setMessage(
    "finalMessage",
    "🌊 A batalha terminou! Continue aprendendo e cuidando da água."
  );
}

// =====================================================
// JOGAR NOVAMENTE
// =====================================================

el("playAgainBtn")?.addEventListener("click", () => {
  if (unsubscribe) unsubscribe();
  location.reload();
});

// =====================================================
// INICIALIZACAO
// =====================================================

showScreen("homeScreen");
console.log("Batalha Naval - Cada Gota Conta carregado.");
