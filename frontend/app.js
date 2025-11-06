// --- App State ---
let userType = 'employee'; // Default state for the new login toggle
// REMOVED: let locationType = 'office';
let orderInterval = null; // Variable to hold the auto-refresh timer

// Payment Modal State
let pendingOrder = null;
let pendingOrderTotal = 0;

// Chart.js Instance Variables
let ordersPerDayChartInstance = null;
let mealPopularityChartInstance = null;
let feedbackSentimentChartInstance = null;

/**
 * Shows a global toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} type
 */
function showGlobalToast(message, type = 'info') {
  const container = document.getElementById('global-toast-container');
  if (!container) return;

  const toast = document.createElement('div');

  const icons = { success: '✓', error: '✖', info: 'ℹ', warning: '⚠' };
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  toast.className = `flex items-center w-full max-w-xs p-4 space-x-3 text-white rounded-lg shadow-lg transition-all duration-300 transform translate-x-full opacity-0`;
  toast.style.background = ''; // We'll use inline tailwind-bg class names in a simpler way
  // Minimal inner layout (keeps safe HTML)
  toast.innerHTML = `
        <div style="font-weight:700; font-size:18px;">${icons[type] || 'ℹ'}</div>
        <div style="font-size:14px;">${message}</div>
    `;

  // Add color using simple mapping (fallback)
  if (type === 'success') toast.style.backgroundColor = '#28a745';
  else if (type === 'error') toast.style.backgroundColor = '#dc3545';
  else if (type === 'warning') toast.style.backgroundColor = '#E65100';
  else toast.style.backgroundColor = '#2563EB';

  container.appendChild(toast);

  // duration logic
  let duration = 4000;
  if (type === 'warning' || type === 'error') duration = 7000;
  // --- Set 'info' duration to 3 seconds per user request ---
  if (type === 'info') duration = 3000;

  // animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  }, 10);

  // animate out and remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.addEventListener('transitionend', () => toast.remove());
    // fallback removal
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 1000);
  }, duration);
}

// Page navigation
function showPage(pageToShow) {
  const loginPage = document.getElementById('login-page-container');
  const empDashboard = document.getElementById('employee-dashboard');
  const staffDashboard = document.getElementById('staff-dashboard');
  const feedbackPage = document.getElementById('feedback-container');
  const navbar = document.getElementById('app-navbar');

  if (loginPage) loginPage.style.display = 'none';
  if (empDashboard) empDashboard.style.display = 'none';
  if (staffDashboard) staffDashboard.style.display = 'none';
  if (feedbackPage) feedbackPage.style.display = 'none';

  if (pageToShow === loginPage) {
    if (navbar) navbar.style.display = 'none';
  } else {
    if (navbar) navbar.style.display = 'block';

    const navToAnalyticsBtn = document.getElementById('nav-to-analytics');
    const navBackToOrdersBtn = document.getElementById('nav-back-to-orders');
    const navToFeedbackBtn = document.getElementById('nav-to-feedback');
    const navBackToMenuBtn = document.getElementById('nav-back-to-menu');

    if (pageToShow === staffDashboard) {
      const adminOrdersView = document.getElementById('admin-orders-view');
      if (adminOrdersView && adminOrdersView.style.display === 'none') {
        if (navToAnalyticsBtn) navToAnalyticsBtn.style.display = 'none';
        if (navBackToOrdersBtn)
          navBackToOrdersBtn.style.display = 'inline-block';
      } else {
        if (navToAnalyticsBtn)
          navToAnalyticsBtn.style.display = 'inline-block';
        if (navBackToOrdersBtn) navBackToOrdersBtn.style.display = 'none';
      }
    }

    if (pageToShow === feedbackPage) {
      if (navToFeedbackBtn) navToFeedbackBtn.style.display = 'none';
      if (navBackToMenuBtn) navBackToMenuBtn.style.display = 'inline-block';
    } else if (pageToShow === empDashboard) {
      if (navToFeedbackBtn) navToFeedbackBtn.style.display = 'inline-block';
      if (navBackToMenuBtn) navBackToMenuBtn.style.display = 'none';
    }
  }

  if (pageToShow) pageToShow.style.display = 'block';
}

// Small utility message box
function showMessage(text, type = 'info') {
  const messageBox = document.getElementById('message-box');
  const messageText = document.getElementById('message-text');
  if (!messageBox || !messageText) return;

  const classMap = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  messageBox.className =
    'mt-6 p-4 rounded-xl text-sm transition-opacity duration-300';
  messageBox.classList.remove('hidden');
  messageBox.classList.add(...(classMap[type] || classMap.info).split(' '));
  messageBox.innerHTML = text;
  setTimeout(() => {
    messageBox.classList.add('hidden');
  }, 5000);
}

// UPDATED: Show/hide new employee fields based on toggle
function setUserType(type) {
  userType = type;
  const userToggles = document.querySelectorAll('.user-toggle');
  const employeeLoginFields = document.getElementById('employee-login-fields');

  if (employeeLoginFields) {
    if (type === 'employee') {
      employeeLoginFields.style.display = 'block';
    } else {
      employeeLoginFields.style.display = 'none';
    }
  }

  userToggles.forEach((btn) => {
    if (btn.dataset.usertype === type) {
      btn.classList.add('bg-blue-600', 'text-white', 'shadow-md');
      btn.classList.remove(
        'text-gray-600',
        'hover:bg-white',
        'hover:text-blue-600'
      );
    } else {
      btn.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
      btn.classList.add(
        'text-gray-600',
        'hover:bg-white',
        'hover:text-blue-600'
      );
    }
  });
}

