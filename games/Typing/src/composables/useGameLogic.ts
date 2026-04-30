import { ref, computed, onUnmounted } from 'vue';
import type { GameState, Letter, LevelConfig } from '../types/game';
import { LEVEL_CONFIG } from '../config/levelConfig';

export function useGameLogic() {
  const gameState = ref<GameState>('START');
  const letters = ref<Letter[]>([]);
  const score = ref(0);
  const combo = ref(0);
  const hp = ref(100);
  const currentLevelIndex = ref(0);
  
  const currentLevelConfig = computed<LevelConfig>(() => LEVEL_CONFIG[currentLevelIndex.value]);
  
  // Game loop variables
  let animationFrameId: number | null = null;
  let lastSpawnTime = 0;
  let lastFrameTime = 0;
  let recentChars: string[] = [];
  const activeLevelChars = ref<string>('');
  
  // Assuming a static board size for coordinate generation, could be made dynamic
  const boardHeight = 600; 
  const boardWidth = 800;

  const initLevelChars = () => {
    const config = currentLevelConfig.value;
    if (config.charSubsetRange) {
      const [min, max] = config.charSubsetRange;
      const count = Math.floor(Math.random() * (max - min + 1)) + min;
      let chars = config.allowedChars.split('');
      for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
      }
      activeLevelChars.value = chars.slice(0, count).join('');
    } else {
      activeLevelChars.value = config.allowedChars;
    }
  };

  const resetGame = () => {
    score.value = 0;
    combo.value = 0;
    hp.value = 100;
    currentLevelIndex.value = 0;
    letters.value = [];
    recentChars = [];
    gameState.value = 'PLAYING';
    initLevelChars();
    startGameLoop();
  };

  const spawnLetter = (timestamp: number) => {
    const config = currentLevelConfig.value;
    if (timestamp - lastSpawnTime > config.spawnRate) {
      const chars = activeLevelChars.value;
      let randomChar = chars[Math.floor(Math.random() * chars.length)];
      
      // 避免重複：如果抽到的字母在最近生成的名單中，就重新抽 (最多重試 5 次)
      let attempts = 0;
      while (recentChars.includes(randomChar) && attempts < 5) {
        randomChar = chars[Math.floor(Math.random() * chars.length)];
        attempts++;
      }
      
      // 更新最近生成的字母記錄 (動態依據允許的字母數量來決定記憶長度)
      recentChars.push(randomChar);
      const maxHistory = Math.max(1, Math.floor(chars.length / 3));
      if (recentChars.length > maxHistory) {
        recentChars.shift();
      }
      const newLetter: Letter = {
        id: `${Date.now()}-${Math.random()}`,
        char: randomChar,
        x: Math.random() * (boardWidth - 80) + 40, // 避免太靠邊緣
        y: -50, // 從畫面上方開始掉落
        speed: config.baseSpeed,
        isSpecial: config.wobble,
        isObscured: config.obscured
      };
      letters.value.push(newLetter);
      lastSpawnTime = timestamp;
    }
  };

  const updatePositions = () => {
    const activeLetters: Letter[] = [];
    
    for (const letter of letters.value) {
      letter.y += letter.speed;
      
      // L3 混亂關卡的左右晃動效果
      if (letter.isSpecial) {
         letter.x += Math.sin(letter.y * 0.05) * 2;
      }

      if (letter.y >= boardHeight) {
        // 漏接 (Miss)
        hp.value = Math.max(0, hp.value - 10);
        combo.value = 0; // 中斷 Combo
        if (hp.value <= 0) {
          gameState.value = 'GAME_OVER';
        }
      } else {
        activeLetters.push(letter);
      }
    }
    
    letters.value = activeLetters;
  };

  const checkLevelUp = () => {
    if (gameState.value !== 'PLAYING') return;
    const config = currentLevelConfig.value;
    
    if (score.value >= config.targetScore) {
      if (currentLevelIndex.value < LEVEL_CONFIG.length - 1) {
        gameState.value = 'LEVEL_UP';
        stopGameLoop();
        
        // 中場休息 2 秒後自動進入下一關
        setTimeout(() => {
           currentLevelIndex.value++;
           gameState.value = 'PLAYING';
           initLevelChars();
           startGameLoop();
        }, 2000); 
      } else {
        // 遊戲通關
        gameState.value = 'GAME_OVER';
        stopGameLoop();
      }
    }
  };

  const gameLoop = (timestamp: number) => {
    if (gameState.value !== 'PLAYING') return;
    
    if (!lastFrameTime) lastFrameTime = timestamp;
    if (!lastSpawnTime) lastSpawnTime = timestamp;

    spawnLetter(timestamp);
    updatePositions();
    checkLevelUp();

    lastFrameTime = timestamp;
    animationFrameId = requestAnimationFrame(gameLoop);
  };

  const startGameLoop = () => {
    lastFrameTime = 0;
    lastSpawnTime = 0;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
  };

  const stopGameLoop = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (gameState.value !== 'PLAYING') return;
    
    // 避免處理 F5, F12 等功能鍵
    if (e.key.length > 1) return;
    
    const key = e.key.toUpperCase();
    
    // 尋找畫面中「最接近底部」且「符合字元」的字母
    const matchingLetters = letters.value.filter(l => l.char === key);
    
    if (matchingLetters.length > 0) {
      // 依 Y 座標降序排列，取最下方的
      matchingLetters.sort((a, b) => b.y - a.y);
      const target = matchingLetters[0];
      
      // 消除該字母
      letters.value = letters.value.filter(l => l.id !== target.id);
      
      // 增加分數與 Combo
      combo.value++;
      score.value += 10 + (combo.value * 2);
    } else {
      // 敲錯按鍵，中斷 Combo 並且扣 HP
      combo.value = 0;
      hp.value = Math.max(0, hp.value - 5);
      if (hp.value <= 0) {
        gameState.value = 'GAME_OVER';
        stopGameLoop();
      }
    }
  };

  // 組件卸載時清理
  onUnmounted(() => {
    stopGameLoop();
  });

  return {
    gameState,
    letters,
    score,
    combo,
    hp,
    currentLevelConfig,
    resetGame,
    startGameLoop,
    stopGameLoop,
    handleKeydown
  };
}
