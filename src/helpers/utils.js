
export function formatTime(milliseconds) {
  const now = new Date().getTime(); // 현재 시간 (밀리초 단위)
  const diff = now - milliseconds; // 현재 시간과 주어진 시간의 차이 계산

  if (diff < 0) {
    return "미래 시간입니다";
  }

  if (diff >= 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}일 전`;
  } else if (diff >= 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}시간 전`;
  } else if (diff >= 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}분 전`;
  } else {
    const seconds = Math.floor(diff / 1000);
    return `${seconds}초 전`;
  }
}

export function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}분 ${remainingSeconds}초`;
}

export function getQueueType(queueId) {
  const gameModeMapping = {
    420: '솔랭',
    440: '자유 랭크',
    450: '무작위 총력전',
    490: '빠른 대전',
  };
  return gameModeMapping[queueId] || 'Unknown';
}
