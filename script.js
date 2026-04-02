// =====================
// 路線設定
// =====================
// URLから路線取得
let params = new URLSearchParams(location.search);
let currentLineId = null;

const img = document.createElement("img");
console.log(img.src);
console.log("選択路線:", currentLineId);


const LINES = {
    JT: {
    name: "東海道線",
    prefix: "JT",
    upX: 1350,
    downX: 1800,
    color: "#68f5ff",
    background: "background_JT.png",  
    stationOffset: -2,
    stationCount: 44,
    stationYStart: 262,
    stationYEnd: 26704,
  },
    JO: {
    name: "横須賀線・総武快速線",
    prefix: "JO",
    upX: 1350,
    downX: 1800,
    color: "#68f5ff",
    background: "background_JO.png",  // ← 追加
    stationOffset: -2,
    stationCount: 44,
    stationYStart: 262,
    stationYEnd: 26704,
  },
    JS: {
    name: "湘南新宿ライン",
    prefix: "JS",
    upX: 1350,
    downX: 1800,
    color: "#68f5ff",
    background: "background_JS.png",  // ← 追加
    stationOffset: -2,
    stationCount: 44,
    stationYStart: 262,
    stationYEnd: 26704,
  },
    JK: {
    name: "京浜東北線・根岸線",
    prefix: "JK",
    upX: 1350,
    downX: 1800,
    color: "#68f5ff",
    background: "background_JK.png",  // ← 追加
    stationOffset: -2,
    stationCount: 44,
    stationYStart: 262,
    stationYEnd: 26704,
  },
    JH: {
    name: "横浜線・根岸線",
    prefix: "JH",
    upX: 1350,
    downX: 1800,
    color: "#68f5ff",
    background: "background_JH.png",  // ← 追加
    stationOffset: -2,
    stationCount: 44,
    stationYStart: 262,
    stationYEnd: 26704,
  },
    UTL: {
    name: "上野東京ライン",
    prefix: "UTL",
    upX: 1350,
    downX: 1800,
    color: "#b700ff",
    background: "background_UTL.png",  // ← 追加
    stationOffset: -2,
    stationCount: 44,
    stationYStart: 262,
    stationYEnd: 26704,
    bgParts: 10, 
  },

  
  // 他の路線も同様に background: "background_XX.png" を追加



  // ✅ 路線を増やすときはここに追加するだけ
  // KH: {
  //   name: "京浜東北線",
  //   prefix: "KH",
  //   upX: 1100,
  //   downX: 1600,
  //   color: "#00a0e9",
  //   stations: [...],
  //   stationY: {...}
  // },
}


function setBackground(line) {
  const bg = document.getElementById("bg");
  if (!bg) return;

  bg.innerHTML = "";

  const parts = line.bgParts || 1;

  
  for (let i = 0; i < parts; i++) {
    const img = document.createElement("img");

    if (parts === 1) {
      // 👇分割なし
      img.src = "img/" + line.background;
    } else {
      // 👇分割あり
      img.src = "img/" + line.background.replace(".png", `_${i}.png`);
    }

    img.loading = "eager";  // ← これに変更
    img.decoding = "sync";
    img.className = "bgPart";

    bg.appendChild(img);
  }
}

// =====================
// 初期化: 路線ごとにレイヤーを生成
// =====================
function initLayers() {
  const map = document.getElementById("map")

  for (const lineId in LINES) {
    for (const dir of ["up", "down"]) {
      const el = document.createElement("div")
      el.id = `layer_${lineId}_${dir}`
      el.className = "trainLayer"
      map.appendChild(el)
    }
  }
}

// =====================
// dataMap解析（路線プレフィックス対応）
// =====================
function parseDataMap(code, prefix) {
  const re = new RegExp(`^(\\d{2})([TS])([UD])$`)
  const m = code.match(re)
  if (!m) return null
  return {
    station: parseInt(m[1]),
    type: m[2],       // S=停車中 T=走行中
    direction: m[3]   // U=上り  D=下り
  }
}

