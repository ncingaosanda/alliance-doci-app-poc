document.addEventListener('DOMContentLoaded', () => {
  const documentInput = document.getElementById('documentInput');
  const resultsTableBody = document.getElementById('resultsTableBody');
  const downloadCsvButton = document.getElementById('downloadCsvButton');
  const downloadJsonButton = document.getElementById('downloadJsonButton');
  const saveToFirestoreButton = document.getElementById('saveToFirestoreButton');

  let extractedData = [];

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

      resultsTableBody.innerHTML = '';

      data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.name}</td>
          <td contenteditable="true">${item.value}</td>
          <td><button class="edit-button">Edit</button></td>
        `;
        resultsTableBody.appendChild(row);
      });

      extractedData = data;

      downloadCsvButton.disabled = false;
      downloadJsonButton.disabled = false;
      saveToFirestoreButton.disabled = false;

    } catch (error) {
      console.error('Error uploading document:', error);
    }
  });

  resultsTableBody.addEventListener('click', event => {
    const target = event.target;

    if (target.classList.contains('edit-button')) {
      const row = target.closest('tr');
      const valueCell = row.querySelector('td:nth-child(2)');

      if (target.textContent === 'Edit') {
        valueCell.contentEditable = true;
        valueCell.focus();
        target.textContent = 'Save';
        target.classList.add('save-button');
      } else if (target.textContent === 'Save') {
        valueCell.contentEditable = false;
        target.textContent = 'Edit';
        target.classList.remove('save-button');
      }
    }
  });

  saveToFirestoreButton.addEventListener('click', async () => {
    try {
      const editedData = getEditedDataFromTable();
      const response = await fetch('http://34.93.73.173:4200/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedData)
      });
      const result = await response.json();
      console.log('Data saved to Firestore:', result);
    } catch (error) {
      console.error('Error saving data to Firestore:', error);
    }
  });

  downloadCsvButton.addEventListener('click', () => {
    const editedData = getEditedDataFromTable();
    const csvData = convertToCsv(editedData);
    downloadFile(csvData, 'data.csv', 'text/csv');
  });

  downloadJsonButton.addEventListener('click', () => {
    const editedData = getEditedDataFromTable();
    const jsonData = JSON.stringify(editedData, null, 2);
    downloadFile(jsonData, 'data.json', 'application/json');
  });

  function getEditedDataFromTable() {
    const editedData = [];
    const rows = resultsTableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const name = cells[0].textContent;
      const value = cells[1].textContent;
      editedData.push({ name, value });
    });

    return editedData;
  }

  function downloadFile(data, filename, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function convertToCsv(data) {
    const headers = ['Name', 'Value'];
    const csvRows = [];

    csvRows.push(headers.join(','));

    data.forEach(item => {
      const values = [item.name, item.value];
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }
});