// REMOVED: setLocationType function is no longer needed

function logout() {
  showPage(document.getElementById('login-page-container'));
  document.body.dataset.userType = 'none';

  if (orderInterval) {
    clearInterval(orderInterval);
    orderInterval = null;
  }

  localStorage.removeItem('currentUserEmail');
  localStorage.removeItem('currentUserLocation'); // Clear location on logout

  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');
  if (emailInput) emailInput.value = '';
  if (passwordInput) passwordInput.value = '';
}

// --- UPDATED NOTIFICATION LOGIC ---

// NEW: Checks if *any* food order was placed for today
function hasPlacedAnyFoodOrderToday() {
  const myEmail = localStorage.getItem('currentUserEmail');
  if (!myEmail) return false;
  const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
  
  // Get today's date as a string YYYY-MM-DD
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const myActiveOrders = allOrders.filter(
    (o) => {
      // Get order date string, default to today if missing
      const orderDateStr = o.orderForDate || new Date(o.id).toISOString().split('T')[0];
      
      return o.name === myEmail &&
      (o.breakfast || o.lunch || o.snacks || o.dinner) &&
      o.status === 'active' &&
      orderDateStr === todayStr // Only count if the order is for today
    }
  );
  return myActiveOrders.length > 0;
}

// RENAMED & UPDATED: Notification logic as per new requirements
function checkFoodRegistrationReminder() {
  const location = localStorage.getItem('currentUserLocation');

  // Don't send notification if WFH or Other
  if (location === 'WFH' || location === 'Any other') {
    return;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const timeInMinutes = currentHour * 60 + currentMinute;

  // Cutoff is 12:30 PM
  const reminderCutoff = 12 * 60 + 30; // 750 minutes
  // Let's send reminder between 9:00 AM and 12:30 PM
  const reminderStart = 9 * 60; // 540 minutes

  if (timeInMinutes >= reminderStart && timeInMinutes < reminderCutoff) {
    setTimeout(() => {
      if (!hasPlacedAnyFoodOrderToday()) {
        showGlobalToast(
          'Are you working from home today? Have you changed your work location? If not, please register for food.', //
          'info'
        );
      }
    }, 2500);
  }
}

// REMOVED: checkAndShowAttendanceConfirmation function

// NEW: Check for admin broadcast messages
function checkFestivalNotifications() {
  const broadcasts = JSON.parse(localStorage.getItem('broadcasts')) || [];
  if (broadcasts.length === 0) return;

  let seenBroadcasts =
    JSON.parse(localStorage.getItem('userSeenBroadcasts')) || [];
  let newMessagesFound = false;

  broadcasts.forEach((broadcast) => {
    // Check if user has *not* seen this broadcast ID
    if (!seenBroadcasts.includes(broadcast.id)) {
      // Show toast
      setTimeout(() => {
        // Stagger notifications
        showGlobalToast(`Admin Message: ${broadcast.message}`, 'info');
      }, 5000 + Math.random() * 2000); // Delay after login

      // Add to seen list
      seenBroadcasts.push(broadcast.id);
      newMessagesFound = true;
    }
  });

  if (newMessagesFound) {
    localStorage.setItem('userSeenBroadcasts', JSON.stringify(seenBroadcasts));
  }
}

// Login handler
// UPDATED: To handle new login form and WFH/Other logic
function handleLogin(e) {
  e.preventDefault();

  const emailElem = document.getElementById('email-input');
  const passwordElem = document.getElementById('password-input');
  if (!emailElem || !passwordElem) return;

  const email = emailElem.value.trim();
  const password = passwordElem.value;

  if (!email || !password) {
    showMessage('Please enter both email and password.', 'error');
    return;
  }

  const staffDashboard = document.getElementById('staff-dashboard');
  const employeeDashboard = document.getElementById('employee-dashboard');

  if (userType === 'admin') {
    document.body.dataset.userType = 'admin';
    showMessage('Admin Login Successful! Loading dashboard...', 'success');
    if (staffDashboard) {
      showPage(staffDashboard);
      initializeOrderDashboard();
    }
  } else {
    // Employee Login
    const empId = document.getElementById('emp-id-input').value;
    const empName = document.getElementById('emp-name-input').value;
    const empMobile = document.getElementById('emp-mobile-input').value;
    const workLocation = document.getElementById('work-location').value;

    // **** CHANGED: Block WFH/Other users from logging in ****
    if (workLocation === 'WFH' || workLocation === 'Any other') {
      showMessage(
        'Employees working from home or other locations do not have access to meal ordering.',
        'error'
      );
      return; // Stop the login
    }
    // **** END OF CHANGE ****

    // Basic validation for new fields
    if (!empId || !empName || !empMobile) {
      showMessage(
        'Please fill in all employee details (ID, Name, Mobile).',
        'error'
      );
      return;
    }

    // Log in all employees regardless of location
    document.body.dataset.userType = 'employee';
    localStorage.setItem('currentUserEmail', email);
    localStorage.setItem('currentUserLocation', workLocation); // Store location

    const emailDisplay = document.getElementById('employee-email-display');
    if (emailDisplay) emailDisplay.textContent = empName || email; // Use Name

    showMessage(
      'Employee Login Successful! Loading dashboard...',
      'success'
    );
    if (employeeDashboard) {
      showPage(employeeDashboard);
      loadEmployeeOrders();

      // Run notification checks
      checkFoodRegistrationReminder(); // Updated 12:30pm check
      checkFestivalNotifications(); // New festival check
    }

    // **** CHANGED: Removed the 'if (workLocation === 'WFH'...' block ****
    // (That code is no longer reachable)
  }

  passwordElem.value = '';
}

async function handleForgotPassword() {
  const emailInput = document.getElementById('email-input');
  const email = emailInput ? emailInput.value.trim() : '';

  if (!email) {
    showMessage('Please enter your email address to reset your password.', 'error');
    return;
  }

  showMessage('Sending reset link...', 'info');

  try {
    const response = await fetch(
      'http://localhost:5000/api/auth/forgot-password',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      showMessage(data.message || 'Reset link sent! Check your inbox.', 'success');
    } else {
      throw new Error(data.message || 'User not found');
    }
  } catch (error) {
    console.error('Forgot Password Error:', error);
    showMessage(`Error: ${error.message}`, 'error');
  }
}

// Employee order dashboard data
// UPDATED: Added Snacks
const weeklyMenu = {
  Monday: {
    Breakfast: { name: 'Idli & Vada', price: 30 },
    Lunch: { name: 'Veg Meals', price: 70 },
    Snacks: { name: 'Samosa', price: 20 },
    Dinner: { name: 'Chapathi & Curry', price: 50 },
  },
  Tuesday: {
    Breakfast: { name: 'Masala Dosa', price: 35 },
    Lunch: { name: 'Chicken Curry', price: 90 },
    Snacks: { name: 'Pani Puri', price: 30 },
    Dinner: { name: 'Paneer Butter Masala', price: 80 },
  },
  Wednesday: {
    Breakfast: { name: 'Poha', price: 25 },
    Lunch: { name: 'Veg Biryani', price: 75 },
    Snacks: { name: 'Tea & Biscuits', price: 15 },
    Dinner: { name: 'Chapathi & Dal', price: 50 },
  },
  Thursday: {
    Breakfast: { name: 'Upma', price: 25 },
    Lunch: { name: 'Fish Thali', price: 100 },
    Snacks: { name: 'Bhel Puri', price: 25 },
    Dinner: { name: 'Paneer Masala', price: 80 },
  },
  Friday: {
    Breakfast: { name: 'Bread Omelette', price: 30 },
    Lunch: { name: 'Egg Curry', price: 80 },
    Snacks: { name: 'Bajji', price: 20 },
    Dinner: { name: 'Chicken Biryani', price: 120 },
  },
  Saturday: {
    Breakfast: { name: 'Pancakes', price: 40 },
    Lunch: { name: 'Veg Meals', price: 70 },
    Snacks: { name: 'Puffs', price: 20 },
    Dinner: { name: 'Veg Pulao', price: 60 },
  },
  Sunday: {
    Breakfast: { name: 'Paratha & Curd', price: 35 },
    Lunch: { name: 'Mixed Veg Curry', price: 75 },
    Snacks: { name: 'Fruit Salad', price: 35 },
    Dinner: { name: 'Chapathi & Paneer Butter Masala', price: 80 },
  },
};

function showMenuByDate() {
  const dateInput = document.getElementById('selectedDate');
  if (!dateInput) return;
  const dateValue = dateInput.value;
  if (!dateValue) return;
  const date = new Date(dateValue);
  const weekdays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dayName = weekdays[date.getDay()];
  const menu = weeklyMenu[dayName];
  const tableBody = document.getElementById('menuTable');
  if (!tableBody) return;
  tableBody.innerHTML = '';
  if (!menu) {
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: #777;">No menu available for ${dayName}.</td></tr>`;
    return;
  }
  // UPDATED: Loop will now automatically include Snacks
  for (const meal in menu) {
    const row = document.createElement('tr');
    row.innerHTML = `
            <td>${meal}</td>
            <td>${menu[meal].name}</td>
            <td>${menu[meal].price}</td>
            <td><input type="number" min="0" placeholder="0" data-day="${dayName}" data-meal="${meal}" data-price="${menu[meal].price}"></td>
        `;
    tableBody.appendChild(row);
  }
}

// UPDATED: Added Snacks
function submitOrder() {
  // **** CHANGED: Get the selected date and validate it ****
  const selectedDateElem = document.getElementById('selectedDate');
  const orderDate = selectedDateElem ? selectedDateElem.value : null; // Get YYYY-MM-DD

  if (!orderDate) {
    alert('Please select a date for your order.');
    return;
  }
  
  // Validate that the date is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to midnight this morning
  const orderDateObj = new Date(orderDate + 'T00:00:00'); // Set to midnight on the selected day

  if (orderDateObj < today) {
      alert('You cannot place orders for a past date.');
      return;
  }
  // **** END OF DATE VALIDATION ****


  const inputs = document.querySelectorAll(
    '#employee-dashboard input[type="number"]'
  );
  const orderItems = [];
  let totalAmount = 0;
  const employeeName = localStorage.getItem('currentUserEmail') || 'Unknown Employee';

  const newAdminOrder = {
    id: Date.now(),
    name: employeeName,
    breakfast: false,
    lunch: false,
    snacks: false, // Added snacks
    dinner: false,
    time: new Date().toLocaleTimeString(),
    orderForDate: orderDate, // **** CHANGED: Save the date ****
    status: 'active',
    paymentStatus: 'Pending',
  };
  let adminOrderHasItems = false;

  inputs.forEach((input) => {
    const qty = parseInt(input.value) || 0;
    if (qty > 0) {
      const day = input.dataset.day;
      const meal = input.dataset.meal;
      const price = parseInt(input.dataset.price) || 0;

      orderItems.push({
        day,
        meal,
        qty,
        price,
        name: weeklyMenu[day][meal].name,
      });
      totalAmount += qty * price;

      if (meal === 'Breakfast') newAdminOrder.breakfast = true;
      else if (meal === 'Lunch') newAdminOrder.lunch = true;
      else if (meal === 'Snacks') newAdminOrder.snacks = true; // Added snacks
      else if (meal === 'Dinner') newAdminOrder.dinner = true;
      adminOrderHasItems = true;
    }
  });

  if (!adminOrderHasItems) {
    alert('Please select at least one meal to order.');
    return;
  }

  pendingOrder = newAdminOrder;
  pendingOrderTotal = totalAmount;

  const totalSpan = document.getElementById('modal-total-amount');
  if (totalSpan) totalSpan.innerText = totalAmount.toFixed(2);

  const qrImg = document.getElementById('modal-qr-code');
  const upiData = `upi://pay?pa=karmic-canteen@upi&am=${totalAmount.toFixed(
    2
  )}&tn=KarmicCanteenOrder`;
  if (qrImg)
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
      upiData
    )}`;

  const paymentModal = document.getElementById('payment-modal');
  if (paymentModal) paymentModal.classList.remove('hidden');
}

// UPDATED: Added Snacks
function handleSuccessfulPayment() {
  if (!pendingOrder) return;
  pendingOrder.paymentStatus = 'Paid';
  const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
  existingOrders.push(pendingOrder);
  localStorage.setItem('orders', JSON.stringify(existingOrders));
  localStorage.setItem('orderTotal', pendingOrderTotal);

  let meals = [];
  if (pendingOrder.breakfast) meals.push('Breakfast');
  if (pendingOrder.lunch) meals.push('Lunch');
  if (pendingOrder.snacks) meals.push('Snacks'); // Added snacks
  if (pendingOrder.dinner) meals.push('Dinner');

  showGlobalToast(
    `Your order for ${meals.join(
      ', '
    )} (₹${pendingOrderTotal}) confirmed!`,
    'success'
  );

  const inputs = document.querySelectorAll(
    '#employee-dashboard input[type="number"]'
  );
  inputs.forEach((input) => (input.value = ''));

  loadEmployeeOrders();

  const paymentModal = document.getElementById('payment-modal');
  if (paymentModal) paymentModal.classList.add('hidden');

  pendingOrder = null;
  pendingOrderTotal = 0;
}

// UPDATED: Added Snacks
function loadEmployeeOrders() {
  const myEmail = localStorage.getItem('currentUserEmail');
  if (!myEmail) return;
  const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
  const myOrders = allOrders.filter((order) => order.name === myEmail);
  const myOrdersBody = document.getElementById('myOrdersBody');
  if (!myOrdersBody) return;
  myOrdersBody.innerHTML = '';

  if (myOrders.length === 0) {
    myOrdersBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #777;">You have no submitted orders.</td></tr>`;
  } else {
    myOrders.forEach((order) => {
      const row = document.createElement('tr');
      let meals = [];
      if (order.breakfast) meals.push('Breakfast');
      if (order.lunch) meals.push('Lunch');
      if (order.snacks) meals.push('Snacks'); // Added snacks
      if (order.dinner) meals.push('Dinner');
      const mealsString = meals.join(', ') || 'No items';
      let actionCellHtml = '';
      if (order.status === 'active') {
        actionCellHtml = `<button class="btn-cancel-user" data-order-id="${order.id}">Cancel</button>`;
      } else if (order.status === 'picked_up') {
        actionCellHtml = `<span class="status-picked-up">Collected</span>`;
      } else if (order.status === 'unclaimed') {
        actionCellHtml = `<span class="status-unclaimed">Not Collected</span>`;
      } else {
        actionCellHtml = `<span class="status-canceled">Canceled</span>`;
      }
      row.innerHTML = `
                <td>${mealsString}</td>
                <td>${order.time}</td>
                <td>${actionCellHtml}</td>
            `;
      myOrdersBody.appendChild(row);
    });
  }
}

