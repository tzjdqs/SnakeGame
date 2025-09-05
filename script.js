class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameStatusElement = document.getElementById('gameStatus');
        this.difficultySelector = document.getElementById('difficulty');
        
        // 游戏设置
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // 难度配置
        this.difficultySettings = {
            easy: { speed: 200, name: '简单' },
            medium: { speed: 150, name: '中等' },
            hard: { speed: 100, name: '困难' },
            expert: { speed: 70, name: '专家' }
        };
        this.currentDifficulty = 'medium';
        this.gameSpeed = this.difficultySettings[this.currentDifficulty].speed;
        
        // 游戏状态
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        
        // 蛇的初始状态
        this.snake = [
            {x: 10, y: 10}
        ];
        this.dx = 0;
        this.dy = 0;
        
        // 食物位置
        this.food = {
            x: 15,
            y: 15
        };
        
        this.init();
    }
    
    init() {
        this.updateHighScoreDisplay();
        this.updateGameStatus('按空格键开始游戏');
        this.setupEventListeners();
        this.generateFood();
        this.draw();
    }
    
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // 按钮控制
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // 难度选择器事件
        this.difficultySelector.addEventListener('change', (e) => {
            this.changeDifficulty(e.target.value);
        });
    }
    
    handleKeyPress(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            if (!this.gameRunning) {
                this.startGame();
            } else {
                this.togglePause();
            }
            return;
        }
        
        if (!this.gameRunning || this.gamePaused) return;
        
        // 防止蛇反向移动
        switch(e.code) {
            case 'ArrowUp':
            case 'KeyW':
                if (this.dy !== 1) {
                    this.dx = 0;
                    this.dy = -1;
                }
                break;
            case 'ArrowDown':
            case 'KeyS':
                if (this.dy !== -1) {
                    this.dx = 0;
                    this.dy = 1;
                }
                break;
            case 'ArrowLeft':
            case 'KeyA':
                if (this.dx !== 1) {
                    this.dx = -1;
                    this.dy = 0;
                }
                break;
            case 'ArrowRight':
            case 'KeyD':
                if (this.dx !== -1) {
                    this.dx = 1;
                    this.dy = 0;
                }
                break;
        }
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gamePaused = false;
        this.dx = 1;
        this.dy = 0;
        const difficultyName = this.difficultySettings[this.currentDifficulty].name;
        this.updateGameStatus(`游戏进行中 - 难度: ${difficultyName}`);
        this.gameLoop();
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        const difficultyName = this.difficultySettings[this.currentDifficulty].name;
        if (this.gamePaused) {
            this.updateGameStatus(`游戏已暂停 - 难度: ${difficultyName}`);
        } else {
            this.updateGameStatus(`游戏进行中 - 难度: ${difficultyName}`);
            this.gameLoop();
        }
    }
    
    restartGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.snake = [{x: 10, y: 10}];
        this.dx = 0;
        this.dy = 0;
        this.updateScore();
        this.generateFood();
        this.updateGameStatus('按空格键开始游戏');
        this.draw();
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        setTimeout(() => {
            this.update();
            this.draw();
            
            if (this.gameRunning && !this.gamePaused) {
                this.gameLoop();
            }
        }, this.gameSpeed);
    }
    
    changeDifficulty(difficulty) {
        if (this.gameRunning) {
            this.updateGameStatus('请先停止游戏再更改难度');
            this.difficultySelector.value = this.currentDifficulty;
            return;
        }
        
        this.currentDifficulty = difficulty;
        this.gameSpeed = this.difficultySettings[difficulty].speed;
        const difficultyName = this.difficultySettings[difficulty].name;
        this.updateGameStatus(`难度已设置为: ${difficultyName}`);
        
        setTimeout(() => {
            if (!this.gameRunning) {
                this.updateGameStatus('按空格键开始游戏');
            }
        }, 2000);
    }
    
    update() {
        // 移动蛇头
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // 检查碰撞
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
            this.addScoreAnimation();
        } else {
            this.snake.pop();
        }
    }
    
    checkCollision(head) {
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            return true;
        }
        
        // 检查自身碰撞
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                return true;
            }
        }
        
        return false;
    }
    
    generateFood() {
        do {
            this.food.x = Math.floor(Math.random() * this.tileCount);
            this.food.y = Math.floor(Math.random() * this.tileCount);
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格
        this.drawGrid();
        
        // 绘制蛇
        this.drawSnake();
        
        // 绘制食物
        this.drawFood();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#4a5568';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头
                this.ctx.fillStyle = '#48bb78';
            } else {
                // 蛇身
                this.ctx.fillStyle = '#68d391';
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            
            // 添加渐变效果
            if (index === 0) {
                this.ctx.fillStyle = '#38a169';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 3,
                    segment.y * this.gridSize + 3,
                    this.gridSize - 6,
                    this.gridSize - 6
                );
            }
        });
    }
    
    drawFood() {
        // 绘制食物（红色圆形）
        this.ctx.fillStyle = '#f56565';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // 添加高光效果
        this.ctx.fillStyle = '#fc8181';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2 - 3,
            this.food.y * this.gridSize + this.gridSize / 2 - 3,
            3,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScoreDisplay();
        }
    }
    
    updateHighScoreDisplay() {
        this.highScoreElement.textContent = this.highScore;
    }
    
    updateGameStatus(status) {
        this.gameStatusElement.textContent = status;
    }
    
    addScoreAnimation() {
        this.scoreElement.parentElement.classList.add('score-increase');
        setTimeout(() => {
            this.scoreElement.parentElement.classList.remove('score-increase');
        }, 300);
    }
    
    gameOver() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.updateGameStatus('游戏结束！按空格键重新开始');
        
        // 添加游戏结束动画
        this.canvas.classList.add('game-over');
        setTimeout(() => {
            this.canvas.classList.remove('game-over');
        }, 500);
    }
}

// 初始化游戏
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new SnakeGame();
});