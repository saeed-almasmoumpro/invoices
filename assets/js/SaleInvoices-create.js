/////////////supplier
var supplierDropdown = document.getElementById('customer_id');
var codeInput = document.getElementById('code');
supplierDropdown.addEventListener('change', function() {
  var selectedOption = supplierDropdown.options[supplierDropdown.selectedIndex];
  codeInput.value = selectedOption.getAttribute('data-code');
});
////////////tathbeet /////////////////
var customerDropdown = document.getElementById('tathbeet_id');
var discountInput = document.getElementById('tathbeet-discount');
var quantityInput = document.getElementById('tathbeet-quantity');

// Initial update based on selected option
var selectedOption = customerDropdown.options[customerDropdown.selectedIndex];
discountInput.value = selectedOption.getAttribute('data-discount');
quantityInput.value = selectedOption.getAttribute('data-quantity');

// Update values on dropdown change
customerDropdown.addEventListener('change', function() {
  var selectedOption = customerDropdown.options[customerDropdown.selectedIndex];
  discountInput.value = selectedOption.getAttribute('data-discount');
  quantityInput.value = selectedOption.getAttribute('data-quantity');
});
//////// product /////
document.addEventListener('DOMContentLoaded', function() {
  var addProductButton = document.getElementById('add-product');
  var productsTable = document.getElementById('products');
  var productsTableBody = document.getElementById('tableBody');
  var productCount = 1;
  var invoiceSelectedProducts = new Map(); // Map to store selected products for each invoice
  var data = []; // Array to store product data

  // Update the select element with all products on page load
  var selectElement = productsTableBody.querySelector('select[name="products[0][product_id]"]');
  var url = '/get-all-products'; // Replace with the actual URL to fetch all product data
  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(responseData) {
      data = responseData; // Store the product data in the array
      
      // Populate the select element with all products
      populateSelectElement(selectElement, 0);
      
      // Trigger the change event to automatically select the unit
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
    populateSelectElement(selectElement, productCount);

    // Trigger the change event to automatically select the unit
    selectElement.dispatchEvent(new Event('change'));

    // Update the name attribute of the input elements in the new row
    var inputElements = newRow.querySelectorAll('input, select');
    inputElements.forEach(function(inputElement) {
      var attributeName = inputElement.getAttribute('name');
      var updatedAttributeName = attributeName.replace('products[0]', 'products[' + productCount + ']');
      inputElement.setAttribute('name', updatedAttributeName);
      inputElement.value = '';
    });

    // Append the new row to the table
    productsTableBody.appendChild(newRow);

    // Increment the product count
    productCount++;
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
        fetch('/api/search?query=' + searchInputValue)
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
              // option.setAttribute('data-cat-name', product.cat_name);
              option.setAttribute('data-unit', product.unit_symbol);
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

  // Function to populate the select element with all products
  function populateSelectElement(selectElement, invoiceIndex) {
    data.forEach(function(product) {
      var invoiceID = getInvoiceID(); // Replace with the actual function to get the invoice ID
      var selectedProducts = invoiceSelectedProducts.get(invoiceID);
      if (!selectedProducts || !selectedProducts.has(product.id)) {
        var option = document.createElement('option');
        option.value = product.id;
        option.text = product.name;
        option.setAttribute('data-unit', product.unit_symbol);
        selectElement.appendChild(option);
      }
    });
  }

  // Function to get the invoice ID
  function getInvoiceID() {
    // Replace with the actual function to get the invoice ID
    // You can use a logic specific to your application
    // For example, you can retrieve it from a hidden input field or generate it dynamically
    return 'invoice1';
  }
});

$(document).ready(function() {
  // Handle product selection change
  $(document).on('change', 'select[name^="products"][name$="[product_id]"]', function() {
    var productRow = $(this).closest('tr');
    var selectedOption = $(this).find('option:selected');
    var unit = selectedOption.data('unit');
    var price = selectedOption.data('price');

    // Set the unit and price for the selected product
    productRow.find('input[name$="[unit_symbol]"]').val(unit);
    productRow.find('input[name$="[price]"]').val(price);

    // Calculate and update the total price
    calculateTotalPrice(productRow);
  });

  // Handle quantity change
  $(document).on('input', 'input[name^="products"][name$="[quantity]"]', function() {
    var productRow = $(this).closest('tr');

    // Calculate and update the total price
    calculateTotalPrice(productRow);
  });

  // Handle discount change
  $(document).on('input', 'input[name^="products"][name$="[discount]"]', function() {
    var productRow = $(this).closest('tr');

    // Calculate and update the net price
    calculateNetPrice(productRow);
  });

  // Calculate and update the total price
  function calculateTotalPrice(productRow) {
    var quantity = productRow.find('input[name$="[quantity]"]').val();
    var price = productRow.find('input[name$="[price]"]').val();
    var totalPrice = quantity * price;

    productRow.find('input[name$="[total_price]"]').val(totalPrice.toFixed(2));

  // Calculate and update the net price
  calculateNetPrice(productRow);
}

// Calculate and update the net price
function calculateNetPrice(productRow) {
  var totalPrice = parseFloat(productRow.find('input[name$="[total_price]"]').val());
  var discount = parseFloat(productRow.find('input[name$="[discount]"]').val());
  var netPrice = totalPrice + ((totalPrice * discount)/ 100);

  productRow.find('input[name$="[net_price]"]').val(netPrice.toFixed(2));

  calNet();
}

});
addFun();
/////////////////for add product///////////////////////

function addFun() {
  var tableCon = document.getElementById("products");
  var productCount = tableCon.getElementsByTagName("tr").length; // Get the count of existing rows
  var rowcontent = `
    <tr>
      <td>
        <input type="text" id="searchInput_${productCount}" placeholder="Search for products" class="form-control">
        <div id="searchResults_${productCount}">
          <select name="products[${productCount}][product_id]" class="form-control" required>
            <option>اختر المنتج</option>
          </select>
        </div>
      </td>
      <td><input type="number" class="form-control" name="products[${productCount}][price]" required readonly></td>
      <td><input type="number" class="form-control" name="products[${productCount}][quantity]" required></td>
      <td><input type="text" class="form-control" name="products[${productCount}][unit_symbol]" required readonly></td>
      <td><input type="number" class="form-control" name="products[${productCount}][total_price]" required readonly></td>
      <td><input type="number" class="form-control percent" name="products[${productCount}][discount]" step="0.01"></td>
      <td><input type="number" class="form-control net_price" name="products[${productCount}][net_price]" required readonly></td>
      <td><input type="text" class="form-control" name="products[${productCount}][note]"></td>
      <td><button type="button" class="remove-btn" onclick="removeRow(this)">حذف</button></td>
      
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
              fetch('/api/search?query=' + searchInputValue)
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
                          option.textContent = product.name;
                          option.setAttribute('data-unit', product.unit_symbol);
               
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

      // Trigger the change event to populate the unit symbol and update the price
      productSelect.addEventListener('change', function () {
          const selectedOption = productSelect.options[productSelect.selectedIndex];
          const unitSymbolInput = newRow.querySelector(`input[name="products[${productCount}][unit_symbol]"]`);
          const priceInput = newRow.querySelector(`input[name="products[${productCount}][price]"]`);
          const netPriceInput = newRow.querySelector(`input[name="products[${productCount}][net_price]"]`);
          const discountInput = newRow.querySelector(`input[name="products[${productCount}][discount]"]`);          
          unitSymbolInput.value = selectedOption.getAttribute('data-unit');

          // Get the price from the server
          const productId = selectedOption.value;
          var typeSelect = document.getElementById('type');
          const type = typeSelect.value;
          getProductPrice(type, productId, priceInput, newRow); // Call the modified getProductPrice function

                  // Trigger the input event for net price and discount inputs
                  netPriceInput.addEventListener('input', function () {
                  calNet(); // Calculate and update the total net price
                  });

                  discountInput.addEventListener('input', function () {
                  calNet(); // Calculate and update the total net price
                  });
      });

      // Trigger the input event to populate the product options
      searchInput.dispatchEvent(new Event('input'));


  }
}

function getProductPrice(type, productId, priceInput, newRow) {
  // Create the request URL
  const url = `/get-product-price?product_id=${productId}&type=${type}`;

  // Send a GET request to the server
  fetch(url)
      .then(function (response) {
          return response.json();
      })
      .then(function (response) {
          if (response.success) {
              priceInput.value = response.price;
              updateTotalPrice(newRow); // Call the function```javascript
              updateTotalPrice(newRow); // Call the function to update the total price
          } else {
              console.log(response.error);
          }
      })
      .catch(function (error) {
          console.log('Error:', error);
      });
}