function employeeCancelOrder(orderId) {
  const now = new Date();
  const cutOff = new Date();
  cutOff.setHours(21, 0, 0, 0);
  if (now > cutOff) {
    showGlobalToast(
      'Sorry, you can only cancel orders before 9:00 PM.',
      'error'
    );
    return;
  }
  if (confirm('Are you sure you want to cancel this order?')) {
    const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const updatedOrders = allOrders.map((order) => {
      if (String(order.id) === String(orderId))
        return { ...order, status: 'canceled' };
      return order;
    });
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    showGlobalToast('Order canceled successfully.', 'info');
    loadEmployeeOrders();
  }
}

function adminCancelOrder(orderId) {
  if (confirm("Are you sure you want to cancel this employee's order?")) {
    const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const updatedOrders = allOrders.map((order) => {
      if (String(order.id) === String(orderId))
        return { ...order, status: 'canceled' };
      return order;
    });
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    showGlobalToast("Employee's order has been canceled.", 'info');
    loadOrders();
  }
}

function adminMarkAsPickedUp(orderId) {
  const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
  const updatedOrders = allOrders.map((order) => {
    if (String(order.id) === String(orderId))
      return { ...order, status: 'picked_up' };
    return order;
  });
  localStorage.setItem('orders', JSON.stringify(updatedOrders));
  showGlobalToast("Order marked as 'Picked Up'.", 'success');
  loadOrders();
}

