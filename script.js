const apiUrl = 'https://gorest.co.in/public/v2/users'; 
const token = '7d9ec68ee1046c27d7e96dda21f6d358d5e111b8c8fc491215c57b9dbd3e40b5'; 

const tableHead = document.getElementById('tableHead');
const tableBody = document.getElementById('tableBody');
const modal = document.getElementById('modal');
const formContainer = document.getElementById('formContainer');
const modalTitle = document.getElementById('modalTitle');
const saveButton = document.getElementById('saveButton');
const closeButton = document.getElementById('closeButton');
const addButton = document.getElementById('addButton');

let editingItem = null;
let fields = [];


async function fetchData() {
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const data = await response.json();
    if (data.length) {
      fields = Object.keys(data[0]);
      renderTableHead(fields);
      renderTableBody(data);
    } else {
      tableHead.innerHTML = '';
      tableBody.innerHTML = '<tr><td colspan="3">No Data Found</td></tr>';
    }
  } catch (error) {
    console.error('Fetch Data Error:', error);
  }
}


function renderTableHead(fields) {
  tableHead.innerHTML = `
    <tr>
      ${fields.map(field => `<th>${field}</th>`).join('')}
      <th>Actions</th>
    </tr>
  `;
}


function renderTableBody(data) {
  tableBody.innerHTML = '';
  data.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      ${fields.map(field => `<td>${item[field]}</td>`).join('')}
      <td>
        <button onclick="editItem(${item.id})">Edit</button>
        <button class="delete" onclick="deleteItem(${item.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}


function openModal(title, data = {}) {
  modal.style.display = 'block';
  modalTitle.textContent = title;
  formContainer.innerHTML = '';
  fields.forEach(field => {
    formContainer.innerHTML += `
      <label>${field}:</label>
      <input type="text" id="${field}" value="${data[field] || ''}">
    `;
  });
}


function closeModal() {
  modal.style.display = 'none';
  editingItem = null;
}


saveButton.addEventListener('click', async () => {
  const data = {};
  fields.forEach(field => {
    data[field] = document.getElementById(field).value;
  });

  try {
    const response = await fetch(editingItem ? `${apiUrl}/${editingItem}` : apiUrl, {
      method: editingItem ? 'PUT' : 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    closeModal();
    fetchData(); 
  } catch (error) {
    console.error('Save Error:', error);
  }
});


async function deleteItem(id) {
  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    fetchData();
  } catch (error) {
    console.error('Delete Error:', error);
  }
}


function editItem(id) {
  editingItem = id;
  const rowData = Array.from(tableBody.children).find(row =>
    row.children[0].textContent == id
  );
  const data = fields.reduce((obj, field, index) => {
    obj[field] = rowData.children[index].textContent;
    return obj;
  }, {});
  openModal('Edit Item', data);
}


addButton.addEventListener('click', () => {
  editingItem = null;
  openModal('Add New Item');
});


closeButton.addEventListener('click', closeModal);

fetchData();
