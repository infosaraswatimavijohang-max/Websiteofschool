// ============================================================================
// ADMIN HERO VIDEO CMS LOGIC
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Check if on video page initially or when switching pages
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === 'page-hero-video' && mutation.target.classList.contains('active')) {
                loadHeroVideos();
            }
        });
    });

    const videoPage = document.getElementById('page-hero-video');
    if (videoPage) {
        observer.observe(videoPage, { attributes: true, attributeFilter: ['class'] });
        if (videoPage.classList.contains('active')) {
            loadHeroVideos();
        }
    }
});

// Load existing videos into the table
async function loadHeroVideos() {
    const tbody = document.getElementById('heroVideoTableBody');
    if (!tbody) return;

    if (!window.getHeroVideos) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">Supabase Client not loaded yet.</td></tr>';
        return;
    }

    try {
        const result = await window.getHeroVideos(false); // get all, not just active
        if (!result.success) throw new Error(result.error);

        if (!result.data || result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #64748b;">No entries found for this module.</td></tr>';
            return;
        }

        tbody.innerHTML = result.data.map(video => {
            const date = new Date(video.created_at).toLocaleDateString();
            const statusBadge = video.status === 'Active' 
                ? '<span style="background:#dcfce7;color:#166534;padding:4px 8px;border-radius:12px;font-size:0.8rem;font-weight:600;">Active</span>'
                : '<span style="background:#f1f5f9;color:#475569;padding:4px 8px;border-radius:12px;font-size:0.8rem;font-weight:600;">Inactive</span>';

            return `
                <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 1rem; font-weight: 500;">${video.title}</td>
                    <td style="padding: 1rem;">
                        <a href="${video.video_url || video.youtube_embed_url}" target="_blank" style="color:var(--secondary); text-decoration:none; display:flex; align-items:center; gap:0.5rem;">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>
                            ${video.video_type === 'upload' ? 'View File' : 'View Link'}
                        </a>
                    </td>
                    <td style="padding: 1rem; color: #64748b; font-size: 0.9rem;">${date}</td>
                    <td style="padding: 1rem;">${statusBadge}</td>
                    <td style="padding: 1rem; text-align: right;">
                        <button onclick="deleteHeroVideoEntry('${video.id}')" style="background:#fee2e2; color:#ef4444; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:0.85rem; transition: background 0.2s;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');

        // Store locally for website usage
        localStorage.setItem('website_hero_video', JSON.stringify(result.data.filter(v => v.status === 'Active')));
    } catch (e) {
        console.error("Error rendering hero videos:", e);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #ef4444;">Error loading records: ${e.message}</td></tr>`;
    }
}

// Handle new video submission
async function handleHeroVideoSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('heroVideoTitle').value.trim();
    const source = document.getElementById('heroVideoSource').value;
    const status = document.getElementById('heroVideoStatus').value;
    const btn = document.getElementById('btnSaveHeroVideo');
    
    if (!title) return;

    if (!window.addHeroVideo || !window.uploadHeroVideoFile) {
        alert('Supabase client not loaded. Please try again.');
        return;
    }

    const btnText = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.loader');

    btn.disabled = true;
    btnText.style.display = 'none';
    loader.style.display = 'block';

    try {
        let finalVideoUrl = '';

        if (source === 'youtube') {
            const url = document.getElementById('heroVideoUrl').value.trim();
            if (!url) throw new Error("YouTube URL is required.");
            finalVideoUrl = url;
        } else {
            const fileInput = document.getElementById('heroVideoFile');
            if (!fileInput.files || fileInput.files.length === 0) {
                throw new Error("Please select a video file to upload.");
            }
            const file = fileInput.files[0];
            
            // Upload the file first
            const uploadResult = await window.uploadHeroVideoFile(file);
            if (!uploadResult.success) {
                throw new Error("Video upload failed: " + uploadResult.error);
            }
            finalVideoUrl = uploadResult.url;
        }

        const result = await window.addHeroVideo({
            title: title,
            video_url: finalVideoUrl,
            video_type: source,
            status: status
        });

        if (result.success) {
            alert('✅ Video record saved successfully!');
            document.getElementById('heroVideoForm').reset();
            // Need to manually reset the toggle state to youtube
            document.getElementById('heroVideoSource').value = 'youtube';
            if (typeof toggleVideoInputs === 'function') toggleVideoInputs();
            loadHeroVideos();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error("Error saving video:", error);
        alert(`❌ Failed to save video: ${error.message}`);
    } finally {
        btn.disabled = false;
        btnText.style.display = 'block';
        loader.style.display = 'none';
    }
}

async function deleteHeroVideoEntry(id) {
    if (!confirm("Are you sure you want to delete this video record? This action cannot be undone.")) return;

    try {
        const result = await window.deleteHeroVideo(id);
        if (result.success) {
            loadHeroVideos();
        } else {
            throw new Error(result.error);
        }
    } catch (e) {
        console.error("Error deleting video:", e);
        alert(`❌ Failed to delete video: ${e.message}`);
    }
}
