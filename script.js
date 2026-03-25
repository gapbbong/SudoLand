let countriesData = [];

const searchBtn = document.getElementById('searchBtn');
const countryInput = document.getElementById('countryInput');
const errorMessage = document.getElementById('errorMessage');
const quizSection = document.getElementById('quizSection');
const quizQuestion = document.getElementById('quizQuestion');
const optionsContainer = document.getElementById('optionsContainer');
const resultMessage = document.getElementById('resultMessage');
const suggestionsSection = document.getElementById('suggestionsSection');
const suggestionsContainer = document.getElementById('suggestionsContainer');
const loadingIndicator = document.getElementById('loadingIndicator');

// Load countries data from REST Countries API
async function fetchCountries() {
    loadingIndicator.classList.remove('hidden');
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,translations');
        const data = await response.json();
        // Filter out countries without capitals to ensure valid questions
        countriesData = data.filter(c => c.capital && c.capital.length > 0);
    } catch (error) {
        console.error('Error fetching countries:', error);
        errorMessage.textContent = '데이터를 불러오는 데 실패했습니다.';
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

fetchCountries();

searchBtn.addEventListener('click', handleSearch);
countryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

function handleSearch() {
    const query = countryInput.value.trim().toLowerCase();
    if (!query) {
        errorMessage.textContent = '나라 이름을 입력해주세요.';
        return;
    }

    errorMessage.textContent = '';
    
    // Find country by matching common name in English or Korean
    const found = countriesData.find(c => {
        const enName = c.name.common.toLowerCase();
        const koName = c.translations?.kor?.common?.toLowerCase() || '';
        const offKoName = c.translations?.kor?.official?.toLowerCase() || '';
        return enName === query || koName === query || offKoName === query || koName.includes(query) || enName.includes(query);
    });

    if (found) {
        startQuiz(found);
    } else {
        errorMessage.textContent = '해당 나라를 찾을 수 없습니다. (예: 대한민국, France)';
        quizSection.classList.add('hidden');
        suggestionsSection.classList.add('hidden');
    }
}

function startQuiz(country) {
    const countryName = country.translations?.kor?.common || country.name.common;
    const correctCapital = country.capital[0];

    quizQuestion.textContent = `Q. '${countryName}'의 수도는 어디일까요?`;
    
    // Generate 3 random wrong capitals
    let capitals = [correctCapital];
    while(capitals.length < 4) {
        const randomCountry = countriesData[Math.floor(Math.random() * countriesData.length)];
        const randomCapital = randomCountry.capital[0];
        // Ensure standard unique capitals
        if (!capitals.includes(randomCapital)) {
            capitals.push(randomCapital);
        }
    }

    // Shuffle options array using sort
    capitals.sort(() => Math.random() - 0.5);

    optionsContainer.innerHTML = '';
    capitals.forEach(capital => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = capital;
        btn.onclick = () => handleAnswer(btn, capital === correctCapital, correctCapital);
        optionsContainer.appendChild(btn);
    });

    resultMessage.textContent = '';
    resultMessage.className = 'result-message';
    
    quizSection.classList.remove('hidden');
    
    showSuggestions(countryName);
}

function handleAnswer(selectedBtn, isCorrect, correctCapital) {
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    
    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correctCapital) {
            btn.classList.add('correct');
        } else if (btn === selectedBtn && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    if (isCorrect) {
        resultMessage.textContent = '🎉 정답입니다!';
        resultMessage.className = 'result-message success';
    } else {
        resultMessage.textContent = `❌ 오답입니다! 정답은 '${correctCapital}'입니다.`;
        resultMessage.className = 'result-message fail';
    }
}

function showSuggestions(excludeName) {
    suggestionsContainer.innerHTML = '';
    let suggestions = [];
    
    // Pick 4 random countries for suggestions
    while(suggestions.length < 4) {
        const randomCountry = countriesData[Math.floor(Math.random() * countriesData.length)];
        const rNameKo = randomCountry.translations?.kor?.common;
        const rNameEn = randomCountry.name.common;
        const nameToShow = rNameKo || rNameEn;
        
        if (nameToShow !== excludeName && !suggestions.includes(nameToShow)) {
            suggestions.push(nameToShow);
        }
    }

    suggestions.forEach(name => {
        const pill = document.createElement('div');
        pill.className = 'suggestion-pill';
        pill.textContent = name;
        pill.onclick = () => {
            countryInput.value = name;
            handleSearch();
            // Scroll to the search bar for convenience on mobile
            countryInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        suggestionsContainer.appendChild(pill);
    });

    suggestionsSection.classList.remove('hidden');
}
