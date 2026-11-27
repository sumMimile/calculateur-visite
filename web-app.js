// Fonctions propres à la version web installable (absentes de la page claude.ai).
(() => {
  const $ = id => document.getElementById(id);
  const prep = $("prep"); if (!prep) return;
  const box = document.createElement("div");
  box.className = "wrap";
  box.innerHTML = `<div class="gpanel" style="margin-top:20px"><h3>Application et hors ligne</h3>
  <p class="note">Cette version web garde vos données dans ce navigateur, sur cet appareil. Pour partager budget et réservations entre plusieurs personnes, utilisez la page claude.ai. Pensez à exporter une sauvegarde (onglet Budget) et à l'importer sur un autre appareil.</p>
  <div class="gio"><button class="gbtn pri" type="button" id="waInstall" hidden>Installer l'application</button>
  <button class="gbtn" type="button" id="waOffline">Rendre tout disponible hors ligne (≈ 200 Mo)</button></div>
  <div class="prog" id="waProgW" hidden><div class="progbar"><span id="waProg"></span></div><span class="note" id="waTxt"></span></div>
  <p class="note" id="waHelp"></p></div>`;
  prep.appendChild(box);
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  $("waHelp").textContent = ios ? "Sur iPhone : bouton Partager de Safari, puis « Sur l'écran d'accueil »." : "Sur Android : menu ⋮ de Chrome, puis « Installer l'application » (ou le bouton ci-dessus).";
  let deferred = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; $("waInstall").hidden = false; });
  $("waInstall").onclick = async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $("waInstall").hidden = true; };
  if (!("serviceWorker" in navigator)) { $("waOffline").disabled = true; $("waTxt").textContent = "Mode hors ligne non pris en charge par ce navigateur."; return; }
  navigator.serviceWorker.register("sw.js").catch(() => { $("waTxt").textContent = "Le mode hors ligne n'a pas pu s'activer."; });
  $("waOffline").onclick = async () => {
    const reg = await navigator.serviceWorker.ready; const ch = new MessageChannel();
    $("waProgW").hidden = false; $("waOffline").disabled = true;
    ch.port1.onmessage = ({ data }) => {
      $("waProg").style.width = (data.done / data.total * 100).toFixed(1) + "%";
      $("waTxt").textContent = data.done < data.total ? `${data.done} / ${data.total} fichiers` : (data.failed ? `Terminé, ${data.failed} fichier(s) en échec : relancez plus tard.` : "Tout est disponible hors ligne.");
      if (data.done >= data.total) $("waOffline").disabled = false;
    };
    reg.active.postMessage({ type: "offline-all" }, [ch.port2]);
    try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) {}
  };
})();
