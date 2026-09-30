// ============================================================================
// FILE:    student-fee-portal.js
// MODULE:  Student Fee Portal
// PURPOSE: Student Fee Portal - Student-side fee status viewer: outstanding dues, payment history, and fee receipts
//
// PROJECT: Shree Saraswati Secondary School — Management System
// STACK:   Vanilla JS + Supabase (PostgreSQL) + HTML/CSS
// UPDATED: 2026-06-03
// ============================================================================
/**
 * STUDENT PORTAL - FEE MANAGEMENT COMPONENT
 * Displays student fees, payment status, and payment history
 * Features: Fee overview, payment tracking, download receipts, payment links
 */

class StudentFeePortal {
  constructor(studentRoll) {
    this.studentRoll = studentRoll;
    this.studentFees = [];
    this.studentPayments = [];
    this.feeCategories = [];
    this.academicYear = '2024-2025';
  }

  // Initialize and load all data
  async init() {
    try {
      console.log(`📋 Initializing fee portal for student roll: ${this.studentRoll}`);
      
      await this.loadStudentFees();
      await this.loadStudentPayments();
      await this.loadFeeCategories();
      
      this.renderFeePortal();
      console.log('✅ Fee portal initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing fee portal:', error);
    }
  }

  // Load fees for this student
  async loadStudentFees() {
    try {
      const { data, error } = await supabaseDb
        .from('student_fees')
        .select('*')
        .eq('student_roll', this.studentRoll)
        .eq('academic_year', this.academicYear);
      
      if (error) throw error;
      this.studentFees = data || [];
      console.log(`📦 Loaded ${this.studentFees.length} fees`);
    } catch (error) {
      console.error('Error loading student fees:', error);
      this.studentFees = [];
    }
  }

  // Load payments for this student
  async loadStudentPayments() {
    try {
      const { data, error } = await supabaseDb
        .from('student_payments')
        .select('*')
        .eq('student_roll', this.studentRoll)
        .eq('status', 'verified')
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      this.studentPayments = data || [];
      console.log(`✅ Loaded ${this.studentPayments.length} payments`);
    } catch (error) {
      console.error('Error loading payments:', error);
      this.studentPayments = [];
    }
  }

