async function checkUserAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        // Se não houver sessão ativa, manda de volta para a tela de login
        window.location.href = 'login/login.html';
    }
}

// Executa a verificação assim que o script carrega
checkUserAuth();
const membersData = [
    { id: 1, name: "Rayane", class: "c-1", victories: 9, desc: "Cinema latino e romances dramáticos.", avatar: "", letterboxd: "https://letterboxd.com/nayaxs/" },
    { id: 2, name: "Malena", class: "c-2", victories: 8, desc: "Diretores autorais e narrativas impactantes.", avatar: "", letterboxd: "" },
    { id: 3, name: "Rebeca", class: "c-3", victories: 8, desc: "Terror, melodrama e suspense visual profundo.", avatar: "", letterboxd: "" },
    { id: 4, name: "Kamila", class: "c-4", victories: 8, desc: "Clássicos cult, atuações marcantes e boa trilha.", avatar: "", letterboxd: "" },
    { id: 5, name: "Derp", class: "c-5", victories: 8, desc: "Ficção científica, noir e cinema de gênero.", avatar: "", letterboxd: "" },
    { id: 6, name: "Matheus", class: "c-6", victories: 7, desc: "Dramas intensos e fotografia contemplativa.", avatar: "", letterboxd: "" },
    { id: 7, name: "Mylena", class: "c-7", victories: 7, desc: "Animações, comédias ácidas e indies modernos.", avatar: "", letterboxd: "" },
    { id: 8, name: "Mudsaga", class: "c-8", victories: 6, desc: "Curadoria livre e descobertas do festival.", avatar: "", letterboxd: "" }
];

let loggedInUser = null;
let isEditingProfiles = false;
let currentSortAssistidos = "maior-media";
let currentActiveMovieIndex = null;
let editingMovieIndex = null;
let selectedCountryFilter = "Todos";
let directorsCustomAvatars = {};

const rodadasMembersList = [
    { name: "Rebeca", initials: "RE", bg: "bg-red" },
    { name: "Rayane", initials: "RA", bg: "bg-purple" },
    { name: "Malena", initials: "MA", bg: "bg-blue" },
    { name: "Derp", initials: "DE", bg: "bg-yellow" },
    { name: "Kamila", initials: "KA", bg: "bg-green" },
    { name: "Mudsaga", initials: "MU", bg: "bg-red" },
    { name: "Matheus", initials: "MA", bg: "bg-teal" },
    { name: "Mylena", initials: "MY", bg: "bg-purple" }
];

let selectedRodada = 1;
let rodadasState = {}; 
function initRodadasState() {
    for (let i = 1; i <= 20; i++) {
        rodadasState[i] = {};
        rodadasMembersList.forEach(m => {
            rodadasState[i][m.name] = { sorteio: false, votacao: false };
        });
    }
}
initRodadasState();

const officialCategories = [
    "Filme Brasileiro", "Terror", "Igual ou acima de 4 Estrelas", "Diretor Favorito", "Filme com mais de 3hrs", "Documentário", "Cinema Independente", "Curta", "Animação", "Filme por país", "Máximo 5k de vistos", "Filme com até 90min", "Filme pela capa/poster", "Clássico que ninguém viu", "Filme com ator/atriz favorito(a)", "Romance", "Ação", "Biografia/fatos reais", "Filme Preto e Branco", "Vencedor do Oscar de Melhor Filme", "Bonito esteticamente", "Slice of life", "Cyberpunk", "Giallo", "Do ano do seu nascimento", "Futurista", "Filme por década", "Lugar que já conheceu ou quer conhecer", "Filme desconfortável", "De uma diretora", "Tema de interesse próprio", "Primeiro longa de um diretor(a)", "Evento histórico", "Lugar extremo"
];

let completedCategories = {
    "Filme Brasileiro": true,
    "Animação": true,
    "Diretor Favorito": true
};

let moviesData = [
    { 
        id: 1, title: "Memórias de um Assassino", director: "Bong Joon-ho", year: "2003", country: "Coreia do Sul", indicated: "Derp", indDate: "10 ago 2026", watched: "15 ago 2026", rodada: 1, indicationType: "votacao", category: "Filme desconfortável", poster: "",
        votes: { "Rayane": 5.0, "Malena": 5.0, "Rebeca": 4.5, "Kamila": 5.0, "Derp": 5.0, "Matheus": 4.5, "Mylena": 4.5, "Mudsaga": 4.5 }
    },
    { 
        id: 2, title: "Central do Brasil", director: "Walter Salles", year: "1998", country: "Brasil", indicated: "Matheus", indDate: "01 ago 2026", watched: "08 ago 2026", rodada: 1, indicationType: "sorteio", category: "Filme Brasileiro", poster: "",
        votes: { "Rayane": 4.7, "Malena": 4.7, "Rebeca": 4.7, "Kamila": 4.7, "Derp": 4.7, "Matheus": 4.7, "Mylena": 4.7, "Mudsaga": 4.7 }
    },
    { 
        id: 3, title: "Perfect Blue", director: "Satoshi Kon", year: "1997", country: "Japão", indicated: "Mylena", indDate: "12 ago 2026", watched: "18 ago 2026", rodada: 2, indicationType: "votacao", category: "Animação", poster: "",
        votes: { "Rayane": 4.6, "Malena": 4.6, "Rebeca": 4.6, "Kamila": 4.6, "Derp": 4.6, "Matheus": 4.6, "Mylena": 4.6, "Mudsaga": 4.6 }
    },
    { 
        id: 4, title: "Paris, Texas", director: "Wim Wenders", year: "1984", country: "Alemanha", indicated: "Malena", indDate: "15 ago 2026", watched: "20 ago 2026", rodada: 2, indicationType: "sorteio", category: "Diretor Favorito", poster: "",
        votes: { "Rayane": 4.5, "Malena": 4.5, "Rebeca": 4.5, "Kamila": 4.5, "Derp": 4.5, "Matheus": 4.5, "Mylena": 4.5, "Mudsaga": 4.5 }
    },
    { 
        id: 5, title: "A Chegada", director: "Denis Villeneuve", year: "2016", country: "Estados Unidos", indicated: "Rebeca", indDate: "18 ago 2026", watched: "22 ago 2026", rodada: 3, indicationType: "votacao", category: "Futurista", poster: "",
        votes: { "Rayane": 4.4, "Malena": 4.4, "Rebeca": 4.4, "Kamila": 4.4, "Derp": 4.4, "Matheus": 4.4, "Mylena": 4.4, "Mudsaga": 4.4 }
    }
];

