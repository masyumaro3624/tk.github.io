window.onload = () => {

    const list = document.getElementById("lineList");

    Object.entries(LINES).forEach(([key, line]) => {

        const card = document.createElement("div");
        card.className = "line-card";

        const imgSrc = `assets/line/${key}.png`;

        card.innerHTML = `
            <img class="line-icon" src="${imgSrc}">
            <div class="line-name">${line.name}</div>
            <div class="arrow">›</div>
        `;

        // fallback
        const img = card.querySelector("img");
        img.onerror = () => {
            img.style.display = "none";

            const fallback = document.createElement("div");
            fallback.className = "line-icon-fallback";
            fallback.textContent = key;
            fallback.style.borderColor = line.color;

            card.insertBefore(fallback, card.firstChild);
        };

        // ✅ ここに入れる！！
        card.onclick = () => {
    console.log("クリック:", key);
    window.location.href = `viewer.html?line=${key}`;  // ← 遷移先に変更
};

        list.appendChild(card);
    });

};