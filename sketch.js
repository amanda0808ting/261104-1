// ==========================================
// 火車幼兒常識測驗系統（含答錯紅色提示與音效） - p5.js sketch.js
// ==========================================

let passengerNames = ["小熊", "小兔", "小貓", "小狗", "小猴", "小象"]; // 6 位乘客名稱
let passengerColors = [];   // 6 位乘客的代表顏色
let questions = [];         // 題目資料庫
let currentQuestionIndex = 0; // 目前選擇的題目索引 (0~5)
let answers = [null, null, null, null, null, null]; // 玩家的選擇
let wrongAnswers = [null, null, null, null, null, null]; // 記錄每一題答錯的選項索引
let isPassengerOnTrain = [false, false, false, false, false, false]; // 是否已上車

let passengerAnimProgress = [0, 0, 0, 0, 0, 0]; // 登車動畫進度 (0~1)
let autoAdvanceTimer = 0;   // 自動換題計時器

let score = 0;             // 最終成績
let isSubmitted = false;   // 是否已交卷
let trainX = 0;            // 列車出發移動偏移量
let isTrainDeparted = false; // 列車是否出發

let particles = [];        // 彩帶粒子
let submitButton;          // 交卷按鈕
let soundEnabled = false;  // 記錄是否已解鎖音效
let animTimer = 0;         // 動畫時間軸

// 1. 預設 6 位乘客的柔和代表色
function preload() {
  passengerColors = [
    color(255, 140, 0),   // 0. 小熊 (橘)
    color(255, 105, 180), // 1. 小兔 (粉)
    color(138, 43, 226),  // 2. 小貓 (紫)
    color(65, 105, 225),  // 3. 小狗 (藍)
    color(46, 139, 87),   // 4. 小猴 (綠)
    color(218, 165, 32)   // 5. 小象 (金)
  ];
}

// 2. 初始設定
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  // 初始化幼兒園生活常識題目
  questions = [
    {
      character: "小熊",
      question: "吃飯前我們要先做什麼事呢？",
      options: ["洗手", "看電視", "直接抓來吃"],
      correct: 0
    },
    {
      character: "小兔",
      question: "看見老師和同學時要說什麼？",
      options: ["不說話跑走", "早安 / 你好", "對他們吐舌頭"],
      correct: 1
    },
    {
      character: "小貓",
      question: "過馬路時，應該看什麼燈號才能走？",
      options: ["紅燈", "黃燈", "綠燈"],
      correct: 2
    },
    {
      character: "小狗",
      question: "想上廁所的時候應該怎麼辦？",
      options: ["忍住不說", "告訴老師去廁所", "尿在地上"],
      correct: 1
    },
    {
      character: "小猴",
      question: "玩具玩完之後要怎麼處理？",
      options: ["收拾放回原位", "丟在地上離開", "送給別人"],
      correct: 0
    },
    {
      character: "小象",
      question: "睡覺前要先做哪件事來保護牙齒？",
      options: ["吃糖果", "刷牙", "喝汽水"],
      correct: 1
    }
  ];

  // 創建交卷按鈕
  submitButton = createButton("交卷看成績");
  submitButton.style("font-size", "20px");
  submitButton.style("padding", "12px 24px");
  submitButton.style("background-color", "#FF9800");
  submitButton.style("color", "#FFFFFF");
  submitButton.style("border", "none");
  submitButton.style("border-radius", "12px");
  submitButton.style("cursor", "pointer");
  submitButton.style("box-shadow", "0px 4px 6px rgba(0,0,0,0.2)");
  submitButton.hide(); 
  submitButton.mousePressed(calculateScore); 
}

// 3. 主要繪製循環
function draw() {
  background(220, 245, 255); // 天空藍背景
  animTimer += 0.1;          // 更新動畫時間軸

  // 繪製草地與鐵軌環境
  drawEnvironment();

  // 若火車出發，平滑移動
  if (isTrainDeparted) {
    trainX += 6;
  }

  updatePassengerAnimations();
  checkAllCorrect();

  // 繪製上方火車與車廂中的動物動畫
  drawTrainAndAnimatedPassengers();

  // 顯示下方候車月台與題目面板
  if (!isSubmitted) {
    drawPlatformStatus();
    drawQuestionArea();
  } else {
    drawScoreBoard();
  }

  // 成績高於 80% 時產生彩帶效果
  if (isTrainDeparted && score >= 80) {
    updateAndDrawConfetti();
  }
}

// 4. 繪製環境與鐵軌
function drawEnvironment() {
  noStroke();
  fill(120, 200, 80); // 草地
  rect(0, height * 0.42, width, height * 0.58);

  // 鐵軌
  fill(100, 100, 100);
  rect(0, height * 0.38, width, 8);
  rect(0, height * 0.40, width, 8);
  stroke(120, 80, 40);
  strokeWeight(4);
  for (let x = 0; x < width; x += 30) {
    line(x, height * 0.37, x, height * 0.41);
  }
  noStroke();
}