let estreiasData = [
    { title: "Nosferatu", director: "Robert Eggers", genre: "Terror / Suspense", year: 2027, month: "Janeiro", platformLogo: "", poster: "" },
    { title: "Mickey 17", director: "Bong Joon-ho", genre: "Ficção Científica", year: 2027, month: "Fevereiro", platformLogo: "", poster: "" },
    { title: "Exemplo 2026", director: "Diretor Teste", genre: "Drama", year: 2026, month: "Agosto", platformLogo: "", poster: "" }
];

let selectedEstreiaYear = 2026;
let selectedEstreiaMonth = "Todos";
const allMonths = ["Todos", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
let editingEstreiaIndex = null;

function calculateMovieAverage(movie) {
    if (!movie || !movie.votes) return 0;
    const scores = Object.values(movie.votes);
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, val) => acc + Number(val), 0);
    return sum / scores.length;
}

// TELA DE SELEÇÃO DE PERFIS
function renderLoginScreen() {
    const grid = document.getElementById('login-members-grid');
    if (!grid) return;
    grid.innerHTML = '';

    membersData.forEach(m => {
        const btn = document.createElement('div');
        btn.className = 'profile-bubble-btn';
        btn.innerHTML = `
            <div class="profile-avatar-circle">
                <div class="profile-badge-edit">✏️</div>
                ${m.avatar ? `<img src="${m.avatar}" alt="${m.name}">` : `<span>${m.name}</span>`}
                <input type="file" class="login-avatar-file-input" accept="image/*" style="display: none;">
            </div>
            <div class="profile-info-pill">
                <span class="profile-user-name">${m.name}</span>
            </div>
        `;

        const fileInput = btn.querySelector('.login-avatar-file-input');

        btn.addEventListener('click', () => {
            if (isEditingProfiles) {
                fileInput.click();
            } else {
            loggedInUser = m.name;
            
            // 1. Esconde a tela de perfis
            document.getElementById('login-screen').style.display = 'none';
            
            // 2. Oculta o botão de "Entrar" do topo
            const btnLoginTop = document.getElementById('btn-open-login');
            if (btnLoginTop) btnLoginTop.style.display = 'none';
            
            // 3. Exibe o bloco de perfil logado no topo e injeta o nome e o avatar
            const navProfileSwitch = document.getElementById('nav-profile-switch');
            if (navProfileSwitch) {
                navProfileSwitch.style.display = 'flex';
                
                const nameEl = document.getElementById('current-user-name');
                const avatarEl = document.getElementById('current-user-avatar');
                
                if (nameEl) nameEl.innerText = m.name;
                if (avatarEl) {
                    if (m.avatar) {
                        avatarEl.innerHTML = `<img src="${m.avatar}">`;
                    } else {
                        avatarEl.innerHTML = m.name.substring(0, 2).toUpperCase();
                    }
                }
            }

            renderApp();
        }
        });
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    m.avatar = ev.target.result;
                    renderLoginScreen();
                    renderApp();
                    updateNavbarProfile();
                };
                reader.readAsDataURL(file);
            }
        });

        grid.appendChild(btn);
    });
}

const btnToggleEditMode = document.getElementById('btn-toggle-edit-mode');
const loginScreenEl = document.getElementById('login-screen');
const loginHeading = document.getElementById('login-screen-heading');

if (btnToggleEditMode) {
    btnToggleEditMode.addEventListener('click', () => {
        isEditingProfiles = !isEditingProfiles;
        if (isEditingProfiles) {
            btnToggleEditMode.innerText = "Pronto";
            btnToggleEditMode.classList.add('active');
            loginScreenEl.classList.add('editing-mode');
            loginHeading.innerText = "Escolha quem editar a foto";
        } else {
            btnToggleEditMode.innerText = "Editar Perfis";
            btnToggleEditMode.classList.remove('active');
            loginScreenEl.classList.remove('editing-mode');
            loginHeading.innerText = "Quem está assistindo?";
        }
        renderLoginScreen();
    });
}

function updateNavbarProfile() {
    const nameEl = document.getElementById('current-user-name');
    const avatarEl = document.getElementById('current-user-avatar');
    if (!nameEl || !avatarEl) return;

    if (loggedInUser) {
        const member = membersData.find(m => m.name === loggedInUser);
        nameEl.innerText = loggedInUser;
        if (member && member.avatar) {
            avatarEl.innerHTML = `<img src="${member.avatar}">`;
        } else {
            avatarEl.innerHTML = loggedInUser.substring(0,2).toUpperCase();
        }
    } else {
        nameEl.innerText = "Selecionar Usuário";
        avatarEl.innerHTML = "👤";
    }
}

const navProfileSwitch = document.getElementById('nav-profile-switch');
if (navProfileSwitch) {
    navProfileSwitch.addEventListener('click', () => {
        isEditingProfiles = false;
        if (btnToggleEditMode) {
            btnToggleEditMode.innerText = "Editar Perfis";
            btnToggleEditMode.classList.remove('active');
        }
        if (loginScreenEl) loginScreenEl.classList.remove('editing-mode');
        if (loginHeading) loginHeading.innerText = "Quem está assistindo?";
        document.getElementById('login-screen').style.display = 'flex';
        renderLoginScreen();
    });
}

