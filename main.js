import { fetchAccountData, fetchSummonerData, fetchLeagueData, fetchMatchIds, fetchMatchDetails } from '/src/api/api.js';
import { updateRankData, updateMatchData, displayTotalWinLoss } from '/src/components/dom.js';

const API_KEY = "RGAPI-d007b588-c1d6-43fe-9912-5653c0c7ba75";

let puuid, summoner_level, profile_icon, id;

// 중복된 코드 블록을 함수로 정의합니다.
async function fetchAndDisplayData(gameName, tagline) {
    try {
        // 기존 게임 데이터를 제거
        // const gameContainer = document.querySelector("#game20_menu");
        // while (gameContainer.firstChild) {
        //     gameContainer.removeChild(gameContainer.firstChild);
        // }
        
        // 1. ACCOUNT API 들어가기 : puuid
        const accountResponse = await fetchAccountData(gameName, tagline, API_KEY);
        puuid = accountResponse.puuid;
        document.querySelector("#nickname").textContent = accountResponse.gameName;
        document.querySelector("#tag").textContent = "#" + accountResponse.tagLine;

        // 2. SUMMONER API 들어가기 : 유저의 레벨, 프로필이미지, id
        const summonerResponse = await fetchSummonerData(puuid, API_KEY);
        summoner_level = summonerResponse.summonerLevel;
        profile_icon = summonerResponse.profileIconId;
        id = summonerResponse.id;

        document.querySelector("#player_level span").textContent = summoner_level;
        document.querySelector("#player_icon img").setAttribute("src", `https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon${profile_icon}.jpg`);

        // 3-1 LEAGUE API 들어가기 : 티어, 승패 등등의 전적
        const leagueResponse = await fetchLeagueData(id, API_KEY);
        const soloRankData = leagueResponse.find(data => data.queueType === 'RANKED_SOLO_5x5');
        const flexRankData = leagueResponse.find(data => data.queueType === 'RANKED_FLEX_SR');

        updateRankData("solo_rank", soloRankData);
        updateRankData("flex_rank", flexRankData);

        // 3-2. MATCH API 들어감 : puuid로 20개 게임 불러오기
        const match20Data = await fetchMatchIds(puuid, API_KEY);

        for (let matchId of match20Data) {
            await updateMatchData(matchId, puuid, API_KEY);
        }

        displayTotalWinLoss();
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}

// 페이지 로드 시 localStorage에서 데이터 가져오기
document.addEventListener('DOMContentLoaded', () => {
    const storedValue = localStorage.getItem('inputValue');
    if (storedValue) {
        const [gameName, tagline] = storedValue.split("#");
        fetchAndDisplayData(gameName, tagline);
    }
});

// 검색 버튼 클릭 시 데이터 가져오기
document.querySelector("#search_button").addEventListener("click", async function() {
    const name = document.querySelector(".search_name").value.split("#");
    const gameName = name[0];
    const tagline = name[1];

    // localStorage에 저장
    localStorage.setItem('inputValue', document.querySelector(".search_name").value);

    // 데이터 가져오기
    await fetchAndDisplayData(gameName, tagline);
});
