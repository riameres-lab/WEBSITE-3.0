/* Global helpers and simple "auth" using localStorage.
   NOTE: This is a lightweight mock (no real authentication).
*/

/* ===== Landing page behavior ===== */
document.addEventListener('DOMContentLoaded', () => {

  // Smooth scroll for nav links (only anchors that start with #)
  document.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const tgt = a.getAttribute('href');
      const el = document.querySelector(tgt);
      if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  // Search functionality on landing: filter service cards
  const topSearch = document.getElementById('topSearch');
  const topSearchBtn = document.getElementById('topSearchBtn');
  const servicesGrid = document.getElementById('servicesGrid');

  function filterServices(q) {
    q = (q||'').toLowerCase().trim();
    document.querySelectorAll('.service-card').forEach(card => {
      const t = (card.dataset.title || '') + ' ' + (card.innerText || '');
      card.style.display = t.toLowerCase().includes(q) ? 'block' : 'none';
    });
  }
  topSearchBtn.addEventListener('click', () => filterServices(topSearch.value));
  topSearch.addEventListener('keyup', (e) => { if (e.key === 'Enter') filterServices(topSearch.value); });

  /* Auth UI toggles */
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const showSignup = document.getElementById('showSignup');
  const showLogin = document.getElementById('showLogin');
  const authTitle = document.getElementById('authTitle');

  showSignup.addEventListener('click', (e) => { e.preventDefault(); loginForm.classList.add('hidden'); signupForm.classList.remove('hidden'); authTitle.textContent='SIGN UP'; });
  if (showLogin) showLogin.addEventListener('click', (e) => { e.preventDefault(); loginForm.classList.remove('hidden'); signupForm.classList.add('hidden'); authTitle.textContent='LOGIN HERE'; });

  /* Signup / Login logic (mock) */
  const signupBtn = document.getElementById('signupBtn');
  const loginBtn = document.getElementById('loginBtn');
  const socialBtns = document.querySelectorAll('.social-btn');

  function saveUser(user) {
    localStorage.setItem('cw_user', JSON.stringify(user));
  }
  function getUser(){
    return JSON.parse(localStorage.getItem('cw_user') || 'null');
  }
  function setSession(user){
    localStorage.setItem('cw_session', JSON.stringify(user));
  }

  if (signupBtn) signupBtn.addEventListener('click', () => {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const pass = document.getElementById('signupPassword').value;
    if (!name || !email || !pass) { alert('Please complete all fields'); return; }
    const user = {name,email,password:pass,provider:'local',stories:[]};
    saveUser(user);
    setSession(user);
    window.location = 'dashboard.html';
  });

  if (loginBtn) loginBtn.addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;
    const user = getUser();
    if (!user || user.email !== email || user.password !== pass) {
      alert('Invalid email or password. Or user not found. Try signing up.');
      return;
    }
    setSession(user);
    window.location = 'dashboard.html';
  });

  // Mock social login: populate user automatically and redirect
  socialBtns.forEach(b => {
    b.addEventListener('click', () => {
      const provider = b.dataset.provider || 'social';
      const user = {name: provider + ' user', email: provider+'@example.com', provider, stories:[]};
      saveUser(user);
      setSession(user);
      window.location = 'dashboard.html';
    });
  });

}); // DOMContentLoaded end

