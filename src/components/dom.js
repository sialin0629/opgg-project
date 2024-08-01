import { fetchMatchDetails } from '../api/api.js';
import { formatTime, formatDuration, getQueueType } from '../helpers/utils.js';

let totalWins = 0;
let totalLosses = 0;

const RANK_IMAGE_URL = "https://opgg-static.akamaized.net/images/medals_new";
const ITEM_IMAGE_URL = "https://deeplol-ddragon-cdn.deeplol.gg/cdn/14.14.1/img/item";
const CHAMPION_IMAGE_URL = "https://www.deeplol.gg/images/swarm";
const SPELL_IMAGE_URL = "https://cdn.lol.ps/assets/img/spells";
const RUNE_IMAGE_URL = "https://opgg-static.akamaized.net/meta/images/lol/14.14.1/perk";
const RUNE_STYLE_URL = "https://opgg-static.akamaized.net/meta/images/lol/14.14.1/perkStyle";
const GAME_MODE_ICON_URL = "https://s-lol-web.op.gg/images/icon/icon-position-adc.svg";
const CHAMPION_ICON_URL = "https://opgg-static.akamaized.net/meta/images/lol/14.14.1/champion";

// 랭크 데이터 요소를 생성하는 함수
function createRankDataElement(rankData) {
  const rankDataElement = document.createElement("div");
  rankDataElement.id = "rank_data";
  rankDataElement.innerHTML = `
    <hr>
    <div id="rank_detail_data">
      <img src="${RANK_IMAGE_URL}/${rankData.tier.toLowerCase()}.png?image=q_auto,f_webp,w_144&v=1721451321478" alt="솔랭티어" id="rank_image">
      <div id="tier_name">
        <h4>${rankData.tier} ${rankData.rank}</h4>
        <p><span>${rankData.leaguePoints}</span> LP</p>
      </div>
      <div id="rank_num_data">
        <p><span class="win">${rankData.wins}</span>승 <span class="lose">${rankData.losses}</span>패</p>
        <p>승률 <span class="rate">${((rankData.wins / (rankData.wins + rankData.losses)) * 100).toFixed(1)}</span>%</p>
      </div>
    </div>
  `;
  return rankDataElement;
}

// 이전 랭크 데이터를 제거하는 함수
function removeOldRankData(rankElement) {
  const oldRankDataElement = rankElement.querySelector("#rank_data");
  if (oldRankDataElement) {
    rankElement.removeChild(oldRankDataElement);
  }
}

// 랭크 데이터를 업데이트하는 함수
export function updateRankData(rankElementId, rankData) {
  const rankElement = document.querySelector(`#${rankElementId}`);
  const rankNameElement = rankElement.querySelector("#rank_name");

  removeOldRankData(rankElement);

  if (rankData) {
    rankElement.appendChild(createRankDataElement(rankData));

    const unrankedElement = rankNameElement.querySelector(".unranked");
    if (unrankedElement) {
      rankNameElement.removeChild(unrankedElement);
    }
  } else {
    if (!rankNameElement.querySelector(".unranked")) {
      const unranked = document.createElement("h5");
      unranked.classList.add("unranked");
      unranked.textContent = "Unranked";
      rankNameElement.appendChild(unranked);

      removeOldRankData(rankElement);
    }
  }
}

// STRAWBERRY 게임 모드의 HTML을 생성하는 함수
function createStrawberryGameElement(matchDetails, participant, win, gameEndTime, gameDuration) {
  const Win_or_lose = win ? "승리" : "패배";
  const items = [participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5];

  return `
    <div class="simple_data">
      <h5 class="mod_${win ? "win" : "lose"}">집중포화</h5>
      <p class="time">${gameEndTime}</p>
      <hr>
      <p class="result">${Win_or_lose}</p>
      <p class="playtime">${gameDuration}</p>
    </div>
    <div class="champion">
      <div class="game_data">
        <img src="${CHAMPION_IMAGE_URL}/${participant.championId}.png" class="champion_icon" alt="champion">
        <div class="champion_level">${participant.champLevel}</div>
        <div class="score">
          <p>피해량</p>
          <p>${participant.totalDamageDealt}</p>
          <div class="bar-total">
            <div class="bar-value damage" id="totalDamage_${matchDetails.info.gameId}"></div>
            <div class="bar-value total"></div>
          </div>
        </div>
      </div>
      <div class="item">
        ${items.map((item, index) => 
          `<div><img src="${ITEM_IMAGE_URL}/${item}.png?w=56&h=56&f=webp" class="item${index + 1}" onerror="this.style.display='none'"></div>`
        ).join('')}
      </div>
    </div>
    <div class="score2">
      <p>Gold <span class="gold">${participant.goldEarned}</span></p>
      <p>CS <span class="cs">${participant.totalMinionsKilled + participant.totalAllyJungleMinionsKilled + participant.totalEnemyJungleMinionsKilled}</span></p>
    </div>
    <div class="users">
      <div class="team1">
        ${matchDetails.info.participants.slice(0, 2).map((p, i) =>
          `<p class="user${i + 1}">${p.riotIdGameName}</p>`
        ).join('')}
      </div>
      <div class="team2">
        ${matchDetails.info.participants.slice(2, 4).map((p, i) =>
          `<p class="user${i + 1}">${p.riotIdGameName}</p>`
        ).join('')}
      </div>
    </div>`;
}

