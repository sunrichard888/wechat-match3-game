// 微信表情消消乐 - 真实堆叠版
// 游戏规格：6x10布局，180张牌完全随机堆叠，不规则偏移显示，30%顶层反面，6格手牌区+2预留格，10分钟倒计时

class WeChatMatch3RealStacked {
    constructor() {
        this.boardCols = 6;
        this.boardRows = 10;
        this.totalPositions = this.boardCols * this.boardRows; // 60个位置
        this.totalCards = 180; // 60组 × 3张
        this.emojiTypes = 60;   // 60种不同的表情
        this.faceDownPercentage = 0.3; // 30%顶层反面
        this.handSize = 6;      // 手牌区主格子数
        this.timeLimit = 10 * 60; // 10分钟 = 600秒
        this.currentTime = this.timeLimit;
        this.timer = null;
        this.isPaused = false;
        this.score = 0;
        this.gameActive = true;
        
        // 微信表情包Unicode映射（60种）
        this.emojis = [
            '😀', '😂', '😍', '🥰', '😎', '🤩', '🥳', '😭', '😡', '🤯',
            '🥶', '😱', '👻', '🐶', '🐱', '🐼', '🦁', '🐯', '🦊', '🐻',
            '🐨', '🐵', '🐔', '🐧', '🦄', '🐝', '🦋', '🐌', '🐢', '🐠',
            '🐙', '🦀', '🦞', '🦐', '🦑', '🌍', '🌙', '☀️', '⭐', '🌟',
            '✨', '🔥', '💧', '❄️', '🌈', '🎨', '🎵', '🎶', '🎮', '🎲',
            '🎯', '🏀', '⚽', '🎾', '🎱', '🚗', '✈️', '🚀', '🛸', '🏠'
        ];
        
        this.board = []; // 6x10的二维数组，每个元素是一个牌堆数组
        this.hand = Array(this.handSize).fill(null);
        this.positionOffsets = {}; // 存储每个位置的偏移配置
        this.initGame();
    }
    
    initGame() {
        this.createBoard();
        this.generatePositionOffsets();
        this.renderBoard();
        this.renderHandArea();
        this.updateStats();
        this.startTimer();
        this.bindEvents();
        this.gameActive = true;
    }
    
    createBoard() {
        // 创建180张牌：60种表情，每种3张
        let cards = [];
        for (let i = 0; i < this.emojiTypes; i++) {
            for (let j = 0; j < 3; j++) {
                cards.push({
                    emoji: this.emojis[i],
                    faceUp: true, // 先全部设为正面
                    matched: false
                });
            }
        }
        
        // 随机打乱所有牌
        this.shuffleArray(cards);
        
        // 完全随机分配到60个位置（每个位置至少1张，最多可能很多张）
        this.board = [];
        for (let row = 0; row < this.boardRows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardCols; col++) {
                this.board[row][col] = []; // 初始化为空堆栈
            }
        }
        
        // 随机分配所有180张牌到60个位置
        for (let i = 0; i < this.totalCards; i++) {
            const randomRow = Math.floor(Math.random() * this.boardRows);
            const randomCol = Math.floor(Math.random() * this.boardCols);
            this.board[randomRow][randomCol].push(cards[i]);
        }
        
