/* =======================================================
   MINISTÉRIO DA MAGIA - DEPARTAMENTO DE CRIATURAS
   app.js - Lógica de Negócio e Consulta Automática (GitHub)
   ======================================================= */

// Variável global para armazenar a fotografia convertida em texto (Base64)
let currentImageBase64 = "";

// Variável de estado global para guardar os dados brutos e não fazer fetch à toa
let globalCreatureArchive = [];

// 1. Inicialização do Sistema
document.addEventListener('DOMContentLoaded', () => {
    // Configura os botões das abas de navegação
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.getAttribute('data-target');
            openTab(targetId, e.target);
        });
    });
});

// 2. Navegação entre as Abas (Formulário x Arquivo)
function openTab(tabId, clickedBtn) {
    // Esconde todas as abas e remove a classe 'active' dos botões
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Mostra a aba selecionada e destaca o botão
    document.getElementById(tabId).classList.add('active');
    clickedBtn.classList.add('active');

    // MÁGICA ACONTECE AQUI: Dispara a busca dependendo de qual aba foi aberta
    if (tabId === 'tab-archive') {
        loadArchive(); // Carrega as Criaturas
    } else if (tabId === 'tab-archive-spell') {
        loadSpellArchive(); // Carrega os Feitiços
    }
}

// 3. Processamento da Fotografia (Conversão para Base64)
document.getElementById('creature-photo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            currentImageBase64 = event.target.result;
            document.getElementById('photo-preview').src = currentImageBase64;
        };
        reader.readAsDataURL(file); // Converte a imagem para uma string embutida
    }
});

// 4. Lógica Burocrática: Exibição Dinâmica de Atributos Baseada no "Tipo"
const typeSelect = document.getElementById('c-type');
typeSelect.addEventListener('change', function() {
    const type = this.value;
    
    // Referências aos blocos de atributos no HTML
    const wrapInstinto = document.getElementById('wrap-instinto');
    const wrapCarisma = document.getElementById('wrap-carisma');
    const wrapInteligencia = document.getElementById('wrap-inteligencia');
    const wrapSabedoria = document.getElementById('wrap-sabedoria');

    // Função auxiliar para esconder o campo e zerar o valor
    const hideAndReset = (element, inputId) => {
        element.style.display = 'none';
        document.getElementById(inputId).value = 0;
    };

    // Reseta todos os atributos dinâmicos por padrão
    hideAndReset(wrapInstinto, 'attr-instinto');
    hideAndReset(wrapCarisma, 'attr-carisma');
    hideAndReset(wrapInteligencia, 'attr-inteligencia');
    hideAndReset(wrapSabedoria, 'attr-sabedoria');

    // Aplica as regras mágicas de visibilidade
    if (type === 'Bestial') {
        wrapInstinto.style.display = 'flex';
    } else if (type === 'Neutro') {
        wrapInstinto.style.display = 'flex';
        wrapCarisma.style.display = 'flex';
    } else if (type === 'Consciente') {
        wrapInstinto.style.display = 'flex';
        wrapCarisma.style.display = 'flex';
        wrapInteligencia.style.display = 'flex';
        wrapSabedoria.style.display = 'flex';
    }
});

