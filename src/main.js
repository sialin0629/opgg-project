import { fetchAccountData, fetchSummonerData, fetchLeagueData, fetchMatchIds, fetchMatchDetails } from './api/api.js';
import { updateRankData, updateMatchData, displayTotalWinLoss } from './components/dom.js';

let puuid, summoner_level, profile_icon, id;

// API 키를 서버로부터 가져오는 함수
async function fetchApiKey() {
    try {
        const response = await fetch('/api/config');
        const data = await response.json();
        return data.apiKey;
    } catch (error) {
        console.error("Error fetching API key: ", error);
        throw error;
    }
}

// 중복된 코드 블록을 함수로 정의합니다.
async function fetchAndDisplayData(gameName, tagline, apiKey) {
    try {
        // 기존 게임 데이터를 제거
        const gameContainer = document.querySelector("#game20_menu");
        while (gameContainer.firstChild) {
            gameContainer.removeChild(gameContainer.firstChild);
        }

        const accountResponse = await fetchAccountData(gameName, tagline, apiKey);
        puuid = accountResponse.puuid;
        document.querySelector("#nickname").textContent = accountResponse.gameName;
        document.querySelector("#tag").textContent = "#" + accountResponse.tagLine;

        const summonerResponse = await fetchSummonerData(puuid, apiKey);
        summoner_level = summonerResponse.summonerLevel;
        profile_icon = summonerResponse.profileIconId;
        id = summonerResponse.id;

        document.querySelector("#player_level span").textContent = summoner_level;
        document.querySelector("#player_icon img").setAttribute("src", `https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${profile_icon}.jpg`);

        const leagueResponse = await fetchLeagueData(id, apiKey);
        const soloRankData = leagueResponse.find(data => data.queueType === 'RANKED_SOLO_5x5');
        const flexRankData = leagueResponse.find(data => data.queueType === 'RANKED_FLEX_SR');

        updateRankData("solo_rank", soloRankData);
        updateRankData("flex_rank", flexRankData);

        const match20Data = await fetchMatchIds(puuid, apiKey);
        await Promise.all(match20Data.map(matchId => updateMatchData(matchId, puuid, apiKey)));

        displayTotalWinLoss();
    } catch (error) {
        console.error("Error fetching and displaying data:", error);
    }
}

// 페이지 로드 시 localStorage에서 데이터 가져오기
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const apiKey = await fetchApiKey();
        const storedValue = localStorage.getItem('inputValue');
        if (storedValue) {
            const [gameName, tagline] = storedValue.split("#");
            if (gameName && tagline) {
                fetchAndDisplayData(gameName, tagline, apiKey);
            } else {
                console.error("Invalid stored value format. Expected format: 'gameName#tagline'.");
            }
        }
    } catch (error) {
        console.error("Error during DOMContentLoaded:", error);
    }
});

// 검색 버튼 클릭 시 데이터 가져오기
document.querySelector("#search_button").addEventListener("click", async function() {
    try {
        const inputField = document.querySelector(".search_name").value;
        const [gameName, tagline] = inputField.split("#");

        if (gameName && tagline) {
            // localStorage에 저장
            localStorage.setItem('inputValue', inputField);

            // 환경 변수를 서버로부터 가져옴
            const apiKey = await fetchApiKey();

            // 데이터 가져오기
            await fetchAndDisplayData(gameName, tagline, apiKey);
        } else {
            console.error("Invalid input value format. Expected format: 'gameName#tagline'.");
        }
    } catch (error) {
        console.error("Error on search button click:", error);
    }
});
