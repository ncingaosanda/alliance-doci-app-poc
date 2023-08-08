document.addEventListener('DOMContentLoaded', () => {
  const documentInput = document.getElementById('documentInput');
  const resultsSheet = document.getElementById('resultsSheet');

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
      resultsSheet.innerHTML = '';

      // Loop through extracted data and display it in the sheet
      data.forEach(item => {
        const resultElement = document.createElement('p');
        resultElement.innerHTML = `<strong>${item.name}:</strong> ${item.value}`;
        resultsSheet.appendChild(resultElement);
      });

    } catch (error) {
      console.error('Error uploading document:', error);
    }
  });
});
