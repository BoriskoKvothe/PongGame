// Wrap everything in a block to be executed only after the DOM has fully loaded.
document.addEventListener('DOMContentLoaded', (event) => {
    // Get references to the HTML elements
    const gameStartScreen = document.getElementById('gameStartScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const gameOverMessage = document.getElementById('gameOverMessage');
    const gameCanvasContainer = document.getElementById('gameCanvasContainer');
    const gameCanvas = document.getElementById('gameCanvas');
    const ctx = gameCanvas.getContext('2d');
    const restartButton = document.getElementById('restart');
    const playerNameInput = document.getElementById('playerNameInput');
    const controlSelect = document.getElementById('controlSelect');
    const startButton = document.getElementById('startGame'); // Moved this line up
    
    
    // Set the dimensions of the canvas
    const canvasWidth = gameCanvasContainer.clientWidth;
    const canvasHeight = gameCanvasContainer.clientHeight;
    gameCanvas.width = canvasWidth;
    gameCanvas.height = canvasHeight;
    
    // This position ensures that the startGame function is accessible when the 'click' event is fired.
    startButton.addEventListener('click', function startGame() {
        // The line below checks if the startGame function exists and then calls it.
        // for debug. 
        if (typeof startGame === 'function') {
            startGame(); 
        } else {
            console.error("startGame function is not defined."); 
        }
    });
    
    
    startButton.addEventListener('click', startGame); 
    restartButton.addEventListener('click', restartGame);
    
    // Game variables
    let ball, playerPaddle, computerPaddle;
    let playerScore = 0;
    let computerScore = 0;
    let gameInterval;
    let playerControl = '';
    
    /*document.getElementById('startButton').addEventListener('click', startGame);*/
    restartButton.addEventListener('click', restartGame);
    
    // Function to start the game
    function startGame() {
        // Get player's name and control preference
        const playerName = playerNameInput.value;
        playerControl = controlSelect.value;
    
        // Check if the player's name is entered, if not, alert the user
        if (!playerName) {
            alert("Please enter your name.");
            return;
        }
    
        // Initialize game elements
        initializeGameElements();
    
          // Update UI elements
         gameStartScreen.style.display = 'none';
         gameCanvasContainer.style.display = 'block';
         restartButton.style.display = 'none'; 
    
        // Remove any existing event listeners to prevent duplicates
       
        if (playerControl === 'mouse') {
            window.addEventListener('mousemove', handleMouseMove);
        } else {
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
        }
    
        // Start the game loop
        if (gameInterval) { // Clear existing interval if any
            clearInterval(gameInterval);
        }
        gameInterval = setInterval(gameLoop, 10); // Run every 10 ms for smoother animation
    }
    
    
    // Initialize ball and paddles
    function initializeGameElements() {
        ball = {
            x: canvasWidth / 2,
            y: canvasHeight / 2,
            radius: 10, // or any size you prefer
            speedX: 4, // speed in the X direction
            speedY: 4, // speed in the Y direction
        };
    
        playerPaddle = {
            x: 0, // positioned on the left side of the canvas
            y: canvasHeight / 2 - 50, // appx center
            width: 10, // or any size you prefer
            height: 100, // or any size you prefer
            speed: 6, // speed of the paddle movement
            isMovingUp: false,
            isMovingDown: false,
        };
    
        computerPaddle = {
            x: canvasWidth - 10, // positioned on the right side of the canvas
            y: canvasHeight / 2 - 50, // appx center
            width: 10, 
            height: 100, 
            speed: 6, // slightly slower than the player
        };
    }
    
    // Handle player input for moving the paddle
    function handleMouseMove(event) {
        // Calculate the paddle's new position based on the mouse position
        const bounds = gameCanvas.getBoundingClientRect();
        const mouseY = event.clientY - bounds.top;
        playerPaddle.y = mouseY - playerPaddle.height / 2;
    
        // Prevent the paddle from moving out of the canvas
        if (playerPaddle.y < 0) {
            playerPaddle.y = 0;
        } else if (playerPaddle.y + playerPaddle.height > canvasHeight) {
            playerPaddle.y = canvasHeight - playerPaddle.height;
        }
    }
    
    function handleKeyDown(event) {
        if (event.key === 'ArrowUp') {
            playerPaddle.isMovingUp = true;
        } else if (event.key === 'ArrowDown') {
            playerPaddle.isMovingDown = true;
        }
    }
    
    function handleKeyUp(event) {
        if (event.key === 'ArrowUp') {
            playerPaddle.isMovingUp = false;
        } else if (event.key === 'ArrowDown') {
            playerPaddle.isMovingDown = false;
        }
    }
    
    // Main game loop
    function gameLoop() {
        // Update the game state
        updateGame();
    
        // Clear the canvas for the new frame
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
        // Draw the elements
        drawGameElements();
    
        // Check if someone has won
        checkWinCondition();
    }
    
    function updateGame() {
        // Update ball position
        ball.x += ball.speedX;
        ball.y += ball.speedY;
    
        // Ball collision with top and bottom
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvasHeight) {
            ball.speedY = -ball.speedY; // Reverse direction
        }
    
        // Ball goes out on the left or right side (scoring)
        if (ball.x - ball.radius < 0) { // Computer scores
            computerScore++;
            resetBallAndPaddle();
        } else if (ball.x + ball.radius > canvasWidth) { // Player scores
            playerScore++;
            resetBallAndPaddle();
        }
    
        // Paddle collision with the ball
        if (ball.x - ball.radius < playerPaddle.x + playerPaddle.width && 
            ball.y > playerPaddle.y && ball.y < playerPaddle.y + playerPaddle.height) {
            ball.speedX = -ball.speedX;
        } else if (ball.x + ball.radius > computerPaddle.x && 
                   ball.y > computerPaddle.y && ball.y < computerPaddle.y + computerPaddle.height) {
            ball.speedX = -ball.speedX;
        }
    
        // Computer paddle movement (simple AI)
        computerPaddle.y += (ball.y - (computerPaddle.y + computerPaddle.height / 2)) * 0.09; // This multiplier affects the AI difficulty
    
        // Player paddle movement
        if (playerPaddle.isMovingUp) {
            playerPaddle.y -= playerPaddle.speed;
        } else if (playerPaddle.isMovingDown) {
            playerPaddle.y += playerPaddle.speed;
        }
    
        // Prevent paddles from going out of bounds
        playerPaddle.y = Math.max(Math.min(playerPaddle.y, canvasHeight - playerPaddle.height), 0);
        computerPaddle.y = Math.max(Math.min(computerPaddle.y, canvasHeight - computerPaddle.height), 0);
    }
    
    function drawGameElements() {
        // Draw the ball
        ctx.fillStyle = '#77DD77';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
    
        // Draw the player paddle
        ctx.fillStyle = 'orange';
        ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
    
        // Draw the computer paddle
        ctx.fillStyle = 'pink';
        ctx.fillRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height);
    
        // Draw the scores
       // Draw the scores with different colors
       ctx.font = '34px Arial';
        
        // New code: display player's name and score
        ctx.fillStyle = 'orange'; // Or use any color that suits your design
        ctx.fillText(`${playerNameInput.value}: ${playerScore}`, canvasWidth / 15, 30); // Change coordinates if needed
    
        // New code: display opponent's name and score
        ctx.fillStyle = 'pink'; // Or use any color that suits your design
        ctx.fillText(`Opponent: ${computerScore}`, canvasWidth * 3 / 4, 30); // Change coordinates if needed
    }
    
    function resetBallAndPaddle() {
        // Reset ball
        ball.x = canvasWidth / 2;
        ball.y = canvasHeight / 2;
        ball.speedX = 4;
        ball.speedY = 4;
    
        // Reset paddles
        playerPaddle.y = canvasHeight / 2 - 50; // approximately center
        computerPaddle.y = canvasHeight / 2 - 50; // approximately center
    }
    
    function checkWinCondition() {
        // Check if player or computer reached the winning score
        if (playerScore === 5) {
            displayGameOver(playerNameInput.value + ' wins!');
            clearInterval(gameInterval); // Stop the game
        } else if (computerScore === 5) {
            displayGameOver(playerNameInput.value + ' loses!');
            clearInterval(gameInterval); // Stop the game
        }
        if (playerScore === 5) {
            displayGameOver(playerNameInput.value + ' wins!');
            clearInterval(gameInterval); // Stop the game
        } else if (computerScore === 5) {
            displayGameOver('You lose!');
            clearInterval(gameInterval); // Stop the game
            triggerEarthquake(); // <-- Add this line
        }
    }
    
    function triggerEarthquake() {
        const originalPosition = { top: gameCanvasContainer.style.top, left: gameCanvasContainer.style.left };
        let quakeInterval = setInterval(() => {
            // Randomly change the canvas position
            gameCanvasContainer.style.top = (Math.random() * 10 - 5) + 'px';
            gameCanvasContainer.style.left = (Math.random() * 10 - 5) + 'px';
        }, 50);  // Adjust time for effect frequency
    
        // Stop the earthquake effect after 10 seconds or on user input
        let quakeTimeout = setTimeout(() => {
            clearInterval(quakeInterval);
            // Reset the canvas position
            gameCanvasContainer.style.top = originalPosition.top;
            gameCanvasContainer.style.left = originalPosition.left;
        }, 10000);  // 10 seconds duration
    
        // If the user interacts, stop the effect
        function stopEarthquake() {
            clearInterval(quakeInterval);
            clearTimeout(quakeTimeout);
            // Reset the canvas position
            gameCanvasContainer.style.top = originalPosition.top;
            gameCanvasContainer.style.left = originalPosition.left;
            // Remove these listeners once the earthquake has stopped
            window.removeEventListener('click', stopEarthquake);
            window.removeEventListener('mousemove', stopEarthquake);
        }
    
        window.addEventListener('click', stopEarthquake);
        window.addEventListener('mousemove', stopEarthquake);
    }
    
    
    function displayGameOver(message) {
        // Stop the game interval as soon as the game is over
        clearInterval(gameInterval);
    
        // Update the game over message
        gameOverMessage.textContent = message;
        gameCanvasContainer.style.display = 'none';
    
        // Show the game over screen
        gameOverScreen.style.display = 'flex';  // This assumes 'none' was the initial state in your CSS
    
        // Hide the game canvas since the game is over
        /*gameCanvasContainer.style.display = 'none';*/
    
        // Show the restart button so the player can start a new game
        restartButton.style.display = 'block'; 
    
        // NEW: Remove control listeners since the game is over. ensures that after the game is over,
        // the controls don't affect anything until a new game starts.
        if (playerControl === 'mouse') {
            window.removeEventListener('mousemove', handleMouseMove);
        } else {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        }
    }
    
    
    function restartGame() {
        // Reset the scores for a new game
        playerScore = 0;
        computerScore = 0;
    
        // Reset the ball and paddles' positions
        resetBallAndPaddle();
    
        // Hide the game over screen since we're restarting
        gameOverScreen.style.display = 'none';
    
        // Show the game canvas again as a new game is starting
        gameCanvasContainer.style.display = 'block';
    
        gameStartScreen.style.display = 'flex';
    
        // It's important to stop the previous game interval before restarting if it's not stopped already
        if (gameInterval) {
            clearInterval(gameInterval);
        }
    
        
        // Noneed to clear the playerNameInput or controlSelect as they should maintain during a restart
    }
    
    // Event listeners
    
    });