function updateTotalPrice(newRow) {
  const quantityInput = newRow.querySelector(`input[name="products[${productCount}][quantity]"]`);
  const priceInput = newRow.querySelector(`input[name="products[${productCount}][price]"]`);
  const totalPriceInput = newRow.querySelector(`input[name="products[${productCount}][total_price]"]`);
  const discountInput = newRow.querySelector(`input[name="products[${productCount}][discount]"]`);
  const netPriceInput = newRow.querySelector(`input[name="products[${productCount}][net_price]"]`);

  // Calculate the total price
  const quantity = parseFloat(quantityInput.value);
  const price = parseFloat(priceInput.value);
  const total = quantity * price;
  totalPriceInput.value = total.toFixed(2);

  // Calculate net price after applying discount
  const discount = parseFloat(discountInput.value);
  const netPrice = total + ((discount * total) / 100 );
  netPriceInput.value = netPrice.toFixed(2);
  calNet();
}

function removeRow(button) {
var row = button.closest('tr');
row.remove();

calNet(); // Calculate and update the total net price
}


function formatNumber(number) {
return number.toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
}

function calNet() {
let totalNet = 0;
let percent = $('#percent').val();
let num = $('#num').val();
let hasPercent = false;
let hasNum = false;

// Check if both percent and num values are present
if (percent !== '' && num !== '') {
  // Display a warning to the user
  alert('Please enter either the percentage or the constant value, not both.');
  return; // Exit the function
}

if (percent !== '') {
  hasPercent = true;
}
if (num !== '') {
  hasNum = true;
}

$('.net_price').each(function() {
  let netPrice = +$(this).val();
  let totalPrice = +$(this).closest('tr').find('input[name$="[total_price]"]').val();

  if (isNaN(netPrice) || netPrice === 0) {
    netPrice = totalPrice;
    $(this).val(netPrice.toFixed(2));
  }

  // Apply the calculation based on the selected option if percentage or constant value is present
  if (hasPercent) {
    if ($('#operator').val() === '+') {
      netPrice = netPrice + (netPrice * percent) / 100;
    } else if ($('#operator').val() === '-') {
      netPrice = netPrice - (netPrice * percent) / 100;
    }
  } else if (hasNum) {
    console.log('netPrice:', netPrice);
    console.log('num:', num);
    if ($('#operator_num').val() === '+') {
      netPrice = netPrice + +num;
    } else if ($('#operator_num').val() === '-') {
      netPrice = netPrice - +num;
    } else if ($('#operator_num').val() === '*') {
      netPrice = netPrice * +num;
    }
  }

  totalNet += netPrice;
});

let formattedTotalNet = formatNumber(totalNet);

$('#totalNetPrice').val(formattedTotalNet);
$('#totalNetPriceDisplay').text(formattedTotalNet);
}

// Bind the calNet() function to relevant input field changes
$('#percent, #num, .net_price, #operator, #operator_num').on('input', calNet);