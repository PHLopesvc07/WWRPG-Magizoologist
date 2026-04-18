
import { exportJson } from '../utils/helpers.js';

export const DatabaseService = {
    async fetchCollection(collectionPath, indexFile) {
        const cacheBuster = `?t=${new Date().getTime()}`;
        try {
            const indexResponse = await fetch(`${collectionPath}/${indexFile}${cacheBuster}`);
            if (!indexResponse.ok) throw new Error("Índice não encontrado.");

            const fileNames = await indexResponse.json();
            const records = [];

            for (const fileName of fileNames) {
                try {
                    const res = await fetch(`${collectionPath}/${fileName}${cacheBuster}`);
                    if (res.ok) records.push(await res.json());
                } catch {
                    console.warn(`Falha ao ler o arquivo: ${fileName}`);
                }
            }
            return records;
        } catch (error) {
            console.error("Erro no Banco de Dados local:", error);
            throw error;
        }
    },

    saveRecord(data, filename) {
        exportJson(data, filename);
    }
};