// RENDERIZAÇÃO DA ABA "FILMES ASSISTIDOS"
function renderFilmesAssistidos() {
    const container = document.getElementById('assistidos-grid-container');
    if (!container) return;
    container.innerHTML = '';

    let sortedList = [...moviesData];
    if (currentSortAssistidos === "maior-media") {
        sortedList.sort((a, b) => calculateMovieAverage(b) - calculateMovieAverage(a));
    } else if (currentSortAssistidos === "menor-media") {
        sortedList.sort((a, b) => calculateMovieAverage(a) - calculateMovieAverage(b));
    } else if (currentSortAssistidos === "historico") {
        sortedList.reverse();
    }

    sortedList.forEach((movie) => {
        const originalIndex = moviesData.indexOf(movie);
        const avgScore = calculateMovieAverage(movie).toFixed(1);

        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <button class="movie-edit-btn" title="Editar informações do filme">✏️</button>
            <div class="movie-poster-container" title="Clique para adicionar pôster vertical">
                <span>+ Adicionar Pôster Vertical</span>
                <img src="${movie.poster}" style="display: ${movie.poster ? 'block' : 'none'};">
                <input type="file" class="movie-poster-input" accept="image/*" style="display:none;">
            </div>
            <div class="movie-card-body">
                <div class="movie-title-row">
                    <span class="movie-title" title="Clique para ver ou votar">${movie.title}</span>
                    <span class="movie-rating">★ ${avgScore}</span>
                </div>
                <div class="movie-meta-grid">
                    <div class="movie-meta-item"><strong>DIRETOR:</strong> ${movie.director}</div>
                    <div class="movie-meta-item"><strong>ANO/PAÍS:</strong> ${movie.year} · ${movie.country}</div>
                    <div class="movie-meta-item"><strong>CATEGORIA:</strong> ${movie.category || 'Filme Brasileiro'}</div>
                    <div class="movie-meta-item"><strong>INDICADO POR:</strong> ${movie.indicated} ${movie.indDate ? `(${movie.indDate})` : ''}</div>
                    <div class="movie-meta-item"><strong>VISTO POR ÚLTIMO:</strong> ${movie.watched}</div>
                </div>
            </div>
        `;

        card.querySelector('.movie-edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            editingMovieIndex = originalIndex;

            document.getElementById('assistidos-modal-title').innerText = "Editar filme assistido";
            document.getElementById('save-assistidos-btn').innerText = "Atualizar Filme";

            document.getElementById('add-title').value = movie.title || '';
            document.getElementById('add-director').value = movie.director || '';
            document.getElementById('add-year').value = movie.year || '';
            document.getElementById('add-country').value = movie.country || '';
            document.getElementById('add-indicated').value = movie.indicated || membersData[0].name;
            document.getElementById('add-rodada').value = movie.rodada || 1;
            document.getElementById('add-indication-type').value = movie.indicationType || 'sorteio';
            document.getElementById('add-ind-date').value = movie.indDate || '';
            document.getElementById('add-category').value = movie.category || officialCategories[0];
            document.getElementById('add-watched').value = movie.watched || '';
            document.getElementById('add-rating').value = calculateMovieAverage(movie);

            document.getElementById('assistidos-modal').style.display = 'flex';
        });

        card.querySelector('.movie-title').addEventListener('click', () => {
            openVotesModal(originalIndex);
        });

        const posterContainer = card.querySelector('.movie-poster-container');
        const posterInput = card.querySelector('.movie-poster-input');
        const posterSpan = card.querySelector('span');

        if (movie.poster && posterSpan) posterSpan.style.display = 'none';

        posterContainer.addEventListener('click', () => posterInput.click());
        posterInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    movie.poster = ev.target.result;
                    renderApp();
                };
                reader.readAsDataURL(file);
            }
        });

        container.appendChild(card);
    });
}

const filterBtns = document.querySelectorAll('.assistidos-filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSortAssistidos = btn.getAttribute('data-sort');
        renderFilmesAssistidos();
    });
});

function openVotesModal(index) {
    currentActiveMovieIndex = index;
    const movie = moviesData[index];
    const modal = document.getElementById('votes-modal');
    const titleElem = document.getElementById('modal-movie-title');
    if (titleElem) titleElem.innerText = `Votações: ${movie.title}`;

    const listContainer = document.getElementById('modal-votes-list');
    listContainer.innerHTML = '';

    membersData.forEach(member => {
        const currentScore = movie.votes[member.name] !== undefined ? Number(movie.votes[member.name]) : 4.5;
        let optionsHtml = '';
        for (let i = 0.5; i <= 5.0; i += 0.5) {
            const valStr = i.toFixed(1);
            const isSelected = Math.abs(currentScore - i) < 0.01 ? 'selected' : '';
            optionsHtml += `<option value="${valStr}" ${isSelected}>${valStr}</option>`;
        }

        const row = document.createElement('div');
        row.className = 'vote-row';
        row.innerHTML = `
            <span style="font-weight: 600;">${member.name}</span>
            <select class="vote-score-select" data-member="${member.name}">
                ${optionsHtml}
            </select>
        `;
        listContainer.appendChild(row);

        row.querySelector('.vote-score-select').addEventListener('change', (e) => {
            movie.votes[member.name] = parseFloat(e.target.value);
            document.getElementById('modal-movie-avg').innerText = calculateMovieAverage(movie).toFixed(1);
        });
    });

    document.getElementById('modal-movie-avg').innerText = calculateMovieAverage(movie).toFixed(1);
    modal.style.display = 'flex';
}

const closeVotesModalBtn = document.getElementById('close-votes-modal');
if (closeVotesModalBtn) {
    closeVotesModalBtn.addEventListener('click', () => {
        document.getElementById('votes-modal').style.display = 'none';
        renderApp();
    });
}

const addCategorySelect = document.getElementById('add-category');
if (addCategorySelect) {
    addCategorySelect.innerHTML = '';
    officialCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.innerText = cat;
        addCategorySelect.appendChild(opt);
    });
}

const addIndicatedSelect = document.getElementById('add-indicated');
if (addIndicatedSelect) {
    addIndicatedSelect.innerHTML = '';
    membersData.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.name;
        opt.innerText = m.name;
        addIndicatedSelect.appendChild(opt);
    });
}

const assistidosModal = document.getElementById('assistidos-modal');
const openAssistidosModalBtn = document.getElementById('open-assistidos-modal-btn');
const closeAssistidosModal = document.getElementById('close-assistidos-modal');
const cancelAssistidosModal = document.getElementById('cancel-assistidos-modal');
const saveAssistidosBtn = document.getElementById('save-assistidos-btn');

if (openAssistidosModalBtn) {
    openAssistidosModalBtn.addEventListener('click', () => {
        editingMovieIndex = null;
        document.getElementById('assistidos-modal-title').innerText = "Adicionar novo filme assistido";
        document.getElementById('save-assistidos-btn').innerText = "+ Salvar Filme";

        document.getElementById('add-title').value = '';
        document.getElementById('add-director').value = '';
        document.getElementById('add-year').value = '';
        document.getElementById('add-country').value = '';
        document.getElementById('add-indicated').value = membersData[0].name;
        document.getElementById('add-rodada').value = '1';
        document.getElementById('add-indication-type').value = 'sorteio';
        document.getElementById('add-ind-date').value = '';
        document.getElementById('add-category').value = officialCategories[0];
        document.getElementById('add-watched').value = '';
        document.getElementById('add-rating').value = '';

        assistidosModal.style.display = 'flex';
    });
}
if (closeAssistidosModal) closeAssistidosModal.addEventListener('click', () => assistidosModal.style.display = 'none');
if (cancelAssistidosModal) cancelAssistidosModal.addEventListener('click', () => assistidosModal.style.display = 'none');

if (saveAssistidosBtn) {
    saveAssistidosBtn.addEventListener('click', () => {
        const title = document.getElementById('add-title').value.trim();
        const director = document.getElementById('add-director').value.trim();
        const year = document.getElementById('add-year').value.trim();
        const country = document.getElementById('add-country').value.trim();
        const indicated = document.getElementById('add-indicated').value;
        const rodadaNum = parseInt(document.getElementById('add-rodada').value) || 1;
        const indicationType = document.getElementById('add-indication-type').value;
        const indDate = document.getElementById('add-ind-date').value.trim();
        const category = document.getElementById('add-category').value;
        const watched = document.getElementById('add-watched').value.trim();
        const rating = parseFloat(document.getElementById('add-rating').value) || 4.5;

        if (!title) {
            alert('Informe ao menos o título do filme.');
            return;
        }

        if (editingMovieIndex !== null) {
            let movie = moviesData[editingMovieIndex];
            movie.title = title;
            movie.director = director || 'Desconhecido';
            movie.year = year || '2026';
            movie.country = country || 'Internacional';
            movie.indicated = indicated;
            movie.rodada = rodadaNum;
            movie.indicationType = indicationType;
            movie.indDate = indDate || 'Hoje';
            movie.category = category || 'Filme Brasileiro';
            movie.watched = watched || 'Recente';

            membersData.forEach(m => {
                if (movie.votes[m.name] === undefined) {
                    movie.votes[m.name] = rating;
                }
            });
        } else {
            let defaultVotes = {};
            membersData.forEach(m => defaultVotes[m.name] = rating);

            moviesData.unshift({
                id: Date.now(),
                title,
                director: director || 'Desconhecido',
                year: year || '2026',
                country: country || 'Internacional',
                indicated,
                rodada: rodadaNum,
                indicationType: indicationType,
                indDate: indDate || 'Hoje',
                category: category || 'Filme Brasileiro',
                watched: watched || 'Recente',
                poster: '',
                votes: defaultVotes
            });
        }

        assistidosModal.style.display = 'none';
        renderApp();
    });
}

function renderMembersSection(sortedMembers) {
    const gridContainer = document.getElementById('members-grid');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    sortedMembers.forEach((member, index) => {
        const memberMovies = [...moviesData].sort((a, b) => {
            const scoreA = (a.votes && a.votes[member.name] !== undefined) ? Number(a.votes[member.name]) : calculateMovieAverage(a);
            const scoreB = (b.votes && b.votes[member.name] !== undefined) ? Number(b.votes[member.name]) : calculateMovieAverage(b);
            return scoreB - scoreA;
        });

        const firstMovie = memberMovies[0];
        const secondMovie = memberMovies[1];
        const title1 = firstMovie ? firstMovie.title : "Nenhum filme";
        const title2 = secondMovie ? secondMovie.title : "Nenhum filme";
        const poster1 = (firstMovie && firstMovie.poster) ? firstMovie.poster : "";
        const poster2 = (secondMovie && secondMovie.poster) ? secondMovie.poster : "";

        const score1 = (firstMovie && firstMovie.votes && firstMovie.votes[member.name] !== undefined) 
            ? Number(firstMovie.votes[member.name]).toFixed(1) 
            : (firstMovie ? calculateMovieAverage(firstMovie).toFixed(1) : "-");

        const score2 = (secondMovie && secondMovie.votes && secondMovie.votes[member.name] !== undefined) 
            ? Number(secondMovie.votes[member.name]).toFixed(1) 
            : (secondMovie ? calculateMovieAverage(secondMovie).toFixed(1) : "-");

        const card = document.createElement('div');
        card.className = 'member-card';

        let letterboxdContent = '';
        if (member.letterboxd && member.letterboxd.trim() !== '') {
            let hrefVal = member.letterboxd.trim();
            if (!hrefVal.startsWith('http://') && !hrefVal.startsWith('https://')) hrefVal = 'https://' + hrefVal;
            letterboxdContent = `
                <div class="letterboxd-link-container">
                    <a href="${hrefVal}" target="_blank" class="letterboxd-link">🔗 ${member.letterboxd}</a>
                    <button class="lb-icon-btn edit-lb-btn" title="Editar link">✏️</button>
                </div>
            `;
        } else {
            letterboxdContent = `<input type="text" class="letterboxd-input" placeholder="Cole o link do Letterboxd..." value="${member.letterboxd}">`;
        }

        card.innerHTML = `
            <div class="member-header ${member.class}">
                <div class="avatar-upload-container" title="Clique para adicionar foto">
                    <span>${member.avatar ? '' : member.name}</span>
                    <img alt="Avatar" src="${member.avatar}" style="display: ${member.avatar ? 'block' : 'none'};">
                    <input type="file" class="avatar-input" accept="image/*">
                </div>
            </div>
            <div class="member-body">
                <div class="member-name-row">
                    <span class="member-name">${member.name}</span>
                    <span class="member-stats">${member.victories} vitórias · #${index + 1}</span>
                </div>
                <div class="member-desc">${member.desc}</div>
                <div class="letterboxd-box" id="lb-box-${member.id}">
                    ${letterboxdContent}
                </div>
                <div class="top-movies-list">
                    <div class="top-movie-item">
                        <div class="top-movie-left">
                            <img class="top-movie-thumb" src="${poster1}" style="display: ${poster1 ? 'block' : 'none'};">
                            <span class="top-movie-title">${title1}</span>
                        </div>
                        <span class="top-movie-rating">${score1}</span>
                    </div>
                    <div class="top-movie-item">
                        <div class="top-movie-left">
                            <img class="top-movie-thumb" src="${poster2}" style="display: ${poster2 ? 'block' : 'none'};">
                            <span class="top-movie-title">${title2}</span>
                        </div>
                        <span class="top-movie-rating">${score2}</span>
                    </div>
                </div>
            </div>
        `;
        gridContainer.appendChild(card);

        const avatarContainer = card.querySelector('.avatar-upload-container');
        const avatarInput = card.querySelector('.avatar-input');
        if (avatarContainer && avatarInput) {
            avatarContainer.addEventListener('click', () => avatarInput.click());
            avatarInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(ev) {
                        member.avatar = ev.target.result;
                        renderApp();
                        updateNavbarProfile();
                        renderLoginScreen();
                    }
                    reader.readAsDataURL(file);
                }
            });
        }
    });
}

function renderRankingSection(sortedMembers, maxVictories) {
    const container = document.getElementById('ranking-rows-container');
    if (!container) return;
    container.innerHTML = '';

    sortedMembers.forEach((member, index) => {
        const percentage = (member.victories / maxVictories) * 100;
        let posDisplay = index === 0 ? '👑' : (index < 9 ? '0' + (index + 1) : index + 1);

        const row = document.createElement('div');
        row.className = 'ranking-row';
        row.innerHTML = `
            <div class="rank-pos">${posDisplay}</div>
            <div class="cinefilo-info">
                <div class="cinefilo-avatar">
                    ${member.avatar ? `<img src="${member.avatar}">` : `<span>${member.name.substring(0,2).toUpperCase()}</span>`}
                </div>
                <div><div class="cinefilo-name">${member.name}</div></div>
            </div>
            <div>${member.victories} vitórias</div>
            <div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${percentage}%;"></div>
                </div>
            </div>
            <div class="victories-controls">
                <button class="victory-btn btn-minus" title="Remover vitória">-</button>
                <span class="victories-count">${member.victories}</span>
                <button class="victory-btn btn-plus" title="Adicionar vitória">+</button>
            </div>
        `;
        container.appendChild(row);

        row.querySelector('.btn-plus').addEventListener('click', () => {
            member.victories++;
            renderApp();
        });
        row.querySelector('.btn-minus').addEventListener('click', () => {
            if (member.victories > 0) {
                member.victories--;
                renderApp();
            }
        });
    });
}

function renderDirectorsSection() {
    const container = document.getElementById('directors-grid-container');
    if (!container) return;
    container.innerHTML = '';

    let directorsMap = {};
    moviesData.forEach(movie => {
        const dirName = movie.director || "Desconhecido";
        if (!directorsMap[dirName]) directorsMap[dirName] = { name: dirName, movies: [] };
        directorsMap[dirName].movies.push(movie);
    });

    Object.values(directorsMap).forEach((dirObj) => {
        let totalScore = 0;
        dirObj.movies.forEach(m => totalScore += calculateMovieAverage(m));
        const dirAvg = dirObj.movies.length > 0 ? (totalScore / dirObj.movies.length).toFixed(1) : "0.0";
        const initials = dirObj.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const customAvatar = directorsCustomAvatars[dirObj.name] || "";

        const card = document.createElement('div');
        card.className = 'director-card';

        let thumbsHtml = '';
        dirObj.movies.forEach(m => {
            thumbsHtml += `<img class="director-work-thumb" src="${m.poster}" style="display: ${m.poster ? 'block' : 'none'};" title="${m.title}">`;
        });
        if(thumbsHtml === '') thumbsHtml = '<span style="font-size:11px; color:#555;">Nenhum pôster</span>';

        card.innerHTML = `
            <div class="director-top-row">
                <div class="director-avatar-upload" title="Clique para adicionar foto do diretor">
                    <span style="display: ${customAvatar ? 'none' : 'block'};">${initials}</span>
                    <img src="${customAvatar}" style="display: ${customAvatar ? 'block' : 'none'};">
                    <input type="file" class="director-avatar-input" accept="image/*">
                </div>
                <div class="director-label">DIRETOR</div>
            </div>
            <div class="director-info">
                <h3>${dirObj.name}</h3>
                <div class="director-works-count">${dirObj.movies.length} obra${dirObj.movies.length > 1 ? 's' : ''} assistida${dirObj.movies.length > 1 ? 's' : ''}</div>
            </div>
            <div class="director-works-list">
                ${thumbsHtml}
                <div class="director-avg-badge">⭐ ${dirAvg}</div>
            </div>
        `;
        container.appendChild(card);

        const avatarUploadBox = card.querySelector('.director-avatar-upload');
        const avatarInput = card.querySelector('.director-avatar-input');
        if (avatarUploadBox && avatarInput) {
            avatarUploadBox.addEventListener('click', () => avatarInput.click());
            avatarInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(ev) {
                        directorsCustomAvatars[dirObj.name] = ev.target.result;
                        renderApp();
                    }
                    reader.readAsDataURL(file);
                }
            });
        }
    });
}

function renderAnoSection() {
    const container = document.getElementById('year-timeline-container');
    if (!container) return;
    container.innerHTML = '';

    let yearsMap = {};
    moviesData.forEach(movie => {
        const yr = movie.year || "2026";
        if (!yearsMap[yr]) yearsMap[yr] = [];
        yearsMap[yr].push(movie);
    });

    Object.keys(yearsMap).sort((a, b) => b - a).forEach(yr => {
        const yearMovies = yearsMap[yr];
        const groupDiv = document.createElement('div');
        groupDiv.className = 'year-group';

        let moviesHtml = '';
        yearMovies.forEach(m => {
            moviesHtml += `
                <div class="year-movie-card">
                    <img class="year-movie-thumb" src="${m.poster}" style="display: ${m.poster ? 'block' : 'none'};">
                    <div class="year-movie-info">
                        <h4>${m.title}</h4>
                        <p>${m.director}</p>
                    </div>
                </div>
            `;
        });

        groupDiv.innerHTML = `
            <div class="year-label-box">
                <div class="year-title">${yr}</div>
                <div class="year-subtitle">${yearMovies.length} filme${yearMovies.length > 1 ? 's' : ''}</div>
            </div>
            <div class="year-movies-list">${moviesHtml}</div>
        `;
        container.appendChild(groupDiv);
    });
}

function renderCategoriasSection() {
    const container = document.getElementById('categories-grid-container');
    if (!container) return;
    container.innerHTML = '';

    officialCategories.forEach(catName => {
        const isCompleted = !!completedCategories[catName];
        const matchingMovies = moviesData.filter(m => m.category && m.category.toLowerCase() === catName.toLowerCase());

        const card = document.createElement('div');
        card.className = `category-card ${isCompleted ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="category-left">
                <div class="category-checkbox" title="Marcar como vista">${isCompleted ? '✓' : ''}</div>
                <div class="category-info">
                    <h3>${catName}</h3>
                    <p>${isCompleted ? 'Categoria concluída' : 'Aguardando uma sessão'}</p>
                </div>
            </div>
            <div class="category-badge-count">${matchingMovies.length} filme${matchingMovies.length !== 1 ? 's' : ''}</div>
        `;

        card.querySelector('.category-checkbox').addEventListener('click', (e) => {
            e.stopPropagation();
            completedCategories[catName] = !isCompleted;
            renderApp();
        });

        card.addEventListener('click', () => {
            document.getElementById('cat-modal-title').innerText = `Filmes: ${catName}`;
            const listContainer = document.getElementById('cat-modal-movies-list');
            listContainer.innerHTML = '';
            if (matchingMovies.length === 0) {
                listContainer.innerHTML = `<p style="color: var(--text-muted); text-align:center; padding: 20px;">Nenhum filme cadastrado nesta categoria ainda.</p>`;
            } else {
                matchingMovies.forEach(m => {
                    const item = document.createElement('div');
                    item.className = 'cat-movie-item';
                    item.innerHTML = `
                        <div class="cat-movie-left">
                            <img class="cat-movie-thumb" src="${m.poster}" style="display: ${m.poster ? 'block' : 'none'};">
                            <div>
                                <h4 style="font-family: 'Playfair Display', serif; font-size: 15px; color: var(--text-main);">${m.title}</h4>
                                <p style="font-size: 12px; color: var(--text-muted);">Indicado por: ${m.indicated} · ${m.year}</p>
                            </div>
                        </div>
                        <span style="color: var(--primary-orange); font-weight: 600; font-size: 13px;">⭐ ${calculateMovieAverage(m).toFixed(1)}</span>
                    `;
                    listContainer.appendChild(item);
                });
            }
            document.getElementById('category-movies-modal').style.display = 'flex';
        });

        container.appendChild(card);
    });
}

const closeCatModal = document.getElementById('close-cat-modal');
if (closeCatModal) {
    closeCatModal.addEventListener('click', () => {
        document.getElementById('category-movies-modal').style.display = 'none';
    });
}

function syncRodadasStatesFromMovies() {
    for (let i = 1; i <= 20; i++) {
        rodadasMembersList.forEach(m => {
            if (!rodadasState[i][m.name]) rodadasState[i][m.name] = { sorteio: false, votacao: false };
            rodadasState[i][m.name].sorteio = false;
            rodadasState[i][m.name].votacao = false;
        });
    }

    moviesData.forEach(mov => {
        const rNum = Number(mov.rodada);
        const indName = mov.indicated;
        const iType = mov.indicationType;
        if (rNum >= 1 && rNum <= 20 && indName) {
            const matchedM = rodadasMembersList.find(m => m.name.toLowerCase() === indName.toLowerCase());
            if (matchedM) {
                if (iType === 'sorteio') rodadasState[rNum][matchedM.name].sorteio = true;
                else if (iType === 'votacao') rodadasState[rNum][matchedM.name].votacao = true;
            }
        }
    });
}

function renderRodadasSection() {
    syncRodadasStatesFromMovies();

    const numbersContainer = document.getElementById('rodadas-numbers-container');
    if (!numbersContainer) return;
    numbersContainer.innerHTML = '';

    for (let i = 1; i <= 20; i++) {
        const numStr = i < 10 ? '0' + i : '' + i;
        const btn = document.createElement('button');
        btn.className = 'rodada-num-btn' + (selectedRodada === i ? ' active' : '');
        btn.innerText = numStr;
        btn.addEventListener('click', () => {
            selectedRodada = i;
            renderRodadasSection();
        });
        numbersContainer.appendChild(btn);
    }

    const curDisplay = document.getElementById('current-rodada-display');
    if (curDisplay) curDisplay.innerText = selectedRodada < 10 ? '0' + selectedRodada : selectedRodada;

    const membersGridContainer = document.getElementById('rodadas-members-container');
    if (!membersGridContainer) return;
    membersGridContainer.innerHTML = '';

    rodadasMembersList.forEach(m => {
        const memberState = rodadasState[selectedRodada][m.name] || { sorteio: false, votacao: false };
        const originalMember = membersData.find(mem => mem.name.toLowerCase() === m.name.toLowerCase());
        const memberAvatar = originalMember ? originalMember.avatar : '';

        const matchedMovies = moviesData.filter(mov => 
            Number(mov.rodada) === Number(selectedRodada) && 
            mov.indicated && 
            mov.indicated.toLowerCase() === m.name.toLowerCase()
        );

        let moviesHtml = '';
        if (matchedMovies.length > 0) {
            moviesHtml = '<div class="rodada-movies-container">';
            matchedMovies.forEach(mov => {
                moviesHtml += `
                    <div class="rodada-movie-indicated">
                        ${mov.poster ? `<img src="${mov.poster}" class="rodada-movie-thumb-small">` : '🎬'} 
                        <span>${mov.title}</span>
                    </div>
                `;
            });
            moviesHtml += '</div>';
        }

        const card = document.createElement('div');
        card.className = 'rodada-member-card';
        card.innerHTML = `
            <div class="rodada-card-user">
                <div class="rodada-avatar-circle ${memberAvatar ? '' : m.bg}">
                    ${memberAvatar ? `<img src="${memberAvatar}">` : m.initials}
                </div>
                <div class="rodada-user-info">
                    <span class="rodada-user-name">${m.name}</span>
                </div>
            </div>
            ${moviesHtml}
            <div class="rodada-checkboxes-row">
                <div class="rodada-check-item check-sorteio ${memberState.sorteio ? 'checked' : ''}">
                    <div class="rodada-box"></div>
                    <span>Sorteio</span>
                </div>
                <div class="rodada-check-item check-votacao ${memberState.votacao ? 'checked' : ''}">
                    <div class="rodada-box"></div>
                    <span>Votação</span>
                </div>
            </div>
        `;

        const btnSorteio = card.querySelector('.check-sorteio');
        btnSorteio.addEventListener('click', () => {
            memberState.sorteio = !memberState.sorteio;
            btnSorteio.classList.toggle('checked', memberState.sorteio);
        });

        const btnVotacao = card.querySelector('.check-votacao');
        btnVotacao.addEventListener('click', () => {
            memberState.votacao = !memberState.votacao;
            btnVotacao.classList.toggle('checked', memberState.votacao);
        });

        membersGridContainer.appendChild(card);
    });
}

function getPosterArtClass(countryName, title) {
    const cLower = (countryName || '').toLowerCase().trim();
    const tLower = (title || '').toLowerCase().trim();
    if (cLower.includes('coreia') || tLower.includes('memórias')) return 'poster-art-coreia';
    if (cLower.includes('brasil') || tLower.includes('central')) return 'poster-art-brasil';
    if (cLower.includes('jap') || tLower.includes('perfect')) return 'poster-art-japao';
    if (cLower.includes('alemanha') || tLower.includes('paris')) return 'poster-art-alemanha';
    if (cLower.includes('estados') || cLower.includes('eua') || tLower.includes('chegada')) return 'poster-art-eua';
    return 'poster-art-default';
}

function renderPaisSection() {
    const filtersContainer = document.getElementById('country-filters-container');
    const gridContainer = document.getElementById('country-movies-container');
    if (!filtersContainer || !gridContainer) return;

    const countrySet = new Set();
    moviesData.forEach(m => {
        if (m.country && m.country.trim()) countrySet.add(m.country.trim());
    });

    const uniqueCountries = ["Todos", ...Array.from(countrySet).sort((a, b) => a.localeCompare(b, 'pt-BR'))];
    if (!uniqueCountries.includes(selectedCountryFilter)) selectedCountryFilter = "Todos";

    filtersContainer.innerHTML = '';
    uniqueCountries.forEach(country => {
        const pill = document.createElement('button');
        pill.className = 'country-filter-pill ' + (selectedCountryFilter === country ? 'active' : '');
        pill.innerText = country;
        pill.addEventListener('click', () => {
            selectedCountryFilter = country;
            renderPaisSection();
        });
        filtersContainer.appendChild(pill);
    });

    const filteredMovies = selectedCountryFilter === "Todos" 
        ? moviesData 
        : moviesData.filter(m => (m.country || '').trim().toLowerCase() === selectedCountryFilter.toLowerCase());

    gridContainer.innerHTML = '';
    filteredMovies.forEach(movie => {
        const originalIndex = moviesData.indexOf(movie);
        const avgScore = calculateMovieAverage(movie).toFixed(1);
        const artClass = getPosterArtClass(movie.country, movie.title);

        const card = document.createElement('div');
        card.className = 'country-movie-card';
        card.innerHTML = `
            <div class="country-poster-cover ${artClass}">
                ${movie.poster ? `<img src="${movie.poster}" alt="${movie.title}">` : ''}
            </div>
            <div class="country-movie-body">
                <div class="country-tag-row">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <span>${(movie.country || 'INTERNACIONAL').toUpperCase()}</span>
                </div>
                <h3 class="country-movie-title" title="Clique para ver votos">${movie.title}</h3>
                <div class="country-movie-meta">${movie.director}, ${movie.year}</div>
                <div class="country-movie-score">
                    <span class="star">★</span>
                    <span class="score-num">${avgScore}</span>
                </div>
            </div>
        `;

        card.querySelector('.country-movie-title').addEventListener('click', () => {
            openVotesModal(originalIndex);
        });

        gridContainer.appendChild(card);
    });
}

function renderEstreiasSection() {
    const yearsContainer = document.getElementById('estreias-years-container');
    const monthsContainer = document.getElementById('estreias-months-container');
    const gridContainer = document.getElementById('estreias-grid-container');
    if (!yearsContainer || !monthsContainer || !gridContainer) return;

    let yearsSet = new Set([2026, 2027]);
    estreiasData.forEach(e => { if (e.year) yearsSet.add(Number(e.year)); });
    const availableYears = Array.from(yearsSet).sort((a,b) => a - b);
    if (!availableYears.includes(selectedEstreiaYear)) selectedEstreiaYear = availableYears[0];

    yearsContainer.innerHTML = '';
    availableYears.forEach(yr => {
        const btn = document.createElement('button');
        btn.className = 'year-tab-btn ' + (selectedEstreiaYear === yr ? 'active' : '');
        btn.innerText = yr;
        btn.addEventListener('click', () => {
            selectedEstreiaYear = yr;
            renderEstreiasSection();
        });
        yearsContainer.appendChild(btn);
    });

    monthsContainer.innerHTML = '';
    allMonths.forEach(m => {
        const mBtn = document.createElement('button');
        mBtn.className = 'month-tab-btn ' + (selectedEstreiaMonth === m ? 'active' : '');
        mBtn.innerText = m;
        mBtn.addEventListener('click', () => {
            selectedEstreiaMonth = m;
            renderEstreiasSection();
        });
        monthsContainer.appendChild(mBtn);
    });

    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const currentYearNum = currentDate.getFullYear();

    const filteredEstreias = estreiasData.filter(e => {
        const eYear = Number(e.year) || 2026;
        const eMonth = (e.month || 'Janeiro').toLowerCase();
        const matchesYear = (eYear === selectedEstreiaYear);
        const matchesMonth = (selectedEstreiaMonth === "Todos" || eMonth === selectedEstreiaMonth.toLowerCase());
        return matchesYear && matchesMonth;
    });

    gridContainer.innerHTML = '';
    filteredEstreias.forEach((estreia) => {
        const originalIndex = estreiasData.indexOf(estreia);
        const monthNameToIndex = { "janeiro":0, "fevereiro":1, "março":2, "abril":3, "maio":4, "junho":5, "julho":6, "agosto":7, "setembro":8, "outubro":9, "novembro":10, "dezembro":11 };
        const estMonthIdx = monthNameToIndex[(estreia.month || 'janeiro').toLowerCase()] ?? 0;
        const isCurrentMonth = (Number(estreia.year) === currentYearNum && estMonthIdx === currentMonthIndex);

        const badgeBg = isCurrentMonth ? '#10b981' : 'rgba(255,69,0,0.15)';
        const badgeText = isCurrentMonth ? `🔥 ${estreia.month} ${estreia.year} (ESTREIA)` : `${estreia.month} ${estreia.year}`;

        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <button class="estreia-edit-icon" title="Editar estreia">✏️</button>
            <div class="movie-poster-container" title="Clique para adicionar foto/pôster do filme">
                <span>+ Adicionar Pôster</span>
                <img src="${estreia.poster}" style="display: ${estreia.poster ? 'block' : 'none'};">
                <input type="file" class="estreia-poster-input" accept="image/*" style="display:none;">
            </div>
            <div class="movie-card-body">
                <div class="movie-title-row">
                    <span class="movie-title">${estreia.title}</span>
                    <span class="movie-rating" style="font-size: 11px; background: ${badgeBg}; color: ${isCurrentMonth ? '#fff' : 'var(--primary-orange)'}; padding: 3px 8px; border-radius: 4px; font-weight: 700;">${badgeText}</span>
                </div>
                <div class="movie-meta-grid">
                    <div class="movie-meta-item"><strong>Diretor:</strong> ${estreia.director}</div>
                    <div class="movie-meta-item"><strong>Gênero:</strong> ${estreia.genre}</div>
                    <div class="movie-meta-item" style="margin-top: 4px; display: flex; align-items: center; gap: 8px;">
                        <strong>LANÇAMENTO:</strong> 
                        <span class="platform-badge" title="Carregar Logo">
                            ${estreia.platformLogo ? `<img src="${estreia.platformLogo}" class="platform-logo-img">` : `<span class="platform-placeholder-text">+ Logo</span>`}
                            <input type="file" class="platform-logo-file-input" accept="image/*" style="display:none;">
                        </span>
                    </div>
                </div>
            </div>
        `;
        gridContainer.appendChild(card);

        card.querySelector('.estreia-edit-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            editingEstreiaIndex = originalIndex;
            document.getElementById('estreia-modal-title').innerText = "Editar Estreia";
            document.getElementById('estreia-title').value = estreia.title;
            document.getElementById('estreia-director').value = estreia.director;
            document.getElementById('estreia-year-input').value = estreia.year || 2026;
            document.getElementById('estreia-month-input').value = estreia.month || 'Janeiro';
            document.getElementById('estreia-genre').value = estreia.genre;
            document.getElementById('estreia-modal').style.display = 'flex';
        });

        const badgeEl = card.querySelector('.platform-badge');
        const logoFileInput = card.querySelector('.platform-logo-file-input');
        badgeEl.addEventListener('click', (e) => { e.stopPropagation(); logoFileInput.click(); });
        logoFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    estreia.platformLogo = ev.target.result;
                    renderEstreiasSection();
                }
                reader.readAsDataURL(file);
            }
        });

        const posterContainer = card.querySelector('.movie-poster-container');
        const posterInput = card.querySelector('.estreia-poster-input');
        const posterSpan = card.querySelector('span');
        if (estreia.poster && posterSpan) posterSpan.style.display = 'none';

        posterContainer.addEventListener('click', () => posterInput.click());
        posterInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    estreia.poster = ev.target.result;
                    renderEstreiasSection();
                }
                reader.readAsDataURL(file);
            }
        });
    });
}

