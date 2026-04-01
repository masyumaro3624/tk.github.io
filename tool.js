let index = 1

const stationY = {}

const viewer = document.getElementById("viewer")
const map = document.getElementById("map")

map.addEventListener("click", e => {

  const rect = map.getBoundingClientRect()

  // stationY はmap内のCSSレイアウト座標（style.topに使う値）
  // getBoundingClientRect はスクロール込みの視覚位置を返すので
  // clientY - rect.top = scrollTop + clientY = そのままレイアウトY
  // ✅ scale除算は不要（÷0.5すると全座標が2倍になってしまう）
  const trueY = Math.round(e.clientY - rect.top)
  const trueX = Math.round(e.clientX - rect.left)

  const code = "UTL" + String(index).padStart(2, "0")
  stationY[code] = trueY

  const dot = document.createElement("div")
  dot.className = "station"
  dot.style.left = trueX + "px"
  dot.style.top  = trueY + "px"

  const label = document.createElement("div")
  label.className = "label"
  label.textContent = code
  dot.appendChild(label)

  map.appendChild(dot)

  index++
  updateOutput()
  document.getElementById("clickCount").textContent = index - 1
})

function updateOutput() {
  document.getElementById("output").value =
    JSON.stringify(stationY, null, 2)
}

function copyOutput() {
  const ta = document.getElementById("output")
  ta.select()
  document.execCommand("copy")
  document.getElementById("copyBtn").textContent = "✅ コピーした"
  setTimeout(() => {
    document.getElementById("copyBtn").textContent = "📋 コピー"
  }, 2000)
}

function undoLast() {
  if (index <= 1) return
  index--
  const code = "UTL" + String(index).padStart(2, "0")
  delete stationY[code]

  const dots = map.querySelectorAll(".station")
  if (dots.length > 0) dots[dots.length - 1].remove()

  updateOutput()
  document.getElementById("clickCount").textContent = index - 1
}