// =====================
// Y座標計算
// =====================
function getTrainY(line, station, type) {
  const offset = line.stationOffset || 0
  const idx = station + offset - 1  // 0始まり

  const step = (line.stationYEnd - line.stationYStart) / (line.stationCount - 1)
  const y1 = line.stationYStart + idx * step

  if (type === "S") return y1
  return y1 + step / 2  // 走行中は駅間の中間
}
// =====================
// 列車描画（全路線対応）
// =====================
function drawTrains(trains) {

  // 全消去
  for (const lineId in LINES) {
    for (const dir of ["up", "down"]) {
      document.getElementById(`layer_${lineId}_${dir}`).innerHTML = "";
    }
  }

  if (!currentLineId) return;

  const line = LINES[currentLineId];
  const groups = {};

  trains.forEach(train => {
    if (!train.dataMap) return;

    const code = train.dataMap[line.prefix];
    if (!code) return;

    const parsed = parseDataMap(code, line.prefix);
    if (!parsed) return;

    const baseY = getTrainY(line, parsed.station, parsed.type) + (parsed.type === "T" ? 50 : 0);
    const key = `${parsed.direction}_${baseY}`;

    if (!groups[key]) groups[key] = { parsed, baseY, trains: [] };

    const alreadyIn = groups[key].trains.some(t => t.formation?.id === train.formation?.id);
    if (!alreadyIn) groups[key].trains.push(train);
  });

  Object.values(groups).forEach(({ parsed, baseY, trains: grp }) => {
    grp.forEach((train, nth) => {
      const el = document.createElement("img");
      el.className = "train";

      el.style.top  = (baseY + nth * 14) + "px";
      el.style.left = ((parsed.direction === "U" ? line.upX : line.downX) + nth * 14) + "px";

      el.src = parsed.direction === "U" ? "train_up.png" : "train_down.png";

      el.onclick = () => openTrainInfo(grp, line);

      document
        .getElementById(`layer_${currentLineId}_${parsed.direction === "U" ? "up" : "down"}`)
        .appendChild(el);
    });
  });
}

// =====================
// 情報パネル
// =====================
function openTrainInfo(grp, line) {
  document.getElementById("infoLine").innerText = line.name
  document.getElementById("trainInfo-header").style.background = line.color

  document.getElementById("trainInfoBody").innerHTML = grp.map(train => {
    const cars  = train.formation?.size ?? "---"   // ← ここを修正
    const model = train.modelName  || "---"
    const dest  = train.destination || "不明"
    const num   = train.trainNumber || "---"
    const isDelayed = train.delay && train.delay > 0
    const delayText = isDelayed ? `${train.delay}分遅れ` : "定刻通り"

    return `
      <div class="train-card">
        <div class="train-main">
          <img src="train_icon.png">
          <div>
            <div class="info-model">${model} / ${cars}両</div>
            <div class="info-dest">${dest} 行</div>
            <div class="info-sub">列車番号: ${num}</div>
          </div>
        </div>
        <div class="train-status ${isDelayed ? "delayed" : ""}">
          ${delayText}
        </div>
      </div>`
  }).join('<hr class="train-divider">')

  document.getElementById("trainInfo").classList.add("open")
}

function closeInfo() {
  document.getElementById("trainInfo").classList.remove("open")
}

// =====================
// API取得・更新
// =====================
async function update() {
  const res = await fetch(
    "https://corsproxy.io/?https://train-api.tk.pokkuma.jp/trains/",
    { headers: { "Authorization": "Basic " + btoa("godgod:jsFqUC5VcR5H") } }
  )
  const data = await res.json()
  console.log(data)
  drawTrains(data.trains)
}

// =====================
// 起動
// =====================
window.onload = () => {
  initLayers();

  const params = new URLSearchParams(location.search);
  const lineId = params.get("line") || Object.keys(LINES)[0];

  currentLineId = lineId;
  const line = LINES[lineId];

  document.body.style.background = line.color;
  setBackground(line);

  // ↓ ここに追加
  const map = document.getElementById("map");
  const wrapper = document.getElementById("map-wrapper");
  const scale = window.innerWidth / 1080;
  console.log("innerWidth:", window.innerWidth, "scale:", scale);  // ← 追加
  map.style.transform = `scale(${scale})`;
  
  map.style.transform = `scale(${scale})`;
  wrapper.style.width = window.innerWidth + "px";
  wrapper.style.height = (27000 * scale) + "px";

  // レイヤー表示
  for (const id in LINES) {
    for (const dir of ["up", "down"]) {
      const el = document.getElementById(`layer_${id}_${dir}`);
      if (el) el.style.display = "none";
    }
  }

  for (const dir of ["up", "down"]) {
    const el = document.getElementById(`layer_${lineId}_${dir}`);
    if (el) el.style.display = "block";
  }

  update();
  setInterval(update, 1000);
};