// ============================================================================
// FILE:    fee-handler.js
// MODULE:  Fee Management
// PURPOSE: Fee Management Handler - Full fee lifecycle: fee structures, student fee records, payment tracking, receipts, and reports
//
// PROJECT: Shree Saraswati Secondary School — Management System
// STACK:   Vanilla JS + Supabase (PostgreSQL) + HTML/CSS
// UPDATED: 2026-06-03
// ============================================================================
/**
 * ADVANCED FEE MANAGEMENT HANDLER
 * Handles all fee-related operations for admin portal
 * Features: Categories, Student Fee Assignment, Payments, Discounts, Reports, Reminders
 */

// ========================================
// INITIALIZATION & DATA LOADING
// ========================================

let feeData = {
  categories: [],
  structures: [],
  studentFees: [],
  payments: [],
  discounts: [],
  students: [],
  academicYear: '2024-2025'
};

async function initializeFeeManagement() {
  try {
    console.log('📋 Initializing Fee Management System...');
    
    // Load all required data
    await loadFeeCategories();
    await loadStudentFees();
    await loadPayments();
    await loadStudents();
    
    // Populate dropdowns
    populateFeeDropdowns();
    populateStudentDropdowns();
    
    // Load initial views
    loadFeeLedger();
    loadFeeReports();
    loadPaymentTracking();
    
    console.log('✅ Fee Management System initialized');
  } catch (error) {
    console.error('❌ Error initializing fee management:', error);
    showNotification('Error loading fee data', 'error');
  }
}

