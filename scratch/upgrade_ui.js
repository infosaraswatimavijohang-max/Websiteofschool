const fs = require('fs');

const cssReplacement = `:root {
      /* Core Colors - Premium Brand Alignment */
      --primary: #0a192f;        /* Deep Space Blue */
      --primary-light: #112240;  /* Rich Navy */
      --accent: #f59e0b;         /* Vibrant Amber/Gold */
      --accent-hover: #d97706;   /* Darker amber for hover */
      --secondary: #3b82f6;      /* Bright professional blue */
      
      /* Backgrounds & Text */
      --bg-color: #f8fafc;       /* Ultra soft, cool off-white */
      --white: #ffffff;          /* Pure White */
      --text-main: #1e293b;      /* Deep slate for text */
      --text-muted: #64748b;     /* Muted slate */
      --border-color: rgba(226, 232, 240, 0.8); /* Subtle transparent borders */
      
      /* Status Colors */
      --danger: #ef4444;         /* Vibrant Red */
      --warning: #f59e0b;        /* Bright amber */
      --success: #10b981;        /* Emerald Green */
      
      /* Dimensions & Effects */
      --sidebar-width: 280px;
      --glass-bg: rgba(255, 255, 255, 0.7);
      --glass-border: 1px solid rgba(255, 255, 255, 0.5);
      --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
      --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
      --shadow-glow: 0 0 20px rgba(245, 158, 11, 0.3);
      --radius-lg: 16px;
      --radius-md: 12px;
      --radius-sm: 8px;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
    body { background-color: var(--bg-color); color: var(--text-main); min-height: 100vh; display: flex; overflow-x: hidden; }

    /* ── SIDEBAR ── */
    .sidebar {
      width: var(--sidebar-width);
      background: linear-gradient(180deg, var(--primary) 0%, var(--primary-light) 100%);
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: column;
      border-right: 1px solid rgba(255,255,255,0.05);
      z-index: 100;
      overflow-y: auto;
      box-shadow: 4px 0 24px rgba(0,0,0,0.1);
    }

    /* Custom Scrollbar for Sidebar */
    .sidebar::-webkit-scrollbar { width: 6px; }
    .sidebar::-webkit-scrollbar-track { background: transparent; }
    .sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
    .sidebar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }

    .sidebar-brand {
      padding: 2rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      background: rgba(10, 25, 47, 0.95);
      backdrop-filter: blur(10px);
      position: sticky;
      top: 0;
      z-index: 2;
    }

    .sidebar-brand img { width: 48px; height: 48px; border-radius: 50%; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)); border: 2px solid rgba(255,255,255,0.1); }
    .sidebar-brand-text h2 { font-family: 'Playfair Display', serif; font-size: 1.15rem; color: var(--white); line-height: 1.2; font-weight: 700; letter-spacing: 0.5px; }
    .sidebar-brand-text span { font-size: 0.7rem; color: var(--accent); text-transform: uppercase; letter-spacing: 2px; font-weight: 800; }

    .sidebar-menu { padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 0.5rem; flex-grow: 1; }
    .nav-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: rgba(255,255,255,0.3); letter-spacing: 2px; padding: 1.2rem 0.5rem 0.5rem 0.5rem; }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.9rem 1.2rem;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      border: 1px solid transparent;
    }

    .nav-link svg { width: 20px; height: 20px; color: rgba(255,255,255,0.5); transition: all 0.3s ease; }
    .nav-link:hover { background: rgba(255,255,255,0.08); color: var(--white); transform: translateX(4px); }
    .nav-link:hover svg { color: var(--accent); transform: scale(1.1); }
    .nav-link.active { background: rgba(245, 158, 11, 0.15); color: var(--accent); border: 1px solid rgba(245, 158, 11, 0.3); box-shadow: inset 4px 0 0 var(--accent); }
    .nav-link.active svg { color: var(--accent); }

    .nav-item { display: flex; flex-direction: column; }
    .submenu { display: none; flex-direction: column; gap: 0.3rem; padding-left: 3.4rem; padding-top: 0.4rem; padding-bottom: 0.8rem; }
    .submenu.open { display: flex; animation: slideDown 0.3s ease-out; }
    
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .submenu-link { color: rgba(255,255,255,0.5); text-decoration: none; font-size: 0.85rem; padding: 0.6rem 0; transition: all 0.2s ease; display: flex; align-items: center; gap: 0.6rem; font-weight: 500; }
    .submenu-link:hover { color: var(--white); transform: translateX(3px); }
    .submenu-link::before { content: ''; width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.3); transition: all 0.2s ease; }
    .submenu-link.active { color: var(--white); font-weight: 700; }
    .submenu-link.active::before { background: var(--accent); box-shadow: 0 0 8px var(--accent); transform: scale(1.5); }
    .nav-link .chevron { margin-left: auto; width: 16px; height: 16px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .nav-link.open .chevron { transform: rotate(180deg); color: var(--white); }

    .sidebar-footer { padding: 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.1); }
    .logout-btn {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.9rem 1.2rem;
      color: #fca5a5;
      text-decoration: none;
      font-weight: 700;
      border-radius: var(--radius-sm);
      transition: all 0.3s ease;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    .logout-btn:hover { background: rgba(239, 68, 68, 0.2); color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }

    /* ── MAIN CONTENT ── */
    .main-content { margin-left: var(--sidebar-width); flex-grow: 1; min-height: 100vh; display: flex; flex-direction: column; width: calc(100% - var(--sidebar-width)); position: relative; }

    /* Top Nav - Glassmorphism */
    .top-nav {
      height: 80px;
      background: var(--glass-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: var(--glass-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 3rem;
      position: sticky;
      top: 0;
      z-index: 90;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }

    .search-bar { display: flex; align-items: center; background: rgba(241, 245, 249, 0.8); padding: 0.7rem 1.5rem; border-radius: 30px; width: 320px; border: 1px solid rgba(226, 232, 240, 0.8); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .search-bar:focus-within { background: var(--white); border-color: var(--secondary); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); width: 360px; }
    .search-bar input { border: none; background: none; outline: none; padding-left: 0.8rem; width: 100%; color: var(--text-main); font-weight: 500; font-size: 0.95rem; }
    .nav-actions { display: flex; align-items: center; gap: 2.5rem; }
    
    .profile-dropdown { display: flex; align-items: center; gap: 1rem; cursor: pointer; padding: 0.5rem; border-radius: 30px; transition: background 0.2s ease; }
    .profile-dropdown:hover { background: rgba(0,0,0,0.03); }
    .profile-dropdown img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--white); box-shadow: 0 0 0 2px var(--accent); transition: transform 0.3s ease; }
    .profile-dropdown:hover img { transform: scale(1.05); }
    .profile-info h4 { font-size: 0.95rem; color: var(--primary); font-weight: 700; }
    .profile-info span { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }

    /* ── PAGES AND TABS ── */
    .dashboard-container { padding: 2.5rem 3rem; flex-grow: 1; }
    .page-view { display: none; }
    .page-view.active { display: block; animation: fadeUpIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    @keyframes fadeUpIn {
      0% { opacity: 0; transform: translateY(20px) scale(0.98); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Welcome Banner - Premium Animated Gradient */
    .welcome-banner {
      background: linear-gradient(135deg, var(--primary) 0%, #1e3a8a 50%, var(--primary-light) 100%);
      background-size: 200% 200%;
      animation: gradientShift 10s ease infinite;
      border-radius: var(--radius-lg); padding: 3rem; color: var(--white);
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 2.5rem; box-shadow: var(--shadow-lg);
      position: relative; overflow: hidden;
      border: 1px solid rgba(255,255,255,0.1);
    }
    
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    .welcome-banner::before {
      content: ''; position: absolute; left: -100px; top: -100px; width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%); border-radius: 50%;
    }
    .welcome-banner::after {
      content: ''; position: absolute; right: -50px; bottom: -150px; width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%); border-radius: 50%;
    }
    .welcome-text { position: relative; z-index: 10; }
    .welcome-text h1 { font-family: 'Playfair Display', serif; font-size: 2.5rem; margin-bottom: 0.8rem; font-weight: 800; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .welcome-text p { color: rgba(255, 255, 255, 0.9); font-size: 1.1rem; max-width: 600px; line-height: 1.6; }

    /* Stats Grid */
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
    .stat-card { 
      background: var(--glass-bg); padding: 1.8rem; border-radius: var(--radius-lg); 
      display: flex; align-items: center; gap: 1.5rem; 
      box-shadow: var(--shadow-sm); border: var(--glass-border); 
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative; overflow: hidden;
    }
    .stat-card::before {
      content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 100%);
      pointer-events: none; opacity: 0; transition: opacity 0.3s;
    }
    .stat-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-md); border-color: rgba(255,255,255,1); }
    .stat-card:hover::before { opacity: 1; }
    
    .stat-badge-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .stat-card:hover .stat-badge-icon { transform: scale(1.1) rotate(5deg); }
    .stat-badge-icon.blue { background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); color: #0284c7; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.15); }
    .stat-badge-icon.green { background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); color: #15803d; box-shadow: 0 4px 12px rgba(21, 128, 61, 0.15); }
    .stat-badge-icon.gold { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #b45309; box-shadow: 0 4px 12px rgba(180, 83, 9, 0.15); }
    .stat-badge-icon.purple { background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); color: #7e22ce; box-shadow: 0 4px 12px rgba(126, 34, 206, 0.15); }
    
    .stat-details h3 { font-size: 1.8rem; color: var(--primary); font-weight: 800; letter-spacing: -0.5px; line-height: 1.1; margin-bottom: 0.2rem; }
    .stat-details p { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

    /* Split Grid & Panels */
    .main-grid { display: grid; grid-template-columns: 1.8fr 1fr; gap: 1.8rem; margin-bottom: 2.5rem; }
    .panel {
      background: var(--white); border-radius: var(--radius-lg); padding: 2rem;
      box-shadow: var(--shadow-sm); border: 1px solid rgba(226, 232, 240, 0.8);
      display: flex; flex-direction: column; gap: 1.5rem;
      transition: box-shadow 0.3s ease;
    }
    .panel:hover { box-shadow: var(--shadow-md); }
    .panel-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 1rem; }
    .panel-header h3 { font-size: 1.25rem; color: var(--primary); font-weight: 700; display: flex; align-items: center; gap: 0.5rem; }
    
    /* ── TABLES - Modern & Premium ── */
    .custom-table-wrapper { overflow-x: auto; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--white); box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .custom-table { width: 100%; border-collapse: collapse; text-align: left; }
    .custom-table th { 
      background: #f8fafc; padding: 1.2rem 1rem; font-weight: 700; color: var(--text-muted); 
      border-bottom: 2px solid var(--border-color); font-size: 0.8rem; text-transform: uppercase; 
      letter-spacing: 1px; position: sticky; top: 0; z-index: 10;
    }
    .custom-table td { padding: 1.2rem 1rem; border-bottom: 1px solid #f1f5f9; color: var(--text-main); font-size: 0.95rem; font-weight: 500; }
    .custom-table tr:last-child td { border-bottom: none; }
    .custom-table tbody tr { transition: all 0.2s ease; }
    .custom-table tbody tr:hover { background-color: #f1f5f9; transform: scale(1.001); }

    /* ── FORM ELEMENTS - Floating & Glowing ── */
    .form-group { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.5rem; position: relative; }
    .form-group label { font-size: 0.85rem; font-weight: 700; color: var(--text-main); letter-spacing: 0.2px; display: flex; justify-content: space-between; }
    .form-control {
      padding: 0.9rem 1.2rem;
      border: 2px solid #e2e8f0;
      border-radius: var(--radius-sm);
      font-size: 0.95rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: #f8fafc;
      color: var(--text-main);
      font-weight: 500;
    }
    .form-control:hover { border-color: #cbd5e1; background: var(--white); }
    .form-control:focus { outline: none; border-color: var(--secondary); background: var(--white); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
    
    .submit-btn {
      padding: 1rem 1.5rem; background: linear-gradient(135deg, var(--secondary) 0%, #2563eb 100%); color: var(--white);
      border: none; border-radius: var(--radius-sm); font-weight: 700; cursor: pointer;
      font-size: 1rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); display: flex; justify-content: center; align-items: center; gap: 0.5rem;
    }
    .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(37, 99, 235, 0.4); background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); }
    .submit-btn:active { transform: translateY(1px); box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4); }

    /* Action Buttons */
    .btn-sm {
      padding: 0.5rem 0.9rem; border: none; border-radius: 6px; font-weight: 700;
      font-size: 0.8rem; cursor: pointer; transition: all 0.2s ease; margin-right: 0.4rem;
      display: inline-flex; align-items: center; gap: 0.3rem;
    }
    .btn-edit { background: #f1f5f9; color: var(--secondary); border: 1px solid #e2e8f0; }
    .btn-edit:hover { background: #e0f2fe; color: #0284c7; border-color: #bae6fd; transform: translateY(-1px); box-shadow: 0 2px 6px rgba(2, 132, 199, 0.1); }
    .btn-delete { background: #fef2f2; color: var(--danger); border: 1px solid #fecaca; }
    .btn-delete:hover { background: #fee2e2; color: #b91c1c; border-color: #f87171; transform: translateY(-1px); box-shadow: 0 2px 6px rgba(220, 38, 38, 0.1); }

    .status-badge { padding: 0.4rem 1rem; border-radius: 30px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
    .status-badge.approved { background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; }
    .status-badge.pending { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
    .status-badge.rejected { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
    
    .badge { padding: 0.35rem 0.8rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; }
    .badge-success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: var(--white); box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3); }
    .badge-danger { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: var(--white); box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3); }

    /* Modal - Glassmorphic */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      z-index: 200; opacity: 0; pointer-events: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .modal-overlay.active { opacity: 1; pointer-events: auto; }
    .modal-content {
      background: var(--white); width: 600px; max-width: 90%;
      border-radius: var(--radius-lg); padding: 2.5rem; position: relative;
      transform: scale(0.95) translateY(20px); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid rgba(255,255,255,0.2);
    }
    .modal-overlay.active .modal-content { transform: scale(1) translateY(0); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 1rem; }
    .modal-header h3 { font-size: 1.4rem; color: var(--primary); font-weight: 800; }
    .modal-close-btn { 
      background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem; cursor: pointer; color: var(--text-muted); transition: all 0.2s ease; 
    }
    .modal-close-btn:hover { background: #fee2e2; color: var(--danger); transform: rotate(90deg); }

    /* ── MOBILE RESPONSIVENESS ── */
    @media (max-width: 1024px) {
      .main-grid, .stat-grid, .cal-wrapper, div[style*="grid-template-columns: minmax(0, 1fr) minmax(0, 1.8fr)"], div[style*="grid-template-columns: 1fr 2fr"], div[style*="grid-template-columns: 1fr 1fr"] {
        grid-template-columns: 1fr !important;
      }
      .stat-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      .dashboard-container {
        padding: 1.5rem;
      }
      .welcome-banner {
        padding: 2rem;
      }
      .welcome-banner::after, .welcome-banner::before {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1000;
      }
      .sidebar.mobile-open {
        transform: translateX(0);
        box-shadow: 20px 0 40px rgba(0,0,0,0.5);
      }
      .main-content {
        margin-left: 0;
        width: 100%;
      }
      .top-nav {
        padding: 0 1.5rem;
      }
      .mobile-menu-btn {
        display: block !important;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--primary);
        font-size: 1.5rem;
      }
      .stat-grid {
        grid-template-columns: 1fr !important;
      }
      .profile-info {
        display: none;
      }
      .search-bar {
        width: 180px;
      }
      .search-bar:focus-within { width: 220px; }
    }

    /* ── ADMIN LOGIN MODAL - Ultra Premium ── */
    .login-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0a192f 0%, #112240 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .login-modal::before {
      content: ''; position: absolute; top: -20%; left: -10%; width: 50%; height: 50%;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 60%); border-radius: 50%;
    }
    .login-modal::after {
      content: ''; position: absolute; bottom: -20%; right: -10%; width: 50%; height: 50%;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 60%); border-radius: 50%;
    }
    .login-modal.hidden {
      display: none;
    }
    .login-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 3.5rem 3rem;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5);
      text-align: center;
      position: relative;
      z-index: 10;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .login-card h1 {
      font-family: 'Playfair Display', serif;
      font-size: 2.2rem;
      color: var(--primary);
      margin-bottom: 0.5rem;
      font-weight: 800;
    }
    .login-card p {
      color: var(--text-muted);
      margin-bottom: 2.5rem;
      font-size: 1rem;
      font-weight: 500;
    }
    .login-form { display: flex; flex-direction: column; gap: 1.5rem; }
    .login-input {
      padding: 1.1rem 1.2rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: #f8fafc;
      font-weight: 500;
    }
    .login-input:focus {
      outline: none;
      border-color: var(--secondary);
      background: var(--white);
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
    }
    .login-btn {
      padding: 1.2rem;
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
      color: var(--white);
      border: none;
      border-radius: 12px;
      font-weight: 800;
      font-size: 1.05rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
      letter-spacing: 0.5px;
    }
    .login-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(245, 158, 11, 0.4); }
    .login-btn:active { transform: translateY(1px); }
    .login-btn:disabled {
      background: #cbd5e1;
      box-shadow: none;
      cursor: not-allowed;
      transform: none;
    }
    .login-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: var(--danger);
      padding: 1rem;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      display: none;
      margin-top: -0.5rem;
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
      40%, 60% { transform: translate3d(4px, 0, 0); }
    }
    .login-error.show { display: block; }`;

let fileContent = fs.readFileSync('c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html', 'utf8');

const startIndex = fileContent.indexOf(':root {');
const endIndex = fileContent.indexOf('/* ── STAFF HIERARCHY TREE STYLES ── */');

if (startIndex > -1 && endIndex > -1) {
    fileContent = fileContent.substring(0, startIndex) + cssReplacement + "\n\n    " + fileContent.substring(endIndex);
    fs.writeFileSync('c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html', fileContent);
    console.log("CSS perfectly updated with premium modern styles!");
} else {
    console.log("Could not find start or end index.");
}
