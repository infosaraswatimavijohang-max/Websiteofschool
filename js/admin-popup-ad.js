// admin-popup-ad.js

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the popup ad page if it exists
  const popupAdPage = document.getElementById('page-popup-ad');
  if (popupAdPage) {
    // Only load if this page is active or when user navigates to it
    // Actually we can just load the ads immediately or on a specific event
    loadPopupAds();
  }
});

async function addPopupAdForm(event) {
  event.preventDefault();

  const title = document.getElementById('popup-ad-title').value;
  const redirectUrl = document.getElementById('popup-ad-url').value;
  const status = document.getElementById('popup-ad-status').value;
  const fileInput = document.getElementById('popup-ad-file');

  const submitBtn = document.getElementById('popup-ad-submit-btn');
  const originalText = submitBtn.innerText;
  submitBtn.innerText = 'Uploading...';
  submitBtn.disabled = true;

  try {
    let imageUrl = '';
    
    // Check if updating an existing ad or creating new
    const editId = document.getElementById('popup-ad-form').dataset.editId;
    
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const ext = file.name.split('.').pop();
      const filename = `popup_ad_${Date.now()}.${ext}`;
      
      if (typeof uploadPopupAdImage === 'function') {
        imageUrl = await uploadPopupAdImage(file);
      } else {
        throw new Error("Upload function not found");
      }
    } else if (editId) {
      // Keep existing image if not changed
      const existingAd = window.currentPopupAds.find(ad => String(ad.id) === String(editId));
      if (existingAd) {
        imageUrl = existingAd.image_url;
      }
    } else {
      alert('Please upload an image for the advertisement.');
      submitBtn.innerText = originalText;
      submitBtn.disabled = false;
      return;
    }

    const adData = {
      title: title,
      image_url: imageUrl,
      redirect_url: redirectUrl,
      status: status
    };

    if (editId) {
      const result = await window.updatePopupAd(editId, adData);
      if (result.success) {
        alert('✅ Advertisement updated successfully!');
      } else {
        alert('❌ Failed to update advertisement: ' + result.error);
      }
      document.getElementById('popup-ad-form').removeAttribute('data-edit-id');
      submitBtn.innerText = 'Publish Advertisement';
    } else {
      const result = await window.addPopupAd(adData);
      if (result.success) {
        alert('✅ Advertisement published successfully!');
      } else {
        alert('❌ Failed to publish advertisement: ' + result.error);
      }
    }

    // Reset form and reload list
    document.getElementById('popup-ad-form').reset();
    document.getElementById('popup-ad-image-preview').style.display = 'none';
    loadPopupAds();

  } catch (error) {
    console.error('Error in addPopupAdForm:', error);
    alert('❌ An error occurred.');
    submitBtn.innerText = originalText;
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = 'Publish Advertisement';
  }
}

async function loadPopupAds() {
  const tbody = document.getElementById('popup-ads-tbody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>';

  try {
    const result = await window.getPopupAds(false); // get all, not just active
    if (result.success) {
      window.currentPopupAds = result.data;
      renderPopupAdsTable(result.data);
    } else {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Failed to load data: ${result.error}</td></tr>`;
    }
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Error loading data. Make sure to run SQL setup.</td></tr>`;
  }
}

function renderPopupAdsTable(ads) {
  const tbody = document.getElementById('popup-ads-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!ads || ads.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No advertisements found.</td></tr>';
    return;
  }

  ads.forEach(ad => {
    const dateStr = new Date(ad.created_at).toLocaleDateString();
    const statusBadge = ad.status === 'Active' 
      ? '<span style="background:var(--success); color:white; padding:3px 8px; border-radius:12px; font-size:0.75rem;">Active</span>'
      : '<span style="background:var(--danger); color:white; padding:3px 8px; border-radius:12px; font-size:0.75rem;">Inactive</span>';
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${ad.image_url}" alt="Ad" style="width:50px; height:50px; object-fit:cover; border-radius:4px; border:1px solid #eee;">
          <span>${ad.title}</span>
        </div>
      </td>
      <td>${ad.redirect_url ? `<a href="${ad.redirect_url}" target="_blank">Link</a>` : 'N/A'}</td>
      <td>${dateStr}</td>
      <td>${statusBadge}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editPopupAd('${ad.id}')" title="Edit">✎</button>
        <button class="action-btn delete-btn" onclick="removePopupAd('${ad.id}')" title="Delete">🗑</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function previewPopupAdImage(input) {
  const preview = document.getElementById('popup-ad-image-preview');
  const img = document.getElementById('popup-ad-img-el');
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      img.src = e.target.result;
      preview.style.display = 'block';
    }
    reader.readAsDataURL(input.files[0]);
  } else {
    preview.style.display = 'none';
  }
}

function editPopupAd(id) {
  const ad = window.currentPopupAds.find(a => String(a.id) === String(id));
  if (!ad) return;

  document.getElementById('popup-ad-title').value = ad.title;
  document.getElementById('popup-ad-url').value = ad.redirect_url || '';
  document.getElementById('popup-ad-status').value = ad.status;
  
  const preview = document.getElementById('popup-ad-image-preview');
  const img = document.getElementById('popup-ad-img-el');
  img.src = ad.image_url;
  preview.style.display = 'block';

  document.getElementById('popup-ad-form').dataset.editId = ad.id;
  document.getElementById('popup-ad-submit-btn').innerText = 'Update Advertisement';
  
  document.getElementById('popup-ad-form').scrollIntoView({ behavior: 'smooth' });
}

async function removePopupAd(id) {
  if (!confirm('Are you sure you want to delete this advertisement?')) return;
  
  const result = await window.deletePopupAd(id);
  if (result.success) {
    alert('✅ Advertisement deleted successfully!');
    loadPopupAds();
  } else {
    alert('❌ Failed to delete advertisement: ' + result.error);
  }
}

window.addPopupAdForm = addPopupAdForm;
window.previewPopupAdImage = previewPopupAdImage;
window.editPopupAd = editPopupAd;
window.removePopupAd = removePopupAd;
window.loadPopupAds = loadPopupAds;