// Load fee categories from database
async function loadFeeCategories() {
  try {
    const { data, error } = await supabaseDb
      .from('fee_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    feeData.categories = data || [];
    console.log(`📦 Loaded ${feeData.categories.length} fee categories`);
  } catch (error) {
    console.error('Error loading fee categories:', error);
  }
}

// Load student fees from database
async function loadStudentFees() {
  try {
    const { data, error } = await supabaseDb
      .from('student_fees')
      .select('*')
      .eq('academic_year', feeData.academicYear)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    feeData.studentFees = data || [];
    console.log(`💰 Loaded ${feeData.studentFees.length} student fee records`);
  } catch (error) {
    console.error('Error loading student fees:', error);
  }
}

// Load payments from database
async function loadPayments() {
  try {
    const { data, error } = await supabaseDb
      .from('student_payments')
      .select('*')
      .eq('status', 'verified')
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    feeData.payments = data || [];
    console.log(`✅ Loaded ${feeData.payments.length} verified payments`);
  } catch (error) {
    console.error('Error loading payments:', error);
  }
}

// Load students from database
async function loadStudents() {
  try {
    const { data, error } = await supabaseDb
      .from('students_registry')
      .select('roll, name, class')
      .eq('status', 'Active')
      .order('roll', { ascending: true });
    
    if (error) throw error;
    feeData.students = data || [];
    console.log(`👥 Loaded ${feeData.students.length} students`);
  } catch (error) {
    console.error('Error loading students:', error);
  }
}

// ========================================
// FEE CATEGORIES MANAGEMENT
// ========================================

async function addFeeCategory(event) {
  event.preventDefault();
  
  try {
    const categoryName = document.getElementById('cat-name').value;
    const description = document.getElementById('cat-desc').value;
    const frequency = document.getElementById('cat-frequency').value;
    const applicableClass = document.getElementById('cat-applicable-class').value;
    
    // Validate inputs
    if (!categoryName || !frequency || !applicableClass) {
      showNotification('Please fill all required fields', 'warning');
      return;
    }
    
    // Generate category code
    const categoryCode = `CAT-${Date.now().toString().slice(-6)}`;
    
    const { data, error } = await supabaseDb
      .from('fee_categories')
      .insert([
        {
          category_name: categoryName,
          category_code: categoryCode,
          description: description,
          frequency: frequency,
          applicable_to_classes: applicableClass,
          display_order: feeData.categories.length + 1
        }
      ])
      .select();
    
    if (error) throw error;
    
    // Add to local array and refresh
    feeData.categories.push(data[0]);
    
    // Clear form and refresh UI
    document.getElementById('cat-name').value = '';
    document.getElementById('cat-desc').value = '';
    document.getElementById('cat-frequency').value = 'Monthly';
    document.getElementById('cat-applicable-class').value = '';
    
    // Refresh category list
    displayFeeCategories();
    populateFeeDropdowns();
    
    showNotification(`✅ Fee Category "${categoryName}" created successfully!`, 'success');
  } catch (error) {
    console.error('Error adding fee category:', error);
    showNotification('Failed to create fee category', 'error');
  }
}

// Display fee categories in table
function displayFeeCategories() {
  const tbody = document.getElementById('fee-categories-tbody');
  
  if (feeData.categories.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 2rem; color: #94a3b8;">
          No fee categories available. Create one to get started.
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = feeData.categories.map(cat => `
    <tr>
      <td style="font-weight: 600;">${cat.category_name}</td>
      <td>${cat.frequency}</td>
      <td>${cat.applicable_to_classes}</td>
      <td>
        <button class="submit-btn" style="padding: 0.5rem 1rem; font-size: 0.8rem; background: #3b82f6;" onclick="editFeeCategory(${cat.id})">Edit</button>
        <button class="submit-btn" style="padding: 0.5rem 1rem; font-size: 0.8rem; background: #ef4444;" onclick="deleteFeeCategory(${cat.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

async function deleteFeeCategory(categoryId) {
  if (!confirm('Are you sure you want to delete this category?')) return;
  
  try {
    const { error } = await supabaseDb
      .from('fee_categories')
      .delete()
      .eq('id', categoryId);
    
    if (error) throw error;
    
    // Remove from local array
    feeData.categories = feeData.categories.filter(c => c.id !== categoryId);
    displayFeeCategories();
    populateFeeDropdowns();
    
    showNotification('Fee category deleted successfully', 'success');
  } catch (error) {
    console.error('Error deleting fee category:', error);
    showNotification('Failed to delete fee category', 'error');
  }
}

// ========================================
// ASSIGN STUDENT FEES
// ========================================

function handleFeeAssignTypeChange() {
  const assignType = document.getElementById('fee-assign-type').value;
  const classGroup = document.getElementById('fee-class-group');
  const studentGroup = document.getElementById('fee-student-group');
  const studentInput = document.getElementById('fee-student');
  const classInput = document.getElementById('fee-class');
  
  if (assignType === 'all') {
    classGroup.style.display = 'none';
    studentGroup.style.display = 'none';
    studentInput.removeAttribute('required');
    classInput.removeAttribute('required');
  } else if (assignType === 'class') {
    classGroup.style.display = 'block';
    studentGroup.style.display = 'none';
    classInput.setAttribute('required', 'required');
    studentInput.removeAttribute('required');
  } else {
    // Specific Student
    classGroup.style.display = 'block';
    studentGroup.style.display = 'block';
    classInput.setAttribute('required', 'required');
    studentInput.setAttribute('required', 'required');
    handleFeeClassChange(); // Filter students based on current class
  }
}

function handleFeeClassChange() {
  const selectedClass = document.getElementById('fee-class').value;
  const studentSelect = document.getElementById('fee-student');
  if (!studentSelect) return;
  
  const filteredStudents = selectedClass ? feeData.students.filter(s => s.class === selectedClass) : feeData.students;
  
  studentSelect.innerHTML = '<option value="">-- Choose Student --</option>' +
    filteredStudents.map(student =>
      `<option value="${student.roll}">${student.name} (Roll: ${student.roll}, ${student.class})</option>`
    ).join('');
}

async function assignStudentFee(event) {
  event.preventDefault();
  
  try {
    const assignType = document.getElementById('fee-assign-type').value;
    const selectedClass = document.getElementById('fee-class').value;
    const studentRoll = parseInt(document.getElementById('fee-student').value);
    
    const categoryId = parseInt(document.getElementById('fee-category').value);
    const amount = parseFloat(document.getElementById('fee-amount').value);
    const dueDate = document.getElementById('fee-due-date').value;
    const description = document.getElementById('fee-description').value;
    const installmentNumber = parseInt(document.getElementById('fee-installment').value) || 1;
    
    // Validate common inputs
    if (!categoryId || !amount || !dueDate) {
      showNotification('Please fill all required fee details', 'warning');
      return;
    }
    
    // Get category info
    const category = feeData.categories.find(c => c.id === categoryId);
    if (!category) {
      showNotification('Invalid category', 'warning');
      return;
    }

    let targetStudents = [];

    if (assignType === 'all') {
      targetStudents = feeData.students;
      if (targetStudents.length === 0) {
        showNotification('No active students found in the system.', 'warning');
        return;
      }
      if (!confirm(`Are you sure you want to assign this fee to ALL ${targetStudents.length} students?`)) return;
    } else if (assignType === 'class') {
      if (!selectedClass) {
        showNotification('Please select a class', 'warning');
        return;
      }
      targetStudents = feeData.students.filter(s => s.class === selectedClass);
      if (targetStudents.length === 0) {
        showNotification(`No active students found in ${selectedClass}.`, 'warning');
        return;
      }
      if (!confirm(`Are you sure you want to assign this fee to all ${targetStudents.length} students in ${selectedClass}?`)) return;
    } else {
      if (!studentRoll) {
        showNotification('Please select a student', 'warning');
        return;
      }
      const student = feeData.students.find(s => s.roll === studentRoll);
      if (!student) {
        showNotification('Invalid student', 'warning');
        return;
      }
      targetStudents = [student];
    }
    
    // Prepare fee records
    const feeRecords = targetStudents.map(student => ({
      student_roll: student.roll,
      student_name: student.name,
      student_class: student.class,
      fee_category_id: categoryId,
      category_name: category.category_name,
      amount: amount,
      academic_year: feeData.academicYear,
      due_date: dueDate,
      description: description,
      installment_number: installmentNumber,
      status: 'pending',
      assigned_by: typeof getCurrentAdminEmail === 'function' ? getCurrentAdminEmail() : 'admin'
    }));

    // Disable button to prevent double submission
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⏳ Assigning...';
    submitBtn.disabled = true;

    // Insert student fee records
    const { data, error } = await supabaseDb
      .from('student_fees')
      .insert(feeRecords)
      .select();
    
    if (error) throw error;
    
    // Add to local array
    if (data) {
        feeData.studentFees.push(...data);
    }
    
    // Clear form
    document.getElementById('fee-amount').value = '';
    document.getElementById('fee-description').value = '';
    document.getElementById('fee-installment').value = '1';
    
    // Refresh displays
    displayStudentFees();
    loadFeeLedger();
    
    let successMessage = '';
    if (assignType === 'student') {
        successMessage = `✅ Fee of Rs. ${amount} assigned to ${targetStudents[0].name}`;
    } else {
        successMessage = `✅ Fee of Rs. ${amount} assigned to ${targetStudents.length} students successfully`;
    }
    showNotification(successMessage, 'success');
  } catch (error) {
    console.error('Error assigning student fee:', error);
    showNotification('Failed to assign fee: ' + error.message, 'error');
  } finally {
      const submitBtn = event.target.querySelector('button[type="submit"]');
      if (submitBtn) {
          submitBtn.innerHTML = '💰 Assign Fee';
          submitBtn.disabled = false;
      }
  }
}

// Display assigned student fees
function displayStudentFees() {
  const tbody = document.getElementById('student-fees-tbody');
  const searchTerm = document.getElementById('fee-search')?.value.toLowerCase() || '';
  
  let filteredFees = feeData.studentFees;
  if (searchTerm) {
    filteredFees = filteredFees.filter(fee =>
      fee.student_name.toLowerCase().includes(searchTerm) ||
      fee.student_roll.toString().includes(searchTerm)
    );
  }
  
  if (filteredFees.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: #94a3b8;">
          No fees assigned yet
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = filteredFees.map(fee => {
    const statusBadge = getStatusBadge(fee.status);
    const isPaid = fee.status === 'cleared';
    
    return `
      <tr>
        <td>${fee.student_roll}</td>
        <td style="font-weight: 600;">${fee.student_name}</td>
        <td>${fee.category_name}</td>
        <td style="font-weight: 600;">Rs. ${fee.amount.toFixed(2)}</td>
        <td>${new Date(fee.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="submit-btn" style="padding: 0.5rem 0.8rem; font-size: 0.8rem; background: #3b82f6;" onclick="editStudentFee(${fee.id})">Edit</button>
          <button class="submit-btn" style="padding: 0.5rem 0.8rem; font-size: 0.8rem; background: #10b981;" onclick="recordPayment(${fee.id})">Pay</button>
          <button class="submit-btn" style="padding: 0.5rem 0.8rem; font-size: 0.8rem; background: #ef4444;" onclick="deleteStudentFee(${fee.id})">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Filter student fees by search
function filterStudentFees() {
  displayStudentFees();
}

async function deleteStudentFee(feeId) {
  if (!confirm('Delete this fee assignment?')) return;
  
  try {
    const { error } = await supabaseDb
      .from('student_fees')
      .delete()
      .eq('id', feeId);
    
    if (error) throw error;
    
    feeData.studentFees = feeData.studentFees.filter(f => f.id !== feeId);
    displayStudentFees();
    loadFeeLedger();
    
    showNotification('Fee deleted successfully', 'success');
  } catch (error) {
    console.error('Error deleting fee:', error);
    showNotification('Failed to delete fee', 'error');
  }
}

// ========================================
// PAYMENT RECORDING
// ========================================

async function recordPayment(feeId) {
  try {
    // Find the fee
    const fee = feeData.studentFees.find(f => f.id === feeId);
    if (!fee) {
      showNotification('Fee not found', 'error');
      return;
    }
    
    // Create payment recording form
    const paymentForm = `
      <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
        <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          <h3 style="margin-bottom: 1.5rem; color: var(--primary); font-family: 'Playfair Display', serif;">Record Payment</h3>
          
          <div style="background: #f0f4ff; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid var(--accent);">
            <p style="margin: 0.5rem 0;"><strong>Student:</strong> ${fee.student_name} (Roll: ${fee.student_roll})</p>
            <p style="margin: 0.5rem 0;"><strong>Category:</strong> ${fee.category_name}</p>
            <p style="margin: 0.5rem 0;"><strong>Amount Due:</strong> Rs. ${fee.amount.toFixed(2)}</p>
            <p style="margin: 0.5rem 0;"><strong>Due Date:</strong> ${new Date(fee.due_date).toLocaleDateString()}</p>
          </div>
          
          <form onsubmit="submitPayment(event, ${feeId})">
            <div class="form-group">
              <label>Amount Paid (Rs.) *</label>
              <input type="number" id="payment-amount" class="form-control" placeholder="${fee.amount.toFixed(2)}" step="0.01" min="0.01" max="${fee.amount}" required>
            </div>
            
            <div class="form-group">
              <label>Payment Date *</label>
              <input type="date" id="payment-date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            
            <div class="form-group">
              <label>Payment Mode *</label>
              <select id="payment-mode" class="form-control" required>
                <option value="">-- Select Mode --</option>
                <option value="Cash">Cash</option>
                <option value="Online">Online/Net Banking</option>
                <option value="Cheque">Cheque</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Transaction ID / Reference</label>
              <input type="text" id="payment-txn-id" class="form-control" placeholder="e.g., TXN123456789">
            </div>
            
            <div class="form-group">
              <label>Payment Notes</label>
              <textarea id="payment-notes" class="form-control" rows="2" placeholder="Optional notes..."></textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <button type="submit" class="submit-btn" style="background: var(--success); width: 100%;">✅ Record Payment</button>
              <button type="button" class="submit-btn" style="background: #6b7280; width: 100%;" onclick="closePaymentModal()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // Add modal to DOM
    const modalContainer = document.createElement('div');
    modalContainer.id = 'payment-modal';
    modalContainer.innerHTML = paymentForm;
    document.body.appendChild(modalContainer);
    
  } catch (error) {
    console.error('Error opening payment form:', error);
    showNotification('Failed to open payment form', 'error');
  }
}

async function submitPayment(event, feeId) {
  event.preventDefault();
  
  try {
    const amount = parseFloat(document.getElementById('payment-amount').value);
    const paymentDate = document.getElementById('payment-date').value;
    const paymentMode = document.getElementById('payment-mode').value;
    const transactionId = document.getElementById('payment-txn-id').value;
    const notes = document.getElementById('payment-notes').value;
    
    if (!amount || !paymentDate || !paymentMode) {
      showNotification('Please fill all required fields', 'warning');
      return;
    }
    
    const fee = feeData.studentFees.find(f => f.id === feeId);
    if (!fee) throw new Error('Fee not found');
    
    // Record payment
    const { data, error } = await supabaseDb
      .from('student_payments')
      .insert([
        {
          student_roll: fee.student_roll,
          student_name: fee.student_name,
          student_fee_id: feeId,
          amount_paid: amount,
          payment_date: paymentDate,
          payment_mode: paymentMode,
          transaction_id: transactionId || null,
          payment_notes: notes,
          recorded_by: getCurrentAdminEmail(),
          status: 'verified'
        }
      ])
      .select();
    
    if (error) throw error;
    
    // Add to local payments array
    feeData.payments.push(data[0]);
    
    // Update fee status
    const totalPaid = feeData.payments
      .filter(p => p.student_fee_id === feeId)
      .reduce((sum, p) => sum + p.amount_paid, 0);
    
    let newStatus = 'pending';
    if (totalPaid >= fee.amount) {
      newStatus = 'cleared';
    } else if (totalPaid > 0) {
      newStatus = 'partial';
    }
    
    await supabaseDb
      .from('student_fees')
      .update({ status: newStatus })
      .eq('id', feeId);
    
    fee.status = newStatus;
    
    // Close modal and refresh
    closePaymentModal();
    displayStudentFees();
    loadFeeLedger();
    loadPaymentTracking();
    
    showNotification(`✅ Payment of Rs. ${amount} recorded successfully!`, 'success');
  } catch (error) {
    console.error('Error recording payment:', error);
    showNotification('Failed to record payment', 'error');
  }
}

function closePaymentModal() {
  const modal = document.getElementById('payment-modal');
  if (modal) modal.remove();
}

// ========================================
// FEE LEDGER DISPLAY
// ========================================

async function loadFeeLedger() {
  try {
    const classFilter = document.getElementById('ledger-class-filter')?.value || '';
    const statusFilter = document.getElementById('ledger-status-filter')?.value || '';
    
    const tbody = document.getElementById('fee-ledger-tbody');
    
    // Group fees by student
    const studentSummary = {};
    
    feeData.studentFees.forEach(fee => {
      if (!studentSummary[fee.student_roll]) {
        studentSummary[fee.student_roll] = {
          roll: fee.student_roll,
          name: fee.student_name,
          class: fee.student_class,
          totalDue: 0,
          totalPaid: 0,
          status: 'pending'
        };
      }
      studentSummary[fee.student_roll].totalDue += fee.amount;
    });
    
    // Calculate paid amounts
    feeData.payments.forEach(payment => {
      const fee = feeData.studentFees.find(f => f.id === payment.student_fee_id);
      if (fee && studentSummary[fee.student_roll]) {
        studentSummary[fee.student_roll].totalPaid += payment.amount_paid;
      }
    });
    
    // Update status and filter
    let summaryArray = Object.values(studentSummary);
    
    summaryArray.forEach(summary => {
      if (summary.totalPaid >= summary.totalDue && summary.totalDue > 0) {
        summary.status = 'cleared';
      } else if (summary.totalPaid > 0) {
        summary.status = 'partial';
      }
    });
    
    // Apply filters
    if (classFilter) {
      summaryArray = summaryArray.filter(s => s.class === classFilter);
    }
    if (statusFilter) {
      summaryArray = summaryArray.filter(s => s.status === statusFilter);
    }
    
    if (summaryArray.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2rem; color: #94a3b8;">
            No records found with current filters
          </td>
        </tr>
      `;
      return;
    }
    
    tbody.innerHTML = summaryArray.map(summary => {
      const balance = summary.totalDue - summary.totalPaid;
      const statusBadge = getStatusBadge(summary.status);
      
      return `
        <tr>
          <td>${summary.roll}</td>
          <td style="font-weight: 600;">${summary.name}</td>
          <td>${summary.class}</td>
          <td style="font-weight: 600;">Rs. ${summary.totalDue.toFixed(2)}</td>
          <td style="color: var(--success); font-weight: 600;">Rs. ${summary.totalPaid.toFixed(2)}</td>
          <td style="color: ${balance > 0 ? 'var(--danger)' : 'var(--success)'}; font-weight: 600;">Rs. ${balance.toFixed(2)}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="submit-btn" style="padding: 0.5rem 0.8rem; font-size: 0.8rem; background: #3b82f6;" onclick="viewStudentFeeDetails(${summary.roll})">View</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading fee ledger:', error);
  }
}

// ========================================
// PAYMENT TRACKING
// ========================================

async function loadPaymentTracking() {
  try {
    const tbody = document.getElementById('payment-tracking-tbody');
    const searchTerm = document.getElementById('payment-search')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('payment-status-filter')?.value || '';
    
    // Create invoice summary with remaining balance
    const invoiceSummary = {};
    
    feeData.studentFees.forEach(fee => {
      const key = `${fee.student_roll}-${fee.id}`;
      invoiceSummary[key] = {
        feeId: fee.id,
        studentRoll: fee.student_roll,
        studentName: fee.student_name,
        amount: fee.amount,
        dueDate: fee.due_date,
        categoryName: fee.category_name,
        paid: 0,
        status: fee.status
      };
    });
    
    // Add payments
    feeData.payments.forEach(payment => {
      const fee = feeData.studentFees.find(f => f.id === payment.student_fee_id);
      if (fee) {
        const key = `${fee.student_roll}-${fee.id}`;
        if (invoiceSummary[key]) {
          invoiceSummary[key].paid += payment.amount_paid;
        }
      }
    });
    
    // Calculate balance and update status
    let invoices = Object.values(invoiceSummary);
    
    invoices.forEach(inv => {
      const balance = inv.amount - inv.paid;
      if (balance > 0) {
        const daysOverdue = Math.floor((new Date() - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24));
        inv.daysOverdue = daysOverdue > 0 ? daysOverdue : 0;
      } else {
        inv.daysOverdue = 0;
      }
    });
    
    // Apply filters
    if (searchTerm) {
      invoices = invoices.filter(inv =>
        inv.studentName.toLowerCase().includes(searchTerm) ||
        inv.studentRoll.toString().includes(searchTerm)
      );
    }
    
    if (statusFilter) {
      invoices = invoices.filter(inv => inv.status === statusFilter);
    }
    
    if (invoices.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2rem; color: #94a3b8;">
            No payment records found
          </td>
        </tr>
      `;
      return;
    }
    
    tbody.innerHTML = invoices.map(inv => {
      const balance = inv.amount - inv.paid;
      const statusBadge = getStatusBadge(inv.status);
      const overdueBadge = inv.daysOverdue > 0 ? 
        `<span style="background: var(--danger); color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">${inv.daysOverdue} days</span>` :
        '<span style="background: var(--success); color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">On Time</span>';
      
      return `
        <tr>
          <td style="font-weight: 600;">INV-${inv.feeId}</td>
          <td>${inv.studentName}</td>
          <td>Rs. ${inv.amount.toFixed(2)}</td>
          <td style="color: var(--success);">Rs. ${inv.paid.toFixed(2)}</td>
          <td>${new Date(inv.dueDate).toLocaleDateString()}</td>
          <td>${statusBadge}</td>
          <td>${overdueBadge}</td>
          <td>
            <button class="submit-btn" style="padding: 0.5rem 0.8rem; font-size: 0.8rem; background: ${balance > 0 ? '#10b981' : '#6b7280'};" onclick="recordPayment(${inv.feeId})" ${balance <= 0 ? 'disabled' : ''}>
              ${balance > 0 ? 'Pay' : 'Done'}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading payment tracking:', error);
  }
}

function filterPayments() {
  loadPaymentTracking();
}

// ========================================
// FEE REPORTS & ANALYTICS
// ========================================

async function loadFeeReports() {
  try {
    // Calculate totals
    const totalDue = feeData.studentFees.reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = feeData.payments.reduce((sum, p) => sum + p.amount_paid, 0);
    const totalPending = totalDue - totalPaid;
    const collectionRate = ((totalPaid / totalDue) * 100).toFixed(1);
    
    // Update stat cards
    document.getElementById('report-total-revenue').textContent = `Rs. ${totalPaid.toFixed(0)}`;
    document.getElementById('report-pending-amount').textContent = `Rs. ${totalPending.toFixed(0)}`;
    
    // Count cleared students
    const clearedStudents = new Set();
    feeData.studentFees.forEach(fee => {
      if (fee.status === 'cleared') {
        clearedStudents.add(fee.student_roll);
      }
    });
    document.getElementById('report-cleared-count').textContent = clearedStudents.size;
    document.getElementById('report-collection-rate').textContent = `${collectionRate}%`;
    
    // Category breakdown
    generateCategoryReport();
    
    // Class breakdown
    generateClassReport();
    
  } catch (error) {
    console.error('Error loading fee reports:', error);
  }
}

function generateCategoryReport() {
  const categoryReport = {};
  
  feeData.studentFees.forEach(fee => {
    if (!categoryReport[fee.category_name]) {
      categoryReport[fee.category_name] = {
        category: fee.category_name,
        totalDue: 0,
        totalPaid: 0
      };
    }
    categoryReport[fee.category_name].totalDue += fee.amount;
  });
  
  feeData.payments.forEach(payment => {
    const fee = feeData.studentFees.find(f => f.id === payment.student_fee_id);
    if (fee && categoryReport[fee.category_name]) {
      categoryReport[fee.category_name].totalPaid += payment.amount_paid;
    }
  });
  
  const reportHtml = Object.values(categoryReport).map(cat => `
    <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <strong style="color: var(--primary);">${cat.category}</strong>
        <span style="background: var(--accent); color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">
          ${((cat.totalPaid / cat.totalDue) * 100).toFixed(0)}%
        </span>
      </div>
      <div style="display: flex; gap: 1rem; font-size: 0.9rem;">
        <span>Due: <strong>Rs. ${cat.totalDue.toFixed(0)}</strong></span>
        <span style="color: var(--success);">Paid: <strong>Rs. ${cat.totalPaid.toFixed(0)}</strong></span>
      </div>
      <div style="background: #e5e7eb; height: 8px; border-radius: 4px; margin-top: 0.5rem; overflow: hidden;">
        <div style="background: linear-gradient(90deg, var(--success), var(--accent)); height: 100%; width: ${(cat.totalPaid / cat.totalDue) * 100}%;"></div>
      </div>
    </div>
  `).join('');
  
  document.getElementById('category-report-tbody').innerHTML = reportHtml || '<p style="color: #94a3b8;">No data available</p>';
}

function generateClassReport() {
  const classReport = {};
  
  feeData.studentFees.forEach(fee => {
    if (!classReport[fee.student_class]) {
      classReport[fee.student_class] = {
        class: fee.student_class,
        totalDue: 0,
        totalPaid: 0,
        studentCount: new Set()
      };
    }
    classReport[fee.student_class].totalDue += fee.amount;
    classReport[fee.student_class].studentCount.add(fee.student_roll);
  });
  
  feeData.payments.forEach(payment => {
    const fee = feeData.studentFees.find(f => f.id === payment.student_fee_id);
    if (fee && classReport[fee.student_class]) {
      classReport[fee.student_class].totalPaid += payment.amount_paid;
    }
  });
  
  const reportHtml = Object.values(classReport).map(cls => {
    const collectionPct = ((cls.totalPaid / cls.totalDue) * 100).toFixed(1);
    return `
      <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <strong style="color: var(--primary);">${cls.class}</strong>
          <span style="background: var(--accent); color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">
            ${cls.studentCount.size} Students
          </span>
        </div>
        <div style="display: flex; gap: 1rem; font-size: 0.9rem;">
          <span>Due: <strong>Rs. ${cls.totalDue.toFixed(0)}</strong></span>
          <span style="color: var(--success);">Paid: <strong>Rs. ${cls.totalPaid.toFixed(0)}</strong></span>
        </div>
        <div style="background: #e5e7eb; height: 8px; border-radius: 4px; margin-top: 0.5rem; overflow: hidden;">
          <div style="background: linear-gradient(90deg, var(--success), var(--accent)); height: 100%; width: ${collectionPct}%;"></div>
        </div>
      </div>
    `;
  }).join('');
  
  document.getElementById('class-report-tbody').innerHTML = reportHtml || '<p style="color: #94a3b8;">No data available</p>';
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function populateFeeDropdowns() {
  const categorySelect = document.getElementById('fee-category');
  if (categorySelect) {
    categorySelect.innerHTML = '<option value="">-- Select Category --</option>' +
      feeData.categories.map(cat => 
        `<option value="${cat.id}">${cat.category_name}</option>`
      ).join('');
  }
}

function populateStudentDropdowns() {
  const classSelect = document.getElementById('fee-class');
  
  if (classSelect) {
    // Get unique classes
    const classes = [...new Set(feeData.students.map(s => s.class).filter(Boolean))];
    classes.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        if (numA !== numB) return numA - numB;
        return a.localeCompare(b);
    });
    
    classSelect.innerHTML = '<option value="">-- Choose Class --</option>' +
      classes.map(cls => `<option value="${cls}">${cls}</option>`).join('');
  }
  
  // Also populate initial student list based on current assignment type
  handleFeeAssignTypeChange();
}

function getStatusBadge(status) {
  const statusConfig = {
    pending: { bg: '#fef08a', text: '#b45309' },
    partial: { bg: '#bfdbfe', text: '#1e40af' },
    cleared: { bg: '#dcfce7', text: '#15803d' },
    overdue: { bg: '#fee2e2', text: '#991b1b' },
    exempted: { bg: '#f3e8ff', text: '#6b21a8' }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  const labels = {
    pending: '⏳ Pending',
    partial: '50% Partial',
    cleared: '✅ Cleared',
    overdue: '⚠️ Overdue',
    exempted: '🎓 Exempted'
  };
  
  return `
    <span style="background: ${config.bg}; color: ${config.text}; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700;">
      ${labels[status] || status}
    </span>
  `;
}

function getCurrentAdminEmail() {
  return localStorage.getItem('adminEmail') || 'admin@school.com';
}

function viewStudentFeeDetails(studentRoll) {
  const student = feeData.students.find(s => s.roll === studentRoll);
  const fees = feeData.studentFees.filter(f => f.student_roll === studentRoll);
  
  const detailsHtml = fees.map(fee => {
    const payments = feeData.payments.filter(p => p.student_fee_id === fee.id);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount_paid, 0);
    
    return `
      <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f8fafc; border-radius: 8px; border-left: 4px solid var(--accent);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <strong>${fee.category_name}</strong>
          <span>${getStatusBadge(fee.status)}</span>
        </div>
        <p style="margin: 0.5rem 0; color: #64748b;">
          <strong>Amount:</strong> Rs. ${fee.amount.toFixed(2)} | 
          <strong>Paid:</strong> Rs. ${totalPaid.toFixed(2)} | 
          <strong>Balance:</strong> Rs. ${(fee.amount - totalPaid).toFixed(2)}
        </p>
        <p style="margin: 0.5rem 0; color: #64748b; font-size: 0.85rem;">
          <strong>Due Date:</strong> ${new Date(fee.due_date).toLocaleDateString()}
        </p>
      </div>
    `;
  }).join('');
  
  alert(`
Student: ${student.name} (Roll: ${studentRoll})
Class: ${student.class}

Fees Details:
${detailsHtml.replace(/<[^>]*>/g, '')}
  `);
}

function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  // You can integrate with your existing notification system here
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialization will be called when the admin portal loads the fee page
  console.log('🎓 Fee Management system loaded and ready');
});
