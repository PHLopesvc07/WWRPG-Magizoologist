/* =======================================================
   MINISTÉRIO DA MAGIA - DEPARTAMENTO DE REGULAMENTAÇÃO
   app.js - Lógica Principal (Criaturas, Feitiços e Listas)
   ======================================================= */

// ====== VARIÁVEIS GLOBAIS ======
let currentImageBase64 = "";
let globalCreatureArchive = [];
let globalSpellArchive = [];

// Variáveis para o Modo de Lista de Feitiços
let isListMode = false;
let selectedSpellsSet = new Set();

// ====== 1. INICIALIZAÇÃO DO SISTEMA ======
document.addEventListener('DOMContentLoaded', () => {
    // Configura as abas de navegação
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.getAttribute('data-target');
            openTab(targetId, e.target);
        });
    });

    // Configura os Botões do Modo de Lista (Exclusivo da Aba de Feitiços)
    const btnCreate = document.getElementById('btn-create-list');
    const btnSave = document.getElementById('btn-save-list');
    const btnCancel = document.getElementById('btn-cancel-list');

    if (btnCreate) {
        btnCreate.addEventListener('click', () => {
            isListMode = true;
            selectedSpellsSet.clear(); // Limpa seleções anteriores
            
            btnCreate.style.display = 'none';
            if(btnSave) btnSave.style.display = 'inline-block';
            if(btnCancel) btnCancel.style.display = 'inline-block';
            
            applySpellFiltersAndRender(); // Re-renderiza a mostrar as checkboxes
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            isListMode = false;
            selectedSpellsSet.clear();
            
            btnCreate.style.display = 'inline-block';
            if(btnSave) btnSave.style.display = 'none';
            if(btnCancel) btnCancel.style.display = 'none';
            
            applySpellFiltersAndRender(); // Re-renderiza sem checkboxes
        });
    }

    if (btnSave) {
        btnSave.addEventListener('click', () => {
            if (selectedSpellsSet.size === 0) {
                alert('Nenhum feitiço foi selecionado para o manuscrito.');
                return;
            }

            // Resgata os objetos completos baseados nos nomes selecionados
            const selectedSpells = globalSpellArchive.filter(spell => selectedSpellsSet.has(spell.name));

            // Exporta a lista consolidada num único JSON
            exportJson(selectedSpells, 'lista_feiticos_ministerio');

            // Volta ao estado normal da interface
            isListMode = false;
            selectedSpellsSet.clear();
            btnCreate.style.display = 'inline-block';
            btnSave.style.display = 'none';
            btnCancel.style.display = 'none';
            
            applySpellFiltersAndRender();
        });
    }
});

// ====== 2. NAVEGAÇÃO ======
function openTab(tabId, clickedBtn) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    clickedBtn.classList.add('active');

    // MÁGICA ACONTECE AQUI: Dispara a busca dependendo de qual aba foi aberta
    if (tabId === 'tab-archive') {
        loadArchive(); // Carrega as Criaturas
    } else if (tabId === 'tab-archive-spell') {
        loadSpellArchive(); // Carrega os Feitiços
    }
}

/* =======================================================
   MÓDULO: CRIATURAS MÁGICAS
   ======================================================= */

// 3. Processamento da Fotografia (Conversão para Base64)
const photoInput = document.getElementById('creature-photo');
if (photoInput) {
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                currentImageBase64 = event.target.result;
                document.getElementById('photo-preview').src = currentImageBase64;
            };
            reader.readAsDataURL(file); 
        }
    });
}

