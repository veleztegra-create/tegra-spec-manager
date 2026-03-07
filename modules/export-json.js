// =====================================================
// EXPORTAR A JSON
// =====================================================

function exportJSON() {
    try {
        if (typeof buildSpecData !== 'function') {
            if (typeof showStatus === 'function') showStatus('❌ Error: buildSpecData() no encontrado', 'error');
            return;
        }

        const data = buildSpecData();
        const style = data.style || 'SinEstilo';
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
        const fileName = `TegraSpec_${style}_${timestamp}.json`;

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", fileName);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

        if (typeof showStatus === 'function') {
            showStatus('✅ Spec descargada como JSON', 'success');
        }
    } catch (e) {
        console.error('Error al exportar JSON:', e);
        if (typeof showStatus === 'function') {
            showStatus('❌ Error al exportar la spec', 'error');
        }
    }
}
