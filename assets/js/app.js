document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const songsContainer = document.getElementById('songs-container');
    const searchInput = document.getElementById('search-input');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const backToTopBtn = document.getElementById('back-to-top');
    
    const homeView = document.getElementById('home-view');
    const songView = document.getElementById('song-view');
    const backBtn = document.getElementById('back-btn');
    
    const songTitleEl = document.getElementById('song-title');
    const songLyricsEl = document.getElementById('song-lyrics');
    const copyBtn = document.getElementById('copy-btn');
    const shareBtn = document.getElementById('share-btn');

    let allSongs = [];

    // --- Theme Management ---
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        let theme = 'light';
        if (document.body.classList.contains('dark-mode')) {
            theme = 'dark';
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
        localStorage.setItem('theme', theme);
    });

    // --- Fetch Data ---
    async function loadSongs() {
        // Skeleton loader
        songsContainer.innerHTML = Array(4).fill('<div class="song-card" style="opacity:0.5"><h3>جاري التحميل...</h3></div>').join('');
        
        try {
            const response = await fetch('./data/songs.json');
            allSongs = await response.json();
            renderSongs(allSongs);
        } catch (error) {
            songsContainer.innerHTML = '<p style="color:red;">عذراً، حدث خطأ في تحميل الكلمات.</p>';
        }
    }

    // --- Render Cards ---
    function renderSongs(songs, searchTerm = '') {
        songsContainer.innerHTML = '';
        if (songs.length === 0) {
            songsContainer.innerHTML = '<p>لم يتم العثور على نتائج.</p>';
            return;
        }

        songs.forEach(song => {
            const card = document.createElement('div');
            card.className = 'song-card';
            
            // Highlight title if searching
            let displayTitle = song.title;
            if (searchTerm) {
                const regex = new RegExp(searchTerm, 'gi');
                displayTitle = displayTitle.replace(regex, match => `<mark>${match}</mark>`);
            }

            // Show a snippet of lyrics
            const snippet = song.lyrics.slice(0, 2).join(' / ');

            card.innerHTML = `
                <h3>${displayTitle}</h3>
                <p>${snippet}...</p>
            `;
            
            card.addEventListener('click', () => openSong(song, searchTerm));
            songsContainer.appendChild(card);
        });
    }

    // --- Search Logic (Debounced) ---
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.trim();
        const filtered = allSongs.filter(song => 
            song.title.includes(term) || song.lyrics.join(' ').includes(term)
        );
        renderSongs(filtered, term);
    });

    // --- Open Single Song ---
    function openSong(song, highlightTerm = '') {
        songTitleEl.innerText = song.title;
        
        let lyricsHtml = song.lyrics.join('\n');
        
        if (highlightTerm) {
            const regex = new RegExp(highlightTerm, 'gi');
            lyricsHtml = lyricsHtml.replace(regex, match => `<mark>${match}</mark>`);
        }
        
        songLyricsEl.innerHTML = lyricsHtml;
        
        homeView.classList.remove('active');
        songView.classList.add('active');
        window.scrollTo(0, 0);
    }

    // --- Back Button ---
    backBtn.addEventListener('click', () => {
        songView.classList.remove('active');
        homeView.classList.add('active');
        window.scrollTo(0, 0);
    });

    // --- Copy Lyrics ---
    copyBtn.addEventListener('click', () => {
        const textToCopy = songTitleEl.innerText + '\n\n' + songLyricsEl.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => copyBtn.innerHTML = '<i class="fas fa-copy"></i>', 2000);
        });
    });

    // --- Share Web API ---
    shareBtn.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: `كلمات أغنية ${songTitleEl.innerText} - محمد الأمين`,
                text: `استمتع بكلمات أغنية ${songTitleEl.innerText}:\n${songLyricsEl.innerText.substring(0, 50)}...`,
                url: window.location.href
            });
        } else {
            alert('ميزة المشاركة غير مدعومة في متصفحك الحالي.');
        }
    });

    // --- Back to Top ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Initialize
    loadSongs();
});