  // Load fee categories
  async loadFeeCategories() {
    try {
      const { data, error } = await supabaseDb
        .from('fee_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      this.feeCategories = data || [];
    } catch (error) {
      console.error('Error loading fee categories:', error);
    }
  }

  // Main render function
  renderFeePortal() {
    const container = document.getElementById('student-fee-portal');
    if (!container) {
      console.warn('Fee portal container not found');
      return;
    }

    container.innerHTML = this.getPortalHTML();
    this.attachEventListeners();
  }

  // Get complete portal HTML
  getPortalHTML() {
    const { totalDue, totalPaid, balance, status } = this.calculateFinancialStatus();
    
    return `
      <div class="fee-portal-wrapper" style="padding: 2rem; background: var(--bg-color);">
        
        <!-- Header Section -->
        <div style="margin-bottom: 2rem;">
          <h2 style="font-family: 'Playfair Display', serif; color: var(--primary); margin-bottom: 0.5rem; font-size: 2rem;">
            💰 Fee Management & Payments
          </h2>
          <p style="color: var(--text-muted); margin: 0;">Track your fees, payment status, and payment history</p>
        </div>

        <!-- Financial Summary Cards -->
        ${this.renderFinancialSummary(totalDue, totalPaid, balance, status)}

        <!-- Main Content Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 2rem; margin-top: 2rem;">
          
          <!-- Left: Fee Details & Payment Form -->
          <div>
            ${this.renderFeeDetails()}
            ${this.renderPaymentForm()}
          </div>

          <!-- Right: Payment History & Receipts -->
          <div>
            ${this.renderPaymentHistory()}
          </div>
        </div>

        <!-- Important Notes -->
        ${this.renderImportantNotes()}
      </div>
    `;
  }

  // Render financial summary cards
  renderFinancialSummary(totalDue, totalPaid, balance, status) {
    const statusBadge = this.getStatusBadge(status);
    const balanceColor = balance > 0 ? 'var(--danger)' : 'var(--success)';
    
    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem;">
        
        <!-- Total Due Card -->
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 1.5rem; border-radius: 12px; border-left: 5px solid #f59e0b; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.8rem;">
            <span style="font-size: 0.85rem; font-weight: 600; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">Total Due</span>
            <span style="font-size: 1.5rem;">📊</span>
          </div>
          <p style="margin: 0; font-size: 1.8rem; font-weight: 700; color: #b45309;">Rs. ${totalDue.toFixed(2)}</p>
          <small style="color: #92400e; margin-top: 0.5rem; display: block;">${this.studentFees.length} fees assigned</small>
        </div>

        <!-- Amount Paid Card -->
        <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 1.5rem; border-radius: 12px; border-left: 5px solid #10b981; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.8rem;">
            <span style="font-size: 0.85rem; font-weight: 600; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px;">Amount Paid</span>
            <span style="font-size: 1.5rem;">✅</span>
          </div>
          <p style="margin: 0; font-size: 1.8rem; font-weight: 700; color: #15803d;">Rs. ${totalPaid.toFixed(2)}</p>
          <small style="color: #065f46; margin-top: 0.5rem; display: block;">${this.studentPayments.length} payments</small>
        </div>

        <!-- Balance Due Card -->
        <div style="background: linear-gradient(135deg, ${balance > 0 ? '#fee2e2 0%, #fecaca' : '#dcfce7 0%, #c7f0d8'} 100%); padding: 1.5rem; border-radius: 12px; border-left: 5px solid ${balanceColor}; box-shadow: 0 4px 12px rgba(${balance > 0 ? '220, 38, 38' : '22, 163, 74'}, 0.15);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.8rem;">
            <span style="font-size: 0.85rem; font-weight: 600; color: ${balance > 0 ? '#7f1d1d' : '#166534'}; text-transform: uppercase; letter-spacing: 0.5px;">Balance Due</span>
            <span style="font-size: 1.5rem;">${balance > 0 ? '⚠️' : '🎉'}</span>
          </div>
          <p style="margin: 0; font-size: 1.8rem; font-weight: 700; color: ${balanceColor};">Rs. ${balance.toFixed(2)}</p>
          <small style="color: ${balance > 0 ? '#7f1d1d' : '#166534'}; margin-top: 0.5rem; display: block;">
            ${balance > 0 ? 'Payment required' : 'All fees cleared'}
          </small>
        </div>

        <!-- Status Card -->
        <div style="background: linear-gradient(135deg, #f0f4ff 0%, #f5f3ff 100%); padding: 1.5rem; border-radius: 12px; border-left: 5px solid var(--accent); box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.8rem;">
            <span style="font-size: 0.85rem; font-weight: 600; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px;">Status</span>
            <span style="font-size: 1.5rem;">🎓</span>
          </div>
          <div style="margin: 0.8rem 0;">
            ${statusBadge}
          </div>
          <small style="color: var(--primary); display: block;">
            ${status === 'cleared' ? '✅ All fees paid' : status === 'partial' ? '📝 Partial payment done' : '⏳ Awaiting payment'}
          </small>
        </div>

      </div>
    `;
  }

  // Render individual fee details
  renderFeeDetails() {
    if (this.studentFees.length === 0) {
      return `
        <div style="background: white; border-radius: 12px; padding: 2rem; text-align: center; margin-bottom: 2rem; border: 2px dashed #e5e7eb;">
          <p style="color: #94a3b8; font-size: 0.95rem;">No fees assigned for this academic year</p>
        </div>
      `;
    }

    const feeDetails = this.studentFees.map(fee => {
      const feePayments = this.studentPayments.filter(p => p.student_fee_id === fee.id);
      const amountPaid = feePayments.reduce((sum, p) => sum + p.amount_paid, 0);
      const balance = fee.amount - amountPaid;
      const isPaid = balance <= 0;
      
      const statusConfig = {
        'cleared': { icon: '✅', color: '#10b981' },
        'partial': { icon: '50%', color: '#3b82f6' },
        'pending': { icon: '⏳', color: '#f59e0b' },
        'overdue': { icon: '⚠️', color: '#ef4444' }
      };
      
      const config = statusConfig[fee.status] || statusConfig.pending;
      
      return `
        <div style="background: white; border-radius: 10px; padding: 1.2rem; margin-bottom: 1rem; border-left: 4px solid ${config.color}; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.8rem;">
            <div>
              <h4 style="margin: 0; color: var(--primary); font-weight: 700;">
                ${fee.category_name}
              </h4>
              <small style="color: var(--text-muted);">Installment ${fee.installment_number}</small>
            </div>
            <span style="background: ${config.color}; color: white; padding: 0.4rem 0.8rem; border-radius: 20px; font-weight: 700; font-size: 0.85rem;">
              ${config.icon} ${fee.status.toUpperCase()}
            </span>
          </div>
          
          <div style="background: #f8fafc; padding: 0.8rem; border-radius: 8px; margin-bottom: 0.8rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.9rem;">
              <div>
                <span style="color: var(--text-muted);">Amount Due:</span>
                <p style="margin: 0.3rem 0 0 0; font-weight: 700; font-size: 1.1rem;">Rs. ${fee.amount.toFixed(2)}</p>
              </div>
              <div>
                <span style="color: var(--text-muted);">Paid:</span>
                <p style="margin: 0.3rem 0 0 0; font-weight: 700; font-size: 1.1rem; color: var(--success);">Rs. ${amountPaid.toFixed(2)}</p>
              </div>
            </div>
            <div style="margin-top: 0.8rem; padding-top: 0.8rem; border-top: 1px solid #e5e7eb;">
              <span style="color: var(--text-muted);">Balance:</span>
              <p style="margin: 0.3rem 0 0 0; font-weight: 700; font-size: 1.1rem; color: ${balance > 0 ? 'var(--danger)' : 'var(--success)'};">
                Rs. ${balance.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.85rem;">
            <div>
              <span style="color: var(--text-muted);">📅 Due Date:</span>
              <p style="margin: 0.2rem 0; font-weight: 600;">
                ${new Date(fee.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div>
              <span style="color: var(--text-muted);">📋 Description:</span>
              <p style="margin: 0.2rem 0; font-weight: 600;">${fee.description || 'N/A'}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <h3 style="margin-top: 0; margin-bottom: 1.5rem; color: var(--primary); display: flex; align-items: center; gap: 0.8rem;">
          <span style="font-size: 1.5rem;">📋</span>
          <span>Fee Breakdown</span>
          <span style="background: var(--accent); color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; margin-left: auto; font-weight: 700;">
            ${this.studentFees.length} Fees
          </span>
        </h3>
        ${feeDetails}
      </div>
    `;
  }

  // Render payment form
  renderPaymentForm() {
    const totalBalance = this.calculateTotalBalance();
    if (totalBalance <= 0) {
      return '';
    }

    return `
      <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid var(--success);">
        <h3 style="margin-top: 0; margin-bottom: 1rem; color: var(--primary); display: flex; align-items: center; gap: 0.8rem;">
          <span style="font-size: 1.5rem;">💳</span>
          <span>Online Payment</span>
        </h3>
        
        <div style="background: #dcfce7; border: 1px solid #86efac; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <p style="margin: 0; color: #166534; font-weight: 600;">
            ℹ️ Pay Rs. ${totalBalance.toFixed(2)} to clear your balance
          </p>
        </div>

        <div class="form-group">
          <label style="font-weight: 600; color: var(--primary); margin-bottom: 0.5rem; display: block;">Amount to Pay *</label>
          <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
            <input type="number" id="payment-amount-student" class="form-control" 
              placeholder="${totalBalance.toFixed(2)}" 
              value="${totalBalance.toFixed(2)}"
              min="1" 
              max="${totalBalance}"
              step="0.01"
              style="flex: 1; border: 2px solid #e5e7eb; border-radius: 8px; padding: 0.8rem; font-size: 0.95rem;">
            <button type="button" class="submit-btn" 
              style="background: var(--accent); color: white; padding: 0.8rem 1.5rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 600;"
              onclick="setPaymentAmount('${totalBalance.toFixed(2)}')">
              Full Amount
            </button>
          </div>
        </div>

        <div class="form-group">
          <label style="font-weight: 600; color: var(--primary); margin-bottom: 0.5rem; display: block;">Payment Method *</label>
          <select id="payment-method-student" class="form-control" style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 0.8rem; font-size: 0.95rem;">
            <option value="">-- Select Payment Method --</option>
            <option value="online">🌐 Online Banking</option>
            <option value="card">💳 Credit/Debit Card</option>
            <option value="upi">📱 UPI/Mobile Wallet</option>
            <option value="cheque">🏦 Cheque (Offline)</option>
          </select>
        </div>

        <button type="button" onclick="processStudentPayment()" 
          style="width: 100%; background: linear-gradient(135deg, var(--success) 0%, #059669 100%); color: white; padding: 1rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 700; font-size: 1rem; margin-top: 1rem; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25); transition: all 0.3s;">
          💰 Proceed to Payment
        </button>

        <small style="display: block; margin-top: 1rem; color: var(--text-muted); text-align: center;">
          🔒 Your payment is secure and encrypted
        </small>
      </div>
    `;
  }

  // Render payment history
  renderPaymentHistory() {
    if (this.studentPayments.length === 0) {
      return `
        <div style="background: white; border-radius: 12px; padding: 2rem; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <p style="font-size: 3rem; margin: 0;">📭</p>
          <p style="color: #94a3b8; margin-top: 1rem;">No payments recorded yet</p>
        </div>
      `;
    }

    const paymentHistory = this.studentPayments.map((payment, index) => `
      <div style="background: #f8fafc; border-radius: 10px; padding: 1rem; margin-bottom: 1rem; border-left: 4px solid var(--success);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.8rem;">
          <div>
            <h4 style="margin: 0; color: var(--primary); font-weight: 700; font-size: 1rem;">
              Payment ${index + 1}
            </h4>
            <small style="color: var(--text-muted);">
              ${new Date(payment.payment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </small>
          </div>
          <span style="background: var(--success); color: white; padding: 0.4rem 0.8rem; border-radius: 20px; font-weight: 700; font-size: 0.8rem;">
            ✅ VERIFIED
          </span>
        </div>

        <div style="background: white; padding: 0.8rem; border-radius: 8px; margin-bottom: 0.8rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.9rem;">
            <div>
              <span style="color: var(--text-muted);">Amount Paid:</span>
              <p style="margin: 0.3rem 0 0 0; font-weight: 700; color: var(--success); font-size: 1.1rem;">
                Rs. ${payment.amount_paid.toFixed(2)}
              </p>
            </div>
            <div>
              <span style="color: var(--text-muted);">Mode:</span>
              <p style="margin: 0.3rem 0 0 0; font-weight: 700; font-size: 1rem;">
                ${this.getPaymentModeIcon(payment.payment_mode)} ${payment.payment_mode}
              </p>
            </div>
          </div>
        </div>

        ${payment.transaction_id ? `
          <div style="font-size: 0.85rem; color: var(--text-muted);">
            <strong>Transaction ID:</strong> ${payment.transaction_id}
          </div>
        ` : ''}

        <button type="button" onclick="downloadReceipt(${payment.id})" 
          style="width: 100%; background: white; border: 2px solid var(--accent); color: var(--accent); padding: 0.6rem; border-radius: 6px; cursor: pointer; font-weight: 600; margin-top: 0.8rem; transition: all 0.3s;">
          📥 Download Receipt
        </button>
      </div>
    `).join('');

    return `
      <div style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <h3 style="margin-top: 0; margin-bottom: 1.5rem; color: var(--primary); display: flex; align-items: center; gap: 0.8rem;">
          <span style="font-size: 1.5rem;">✅</span>
          <span>Payment History</span>
          <span style="background: #e5e7eb; color: var(--primary); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; margin-left: auto; font-weight: 700;">
            ${this.studentPayments.length} Records
          </span>
        </h3>
        
        <div style="max-height: 600px; overflow-y: auto;">
          ${paymentHistory}
        </div>
      </div>
    `;
  }

  // Render important notes
  renderImportantNotes() {
    return `
      <div style="background: #fffbeb; border: 2px solid #fcd34d; border-radius: 12px; padding: 1.5rem; margin-top: 2rem;">
        <h4 style="margin-top: 0; margin-bottom: 1rem; color: #92400e; display: flex; align-items: center; gap: 0.8rem;">
          <span>⚡</span>
          <span>Important Information</span>
        </h4>
        
        <ul style="margin: 0; padding-left: 1.5rem; color: #78350f;">
          <li style="margin-bottom: 0.8rem;">
            <strong>Payment Deadline:</strong> Please ensure timely payment to avoid late fees and registration hold
          </li>
          <li style="margin-bottom: 0.8rem;">
            <strong>Multiple Installments:</strong> Fees can be paid in installments as per the scheduled due dates
          </li>
          <li style="margin-bottom: 0.8rem;">
            <strong>Scholarship/Discount:</strong> If you have applied for scholarships, your fee may be reduced. Check with admin.
          </li>
          <li style="margin-bottom: 0.8rem;">
            <strong>Payment Confirmation:</strong> You will receive payment confirmation via email after successful transaction
          </li>
          <li style="margin-bottom: 0;">
            <strong>Support:</strong> For any fee-related queries, contact the office at info@sss.com or visit the admin office
          </li>
        </ul>
      </div>

      <!-- Payment Methods Info -->
      <div style="background: #f0f4ff; border: 2px solid #c7d2fe; border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem;">
        <h4 style="margin-top: 0; margin-bottom: 1rem; color: var(--primary); display: flex; align-items: center; gap: 0.8rem;">
          <span>💳</span>
          <span>Payment Methods Accepted</span>
        </h4>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
          <div style="text-align: center; padding: 1rem; background: white; border-radius: 8px;">
            <span style="font-size: 1.8rem;">🌐</span>
            <p style="margin: 0.5rem 0 0 0; font-weight: 600; color: var(--primary);">Online Banking</p>
          </div>
          <div style="text-align: center; padding: 1rem; background: white; border-radius: 8px;">
            <span style="font-size: 1.8rem;">💳</span>
            <p style="margin: 0.5rem 0 0 0; font-weight: 600; color: var(--primary);">Debit/Credit Card</p>
          </div>
          <div style="text-align: center; padding: 1rem; background: white; border-radius: 8px;">
            <span style="font-size: 1.8rem;">📱</span>
            <p style="margin: 0.5rem 0 0 0; font-weight: 600; color: var(--primary);">UPI / Wallets</p>
          </div>
          <div style="text-align: center; padding: 1rem; background: white; border-radius: 8px;">
            <span style="font-size: 1.8rem;">🏦</span>
            <p style="margin: 0.5rem 0 0 0; font-weight: 600; color: var(--primary);">Cheque (Offline)</p>
          </div>
        </div>
      </div>
    `;
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  calculateFinancialStatus() {
    const totalDue = this.studentFees.reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = this.studentPayments.reduce((sum, p) => sum + p.amount_paid, 0);
    const balance = totalDue - totalPaid;

    let status = 'pending';
    if (totalDue === 0) {
      status = 'no-fees';
    } else if (totalPaid >= totalDue) {
      status = 'cleared';
    } else if (totalPaid > 0) {
      status = 'partial';
    }

    return { totalDue, totalPaid, balance, status };
  }

  calculateTotalBalance() {
    const totalDue = this.studentFees.reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = this.studentPayments.reduce((sum, p) => sum + p.amount_paid, 0);
    return Math.max(0, totalDue - totalPaid);
  }

  getStatusBadge(status) {
    const badges = {
      'cleared': '<span style="background: #dcfce7; color: #15803d; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700; font-size: 0.9rem;">✅ ALL FEES CLEARED</span>',
      'partial': '<span style="background: #bfdbfe; color: #1e40af; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700; font-size: 0.9rem;">📝 PARTIAL PAYMENT</span>',
      'pending': '<span style="background: #fef08a; color: #b45309; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700; font-size: 0.9rem;">⏳ PAYMENT PENDING</span>',
      'no-fees': '<span style="background: #e9d5ff; color: #6b21a8; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700; font-size: 0.9rem;">🎓 NO FEES ASSIGNED</span>'
    };
    return badges[status] || badges.pending;
  }

  getPaymentModeIcon(mode) {
    const icons = {
      'Online': '🌐',
      'Card': '💳',
      'UPI': '📱',
      'Cheque': '🏦',
      'Cash': '💵'
    };
    return icons[mode] || '💰';
  }

  attachEventListeners() {
    // Event listeners can be attached here if needed
  }
}

// ========================================
// UTILITY FUNCTIONS FOR STUDENT PORTAL
// ========================================

function setPaymentAmount(amount) {
  document.getElementById('payment-amount-student').value = amount;
}

async function processStudentPayment() {
  const amount = document.getElementById('payment-amount-student').value;
  const method = document.getElementById('payment-method-student').value;

  if (!amount || !method) {
    alert('Please select payment method and enter amount');
    return;
  }

  alert(`Payment Gateway Integration:
  
Amount: Rs. ${amount}
Method: ${method}

This would integrate with payment gateway like:
- Khalti (for UPI/Wallets)
- eSewa
- Bank Integration

For now, notify admin for offline payment.`);
}

async function downloadReceipt(paymentId) {
  alert('Receipt download functionality will be integrated with PDF generation library.');
}

// Initialize when page loads
function initializeStudentFeePortal(studentRoll) {
  const feePortal = new StudentFeePortal(studentRoll);
  feePortal.init();
}