// 5. Formulário: Carimbar e Gerar Manuscrito (.json)
document.getElementById('creature-form').addEventListener('submit', function(e) {
    e.preventDefault(); 

    // Constrói o Dossiê da Criatura
    const creatureData = {
        id: Date.now().toString(),
        nome: document.getElementById('c-name').value,
        tamanho: document.getElementById('c-size').value,
        peso: document.getElementById('c-weight').value,
        classificacao: document.getElementById('c-class').value,
        licenca: document.getElementById('c-license').value,
        origem: document.getElementById('c-origin').value,
        locomocao: document.getElementById('c-locomotion').value,
        interacao: document.getElementById('c-interaction').value,
        tipo: document.getElementById('c-type').value,
        descricao: document.getElementById('c-desc').value,
        fotoBase64: currentImageBase64,
        atributos: {
            corpo: parseInt(document.getElementById('attr-corpo').value) || 0,
            destreza: parseInt(document.getElementById('attr-destreza').value) || 0,
            vitalidade: parseInt(document.getElementById('attr-vitalidade').value) || 0,
            instinto: parseInt(document.getElementById('attr-instinto').value) || 0,
            carisma: parseInt(document.getElementById('attr-carisma').value) || 0,
            inteligencia: parseInt(document.getElementById('attr-inteligencia').value) || 0,
            sabedoria: parseInt(document.getElementById('attr-sabedoria').value) || 0
        }
    };

    // Dispara o download automático do JSON gerado
    exportJson(creatureData);

    // Alerta instrucional lembrando do fluxo do GitHub
    alert(`Registro de ${creatureData.nome} criado com sucesso!\n\nLembre-se do protocolo do Ministério:\n1. Faça o upload deste arquivo baixado para a pasta "dados" no GitHub.\n2. Adicione o nome dele no "indice.json".`);

    // Limpa a mesa de trabalho
    this.reset();
    document.getElementById('photo-preview').src = '';
    currentImageBase64 = '';
    typeSelect.dispatchEvent(new Event('change')); 
});

// 6. Utilitário de Exportação (Download do JSON)
function exportJson(dataObj) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
    const downloadAnchorNode = document.createElement('a');
    
    const safeName = dataObj.nome.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${safeName}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// 7. ARQUIVO AUTOMÁTICO: Busca os registros no GitHub (Pasta /dados)
async function loadArchive() {
    const listEl = document.getElementById('archive-list');
    const viewerEl = document.getElementById('creature-viewer');
    
    // Parâmetro anti-cache para garantir que o GitHub entregue a versão mais nova do arquivo
    const cacheBuster = `?t=${new Date().getTime()}`;
    
    listEl.innerHTML = '<li style="color: var(--magic-gold); text-align: center; padding: 15px;">Consultando os arquivos restritos do Ministério...</li>';
    viewerEl.innerHTML = '<div style="text-align: center; color: var(--border-color); margin-top: 50px;">Selecione uma criatura no índice para visualizar o registro completo.</div>';

    try {
        // Passo A: Lê o arquivo de índice
        const respostaIndice = await fetch(`./dados/indice.json${cacheBuster}`);
        
        if (!respostaIndice.ok) {
            throw new Error("Arquivo indice.json não encontrado.");
        }
        
        const arquivos = await respostaIndice.json();

        if (arquivos.length === 0) {
            listEl.innerHTML = '<li style="color: gray; padding: 10px;">O índice está vazio. Nenhum registro encontrado.</li>';
            return;
        }

        globalCreatureArchive = [];

        // Passo B: Busca os dados de cada criatura listada
        for (let nomeArquivo of arquivos) {
            try {
                const res = await fetch(`./dados/${nomeArquivo}${cacheBuster}`);
                if (res.ok) {
                    const dadosCriatura = await res.json();
                    globalCreatureArchive.push(dadosCriatura);
                } else {
                    console.warn(`[Aviso do Ministério]: Não foi possível carregar ${nomeArquivo}`);
                }
            } catch (err) {
                console.warn(`[Aviso do Ministério]: Falha ao buscar ${nomeArquivo}. Ele existe na pasta "dados"?`);
            }
        }

        // Prepara os "Ouvintes" para os filtros e ordenação
        setupFilterListeners();
        
        // Renderiza a tela baseando-se nos filtros atuais (inicialmente exibe tudo de A-Z)
        applyFiltersAndRender();

    } catch (erro) {
        console.error("Erro burocrático:", erro);
        listEl.innerHTML = `
            <li style="color: #ff6b6b; padding: 15px; border: 1px solid #ff6b6b; background: rgba(255,0,0,0.1); line-height: 1.5;">
                <strong>Acesso Negado ou Falha de Conexão.</strong><br><br>
                Certifique-se de que:<br>
                1. A pasta <code>dados</code> (tudo em minúsculo) existe no seu repositório.<br>
                2. O arquivo <code>indice.json</code> existe lá dentro e está com o formato correto.<br>
                3. Você aguardou 1 ou 2 minutos após o commit no GitHub Pages.
            </li>`;
    }
}

