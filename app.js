
/* =====================================================
   BATALHA NAVAL - CADA GOTA CONTA
   Versao simplificada - barcos automaticos
   Firebase / Firestore / 8x8
   ===================================================== */

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
const FLEET = [3, 2, 2];

let user = null;
let roomId = "";
let room = null;
let unsubscribe = null;
let target = null;
let question = null;
let answered = false;
let busy = false;

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

// ---------------- UTILITARIOS ----------------

function $(id){ return document.getElementById(id); }

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.add("hidden"));
  $(id)?.classList.remove("hidden");
}

function msg(id,text){
  if($(id)) $(id).textContent=text;
}

function roomCode(){
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code="";
  for(let i=0;i<5;i++) code+=chars[Math.floor(Math.random()*chars.length)];
  return code;
}

function playerMe(){
  return room?.players?.find(p=>p.uid===user.uid);
}

function playerEnemy(){
  return room?.players?.find(p=>p.uid!==user.uid);
}

function fleetCells(fleet){
  return (fleet||[]).flat();
}

function shipAt(fleet,index){
  return fleetCells(fleet).includes(index);
}

function randomQuestion(){
  const used=room?.usedQuestions||[];
  let available=QUESTIONS.filter(q=>!used.includes(q.q));
  if(!available.length) available=QUESTIONS;
  return available[Math.floor(Math.random()*available.length)];
}

// ---------------- FROTA AUTOMATICA ----------------
// Cada posição é um número de 0 a 63.
// Isso evita objetos de coordenadas complexos no Firestore.

function generateFleet(){
  const fleet=[];

  for(const length of FLEET){
    let placed=false;

    while(!placed){
      const horizontal=Math.random()<0.5;
      const row=Math.floor(Math.random()*SIZE);
      const col=Math.floor(Math.random()*SIZE);
      const ship=[];

      for(let i=0;i<length;i++){
        const r=row+(horizontal?0:i);
        const c=col+(horizontal?i:0);
        if(r>=SIZE||c>=SIZE) break;
        ship.push(r*SIZE+c);
      }

      if(ship.length!==length) continue;

      const all=fleet.flat();
      if(ship.some(pos=>all.includes(pos))) continue;

      fleet.push(ship);
      placed=true;
    }
  }

  return fleet;
}

// ---------------- LOGIN ----------------

auth.signInAnonymously()
.then(result=>{
  user=result.user;
  console.log("Firebase conectado:",user.uid);
})
.catch(error=>{
  console.error("Erro de autenticação:",error);
  msg("homeMessage","Erro de conexão com Firebase.");
});

// ---------------- CRIAR SALA ----------------

$("createRoomBtn")?.addEventListener("click",async()=>{
  if(!user){
    msg("homeMessage","Aguarde a conexão...");
    return;
  }

  const name=$("playerName")?.value.trim();
  if(!name){
    msg("homeMessage","Digite seu nome.");
    return;
  }

  const code=roomCode();

  // Objeto de dados simples, sem undefined nem campos null
  const data={
    code:code,
    status:"waiting",
    players:[{
      uid:user.uid,
      name:name,
      ready:true
    }],
    boards:{
      [user.uid]:generateFleet()
    },
    shots:[],
    usedQuestions:[],
    questionLogs:[],
    turn:"",
    winner:"",
    createdAt:Date.now()
  };

  try{
    await db.collection("rooms").doc(code).set(data);
    roomId=code;
    listenRoom(code);
    showScreen("lobbyScreen");
  }catch(error){
    console.error("Erro ao criar sala:",error);
    msg("homeMessage","Erro ao criar sala: "+error.message);
  }
});

// ---------------- ENTRAR NA SALA ----------------

