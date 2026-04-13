export class TabController {
    constructor() {
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.init();
    }

    init() {
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.target.getAttribute('data-target');
                this.openTab(targetId, e.target);
            });
        });
    }

    openTab(tabId, clickedBtn) {
        this.tabContents.forEach(tab => tab.classList.remove('active'));
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        
        document.getElementById(tabId).classList.add('active');
        clickedBtn.classList.add('active');

        // Notifica o restante da aplicação qual aba foi ativada
        document.dispatchEvent(new CustomEvent('tab-opened', { detail: { tabId } }));
    }
}