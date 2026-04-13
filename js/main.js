import { TabController } from './controllers/TabController.js';
import { CreatureController } from './controllers/CreatureController.js';
import { SpellController } from './controllers/SpellController.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Inicializando o Ministério da Magia - DRCCM...");

    const tabController = new TabController();
    const creatureController = new CreatureController();
    const spellController = new SpellController();
});