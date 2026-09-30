/**
 * FACULTY SHOWCASE (PREMIUM 2026 DESIGN)
 * Handles dynamic data fetching, filtering, and UI rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
  const gridContainer = document.getElementById('fs-grid');
  const filterBtns = document.querySelectorAll('.fs-filter-btn');
  let facultyData = [];

  // Premium mock data fallback if Supabase is not configured
  const mockData = [
    {
      id: 1,
      teacher_name: 'Dr. Hari Karki',
      teacher_role: 'Principal / Science',
      teacher_description: 'Visionary educator with 20+ years of transforming academic excellence and fostering student leadership.',
      teacher_image_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256',
      category: 'Science'
    },
    {
      id: 2,
      teacher_name: 'Anita Sharma',
      teacher_role: 'Head of Management',
      teacher_description: 'Empowering future entrepreneurs through innovative business strategies and practical financial literacy.',
      teacher_image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256&h=256',
      category: 'Management'
    },
    {
      id: 3,
      teacher_name: 'Ramesh Thapa',
      teacher_role: 'Senior Math Teacher',
      teacher_description: 'Making advanced mathematics accessible and engaging through interactive, problem-solving methodologies.',
      teacher_image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256&h=256',
      category: 'Science'
    },
    {
      id: 4,
      teacher_name: 'Sita Pandey',
      teacher_role: 'Primary Coordinator',
      teacher_description: 'Nurturing foundational skills with patience, creativity, and a deep understanding of child psychology.',
      teacher_image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256&h=256',
      category: 'Primary'
    },
    {
      id: 5,
      teacher_name: 'Binod Shrestha',
      teacher_role: 'English Faculty',
      teacher_description: 'Fostering a love for literature and critical thinking through immersive linguistic exploration.',
      teacher_image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256&h=256',
      category: 'Management'
    },
    {
      id: 6,
      teacher_name: 'Priya Gurung',
      teacher_role: 'Arts & Music',
      teacher_description: 'Inspiring creative expression and cultural appreciation through diverse artistic mediums.',
      teacher_image_url: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?auto=format&fit=crop&q=80&w=256&h=256',
      category: 'Primary'
    }
  ];

  // Helper to determine category based on role/description if not explicitly set
  const categorizeTeacher = (role) => {
    const r = role.toLowerCase();
    if (r.includes('science') || r.includes('math') || r.includes('physics')) return 'Science';
    if (r.includes('management') || r.includes('account') || r.includes('business')) return 'Management';
    if (r.includes('primary') || r.includes('kindergarten')) return 'Primary';
    return 'General';
  };

  const renderSkeletons = (count = 6) => {
    gridContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
      gridContainer.innerHTML += `
        <div class="fs-skeleton">
          <div class="fs-skel-img"></div>
          <div class="fs-skel-name"></div>
          <div class="fs-skel-badge"></div>
          <div class="fs-skel-text"></div>
          <div class="fs-skel-text"></div>
        </div>
      `;
    }
  };

  const renderCards = (data) => {
    gridContainer.innerHTML = '';
    
    if (data.length === 0) {
      gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--fs-text-light);">No faculty profiles found for this category.</div>`;
      return;
    }

    data.forEach(teacher => {
      // Default placeholder if no image
      const imgUrl = teacher.teacher_image_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(teacher.teacher_name) + '&background=0d2444&color=fff&size=256';
      
      const card = document.createElement('div');
      card.className = 'fs-card';
      
      card.innerHTML = `
        <div class="fs-profile-img-wrap">
          <img src="${imgUrl}" alt="${teacher.teacher_name}" class="fs-profile-img" loading="lazy" />
        </div>
        <h3 class="fs-name">${teacher.teacher_name}</h3>
        <span class="fs-role-badge">${teacher.teacher_role}</span>
        <p class="fs-tagline">${teacher.teacher_description || 'Dedicated to academic excellence and student success.'}</p>
        <div class="fs-btn-wrap">
          <a href="#" class="fs-btn" onclick="event.preventDefault(); alert('Opening full profile for ${teacher.teacher_name}')">
            View Full Profile 
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>
      `;
      gridContainer.appendChild(card);
    });
  };

  const fetchFaculty = async () => {
    renderSkeletons(6);
    
    try {
      // Check if Supabase client exists from admin portal
      if (window.supabaseDb) {
        const { data, error } = await window.supabaseDb
          .from('teacher_profiles')
          .select('*')
          .eq('is_active', true)
          .order('id', { ascending: true });
          
        if (!error && data && data.length > 0) {
          // Map category for filtering
          facultyData = data.map(t => ({
            ...t,
            category: categorizeTeacher(t.teacher_role)
          }));
        } else {
          // Fallback if DB empty
          facultyData = mockData;
        }
      } else {
        // Simulate network delay for premium skeleton effect
        await new Promise(res => setTimeout(res, 1200));
        facultyData = mockData;
      }
      
      renderCards(facultyData);
      
    } catch (error) {
      console.error("Error fetching faculty data:", error);
      facultyData = mockData;
      renderCards(facultyData);
    }
  };

  const handleFilter = (e) => {
    // Update active button state
    filterBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    const category = e.target.getAttribute('data-filter');
    
    // Smooth transition
    gridContainer.style.opacity = '0';
    gridContainer.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
      if (category === 'All') {
        renderCards(facultyData);
      } else {
        const filtered = facultyData.filter(t => t.category === category);
        renderCards(filtered);
      }
      
      // Restore visibility
      gridContainer.style.transition = 'all 0.4s ease';
      gridContainer.style.opacity = '1';
      gridContainer.style.transform = 'translateY(0)';
    }, 300);
  };

  // Attach Event Listeners
  filterBtns.forEach(btn => btn.addEventListener('click', handleFilter));

  // Init
  fetchFaculty();
});