/* ===== Dashboard behavior ===== */
(function(){
  // Only run if we're on dashboard page
  if (!location.pathname.includes('dashboard.html')) return;

  // Grab session
  const session = JSON.parse(localStorage.getItem('cw_session') || 'null');
  if (!session) {
    // no session -> go to landing
    window.location = 'index.html';
    return;
  }

  // Update profile section
  document.getElementById('profileName').innerText = session.name || 'User';
  document.getElementById('profileEmail').innerText = session.email || '';

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('cw_session');
    // redirect back to landing
    window.location = 'index.html';
  });

  // Dashboard nav buttons
  document.querySelectorAll('.dash-nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.dash-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const page = btn.dataset.page || btn.textContent.trim().toLowerCase();
      // Show page
      document.querySelectorAll('.dash-page').forEach(p => p.classList.remove('active-page'));
      const target = document.querySelector('#page-' + (page || 'home'));
      if (target) target.classList.add('active-page');
    });
  });

  // Populate example stories
  const stories = [
    {id:1,title:'A Door in the Fog',genre:'Fantasy',body:'He found a door where the fog was thickest. Inside was the village he remembered...'},
    {id:2,title:'Last Train Home',genre:'Drama',body:'The station smelled of coffee and old papers. She missed him already.'},
    {id:3,title:'Station of Stars',genre:'Sci-Fi',body:'They docked at a station that sold constellations by the kilo.'}
  ];
  const storiesList = document.getElementById('storiesList');

  function renderStories(list) {
    storiesList.innerHTML = '';
    list.forEach(s => {
      const card = document.createElement('div');
      card.className = 'story-card';
      card.innerHTML = `<h4>${s.title}</h4><small>${s.genre}</small><p>${s.body.slice(0,120)}${s.body.length>120 ? '...' : ''}</p><p><span class="read-more" data-id="${s.id}">READ MORE</span> | <span class="edit" data-id="${s.id}" style="cursor:pointer;color:#666">Edit</span> | <span class="delete" data-id="${s.id}" style="cursor:pointer;color:#c33">Delete</span></p>`;
      storiesList.appendChild(card);
    });
  }
  renderStories(stories);

  // Read more, edit, delete handlers (simple behaviors)
  storiesList.addEventListener('click', (e) => {
    if (e.target.matches('.read-more')) {
      const id = +e.target.dataset.id;
      const s = stories.find(x=>x.id===id);
      if (!s) return;
      alert(`Title: ${s.title}\nGenre: ${s.genre}\n\n${s.body}`);
    } else if (e.target.matches('.edit')) {
      const id = +e.target.dataset.id;
      const s = stories.find(x=>x.id===id);
      if (!s) return;
      // switch to create page with filled values
      document.querySelector('[data-page="create"]').click();
      document.getElementById('storyTitle').value = s.title;
      document.getElementById('storyGenre').value = s.genre;
      document.getElementById('storyBody').value = s.body;
    } else if (e.target.matches('.delete')) {
      const id = +e.target.dataset.id;
      const idx = stories.findIndex(x=>x.id===id);
      if (idx>-1 && confirm('Delete this story?')) {
        stories.splice(idx,1);
        renderStories(stories);
      }
    }
  });

  // Create story form submit
  document.getElementById('createStoryForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const title = document.getElementById('storyTitle').value.trim();
    const genre = document.getElementById('storyGenre').value;
    const body = document.getElementById('storyBody').value.trim();
    if (!title || !body) { alert('Provide title and story'); return; }
    const id = Date.now();
    const newStory = {id,title,genre,body};
    stories.push(newStory);
    renderStories(stories);
    alert('Story saved.');
    // clear form
    document.getElementById('createStoryForm').reset();
  });

  // Preview button
  document.getElementById('previewBtn').addEventListener('click', () => {
    const title = document.getElementById('storyTitle').value.trim();
    const body = document.getElementById('storyBody').value.trim();
    const preview = document.getElementById('previewArea');
    if (!title && !body) { alert('Write something to preview'); return; }
    preview.innerHTML = `<h4>${title}</h4><p>${body.replace(/\n/g,'<br>')}</p>`;
    preview.classList.remove('hidden');
    preview.scrollIntoView({behavior:'smooth'});
  });

  // Settings panel toggles
  document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('settingsPanel').classList.toggle('hidden');
  });
  document.querySelectorAll('.set-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.set-btn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      const key = b.dataset.set;
      document.querySelectorAll('.set-page').forEach(p => p.classList.remove('active-set'));
      const show = document.querySelector(`[data-setpage="${key}"]`);
      if (show) show.classList.add('active-set');
    });
  });

  // Save account details
  document.getElementById('accName').value = session.name || '';
  document.getElementById('accEmail').value = session.email || '';
  document.getElementById('saveAccount').addEventListener('click', () => {
    const name = document.getElementById('accName').value.trim();
    const email = document.getElementById('accEmail').value.trim();
    if (!name || !email) return alert('Complete fields');
    const u = JSON.parse(localStorage.getItem('cw_user')||'null') || {};
    u.name = name; u.email = email;
    localStorage.setItem('cw_user', JSON.stringify(u));
    // also update session
    localStorage.setItem('cw_session', JSON.stringify(u));
    document.getElementById('profileName').innerText = name;
    document.getElementById('profileEmail').innerText = email;
    alert('Account saved');
  });

  // Change password (mock)
  document.getElementById('savePass').addEventListener('click', () => {
    const oldP = document.getElementById('oldPass').value;
    const newP = document.getElementById('newPass').value;
    const u = JSON.parse(localStorage.getItem('cw_user')||'null');
    if (!u) return alert('No user saved');
    if (u.password && oldP !== u.password) return alert('Old password incorrect');
    u.password = newP;
    localStorage.setItem('cw_user', JSON.stringify(u));
    localStorage.setItem('cw_session', JSON.stringify(u));
    alert('Password updated');
  });

  // Payment buttons (mock)
  document.querySelectorAll('.plan .btn').forEach(b => {
    b.addEventListener('click', () => alert('Payment processing is not implemented in this demo.'));
  });

  // Genre filter (on dash)
  document.getElementById('genreSelect').addEventListener('change', (e) => {
    const val = e.target.value.toLowerCase().trim();
    if (!val) renderStories(stories);
    else renderStories(stories.filter(s => s.genre.toLowerCase().includes(val)));
  });

})(); // end dashboard IIFE
