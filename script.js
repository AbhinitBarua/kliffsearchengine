/* script.js - Kliff Search Engine - Expanded Edition */

// Strict mode for catching common coding errors
"use strict";

// Polyfill for requestSubmit if not available (older browsers)
if (!HTMLFormElement.prototype.requestSubmit) {
    HTMLFormElement.prototype.requestSubmit = function (submitter) {
        if (submitter) {
            if (!(submitter instanceof HTMLElement) || submitter.form !== this) {
                throw new TypeError("The specified submitter is not a submit button for this form element.");
            }
            submitter.click();
        } else {
            const E = Element.prototype,
                  matches = E.matches || E.mozMatchesSelector || E.msMatchesSelector || E.webkitMatchesSelector,
                  submitButton = Array.prototype.find.call(this.elements, (el) => el.type === "submit" && matches.call(el, ":not([disabled])"));
            if (submitButton) {
                submitButton.click();
            } else {
                // Fallback if no submit button found (should ideally not happen with well-formed HTML)
                const event = new Event("submit", { bubbles: true, cancelable: true });
                if (!this.dispatchEvent(event)) {
                    // If event was cancelled, do nothing
                } else {
                     // If not cancelled and no default action (rare for submit), then manual submission (not standard)
                    // This part is tricky as it bypasses some default form behaviors
                }
            }
        }
    };
}


