// frontend/script.js
const API_ENDPOINT = 'http://localhost:4000/api/patients'; // change if backend runs elsewhere

document.addEventListener('DOMContentLoaded', () => {
    const photosGrid = document.getElementById('photosGrid');
    const gallery = document.getElementById('gallery');
    const modal = document.getElementById('modal');
    const modalGallery = document.getElementById('modalGallery');
    const closeModal = document.getElementById('closeModal');
    const previewBtn = document.getElementById('previewBtn');
    const clinicForm = document.getElementById('clinicForm');
    const feedback = document.getElementById('feedback');

    const MAX_FILES = 6;
    const MAX_SIZE = 3 * 1024 * 1024;
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    // create 6 file input boxes
    for (let i = 0; i < 6; i++) {
        const box = document.createElement('div');
        box.className = 'photo-box';
        box.innerHTML = `
      <div class="thumb" id="thumb${i}"></div>
      <label>Photo ${i + 1}</label>
      <input type="file" name="photos" accept="image/*" data-index="${i}" />
    `;
        photosGrid.appendChild(box);
    }

    // listeners for file inputs
    photosGrid.addEventListener('change', e => {
        const input = e.target;
        if (!input || input.type !== 'file') return;
        const idx = input.dataset.index;
        const file = input.files[0];
        const thumb = document.getElementById('thumb' + idx);
        if (!file) { thumb.style.backgroundImage = ''; updateGallery(); return; }

        if (!ALLOWED.includes(file.type)) {
            alert('Invalid file type. Use jpg/png/webp.');
            input.value = '';
            return;
        }
        if (file.size > MAX_SIZE) {
            alert('File too large. Max 3MB.');
            input.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = ev => { thumb.style.backgroundImage = `url(${ev.target.result})`; updateGallery(); };
        reader.readAsDataURL(file);
    });

    // update small gallery
    function updateGallery() {
        gallery.innerHTML = '';
        modalGallery.innerHTML = '';
        const files = Array.from(document.querySelectorAll('input[type=file]')).map(i => i.files[0]).filter(Boolean);
        if (files.length === 0) { gallery.textContent = 'No photos selected'; return; }
        files.forEach(f => {
            const url = URL.createObjectURL(f);
            const img = document.createElement('img');
            img.src = url;
            img.onload = () => URL.revokeObjectURL(url);
            gallery.appendChild(img);
            const img2 = img.cloneNode();
            modalGallery.appendChild(img2);
        });
    }

    previewBtn.addEventListener('click', () => {
        updateGallery();
        if (!modalGallery.children.length) { alert('Select at least one photo'); return; }
        modal.classList.remove('hidden');
    });
    closeModal && closeModal.addEventListener('click', () => modal.classList.add('hidden'));

    // submit handler
    clinicForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        feedback.textContent = '';
        const name = document.getElementById('name').value.trim();
        if (!name) { feedback.textContent = 'Name is required'; return; }

        // collect files
        const fileInputs = Array.from(document.querySelectorAll('input[type=file]'));
        if (fileInputs.length !== 6) { feedback.textContent = 'Form error: need 6 inputs'; return; }

        for (let i = 0; i < 6; i++) {
            if (!fileInputs[i].files[0]) { feedback.textContent = 'Please select all 6 photos'; return; }
        }

        const formData = new FormData();
        // append fields
        ['name', 'location', 'gender', 'address', 'measurements', 'total_months'].forEach(k => {
            const el = document.getElementById(k);
            formData.append(k, el ? el.value : '');
        });

        // append photos
        fileInputs.forEach(inp => formData.append('photos', inp.files[0]));

        feedback.textContent = 'Uploading... please wait';
        try {
            const res = await fetch(API_ENDPOINT, { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');
            feedback.style.color = 'green';
            feedback.textContent = 'Saved successfully!';
            // show modal gallery with server URLs if returned
            if (data.photos && data.photos.length) {
                modalGallery.innerHTML = '';
                data.photos.forEach(url => {
                    const img = document.createElement('img');
                    img.src = url;
                    modalGallery.appendChild(img);
                });
                modal.classList.remove('hidden');
            }
            clinicForm.reset();
            document.querySelectorAll('.thumb').forEach(t => t.style.backgroundImage = '');
            gallery.innerHTML = '';
        } catch (err) {
            feedback.style.color = 'red';
            feedback.textContent = 'Error: ' + (err.message || 'Unknown');
        }
    });
});