const closeEstreiaModal = document.getElementById('close-estreia-modal');
const cancelEstreiaModal = document.getElementById('cancel-estreia-modal');
const saveEstreiaBtn = document.getElementById('save-estreia-btn');

if (closeEstreiaModal) closeEstreiaModal.addEventListener('click', () => document.getElementById('estreia-modal').style.display = 'none');
if (cancelEstreiaModal) cancelEstreiaModal.addEventListener('click', () => document.getElementById('estreia-modal').style.display = 'none');

if (saveEstreiaBtn) {
    saveEstreiaBtn.addEventListener('click', () => {
        const title = document.getElementById('estreia-title').value.trim();
        const director = document.getElementById('estreia-director').value.trim();
        const yearVal = parseInt(document.getElementById('estreia-year-input').value) || 2026;
        const monthVal = document.getElementById('estreia-month-input').value;
        const genre = document.getElementById('estreia-genre').value.trim();

        if (!title) {
            alert('Por favor, informe o título da estreia.');
            return;
        }

        if (editingEstreiaIndex !== null) {
            let est = estreiasData[editingEstreiaIndex];
            est.title = title;
            est.director = director || 'Desconhecido';
            est.genre = genre || 'Geral';
            est.year = yearVal;
            est.month = monthVal;
        } else {
            estreiasData.unshift({
                title,
                director: director || 'Desconhecido',
                genre: genre || 'Geral',
                year: yearVal,
                month: monthVal,
                platformLogo: '',
                poster: ''
            });
        }
        document.getElementById('estreia-modal').style.display = 'none';
        renderEstreiasSection();
    });
}

