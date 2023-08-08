document.addEventListener('DOMContentLoaded', () => {
  const documentInput = document.getElementById('documentInput');
  const resultsTableBody = document.getElementById('resultsTableBody');

  documentInput.addEventListener('change', async () => {
    const selectedFile = documentInput.files[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      // Clear previous results
      resultsTableBody.innerHTML = '';

      // Loop through extracted data and populate the table
      data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.name}</td>
          <td>${item.value}</td>
        `;
        resultsTableBody.appendChild(row);
      });

    } catch (error) {
      console.error('Error uploading document:', error);
    }
  });
});
