import { DatabaseService } from '../services/database.js';

export class SpellController {
    constructor() {
        this.archive = [];
        this.isListMode = false;
        this.selectedSpells = new Set();
        this.init();
    }

    init() {
        // Formulário
        const form = document.getElementById('spell-form');
        if (form) form.addEventListener('submit', (e) => this.saveSpell(e, form));

        // Controles de Lista
        document.getElementById('btn-create-list')?.addEventListener('click', () => this.toggleListMode(true));
        document.getElementById('btn-cancel-list')?.addEventListener('click', () => this.toggleListMode(false));
        document.getElementById('btn-save-list')?.addEventListener('click', () => this.exportSpellList());

        // Filtros
        document.getElementById('sort-order-spell')?.addEventListener('change', () => this.applyFiltersAndRender());
        document.querySelectorAll('.filter-panel input[data-filter-spell]')
            .forEach(cb => cb.addEventListener('change', () => this.applyFiltersAndRender()));

        // Ouve ativamente o evento global
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
        alert(`Manuscrito gerado! Mova para 'feiticos'.`);
        form.reset();
    }

    exportSpellList() {
        if (this.selectedSpells.size === 0) return alert('Nenhum feitiço selecionado.');
        const recordsToExport = this.archive.filter(s => this.selectedSpells.has(s.name));
        DatabaseService.saveRecord(recordsToExport, 'lista_feiticos_ministerio');
        this.toggleListMode(false);
    }

    async loadArchive() {
        const listEl = document.getElementById('archive-spell-list');
        listEl.innerHTML = '<li style="color: var(--magic-gold); text-align: center;">A consultar os feitiços...</li>';
        
        try {
            this.archive = await DatabaseService.fetchCollection('./feiticos', 'indice_feiticos.json');
            this.applyFiltersAndRender();
        } catch (error) {
            listEl.innerHTML = `<li style="color: #ff6b6b;">Erro de Acesso ao Diretório de Magia.</li>`;
        }
    }

    applyFiltersAndRender() {
        // Implementação análoga ao CreatureController.applyFiltersAndRender()
        // Iterando sobre this.archive e renderizando com base na flag this.isListMode
    }
}