// 7.1 Configura os Eventos de Filtro e Ordenação
function setupFilterListeners() {
    document.getElementById('sort-order').addEventListener('change', applyFiltersAndRender);
    
    const checkboxes = document.querySelectorAll('.filter-panel input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', applyFiltersAndRender);
    });
}

// 7.2 Lógica principal: Filtra, Ordena e Desenha na Tela
function applyFiltersAndRender() {
    const listEl = document.getElementById('archive-list');
    listEl.innerHTML = '';

    // 1. Coleta quais filtros estão ativados (marcados)
    const activeFilters = {
        tipo: [],
        classificacao: [],
        locomocao: [],
        origem: [],
        interacao: []
    };

    document.querySelectorAll('.filter-panel input[type="checkbox"]:checked').forEach(cb => {
        const category = cb.getAttribute('data-filter');
        activeFilters[category].push(cb.value);
    });

    // 2. Filtra as Criaturas
    let filteredCreatures = globalCreatureArchive.filter(creature => {
        let isValid = true;
        
        // Regra: Se a categoria tem filtros selecionados, a criatura deve pertencer a algum deles
        for (const category in activeFilters) {
            if (activeFilters[category].length > 0) {
                // Algumas chaves no JSON podem vir diferentes ou undefined, normalizamos para a comparação
                const creatureAttr = String(creature[category]); 
                if (!activeFilters[category].includes(creatureAttr)) {
                    isValid = false;
                    break;
                }
            }
        }
        return isValid;
    });

    // 3. Aplica a Ordenação (A-Z ou Z-A)
    const sortOrder = document.getElementById('sort-order').value;
    filteredCreatures.sort((a, b) => {
        const valA = a.nome.toLowerCase();
        const valB = b.nome.toLowerCase();
        
        if (sortOrder === 'AZ') {
            return valA.localeCompare(valB);
        } else {
            return valB.localeCompare(valA); // Z-A invertido
        }
    });

    // 4. Renderiza na Tela
    if (filteredCreatures.length === 0) {
        listEl.innerHTML = '<li style="color: gray; padding: 10px; text-align:center;">Nenhum espécime encontrado com estas características.</li>';
        return;
    }

    filteredCreatures.forEach((creature) => {
        const li = document.createElement('li');
        li.className = 'creature-item';
        
        const span = document.createElement('span');
        span.className = 'creature-item-title';
        span.textContent = `${creature.nome} (${creature.classificacao})`;
        
        span.onclick = () => showCreatureDetails(creature);

        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn-teal';
        exportBtn.style.fontSize = '0.8rem';
        exportBtn.textContent = 'Extrair Cópia';
        exportBtn.onclick = (e) => {
            e.stopPropagation(); 
            exportJson(creature);
        };

        li.appendChild(span);
        li.appendChild(exportBtn);
        listEl.appendChild(li);
    });
}

