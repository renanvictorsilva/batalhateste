
// ======================================================
// BATALHA NAVAL - CADA GOTA CONTA
// VERSÃO SIMPLIFICADA - BARCOS AUTOMÁTICOS
// Protótipo para testes no Firebase Spark
// ======================================================

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
const SHIP_SIZES = [3, 2, 2];

let user = null;
let roomId = null;
let room = null;
let unsubscribe = null;

let selectedTarget = null;
let activeQuestion = null;
let answered = false;
let busy = false;

// ======================================================
// BANCO DE PERGUNTAS
// ======================================================

const QUESTIONS = [
 {level:"Fácil",topic:"Água",q:"Qual é a fórmula química da água?",o:["CO₂","H₂O","O₂","NaCl"],a:1},
 {level:"Fácil",topic:"Conservação",q:"Qual atitude economiza água?",o:["Torneira aberta","Banho longo","Fechar a torneira ao escovar os dentes","Lavar calçada diariamente"],a:2},
 {level:"Fácil",topic:"Água potável",q:"O que é água potável?",o:["Água própria para consumo","Água salgada","Água com lixo","Qualquer água de rio"],a:0},
 {level:"Fácil",topic:"Ciclo da água",q:"Como se chama a passagem da água líquida para vapor?",o:["Condensação","Solidificação","Evaporação","Fusão"],a:2},
 {level:"Fácil",topic:"Poluição",q:"Qual atitude polui os rios?",o:["Preservar a mata","Jogar lixo na água","Economizar água","Reciclar"],a:1},
 {level:"Fácil",topic:"Ciclo da água",q:"Como a água retorna das nuvens à superfície?",o:["Precipitação","Combustão","Filtração","Fusão"],a:0},
 {level:"Fácil",topic:"Conservação",q:"Uma torneira pingando causa:",o:["Economia","Desperdício","Purificação","Nenhum efeito"],a:1},
 {level:"Fácil",topic:"Saneamento",q:"Por que tratar o esgoto?",o:["Poluir mais","Devolver lixo aos rios","Reduzir a contaminação","Produzir sal"],a:2},
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

// ======================================================
// FUNÇÕES GERAIS
// ======================================================

function $(id) {
  return document.getElementById(id);
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  $(id)?.classList.remove("hidden");
}

function msg(id, text) {
  if ($(id)) $(id).textContent = text;
}

function codeRoom() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({length:5}, () =>
    chars[Math.floor(Math.random()*chars.length)]
  ).join("");
}

function me() {
  return room?.players?.find(p => p.uid === user.uid);
}

function enemy() {
  return room?.players?.find(p => p.uid !== user.uid);
}

function randomQuestion() {
  const used = room?.usedQuestions || [];
  let pool = QUESTIONS.filter(q => !used.includes(q.q));
  if (!pool.length) pool = QUESTIONS;
  return pool[Math.floor(Math.random()*pool.length)];
}

// ======================================================
// GERAÇÃO AUTOMÁTICA DOS BARCOS
// ======================================================

function generateFleet() {
  const fleet = [];

  for (const size of SHIP_SIZES) {
    let placed = false;

    while (!placed) {
      const horizontal = Math.random() < 0.5;
      const row = Math.floor(Math.random()*SIZE);
      const col = Math.floor(Math.random()*SIZE);

      const cells = [];

      for (let i=0; i<size; i++) {
        const r = row + (horizontal ? 0 : i);
        const c = col + (horizontal ? i : 0);

        if (r >= SIZE || c >= SIZE) break;
        cells.push({r,c});
      }

      if (cells.length !== size) continue;

      const overlap = fleet.flat().some(old =>
        cells.some(c => c.r === old.r && c.c === old.c)
      );

      if (!overlap) {
        fleet.push(cells);
        placed = true;
      }
    }
  }

  return fleet;
}

function fleetCells(board) {
  return (board || []).flat();
}

function isShipAt(board, row, col) {
  return fleetCells(board).some(c => c.r === row && c.c === col);
}

// ======================================================
// LOGIN ANÔNIMO
// ======================================================

auth.signInAnonymously()
  .then(result => {
    user = result.user;
    console.log("Firebase conectado:", user.uid);
  })
  .catch(error => {
    console.error(error);
    msg("homeMessage", "Erro de conexão com Firebase.");
  });

// ======================================================
// CRIAR PARTIDA
// ======================================================

$("createRoomBtn")?.addEventListener("click", async () => {
  if (!user) {
    msg("homeMessage", "Aguarde conectar...");
    return;
  }

  const name = $("playerName")?.value.trim();
  if (!name) {
    msg("homeMessage", "Digite seu nome.");
    return;
  }

  const code = codeRoom();

  const newRoom = {
    code,
    status: "waiting",
    players: [{
      uid: user.uid,
      name,
      ready: true
    }],
    boards: {
      [user.uid]: generateFleet()
    },
    shots: [],
    usedQuestions: [],
    questionLogs: [],
    turn: null,
    winner: null,
    createdAt: Date.now()
  };

  try {
    await db.collection("rooms").doc(code).set(newRoom);
    roomId = code;
    listenRoom(code);
    showScreen("lobbyScreen");
  } catch (error) {
    console.error(error);
    msg("homeMessage", "Erro ao criar partida.");
  }
});

