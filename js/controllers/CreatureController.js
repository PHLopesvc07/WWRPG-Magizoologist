import { fileToBase64 } from '../utils/helpers.js';
import { DatabaseService } from '../services/database.js';

export class CreatureController {
    constructor() {
        this.archive = [];
        this.currentImageBase64 = '';
        this.bulkCreatures = []; // { data, filename }
        this.init();
    }

    init() {
        this.bindEvents();
        this.initBulkImport();
        document.addEventListener('tab-opened', (e) => {
            if (e.detail.tabId === 'tab-archive') this.loadArchive();
        });
    }

    // ─── Importação em Massa ──────────────────────────────────────────────

    initBulkImport() {
        const fileInput = document.getElementById('bulk-creature-input');
        const executeBtn = document.getElementById('btn-execute-creature-bulk');
        const cancelBtn  = document.getElementById('btn-cancel-creature-bulk');

        fileInput?.addEventListener('change', (e) => this.parseBulkFiles(e.target.files));
        executeBtn?.addEventListener('click',  () => this.executeBulkImport());
        cancelBtn?.addEventListener('click',   () => this.cancelBulkImport());
    }

    async parseBulkFiles(files) {
        const errorEl   = document.getElementById('bulk-creature-error');
        const previewEl = document.getElementById('bulk-creature-preview');
        errorEl.style.display   = 'none';
        previewEl.style.display  = 'none';
        document.getElementById('btn-execute-creature-bulk').style.display = 'none';
        document.getElementById('btn-cancel-creature-bulk').style.display  = 'none';

        const errors = [];
        const valid  = [];

        const reads = Array.from(files).map(file => new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => {
                try {
                    const data = JSON.parse(e.target.result);
                    const required = ['nome', 'classificacao', 'tipo'];
                    const missing  = required.filter(f => !data[f]);
                    if (missing.length) {
                        errors.push(`"${file.name}": campos ausentes — ${missing.join(', ')}`);
                    } else {
                        valid.push({ data, filename: file.name });
                    }
                } catch {
                    errors.push(`"${file.name}": JSON inválido.`);
                }
                resolve();
            };
            reader.readAsText(file);
        }));

        await Promise.all(reads);

        if (errors.length) {
            errorEl.innerHTML   = errors.join('<br>');
            errorEl.style.display = 'block';
        }
        if (!valid.length) return;

        this.bulkCreatures = valid;
        this.renderBulkPreview(valid);
    }

    renderBulkPreview(creatures) {
        const tbody = document.getElementById('bulk-creature-table-body');
        tbody.innerHTML = creatures.map((item, idx) => `
            <tr data-bulk-idx="${idx}">
                <td>
                    <button type="button" class="btn-remove-creature-bulk btn-danger"
                        style="padding:2px 7px;font-size:0.8rem;" data-idx="${idx}">✕</button>
                </td>
                <td><strong>${item.data.nome}</strong></td>
                <td>${item.data.classificacao}</td>
                <td>${item.data.tipo}</td>
                <td style="font-size:0.78rem;opacity:0.7;">${item.filename}</td>
            </tr>`).join('');

        tbody.querySelectorAll('.btn-remove-creature-bulk').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                this.bulkCreatures.splice(idx, 1);
                this.renderBulkPreview(this.bulkCreatures);
            });
        });

        document.getElementById('bulk-creature-count').textContent          = creatures.length;
        document.getElementById('bulk-creature-preview').style.display      = 'block';
        document.getElementById('btn-execute-creature-bulk').style.display  = 'inline-block';
        document.getElementById('btn-cancel-creature-bulk').style.display   = 'inline-block';
    }

    executeBulkImport() {
        if (!this.bulkCreatures.length) return alert('Nenhuma criatura para importar.');

        const safe = n => n.replace(/[^a-z0-9_]/gi, '_').toLowerCase();

        // Download de cada criatura com delay escalonado
        this.bulkCreatures.forEach((item, i) => {
            setTimeout(() => {
                DatabaseService.saveRecord(item.data, item.data.nome);
            }, i * 300);
        });

        // Monta índice combinando existentes + novos (sem duplicatas)
        const existingFiles = this.archive.map(c => `${safe(c.nome)}.json`);
        const newFiles      = this.bulkCreatures.map(item => `${safe(item.data.nome)}.json`);
        const merged        = [...new Set([...existingFiles, ...newFiles])];

        setTimeout(() => {
            DatabaseService.saveRecord(merged, 'indice');
            alert(
                `✓ ${this.bulkCreatures.length} criatura(s) gerada(s)!\n\n` +
                `Próximos passos:\n` +
                `1. Mova os arquivos *.json para a pasta 'dados/'\n` +
                `2. Substitua 'indice.json' pelo arquivo baixado`
            );
            this.cancelBulkImport();
        }, this.bulkCreatures.length * 300 + 400);
    }

    cancelBulkImport() {
        this.bulkCreatures = [];
        const fileInput = document.getElementById('bulk-creature-input');
        if (fileInput) fileInput.value = '';
        document.getElementById('bulk-creature-preview').style.display     = 'none';
        document.getElementById('bulk-creature-error').style.display       = 'none';
        document.getElementById('btn-execute-creature-bulk').style.display = 'none';
        document.getElementById('btn-cancel-creature-bulk').style.display  = 'none';
    }

    // ─── Eventos do Formulário ────────────────────────────────────────────

    bindEvents() {
        const photoInput = document.getElementById('creature-photo');
        if (photoInput) {
            photoInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                this.currentImageBase64 = await fileToBase64(file);
                document.getElementById('photo-preview').src = this.currentImageBase64;
            });
        }

        const typeSelect = document.getElementById('c-type');
        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => this.handleDynamicAttributes(e.target.value));
        }

        const btnAddInjury = document.getElementById('btn-add-injury');
        if (btnAddInjury) {
            btnAddInjury.addEventListener('click', () => this.addCustomInjuryField());
        }

        const form = document.getElementById('creature-form');
        if (form) form.addEventListener('submit', (e) => this.saveCreature(e, form));

        document.getElementById('sort-order')?.addEventListener('change', () => this.applyFiltersAndRender());
        document.getElementById('search-creature')?.addEventListener('input', () => this.applyFiltersAndRender());
        document.querySelectorAll('.filter-panel input[type="checkbox"]:not([data-filter-spell])')
            .forEach(cb => cb.addEventListener('change', () => this.applyFiltersAndRender()));
    }

    handleDynamicAttributes(type) {
        const wrappers = {
            instinto:    document.getElementById('wrap-instinto'),
            carisma:     document.getElementById('wrap-carisma'),
            inteligencia:document.getElementById('wrap-inteligencia'),
            sabedoria:   document.getElementById('wrap-sabedoria')
        };

        Object.values(wrappers).forEach(el => el.style.display = 'none');
        ['attr-instinto','attr-carisma','attr-inteligencia','attr-sabedoria']
            .forEach(id => document.getElementById(id).value = 0);

        if (['Bestial','Neutro','Consciente'].includes(type)) wrappers.instinto.style.display = 'flex';
        if (['Neutro','Consciente'].includes(type))           wrappers.carisma.style.display  = 'flex';
        if (type === 'Consciente') {
            wrappers.inteligencia.style.display = 'flex';
            wrappers.sabedoria.style.display    = 'flex';
        }
    }

    addCustomInjuryField() {
        const container = document.getElementById('custom-injuries-container');
        const div = document.createElement('div');
        div.className = 'custom-injury-row';
        div.style = 'display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:5px;';
        div.innerHTML = `
            <input type="text" class="ink-input injury-name" placeholder="Condição" style="width:140px;">
            <input type="number" class="ink-input short-input injury-curr" value="0" min="0"> /
            <input type="number" class="ink-input short-input injury-max"  value="0" min="0">
            <button type="button" class="btn-danger btn-delete-injury" style="padding:4px 8px;">X</button>
        `;
        div.querySelector('.btn-delete-injury').addEventListener('click', () => div.remove());
        container.appendChild(div);
    }

    saveCreature(e, form) {
        e.preventDefault();
        const customInjuries = Array.from(
            document.querySelectorAll('#custom-injuries-container .custom-injury-row')
        ).map(row => ({
            name: row.querySelector('.injury-name').value,
            curr: row.querySelector('.injury-curr').value,
            max:  row.querySelector('.injury-max').value
        }));

        const creatureData = {
            id: Date.now().toString(),
            nome:         document.getElementById('c-name').value,
            tamanho:      document.getElementById('c-size').value,
            peso:         document.getElementById('c-weight').value,
            classificacao:document.getElementById('c-class').value,
            licenca:      document.getElementById('c-license').value,
            origem:       document.getElementById('c-origin').value,
            locomocao:    document.getElementById('c-locomotion').value,
            interacao:    document.getElementById('c-interaction').value,
            tipo:         document.getElementById('c-type').value,
            descricao:    document.getElementById('c-desc').value,
            fotoBase64:   this.currentImageBase64,
            atributos: {
                corpo:       parseInt(document.getElementById('attr-corpo').value)       || 0,
                destreza:    parseInt(document.getElementById('attr-destreza').value)    || 0,
                vitalidade:  parseInt(document.getElementById('attr-vitalidade').value)  || 0,
                instinto:    parseInt(document.getElementById('attr-instinto').value)    || 0,
                carisma:     parseInt(document.getElementById('attr-carisma').value)     || 0,
                inteligencia:parseInt(document.getElementById('attr-inteligencia').value)|| 0,
                sabedoria:   parseInt(document.getElementById('attr-sabedoria').value)   || 0
            },
            injuries: {
                leve:   { curr: document.getElementById('c-inj-leve-curr')?.value   || 0, max: document.getElementById('c-inj-leve-max')?.value   || 0 },
                media:  { curr: document.getElementById('c-inj-media-curr')?.value  || 0, max: document.getElementById('c-inj-media-max')?.value  || 0 },
                pesada: { curr: document.getElementById('c-inj-pesada-curr')?.value || 0, max: document.getElementById('c-inj-pesada-max')?.value || 0 },
                custom: customInjuries
            }
        };

        DatabaseService.saveRecord(creatureData, creatureData.nome);
        alert(`O registo de ${creatureData.nome} foi concluído!\nMova o ficheiro para 'dados/' e adicione no indice.json.`);

        form.reset();
        document.getElementById('photo-preview').src = '';
        this.currentImageBase64 = '';
        document.getElementById('custom-injuries-container').innerHTML = '';
        document.getElementById('c-type').dispatchEvent(new Event('change'));
    }

    async loadArchive() {
        const listEl = document.getElementById('archive-list');
        listEl.innerHTML = '<li style="color:var(--magic-gold);text-align:center;padding:15px;">A consultar os arquivos restritos...</li>';
        try {
            this.archive = await DatabaseService.fetchCollection('./dados', 'indice.json');
            this.applyFiltersAndRender();
        } catch {
            listEl.innerHTML = `<li style="color:#ff6b6b;padding:15px;">Erro de Acesso: Verifique o Live Server e a pasta 'dados'.</li>`;
        }
    }

    applyFiltersAndRender() {
        const listEl = document.getElementById('archive-list');
        if (!listEl) return;
        listEl.innerHTML = '';

        const search = (document.getElementById('search-creature')?.value || '').toLowerCase().trim();

        const activeFilters = { tipo: [], classificacao: [], locomocao: [], origem: [], interacao: [] };
        document.querySelectorAll('.filter-panel input[type="checkbox"]:checked:not([data-filter-spell])').forEach(cb => {
            activeFilters[cb.getAttribute('data-filter')].push(cb.value);
        });

        let filtered = this.archive.filter(creature => {
            if (search) {
                const nome = (creature.nome || '').toLowerCase();
                const desc = (creature.descricao || '').toLowerCase();
                if (!nome.includes(search) && !desc.includes(search)) return false;
            }
            for (const category in activeFilters) {
                if (activeFilters[category].length > 0 &&
                    !activeFilters[category].includes(String(creature[category]))) return false;
            }
            return true;
        });

        const sortOrder = document.getElementById('sort-order')?.value || 'AZ';
        filtered.sort((a, b) => sortOrder === 'AZ' ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome));

        if (filtered.length === 0) {
            listEl.innerHTML = '<li style="color:gray;padding:10px;text-align:center;">Nenhum espécime encontrado.</li>';
            return;
        }

        filtered.forEach(creature => {
            const li = document.createElement('li');
            li.className = 'creature-item';

            const span = document.createElement('span');
            span.className = 'creature-item-title';
            span.textContent = `${creature.nome} (${creature.classificacao})`;
            span.onclick = () => this.renderDetails(creature);

            const exportBtn = document.createElement('button');
            exportBtn.className = 'btn-teal';
            exportBtn.style.fontSize = '0.8rem';
            exportBtn.textContent = 'Extrair Cópia';
            exportBtn.onclick = (e) => { e.stopPropagation(); DatabaseService.saveRecord(creature, creature.nome); };

            li.appendChild(span);
            li.appendChild(exportBtn);
            listEl.appendChild(li);
        });
    }

    renderDetails(c) {
        const viewer = document.getElementById('creature-viewer');
        let attrHtml = `
            <span class="attr-badge">Corpo: ${c.atributos?.corpo || 0}</span>
            <span class="attr-badge">Destreza: ${c.atributos?.destreza || 0}</span>
            <span class="attr-badge">Vitalidade: ${c.atributos?.vitalidade || 0}</span>
        `;
        if (['Bestial','Neutro','Consciente'].includes(c.tipo)) attrHtml += `<span class="attr-badge">Instinto: ${c.atributos?.instinto || 0}</span>`;
        if (['Neutro','Consciente'].includes(c.tipo))           attrHtml += `<span class="attr-badge">Carisma: ${c.atributos?.carisma || 0}</span>`;
        if (c.tipo === 'Consciente') {
            attrHtml += `<span class="attr-badge">Inteligência: ${c.atributos?.inteligencia || 0}</span>`;
            attrHtml += `<span class="attr-badge">Sabedoria: ${c.atributos?.sabedoria || 0}</span>`;
        }

        let injuriesHtml = '';
        if (c.injuries) {
            let customHtml = '';
            if (c.injuries.custom?.length > 0) {
                customHtml = '<h4 style="margin:10px 0 5px 0;font-size:0.9rem;color:var(--magic-gold);">Condições Especiais:</h4>';
                c.injuries.custom.forEach(inj => {
                    if (inj.name) customHtml += `<p style="margin:3px 0;"><strong>${inj.name}:</strong> ${inj.curr} / ${inj.max}</p>`;
                });
            }
            injuriesHtml = `
                <div class="bureaucracy-box" style="padding:10px;margin-bottom:15px;">
                    <h3 style="margin-top:0;font-size:1rem;">Prontuário Médico</h3>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;">
                        <span class="attr-badge" style="background:rgba(183,28,28,0.1);border-color:#b71c1c;">Leve: ${c.injuries.leve?.curr || 0}/${c.injuries.leve?.max || 0}</span>
                        <span class="attr-badge" style="background:rgba(183,28,28,0.1);border-color:#b71c1c;">Média: ${c.injuries.media?.curr || 0}/${c.injuries.media?.max || 0}</span>
                        <span class="attr-badge" style="background:rgba(183,28,28,0.1);border-color:#b71c1c;">Pesada: ${c.injuries.pesada?.curr || 0}/${c.injuries.pesada?.max || 0}</span>
                    </div>
                    ${customHtml}
                </div>`;
        }

        const photoSrc = c.fotoBase64 || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

        viewer.innerHTML = `
            <div class="details-header">
                <img src="${photoSrc}" alt="Foto de ${c.nome}">
                <div>
                    <h2 style="margin:0 0 10px 0;color:var(--magic-gold);">${c.nome}</h2>
                    <p style="margin:2px 0;"><strong>Classificação:</strong> ${c.classificacao}</p>
                    <p style="margin:2px 0;"><strong>Tipo:</strong> ${c.tipo}</p>
                    <p style="margin:2px 0;"><strong>Licença:</strong> ${c.licenca}</p>
                </div>
            </div>
            <div style="margin-bottom:15px;">
                <p style="margin:5px 0;"><strong>Dimensões:</strong> ${c.tamanho}m | ${c.peso}kg</p>
                <p style="margin:5px 0;"><strong>Perfil:</strong> ${c.origem} | ${c.locomocao} | ${c.interacao}</p>
            </div>
            <div class="bureaucracy-box" style="padding:10px;margin-bottom:15px;">
                <h3 style="margin-top:0;font-size:1rem;">Atributos Mágicos / Físicos</h3>
                ${attrHtml}
            </div>
            ${injuriesHtml}
            <div>
                <h3 style="margin-top:0;font-size:1rem;color:var(--magic-gold);">Descrição e Notas</h3>
                <p style="line-height:1.5;white-space:pre-wrap;font-size:0.95rem;">${c.descricao}</p>
            </div>
        `;
    }
}