// 4. Lógica Burocrática: Exibição Dinâmica de Atributos (Criaturas)
const typeSelect = document.getElementById('c-type');
if (typeSelect) {
    typeSelect.addEventListener('change', function() {
        const type = this.value;
        const wrapInstinto = document.getElementById('wrap-instinto');
        const wrapCarisma = document.getElementById('wrap-carisma');
        const wrapInteligencia = document.getElementById('wrap-inteligencia');
        const wrapSabedoria = document.getElementById('wrap-sabedoria');

        const hideAndReset = (element, inputId) => {
            element.style.display = 'none';
            document.getElementById(inputId).value = 0;
        };

        hideAndReset(wrapInstinto, 'attr-instinto');
        hideAndReset(wrapCarisma, 'attr-carisma');
        hideAndReset(wrapInteligencia, 'attr-inteligencia');
        hideAndReset(wrapSabedoria, 'attr-sabedoria');

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
}

// 5. Formulário de Registo de Criaturas
const creatureForm = document.getElementById('creature-form');
if (creatureForm) {
    creatureForm.addEventListener('submit', function(e) {
        e.preventDefault(); 

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

        exportJson(creatureData, creatureData.nome);

        alert(`O registo de ${creatureData.nome} foi concluído!\n\nProtocolo do Ministério:\n1. Mova o ficheiro baixado para a pasta "dados".\n2. Adicione o nome no "dados/indice.json".`);

        this.reset();
        document.getElementById('photo-preview').src = '';
        currentImageBase64 = '';
        typeSelect.dispatchEvent(new Event('change')); 
    });
}

// 6. Leitura do Arquivo de Criaturas (Pasta /dados/)
async function loadArchive() {
    const listEl = document.getElementById('archive-list');
    const viewerEl = document.getElementById('creature-viewer');
    const cacheBuster = `?t=${new Date().getTime()}`;
    
    listEl.innerHTML = '<li style="color: var(--magic-gold); text-align: center; padding: 15px;">A consultar os arquivos restritos...</li>';
    viewerEl.innerHTML = '<div style="text-align: center; color: var(--border-color); margin-top: 50px;">Selecione uma criatura no índice para visualizar.</div>';

    try {
        const respostaIndice = await fetch(`./dados/indice.json${cacheBuster}`);
        if (!respostaIndice.ok) throw new Error("Ficheiro indice.json não encontrado.");
        
        const arquivos = await respostaIndice.json();

        if (arquivos.length === 0) {
            listEl.innerHTML = '<li style="color: gray; padding: 10px;">O índice está vazio.</li>';
            return;
        }

        globalCreatureArchive = [];

        for (let nomeArquivo of arquivos) {
            try {
                const res = await fetch(`./dados/${nomeArquivo}${cacheBuster}`);
                if (res.ok) {
                    const dadosCriatura = await res.json();
                    globalCreatureArchive.push(dadosCriatura);
                }
            } catch (err) {
                console.warn(`Aviso: Falha ao procurar ${nomeArquivo}`);
            }
        }

        setupFilterListeners();
        applyFiltersAndRender();

    } catch (erro) {
        console.error("Erro burocrático:", erro);
        listEl.innerHTML = `<li style="color: #ff6b6b; padding: 15px;">Erro de Acesso: Verifique se está a utilizar um Live Server e se a pasta 'dados' existe.</li>`;
    }
}

function setupFilterListeners() {
    const sortOrder = document.getElementById('sort-order');
    if (sortOrder) sortOrder.addEventListener('change', applyFiltersAndRender);
    
    document.querySelectorAll('.filter-panel input[type="checkbox"]:not([data-filter-spell])').forEach(cb => {
        cb.addEventListener('change', applyFiltersAndRender);
    });
}

function applyFiltersAndRender() {
    const listEl = document.getElementById('archive-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const activeFilters = { tipo: [], classificacao: [], locomocao: [], origem: [], interacao: [] };

    document.querySelectorAll('.filter-panel input[type="checkbox"]:checked:not([data-filter-spell])').forEach(cb => {
        const category = cb.getAttribute('data-filter');
        if (activeFilters[category]) activeFilters[category].push(cb.value);
    });

    let filteredCreatures = globalCreatureArchive.filter(creature => {
        let isValid = true;
        for (const category in activeFilters) {
            if (activeFilters[category].length > 0) {
                const creatureAttr = String(creature[category]); 
                if (!activeFilters[category].includes(creatureAttr)) {
                    isValid = false; break;
                }
            }
        }
        return isValid;
    });

    const sortOrderSelect = document.getElementById('sort-order');
    const sortOrder = sortOrderSelect ? sortOrderSelect.value : 'AZ';
    
    filteredCreatures.sort((a, b) => {
        return sortOrder === 'AZ' ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome);
    });

    if (filteredCreatures.length === 0) {
        listEl.innerHTML = '<li style="color: gray; padding: 10px; text-align:center;">Nenhum espécime encontrado.</li>';
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
            exportJson(creature, creature.nome);
        };

        li.appendChild(span);
        li.appendChild(exportBtn);
        listEl.appendChild(li);
    });
}