$("joinRoomBtn")?.addEventListener("click",async()=>{
  if(!user){
    msg("homeMessage","Aguarde conexão...");
    return;
  }

  const name=$("playerName")?.value.trim();
  const code=$("roomCodeInput")?.value.trim().toUpperCase();

  if(!name||!code){
    msg("homeMessage","Digite seu nome e código da sala.");
    return;
  }

  const ref=db.collection("rooms").doc(code);

  try{
    await db.runTransaction(async tx=>{
      const snap=await tx.get(ref);
      if(!snap.exists) throw new Error("Sala não encontrada.");

      const data=snap.data();

      if(data.players.some(p=>p.uid===user.uid)) return;
      if(data.players.length>=2) throw new Error("Sala cheia.");
      if(data.status!=="waiting") throw new Error("Partida já começou.");

      const newPlayers=[...data.players,{
        uid:user.uid,
        name:name,
        ready:true
      }];

      const newBoards={...(data.boards||{})};
      newBoards[user.uid]=generateFleet();

      tx.update(ref,{
        players:newPlayers,
        boards:newBoards,
        status:"playing",
        turn:data.players[0].uid
      });
    });

    roomId=code;
    listenRoom(code);
    showScreen("lobbyScreen");

  }catch(error){
    console.error("Erro ao entrar:",error);
    msg("homeMessage",error.message);
  }
});

// ---------------- OUVIR SALA ----------------

function listenRoom(code){
  if(unsubscribe) unsubscribe();

  unsubscribe=db.collection("rooms").doc(code).onSnapshot(snapshot=>{
    if(!snapshot.exists){
      msg("lobbyStatus","Sala não encontrada.");
      return;
    }

    room=snapshot.data();
    renderRoom();
  },error=>console.error("Erro ao acompanhar sala:",error));
}

function renderRoom(){
  if($("roomCodeDisplay")) $("roomCodeDisplay").textContent=room.code;

  if($("playersList")){
    $("playersList").innerHTML="";
    room.players.forEach(p=>{
      const div=document.createElement("div");
      div.className="player-item";
      div.textContent="🌊 "+p.name+" — "+(p.ready?"Pronto":"Aguardando");
      $("playersList").appendChild(div);
    });
  }

  if(room.players.length<2){
    msg("lobbyStatus","Esperando outro jogador entrar...");
    showScreen("lobbyScreen");
    return;
  }

  if(room.status==="playing") renderGame();
  if(room.status==="finished") renderEnd();
}

// ---------------- COPIAR CODIGO ----------------

$("copyCodeBtn")?.addEventListener("click",async()=>{
  if(!roomId) return;
  try{
    await navigator.clipboard.writeText(roomId);
    msg("lobbyStatus","Código copiado: "+roomId);
  }catch(e){
    alert("Código da sala: "+roomId);
  }
});

// ---------------- TABULEIROS ----------------

function renderGame(){
  showScreen("gameScreen");

  const mine=playerMe();
  const opponent=playerEnemy();
  if(!mine||!opponent) return;

  msg("turnMessage",room.turn===user.uid?"🎯 SUA VEZ!":"⏳ Vez de "+opponent.name);
  msg("gameStatus",mine.name+" × "+opponent.name);

  drawBoard($("myBoard"),user.uid,false);
  drawBoard($("enemyBoard"),opponent.uid,true);

  if(question&&!answered) renderQuestion();
  else $("questionArea")?.classList.add("hidden");
}

function drawBoard(element,uid,isEnemy){
  if(!element) return;

  element.innerHTML="";
  element.style.gridTemplateColumns="repeat(8,1fr)";

  const fleet=room.boards?.[uid]||[];
  const myTurn=room.turn===user.uid;

  for(let index=0;index<64;index++){
    const cell=isEnemy?document.createElement("button"):document.createElement("div");
    cell.className="cell";

    const ship=shipAt(fleet,index);
    const shot=(room.shots||[]).find(s=>s.targetUid===uid&&s.pos===index);

    if(!isEnemy&&ship){
      cell.classList.add("ship-cell");
      cell.textContent="🚢";
    }

    if(shot){
      cell.classList.add(shot.hit?"hit-cell":"miss-cell");
      cell.textContent=shot.hit?"💥":"•";
    }else if(isEnemy){
      cell.textContent="🌊";
      cell.disabled=!myTurn||!!target||busy;

      cell.addEventListener("click",()=>{
        if(!myTurn||target||busy) return;
        target={uid:uid,pos:index};
        question=randomQuestion();
        answered=false;
        renderQuestion();
      });
    }

    element.appendChild(cell);
  }
}

// ---------------- PERGUNTAS ----------------

