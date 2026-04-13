import { DatabaseService } from '../services/database.js';

export class SpellController {
    constructor() {
        this.archive = [];
        this.isListMode = false;
        this.selectedSpells = new Set();
        this.init();
    }

    init() {
        const form = document.getElementById('spell-form');
        if (form) form.addEventListener('submit', (e) => this.saveSpell(e, form));

        document.getElementById('btn-create-list')?.addEventListener('click', () => this.toggleListMode(true));
        document.getElementById('btn-cancel-list')?.addEventListener('click', () => this.toggleListMode(false));
        document.getElementById('btn-save-list')?.addEventListener('click', () => this.exportSpellList());

        document.getElementById('sort-order-spell')?.addEventListener('change', () => this.applyFiltersAndRender());
        document.querySelectorAll('.filter-panel input[data-filter-spell]')
            .forEach(cb => cb.addEventListener('change', () => this.applyFiltersAndRender()));

        document.addEventListener('tab-opened', (e) => {
            if (e.detail.tabId === 'tab-archive-spell') this.loadArchive();
        });
    }

    toggleListMode(active) {
        this.isListMode = active;
        this.selectedSpells.clear();
        
        document.getElementById('btn-create-list').style.display = active ? 'none' : 'inline-block';
        document.getElementById('btn-save-list').style.display = active ? 'inline-block' : 'none';
        document.getElementById('btn-cancel-list').style.display = active ? 'inline-block' : 'none';
        
        this.applyFiltersAndRender();
    }

    saveSpell(e, form) {
        e.preventDefault();
        const data = {
            name: document.getElementById('s-name').value,
            cat: document.getElementById('s-cat').value,
            lvl: document.getElementById('s-lvl').value,
            desc: document.getElementById('s-desc').value
        };
        DatabaseService.saveRecord(data, `feitico_${data.name}`);
        alert(`O manuscrito de "${data.name}" foi gerado!\nMova para 'feiticos' e adicione no indice.`);
        form.reset();
    }

    exportSpellList() {
        if (this.selectedSpells.size === 0) return alert('Nenhum feitiço foi selecionado para o manuscrito.');
        const recordsToExport = this.archive.filter(s => this.selectedSpells.has(s.name));
        DatabaseService.saveRecord(recordsToExport, 'lista_feiticos_ministerio');
        this.toggleListMode(false);
    }

    async loadArchive() {
        const listEl = document.getElementById('archive-spell-list');
        listEl.innerHTML = '<li style="color: var(--magic-gold); text-align: center; padding: 15px;">A consultar os registos de Feitiços...</li>';
        
        try {
            this.archive = await DatabaseService.fetchCollection('./feiticos', 'indice_feiticos.json');
            this.applyFiltersAndRender();
        } catch (error) {
            listEl.innerHTML = `<li style="color: #ff6b6b; padding: 15px;">Erro: Certifique-se de usar o Live Server e que a pasta 'feiticos' existe.</li>`;
        }
    }

    applyFiltersAndRender() {
        const listEl = document.getElementById('archive-spell-list');
        if (!listEl) return;
        listEl.innerHTML = '';

        const activeFilters = { cat: [], lvl: [] };
        document.querySelectorAll('.filter-panel input[data-filter-spell]:checked').forEach(cb => {
            activeFilters[cb.getAttribute('data-filter-spell')].push(cb.value);
        });

        let filtered = this.archive.filter(spell => {
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

        const sortOrder = document.getElementById('sort-order-spell')?.value || 'AZ';
        filtered.sort((a, b) => sortOrder === 'AZ' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

        if (filtered.length === 0) {
            listEl.innerHTML = '<li style="color: gray; padding: 10px; text-align:center;">Nenhum encantamento encontrado.</li>';
            return;
        }

        filtered.forEach((spell) => {
            const li = document.createElement('li');
            li.className = 'creature-item'; 
            
            if (this.isListMode) {
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.className = 'spell-selector';
                cb.value = spell.name;
                cb.checked = this.selectedSpells.has(spell.name); 
                cb.style.marginRight = '10px';
                cb.style.cursor = 'pointer';
                
                cb.addEventListener('change', (e) => {
                    if (e.target.checked) this.selectedSpells.add(spell.name);
                    else this.selectedSpells.delete(spell.name);
                });
                li.appendChild(cb);
            }

            const span = document.createElement('span');
            span.className = 'creature-item-title';
            span.textContent = `${spell.name} (Nível ${spell.lvl})`;
            span.onclick = () => this.renderDetails(spell);
            li.appendChild(span);

            if (!this.isListMode) {
                const exportBtn = document.createElement('button');
                exportBtn.className = 'btn-teal';
                exportBtn.style.fontSize = '0.8rem';
                exportBtn.textContent = 'Extrair Cópia';
                exportBtn.onclick = (e) => { e.stopPropagation(); DatabaseService.saveRecord(spell, `feitico_${spell.name}`); };
                li.appendChild(exportBtn);
            }

            listEl.appendChild(li);
        });
    }

    renderDetails(s) {
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
}