const openEstreiaModalBtn = document.getElementById('open-estreia-modal-btn');
if (openEstreiaModalBtn) {
    openEstreiaModalBtn.addEventListener('click', () => {
        editingEstreiaIndex = null;
        document.getElementById('estreia-modal-title').innerText = "Adicionar Nova Estreia";
        document.getElementById('estreia-title').value = '';
        document.getElementById('estreia-director').value = '';
        document.getElementById('estreia-year-input').value = selectedEstreiaYear;
        document.getElementById('estreia-month-input').value = selectedEstreiaMonth === "Todos" ? "Janeiro" : selectedEstreiaMonth;
        document.getElementById('estreia-genre').value = '';
        document.getElementById('estreia-modal').style.display = 'flex';
    });
}

const heroSection = document.getElementById('hero-section');
const heroFileInput = document.getElementById('hero-file-input');
const heroBgImg = document.getElementById('hero-bg-img');
const heroOverlay = document.getElementById('hero-overlay');
const heroPlaceholder = document.getElementById('hero-placeholder');

if (heroSection && heroFileInput) {
    heroSection.addEventListener('click', (e) => {
        if(e.target.closest('.hero-nav-container')) return;
        heroFileInput.click();
    });

    heroFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                heroBgImg.src = ev.target.result;
                heroBgImg.style.display = 'block';
                heroOverlay.style.display = 'block';
                heroPlaceholder.style.display = 'none';
            }
            reader.readAsDataURL(file);
        }
    });
}