// 일반 게임 모드의 HTML을 생성하는 함수
function createRegularGameElement(matchDetails, participant, win, queueType, gameEndTime, gameDuration) {
  const Win_or_lose = win ? "승리" : "패배";

  return `
    <div class="simple_data">
      <h5 class="mod_${win ? "win" : "lose"}">${queueType}</h5>
      <p class="time">${gameEndTime}</p>
      <hr>
      <p class="result">${Win_or_lose}</p>
      <p class="playtime">${gameDuration}</p>
    </div>
    <div class="champion">
      <div class="game_data">
        <img src="${CHAMPION_ICON_URL}/${participant.championName}.png" class="champion_icon" alt="champion">
        <div class="champion_level">${participant.champLevel}</div>
        <img src="${GAME_MODE_ICON_URL}" class="champion_position" alt="">
        <div class="spell">
          <div class="spell_div spell1">
            <img src="${SPELL_IMAGE_URL}/${participant.summoner1Id}_40.webp" class="d_spell" alt="">
          </div>
          <div class="spell_div spell2">
            <img src="${SPELL_IMAGE_URL}/${participant.summoner2Id}_40.webp" class="f_spell" alt="">
          </div>
        </div>
        <div class="rune">
          <div class="rune_div rune_1">
            <img src="${RUNE_IMAGE_URL}/${participant.perks.styles[0].selections[0].perk}.png" class="rune1" alt="">
          </div>
          <div class="rune_div rune_2">
            <img src="${RUNE_STYLE_URL}/${participant.perks.styles[1].style}.png" class="rune2" alt="">
          </div>
        </div>
        <div class="score1">
          <p class="kda_area1"><span class="kill">${participant.kills}</span>/<span class="death">${participant.deaths}</span>/<span class="assist">${participant.assists}</span></p>
          <p class="kda_area2"><span class="kda">${(participant.deaths > 0 ? (participant.kills + participant.assists) / participant.deaths : participant.kills + participant.assists).toFixed(2)}:1</span> KDA</p>
        </div>
      </div>
      <div class="item">
        ${[participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5, participant.item6].map((item, index) =>
          `<div><img src="${ITEM_IMAGE_URL}/${item}.png" class="item${index + 1}" onerror="this.style.display='none'"></div>`
        ).join('')}
      </div>
    </div>
    <div class="score2">
      <p>Gold <span class="gold">${participant.goldEarned}</span></p>
      <p>CS <span class="cs">${participant.totalMinionsKilled + participant.totalAllyJungleMinionsKilled + participant.totalEnemyJungleMinionsKilled}</span></p>
      <p>분당 <span class="cs">${((participant.totalMinionsKilled + participant.totalAllyJungleMinionsKilled + participant.totalEnemyJungleMinionsKilled) / (matchDetails.info.gameDuration / 60)).toFixed(1)}</span></p>
      <p class="multikill">${participant.pentaKills >= 1 ? "펜타킬" : participant.quadraKills >= 1 ? "쿼드라킬" : participant.tripleKills >= 1 ? "트리플킬" : participant.doubleKills >= 1 ? "더블킬" : ""}</p>
    </div>
    <div class="users">
      <div class="team1">
        ${matchDetails.info.participants.slice(0, 5).map((p, i) =>
          `<p class="user${i + 1}">${p.riotIdGameName}</p>`
        ).join('')}
      </div>
      <div class="team2">
        ${matchDetails.info.participants.slice(5, 10).map((p, i) =>
          `<p class="user${i + 1}">${p.riotIdGameName}</p>`
        ).join('')}
      </div>
    </div>`;
}

// 게임 요소를 생성하는 함수
function createGameElement(matchDetails, participant, win, gameMode, gameEndTime, gameDuration, queueType) {
  const gameElement = document.createElement("div");
  gameElement.classList.add("game");
  gameElement.classList.add(win ? "victory" : "defeat");

  if (gameMode === "STRAWBERRY") {
    gameElement.innerHTML = createStrawberryGameElement(matchDetails, participant, win, gameEndTime, gameDuration);
  } else {
    gameElement.innerHTML = createRegularGameElement(matchDetails, participant, win, queueType, gameEndTime, gameDuration);
  }

  return gameElement;
}

// 매치 데이터를 업데이트하는 함수
export async function updateMatchData(matchId, puuid, apiKey) {
  try {
    const matchDetails = await fetchMatchDetails(matchId, apiKey);
    console.log(matchDetails);

    const participant = matchDetails.info.participants.find(p => p.puuid === puuid);

    if (participant) {
      const queueType = getQueueType(matchDetails.info.queueId);
      const gameMode = matchDetails.info.gameMode;
      const win = participant.win;

      const gameEndTime = formatTime(matchDetails.info.gameEndTimestamp);
      const gameDuration = formatDuration(matchDetails.info.gameDuration);

      const gameElement = createGameElement(matchDetails, participant, win, gameMode, gameEndTime, gameDuration, queueType);
      document.querySelector("#game20_menu").appendChild(gameElement);

      if (gameMode === "STRAWBERRY") {
        const damageTotals = matchDetails.info.participants.map(p => p.totalDamageDealt);
        const maxDamage = Math.max(...damageTotals);
        const participantDamage = participant.totalDamageDealt;

        const totalDamageElement = document.querySelector(`#totalDamage_${matchDetails.info.gameId}`);

        if (totalDamageElement) {
          totalDamageElement.style.width = (participantDamage / maxDamage) * 100 + '%';
        }
      }

      if (win) {
        totalWins++;
      } else {
        totalLosses++;
      }
    }
  } catch (error) {
    console.error("Error updating match data: ", error);
  }
}

// 전체 승패 기록을 표시하는 함수
export function displayTotalWinLoss() {
  const winElement = document.querySelector("#summary_menu #record h2 .win");
  const loseElement = document.querySelector("#summary_menu #record h2 .lose");

  if (winElement && loseElement) {
    winElement.textContent = totalWins;
    loseElement.textContent = totalLosses;
  }
}