// 5. 繪製火車與車廂
function drawTrainAndAnimatedPassengers() {
  let startX = 50 + trainX; 
  let startY = height * 0.15; 
  let boxWidth = width / 7.5; 
  let boxHeight = height * 0.18; 

  // 火車頭
  fill(220, 50, 50);
  rect(startX - 60, startY + 10, 50, boxHeight - 10, 8);
  fill(50);
  ellipse(startX - 35, startY + boxHeight, 20);

  let platformY = height * 0.48; 
  let startXPos = width * 0.25;
  let spacing = width * 0.11;

  for (let i = 0; i < 6; i++) {
    let x = startX + i * (boxWidth + 12);
    let targetX = x + boxWidth / 2;
    let targetY = startY + boxHeight * 0.5;

    let platX = startXPos + i * spacing;
    let platY = platformY;

    // 當前選中車廂的外框高亮提示
    if (i === currentQuestionIndex && !isSubmitted) {
      noFill();
      stroke(255, 215, 0);
      strokeWeight(5);
      rect(x - 4, startY - 4, boxWidth + 8, boxHeight + 8, 15);
      noStroke();
    }

    // 車廂本體
    fill(i % 2 === 0 ? color(255, 105, 180) : color(70, 130, 180));
    rect(x, startY, boxWidth, boxHeight, 10);

    // 車輪
    fill(50);
    ellipse(x + boxWidth * 0.25, startY + boxHeight, boxHeight * 0.25);
    ellipse(x + boxWidth * 0.75, startY + boxHeight, boxHeight * 0.25);

    // 登車動畫與動物繪圖呈現
    let prog = passengerAnimProgress[i];
    if (prog > 0) {
      let currentDrawX = lerp(platX, targetX, prog);
      let currentDrawY = lerp(platY, targetY, prog) - sin(prog * PI) * 40; 
      let size = lerp(32, boxHeight * 0.55, prog);

      drawAnimalCharacter(currentDrawX, currentDrawY, size, i);

      if (prog >= 1) {
        fill(76, 175, 80);
        ellipse(x + boxWidth - 15, startY + 15, 22);
        fill(255);
        textSize(14);
        text("✓", x + boxWidth - 15, startY + 15);
      }
    } else {
      fill(240, 240, 240, 150);
      rect(x + 10, startY + 15, boxWidth - 20, boxHeight - 30, 8);
      fill(100);
      textSize(14);
      text("等待中", x + boxWidth / 2, startY + boxHeight / 2);
    }
  }
}

// 6. 專屬動物角色繪製函式
function drawAnimalCharacter(x, y, size, index) {
  fill(passengerColors[index]);
  
  if (index === 0) {
    // 小熊
    ellipse(x, y, size, size);
    ellipse(x - size * 0.35, y - size * 0.35, size * 0.35);
    ellipse(x + size * 0.35, y - size * 0.35, size * 0.35);
  } else if (index === 1) {
    // 小兔
    let earAngle = sin(animTimer * 3) * 0.1;
    push();
    translate(x, y);
    rotate(earAngle);
    ellipse(-size * 0.2, -size * 0.55, size * 0.22, size * 0.45);
    ellipse(size * 0.2, -size * 0.55, size * 0.22, size * 0.45);
    pop();
    ellipse(x, y, size, size);
  } else if (index === 2) {
    // 小貓
    ellipse(x, y, size, size);
    triangle(x - size * 0.4, y - size * 0.2, x - size * 0.15, y - size * 0.55, x - size * 0.05, y - size * 0.3);
    triangle(x + size * 0.4, y - size * 0.2, x + size * 0.15, y - size * 0.55, x + size * 0.05, y - size * 0.3);
  } else if (index === 3) {
    // 小狗
    ellipse(x, y, size, size);
    ellipse(x - size * 0.45, y, size * 0.25, size * 0.4);
    ellipse(x + size * 0.45, y, size * 0.25, size * 0.4);
  } else if (index === 4) {
    // 小猴
    ellipse(x, y, size, size);
    ellipse(x - size * 0.45, y - size * 0.1, size * 0.25, size * 0.25);
    ellipse(x + size * 0.45, y - size * 0.1, size * 0.25, size * 0.25);
  } else if (index === 5) {
    // 小象
    ellipse(x, y, size, size);
    ellipse(x - size * 0.5, y, size * 0.35, size * 0.45);
    ellipse(x + size * 0.5, y, size * 0.35, size * 0.45);
    noFill();
    stroke(passengerColors[index]);
    strokeWeight(size * 0.12);
    arc(x, y + size * 0.1, size * 0.3, size * 0.4, 0, PI + HALF_PI);
    noStroke();
    fill(passengerColors[index]);
  }

  // 眼睛與微笑
  fill(0);
  ellipse(x - size * 0.2, y - size * 0.1, size * 0.15, size * 0.15);
  ellipse(x + size * 0.2, y - size * 0.1, size * 0.15, size * 0.15);

  noFill();
  stroke(0);
  strokeWeight(Math.max(1, size * 0.06));
  arc(x, y + size * 0.12, size * 0.35, size * 0.25, 0, PI);
  noStroke();
}

