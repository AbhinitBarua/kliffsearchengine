document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('search-bar');
    const searchForm = document.getElementById('search-form');
    const suggestionsBox = document.getElementById('suggestions-box');

    const searchBarResults = document.getElementById('search-bar-results');
    const searchFormResults = document.getElementById('search-form-results');
    const resultsList = document.getElementById('search-results-list');
    const queryTermDisplaySpan = document.getElementById('query-term'); // The span itself
    const searchQueryDisplayP = document.getElementById('search-query-display'); // The P containing the span
    const paginationControls = document.getElementById('pagination');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfoDisplay = document.getElementById('page-info');
    
    const themeToggleButtons = document.querySelectorAll('#theme-toggle'); // NodeList
    const sunIcons = document.querySelectorAll('.sun-icon');
    const moonIcons = document.querySelectorAll('.moon-icon');

    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();
    const currentYearResultsSpan = document.getElementById('current-year-results');
    if (currentYearResultsSpan) currentYearResultsSpan.textContent = new Date().getFullYear();

    // --- Mock Data ---
    const mockSuggestions = [
        "black hole dynamics", "event horizon phenomena", "dark energy theories",
        "css cosmic themes", "javascript procedural generation", "webgl shaders for space",
        "sci-fi universe lore", "absconding css secrets", "hosting quantum apps", "nebula formation"
    ];

    const mockSearchResultsData = {
        "black hole": [
            { title: "The Enigma of Black Holes - NASA Science", url: "science.nasa.gov/black-holes", description: "A black hole is an astronomical object with a gravitational pull so strong that nothing, not even light, can escape it. Dive into the latest research and discoveries." },
            { title: "Visualizing a Black Hole | Event Horizon Telescope", url: "eventhorizontelescope.org/visuals", description: "The Event Horizon Telescope project has successfully imaged black holes, providing unprecedented visual evidence and data for scientists to study these cosmic giants." },
            { title: "Gravitational Lensing by Black Holes", url: "physics.edu/gravitational-lensing", description: "Learn how the immense gravity of black holes can bend light, creating fascinating visual effects known as gravitational lensing and Einstein rings." },
            { title: "Singularities and Cosmic Censorship", url: "cosmology.com/singularities", description: "Explore the theoretical concept of singularities at the heart of black holes and the cosmic censorship hypothesis that protects us from naked singularities." }
        ],
        "css themes": [
            { title: "Advanced CSS Theming Techniques - MDN", url: "developer.mozilla.org/CSS/Theming", description: "Discover how to use CSS custom properties, ::part, and other modern CSS features to create robust and flexible theming systems for your web applications." },
            { title: "Cosmic & Space Themes with CSS - Smashing Magazine", url: "smashingmagazine.com/css-space-themes", description: "A collection of tutorials and examples on creating stunning space-inspired themes using pure CSS, including stars, nebulas, and planet effects." }
        ],
        "javascript generation": [
            { title: "Procedural Content Generation (PCG) in JavaScript", url: "gamedev.net/pcg-js", description: "Learn the fundamentals of procedural content generation and how to implement algorithms in JavaScript to create dynamic game levels, textures, and more." },
            { title: "Generative Art with p5.js", url: "p5js.org/examples", description: "p5.js is a JavaScript library for creative coding, with a focus on making coding accessible for artists, designers, educators, and beginners. Create stunning generative art." }
        ],
        "default": [
            { title: "Kliff Archives - No Direct Match", url: "kliff.search/archives", description: "Your query did not yield specific results from our curated mock data. Consider rephrasing or exploring broader topics within the digital cosmos." },
            { title: "The Nature of Search (A Kliff Primer)", url: "kliff.search/how-it-works", description: "A brief overview of how search engines (like this mock one) process queries, match terms, and attempt to return relevant information from their data stores." }
        ]
    };
    const RESULTS_PER_PAGE = 3; // For pagination example
    let currentPage = 1;
    let currentQueryResults = [];

    // --- Theme Toggle ---
    function setInitialTheme() {
        const savedTheme = localStorage.getItem('kliffTheme') || 'dark'; // Default to dark
        if (savedTheme === 'light') {
            document.documentElement.classList.add('light-mode');
            moonIcons.forEach(icon => icon.style.display = 'block');
            sunIcons.forEach(icon => icon.style.display = 'none');
        } else {
            document.documentElement.classList.remove('light-mode');
            moonIcons.forEach(icon => icon.style.display = 'none');
            sunIcons.forEach(icon => icon.style.display = 'block');
        }
        // Set CSS RGB variables for dynamic colors in CSS (e.g., accretion disk)
        setRgbCssVariables(savedTheme);
    }

    function setRgbCssVariables(theme) {
        const root = document.documentElement;
        if (theme === 'light') {
            // Example for light theme, if accretion disk were visible
            // root.style.setProperty('--glow-color-light-rgb', '0, 123, 255'); 
        } else { // dark theme
            root.style.setProperty('--glow-color-dark-rgb', '0, 255, 255');
            root.style.setProperty('--accent-color-dark-rgb', '255, 0, 255');
            root.style.setProperty('--secondary-color-dark-rgb', '13, 13, 43');
            root.style.setProperty('--primary-color-dark-rgb', '2, 0, 26');
        }
    }


    themeToggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.documentElement.classList.toggle('light-mode');
            let currentTheme = 'dark';
            if (document.documentElement.classList.contains('light-mode')) {
                currentTheme = 'light';
                moonIcons.forEach(icon => icon.style.display = 'block');
                sunIcons.forEach(icon => icon.style.display = 'none');
            } else {
                moonIcons.forEach(icon => icon.style.display = 'none');
                sunIcons.forEach(icon => icon.style.display = 'block');
            }
            localStorage.setItem('kliffTheme', currentTheme);
            setRgbCssVariables(currentTheme);
        });
    });
    
    setInitialTheme();

    // --- Homepage Search Logic ---
    if (searchBar && searchForm && suggestionsBox) {
        let suggestionIndex = -1;

        searchBar.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            suggestionsBox.innerHTML = '';
            suggestionIndex = -1; 

            if (query.length > 0) { // Show suggestions even for 1 char
                const filteredSuggestions = mockSuggestions.filter(s => s.toLowerCase().includes(query));
                suggestionsBox.style.display = filteredSuggestions.length > 0 ? 'block' : 'none';
                
                filteredSuggestions.slice(0, 5).forEach((suggestion, idx) => {
                    const div = document.createElement('div');
                    div.textContent = suggestion;
                    div.setAttribute('role', 'option');
                    div.id = `suggestion-${idx}`;
                    div.addEventListener('click', () => {
                        searchBar.value = suggestion;
                        suggestionsBox.innerHTML = '';
                        suggestionsBox.style.display = 'none';
                        searchForm.requestSubmit(); 
                    });
                    suggestionsBox.appendChild(div);
                });
            } else {
                suggestionsBox.style.display = 'none';
            }
        });

        searchBar.addEventListener('keydown', (e) => {
            const suggestions = suggestionsBox.querySelectorAll('div[role="option"]');
            if (suggestions.length === 0 || suggestionsBox.style.display === 'none') return;

            let currentActive = document.getElementById(searchBar.getAttribute('aria-activedescendant'));

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                suggestionIndex = (suggestionIndex + 1) % suggestions.length;
                updateSelectedSuggestion(suggestions);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                suggestionIndex = (suggestionIndex - 1 + suggestions.length) % suggestions.length;
                updateSelectedSuggestion(suggestions);
            } else if (e.key === 'Enter') {
                if (suggestionIndex > -1 && suggestions[suggestionIndex]) {
                    e.preventDefault(); 
                    suggestions[suggestionIndex].click();
                }
            } else if (e.key === 'Escape') {
                suggestionsBox.innerHTML = '';
                suggestionsBox.style.display = 'none';
                suggestionIndex = -1;
                searchBar.removeAttribute('aria-activedescendant');
            }
        });
        
        function updateSelectedSuggestion(suggestions) {
            suggestions.forEach((s, i) => {
                const isSelected = i === suggestionIndex;
                s.classList.toggle('selected', isSelected);
                if (isSelected) {
                    s.scrollIntoView({ block: 'nearest' });
                    searchBar.setAttribute('aria-activedescendant', s.id);
                }
            });
            if (suggestionIndex > -1 && suggestions[suggestionIndex]) {
                // searchBar.value = suggestions[suggestionIndex].textContent; // Optionally update search bar text on arrow nav
            }
        }

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchBar.value.trim();
            if (query) {
                window.location.href = `results.html?q=${encodeURIComponent(query)}`;
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchForm.contains(e.target)) { // Check if click is outside the form (input + suggestions)
                suggestionsBox.innerHTML = '';
                suggestionsBox.style.display = 'none';
                suggestionIndex = -1;
                searchBar.removeAttribute('aria-activedescendant');
            }
        });
    }

    // --- Results Page Logic ---
    if (resultsList && searchQueryDisplayP && searchBarResults && searchFormResults) {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');

        if (query) {
            const decodedQuery = decodeURIComponent(query);
            searchBarResults.value = decodedQuery;
            if(queryTermDisplaySpan) queryTermDisplaySpan.textContent = decodedQuery;
            performSearch(decodedQuery);
        } else {
            if(queryTermDisplaySpan) queryTermDisplaySpan.textContent = "No query entered.";
            resultsList.innerHTML = "<p>Please enter a search term in the void above.</p>";
            if (paginationControls) paginationControls.style.display = 'none';
        }

        searchFormResults.addEventListener('submit', (e) => {
            e.preventDefault();
            const newQuery = searchBarResults.value.trim();
            if (newQuery) {
                window.location.href = `results.html?q=${encodeURIComponent(newQuery)}`;
            }
        });
    }

    function performSearch(query) {
        const lowerQuery = query.toLowerCase();
        const queryParts = lowerQuery.split(" ");
        
        // Try to find a match for the full query or parts of it
        let foundResults = mockSearchResultsData[lowerQuery];
        if (!foundResults) {
            for (const part of queryParts) {
                if (mockSearchResultsData[part]) {
                    foundResults = mockSearchResultsData[part];
                    break;
                }
            }
        }
        currentQueryResults = foundResults || 
                              (mockSearchResultsData.default.map(r => ({...r, title: r.title.replace("No Direct Match", `No Direct Match for "${query}"`)})));
        
        currentPage = 1;
        renderResultsPage(query); // Pass original query for highlighting
    }

    function renderResultsPage(originalQuery) {
        if (!resultsList) return;
        resultsList.innerHTML = ''; 

        const totalResults = currentQueryResults.length;
        const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);

        if (totalResults === 0) {
            resultsList.innerHTML = `<p>The void echoes... no results found for "<strong>${escapeHTML(originalQuery)}</strong>".</p>`;
            if (paginationControls) paginationControls.style.display = 'none';
            return;
        }
        
        if (paginationControls) paginationControls.style.display = totalPages > 1 ? 'block' : 'none';


        const start = (currentPage - 1) * RESULTS_PER_PAGE;
        const end = start + RESULTS_PER_PAGE;
        const paginatedResults = currentQueryResults.slice(start, end);

        paginatedResults.forEach(result => {
            const item = document.createElement('div');
            item.classList.add('result-item');

            const titleEl = document.createElement('h3');
            const link = document.createElement('a');
            link.href = result.url.startsWith('http') ? result.url : `http://${result.url}`;
            link.textContent = result.title;
            link.target = "_blank"; 
            link.rel = "noopener noreferrer";
            titleEl.appendChild(link);

            const urlP = document.createElement('p');
            urlP.classList.add('url');
            urlP.textContent = result.url;

            const snippetP = document.createElement('p');
            snippetP.classList.add('snippet');
            
            let highlightedDescription = result.description;
            if (originalQuery) {
                const queryTerms = originalQuery.toLowerCase().split(/\s+/).filter(term => term.length > 1); // Split query and filter short terms
                queryTerms.forEach(term => {
                    const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
                    highlightedDescription = highlightedDescription.replace(regex, '<strong>$1</strong>');
                });
            }
            snippetP.innerHTML = highlightedDescription;


            item.appendChild(titleEl);
            item.appendChild(urlP);
            item.appendChild(snippetP);
            resultsList.appendChild(item);
        });

        updatePaginationControls(totalPages);
    }

    function updatePaginationControls(totalPages) {
        if (!pageInfoDisplay || !prevPageButton || !nextPageButton) return;
        if (totalPages <=1 ) {
            if(paginationControls) paginationControls.style.display = 'none';
            return;
        }
        if(paginationControls) paginationControls.style.display = 'flex'; // Use flex for better alignment

        pageInfoDisplay.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;

        prevPageButton.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                const currentQuery = decodeURIComponent(new URLSearchParams(window.location.search).get('q') || "");
                renderResultsPage(currentQuery);
                window.scrollTo({top: 0, behavior: 'smooth'});
            }
        };
        nextPageButton.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                const currentQuery = decodeURIComponent(new URLSearchParams(window.location.search).get('q') || "");
                renderResultsPage(currentQuery);
                window.scrollTo({top: 0, behavior: 'smooth'});
            }
        };
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, function (match) {
            return {
                '&': '&',
                '<': '<',
                '>': '>',
                '"': '"',
                "'": '''
            }[match];
        });
    }
});
