/**
 * Transforma um arquivo de imagem em String Base64.
 * Retorna uma Promise para facilitar o uso assíncrono.
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve('');
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

/**
 * Simula a "Escrita" no Banco de Dados via Download de JSON.
 */
export function exportJson(dataObj, baseName) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
    const safeName = baseName.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
    
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${safeName}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}