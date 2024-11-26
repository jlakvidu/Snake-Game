const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let snakeSize = 10;
let snake = [{ x: 10, y: 10 }];
let food = generateFood();
let score = 0;
let gameInterval;
let barriers = []; 
const barrierCount = 5;
const barrierSpeed = 2; 

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

let bigFood = null; 
let bigFoodTimer = null; 
let bigFoodDuration = 5000; 
let foodEatenCount = 0; 
let gameOver = false;

function startGame() {
    gameOver = false;
    document.getElementById('startButton').disabled = true;
    score = 0;
    snake = [{ x: 10, y: 10 }];
    food = generateFood();
    barriers = []; // Reset barriers
    document.getElementById('scoreboard').innerText = `Score: ${score}`;
    gameInterval = setInterval(updateGame, 100);
    setInterval(generateRandomBarrier, 3000); 
}

function generateFood() {
    return {
        x: Math.floor(Math.random() * (canvas.width / snakeSize)) * snakeSize,
        y: Math.floor(Math.random() * (canvas.height / snakeSize)) * snakeSize
    };
}

function generateRandomBarrier() {
    const barrier = {
        x: Math.floor(Math.random() * (canvas.width / snakeSize)) * snakeSize,
        y: 0 
    };
    barriers.push(barrier);
}

function updateGame() {
    if (gameOver) return; 

    const head = { x: snake[0].x, y: snake[0].y };

    if (mouseX > head.x) head.x += snakeSize;
    if (mouseX < head.x) head.x -= snakeSize;
    if (mouseY > head.y) head.y += snakeSize;
    if (mouseY < head.y) head.y -= snakeSize;

    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        handleGameOver('Game Over! Your score: ' + score);
        return;
    }

    barriers.forEach((barrier, index) => {
        barrier.y += barrierSpeed; // Move barrier down
        if (barrier.y > canvas.height) {
            barriers.splice(index, 1);
        }
    });

    if (barriers.some(barrier => head.x === barrier.x && head.y === barrier.y)) {
        handleGameOver('Game Over! You hit a barrier! Your score: ' + score);
        return;
    }

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        foodEatenCount++; 
        food = generateFood();
        document.getElementById('scoreboard').innerText = `Score: ${score}`;

        if (foodEatenCount === 5 && !bigFood) {
            spawnBigFood(); 
        }
    } else {
        snake.pop(); 
    }

    if (bigFood && head.x === bigFood.x && head.y === bigFood.y) {
        score += 50; 
        bigFood = null;
        foodEatenCount = 0;
        clearTimeout(bigFoodTimer);
        document.getElementById('bigFoodTimer').innerText = ''; 
        document.getElementById('bigFoodTimer').style.display = 'none';
    }

    snake.unshift(head);
    draw();
}

function handleGameOver(message) {
    gameOver = true; 
    clearInterval(gameInterval);
    
    Swal.fire({
        title: 'Game Over!',
        text: message,
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Play Again',
        cancelButtonText: 'Exit',
    }).then((result) => {
        if (result.isConfirmed) {
            startGame(); 
        } else {
            clearGame(); 
            document.getElementById('startButton').disabled = false; 
        }
    });
}

function clearGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    snake = []; 
    food = null 
    barriers = []; 
    score = 0; 
    document.getElementById('scoreboard').innerText = `Score: ${score}`; 
    document.getElementById('bigFoodTimer').innerText = ''; 
    document.getElementById('bigFoodTimer').style.display = 'none'; 
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'black'; 
    barriers.forEach(barrier => {
        ctx.fillRect(barrier.x, barrier.y, snakeSize, snakeSize);
    });

    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        ctx.fillStyle = getSnakeColor(i); 
        ctx.fillRect(segment.x, segment.y, snakeSize, snakeSize);
    }

    const head = snake[0];
    ctx.fillStyle = 'blue'; 
    ctx.fillRect(head.x, head.y, snakeSize, snakeSize);

    ctx.fillStyle = 'white'; 
    ctx.beginPath();
    ctx.arc(head.x + snakeSize / 2, head.y + snakeSize / 2, snakeSize / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(head.x + snakeSize / 3, head.y + snakeSize / 3, snakeSize / 8, 0, Math.PI * 2); 
    ctx.fill();
    ctx.beginPath();
    ctx.arc(head.x + (snakeSize * 2) / 3, head.y + snakeSize / 3, snakeSize / 8, 0, Math.PI * 2); 

    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(food.x + snakeSize / 2, food.y + snakeSize / 2, snakeSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    if (bigFood) {
        ctx.fillStyle = 'gold'; 
        ctx.beginPath();
        ctx.arc(bigFood.x + snakeSize / 2, bigFood.y + snakeSize / 2, snakeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}


function getSnakeColor(index) {
    const colors = ['#FF5733', '#FFBD33', '#DBFF33', '#75FF33', '#33FF57', '#33FFBD', '#33DBFF', '#3375FF', '#3357FF', '#5733FF'];
    return colors[index % colors.length];
}

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = Math.floor((event.clientX - rect.left) / snakeSize) * snakeSize;
    mouseY = Math.floor((event.clientY - rect.top) / snakeSize) * snakeSize;
});

document.getElementById('startButton').addEventListener('click', startGame);

function spawnBigFood() {
    bigFood = generateFood(); 
    bigFood.x = Math.floor(bigFood.x / snakeSize) * snakeSize; 
    bigFood.y = Math.floor(bigFood.y / snakeSize) * snakeSize;

    bigFoodTimer = setTimeout(() => {
        bigFood = null; 
        foodEatenCount = 0; 
        document.getElementById('bigFoodTimer').innerText = '';
    }, bigFoodDuration);

    startBigFoodCountdown(bigFoodDuration);
}

function startBigFoodCountdown(duration) {
    let timeLeft = duration / 1000; 
    const timerDisplay = document.getElementById('bigFoodTimer');
    timerDisplay.innerText = `Big Food available for: ${timeLeft} seconds`;

    const countdown = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = `Big Food available for: ${timeLeft} seconds`;
        if (timeLeft <= 0) {
            clearInterval(countdown);
        }
    }, 1000);
}