        // 设置顶层牌的反面状态（30%概率）
        for (let row = 0; row < this.boardRows; row++) {
            for (let col = 0; col < this.boardCols; col++) {
                if (this.board[row][col].length > 0) {
                    const topCard = this.board[row][col][this.board[row][col].length - 1];
                    if (Math.random() < this.faceDownPercentage) {
                        topCard.faceUp = false;
                    }
                }
            }
        }
    }
    
    generatePositionOffsets() {
        // 为每个位置生成随机偏移配置
        for (let row = 0; row < this.boardRows; row++) {
            for (let col = 0; col < this.boardCols; col++) {
                const positionKey = `${row}-${col}`;
                this.positionOffsets[positionKey] = {
                    baseX: Math.random() * 20 - 10, // -10到+10像素偏移
                    baseY: Math.random() * 20 - 10,
                    rotation: Math.random() * 10 - 5 // -5到+5度旋转
                };
            }
        }
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    renderBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < this.boardRows; row++) {
            for (let col = 0; col < this.boardCols; col++) {
                const positionElement = document.createElement('div');
                positionElement.className = 'card-position';
                positionElement.dataset.row = row;
                positionElement.dataset.col = col;
                
                const stack = this.board[row][col];
                const positionKey = `${row}-${col}`;
                const offsetConfig = this.positionOffsets[positionKey];
                
                if (stack.length === 0) {
                    // 空位置显示✓
                    const emptyElement = document.createElement('div');
                    emptyElement.className = 'empty-position';
                    positionElement.appendChild(emptyElement);
                } else {
                    // 渲染整个牌堆（从底到顶）
                    for (let i = 0; i < stack.length; i++) {
                        const card = stack[i];
                        const cardElement = document.createElement('div');
                        cardElement.className = `card-stack ${card.faceUp ? 'face-up' : 'face-down'}`;
                        
                        // 计算偏移量：底层牌偏移大，顶层牌偏移小
                        const depthFactor = (stack.length - i - 1) / Math.max(stack.length - 1, 1);
                        const offsetX = offsetConfig.baseX * depthFactor;
                        const offsetY = offsetConfig.baseY * depthFactor;
                        const opacity = 0.7 + 0.3 * (i / (stack.length - 1 || 1)); // 底层透明度低
                        
                        cardElement.style.left = `${40 + offsetX}px`;
                        cardElement.style.top = `${20 + offsetY}px`;
                        cardElement.style.opacity = opacity;
                        cardElement.style.transform = `rotate(${offsetConfig.rotation * depthFactor}deg)`;
                        cardElement.style.zIndex = i;
                        
                        if (card.faceUp) {
                            cardElement.textContent = card.emoji;
                        }
                        
                        // 只有顶层牌可以点击
                        if (i === stack.length - 1) {
                            cardElement.addEventListener('click', () => this.handleCardClick(row, col));
                            cardElement.style.cursor = 'pointer';
                        } else {
                            cardElement.style.pointerEvents = 'none'; // 下层牌不可点击
                        }
                        
                        positionElement.appendChild(cardElement);
                    }
                }
                
                gameBoard.appendChild(positionElement);
            }
        }
    }
    
    renderHandArea() {
        const handSlots = document.getElementById('handSlots');
        handSlots.innerHTML = '';
        
        for (let i = 0; i < this.handSize; i++) {
            const slotElement = document.createElement('div');
            slotElement.className = `hand-slot ${this.hand[i] ? 'filled' : ''}`;
            
            if (this.hand[i]) {
                slotElement.textContent = this.hand[i].emoji;
            }
            
            handSlots.appendChild(slotElement);
        }
    }
    
    bindEvents() {
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
    }
    
    handleCardClick(row, col) {
        if (!this.gameActive || this.isPaused) return;
        
        const stack = this.board[row][col];
        if (stack.length === 0) return;
        
        // 检查手牌区是否已满
        if (this.isHandFull()) {
            this.gameOver('手牌区已满！');
            return;
        }
        
        // 获取顶层牌
        const topCard = stack.pop();
        
        // 翻牌并移动到手牌区
        topCard.faceUp = true;
        this.addToHand(topCard);
        
        // 如果下面还有牌，设置新顶层牌的可见性
        if (stack.length > 0) {
            const newTopCard = stack[stack.length - 1];
            // 新露出的牌有30%概率是反面
            if (Math.random() < this.faceDownPercentage) {
                newTopCard.faceUp = false;
            }
        }
        
        // 重新渲染
        this.renderBoard();
        this.renderHandArea();
        this.updateStats();
        
        // 检查手牌区是否有3张相同的
        this.checkHandForMatches();
    }
    
    isHandFull() {
        return this.hand.every(slot => slot !== null);
    }
    
    addToHand(card) {
        // 找到第一个空位
        for (let i = 0; i < this.handSize; i++) {
            if (this.hand[i] === null) {
                this.hand[i] = { ...card }; // 复制卡片信息
                break;
            }
        }
    }
    
    checkHandForMatches() {
        // 统计手牌区中每种表情的数量
        const emojiCount = {};
        const emojiPositions = {};
        
        for (let i = 0; i < this.handSize; i++) {
            if (this.hand[i]) {
                const emoji = this.hand[i].emoji;
                emojiCount[emoji] = (emojiCount[emoji] || 0) + 1;
                if (!emojiPositions[emoji]) {
                    emojiPositions[emoji] = [];
                }
                emojiPositions[emoji].push(i);
            }
        }
        
        // 检查是否有3张相同的
        let foundMatch = false;
        for (const emoji in emojiCount) {
            if (emojiCount[emoji] >= 3) {
                // 消除前3张
                const positions = emojiPositions[emoji].slice(0, 3);
                this.removeCardsFromHand(positions);
                this.score += 100;
                foundMatch = true;
                break; // 一次只处理一组
            }
        }
        
        if (foundMatch) {
            // 重新检查（可能有连锁反应）
            setTimeout(() => this.checkHandForMatches(), 100);
        }
        
        this.updateStats();
        this.checkWin();
    }
    
    removeCardsFromHand(positions) {
        // 按位置从大到小排序，避免索引错位
        positions.sort((a, b) => b - a);
        for (const pos of positions) {
            this.hand[pos] = null;
        }
    }
    
    updateStats() {
        document.getElementById('score').textContent = this.score;
        
        // 计算剩余牌数
        let remaining = 0;
        for (let row = 0; row < this.boardRows; row++) {
            for (let col = 0; col < this.boardCols; col++) {
                remaining += this.board[row][col].length;
            }
        }
        document.getElementById('remaining').textContent = remaining;
    }
    
    startTimer() {
        this.currentTime = this.timeLimit;
        this.updateTimerDisplay();
        
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            if (!this.isPaused && this.gameActive) {
                this.currentTime--;
                this.updateTimerDisplay();
                
                if (this.currentTime <= 0) {
                    this.gameOver('时间到！');
                }
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const timerElement = document.getElementById('timer');
        
        timerElement.textContent = timeStr;
        
        // 时间警告
        if (this.currentTime <= 60) {
            timerElement.className = 'timer-critical';
        } else if (this.currentTime <= 180) {
            timerElement.className = 'timer-warning';
        } else {
            timerElement.className = '';
        }
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
        
        if (!this.isPaused) {
            // 恢复游戏时检查是否应该结束
            if (this.currentTime <= 0) {
                this.gameOver('时间到！');
            }
        }
    }
    
    checkWin() {
        // 检查所有位置是否都为空
        let allEmpty = true;
        for (let row = 0; row < this.boardRows; row++) {
            for (let col = 0; col < this.boardCols; col++) {
                if (this.board[row][col].length > 0) {
                    allEmpty = false;
                    break;
                }
            }
            if (!allEmpty) break;
        }
        
        if (allEmpty) {
            this.winGame();
        }
    }
    
    winGame() {
        this.gameActive = false;
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        document.getElementById('finalScoreWin').textContent = this.score;
        document.getElementById('finalTimeWin').textContent = 
            document.getElementById('timer').textContent;
        document.getElementById('winMessage').style.display = 'block';
    }
    
    gameOver(reason) {
        this.gameActive = false;
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        document.getElementById('loseReason').textContent = reason;
        document.getElementById('finalScoreLose').textContent = this.score;
        document.getElementById('loseMessage').style.display = 'block';
    }
    
    newGame() {
        this.gameActive = false;
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        document.getElementById('winMessage').style.display = 'none';
        document.getElementById('loseMessage').style.display = 'none';
        
        this.score = 0;
        this.hand = Array(this.handSize).fill(null);
        this.initGame();
    }
}

// 全局函数
let game;

function initGame() {
    game = new WeChatMatch3RealStacked();
}

function closeWinMessage() {
    document.getElementById('winMessage').style.display = 'none';
}

function closeLoseMessage() {
    document.getElementById('loseMessage').style.display = 'none';
    game.newGame();
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', initGame);