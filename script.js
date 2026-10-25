// ---- CONFIG: fill these in ----
const CONFIG = {
  ca: "xxpump",
  x: "https://x.com/PUMPMassivePair",
};
// --------------------------------

const hasCA = CONFIG.ca && !CONFIG.ca.startsWith("PASTE_");
const pumpUrl = hasCA ? "https://pump.fun/coin/" + CONFIG.ca : "#";
const solscanUrl = hasCA ? "https://solscan.io/token/" + CONFIG.ca : "#";

document.getElementById("ca").textContent = CONFIG.ca;
document.querySelectorAll("[data-pump]").forEach(a => { a.href = pumpUrl; a.target = "_blank"; a.rel = "noopener"; });
document.querySelectorAll("[data-solscan]").forEach(a => { a.href = solscanUrl; a.target = "_blank"; a.rel = "noopener"; });
document.querySelectorAll("[data-x]").forEach(a => { a.href = CONFIG.x; a.target = "_blank"; a.rel = "noopener"; });

const copyBtn = document.getElementById("copy");
copyBtn.addEventListener("click", async () => {
  const label = copyBtn.querySelector("span");
  try {
    await navigator.clipboard.writeText(CONFIG.ca);
    label.textContent = "Copied";
  } catch {
    label.textContent = "Copy failed";
  }
  setTimeout(() => (label.textContent = "Copy CA"), 1500);
});