function renderQuestion(){
  if(!question) return;

  $("questionArea")?.classList.remove("hidden");
  msg("questionLevel",question.level);
  msg("questionText",question.q);

  const options=$("answerOptions");
  if(!options) return;

  options.innerHTML="";

  question.o.forEach((text,index)=>{
    const button=document.createElement("button");
    button.className="answer-btn";
    button.textContent=text;
    button.addEventListener("click",()=>submitAnswer(index));
    options.appendChild(button);
  });

  msg("answerFeedback","");
}

async function submitAnswer(index){
  if(answered||busy||!question||!target) return;

  answered=true;
  busy=true;

  const correct=index===question.a;

  document.querySelectorAll(".answer-btn").forEach((button,i)=>{
    button.disabled=true;
    if(i===question.a) button.classList.add("correct");
    else if(i===index&&!correct) button.classList.add("wrong");
  });

  msg("answerFeedback",correct
    ?"✅ Resposta correta! Ataque liberado!"
    :"❌ Incorreto! Resposta: "+question.o[question.a]);

  try{
    await attack(index,correct);
  }catch(error){
    console.error("Erro no ataque:",error);
    msg("answerFeedback","Erro ao registrar jogada: "+error.message);
    answered=false;
  }finally{
    busy=false;
  }
}

// ---------------- ATAQUE ----------------

async function attack(answerIndex,correct){
  const ref=db.collection("rooms").doc(roomId);

  await db.runTransaction(async tx=>{
    const snap=await tx.get(ref);
    if(!snap.exists) throw new Error("Sala não encontrada.");

    const data=snap.data();
    if(data.status!=="playing") return;
    if(data.turn!==user.uid) throw new Error("Não é sua vez.");

    const opponent=data.players.find(p=>p.uid!==user.uid);
    if(!opponent) throw new Error("Adversário não encontrado.");

    const shots=[...(data.shots||[])];

    const duplicate=shots.some(s=>s.targetUid===target.uid&&s.pos===target.pos);
    if(duplicate) throw new Error("Essa posição já foi atacada.");

    let hit=false;

    if(correct){
      hit=shipAt(data.boards[target.uid],target.pos);

      shots.push({
        shooterUid:user.uid,
        targetUid:target.uid,
        pos:target.pos,
        hit:hit,
        timestamp:Date.now()
      });
    }

    const log={
      uid:user.uid,
      playerName:playerMe()?.name||"",
      question:question.q,
      topic:question.topic,
      level:question.level,
      selectedAnswer:question.o[answerIndex],
      correctAnswer:question.o[question.a],
      correct:correct,
      hit:correct&&hit,
      timestamp:Date.now()
    };

    const used=[...(data.usedQuestions||[]),question.q];
    const logs=[...(data.questionLogs||[]),log];

    const enemyFleet=data.boards[opponent.uid]||[];
    const enemyCells=enemyFleet.flat();

    const hitPositions=new Set(
      shots.filter(s=>s.targetUid===opponent.uid&&s.hit).map(s=>s.pos)
    );

    const victory=enemyCells.length>0&&enemyCells.every(pos=>hitPositions.has(pos));

    // Resposta certa: permanece com a vez.
    // Resposta errada: passa a vez.
    const nextTurn=correct&&!victory?user.uid:opponent.uid;

    const update={
      shots:shots,
      usedQuestions:used,
      questionLogs:logs,
      turn:nextTurn,
      status:victory?"finished":"playing"
    };

    if(victory){
      update.winner=user.uid;
      update.finishedAt=Date.now();
    }

    tx.update(ref,update);
  });

  target=null;
  question=null;
  answered=false;
}

// ---------------- FIM DO JOGO ----------------

function renderEnd(){
  showScreen("endScreen");

  const winner=room.players.find(p=>p.uid===room.winner);
  msg("winnerMessage",winner?"🏆 "+winner.name+" venceu!":"Fim de jogo!");
  msg("finalMessage","🌊 A batalha pela água terminou! Continue aprendendo e cuidando desse recurso.");
}

$("playAgainBtn")?.addEventListener("click",()=>{
  if(unsubscribe) unsubscribe();
  location.reload();
});

// ---------------- INICIAR ----------------

showScreen("homeScreen");
console.log("Batalha Naval - versão automática carregada.");