// 7. 更新動畫與自動換題
function updatePassengerAnimations() {
  for (let i = 0; i < 6; i++) {
    if (answers[i] === questions[i].correct) {
      isPassengerOnTrain[i] = true;
      if (passengerAnimProgress[i] < 1) {
        passengerAnimProgress[i] += 0.04; 
      }
    } else {
      isPassengerOnTrain[i] = false;
      passengerAnimProgress[i] = 0;
    }
  }

  if (autoAdvanceTimer > 0) {
    autoAdvanceTimer--;
    if (autoAdvanceTimer === 0) {
      for (let i = 1; i <= 6; i++) {
        let nextIndex = (currentQuestionIndex + i) % 6;
        if (answers[nextIndex] !== questions[nextIndex].correct) {
          currentQuestionIndex = nextIndex;
          break;
        }
      }
    }
  }
}

// 8. 繪製候車月台
function drawPlatformStatus() {
  let barY = height * 0.44;
  fill(255, 255, 255, 220);
  rect(width * 0.05, barY, width * 0.9, height * 0.06, 10);

  fill(50);
  textSize(15);
  text("月台候車狀況：", width * 0.12, barY + height * 0.03);

  let startXPos = width * 0.25;
  let spacing = width * 0.11;

  for (let i = 0; i < 6; i++) {
    let px = startXPos + i * spacing;
    let py = barY + height * 0.03;

    if (passengerAnimProgress[i] > 0.2) {
      fill(76, 175, 80);
      ellipse(px, py, 32, 32);
      fill(255);
      textSize(11);
      text("上車", px, py);
    } else {
      let jump = (i === currentQuestionIndex) ? sin(animTimer * 4) * 5 : 0;
      fill(i === currentQuestionIndex ? color(255, 193, 7) : color(220, 220, 220));
      stroke(255);
      strokeWeight(2);
      ellipse(px, py + jump, 34, 34);
      noStroke();

      drawAnimalCharacter(px, py + jump, 24, i);
    }
  }
}

// 9. 繪製下方問答面板（答錯選項會顯示紅色底色）
function drawQuestionArea() {
  let currentQ = questions[currentQuestionIndex];
  let cardY = height * 0.52; 
  let cardH = height * 0.42;

  fill(255, 255, 255, 240);
  rect(width * 0.1, cardY, width * 0.8, cardH, 20);

  fill(passengerColors[currentQuestionIndex]);
  textSize(22);
  text(`[ ${currentQ.character} 的專屬問題 ]`, width * 0.5, cardY + height * 0.06);

  fill(50);
  textSize(24);
  text(currentQ.question, width * 0.5, cardY + height * 0.15);

  for (let i = 0; i < currentQ.options.length; i++) {
    let btnW = width * 0.22;
    let btnH = cardH * 0.35;
    let btnX = width * 0.5 + (i - 1) * (btnW + 20) - btnW / 2;
    let btnY = cardY + cardH * 0.52;

    // 判斷選項顏色：答對顯示綠色、答錯顯示紅色、未選為預設灰白色
    if (answers[currentQuestionIndex] === i) {
      if (i === currentQ.correct) {
        fill(100, 200, 100); // 答對：綠色
      } else {
        fill(245, 100, 100); // 答錯：紅色底色
      }
    } else if (wrongAnswers[currentQuestionIndex] === i) {
      fill(245, 100, 100);   // 曾答錯過：保持紅色底色
    } else {
      fill(245, 245, 245);   // 預設
    }

    stroke(180);
    strokeWeight(2);
    rect(btnX, btnY, btnW, btnH, 12);
    noStroke();

    fill(0);
    textSize(20);
    text(currentQ.options[i], btnX + btnW / 2, btnY + btnH / 2);
  }
}

// 10. 檢查是否全對
function checkAllCorrect() {
  let allCorrect = true;
  for (let i = 0; i < 6; i++) {
    if (answers[i] !== questions[i].correct) {
      allCorrect = false;
    }
  }

  if (allCorrect && !isSubmitted) {
    submitButton.position(width / 2 - 70, height * 0.95);
    submitButton.show();
  } else if (!isSubmitted) {
    submitButton.hide();
  }
}

