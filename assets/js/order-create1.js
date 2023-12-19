
document.addEventListener('DOMContentLoaded', function() {
  var addProductButton = document.getElementById('add-product');
  var productsTable = document.getElementById('products');
  var productsTableBody = productsTable.getElementsByTagName('tbody')[0];
  var productCount = 1;
  var invoiceSelectedProducts = new Map(); // Map to store selected products for each invoice

  // Update the select element with all products on page load
  var selectElement = productsTableBody.querySelector('select[name="products[0][product_id]"]');
  var url = '/get-all-products'; // Replace with the actual URL to fetch all product data
  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      // Populate the select element with all products
      data.forEach(function(product) {
        var invoiceID = getInvoiceID(); // Replace with the actual function to get the invoice ID
        var selectedProducts = invoiceSelectedProducts.get(invoiceID);
        if (!selectedProducts || !selectedProducts.has(product.id)) {
          var option = document.createElement('option');
          option.value = product.id;
          option.text = product.name;
          option.setAttribute('data-cat-name', product.cat_name);
          option.setAttribute('data-unit-symbol', product.unit_symbol);
          selectElement.appendChild(option);
        }
      });

      // Trigger the change event to automatically select the unit and category
      selectElement.dispatchEvent(new Event('change'));
    })
    .catch(function(error) {
      console.log('Error:', error);
    });

  addProductButton.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent form submission and page refresh

    var firstRow = productsTableBody.getElementsByTagName('tr')[0];
    var newRow = firstRow.cloneNode(true);

    // Update the select element in the new row
    var selectElement = newRow.querySelector('select[name="products[0][product_id]"]');
    selectElement.innerHTML = ''; // Clear the select element

    // Populate the select element with all products
    data.forEach(function(product) {
      var invoiceID = getInvoiceID(); // Replace with the actual function to get the invoice ID
      var selectedProducts = invoiceSelectedProducts.get(invoiceID);
      if (!selectedProducts || !selectedProducts.has(product.id)) {
        var option = document.createElement('option');
        option.value = product.id;
        option.text = product.name;
        option.setAttribute('data-cat-name', product.cat_name);
        option.setAttribute('data-unit-symbol', product.unit_symbol);
        selectElement.appendChild(option);
      }
    });

    // Trigger the change event to automatically select the unit and category
    selectElement.dispatchEvent(new Event('change'));

    // Update the name and id attributes of the input elements in the new row
    var inputElements = newRow.querySelectorAll('input, select');
    inputElements.forEach(function(inputElement) {
      var attributeName = inputElement.getAttribute('name');
      var updatedAttributeName = attributeName.replace('products[0]', 'products[' + productCount + ']');
      inputElement.setAttribute('name', updatedAttributeName);
      inputElement.value = '';
    });

    // Remove the selected option from the dropdown
    var selectedOptionIndex = selectElement.selectedIndex;
    var selectedProductId = selectElement.options[selectedOptionIndex].value;
    var invoiceID = getInvoiceID(); // Replace with the actual function to get the invoice ID

    if (!invoiceSelectedProducts.has(invoiceID)) {
      invoiceSelectedProducts.set(invoiceID, new Set());
    }

    invoiceSelectedProducts.get(invoiceID).add(selectedProductId);
    // selectElement.remove(selectedOptionIndex);

    // Append the new row to the table
    productsTableBody.appendChild(newRow);

    // Increment the product count
    productCount++;
  });

  var productsContainer = document.getElementById('products');
  productsContainer.addEventListener('change', function(event) {
    var target = event.target;
    if (target.tagName === 'SELECT' && target.name.endsWith('[product_id]')) {
      var selectedIndex = target.selectedIndex;
      var selectedOption = target.options[selectedIndex];
      var parentRow = target.closest('tr');
      var catNameInput = parentRow.querySelector('[name$="[cat_name]"]');
      var unitSymbolInput = parentRow.querySelector('[name$="[unit_symbol]"]');
      catNameInput.value = selectedOption.getAttribute('data-cat-name');
      unitSymbolInput.value = selectedOption.getAttribute('data-unit-symbol');
    }
  });

  var customerDropdown = document.getElementById('customer_id');
  var codeInput = document.getElementById('code');
  customerDropdown.addEventListener('change', function() {
    var selectedOption = customerDropdown.options[customerDropdown.selectedIndex];
    codeInput.value = selectedOption.getAttribute('data-code');
  });

  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const productSelect = document.querySelector('select[name="products[0][product_id]"]');
  let isSearchInProgress = false;
  
  if (searchInput && searchResults && productSelect) {
    searchInput.addEventListener('input', function() {
      const searchInputValue = searchInput.value;
  
  
  
      if (!isSearchInProgress) {
        isSearchInProgress = true;
  
        // Perform AJAX request to search for products
        fetch('https://anas.safwa.xyz/public/api/search?query=' + searchInputValue)
          .then(function(response) {
            return response.json();
          })
          .then(function(response) {
            // Clear existing options
            productSelect.innerHTML = '';
  
            // Add the default instruction option
            const defaultOption = document.createElement('option');
            defaultOption.textContent = 'اختر المنتج';
            productSelect.appendChild(defaultOption);
  
            // Create and append new options based on the search results
            response.forEach(function(product) {
              const option = document.createElement('option');
              option.value = product.id;
              option.setAttribute('data-cat-name', product.cat_name);
              option.setAttribute('data-unit-symbol', product.unit_symbol);
              option.textContent = product.name;
              productSelect.appendChild(option);
            });
  
            isSearchInProgress = false;
          })
          .catch(function(error) {
            console.log('Error:', error);
            isSearchInProgress = false;
          });
      }
    });
  }

  function getInvoiceID() {
    // Replace with the actual function to get the invoice ID
    return 'invoiceID';
  }

});
function addFun() {
  var tableCon = document.getElementById("products");
  var productCount = tableCon.getElementsByTagName("tr").length; // Get the count of existing rows
  var rowcontent = `
    <tr>
      <td><input type="text" class="form-control" name="products[${productCount}][cat_name]" required readonly></td>
      <td>
        <input type="text" id="searchInput_${productCount}" placeholder="البحث عن المادة" class="form-control">
        <div id="searchResults_${productCount}">
          <select name="products[${productCount}][product_id]" class="form-control" required>
            <option>اختر المادة</option>
          </select>
        </div>
      </td>
      <td><input type="number" class="form-control" name="products[${productCount}][quantity]" required></td>
      <td><input type="text" class="form-control" name="products[${productCount}][unit_symbol]" required readonly></td>
      <td><input type="text" class="form-control" name="products[${productCount}][pro_note]"></td>
      <td><button type="button" class="btn btn-danger remove-btn" onclick="removeRow(this)">حذف</button></td>
    </tr>
  `;
  var newRow = document.createElement("tr");
  newRow.innerHTML = rowcontent;
  tableCon.append(newRow);

  const searchInput = newRow.querySelector(`#searchInput_${productCount}`);
  const searchResults = newRow.querySelector(`#searchResults_${productCount}`);
  const productSelect = newRow.querySelector(`select[name="products[${productCount}][product_id]"]`);
  let isSearchInProgress = false;

  if (searchInput && searchResults && productSelect) {
    searchInput.addEventListener('input', function () {
      const searchInputValue = searchInput.value;

      if (!isSearchInProgress) {
        isSearchInProgress = true;

        // Perform AJAX request to search for products
        fetch('https://anas.safwa.xyz/public/api/search?query=' + searchInputValue)
          .then(function (response) {
            return response.json();
          })
          .then(function (response) {
            // Clear existing options
            productSelect.innerHTML = '';

            // Add the default instruction option
            const defaultOption = document.createElement('option');
            defaultOption.textContent = 'اختر المنتج';
            productSelect.appendChild(defaultOption);

            // Create and append new options based on the search results
            response.forEach(function (product) {
              const option = document.createElement('option');
              option.value = product.id;
              option.setAttribute('data-cat-name', product.cat_name);
              option.setAttribute('data-unit-symbol', product.unit_symbol);
              option.textContent = product.name;
              productSelect.appendChild(option);
            });

            isSearchInProgress = false;
          })
          .catch(function (error) {
            console.log('Error:', error);
            isSearchInProgress = false;
          });
      }
    });

    // Trigger the change event to automatically select the unit symbol
    productSelect.addEventListener('change', function () {
      var selectedOption = productSelect.options[productSelect.selectedIndex];
      var unitSymbolInput = newRow.querySelector('[name$="[unit_symbol]"]');
      unitSymbolInput.value = selectedOption.getAttribute('data-unit-symbol');
    });

    // Trigger the input event to populate the product options
    searchInput.dispatchEvent(new Event('input'));
  }
}
function removeRow(btn) {
  var row = btn.parentNode.parentNode;
  row.parentNode.removeChild(row);
}
/////////////// for custmer //////////////////////
const searchInput = document.getElementById('searchCustmer');
const searchResults = document.getElementById('serchCustmeeer');
const customerSelect = document.getElementById('customer_id');
let isSearchInProgress = false;

