/* ── Estado ── */
let allProjects = [];
let activeFilter = 'all';

/* ── Carrega projetos do JSON ── */
async function loadProjects() {
  try {
    const res = await fetch('projects.json');
    if (!res.ok) throw new Error('Erro ao carregar projetos.json');
    allProjects = await res.json();
    init();
  } catch (e) {
    document.getElementById('projectsGrid').innerHTML =
      `<div class="empty-state"><p>⚠️ Não foi possível carregar os projetos.<br><small>${e.message}</small></p></div>`;
  }
}

/* ── Inicializa a página ── */
function init() {
  buildFilters();
  renderStats();
  renderCards(allProjects);
}

/* ── Monta os botões de filtro dinamicamente ── */
function buildFilters() {
  const categories = ['all', ...new Set(allProjects.map(p => p.category))];
  const nav = document.getElementById('navFilters');
  nav.innerHTML = categories.map(cat =>
    `<button class="filter-btn ${cat === 'all' ? 'active' : ''}" data-filter="${cat}">
      ${cat === 'all' ? 'Todos' : cat}
    </button>`
  ).join('');

  nav.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    activeFilter = btn.dataset.filter;
    nav.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtered = activeFilter === 'all'
      ? allProjects
      : allProjects.filter(p => p.category === activeFilter);
    renderCards(filtered);
  });
}

/* ── Estatísticas do hero ── */
function renderStats() {
  const totalProjects = allProjects.length;
  const categories = new Set(allProjects.map(p => p.category)).size;
  const featured = allProjects.filter(p => p.featured).length;

  document.getElementById('heroStats').innerHTML = `
    <div class="stat-item">
      <div class="stat-value">${totalProjects}</div>
      <div class="stat-label">Projetos entregues</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${categories}</div>
      <div class="stat-label">Áreas de negócio</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${featured}</div>
      <div class="stat-label">Projetos em destaque</div>
    </div>
  `;
}

/* ── Renderiza os cards ── */
function renderCards(projects) {
  const grid = document.getElementById('projectsGrid');

  if (projects.length === 0) {
    grid.innerHTML = `<div class="empty-state"><p>Nenhum projeto encontrado nessa categoria.</p></div>`;
    return;
  }

  grid.innerHTML = projects.map((p, i) => {
    const thumb = p.videoPlataforma === 'youtube'
      ? `<img class="thumb-yt" src="https://img.youtube.com/vi/${p.videoId}/mqdefault.jpg" alt="Thumbnail: ${p.title}" loading="lazy" />`
      : `<div style="font-size:2rem;color:rgba(255,255,255,0.3)">▶</div>`;

    const metricsHtml = p.metrics.map(m => `
      <div class="metric">
        <div class="metric-value">${m.value}</div>
        <div class="metric-label">${m.label}</div>
      </div>
    `).join('');

    const tagsHtml = p.tags.map(t => `<span class="tag">${t}</span>`).join('');

    return `
      <article class="project-card ${p.featured ? 'featured' : ''}"
               style="animation-delay: ${i * 60}ms"
               data-id="${p.id}"
               tabindex="0"
               role="button"
               aria-label="Ver detalhes: ${p.title}">
        <div class="card-thumb">
          ${thumb}
          <div class="play-overlay">
            <div class="play-btn">
              <svg viewBox="0 0 24 24" fill="#1a1a2e"><polygon points="5,3 19,12 5,21"/></svg>
            </div>
          </div>
          ${p.featured ? '<span class="featured-badge">Destaque</span>' : ''}
        </div>
        <div class="card-body">
          <div class="card-category">${p.category}</div>
          <h2 class="card-title">${p.title}</h2>
          <p class="card-result">${p.result}</p>
          <div class="card-metrics">${metricsHtml}</div>
          <div class="card-tags">${tagsHtml}</div>
        </div>
      </article>
    `;
  }).join('');

  grid.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => openModal(Number(card.dataset.id)));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openModal(Number(card.dataset.id));
    });
  });
}

/* ── Modal ── */
function openModal(id) {
  const p = allProjects.find(x => x.id === id);
  if (!p) return;

  const videoEmbed = p.videoPlataforma === 'youtube'
    ? `<iframe src="https://www.youtube-nocookie.com/embed/${p.videoId}?rel=0&autoplay=1"
         allow="autoplay; encrypted-media" allowfullscreen title="${p.title}"></iframe>`
    : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text3);font-size:14px;">Vídeo não disponível</div>`;

  const metricsHtml = p.metrics.map(m => `
    <div class="modal-metric">
      <div class="modal-metric-value">${m.value}</div>
      <div class="modal-metric-label">${m.label}</div>
    </div>
  `).join('');

  const tagsHtml = p.tags.map(t => `<span class="tag">${t}</span>`).join('');

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-video">${videoEmbed}</div>
    <div class="modal-category">${p.category}</div>
    <h2 class="modal-title" id="modalTitle">${p.title}</h2>
    <div class="modal-section">
      <h3>Problema resolvido</h3>
      <p class="modal-problem">${p.problem}</p>
    </div>
    <div class="modal-section">
      <h3>Resultado entregue</h3>
      <p class="modal-result">${p.result}</p>
    </div>
    <div class="modal-section">
      <h3>Métricas</h3>
      <div class="modal-metrics">${metricsHtml}</div>
    </div>
    <div class="modal-section">
      <h3>Tecnologias</h3>
      <div class="modal-tags">${tagsHtml}</div>
    </div>
  `;

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  /* Para o vídeo (remove o iframe) */
  setTimeout(() => {
    document.getElementById('modalContent').innerHTML = '';
  }, 300);
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ── Start ── */
loadProjects();
