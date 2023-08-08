document.addEventListener('DOMContentLoaded', () => {
  const documentInput = document.getElementById('documentInput');
  const uploadButton = document.getElementById('uploadButton');
  const resultsContainer = document.getElementById('results');

  uploadButton.addEventListener('click', async () => {
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
      resultsContainer.innerHTML = '';

      // Loop through extracted data and display it
      data.forEach(item => {
        const resultElement = document.createElement('p');
        resultElement.innerHTML = `<strong>${item.name}:</strong> ${item.value}`;
        resultsContainer.appendChild(resultElement);
      });

    } catch (error) {
      console.error('Error uploading document:', error);
    }
  });
});