// Admin dashboard initialization
function initializeOrderDashboard() {
  const ordersView = document.getElementById('admin-orders-view');
  const analyticsView = document.getElementById('admin-analytics-view');
  if (ordersView) ordersView.style.display = 'block';
  if (analyticsView) analyticsView.style.display = 'none';
  const headerTitle = document.getElementById('admin-header-title');
  if (headerTitle) headerTitle.textContent = '📋 Admin Dashboard - Meal Orders';

  showPage(document.getElementById('staff-dashboard'));

  const clearBtn = document.getElementById('clearOrders');
  if (clearBtn) {
    const newClearBtn = clearBtn.cloneNode(true);
    clearBtn.parentNode.replaceChild(newClearBtn, clearBtn);
    newClearBtn.addEventListener('click', () => {
      if (
        confirm(
          'Are you sure you want to clear ALL orders? (This cannot be undone)'
        )
      ) {
        localStorage.removeItem('orders');
        loadOrders();
        showGlobalToast('All orders have been cleared.', 'warning');
      }
    });
  }

  const orderBody = document.getElementById('orderBody');
  if (orderBody) {
    const newOrderBody = orderBody.cloneNode(true);
    orderBody.parentNode.replaceChild(newOrderBody, orderBody);

    newOrderBody.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-cancel-admin')) {
        adminCancelOrder(e.target.dataset.orderId);
      }
      if (e.target.classList.contains('btn-pickup')) {
        adminMarkAsPickedUp(e.target.dataset.orderId);
      }
    });
  }

  if (orderInterval) clearInterval(orderInterval);
  orderInterval = setInterval(loadOrders, 5000);
  loadOrders();
}