// 8. Visualização de Detalhes da Criatura (Painel Direito)
function showCreatureDetails(c) {
    const viewer = document.getElementById('creature-viewer');
    
    // Monta as insígnias baseadas no tipo
    let attrHtml = `
        <span class="attr-badge">Corpo: ${c.atributos.corpo}</span>
        <span class="attr-badge">Destreza: ${c.atributos.destreza}</span>
        <span class="attr-badge">Vitalidade: ${c.atributos.vitalidade}</span>
    `;
    if (c.tipo === 'Bestial' || c.tipo === 'Neutro' || c.tipo === 'Consciente') {
        attrHtml += `<span class="attr-badge">Instinto: ${c.atributos.instinto}</span>`;
    }
    if (c.tipo === 'Neutro' || c.tipo === 'Consciente') {
        attrHtml += `<span class="attr-badge">Carisma: ${c.atributos.carisma}</span>`;
    }
    if (c.tipo === 'Consciente') {
        attrHtml += `<span class="attr-badge">Inteligência: ${c.atributos.inteligencia}</span>`;
        attrHtml += `<span class="attr-badge">Sabedoria: ${c.atributos.sabedoria}</span>`;
    }

    const photoSrc = c.fotoBase64 ? c.fotoBase64 : 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

    viewer.innerHTML = `
        <div class="details-header">
            <img src="${photoSrc}" alt="Foto de ${c.nome}">
            <div>
                <h2 style="margin: 0 0 10px 0; color: var(--magic-gold);">${c.nome}</h2>
                <p style="margin: 2px 0;"><strong>Classificação:</strong> ${c.classificacao}</p>
                <p style="margin: 2px 0;"><strong>Tipo:</strong> ${c.tipo}</p>
                <p style="margin: 2px 0;"><strong>Licença:</strong> ${c.licenca}</p>
            </div>
        </div>
        
        <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0;"><strong>Dimensões:</strong> ${c.tamanho}m | ${c.peso}kg</p>
            <p style="margin: 5px 0;"><strong>Perfil:</strong> ${c.origem} | ${c.locomocao} | ${c.interacao}</p>
        </div>

        <div class="bureaucracy-box" style="padding: 10px; margin-bottom: 15px;">
            <h3 style="margin-top: 0; font-size: 1rem;">Atributos Mágicos / Físicos</h3>
            ${attrHtml}
        </div>

        <div>
            <h3 style="margin-top: 0; font-size: 1rem; color: var(--magic-gold);">Descrição e Notas</h3>
            <p style="line-height: 1.5; white-space: pre-wrap; font-size: 0.95rem;">${c.descricao}</p>
        </div>
    `;
}

// ====== GESTÃO DE FEITIÇOS (PROTOCOLO DE DOWNLOAD LOCAL) ======
let globalSpellArchive = [];

// 1. Evento de Submissão: Salva diretamente no PC do usuário
const spellForm = document.getElementById('spell-form');
if (spellForm) {
    spellForm.addEventListener('submit', function(e) {
        e.preventDefault(); 

        // Constrói o objeto no formato do repositório 'Ficha'
        const spellData = {
            name: document.getElementById('s-name').value,
            cat: document.getElementById('s-cat').value,
            lvl: document.getElementById('s-lvl').value,
            desc: document.getElementById('s-desc').value
        };

        // Dispara o download automático do JSON
        exportJsonSpell(spellData);

        // Alerta informativo (sem funções de rede, apenas instruções)
        alert(`Manuscrito de "${spellData.name}" gerado com sucesso!\n\nPara que ele apareça no catálogo:\n1. Mova o arquivo baixado para a pasta "feiticos".\n2. Adicione o nome dele no "feiticos/indice_feiticos.json".`);
        
        this.reset();
    });
}

