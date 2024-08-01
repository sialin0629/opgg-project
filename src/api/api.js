export async function fetchAccountData(gameName, tagline, apiKey) {
  const response = await axios.get(`https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagline}?api_key=${apiKey}`);
  return response.data;
}

export async function fetchSummonerData(puuid, apiKey) {
  const response = await axios.get(`https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${apiKey}`);
  return response.data;
}

export async function fetchLeagueData(id, apiKey) {
  const response = await axios.get(`https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}?api_key=${apiKey}`);
  return response.data;
}

export async function fetchMatchIds(puuid, apiKey) {
  const response = await axios.get(`https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${apiKey}`);
  return response.data;
}

export async function fetchMatchDetails(matchId, apiKey) {
  const response = await axios.get(`https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apiKey}`);
  return response.data;
}
