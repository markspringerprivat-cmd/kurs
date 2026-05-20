<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rollenverteilung | Unterrichtskonflikt</title>
  <meta name="description" content="Interaktive Rollenverteilung für ein Rollenspiel zur Gesprächsführung im Unterricht.">
  <link rel="stylesheet" href="assets/style.css">
  <script defer src="assets/app.js"></script>
</head>
<body>
  <a class="skip-link" href="#main">Zum Inhalt springen</a>

  <header class="site-header">
    <nav class="nav shell" aria-label="Hauptnavigation">
      <a class="brand" href="index.html" aria-label="Zur Startseite">Rollenverteilung</a>
      <div class="nav-links">
        <a href="rollen/schueler.html">Schüler/in</a>
        <a href="rollen/lehrkraft.html">Lehrkraft</a>
        <a href="rollen/beobachter.html">Beobachter/in</a>
      </div>
    </nav>

    <section class="hero shell" id="main">
      <div class="hero-copy">
        <p class="eyebrow">Rollenspiel Unterrichtssituation</p>
        <h1>Zufällige Rollenverteilung für Schüler/in, Lehrkraft und Beobachter/in</h1>
        <p>Trage links die Namen ein. Die Webseite verteilt automatisch eine Lehrkraft, eine Schülerin oder einen Schüler und alle weiteren Personen als Beobachterinnen und Beobachter.</p>
        <div class="hero-actions">
          <a class="button primary" href="#verteilung">Namen eintragen</a>
          <a class="button ghost" href="#rollenkarten">Rollenkarten ansehen</a>
        </div>
      </div>
      <div class="hero-panel" aria-label="Kurzübersicht Rollen">
        <div class="mini-role student">Schüler/in</div>
        <div class="mini-role teacher">Lehrkraft</div>
        <div class="mini-role observer">Beobachter/in</div>
      </div>
    </section>
  </header>

  <main>
    <section class="shell section assignment-section" id="verteilung">
      <div class="section-head">
        <p class="eyebrow">Interaktive Verteilung</p>
        <h2>Namen eintragen und Rollen auslosen</h2>
        <p>Mindestens zwei Namen werden benötigt. Bei mehr als zwei Personen werden die übrigen automatisch als Beobachter/innen eingeteilt.</p>
      </div>

      <div class="assignment-layout">
        <article class="panel input-panel">
          <div class="panel-title-row">
            <h3>Namensliste</h3>
            <span id="nameCount" class="pill">0 Personen</span>
          </div>

          <label for="nameInput">Name</label>
          <div class="input-row">
            <input id="nameInput" type="text" autocomplete="off" placeholder="z. B. Lina">
            <button id="addNameBtn" class="button compact" type="button">Hinzufügen</button>
          </div>

          <div class="bulk-box">
            <label for="bulkInput">Mehrere Namen einfügen</label>
            <textarea id="bulkInput" rows="5" placeholder="Ein Name pro Zeile"></textarea>
            <button id="addBulkBtn" class="button ghost compact" type="button">Liste übernehmen</button>
          </div>

          <ul id="nameList" class="name-list" aria-live="polite"></ul>

          <div class="action-row">
            <button id="assignBtn" class="button primary" type="button">Zufällig verteilen</button>
            <button id="clearBtn" class="button ghost" type="button">Zurücksetzen</button>
          </div>
          <p id="hint" class="hint" role="status">Trage zunächst mindestens zwei Namen ein.</p>
        </article>

        <article class="panel results-panel">
          <div class="panel-title-row">
            <h3>Ergebnis</h3>
            <button id="copyBtn" class="text-button" type="button">Ergebnis kopieren</button>
          </div>
          <div id="results" class="results empty-state">
            <p>Noch keine Rollen verteilt.</p>
          </div>
        </article>
      </div>
    </section>

    <section class="shell section" id="rollenkarten">
      <div class="section-head centered">
        <p class="eyebrow">Material</p>
        <h2>Rollenkarten öffnen</h2>
        <p>Die Karten enthalten die Rollenbeschreibungen aus den bereitgestellten Vorlagen, neu angeordnet und modern gestaltet.</p>
      </div>

      <div class="role-card-grid">
        <a class="role-card student-card" href="rollen/schueler.html">
          <span class="card-kicker">Grün markiert</span>
          <h3>Schüler/in</h3>
          <p>Sichtweise erklären, Reaktionen reflektieren und auf die Wirkung der Lehrkraft achten.</p>
          <span class="card-link">Rollenkarte öffnen →</span>
        </a>
        <a class="role-card teacher-card" href="rollen/lehrkraft.html">
          <span class="card-kicker">Rot markiert</span>
          <h3>Lehrkraft</h3>
          <p>Den Konflikt ansprechen, ruhig bleiben, zuhören und gemeinsam eine Lösung suchen.</p>
          <span class="card-link">Rollenkarte öffnen →</span>
        </a>
        <a class="role-card observer-card" href="rollen/beobachter.html">
          <span class="card-kicker">Blau markiert</span>
          <h3>Beobachter/in</h3>
          <p>Kommunikation, Beziehungsgestaltung und Konfliktverlauf anhand klarer Kriterien beobachten.</p>
          <span class="card-link">Rollenkarte öffnen →</span>
        </a>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="shell footer-inner">
      <span>Rollenverteilung für GitHub Pages</span>
      <a href="#main">Nach oben</a>
    </div>
  </footer>
</body>
</html>
