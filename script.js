document.addEventListener('DOMContentLoaded', () => {
    const backgroundMusic = document.getElementById('backgroundMusic');
    const startButton = document.getElementById('startButton');
    const envelopeContainer = document.getElementById('envelopeContainer');
    const unfoldButton = document.getElementById('unfoldButton');
    const finalGreetingElement = document.getElementById('finalGreeting');
    const cakeCanvas = document.getElementById('cakeCanvas');
    const cakeNote = document.getElementById('cakeNote');

    const steps = {
        step1: document.getElementById('step1'),
        step2: document.getElementById('step2'),
        step3: document.getElementById('step3'),
        step4: document.getElementById('step4'),
        step5: document.getElementById('step5'),
        step6: document.getElementById('step6'),
    };

    function transitionToStep(targetId) {
        const current = document.querySelector('.step.active');
        if (current) current.classList.remove('active');
        steps[targetId].classList.add('active');
    }

    // Step 1 → Step 2 + music
    startButton.addEventListener('click', () => {
        transitionToStep('step2');
        if (backgroundMusic && backgroundMusic.paused) {
            backgroundMusic.play().catch(() => {});
        }
    });

    // Step 2 → Step 3
    envelopeContainer.addEventListener('click', () => {
        envelopeContainer.classList.add('open');
        const instruction = envelopeContainer.querySelector('.click-instruction');
        if (instruction) instruction.style.opacity = '0';

        setTimeout(() => {
            transitionToStep('step3');
            setTimeout(() => {
                const letterContainer = document.getElementById('letterContainer');
                if (letterContainer) letterContainer.classList.add('show');
            }, 100);
        }, 700);
    });

    // Step 3 → Step 4 (gifts start)
    unfoldButton.addEventListener('click', () => {
        transitionToStep('step4');
        showGift('gift1');
    });

    // Gifts navigation
    const giftButtons = document.querySelectorAll('.big-btn[data-next]');
    giftButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentGift = btn.closest('.gift-step');
            const nextId = btn.getAttribute('data-next');
            if (currentGift) currentGift.style.display = 'none';
            showGift(nextId);
        });
    });

    const goToCakeBtn = document.getElementById('goToCake');
    goToCakeBtn.addEventListener('click', () => {
        transitionToStep('step5');
        initCake();
    });

    function showGift(id) {
        const allGifts = document.querySelectorAll('.gift-step');
        allGifts.forEach(g => g.style.display = 'none');
        const gift = document.getElementById(id);
        if (gift) gift.style.display = 'block';
    }

    // Cake logic: click candles to blow, drag to cut
    function initCake() {
        const ctx = cakeCanvas.getContext('2d');
        let candles = [
            { x: 150, y: 80, lit: true },
            { x: 250, y: 80, lit: true },
            { x: 350, y: 80, lit: true }
        ];
        let cutting = false;
        let hasCut = false;

        function drawCake() {
            ctx.clearRect(0, 0, cakeCanvas.width, cakeCanvas.height);

            // Cake layers
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(80, 170, 340, 90);
            ctx.fillStyle = '#D2691E';
            ctx.fillRect(100, 130, 300, 55);
            ctx.fillStyle = '#FFB6C1';
            ctx.fillRect(120, 100, 260, 35);

            // Candles
            candles.forEach(c => {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(c.x - 5, c.y, 10, 40);
                if (c.lit) {
                    ctx.fillStyle = 'orange';
                    ctx.beginPath();
                    ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }

        drawCake();

        function canvasPos(evt) {
            const rect = cakeCanvas.getBoundingClientRect();
            const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
            const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        cakeCanvas.onmousedown = cakeCanvas.ontouchstart = (e) => {
            e.preventDefault();
            cutting = true;
            const pos = canvasPos(e);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        };
        cakeCanvas.onmouseup = cakeCanvas.ontouchend = (e) => {
            e.preventDefault();
            if (cutting) {
                cutting = false;
                hasCut = true;
                updateCakeNote(candles, hasCut);
            }
        };
        cakeCanvas.onmouseleave = () => {
            cutting = false;
        };
        cakeCanvas.onmousemove = cakeCanvas.ontouchmove = (e) => {
            if (!cutting) return;
            e.preventDefault();
            const pos = canvasPos(e);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4;
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        };

        // click/tap to blow candles
        cakeCanvas.onclick = (e) => {
            const pos = canvasPos(e);
            candles.forEach(c => {
                const dx = pos.x - c.x;
                const dy = pos.y - c.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 18 && c.lit) {
                    c.lit = false;
                }
            });
            drawCake();
            updateCakeNote(candles, hasCut);
        };

        updateCakeNote(candles, hasCut);
    }

    function updateCakeNote(candles, hasCut) {
        const allBlown = candles.every(c => !c.lit);
        if (!allBlown) {
            cakeNote.textContent = "Blow out all the candles by tapping them. 🕯️";
        } else if (!hasCut) {
            cakeNote.textContent = "Now drag across the cake to cut your first slice. 🔪";
        } else {
            cakeNote.textContent = "Happy birthday, Shaa! You blew the candles and cut your cake. 🎂 Tap the cake once more to see my final message.";
            cakeCanvas.onclick = () => {
                transitionToStep('step6');
                showFinalMessage();
            };
        }
    }

    // Final message typewriter
    const messageGreeting = "Happiest birthday, Shaa!";

    function showFinalMessage() {
        if (!finalGreetingElement) return;
        let i = 0;
        finalGreetingElement.textContent = '';
        const typing = setInterval(() => {
            if (i < messageGreeting.length) {
                finalGreetingElement.textContent += messageGreeting.charAt(i);
                i++;
            } else {
                clearInterval(typing);
            }
        }, 80);
    }
});