// ======================================================
// ENTRAR NA PARTIDA
// ======================================================

$("joinRoomBtn")?.addEventListener("click", async () => {
  if (!user) {
    msg("homeMessage", "Aguarde conectar...");
    return;
  }

  const name = $("playerName")?.value.trim();
  const code = $("roomCodeInput")?.value.trim().toUpperCase();

  if (!name || !code) {
    msg("homeMessage", "Digite seu nome e o código.");
    return;
  }

  const ref = db.collection("rooms").doc(code);

  try {
    await db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error("Sala não encontrada.");

      const data = snap.data();

      if (data.players.some(p => p.uid === user.uid)) return;
      if (data.players.length >= 2) throw new Error("Sala cheia.");
      if (data.status !== "waiting") throw new Error("Partida já começou.");

      const players = [...data.players, {
        uid: user.uid,
        name,
        ready: true
      }];

      const boards = {
        ...(data.boards || {}),
        [user.uid]: generateFleet()
      };

      tx.update(ref, {
        players,
        boards,
        status: "playing",
        turn: players[0].uid
      });
    });

    roomId = code;
    listenRoom(code);
    showScreen("lobbyScreen");

  } catch (error) {
    console.error(error);
    msg("homeMessage", error.message || "Erro ao entrar na sala.");
  }
});

// ======================================================
// OUVIR SALA
// ======================================================

function listenRoom(code) {
  if (unsubscribe) unsubscribe();

  unsubscribe = db.collection("rooms").doc(code)
    .onSnapshot(snapshot => {
      if (!snapshot.exists) return;

      room = snapshot.data();
      renderRoom();
    }, error => console.error("Listener:", error));
}

function renderRoom() {
  if ($("roomCodeDisplay")) $("roomCodeDisplay").textContent = room.code;

  if ($("playersList")) {
    $("playersList").innerHTML = "";

    room.players.forEach(player => {
      const div = document.createElement("div");
      div.className = "player-item";
      div.textContent = "🌊 " + player.name +
        (player.ready ? " — Pronto" : " — Aguardando");
      $("playersList").appendChild(div);
    });
  }

  if (room.players.length < 2) {
    msg("lobbyStatus", "Esperando outro jogador entrar...");
    showScreen("lobbyScreen");
    return;
  }

  if (room.status === "playing") {
    renderGame();
  }

  if (room.status === "finished") {
    renderEnd();
  }
}

// ======================================================
// COPIAR CÓDIGO DA SALA
// ======================================================

$("copyCodeBtn")?.addEventListener("click", async () => {
  if (!roomId) return;

  try {
    await navigator.clipboard.writeText(roomId);
    msg("lobbyStatus", "Código copiado: " + roomId);
  } catch {
    alert("Código da partida: " + roomId);
  }
});

// ======================================================
// RENDERIZAR JOGO
// ======================================================

function renderGame() {
  showScreen("gameScreen");

  const player = me();
  const opponent = enemy();
  if (!player || !opponent) return;

  const myTurn = room.turn === user.uid;

  msg("turnMessage", myTurn ? "🎯 SUA VEZ!" : `⏳ Vez de ${opponent.name}`);
  msg("gameStatus", `${player.name} × ${opponent.name}`);

  renderBoard($("myBoard"), user.uid, false);
  renderBoard($("enemyBoard"), opponent.uid, true);

  if (activeQuestion && !answered) {
    renderQuestion();
  } else {
    $("questionArea")?.classList.add("hidden");
  }
}

function renderBoard(element, targetUid, enemyBoard) {
  if (!element) return;

  element.innerHTML = "";
  element.style.gridTemplateColumns = `repeat(${SIZE},1fr)`;

  const fleet = room.boards?.[targetUid] || [];
  const myTurn = room.turn === user.uid;

  for (let r=0; r<SIZE; r++) {
    for (let c=0; c<SIZE; c++) {
      const cell = document.createElement(enemyBoard ? "button" : "div");
      cell.className = "cell";

      const hasShip = isShipAt(fleet,r,c);
      const shot = (room.shots || []).find(s =>
        s.targetUid === targetUid && s.r === r && s.c === c
      );

      if (!enemyBoard && hasShip) {
        cell.classList.add("ship-cell");
        cell.textContent = "🚢";
      }

      if (shot) {
        cell.classList.add(shot.hit ? "hit-cell" : "miss-cell");
        cell.textContent = shot.hit ? "💥" : "•";
      } else if (enemyBoard) {
        cell.textContent = "🌊";
        cell.disabled = !myTurn || !!selectedTarget;

        cell.addEventListener("click", () => {
          if (!myTurn || selectedTarget || busy) return;
          selectedTarget = {r,c,targetUid};
          activeQuestion = randomQuestion();
          answered = false;
          renderQuestion();
        });
      }

      element.appendChild(cell);
    }
  }
}