// UPDATED: Added Snacks
function loadOrders() {
  const staffDashboard = document.getElementById('staff-dashboard');
  const orderBody = document.getElementById('orderBody');

  if (
    !staffDashboard ||
    staffDashboard.style.display === 'none' ||
    !orderBody
  ) {
    if (orderInterval) {
      clearInterval(orderInterval);
      orderInterval = null;
    }
    return;
  }

  // **** BUG FIX: Removed the faulty 'if' block that was stopping the timer ****

  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  orderBody.innerHTML = '';

  let breakfastCount = 0;
  let lunchCount = 0;
  let snacksCount = 0; // Added snacks
  let dinnerCount = 0;
  let foodSavedCount = 0;
  let foodWastedCount = 0;

  // Smart Auto-Unclaim System
  let needsUpdate = false;
  let newlyUnclaimedCount = 0;
  const now = new Date();
  const currentHour = now.getHours();
  // **** CHANGED: Get today's date normalized ****
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date to midnight

  const breakfastCutoff = 10;
  const lunchCutoff = 14;
  const snacksCutoff = 18; // Added snacks cutoff
  const dinnerCutoff = 21; // Pushed dinner cutoff to 9 PM

  orders.forEach((order) => {
    if (order.status === 'active') {
      
      // **** CHANGED: Check if the order is for today ****
      // Get order date. Handle old orders that don't have this property.
      // If no date, assume it's for today for backward compatibility.
      const orderDateStr = order.orderForDate || new Date(order.id).toISOString().split('T')[0];
      const orderDateObj = new Date(orderDateStr + 'T00:00:00'); // Normalize order date to midnight
      
      let isToday = (orderDateObj.getTime() === today.getTime());
      // **** END OF DATE CHECK ****


      let markUnclaimed = false;
      
      // **** CHANGED: Only run this logic if the order is for TODAY ****
      if (isToday) { 
        if (order.breakfast && currentHour >= breakfastCutoff) markUnclaimed = true;
        else if (order.lunch && currentHour >= lunchCutoff) markUnclaimed = true;
        else if (order.snacks && currentHour >= snacksCutoff)
          markUnclaimed = true; // Added snacks
        else if (order.dinner && currentHour >= dinnerCutoff) markUnclaimed = true;
      }
      
      if (markUnclaimed) {
        order.status = 'unclaimed';
        needsUpdate = true;
        newlyUnclaimedCount++;
      }
    }
  });

  if (needsUpdate) {
    localStorage.setItem('orders', JSON.stringify(orders));
    if (newlyUnclaimedCount > 0) {
      showGlobalToast(
        `${newlyUnclaimedCount} active order(s) passed mealtime and are now 'Unclaimed'.`,
        'warning'
      );
    }
  }

  if (orders.length === 0) {
    // **** CHANGED: Colspan is 9 now ****
    orderBody.innerHTML = `<tr><td colspan="9" class="no-data">No orders found</td></tr>`;
  } else {
    orders.forEach((order) => {
      const row = document.createElement('tr');
      let actionCellHtml = '';
      if (order.status === 'active') {
        actionCellHtml = `
                    <button class="btn-cancel-admin" data-order-id="${order.id}">Cancel</button>
                    <button class="btn-pickup" data-order-id="${order.id}">Pick Up</button>
                `;
      } else if (order.status === 'canceled') {
        actionCellHtml = `<span class="status-canceled">Canceled</span>`;
      } else if (order.status === 'unclaimed') {
        actionCellHtml = `<span class="status-unclaimed">Unclaimed</span>`;
      } else if (order.status === 'picked_up') {
        actionCellHtml = `<span class="status-picked-up">Picked Up</span>`;
      }
      const rowClass =
        order.status === 'canceled' || order.status === 'unclaimed'
          ? 'row-canceled'
          : '';
      const paymentStatus = order.paymentStatus || 'Pending';
      const paymentClass =
        paymentStatus === 'Paid' ? 'status-paid' : 'status-pending';

      // **** CHANGED: Format the display date ****
      let orderDateDisplay = 'N/A';
      if (order.orderForDate) {
          try {
              // Format as DD-MMM (e.g., 05-Nov)
              orderDateDisplay = new Date(order.orderForDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
          } catch (e) {
              orderDateDisplay = order.orderForDate; // fallback
          }
      }

      // **** CHANGED: Added new <td> for the date ****
      row.innerHTML = `
                <td class="${rowClass}">${order.name || 'Unknown'}</td>
                <td class="${rowClass}">${orderDateDisplay}</td>
                <td class="${rowClass} ${
        order.breakfast ? 'status-yes' : 'status-no'
      }">${order.breakfast ? 'Yes' : 'No'}</td>
                <td class="${rowClass} ${
        order.lunch ? 'status-yes' : 'status-no'
      }">${order.lunch ? 'Yes' : 'No'}</td>
                <td class="${rowClass} ${
        order.snacks ? 'status-yes' : 'status-no'
      }">${order.snacks ? 'Yes' : 'No'}</td>
                <td class="${rowClass} ${
        order.dinner ? 'status-yes' : 'status-no'
      }">${order.dinner ? 'Yes' : 'No'}</td>
                <td class="${rowClass}">${order.time}</td>
                <td class="${rowClass} ${paymentClass}">${paymentStatus}</td>
                <td class="action-cell">${actionCellHtml}</td>
            `;
      orderBody.appendChild(row);

      // **** CHANGED: Count active meals only if they are for today ****
      const orderDateStr = order.orderForDate || new Date(order.id).toISOString().split('T')[0];
      const orderDateObj = new Date(orderDateStr + 'T00:00:00');
      let isToday = (orderDateObj.getTime() === today.getTime());

      if (order.status === 'active' && isToday) { // Only count today's active orders
        if (order.breakfast) breakfastCount++;
        if (order.lunch) lunchCount++;
        if (order.snacks) snacksCount++; // Added snacks
        if (order.dinner) dinnerCount++;
      } else if (order.status === 'picked_up') {
        foodSavedCount++;
      } else if (order.status === 'unclaimed') {
        foodWastedCount++;
      }
    });
  }

  const bElem = document.getElementById('breakfastCount');
  const lElem = document.getElementById('lunchCount');
  const sElem = document.getElementById('snacksCount'); // Added snacks
  const dElem = document.getElementById('dinnerCount');
  const savedElem = document.getElementById('foodSavedCount');
  const wastedElem = document.getElementById('foodWastedCount');

  if (bElem) bElem.textContent = breakfastCount;
  if (lElem) lElem.textContent = lunchCount;
  if (sElem) sElem.textContent = snacksCount; // Added snacks
  if (dElem) dElem.textContent = dinnerCount;
  if (savedElem) savedElem.textContent = foodSavedCount;
  if (wastedElem) wastedElem.textContent = foodWastedCount;
}

// Analytics
function initializeAnalyticsDashboard() {
  if (orderInterval) {
    clearInterval(orderInterval);
    orderInterval = null;
  }

  const headerTitle = document.getElementById('admin-header-title');
  if (headerTitle) headerTitle.textContent = '📊 Admin Dashboard - Analytics';
  showPage(document.getElementById('staff-dashboard'));

  const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
  const allFeedback = JSON.parse(localStorage.getItem('feedbackData')) || [];

  const totalOrders = allOrders.length;
  const activeOrders = allOrders.filter((o) => o.status === 'active').length;
  const canceledOrders = allOrders.filter(
    (o) => o.status === 'canceled'
  ).length;
  const unclaimedOrders = allOrders.filter(
    (o) => o.status === 'unclaimed'
  ).length;
  let avgRating = 'N/A';
  if (allFeedback.length > 0) {
    const totalRatings = allFeedback.reduce(
      (acc, f) => acc + parseInt(f.foodRating) + parseInt(f.hygieneRating),
      0
    );
    const avg = (totalRatings / (allFeedback.length * 2)).toFixed(1);
    avgRating = `${avg} / 5`;
  }
  const elTotal = document.getElementById('analytics-total-orders');
  const elActive = document.getElementById('analytics-active-orders');
  const elCanceled = document.getElementById('analytics-canceled-orders');
  const elUnclaimed = document.getElementById('analytics-unclaimed-orders');
  const elAvg = document.getElementById('analytics-avg-rating');

  if (elTotal) elTotal.textContent = totalOrders;
  if (elActive) elActive.textContent = activeOrders;
  if (elCanceled) elCanceled.textContent = canceledOrders;
  if (elUnclaimed) elUnclaimed.textContent = unclaimedOrders;
  if (elAvg) elAvg.textContent = avgRating;

  if (ordersPerDayChartInstance) ordersPerDayChartInstance.destroy();
  if (mealPopularityChartInstance) mealPopularityChartInstance.destroy();
  if (feedbackSentimentChartInstance) feedbackSentimentChartInstance.destroy();

  renderOrdersPerDayChart(allOrders);
  renderMealPopularityChart(allOrders.filter((o) => o.status === 'active'));
  renderFeedbackSentimentChart(allFeedback);
}

function renderOrdersPerDayChart(orders) {
  const canvas = document.getElementById('ordersPerDayChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // **** CHANGED: Use the orderForDate property ****
  const dayCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  orders.forEach((order) => {
    // Use the order date, fallback to the ID (timestamp)
    const dateToUse = order.orderForDate ? new Date(order.orderForDate + 'T00:00:00') : new Date(order.id);
    const day = dateToUse.getDay();
    dayCounts[day]++;
  });
  const data = [
    dayCounts[1],
    dayCounts[2],
    dayCounts[3],
    dayCounts[4],
    dayCounts[5],
    dayCounts[6],
    dayCounts[0],
  ];
  ordersPerDayChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Total Orders',
          data: data,
          backgroundColor: 'rgba(0, 123, 255, 0.7)',
          borderColor: 'rgba(0, 123, 255, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  });
}

// UPDATED: Added Snacks
function renderMealPopularityChart(activeOrders) {
  const canvas = document.getElementById('mealPopularityChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let breakfast = 0,
    lunch = 0,
    snacks = 0, // Added snacks
    dinner = 0;

  // **** CHANGED: Only count active orders for TODAY ****
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date
  
  activeOrders.forEach((order) => {
    const orderDateStr = order.orderForDate || new Date(order.id).toISOString().split('T')[0];
    const orderDateObj = new Date(orderDateStr + 'T00:00:00');
    let isToday = (orderDateObj.getTime() === today.getTime());

    if (isToday) { // Only count today's meals
      if (order.breakfast) breakfast++;
      if (order.lunch) lunch++;
      if (order.snacks) snacks++; // Added snacks
      if (order.dinner) dinner++;
    }
  });
  
  mealPopularityChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'], // Added snacks
      datasets: [
        {
          label: 'Meal Popularity',
          data: [breakfast, lunch, snacks, dinner], // Added snacks
          backgroundColor: [
            'rgba(255, 159, 64, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)', // Added snacks
            'rgba(54, 162, 235, 0.7)',
          ],
          borderColor: [
            'rgba(255, 159, 64, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)', // Added snacks
            'rgba(54, 162, 235, 1)',
          ],
          borderWidth: 1,
        },
      ],
    },
    options: { responsive: true },
  });
}
function renderFeedbackSentimentChart(feedback) {
  const canvas = document.getElementById('feedbackSentimentChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const sentimentByDate = {};
  feedback.forEach((f) => {
    const date = new Date(f.date).toLocaleDateString();
    if (!sentimentByDate[date])
      sentimentByDate[date] = { positive: 0, neutral: 0, negative: 0 };
    sentimentByDate[date][f.sentiment]++;
  });
  const labels = Object.keys(sentimentByDate).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const positiveData = labels.map((label) => sentimentByDate[label].positive);
  const neutralData = labels.map((label) => sentimentByDate[label].neutral);
  const negativeData = labels.map((label) => sentimentByDate[label].negative);
  feedbackSentimentChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Positive',
          data: positiveData,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.1,
        },
        {
          label: 'Neutral',
          data: neutralData,
          borderColor: 'rgba(255, 206, 86, 1)',
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          fill: true,
          tension: 0.1,
        },
        {
          label: 'Negative',
          data: negativeData,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: true,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  });
}