// 11. 計算成績
function calculateScore() {
  let correctCount = 0;
  for (let i = 0; i < 6; i++) {
    if (answers[i] === questions[i].correct) {
      correctCount++;
    }
  }

  score = Math.round((correctCount / 6) * 100);
  isSubmitted = true;
  submitButton.hide();

  if (score >= 80) {
    playSuccessSound();
    isTrainDeparted = true;
    createConfetti();
  } else {
    playErrorSound();
  }
}

// 12. 顯示成績面板
function drawScoreBoard() {
  fill(255);
  rect(width * 0.2, height * 0.48, width * 0.6, height * 0.4, 20);

  fill(50);
  textSize(32);
  text("🎉 測驗完成 🎉", width * 0.5, height * 0.56);

  textSize(42);
  fill(score >= 80 ? color(230, 81, 0) : color(198, 40, 40));
  text(`總成績：${score} 分`, width * 0.5, height * 0.68);

  textSize(22);
  fill(80);
  if (score >= 80) {
    text("太棒了！小火車成功出發囉！ 🚂💨", width * 0.5, height * 0.78);
  } else {
    text("再接再厲！請繼續加油喔！ 🎈", width * 0.5, height * 0.78);
  }
}

// ==========================================
// 聲音效果與滑鼠點擊互動函式
// ==========================================

function mousePressed() {
  if (!soundEnabled) {
    userStartAudio();
    soundEnabled = true;
  }

  if (isSubmitted) return;

  // A. 點擊上方車廂切換題目
  let startX = 50 + trainX; 
  let startY = height * 0.15; 
  let boxWidth = width / 7.5; 
  let boxHeight = height * 0.18; 

  for (let i = 0; i < 6; i++) {
    let x = startX + i * (boxWidth + 12);
    if (mouseX > x && mouseX < x + boxWidth && mouseY > startY && mouseY < startY + boxHeight) {
      playClickSound();
      currentQuestionIndex = i;
      return;
    }
  }

  // B. 點擊下方選項回答
  let cardY = height * 0.52;
  let cardH = height * 0.42;
  for (let i = 0; i < 3; i++) {
    let btnW = width * 0.22;
    let btnH = cardH * 0.35;
    let btnX = width * 0.5 + (i - 1) * (btnW + 20) - btnW / 2;
    let btnY = cardY + cardH * 0.52;

    if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
      answers[currentQuestionIndex] = i;

      if (i === questions[currentQuestionIndex].correct) {
        playCorrectSound();
        autoAdvanceTimer = 45; // 0.75秒後自動換題
      } else {
        playErrorSound();
        wrongAnswers[currentQuestionIndex] = i; // 記錄答錯的選項，轉為紅底
      }
    }
  }
}

function playClickSound() {
  let osc = new p5.Oscillator('sine');
  osc.freq(400);
  osc.amp(0.1);
  osc.start();
  osc.stop(0.08);
}

function playCorrectSound() {
  let osc1 = new p5.Oscillator('triangle');
  let osc2 = new p5.Oscillator('sine');
  osc1.freq(523.25);
  osc2.freq(659.25);
  osc1.amp(0.15);
  osc2.amp(0.15);
  osc1.start();
  osc2.start();
  osc1.stop(0.25);
  osc2.stop(0.25);
}

function playErrorSound() {
  let osc = new p5.Oscillator('sawtooth');
  osc.freq(180);
  osc.amp(0.15);
  osc.start();
  osc.stop(0.2);
}

function playSuccessSound() {
  let notes = [523.25, 659.25, 783.99, 1046.50];
  for (let i = 0; i < notes.length; i++) {
    let osc = new p5.Oscillator('sine');
    setTimeout(() => {
      osc.freq(notes[i]);
      osc.amp(0.2);
      osc.start();
      osc.stop(0.3);
    }, i * 120);
  }
}

// 13. 建立彩帶粒子
function createConfetti() {
  particles = [];
  for (let i = 0; i < 150; i++) {
    particles.push({
      x: random(width),
      y: random(-height, 0),
      color: color(random(255), random(255), random(255)),
      size: random(8, 14),
      speedY: random(3, 7),
      speedX: random(-2, 2)
    });
  }
}

// 14. 更新與繪製彩帶
function updateAndDrawConfetti() {
  for (let p of particles) {
    fill(p.color);
    rect(p.x, p.y, p.size, p.size);
    p.y += p.speedY;
    p.x += p.speedX;

    if (p.y > height) {
      p.y = -10;
      p.x = random(width);
    }
  }
}

// 15. 響應式調整視窗大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}