if (searchInput && searchResults && customerSelect) {
  searchInput.addEventListener('input', function() {
    const searchInputValue = searchInput.value;

    if (!isSearchInProgress) {
      isSearchInProgress = true;

      // Perform AJAX request to search for customers
      fetch('https://anas.safwa.xyz/public/api/searchCustmer?query=' + searchInputValue)
        .then(function(response) {
          return response.json();
        })
        .then(function(response) {
          // Clear existing options
          customerSelect.innerHTML = '';

          // Add the default instruction option
          const defaultOption = document.createElement('option');
          defaultOption.textContent = 'اختر زبون';
          customerSelect.appendChild(defaultOption);

          // Create and append new options based on the search results
          response.forEach(function(customer) {
            const option = document.createElement('option');
            option.value = customer.id;
            option.setAttribute('data-code', customer.code);
            option.textContent = customer.name;
            customerSelect.appendChild(option);
          });

          isSearchInProgress = false;
        })
        .catch(function(error) {
          console.log('Error:', error);
          isSearchInProgress = false;
        });
    }
  });
}
//////////////////for supplier/////////////////////
const searchInputSupplier = document.getElementById('searchSupplier');
const searchResultsSupplier = document.getElementById('searchSupplieeeer');
const supplierSelect = document.getElementById('supplier_id');
let isSearchInProgressSupplier = false;

if (searchInputSupplier && searchResultsSupplier && supplierSelect) {
  searchInputSupplier.addEventListener('input', function() {
    const searchInputValueSupplier = searchInputSupplier.value;

    if (!isSearchInProgressSupplier) {
      isSearchInProgressSupplier = true;

      // Perform AJAX request to search for suppliers
      fetch('https://anas.safwa.xyz/public/api/searchSupplier?query=' + searchInputValueSupplier)
        .then(function(response) {
          return response.json();
        })
        .then(function(response) {
          // Clear existing options
          supplierSelect.innerHTML = '';

          // Add the default instruction option
          const defaultOption = document.createElement('option');
          defaultOption.textContent = 'اختر المورد';
          supplierSelect.appendChild(defaultOption);

          // Create and append new options based on the search results
          response.forEach(function(supplier) {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = supplier.name;
            supplierSelect.appendChild(option);
          });

          isSearchInProgressSupplier = false;
        })
        .catch(function(error) {
          console.log('Error:', error);
          isSearchInProgressSupplier = false;
        });
    }
  });
}
