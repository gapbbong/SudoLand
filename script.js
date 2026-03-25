let countriesData = [];

const capitalKoMap = {
    "Seoul": "서울", "Tokyo": "도쿄", "Beijing": "베이징", "Washington, D.C.": "워싱턴 D.C.",
    "London": "런던", "Paris": "파리", "Berlin": "베를린", "Rome": "로마", "Madrid": "마드리드",
    "Moscow": "모스크바", "Ottawa": "오타와", "Brasília": "브라질리아", "Buenos Aires": "부에노스아이레스",
    "Canberra": "캔버라", "Wellington": "웰링턴", "New Delhi": "뉴델리", "Bangkok": "방콕",
    "Hanoi": "하노이", "Manila": "마닐라", "Jakarta": "자카르타", "Kuala Lumpur": "쿠알라룸푸르",
    "Singapore": "싱가포르", "Taipei": "타이베이", "Pyongyang": "평양", "Ankara": "앙카라",
    "Riyadh": "리야드", "Tehran": "테헤란", "Baghdad": "바그다드", "Jerusalem": "예루살렘",
    "Cairo": "카이로", "Pretoria": "프리토리아", "Cape Town": "케이프타운", "Abuja": "아부자",
    "Nairobi": "나이로비", "Mexico City": "멕시코시티", "Havana": "아바나", "Lima": "리마",
    "Bogotá": "보고타", "Santiago": "산티아고", "Vienna": "빈", "Bern": "베른",
    "Amsterdam": "암스테르담", "Brussels": "브뤼셀", "Stockholm": "스톡홀름", "Oslo": "오슬로",
    "Copenhagen": "코펜하겐", "Helsinki": "헬싱키", "Athens": "아테네", "Lisbon": "리스본",
    "Warsaw": "바르샤바", "Prague": "프라하", "Budapest": "부다페스트", "Kyiv": "키이우",
    "Minsk": "민스크", "Bucharest": "부쿠레슈티", "Sofia": "소피아", "Dublin": "더블린",
    "Reykjavík": "레이캬비크", "Islamabad": "이슬라마바드", "Kabul": "카불", "Kathmandu": "카트만두",
    "Dhaka": "다카", "Colombo": "콜롬보", "Ulaanbaatar": "울란바토르", "Tashkent": "타슈켄트",
    "Astana": "아스타나", "Phnom Penh": "프놈펜", "Vientiane": "비엔티안", "Naypyidaw": "네피도",
    "Damascus": "다마스쿠스", "Amman": "암만", "Beirut": "베이루트", "Abu Dhabi": "아부다비",
    "Doha": "도하", "Kuwait City": "쿠웨이트시티", "Caracas": "카라카스", "Quito": "키토",
    "Sucre": "수크레", "La Paz": "라파스", "Asunción": "아순시온", "Montevideo": "몬테비데오",
    "Rabat": "라바트", "Algiers": "알제", "Tunis": "튀니스", "Tripoli": "트리폴리",
    "Khartoum": "하르툼", "Addis Ababa": "아디스아바바", "Mogadishu": "모가디슈", "Dakar": "다카르",
    "Accra": "아크라", "Luanda": "루안다", "Maputo": "마푸투", "Harare": "하라레",
    "Antananarivo": "안타나나리보", "Suva": "수바", "Port Moresby": "포트모르즈비", "Apia": "아피아",
    "Tirana": "티라나", "Sarajevo": "사라예보", "Zagreb": "자그레브", "Belgrade": "베오그라드",
    "Bratislava": "브라티슬라바", "Ljubljana": "류블랴나", "Tallinn": "탈린", "Riga": "리가",
    "Vilnius": "빌뉴스", "Yerevan": "예레반", "Baku": "바쿠", "Tbilisi": "트빌리시",
    "Kigali": "키갈리", "Kampala": "캄팔라", "Monaco": "모나코", "Vatican City": "바티칸 시국",
    "San Marino": "산마리노", "Valletta": "발레타", "Nicosia": "니코시아"
};

function getCapitalName(capitalEn) {
    return capitalKoMap[capitalEn] || capitalEn;
}

const searchBtn = document.getElementById('searchBtn');
const countryInput = document.getElementById('countryInput');
const errorMessage = document.getElementById('errorMessage');
const quizSection = document.getElementById('quizSection');
const countryFlag = document.getElementById('countryFlag');
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
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,translations,flags');
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

    if (country.flags && country.flags.svg) {
        countryFlag.src = country.flags.svg;
        countryFlag.style.display = 'block';
    } else {
        countryFlag.style.display = 'none';
    }

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
        btn.textContent = getCapitalName(capital);
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
        if (btn.textContent === getCapitalName(correctCapital)) {
            btn.classList.add('correct');
        } else if (btn === selectedBtn && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    if (isCorrect) {
        resultMessage.textContent = '🎉 정답입니다!';
        resultMessage.className = 'result-message success';
    } else {
        resultMessage.textContent = `❌ 오답입니다! 정답은 '${getCapitalName(correctCapital)}'입니다.`;
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
