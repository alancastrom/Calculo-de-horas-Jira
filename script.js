let groupedData = {};

document.getElementById('calculateBtn').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    const resultDiv = document.getElementById('result');
    
    if (!fileInput.files[0]) {
        resultDiv.textContent = 'Por favor, selecione um arquivo CSV.';
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n');
        if (lines.length < 2) {
            resultDiv.textContent = 'Arquivo CSV inválido ou vazio.';
            return;
        }
        
        const headers = lines[0].split(',');
        const tipoIndex = headers.findIndex(h => h.trim() === 'Tipo de item');
        const responsavelIndex = headers.findIndex(h => h.trim() === 'Responsável');
        const tempoGastoIndex = headers.findIndex(h => h.trim() === 'Tempo gasto');
        
        if (tipoIndex === -1 || responsavelIndex === -1 || tempoGastoIndex === -1) {
            resultDiv.textContent = 'Colunas necessárias não encontradas no CSV.';
            return;
        }
        
        groupedData = {};
        for (let i = 1; i < lines.length; i++) {
            const cells = lines[i].split(',');
            if (cells.length > Math.max(tipoIndex, responsavelIndex, tempoGastoIndex)) {
                const tipo = cells[tipoIndex].trim();
                const responsavel = cells[responsavelIndex].trim();
                const value = parseFloat(cells[tempoGastoIndex].trim());
                if (!isNaN(value) && tipo && responsavel) {
                    const key = `${tipo}|${responsavel}`;
                    if (!groupedData[key]) {
                        groupedData[key] = { tipo, responsavel, totalSeconds: 0 };
                    }
                    groupedData[key].totalSeconds += value;
                }
            }
        }
        
        let totalAllSeconds = 0;
        let html = '<table><thead><tr><th>Tipo de Atividade</th><th>Responsável</th><th>Total de Horas</th></tr></thead><tbody>';
        for (const key in groupedData) {
            const item = groupedData[key];
            const totalHours = (item.totalSeconds / 3600).toFixed(2);
            html += `<tr><td>${item.tipo}</td><td>${item.responsavel}</td><td>${totalHours}</td></tr>`;
            totalAllSeconds += item.totalSeconds;
        }
        const totalAllHours = (totalAllSeconds / 3600).toFixed(2);
        html += `<tr><td colspan="2"><strong>Total Geral</strong></td><td><strong>${totalAllHours}</strong></td></tr>`;
        html += '</tbody></table>';
        resultDiv.innerHTML = html;
        
        document.getElementById('exportBtn').style.display = 'inline-block';
    };
    
    reader.readAsText(file);
});

document.getElementById('exportBtn').addEventListener('click', function() {
    if (Object.keys(groupedData).length === 0) {
        alert('Nenhum dado para exportar.');
        return;
    }
    
    let csvContent = 'Tipo de Atividade,Responsável,Total de Horas\n';
    let totalAllSeconds = 0;
    for (const key in groupedData) {
        const item = groupedData[key];
        const totalHours = (item.totalSeconds / 3600).toFixed(2);
        csvContent += `${item.tipo},${item.responsavel},${totalHours}\n`;
        totalAllSeconds += item.totalSeconds;
    }
    const totalAllHours = (totalAllSeconds / 3600).toFixed(2);
    csvContent += `Total Geral,,${totalAllHours}\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'horas_calculadas.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});