// Sentiment analyzer
function analyzeSentiment(text) {
  const positiveKeywords = [
    'good',
    'tasty',
    'excellent',
    'love',
    'great',
    'amazing',
    'happy',
    'best',
  ];
  const negativeKeywords = [
    'bad',
    'cold',
    'poor',
    'hate',
    'awful',
    'terrible',
    'sad',
    'worst',
    'late',
  ];
  const lowerText = (text || '').toLowerCase();
  for (const keyword of negativeKeywords)
    if (lowerText.includes(keyword)) return 'negative';
  for (const keyword of positiveKeywords)
    if (lowerText.includes(keyword)) return 'positive';
  return 'neutral';
}

// NEW: Admin broadcast function
function broadcastNotification() {
  const messageInput = document.getElementById('broadcast-message');
  if (!messageInput) return;
  const message = messageInput.value.trim();

  if (!message) {
    showGlobalToast('Please enter a notification message.', 'error');
    return;
  }

  // Get existing broadcasts, or init empty array
  let broadcasts = JSON.parse(localStorage.getItem('broadcasts')) || [];

  const newBroadcast = {
    id: Date.now(),
    message: message,
  };

  broadcasts.push(newBroadcast);
  localStorage.setItem('broadcasts', JSON.stringify(broadcasts));

  showGlobalToast('Notification has been broadcast!', 'success');
  messageInput.value = '';
}

