export class TabController {
    constructor() {
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.init();
    }

    init() {
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // e.currentTarget garante que estamos pegando o atributo do botão, e não do texto dentro dele
                const targetId = e.currentTarget.getAttribute('data-target');
                this.openTab(targetId, e.currentTarget);
            });
        });
    }

    openTab(tabId, clickedBtn) {
        this.tabContents.forEach(tab => tab.classList.remove('active'));
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        
        document.getElementById(tabId).classList.add('active');
        clickedBtn.classList.add('active');

        document.dispatchEvent(new CustomEvent('tab-opened', { detail: { tabId } }));
    }
}