document.addEventListener('DOMContentLoaded', () => {
    console.log("Kliff Core Systems: Initializing...");

    // --- DOM Element Selectors ---
    const kliffBody = document.body;

    // Homepage Elements
    const homeWrapper = document.getElementById('home-wrapper');
    const mainSearchForm = document.getElementById('kliff-search-form');
    const mainSearchBar = document.getElementById('main-search-bar');
    const suggestionsListbox = document.getElementById('search-suggestions-listbox');
    const voiceSearchBtn = document.getElementById('voice-search-btn');
    const voiceStatusMsg = document.getElementById('voice-status-message');
    const animatedTaglineSpans = document.querySelectorAll('.animated-tagline span');
    const currentYearDisplay = document.getElementById('current-year-display');

    // Results Page Elements
    const resultsWrapper = document.getElementById('results-wrapper');
    const resultsSearchForm = document.getElementById('kliff-results-search-form');
    const resultsSearchBar = document.getElementById('results-search-bar');
    const voiceSearchBtnResults = document.getElementById('voice-search-btn-results'); // Separate voice button for results page
    const resultsInfoStatement = document.getElementById('results-info-statement');
    const searchedQueryTermDisplay = document.getElementById('searched-query-term');
    const aiAnswerBoxPlaceholder = document.getElementById('ai-answer-box-placeholder'); // Conceptual
    const searchResultsOutputArea = document.getElementById('search-results-output-area');
    const paginationControlsNav = document.getElementById('search-pagination-controls');
    const paginationPrevBtn = document.getElementById('pagination-prev-btn');
    const paginationNextBtn = document.getElementById('pagination-next-btn');
    const paginationPageIndicator = document.getElementById('pagination-page-indicator');
    const currentYearDisplayResults = document.getElementById('current-year-display-results');

    // Theme Toggle (handles multiple buttons if they exist)
    const themeToggleButtons = document.querySelectorAll('#theme-toggle-btn, #theme-toggle-btn-results'); // All theme buttons
    const moonIcons = document.querySelectorAll('.icon-moon');
    const sunIcons = document.querySelectorAll('.icon-sun');

    // --- Global State & Configuration ---
    const KLIFF_CONFIG = {
        suggestionsMax: 7, // Max suggestions to show
        resultsPerPage: 5, // Results per page for pagination
        debounceDelay: 250, // Debounce delay for input events (ms)
        voiceSearchLang: 'en-US', // Default language for voice search
        mockApiDelay: 300, // Simulate API call delay (ms) for mock search
        staggerAnimationDelay: 100, // Delay for staggering animations (ms)
    };

    let currentSearchQuery = "";
    let currentPageNumber = 1;
    let totalMockResults = [];
    let activeSuggestionIndex = -1;
    let debounceTimer;

    // --- Mock Data Store ---
    // (Significantly expanded for variety)
    const KLIFF_MOCK_DATA_STORE = {
        // Keywords for suggestions, could also be pre-computed popular queries
        popularKeywords: [
            "quantum entanglement", "dark matter theories", "event horizon telescope", "string theory basics",
            "general relativity explained", "cosmic microwave background", "exoplanet discoveries", "nebula formation",
            "artificial intelligence ethics", "neural network architectures", "machine learning algorithms",
            "cybersecurity best practices", "blockchain technology", "decentralized finance (DeFi)",
            "advanced CSS animations", "JavaScript frameworks comparison", "WebAssembly use cases", "PWA development",
            "retro gaming emulators", "sci-fi movie recommendations", "dystopian literature", "space opera sagas",
            "philosophy of mind", "existentialism explained", "stoic principles", "meditation techniques",
            "sustainable energy solutions", "climate change impact", "genetic engineering advancements",
            "ancient civilizations mysteries", "unexplained phenomena", "cryptid sightings"
        ],
        // Search results structured by query key
        searchResults: {
            "quantum entanglement": [
                {
                    title: "Quantum Entanglement: Spooky Action at a Distance - Institute of Physics",
                    url: "iop.org/quantum-entanglement-explained",
                    snippet: "Delve into the fascinating world of <strong>quantum entanglement</strong>, where particles become interlinked and instantaneously affect each other's state regardless of the distance separating them. Explore the history, experiments, and potential applications.",
                    type: "Article", date: "2023-10-26", relevanceScore: 0.95,
                    tags: ["physics", "quantum mechanics", "entanglement", "spooky action"]
                },
                {
                    title: "Visualizing Entanglement: A Simplified Guide - QuantumLeap.co",
                    url: "quantumleap.co/visualizing-entanglement",
                    snippet: "Struggling to grasp <strong>quantum entanglement</strong>? This guide uses intuitive visualizations and analogies to explain this counter-intuitive phenomenon. No advanced physics degree required!",
                    type: "Guide", date: "2024-01-15", relevanceScore: 0.88,
                    tags: ["visualization", "education", "quantum physics", "guide"]
                },
                {
                    title: "Applications of Quantum Entanglement: From Computing to Cryptography - TechFuture",
                    url: "techfuture.com/applications-quantum-entanglement",
                    snippet: "Beyond theoretical curiosity, <strong>quantum entanglement</strong> holds the key to revolutionary technologies, including ultra-powerful quantum computers and unhackable communication systems. Discover the future, today.",
                    type: "Technology Overview", date: "2023-11-05", relevanceScore: 0.92,
                    tags: ["technology", "quantum computing", "cryptography", "innovation"]
                }
            ],
            "dark matter": [ // Added space for "dark matter theories"
                {
                    title: "The Dark Matter Enigma: What We Know (And Don't Know) - Cosmic Mysteries",
                    url: "cosmicmysteries.net/dark-matter-enigma",
                    snippet: "<strong>Dark matter</strong> constitutes the vast majority of matter in the universe, yet its nature remains one of the biggest unsolved puzzles in physics. Explore current <strong>theories</strong>, detection efforts, and the implications for cosmology.",
                    type: "Science Feature", date: "2024-02-01", relevanceScore: 0.98,
                    tags: ["astrophysics", "cosmology", "dark matter", "unsolved mysteries", "research"]
                },
                {
                    title: "Searching for Dark Matter: Experiments Around the Globe - Particle Physics Today",
                    url: "particlephysicstoday.org/dark-matter-experiments",
                    snippet: "An overview of the various sophisticated experiments worldwide attempting to directly or indirectly detect <strong>dark matter</strong> particles. Learn about WIMPs, axions, and other candidates.",
                    type: "Experimental Physics", date: "2023-12-12", relevanceScore: 0.90,
                    tags: ["experiments", "particle physics", "detection", "wimps", "axions"]
                }
            ],
            "advanced css": [ // For "advanced CSS animations"
                 {
                    title: "Mastering Complex CSS Animations & Transitions - CSSMasters.io",
                    url: "cssmasters.io/advanced-animations",
                    snippet: "Unlock the full potential of CSS with <strong>advanced animation</strong> techniques. Learn about keyframe mastery, 3D transforms, SVG animation, and performance optimization for smooth, stunning visuals.",
                    type: "Tutorial", date: "2024-01-20", relevanceScore: 0.93,
                    tags: ["css", "web development", "animations", "transitions", "frontend"]
                },
                {
                    title: "Creative Uses of CSS Custom Properties for Theming and Animations - WebDevWeekly",
                    url: "webdevweekly.com/css-custom-properties-animations",
                    snippet: "Explore how CSS Custom Properties (Variables) can revolutionize your workflow for creating dynamic themes and highly configurable <strong>advanced CSS animations</strong>. Includes practical examples and best practices.",
                    type: "Article", date: "2023-11-28", relevanceScore: 0.89,
                    tags: ["css variables", "theming", "web design", "animations"]
                }
            ],
            "kliff internal": [ // For searching "Kliff" or similar internal terms
                {
                    title: "Kliff Search Engine: Project Genesis Document (Internal)",
                    url: "kliff.dev/docs/project-genesis",
                    snippet: "This document outlines the core architecture, design principles, and future roadmap for the <strong>Kliff</strong> Search Engine. Access restricted to authorized personnel. Quantum clearance level 5 required.",
                    type: "Documentation", date: "2023-01-01", relevanceScore: 1.0,
                    tags: ["internal", "documentation", "kliff", "architecture", "secret"]
                },
                {
                    title: "The Philosophy of Kliff: Navigating Digital Realities",
                    url: "kliff.philosophy/digital-realities",
                    snippet: "An exploration of the philosophical underpinnings of the <strong>Kliff</strong> project. How do we define information in an infinitely complex digital multiverse? What are the ethics of absconding knowledge?",
                    type: "Essay", date: "2023-05-15", relevanceScore: 0.85,
                    tags: ["philosophy", "kliff", "ethics", "information theory"]
                }
            ],
            // ... more specific query results ...
            "default": [ // Fallback for queries not explicitly matched
                {
                    title: "No Direct Match Found in Kliff Archives",
                    url: "kliff.search/no-match",
                    snippet: "Your query did not resonate with any specific entries in our curated mock data banks. The digital void is vast; perhaps try rephrasing or exploring a related concept? Or this could be a new undiscovered territory!",
                    type: "Status", date: "N/A", relevanceScore: 0.1,
                    tags: ["fallback", "no results", "information"]
                },
                {
                    title: "How Search Engines (Like Kliff, Conceptually) Work",
                    url: "kliff.concepts/how-search-works",
                    snippet: "A simplified conceptual overview of web crawling, indexing, and ranking – the fundamental processes that would power a real search engine like Kliff. This is for illustrative purposes within this mock environment.",
                    type: "Concept", date: "N/A", relevanceScore: 0.2,
                    tags: ["search engine basics", "concepts", "kliff", "education"]
                }
            ]
        },
        // AI Answer Box mock content
        aiSummaries: {
            "quantum entanglement": {
                summary: "<strong>Quantum entanglement</strong> is a counter-intuitive phenomenon where two or more quantum particles become linked in such a way that their fates are intertwined, regardless of the distance separating them. Measuring a property of one particle instantaneously influences the properties of the other(s). Albert Einstein famously called it 'spooky action at a distance.' It's a cornerstone of quantum mechanics and has potential applications in quantum computing, cryptography, and teleportation (of information, not matter yet!).",
                relatedQueries: ["What is quantum superposition?", "Bell's theorem explained", "Applications of quantum computing"]
            },
            "dark matter": {
                summary: "<strong>Dark matter</strong> is a hypothetical form of matter thought to account for approximately 85% of the matter in the universe. Its presence is implied in a variety of astrophysical observations, including gravitational effects that cannot be explained by accepted theories of gravity unless more matter is present than can be seen. The exact nature of dark matter is unknown, but leading candidates include WIMPs (Weakly Interacting Massive Particles) and axions. Extensive research and experiments are underway globally to detect and understand it.",
                relatedQueries: ["What is dark energy?", "Modified Newtonian Dynamics (MOND)", "Galaxy rotation curves"]
            }
        }
    };


    // --- Utility Functions ---

    /**
     * Debounces a function to limit the rate at which it's called.
     * @param {Function} func - The function to debounce.
     * @param {number} delay - The debounce delay in milliseconds.
     * @returns {Function} - The debounced function.
     */
    const debounce = (func, delay) => {
        return (...args) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    /**
     * Sanitizes HTML string to prevent XSS.
     * A more robust library like DOMPurify is recommended for production.
     * @param {string} str - The string to sanitize.
     * @returns {string} - The sanitized string.
     */
    const sanitizeHTML = (str) => {
        if (!str) return "";
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    };

    /**
     * Escapes special characters for use in a Regular Expression.
     * @param {string} string - The string to escape.
     * @returns {string} - The escaped string.
     */
    const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    /**
     * Simulates an API call with a delay.
     * @param {Function} callback - The function to call after the delay.
     */
    const simulateApiCall = (callback) => {
        // console.log("Kliff Systems: Simulating API call...");
        setTimeout(() => {
            // console.log("Kliff Systems: Mock API response received.");
            callback();
        }, KLIFF_CONFIG.mockApiDelay);
    };


    // --- Theme Management ---
    const initTheme = () => {
        const savedTheme = localStorage.getItem('kliffUserTheme') || 'dark'; // Default to dark
        applyTheme(savedTheme);
        // console.log(`Kliff Theme: Initialized to ${savedTheme}-mode.`);
    };

    const applyTheme = (theme) => {
        if (theme === 'light') {
            kliffBody.classList.add('kliff-light-theme');
            moonIcons.forEach(icon => icon.style.display = 'block');
            sunIcons.forEach(icon => icon.style.display = 'none');
        } else {
            kliffBody.classList.remove('kliff-light-theme');
            moonIcons.forEach(icon => icon.style.display = 'none');
            sunIcons.forEach(icon => icon.style.display = 'block');
        }
        // Set CSS RGB variables for dynamic colors (e.g., accretion disk in CSS)
        // This part is more illustrative if CSS handles it directly with var(--primary-color-rgb) etc.
        const rootStyle = document.documentElement.style;
        if (theme === 'light') {
            // Example: rootStyle.setProperty('--kliff-dynamic-glow-rgb', '0, 123, 255');
        } else {
            // Example: rootStyle.setProperty('--kliff-dynamic-glow-rgb', '0, 255, 255');
        }
    };

    const toggleTheme = () => {
        const currentIsLight = kliffBody.classList.contains('kliff-light-theme');
        const newTheme = currentIsLight ? 'dark' : 'light';
        applyTheme(newTheme);
        localStorage.setItem('kliffUserTheme', newTheme);
        // console.log(`Kliff Theme: Toggled to ${newTheme}-mode.`);
    };

    themeToggleButtons.forEach(btn => btn.addEventListener('click', toggleTheme));


    // --- Homepage Specific Initializations & Animations ---
    if (homeWrapper) {
        // Animate tagline letters appearing one by one
        const animateTagline = () => {
            animatedTaglineSpans.forEach((span, index) => {
                span.style.animationDelay = `${index * 0.05}s`; // Staggered delay
            });
        };
        animateTagline();

        if (currentYearDisplay) {
            currentYearDisplay.textContent = new Date().getFullYear();
        }
    }
    if (resultsWrapper && currentYearDisplayResults) {
         currentYearDisplayResults.textContent = new Date().getFullYear();
    }


    // --- Search Suggestions Logic ---
    const displaySuggestions = (query) => {
        suggestionsListbox.innerHTML = ''; // Clear previous
        activeSuggestionIndex = -1; // Reset keyboard navigation index

        if (!query || query.length < 1) {
            suggestionsListbox.classList.remove('visible');
            if(mainSearchBar) mainSearchBar.setAttribute('aria-expanded', 'false');
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filteredSuggestions = KLIFF_MOCK_DATA_STORE.popularKeywords
            .filter(keyword => keyword.toLowerCase().includes(lowerQuery))
            .slice(0, KLIFF_CONFIG.suggestionsMax);

        if (filteredSuggestions.length > 0) {
            suggestionsListbox.classList.add('visible');
             if(mainSearchBar) mainSearchBar.setAttribute('aria-expanded', 'true');

            filteredSuggestions.forEach((suggestion, index) => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.setAttribute('role', 'option');
                suggestionItem.id = `suggestion-option-${index}`;
                
                // Highlight matching part (simple version)
                const matchIndex = suggestion.toLowerCase().indexOf(lowerQuery);
                if (matchIndex !== -1) {
                    suggestionItem.innerHTML = sanitizeHTML(suggestion.substring(0, matchIndex)) +
                                               `<strong>${sanitizeHTML(suggestion.substring(matchIndex, matchIndex + lowerQuery.length))}</strong>` +
                                               sanitizeHTML(suggestion.substring(matchIndex + lowerQuery.length));
                } else {
                    suggestionItem.textContent = sanitizeHTML(suggestion);
                }

                suggestionItem.addEventListener('click', () => {
                    selectSuggestion(suggestion);
                });
                suggestionsListbox.appendChild(suggestionItem);
            });
        } else {
            suggestionsListbox.classList.remove('visible');
             if(mainSearchBar) mainSearchBar.setAttribute('aria-expanded', 'false');
        }
    };
    
    const selectSuggestion = (suggestionText) => {
        if (mainSearchBar) mainSearchBar.value = suggestionText;
        if (resultsSearchBar) resultsSearchBar.value = suggestionText; // If on results page
        
        suggestionsListbox.innerHTML = '';
        suggestionsListbox.classList.remove('visible');
        if (mainSearchBar) mainSearchBar.setAttribute('aria-expanded', 'false');
        if (mainSearchBar) mainSearchBar.focus(); // Return focus

        // Submit the appropriate form
        if (mainSearchForm && document.body.contains(mainSearchForm)) { // Check if form is on the current page
            mainSearchForm.requestSubmit();
        } else if (resultsSearchForm && document.body.contains(resultsSearchForm)) {
            resultsSearchForm.requestSubmit();
        }
        // console.log(`Kliff Suggestion: Selected - "${suggestionText}"`);
    };

    const handleSearchInput = (event) => {
        const query = event.target.value;
        currentSearchQuery = query; // Update global query state (less critical for mock)
        // Debounce displaySuggestions to avoid excessive calls
        debounce(() => displaySuggestions(query), KLIFF_CONFIG.debounceDelay)();
    };
    
    // Attach input event listener to the correct search bar
    if (mainSearchBar) {
        mainSearchBar.addEventListener('input', handleSearchInput);
    } else if (resultsSearchBar) { // If on results page
        resultsSearchBar.addEventListener('input', (event) => {
             const query = event.target.value;
             // For results page, suggestions might be different or disabled
             // For this mock, we'll just log it or could implement a simpler suggestion list
             // console.log("Results page search bar input: ", query);
             // debounce(() => displaySuggestions(query), KLIFF_CONFIG.debounceDelay)(); // Can reuse if suggestions needed here
        });
    }


    // Keyboard navigation for suggestions
    const handleSuggestionKeyDown = (event) => {
        const items = suggestionsListbox.querySelectorAll('.suggestion-item');
        if (!items.length || !suggestionsListbox.classList.contains('visible')) return;

        let preventDefault = false;

        switch (event.key) {
            case 'ArrowDown':
                activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
                preventDefault = true;
                break;
            case 'ArrowUp':
                activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
                preventDefault = true;
                break;
            case 'Enter':
                if (activeSuggestionIndex > -1 && items[activeSuggestionIndex]) {
                    items[activeSuggestionIndex].click(); // Simulate click on selected item
                    preventDefault = true; 
                } else {
                    // Allow form submission if no suggestion is actively selected via keyboard
                    // but a suggestion might be partially typed matching the input value.
                    // If Enter is pressed and input has value, form should submit.
                    // This is handled by default form behavior if preventDefault is not called.
                }
                break;
            case 'Escape':
                suggestionsListbox.innerHTML = '';
                suggestionsListbox.classList.remove('visible');
                if (mainSearchBar) mainSearchBar.setAttribute('aria-expanded', 'false');
                activeSuggestionIndex = -1;
                preventDefault = true;
                break;
            default:
                return; // Do nothing for other keys
        }

        if (preventDefault) {
            event.preventDefault();
        }

        items.forEach((item, index) => {
            if (index === activeSuggestionIndex) {
                item.classList.add('selected-suggestion');
                item.setAttribute('aria-selected', 'true');
                if (mainSearchBar) mainSearchBar.setAttribute('aria-activedescendant', item.id);
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected-suggestion');
                item.setAttribute('aria-selected', 'false');
            }
        });
    };

    if (mainSearchBar) mainSearchBar.addEventListener('keydown', handleSuggestionKeyDown);
    // Add to resultsSearchBar if suggestions are implemented there too
    // if (resultsSearchBar) resultsSearchBar.addEventListener('keydown', handleSuggestionKeyDown);


    // Close suggestions when clicking outside
    document.addEventListener('click', (event) => {
        const targetElement = event.target;
        // Check if the click is outside the search form (which contains input and suggestions)
        const currentForm = mainSearchForm || resultsSearchForm; // Get the relevant form
        if (currentForm && !currentForm.contains(targetElement)) {
            if (suggestionsListbox && suggestionsListbox.classList.contains('visible')) {
                suggestionsListbox.innerHTML = '';
                suggestionsListbox.classList.remove('visible');
                if(mainSearchBar) mainSearchBar.setAttribute('aria-expanded', 'false');
                activeSuggestionIndex = -1;
            }
        }
    });


    // --- Search Form Submission ---
    const handleFormSubmit = (event) => {
        event.preventDefault(); // Prevent default GET submission
        const searchBarElement = event.target.elements.query; // 'query' is the name of search input
        const query = searchBarElement.value.trim();

        if (query) {
            // console.log(`Kliff Search: Submitting query - "${query}"`);
            // Navigate to results page (or update results if already on it)
            window.location.href = `results.html?q=${encodeURIComponent(query)}`;
        } else {
            // console.log("Kliff Search: Empty query submission attempted.");
            // Optionally shake the input or show a message
            if(searchBarElement) {
                searchBarElement.classList.add('input-error-shake');
                setTimeout(() => searchBarElement.classList.remove('input-error-shake'), 500);
            }
        }
    };

    if (mainSearchForm) mainSearchForm.addEventListener('submit', handleFormSubmit);
    if (resultsSearchForm) resultsSearchForm.addEventListener('submit', handleFormSubmit); // Same handler works


    // --- Voice Search (Experimental - Web Speech API) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false; // True for continuous listening
        recognition.lang = KLIFF_CONFIG.voiceSearchLang;
        recognition.interimResults = false; // True for interim (live) results
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            if(voiceStatusMsg) {
                voiceStatusMsg.textContent = "Kliff Auditory Matrix: Listening...";
                voiceStatusMsg.classList.add('active', 'listening');
                voiceStatusMsg.classList.remove('error');
            }
            // console.log("Voice recognition: Started.");
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            // console.log("Voice recognition: Result - ", transcript);
            const currentActiveBar = document.activeElement.closest('.search-form-control')?.querySelector('.search-field') || mainSearchBar || resultsSearchBar;
            if(currentActiveBar) currentActiveBar.value = transcript;
            
            if(voiceStatusMsg) {
                voiceStatusMsg.textContent = `Query captured: "${transcript}"`;
                setTimeout(() => {
                    if(voiceStatusMsg) voiceStatusMsg.classList.remove('active');
                }, 2000);
            }

            // Automatically submit the form after voice input
            const formToSubmit = document.activeElement.closest('form') || mainSearchForm || resultsSearchForm;
            if (formToSubmit && transcript) {
                formToSubmit.requestSubmit();
            }
        };

        recognition.onerror = (event) => {
            let errorMessage = "Voice recognition error.";
            if (event.error === 'no-speech') errorMessage = "No speech detected. Please try again.";
            else if (event.error === 'audio-capture') errorMessage = "Audio capture failed. Check microphone.";
            else if (event.error === 'not-allowed') errorMessage = "Microphone access denied. Please enable.";
            else errorMessage = `Error: ${event.error}`;
            
            if(voiceStatusMsg) {
                voiceStatusMsg.textContent = `Error: ${errorMessage}`;
                voiceStatusMsg.classList.add('active', 'error');
                voiceStatusMsg.classList.remove('listening');
            }
            // console.error("Voice recognition: Error - ", event.error);
        };

        recognition.onend = () => {
            if(voiceStatusMsg && !voiceStatusMsg.classList.contains('error') && voiceStatusMsg.textContent.includes("Listening")) {
                // If ended without error or result, clear listening message
                // voiceStatusMsg.classList.remove('active', 'listening');
            }
            // console.log("Voice recognition: Ended.");
        };

        const startVoiceSearch = () => {
            try {
                recognition.start();
            } catch (e) {
                if(voiceStatusMsg) {
                    voiceStatusMsg.textContent = "Error starting voice recognition. Another session active?";
                    voiceStatusMsg.classList.add('active', 'error');
                }
                // console.error("Error starting voice recognition: ", e);
            }
        };
        
        if (voiceSearchBtn) voiceSearchBtn.addEventListener('click', startVoiceSearch);
        if (voiceSearchBtnResults) voiceSearchBtnResults.addEventListener('click', startVoiceSearch);

    } else {
        if(voiceStatusMsg) voiceStatusMsg.textContent = "Voice search not supported by your browser.";
        if(voiceSearchBtn) voiceSearchBtn.disabled = true;
        if(voiceSearchBtnResults) voiceSearchBtnResults.disabled = true;
        // console.warn("Kliff Feature: Web Speech API not supported.");
    }

    /* script.js - Kliff Search Engine - Expanded Edition - PART 2 */
    if (resultsWrapper) { // Only execute if on the results page
        // console.log("Kliff Results Module: Initializing...");

        const urlParams = new URLSearchParams(window.location.search);
        const queryFromUrl = urlParams.get('q');
        currentSearchQuery = queryFromUrl ? decodeURIComponent(queryFromUrl) : "";

        if (currentSearchQuery) {
            if(resultsSearchBar) resultsSearchBar.value = currentSearchQuery;
            if(searchedQueryTermDisplay) searchedQueryTermDisplay.textContent = sanitizeHTML(currentSearchQuery);
            // console.log(`Kliff Results: Processing query - "${currentSearchQuery}"`);
            fetchAndDisplayResults(currentSearchQuery);
        } else {
            if(resultsInfoStatement) resultsInfoStatement.innerHTML = "No query detected in the cosmic winds. <a href='index.html'>Try a new search?</a>";
            if(searchResultsOutputArea) searchResultsOutputArea.innerHTML = `<p class="no-results-message">The void is silent. Please initiate a query sequence from the <a href="index.html">main Kliff portal</a>.</p>`;
            if(paginationControlsNav) paginationControlsNav.style.display = 'none';
            if(aiAnswerBoxPlaceholder) aiAnswerBoxPlaceholder.style.display = 'none';
            // console.log("Kliff Results: No query found in URL.");
        }
    } // End of resultsWrapper check

    /**
     * Fetches (simulated) and displays search results.
     * @param {string} query - The search query.
     */
    function fetchAndDisplayResults(query) {
        if (!searchResultsOutputArea) return;

        // Show skeleton loader
        searchResultsOutputArea.innerHTML = generateSkeletonLoaders(KLIFF_CONFIG.resultsPerPage);
        if (paginationControlsNav) paginationControlsNav.style.display = 'none'; // Hide pagination during load
        if (aiAnswerBoxPlaceholder) aiAnswerBoxPlaceholder.style.display = 'none'; // Hide AI box

        // Simulate API call
        simulateApiCall(() => {
            const lowerQuery = query.toLowerCase();
            // Basic mock search logic: try full match, then partial word match, then default
            let results = KLIFF_MOCK_DATA_STORE.searchResults[lowerQuery];
            if (!results) {
                const queryParts = lowerQuery.split(/\s+/).filter(term => term.length > 2); // filter short terms
                for (const part of queryParts) {
                    if (KLIFF_MOCK_DATA_STORE.searchResults[part]) {
                        results = KLIFF_MOCK_DATA_STORE.searchResults[part];
                        break;
                    }
                }
            }
            totalMockResults = results || KLIFF_MOCK_DATA_STORE.searchResults["default"];
            
            // Add query to default results if they are used
            if (!results) {
                 totalMockResults = totalMockResults.map(r => ({...r, title: r.title.replace("No Direct Match Found", `No Direct Match for "${sanitizeHTML(query)}"`)}))
            }


            currentPageNumber = 1; // Reset to first page for new search
            renderResultsPageDOM(query);
            updatePaginationControlsDOM();

            // (Mock) Display AI Answer Box if relevant data exists
            const aiSummaryData = KLIFF_MOCK_DATA_STORE.aiSummaries[lowerQuery];
            if (aiSummaryData && aiAnswerBoxPlaceholder) {
                displayAiAnswer(aiSummaryData);
            }
            // console.log(`Kliff Results: Displayed results for "${query}". Found ${totalMockResults.length} items.`);
        });
    }

    /**
     * Generates HTML for skeleton loaders.
     * @param {number} count - Number of skeletons to generate.
     * @returns {string} - HTML string for skeleton loaders.
     */
    function generateSkeletonLoaders(count) {
        let skeletonsHTML = '';
        for (let i = 0; i < count; i++) {
            skeletonsHTML += `
                <div class="result-item-skeleton" aria-hidden="true">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-url"></div>
                    <div class="skeleton-snippet-line"></div>
                    <div class="skeleton-snippet-line short"></div>
                    <div class="skeleton-snippet-line"></div>
                </div>
            `;
        }
        return skeletonsHTML;
    }

    /**
     * Renders the current page of results to the DOM.
     * @param {string} originalQuery - The original search query for highlighting.
     */
    function renderResultsPageDOM(originalQuery) {
        if (!searchResultsOutputArea) return;
        searchResultsOutputArea.innerHTML = ''; // Clear skeletons or previous results

        if (totalMockResults.length === 0) {
            searchResultsOutputArea.innerHTML = `<p class="no-results-message">The search for "<strong>${sanitizeHTML(originalQuery)}</strong>" yielded only cosmic silence. Try a different query?</p>`;
            if (paginationControlsNav) paginationControlsNav.style.display = 'none';
            return;
        }

        const startIndex = (currentPageNumber - 1) * KLIFF_CONFIG.resultsPerPage;
        const endIndex = startIndex + KLIFF_CONFIG.resultsPerPage;
        const paginatedResults = totalMockResults.slice(startIndex, endIndex);

        if (paginatedResults.length === 0 && currentPageNumber > 1) {
             // This case should ideally not happen if pagination logic is correct
             searchResultsOutputArea.innerHTML = `<p class="no-results-message">You've reached the edge of known mock data for this query.</p>`;
             return;
        }

        paginatedResults.forEach((result, index) => {
            const resultItem = document.createElement('article'); // Use article for semantic meaning
            resultItem.classList.add('result-item', 'js-reveal-on-load'); // Add class for JS animation
            resultItem.setAttribute('aria-labelledby', `result-title-${startIndex + index}`);
            resultItem.setAttribute('aria-describedby', `result-snippet-${startIndex + index} result-url-${startIndex + index}`);


            // Sanitize all parts of the result before injecting
            const title = sanitizeHTML(result.title);
            const url = sanitizeHTML(result.url);
            let snippet = sanitizeHTML(result.description || result.snippet); // Use description or snippet

            // Highlight query terms in snippet (more robust highlighting)
            if (originalQuery) {
                const queryTerms = originalQuery.toLowerCase().split(/\s+/).filter(term => term.length > 1);
                queryTerms.forEach(term => {
                    const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
                    snippet = snippet.replace(regex, '<strong class="highlight">$1</strong>');
                });
            }
            
            let metaHTML = '';
            if (result.type || result.date) {
                metaHTML += '<div class="result-item-meta">';
                if (result.type) metaHTML += `<span>Type: ${sanitizeHTML(result.type)}</span>`;
                if (result.date) metaHTML += `<span>Date: ${sanitizeHTML(result.date)}</span>`;
                metaHTML += '</div>';
            }


            resultItem.innerHTML = `
                <h3 class="result-item-title" id="result-title-${startIndex + index}">
                    <a href="${url.startsWith('http') ? url : `http://${url}`}" target="_blank" rel="noopener noreferrer">${title}</a>
                </h3>
                <p class="result-item-url" id="result-url-${startIndex + index}">${url}</p>
                <p class="result-item-snippet" id="result-snippet-${startIndex + index}">${snippet}</p>
                ${metaHTML}
            `;
            searchResultsOutputArea.appendChild(resultItem);

            // Stagger animation for result items
            setTimeout(() => {
                resultItem.classList.add('is-visible');
            }, index * KLIFF_CONFIG.staggerAnimationDelay);
        });
        
        // Update result count info (if statement exists)
        if (resultsInfoStatement && totalMockResults.length > 0) {
            const startNum = startIndex + 1;
            const endNum = Math.min(endIndex, totalMockResults.length);
            resultsInfoStatement.innerHTML = `Displaying ${startNum}-${endNum} of ${totalMockResults.length} cosmic echoes for: <strong id="searched-query-term">${sanitizeHTML(originalQuery)}</strong>`;
            // Re-assign the element after innerHTML change for future updates if any (though unlikely here)
            // searchedQueryTermDisplay = document.getElementById('searched-query-term');
        } else if (resultsInfoStatement) {
             resultsInfoStatement.innerHTML = `No echoes found for: <strong id="searched-query-term">${sanitizeHTML(originalQuery)}</strong>`;
        }

    }

    /**
     * Updates the pagination controls' state and text.
     */
    function updatePaginationControlsDOM() {
        if (!paginationControlsNav || totalMockResults.length === 0) {
            if (paginationControlsNav) paginationControlsNav.style.display = 'none';
            return;
        }

        const totalPages = Math.ceil(totalMockResults.length / KLIFF_CONFIG.resultsPerPage);

        if (totalPages <= 1) {
            paginationControlsNav.style.display = 'none';
            return;
        }

        paginationControlsNav.style.display = 'flex'; // Ensure it's visible
        if(paginationPageIndicator) paginationPageIndicator.innerHTML = `Sector <strong>${currentPageNumber}</strong> / Universe <strong>${totalPages}</strong>`;
        
        if(paginationPrevBtn) paginationPrevBtn.disabled = (currentPageNumber === 1);
        if(paginationNextBtn) paginationNextBtn.disabled = (currentPageNumber === totalPages);
    }

    // Event listeners for pagination buttons
    if (paginationPrevBtn) {
        paginationPrevBtn.addEventListener('click', () => {
            if (currentPageNumber > 1) {
                currentPageNumber--;
                renderResultsPageDOM(currentSearchQuery); // Pass original query
                updatePaginationControlsDOM();
                window.scrollTo({ top: resultsWrapper.offsetTop || 0, behavior: 'smooth' }); // Scroll to top of results area
                // console.log("Kliff Pagination: Moved to Previous - Page ", currentPageNumber);
            }
        });
    }
    if (paginationNextBtn) {
        paginationNextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(totalMockResults.length / KLIFF_CONFIG.resultsPerPage);
            if (currentPageNumber < totalPages) {
                currentPageNumber++;
                renderResultsPageDOM(currentSearchQuery); // Pass original query
                updatePaginationControlsDOM();
                window.scrollTo({ top: resultsWrapper.offsetTop || 0, behavior: 'smooth' });
                // console.log("Kliff Pagination: Moved to Next - Page ", currentPageNumber);
            }
        });
    }

    /**
     * Displays the (mock) AI answer box.
     * @param {object} aiData - Object containing summary and related queries.
     */
    function displayAiAnswer(aiData) {
        if (!aiAnswerBoxPlaceholder || !aiData) return;

        const summaryElement = aiAnswerBoxPlaceholder.querySelector('.ai-answer-content p');
        const relatedQueriesList = aiAnswerBoxPlaceholder.querySelector('.related-queries-placeholder ul');

        if (summaryElement) {
            summaryElement.innerHTML = aiData.summary; // Assumes summary HTML is safe (it's from mock data)
        }
        if (relatedQueriesList && aiData.relatedQueries && aiData.relatedQueries.length > 0) {
            relatedQueriesList.innerHTML = ''; // Clear previous
            aiData.relatedQueries.forEach(relatedQuery => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `results.html?q=${encodeURIComponent(relatedQuery)}`;
                a.textContent = sanitizeHTML(relatedQuery);
                li.appendChild(a);
                relatedQueriesList.appendChild(li);
            });
            aiAnswerBoxPlaceholder.querySelector('.related-queries-placeholder').style.display = 'block';
        } else if (relatedQueriesList) {
             aiAnswerBoxPlaceholder.querySelector('.related-queries-placeholder').style.display = 'none';
        }
        
        aiAnswerBoxPlaceholder.style.display = 'block'; // Make it visible
        // console.log("Kliff AI Module: Displayed AI Synopsis.");
    }


    // --- Final Initializations (Run once after everything is defined) ---
    initTheme(); // Initialize theme on page load for both pages

    // Add a class to body after a short delay for entry animations of elements
    // that are not dynamically loaded (like header/footer if they have .js-reveal-on-load)
    setTimeout(() => {
        document.querySelectorAll('.js-reveal-on-load:not(.result-item)').forEach(el => {
            el.classList.add('is-visible');
        });
    }, 100); // Short delay for elements present on initial load


    // --- End of DOMContentLoaded ---
    console.log("Kliff Systems: All modules initialized. Ready to probe the void.");
}); // This is the REAL end of DOMContentLoaded
