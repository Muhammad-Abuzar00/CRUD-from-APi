const apiUrl = 'https://gorest.co.in/public/v2/users'; 
const token = '7d9ec68ee1046c27d7e96dda21f6d358d5e111b8c8fc491215c57b9dbd3e40b5'; 

const $tableHead = $('#tableHead');
const $tableBody = $('#tableBody');
const $modal = $('#modal');
const $formContainer = $('#formContainer');
const $modalTitle = $('#modalTitle');
const $saveButton = $('#saveButton');
const $closeButton = $('#closeButton');
const $addButton = $('#addButton');

let editingItem = null;
let fields = [];

function fetchData() {
  $.ajax({
    url: apiUrl,
    type: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    success: function(data) {
      if (data.length) {
        fields = Object.keys(data[0]);
        renderTableHead(fields);
        renderTableBody(data);
      } else {
        $tableHead.html('');
        $tableBody.html('<tr><td colspan="3">No Data Found</td></tr>');
      }
    },
    error: function(error) {
      console.error('Fetch Data Error:', error);
    }
  });
}

function renderTableHead(fields) {
  let headerHtml = `<tr>${fields.map(field => `<th>${field}</th>`).join('')}<th>Actions</th></tr>`;
  $tableHead.html(headerHtml);
}

function renderTableBody(data) {
  $tableBody.empty();
  data.forEach(item => {
    const rowHtml = `
      <tr data-id="${item.id}">
        ${fields.map(field => `<td>${item[field]}</td>`).join('')}
        <td>
          <button class="editBtn">Edit</button>
          <button class="delete">Delete</button>
        </td>
      </tr>
    `;
    $tableBody.append(rowHtml);
  });
}

function openModal(title, data = {}) {
  $modal.show();
  $modalTitle.text(title);
  $formContainer.empty();
  fields.forEach(field => {
    $formContainer.append(`
      <label>${field}:</label>
      <input type="text" id="${field}" value="${data[field] || ''}">
    `);
  });
}

function closeModal() {
  $modal.hide();
  editingItem = null;
}

$saveButton.on('click', function() {
  const data = {};
  fields.forEach(field => {
    data[field] = $('#' + field).val();
  });

  $.ajax({
    url: editingItem ? `${apiUrl}/${editingItem}` : apiUrl,
    type: editingItem ? 'PUT' : 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(data),
    success: function() {
      closeModal();
      fetchData(); 
    },
    error: function(error) {
      console.error('Save Error:', error);
    }
  });
});

$(document).on('click', '.deleteBtn', function() {
  const id = $(this).closest('tr').data('id');
  $.ajax({
    url: `${apiUrl}/${id}`,
    type: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    success: function() {
      fetchData();
    },
    error: function(error) {
      console.error('Delete Error:', error);
    }
  });
});

$(document).on('click', '.editBtn', function() {
  const id = $(this).closest('tr').data('id');
  const rowData = $(this).closest('tr').find('td').map(function() {
    return $(this).text();
  }).get();
  
  const data = fields.reduce((obj, field, index) => {
    obj[field] = rowData[index];
    return obj;
  }, {});
  
  editingItem = id;
  openModal('Edit Item', data);
});

$addButton.on('click', function() {
  editingItem = null;
  openModal('Add New Item');
});

$closeButton.on('click', closeModal);


fetchData();
