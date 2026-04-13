import { exportJson } from '../utils/helpers.js';

export const DatabaseService = {
    /**
     * Busca todos os registros de uma determinada coleção (pasta).
     * @param {string} collectionPath - Caminho da pasta (ex: './dados')
     * @param {string} indexFile - Nome do índice (ex: 'indice.json')
     */
    async fetchCollection(collectionPath, indexFile = 'indice.json') {
        const cacheBuster = `?t=${new Date().getTime()}`;
        try {
            const indexResponse = await fetch(`${collectionPath}/${indexFile}${cacheBuster}`);
            if (!indexResponse.ok) throw new Error("Índice não encontrado.");
            
            const fileNames = await indexResponse.json();
            const records = [];

            for (let fileName of fileNames) {
                try {
                    const res = await fetch(`${collectionPath}/${fileName}${cacheBuster}`);
                    if (res.ok) records.push(await res.json());
                } catch (err) {
                    console.warn(`Aviso: Falha ao procurar ${fileName}`);
                }
            }
            return records;
        } catch (error) {
            console.error("Erro no Banco de Dados local:", error);
            throw error;
        }
    },

    /**
     * Salva o registro (Atua exportando o arquivo JSON).
     */
    saveRecord(data, filename) {
        exportJson(data, filename);
    }
};