// 2. Utilitário de Exportação
function exportJsonSpell(dataObj) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
    const downloadAnchorNode = document.createElement('a');
    
    // Formata o nome do arquivo (ex: feitico_lumos.json)
    const safeName = dataObj.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `feitico_${safeName}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// 3. Leitura do Arquivo a partir da pasta /feiticos/
async function loadSpellArchive() {
    const listEl = document.getElementById('archive-spell-list');
    const viewerEl = document.getElementById('spell-viewer');
    const cacheBuster = `?t=${new Date().getTime()}`;
    
    listEl.innerHTML = '<li style="color: var(--magic-gold); text-align: center; padding: 15px;">Consultando registros na pasta /feiticos/...</li>';
    viewerEl.innerHTML = '<div style="text-align: center; color: var(--border-color); margin-top: 50px;">Selecione um feitiço no índice.</div>';

    try {
        // Busca o índice dentro da pasta específica de feitiços
        const respostaIndice = await fetch(`./feiticos/indice_feiticos.json${cacheBuster}`);
        
        if (!respostaIndice.ok) throw new Error("Índice de feitiços não encontrado.");
        
        const arquivos = await respostaIndice.json();
        
        if (arquivos.length === 0) {
            listEl.innerHTML = '<li style="color: gray; padding: 10px;">O índice de feitiços está vazio.</li>';
            return;
        }

        globalSpellArchive = [];

        // Carrega cada feitiço individualmente da pasta /feiticos/
        for (let nomeArquivo of arquivos) {
            try {
                const res = await fetch(`./feiticos/${nomeArquivo}${cacheBuster}`);
                if (res.ok) {
                    const dadosFeitico = await res.json();
                    globalSpellArchive.push(dadosFeitico);
                }
            } catch (err) {
                console.warn(`Falha ao ler feitiço: ${nomeArquivo}`);
            }
        }

        setupSpellFilterListeners();
        applySpellFiltersAndRender();

    } catch (erro) {
        console.error("Erro burocrático:", erro);
        listEl.innerHTML = `<li style="color: #ff6b6b; padding: 15px;">Erro: Certifique-se de que a pasta "feiticos" existe na raiz e contém o arquivo "indice_feiticos.json".</li>`;
    }
}

// 4. Filtros do Catálogo de Feitiços
function setupSpellFilterListeners() {
    document.getElementById('sort-order-spell').addEventListener('change', applySpellFiltersAndRender);
    
    const checkboxes = document.querySelectorAll('.filter-panel input[data-filter-spell]');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', applySpellFiltersAndRender);
    });
}

function applySpellFiltersAndRender() {
    const listEl = document.getElementById('archive-spell-list');
    listEl.innerHTML = '';

    const activeFilters = {
        cat: [],
        lvl: []
    };

    // Capta os checkboxes marcados para a aba de Feitiços
    document.querySelectorAll('.filter-panel input[data-filter-spell]:checked').forEach(cb => {
        const category = cb.getAttribute('data-filter-spell');
        activeFilters[category].push(cb.value);
    });

    let filteredSpells = globalSpellArchive.filter(spell => {
        let isValid = true;
        for (const category in activeFilters) {
            if (activeFilters[category].length > 0) {
                const spellAttr = String(spell[category]); 
                if (!activeFilters[category].includes(spellAttr)) {
                    isValid = false;
                    break;
                }
            }
        }
        return isValid;
    });

    const sortOrder = document.getElementById('sort-order-spell').value;
    filteredSpells.sort((a, b) => {
        const valA = a.name.toLowerCase();
        const valB = b.name.toLowerCase();
        return sortOrder === 'AZ' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    if (filteredSpells.length === 0) {
        listEl.innerHTML = '<li style="color: gray; padding: 10px; text-align:center;">Nenhum encantamento encontrado.</li>';
        return;
    }

    filteredSpells.forEach((spell) => {
        const li = document.createElement('li');
        li.className = 'creature-item'; 
        
        const span = document.createElement('span');
        span.className = 'creature-item-title';
        span.textContent = `${spell.name} (Nível ${spell.lvl})`;
        span.onclick = () => showSpellDetails(spell);

        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn-teal';
        exportBtn.style.fontSize = '0.8rem';
        exportBtn.textContent = 'Extrair Cópia';
        exportBtn.onclick = (e) => {
            e.stopPropagation(); 
            exportJsonSpell(spell);
        };

        li.appendChild(span);
        li.appendChild(exportBtn);
        listEl.appendChild(li);
    });
}

// 5. Exibir o preview do feitiço formatado no painel direito
function showSpellDetails(s) {
    const viewer = document.getElementById('spell-viewer');
    viewer.innerHTML = `
        <div class="details-header" style="display: block;">
            <h2 style="margin: 0 0 10px 0; color: var(--magic-gold);">${s.name}</h2>
            <div style="margin-bottom: 15px;">
                <p style="margin: 5px 0;"><strong>Categoria:</strong> ${s.cat}</p>
                <p style="margin: 5px 0;"><strong>Nível:</strong> ${s.lvl}</p>
            </div>
            
            <div class="bureaucracy-box" style="padding: 15px; margin-bottom: 15px;">
                <h3 style="margin-top: 0; font-size: 1rem; color: var(--magic-gold);">Descrição e Efeitos</h3>
                <p style="line-height: 1.5; white-space: pre-wrap; font-size: 0.95rem;">${s.desc}</p>
            </div>
        </div>
    `;
}