function renderApp() {
    const sortedMembers = [...membersData].sort((a, b) => b.victories - a.victories);
    const maxVictories = Math.max(...sortedMembers.map(m => m.victories), 1);

    const statsMoviesCount = document.getElementById('stats-movies-count');
    if (statsMoviesCount) statsMoviesCount.innerText = moviesData.length;

    const uniqueDirectors = new Set(moviesData.map(m => (m.director || "").trim().toLowerCase()).filter(d => d !== ""));
    const statsDirectorsCount = document.getElementById('stats-directors-count');
    if (statsDirectorsCount) statsDirectorsCount.innerText = uniqueDirectors.size;

    const uniqueCountries = new Set(moviesData.map(m => (m.country || "").trim().toLowerCase()).filter(c => c !== ""));
    const statsCountriesCount = document.getElementById('stats-countries-count');
    if (statsCountriesCount) statsCountriesCount.innerText = uniqueCountries.size;

    renderMembersSection(sortedMembers);
    renderRankingSection(sortedMembers, maxVictories);
    renderFilmesAssistidos();
    renderDirectorsSection();
    renderAnoSection();
    renderCategoriasSection();
    renderRodadasSection();
    renderPaisSection();
    renderEstreiasSection();
}

const navItems = document.querySelectorAll('.nav-item-hero');
const sections = document.querySelectorAll('.content-section');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        sections.forEach(sec => sec.classList.remove('active'));

        item.classList.add('active');
        const targetId = item.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.add('active');

        if (targetId === 'pais') renderPaisSection();
        if (targetId === 'filmes-assistidos') renderFilmesAssistidos();
        if (targetId === 'ano') renderAnoSection();
        if (targetId === 'diretores') renderDirectorsSection();
        if (targetId === 'rodadas') renderRodadasSection();
        if (targetId === 'categorias') renderCategoriasSection();
    });
});

function setThemeColor(colorName) {
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add('theme-' + colorName);
    const currentMode = localStorage.getItem('gratia_mode') || 'theme-dark';
    document.body.classList.add(currentMode);
}

function toggleThemeMode() {
    if (document.body.classList.contains('theme-dark')) {
        document.body.classList.replace('theme-dark', 'theme-light');
        localStorage.setItem('gratia_mode', 'theme-light');
    } else {
        document.body.classList.replace('theme-light', 'theme-dark');
        localStorage.setItem('gratia_mode', 'theme-dark');
    }
}

// Oculta a tela de login inicial para abrir direto no modo de visualização livre
const initialLoginScreen = document.getElementById('login-screen');
if (initialLoginScreen) {
    initialLoginScreen.style.display = 'none';
}

// Inicializa a aplicação diretamente exibindo o catálogo
renderApp();

// Estado inicial: garante que o site abra no modo visualizador
// Estado inicial: garante que o site abra no modo visualizador
navProfileSwitch = document.getElementById('nav-profile-switch');
btnLoginTop = document.getElementById('btn-open-login');
if (navProfileSwitch) navProfileSwitch.style.display = 'none';
if (btnLoginTop) btnLoginTop.style.display = 'block';