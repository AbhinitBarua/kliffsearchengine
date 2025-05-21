document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('search-bar');
    const searchForm = document.getElementById('search-form');
    const suggestionsBox = document.getElementById('suggestions-box');

    const searchBarResults = document.getElementById('search-bar-results');
    const searchFormResults = document.getElementById('search-form-results');
    const resultsList = document.getElementById('search-results-list');
    const queryTermDisplay = document.getElementById('query-term');
    const paginationControls = document.getElementById('pagination');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfoDisplay = document.getElementById('page-info');
    
    const themeToggleButton = document.querySelectorAll('#theme-toggle'); // Select all for both pages
    const sunIcon = document.querySelectorAll('.sun-icon');
    const moonIcon = document.querySelectorAll('.moon-icon');


    // --- Mock Data ---
    const mockSuggestions = [
        "black hole information", "dark matter explained", "event horizon telescope",
        "css animation tricks", "javascript game development", "webgl tutorials",
        "sci-fi movie database", "absconding css techniques", "hosting node.js app"
    ];

    // More detailed mock results
    const mockSearchResultsData = {
        "black hole": [
            { title: "Understanding Black Holes - NASA", url: "nasa.gov/blackholes", description: "A black hole is a place in space where gravity pulls so much that even light can not get out. The gravity is so strong because matter has been squeezed into a tiny space." },
            { title: "What is a Black Hole? | Event Horizon Telescope", url: "eventhorizontelescope.org/black-hole", description: "The Event Horizon Telescope collaboration presented the first direct visual evidence of a supermassive black hole and its shadow." },
            { title: "Black Holes and Time Dilation - Physics Explained", url: "physics.example.com/timedilation", description: "Explore the fascinating concept of time dilation near massive objects like black holes, as predicted by Einstein's theory of general relativity." }
        ],
        "css animation": [
            { title: "CSS Animations - MDN Web Docs", url: "developer.mozilla.org/CSS/Animations", description: "CSS animations make it possible to animate transitions from one CSS style configuration to another. Animations consist of two components: a style describing the CSS animation and a set of keyframes that indicate the start and end states of the animation's style." },
            { title: "Cool CSS Animation Examples - CodePen", url: "codepen.io/topic/css-animations", description: "A curated collection of impressive CSS animations from developers around the world. Get inspired and learn new techniques." }
        ],
        "default": [ // Fallback for queries not in mockSearchResultsData
            { title: "Kliff Search - No Specific Results", url: "kliff.search/no-results", description: "Your query did not match our specialized mock data. This is a generic placeholder result. In a real search engine, you'd see broader results." },
            { title: "How Search Engines Work (Simplified)", url: "example.com/how-search-works", description: "Learn the basics of web crawling, indexing, and ranking that power search engines like Kliff (if it were real!)." }
        ]
    };
    const RESULTS_PER_PAGE = 5; // For pagination example
    let currentPage = 1;
    let currentQueryResults = [];


    // --- Theme Toggle ---
    function setInitialTheme() {
        const savedTheme = localStorage.getItem('kliffTheme') || 'dark';
        if (savedTheme === 'light') {
            document.documentElement.classList.add('light-mode');
            sunIcon.forEach(icon => icon.style.display = 'none');
            moonIcon.forEach(icon => icon.style.display = 'block');
        } else {
            document.documentElement.classList.remove('light-mode');
            sunIcon.forEach(icon => icon.style.display = 'block');
            moonIcon.forEach(icon => icon.style.display = 'none');
        }
    }

    themeToggleButton.forEach(button => {
        button.addEventListener('click', () => {
            document.documentElement.classList.toggle('light-mode');
            let theme = 'dark';
            if (document.documentElement.classList.contains('light-mode')) {
                theme = 'light';
                sunIcon.forEach(icon => icon.style.display = 'none');
                moonIcon.forEach(icon => icon.style.display = 'block');
            } else {
                sunIcon.forEach(icon => icon.style.display = 'block');
                moonIcon.forEach(icon => icon.style.display = 'none');
            }
            localStorage.setItem('kliffTheme', theme);
        });
    });
    
    setInitialTheme(); // Apply theme on load

    // --- Homepage Search Logic ---
    if (searchBar && searchForm && suggestionsBox) {
        let suggestionIndex = -1;

        searchBar.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            suggestionsBox.innerHTML = '';
            suggestionIndex = -1; // Reset index

            if (query.length > 1) {
                const filteredSuggestions = mockSuggestions.filter(s => s.toLowerCase().includes(query));
                filteredSuggestions.slice(0, 5).forEach(suggestion => { // Limit to 5 suggestions
                    const div = document.createElement('div');
                    div.textContent = suggestion;
                    div.addEventListener('click', () => {
                        searchBar.value = suggestion;
                        suggestionsBox.innerHTML = '';
                        searchForm.requestSubmit(); // Submit form
                    });
                    suggestionsBox.appendChild(div);
                });
            }
        });

        searchBar.addEventListener('keydown', (e) => {
            const suggestions = suggestionsBox.querySelectorAll('div');
            if (suggestions.length === 0) return;

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
                    e.preventDefault(); // Prevent form submission if selecting suggestion
                    suggestions[suggestionIndex].click();
                }
                // If no suggestion selected, let form submit normally
            } else if (e.key === 'Escape') {
                suggestionsBox.innerHTML = '';
                suggestionIndex = -1;
            }
        });
        
        function updateSelectedSuggestion(suggestions) {
            suggestions.forEach((s, i) => {
                s.classList.toggle('selected', i === suggestionIndex);
                if (i === suggestionIndex) {
                    s.scrollIntoView({ block: 'nearest' });
                }
            });
            if (suggestionIndex > -1 && suggestions[suggestionIndex]) {
                searchBar.value = suggestions[suggestionIndex].textContent; // Update search bar text
            }
        }

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchBar.value.trim();
            if (query) {
                window.location.href = `results.html?q=${encodeURIComponent(query)}`;
            }
        });

        // Close suggestions if clicked outside
        document.addEventListener('click', (e) => {
            if (!searchBar.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.innerHTML = '';
                suggestionIndex = -1;
            }
        });
    }

    // --- Results Page Logic ---
    if (resultsList && queryTermDisplay && searchBarResults && searchFormResults) {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');

        if (query) {
            searchBarResults.value = decodeURIComponent(query); // Populate search bar on results page
            queryTermDisplay.textContent = decodeURIComponent(query);
            performSearch(decodeURIComponent(query));
        } else {
            queryTermDisplay.textContent = "No query entered.";
            resultsList.innerHTML = "<p>Please enter a search term.</p>";
            if (paginationControls) paginationControls.style.display = 'none';
        }

        searchFormResults.addEventListener('submit', (e) => {
            e.preventDefault();
            const newQuery = searchBarResults.value.trim();
            if (newQuery) {
                // Update URL and re-render (or redirect for cleaner history)
                window.location.href = `results.html?q=${encodeURIComponent(newQuery)}`;
            }
        });
    }

    function performSearch(query) {
        // In a real app, this would be an API call.
        // Here, we use mock data.
        const lowerQuery = query.toLowerCase();
        currentQueryResults = mockSearchResultsData[lowerQuery] || 
                              (mockSearchResultsData.default.map(r => ({...r, title: r.title.replace("No Specific Results", `Results for "${query}"`)})));
        
        currentPage = 1; // Reset to first page for new search
        renderResultsPage();
    }

    function renderResultsPage() {
        if (!resultsList) return;
        resultsList.innerHTML = ''; // Clear previous results

        const totalResults = currentQueryResults.length;
        const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);

        if (totalResults === 0) {
            resultsList.innerHTML = `<p>No results found for "<strong>${decodeURIComponent(queryTermDisplay.textContent)}</strong>". Try another dimension?</p>`;
            if (paginationControls) paginationControls.style.display = 'none';
            return;
        }
        
        if (paginationControls) paginationControls.style.display = 'block';


        const start = (currentPage - 1) * RESULTS_PER_PAGE;
        const end = start + RESULTS_PER_PAGE;
        const paginatedResults = currentQueryResults.slice(start, end);

        paginatedResults.forEach(result => {
            const item = document.createElement('div');
            item.classList.add('result-item');

            const title = document.createElement('h3');
            const link = document.createElement('a');
            link.href = `http://${result.url}`; // Assume http for mock
            link.textContent = result.title;
            link.target = "_blank"; // Open in new tab
            title.appendChild(link);

            const urlP = document.createElement('p');
            urlP.classList.add('url');
            urlP.textContent = result.url;

            const snippetP = document.createElement('p');
            snippetP.classList.add('snippet');
            // Basic highlighting (replace with more robust solution in real app)
            const queryForHighlight = queryTermDisplay.textContent.split(" ")[0]; // Use first word for simple highlight
            const regex = new RegExp(`(${escapeRegExp(queryForHighlight)})`, 'gi');
            snippetP.innerHTML = result.description.replace(regex, '<strong>$1</strong>');

            item.appendChild(title);
            item.appendChild(urlP);
            item.appendChild(snippetP);
            resultsList.appendChild(item);
        });

        updatePaginationControls(totalPages);
    }

    function updatePaginationControls(totalPages) {
        if (!pageInfoDisplay || !prevPageButton || !nextPageButton) return;

        pageInfoDisplay.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;

        prevPageButton.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderResultsPage();
                window.scrollTo(0,0); // Scroll to top
            }
        };
        nextPageButton.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderResultsPage();
                window.scrollTo(0,0); // Scroll to top
            }
        };
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

});
