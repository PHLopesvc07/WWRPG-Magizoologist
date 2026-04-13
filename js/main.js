import { TabController } from './controllers/TabController.js';
import { CreatureController } from './controllers/CreatureController.js';
import { SpellController } from './controllers/SpellController.js';

console.log("Inicializando o Ministério da Magia - DRCCM...");

// Instancia os controladores diretamente (o type="module" no HTML já garante que o DOM está pronto)
const tabController = new TabController();
const creatureController = new CreatureController();
const spellController = new SpellController();