// DOM ready: setup listeners
document.addEventListener('DOMContentLoaded', () => {
  const emailInputOnLoad = document.getElementById('email-input');
  const passwordInputOnLoad = document.getElementById('password-input');
  if (emailInputOnLoad) emailInputOnLoad.value = '';
  if (passwordInputOnLoad) passwordInputOnLoad.value = '';

  const loginPageContainer = document.getElementById('login-page-container');
  const employeeDashboard = document.getElementById('employee-dashboard');
  const staffDashboard = document.getElementById('staff-dashboard');
  const feedbackContainer = document.getElementById('feedback-container');

  const loginForm = document.getElementById('login-form');
  const feedbackForm = document.getElementById('feedback-form');

  const logoutBtn = document.getElementById('logout-btn');
  const forgotPasswordButton = document.getElementById(
    'forgot-password-button'
  );

  const userToggles = document.querySelectorAll('.user-toggle');
  // REMOVED: locationToggles listener

  const selectedDateInput = document.getElementById('selectedDate');
  const submitOrderBtn = document.getElementById('submitOrderBtn');

  const modalPayBtn = document.getElementById('modal-pay-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');

  const navToFeedbackBtn = document.getElementById('nav-to-feedback');
  const navBackToMenuBtn = document.getElementById('nav-back-to-menu');
  const navToAnalyticsBtn = document.getElementById('nav-to-analytics');
  const navBackToOrdersBtn = document.getElementById('nav-back-to-orders');
  const hiddenBackToMenuLink = document.getElementById(
    'nav-back-to-menu-hidden-link'
  );
  // NEW: Broadcast button listener
  const sendBroadcastBtn = document.getElementById('sendBroadcastBtn');

  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (forgotPasswordButton)
    forgotPasswordButton.addEventListener('click', handleForgotPassword);
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  if (userToggles) {
    userToggles.forEach((btn) => {
      btn.addEventListener('click', (e) =>
        setUserType(e.currentTarget.dataset.usertype)
      );
    });
  }
  // REMOVED: locationToggles listener

  setUserType(userType);
  // REMOVED: setLocationType call

  if (navToFeedbackBtn)
    navToFeedbackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(feedbackContainer);
    });
  if (navBackToMenuBtn)
    navBackToMenuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(employeeDashboard);
    });
  if (hiddenBackToMenuLink)
    hiddenBackToMenuLink.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(employeeDashboard);
    });

  if (navToAnalyticsBtn) {
    navToAnalyticsBtn.addEventListener('click', () => {
      const ordersView = document.getElementById('admin-orders-view');
      const analyticsView = document.getElementById('admin-analytics-view');
      if (ordersView) ordersView.style.display = 'none';
      if (analyticsView) analyticsView.style.display = 'block';
      initializeAnalyticsDashboard();
    });
  }
  if (navBackToOrdersBtn) {
    navBackToOrdersBtn.addEventListener('click', () => {
      initializeOrderDashboard();
    });
  }

  if (selectedDateInput)
    selectedDateInput.addEventListener('change', showMenuByDate);
  if (submitOrderBtn) submitOrderBtn.addEventListener('click', submitOrder);

  // NEW: Added listener for broadcast button
  if (sendBroadcastBtn)
    sendBroadcastBtn.addEventListener('click', broadcastNotification);

  if (modalPayBtn)
    modalPayBtn.addEventListener('click', handleSuccessfulPayment);
  if (modalCancelBtn) {
    modalCancelBtn.addEventListener('click', () => {
      const paymentModal = document.getElementById('payment-modal');
      if (paymentModal) paymentModal.classList.add('hidden');
      pendingOrder = null;
      pendingOrderTotal = 0;
      showGlobalToast('Payment canceled. Order was not placed.', 'info');
    });
  }

  const myOrdersBody = document.getElementById('myOrdersBody');
  if (myOrdersBody) {
    myOrdersBody.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-cancel-user')) {
        employeeCancelOrder(e.target.dataset.orderId);
      }
    });
  }

  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const foodRating = document.querySelector(
        'input[name="food-rating"]:checked'
      );
      const hygieneRating = document.querySelector(
        'input[name="hygiene-rating"]:checked'
      );

      if (!foodRating || !hygieneRating) {
        showGlobalToast(
          'Please provide a rating for both food and hygiene.',
          'error'
        );
        return;
      }

      const comments = document.getElementById('feedback-comments').value.trim();
      const sentiment = analyzeSentiment(comments);
      const allFeedback =
        JSON.parse(localStorage.getItem('feedbackData')) || [];

      allFeedback.push({
        foodRating: foodRating.value,
        hygieneRating: hygieneRating.value,
        comments: comments,
        sentiment: sentiment,
        date: new Date().toISOString(),
      });

      localStorage.setItem('feedbackData', JSON.stringify(allFeedback));

      showGlobalToast('Thank you for your feedback!', 'success');
      feedbackForm.reset();
      showPage(employeeDashboard);
    });
  }

  // Show login page on initial load
  showPage(loginPageContainer);
});