// ======================================================
// QUESTÃO
// ======================================================

function renderQuestion() {
  if (!activeQuestion) return;

  $("questionArea")?.classList.remove("hidden");
  msg("questionLevel", activeQuestion.level);
  msg("questionText", activeQuestion.q);

  const options = $("answerOptions");
  if (!options) return;

  options.innerHTML = "";

  activeQuestion.o.forEach((option,index) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = option;
    btn.addEventListener("click", () => answerQuestion(index));
    options.appendChild(btn);
  });

  msg("answerFeedback", "");
}

async function answerQuestion(index) {
  if (answered || busy || !activeQuestion || !selectedTarget) return;

  answered = true;
  busy = true;

  const correct = index === activeQuestion.a;

  document.querySelectorAll(".answer-btn").forEach((btn,i) => {
    btn.disabled = true;
    if (i === activeQuestion.a) btn.classList.add("correct");
    else if (i === index && !correct) btn.classList.add("wrong");
  });

  const feedback = correct
    ? "✅ Correto! Ataque liberado!"
    : `❌ Incorreto! Resposta: ${activeQuestion.o[activeQuestion.a]}`;

  msg("answerFeedback", feedback);

  try {
    await performAttack(index, correct);
  } catch (error) {
    console.error(error);
    msg("answerFeedback", feedback + " Erro ao registrar jogada.");
    answered = false;
  } finally {
    busy = false;
  }
}

// ======================================================
// ATAQUE
// ======================================================

async function performAttack(answerIndex, correct) {
  const ref = db.collection("rooms").doc(roomId);

  await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("Sala inexistente.");

    const data = snap.data();

    if (data.status !== "playing") return;
    if (data.turn !== user.uid) throw new Error("Não é sua vez.");

    const opponent = data.players.find(p => p.uid !== user.uid);
    if (!opponent) throw new Error("Adversário não encontrado.");

    const target = selectedTarget;
    const shots = [...(data.shots || [])];

    const alreadyShot = shots.some(s =>
      s.targetUid === target.targetUid && s.r === target.r && s.c === target.c
    );

    if (alreadyShot) throw new Error("Você já atacou essa posição.");

    let hit = false;

    if (correct) {
      hit = isShipAt(data.boards[target.targetUid], target.r, target.c);

      shots.push({
        shooterUid: user.uid,
        targetUid: target.targetUid,
        r: target.r,
        c: target.c,
        hit,
        timestamp: Date.now()
      });
    }

    const log = {
      uid: user.uid,
      playerName: me()?.name || "",
      question: activeQuestion.q,
      topic: activeQuestion.topic,
      level: activeQuestion.level,
      selectedAnswer: activeQuestion.o[answerIndex],
      correctAnswer: activeQuestion.o[activeQuestion.a],
      correct,
      hit: correct && hit,
      timestamp: Date.now()
    };

    const usedQuestions = [
      ...(data.usedQuestions || []),
      activeQuestion.q
    ];

    const logs = [
      ...(data.questionLogs || []),
      log
    ];

    const fleet = data.boards[opponent.uid] || [];
    const shipCells = fleet.flat();

    const enemyHits = shots.filter(s =>
      s.targetUid === opponent.uid && s.hit
    );

    const hitKeys = new Set(enemyHits.map(s => `${s.r}-${s.c}`));
    const victory = shipCells.length > 0 &&
      shipCells.every(c => hitKeys.has(`${c.r}-${c.c}`));

    tx.update(ref, {
      shots,
      usedQuestions,
      questionLogs: logs,
      turn: correct && !victory ? user.uid : opponent.uid,
      status: victory ? "finished" : "playing",
      winner: victory ? user.uid : null,
      finishedAt: victory ? Date.now() : null
    });
  });

  selectedTarget = null;
  activeQuestion = null;
  answered = false;
}

// ======================================================
// FIM DE JOGO
// ======================================================

function renderEnd() {
  showScreen("endScreen");

  const winner = room.players.find(p => p.uid === room.winner);
  msg("winnerMessage", winner ? `🏆 ${winner.name} venceu!` : "Fim de jogo!");
  msg("finalMessage", "🌊 A batalha pela água terminou! Continue aprendendo e cuidando desse recurso.");
}

$("playAgainBtn")?.addEventListener("click", () => {
  if (unsubscribe) unsubscribe();
  location.reload();
});

// ======================================================
// INICIAR
// ======================================================

showScreen("homeScreen");
console.log("Batalha Naval - Cada Gota Conta: versão automática carregada.");
