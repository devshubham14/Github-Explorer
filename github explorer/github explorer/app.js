// GitHub Explorer App
const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const results = document.getElementById('results');
const modal = document.getElementById('profile-modal');
const profileContent = document.getElementById('profile-content');
const themeToggle = document.getElementById('theme-toggle');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    results.innerHTML = '<p>Searching...</p>';
    try {
        const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=10`);
        const data = await res.json();
        if (data.items && data.items.length > 0) {
            results.innerHTML = '';
            data.items.forEach(repo => results.appendChild(createRepoCard(repo)));
        } else {
            results.innerHTML = '<p>No repositories found.</p>';
        }
    } catch (err) {
        results.innerHTML = '<p>Error fetching repositories.</p>';
    }
});

function createRepoCard(repo) {
    const card = document.createElement('div');
    card.className = 'repo-card';

    // Header: Repo name and user
    const header = document.createElement('div');
    header.className = 'repo-header';

    // Owner avatar and name
    const user = document.createElement('div');
    user.className = 'repo-user';
    user.title = 'View user profile';
    user.tabIndex = 0;
    user.style.outline = 'none';
    user.addEventListener('click', () => showUserProfile(repo.owner.login));
    user.addEventListener('keypress', (e) => { if (e.key === 'Enter') showUserProfile(repo.owner.login); });

    const avatar = document.createElement('img');
    avatar.src = repo.owner.avatar_url;
    avatar.alt = repo.owner.login;
    const username = document.createElement('span');
    username.textContent = repo.owner.login;
    user.appendChild(avatar);
    user.appendChild(username);

    // Repo title
    const title = document.createElement('a');
    title.className = 'repo-title';
    title.href = repo.html_url;
    title.target = '_blank';
    title.textContent = repo.name;

    header.appendChild(user);
    header.appendChild(title);
    card.appendChild(header);

    // Description
    if (repo.description) {
        const desc = document.createElement('div');
        desc.textContent = repo.description;
        card.appendChild(desc);
    }

    // Stars and language
    const meta = document.createElement('div');
    if (repo.stargazers_count) {
        const stars = document.createElement('span');
        stars.className = 'stars';
        stars.textContent = `★ ${repo.stargazers_count}`;
        meta.appendChild(stars);
    }
    if (repo.language) {
        const lang = document.createElement('span');
        lang.className = 'language';
        lang.textContent = repo.language;
        meta.appendChild(lang);
    }
    card.appendChild(meta);
    return card;
}

async function showUserProfile(username) {
    profileContent.innerHTML = '<p>Loading profile...</p>';
    modal.classList.remove('hidden');
    try {
        const res = await fetch(`https://api.github.com/users/${username}`);
        const user = await res.json();
        profileContent.innerHTML = `
            <img src="${user.avatar_url}" alt="${user.login}" />
            <h2>${user.name || user.login}</h2>
            <p>@${user.login}</p>
            <p>${user.bio ? user.bio : ''}</p>
            <p><a href="${user.html_url}" target="_blank">View on GitHub</a></p>
            <p>Followers: ${user.followers} | Following: ${user.following}</p>
            <button id="close-modal">Close</button>
        `;
        document.getElementById('close-modal').onclick = () => modal.classList.add('hidden');
    } catch (err) {
        profileContent.innerHTML = '<p>Error loading profile.</p>';
    }
}

// Close modal when clicking outside content
modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});

// THEME TOGGLE
function setTheme(isDark) {
    document.body.classList.toggle('dark-theme', isDark);
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Load theme preference
const userTheme = localStorage.getItem('theme');
setTheme(userTheme === 'dark');

themeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-theme');
    setTheme(isDark);
});