function showCreatureDetails(c) {
    const viewer = document.getElementById('creature-viewer');
    let attrHtml = `
        <span class="attr-badge">Corpo: ${c.atributos.corpo}</span>
        <span class="attr-badge">Destreza: ${c.atributos.destreza}</span>
        <span class="attr-badge">Vitalidade: ${c.atributos.vitalidade}</span>
    `;
    if (['Bestial', 'Neutro', 'Consciente'].includes(c.tipo)) attrHtml += `<span class="attr-badge">Instinto: ${c.atributos.instinto}</span>`;
    if (['Neutro', 'Consciente'].includes(c.tipo)) attrHtml += `<span class="attr-badge">Carisma: ${c.atributos.carisma}</span>`;
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

/* =======================================================
   MÓDULO: FEITIÇOS E ENCANTAMENTOS
   ======================================================= */

const spellForm = document.getElementById('spell-form');
if (spellForm) {
    spellForm.addEventListener('submit', function(e) {
        e.preventDefault(); 
        const spellData = {
            name: document.getElementById('s-name').value,
            cat: document.getElementById('s-cat').value,
            lvl: document.getElementById('s-lvl').value,
            desc: document.getElementById('s-desc').value
        };

        exportJson(spellData, `feitico_${spellData.name}`);

        alert(`O manuscrito de "${spellData.name}" foi gerado!\n\nProtocolo:\n1. Mova o ficheiro para a pasta "feiticos".\n2. Adicione o nome no "feiticos/indice_feiticos.json".`);
        this.reset();
    });
}

// Leitura do Arquivo de Feitiços (Pasta /feiticos/)
async function loadSpellArchive() {
    const listEl = document.getElementById('archive-spell-list');
    const viewerEl = document.getElementById('spell-viewer');
    const cacheBuster = `?t=${new Date().getTime()}`;
    
    listEl.innerHTML = '<li style="color: var(--magic-gold); text-align: center; padding: 15px;">A consultar os registos de Feitiços...</li>';
    viewerEl.innerHTML = '<div style="text-align: center; color: var(--border-color); margin-top: 50px;">Selecione um feitiço no índice.</div>';

    try {
        const respostaIndice = await fetch(`./feiticos/indice_feiticos.json${cacheBuster}`);
        if (!respostaIndice.ok) throw new Error("Índice de feitiços não encontrado.");
        
        const arquivos = await respostaIndice.json();
        if (arquivos.length === 0) {
            listEl.innerHTML = '<li style="color: gray; padding: 10px;">O índice de feitiços está vazio.</li>';
            return;
        }

        globalSpellArchive = [];

        for (let nomeArquivo of arquivos) {
            try {
                const res = await fetch(`./feiticos/${nomeArquivo}${cacheBuster}`);
                if (res.ok) {
                    const dadosFeitico = await res.json();
                    globalSpellArchive.push(dadosFeitico);
                }
            } catch (err) {
                console.warn(`Falha ao ler o feitiço: ${nomeArquivo}`);
            }
        }

        setupSpellFilterListeners();
        applySpellFiltersAndRender();

    } catch (erro) {
        console.error("Erro burocrático:", erro);
        listEl.innerHTML = `<li style="color: #ff6b6b; padding: 15px;">Erro: Certifique-se de usar o Live Server e que a pasta 'feiticos' existe.</li>`;
    }
}

function setupSpellFilterListeners() {
    const sortOrderSpell = document.getElementById('sort-order-spell');
    if (sortOrderSpell) sortOrderSpell.addEventListener('change', applySpellFiltersAndRender);
    
    document.querySelectorAll('.filter-panel input[data-filter-spell]').forEach(cb => {
        cb.addEventListener('change', applySpellFiltersAndRender);
    });
}

function applySpellFiltersAndRender() {
    const listEl = document.getElementById('archive-spell-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const activeFilters = { cat: [], lvl: [] };

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
                    isValid = false; break;
                }
            }
        }
        return isValid;
    });

    const sortOrderSelect = document.getElementById('sort-order-spell');
    const sortOrder = sortOrderSelect ? sortOrderSelect.value : 'AZ';
    
    filteredSpells.sort((a, b) => {
        return sortOrder === 'AZ' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });

    if (filteredSpells.length === 0) {
        listEl.innerHTML = '<li style="color: gray; padding: 10px; text-align:center;">Nenhum encantamento encontrado.</li>';
        return;
    }

    filteredSpells.forEach((spell) => {
        const li = document.createElement('li');
        li.className = 'creature-item'; 
        
        // Se estiver em modo de lista, renderiza a Checkbox
        if (isListMode) {
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.className = 'spell-selector';
            cb.value = spell.name;
            cb.checked = selectedSpellsSet.has(spell.name); 
            cb.style.marginRight = '10px';
            cb.style.cursor = 'pointer';
            
            cb.addEventListener('change', (e) => {
                if (e.target.checked) selectedSpellsSet.add(spell.name);
                else selectedSpellsSet.delete(spell.name);
            });
            
            li.appendChild(cb);
        }

        const span = document.createElement('span');
        span.className = 'creature-item-title';
        span.textContent = `${spell.name} (Nível ${spell.lvl})`;
        span.onclick = () => showSpellDetails(spell);
        li.appendChild(span);

        // Se NÃO estiver em modo de lista, renderiza o botão "Extrair Cópia"
        if (!isListMode) {
            const exportBtn = document.createElement('button');
            exportBtn.className = 'btn-teal';
            exportBtn.style.fontSize = '0.8rem';
            exportBtn.textContent = 'Extrair Cópia';
            exportBtn.onclick = (e) => {
                e.stopPropagation(); 
                exportJson(spell, `feitico_${spell.name}`);
            };
            li.appendChild(exportBtn);
        }

        listEl.appendChild(li);
    });
}

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

/* =======================================================
   MÓDULO DE UTILITÁRIOS GERAIS
   ======================================================= */

// Função genérica de exportação (serve para criaturas, um feitiço, ou múltiplos)
function exportJson(dataObj, baseName) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
    const downloadAnchorNode = document.createElement('a');
    
    // Assegura que o nome do ficheiro é seguro para gravação
    const safeName = baseName.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
    
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${safeName}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}