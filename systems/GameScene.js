/**
 * GameScene.js
 *
 * Cena principal do jogo.
 * - Carrega os sprites do mascote IFMA no preload()
 * - Time 1 usa a classe Player (mascote animado por estado)
 * - Time 2 usa a classe Player (círculos coloridos)
 * - Controles: Setas para mover, Espaço para chutar (segure para carregar), TAB para trocar jogador
 */

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    // ─────────────────────────────────────────────────────────
    //  PRELOAD — carrega sprites do mascote
    // ─────────────────────────────────────────────────────────
    preload() {
        // Estados principais → sprites de ação
        this.load.image('mascot_idle',      'assets/sprites/frente.png');
        this.load.image('mascot_running',   'assets/sprites/corrida.png');
        this.load.image('mascot_shooting',  'assets/sprites/chute.png');
        this.load.image('mascot_dribbling', 'assets/sprites/drible.png');
        this.load.image('mascot_defending', 'assets/sprites/costas.png');

        // Ícones de UI (opcionais)
        this.load.image('icon_ball',   'assets/sprites/icone_bola.png');
        this.load.image('icon_shield', 'assets/sprites/icone_escudo.png');
        this.load.image('icon_boot',   'assets/sprites/icone_chuteira.png');
        this.load.image('icon_target', 'assets/sprites/icone_alvo.png');
    }

    // ─────────────────────────────────────────────────────────
    //  CREATE
    // ─────────────────────────────────────────────────────────
    create() {
        console.log('🎮 GameScene: Inicializando…');

        // Limites do mundo físico
        this.physics.world.setBounds(
            0, 0,
            GameConfig.FIELD.WIDTH,
            GameConfig.FIELD.HEIGHT
        );

        // ── Renderização do campo ────────────────────────────
        this.renderSystem = new RenderSystem(this);
        this.renderSystem.renderField();
        this.renderSystem.renderGoals();

        // ── Bola ─────────────────────────────────────────────
        this.ball = this.renderSystem.createBall();

        // ── Estado do jogo ───────────────────────────────────
        this.score    = { team1: 0, team2: 0 };
        this.gameTime = 0;
        this.ui       = this.renderSystem.createUI();

        // ── Criação dos times ────────────────────────────────
        this.team1Players = [];
        this.team2Players = [];

        // Time 1 — Mascote IFMA (controlado pelo jogador)
        [
            { x: 300,  y: 300, role: 'SHOOTER',    name: 'Atleta #10' },
            { x: 180,  y: 500, role: 'DEFENDER',   name: 'Zagueiro'   },
        ].forEach((cfg, i) => {
            const p = new Player(this, {
                team: 1, index: i,
                name: cfg.name, role: cfg.role,
                x: cfg.x, y: cfg.y,
                stats: { speed: 160, shootPower: 120, stamina: 100, dribble: 110 },
            });
            this.team1Players.push(p);
        });

        // Time 2 — Oponentes (círculos azuis, controlados por IA)
        [
            { x: 900,  y: 300, role: 'SHOOTER',    name: 'Oponente 1' },
            { x: 1020, y: 500, role: 'DEFENDER',   name: 'Oponente 2' },
        ].forEach((cfg, i) => {
            const p = new Player(this, {
                team: 2, index: i,
                name: cfg.name, role: cfg.role,
                x: cfg.x, y: cfg.y,
                stats: { speed: 150, shootPower: 100, stamina: 100, dribble: 100 },
            });
            this.team2Players.push(p);
        });

        this.allPlayers       = [...this.team1Players, ...this.team2Players];
        this.controlledPlayer = this.team1Players[0]; // Atleta #10 começa selecionado

        // ── Sistemas ─────────────────────────────────────────
        this.movementSystem = new MovementSystem(this);
        this.defenseSystem  = new DefenseSystem(this);
        this.decisionSystem = new DecisionSystem(
            this, this.defenseSystem, this.movementSystem, null
        );
        this.zoneSystem = new ZoneSystem(this);
        this.zoneSystem.assignPlayerZones(this.allPlayers);

        // ── Colisões ─────────────────────────────────────────
        // Extrai os sprites físicos de todos os jogadores
        const spriteGroup = this.physics.add.group(
            this.allPlayers.map(p => p.sprite)
        );

        this.physics.add.collider(spriteGroup, spriteGroup);

        this.physics.add.collider(
            this.ball,
            spriteGroup,
            (ball, spr) => {
                if (spr.player) ball.lastTouchedBy = spr.player;
            }
        );

        // ── Controles ────────────────────────────────────────
        this.cursors  = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        this.chargeTime = 0;
        this.isCharging = false;

        // TAB → troca o jogador controlado dentro do time 1
        this.input.keyboard.addKey('TAB').on('down', () => {
            const idx = this.team1Players.indexOf(this.controlledPlayer);
            this.controlledPlayer =
                this.team1Players[(idx + 1) % this.team1Players.length];
        });

        // ── Indicador de seleção ──────────────────────────────
        this.selectionRing = this.add.circle(0, 0, 34, 0x000000, 0)
            .setStrokeStyle(2.5, 0xffff00)
            .setDepth(3);

        // ── HUD de controles ──────────────────────────────────
        this.add.text(14, GameConfig.FIELD.HEIGHT - 62,
            '⬆⬇⬅➡ Mover   |   ESPAÇO Chutar (segure para carregar)   |   TAB Trocar jogador',
            {
                fontSize: '13px',
                fill: '#ffffffcc',
                backgroundColor: '#00000066',
                padding: { x: 8, y: 5 },
            }
        ).setDepth(100);

        console.log('✅ GameScene: Pronto!');
    }

    // ─────────────────────────────────────────────────────────
    //  UPDATE LOOP
    // ─────────────────────────────────────────────────────────
    update(time, delta) {
        const dt = delta / 1000;
        this.gameTime += dt;

        // Atualiza todos os jogadores (posição, stamina, visual)
        this.allPlayers.forEach(p => p.update(delta));

        // IA para jogadores não controlados pelo humano
        this.allPlayers.forEach(player => {
            if (player !== this.controlledPlayer) {
                this.decisionSystem.makeDecision(
                    player, this.ball, this.allPlayers
                );
            }
        });

        // Controle humano
        this.controlPlayer(this.controlledPlayer, dt);

        // Anel de seleção segue o jogador ativo
        this.selectionRing.setPosition(
            this.controlledPlayer.x,
            this.controlledPlayer.y
        );

        // UI
        this.renderSystem.updateScore(
            this.score.team1, this.score.team2, this.ui
        );
        this.renderSystem.updateTime(this.gameTime, this.ui);

        // Verificação de gol
        this.checkGoal();
    }

    // ─────────────────────────────────────────────────────────
    //  Controle do jogador humano
    // ─────────────────────────────────────────────────────────
    controlPlayer(player, dt) {
        if (!player) return;

        let vx = 0, vy = 0;

        if (this.cursors.left.isDown)  vx = -1;
        if (this.cursors.right.isDown) vx =  1;
        if (this.cursors.up.isDown)    vy = -1;
        if (this.cursors.down.isDown)  vy =  1;

        // Normaliza movimento diagonal
        if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

        if (vx !== 0 || vy !== 0) {
            player.sprite.body.setVelocity(vx * player.maxSpeed, vy * player.maxSpeed);
            player.setState(PlayerStates.RUNNING);
        } else {
            player.sprite.body.setVelocity(0, 0);
            if (!this.isCharging) {
                player.setState(PlayerStates.IDLE);
            }
        }

        // ── Chute carregado ───────────────────────────────────
        if (this.spaceKey.isDown) {
            this.isCharging  = true;
            this.chargeTime += dt;
            player.setState(PlayerStates.SHOOTING);

            // Feedback visual: pisca o anel conforme carrega
            const pulse = 0.5 + 0.5 * Math.sin(this.chargeTime * 12);
            this.selectionRing.setStrokeStyle(2.5 + pulse * 3, 0xff8800);

        } else if (this.isCharging) {
            // Soltou a tecla — chuta se a bola estiver perto
            this.isCharging = false;
            this.selectionRing.setStrokeStyle(2.5, 0xffff00);

            const dist = MathHelpers.distance(
                player.x, player.y,
                this.ball.x, this.ball.y
            );

            if (dist < 90) {
                // Chuta em direção ao gol adversário (lado direito)
                const targetX = GameConfig.FIELD.WIDTH;
                const targetY = GameConfig.FIELD.HEIGHT / 2;
                player.kick(this.ball, targetX, targetY, this.chargeTime);
                player.setState(PlayerStates.SHOOTING);
            }

            this.chargeTime = 0;
        }
    }

    // ─────────────────────────────────────────────────────────
    //  Detecção de gol
    // ─────────────────────────────────────────────────────────
    checkGoal() {
        const { WIDTH, HEIGHT } = GameConfig.FIELD;
        const goalH = 200;
        const y1    = HEIGHT / 2 - goalH / 2;
        const y2    = HEIGHT / 2 + goalH / 2;

        // Gol no lado esquerdo → ponto para o Time 2
        if (this.ball.x <= 12 && this.ball.y >= y1 && this.ball.y <= y2) {
            this.score.team2++;
            this.onGoal('Time Azul');
        }

        // Gol no lado direito → ponto para o Time 1
        if (this.ball.x >= WIDTH - 12 && this.ball.y >= y1 && this.ball.y <= y2) {
            this.score.team1++;
            this.onGoal('Atleta IFMA');
        }
    }

    onGoal(scorer) {
        console.log(`⚽ GOL! Marcado por: ${scorer}`);

        // Flash breve na câmera
        this.cameras.main.flash(400, 255, 255, 255, false);

        this.resetPositions();
    }

    // ─────────────────────────────────────────────────────────
    //  Reset após gol
    // ─────────────────────────────────────────────────────────
    resetPositions() {
        // Bola ao centro
        this.ball.setPosition(
            GameConfig.FIELD.WIDTH  / 2,
            GameConfig.FIELD.HEIGHT / 2
        );
        this.ball.body.setVelocity(0, 0);

        // Jogadores às posições iniciais
        const starts = [
            { p: this.team1Players[0], x: 300,  y: 300 },
            { p: this.team1Players[1], x: 180,  y: 500 },
            { p: this.team2Players[0], x: 900,  y: 300 },
            { p: this.team2Players[1], x: 1020, y: 500 },
        ];

        starts.forEach(({ p, x, y }) => {
            p.sprite.setPosition(x, y);
            p.sprite.body.setVelocity(0, 0);
            p.x = x;
            p.y = y;
            p.setState(PlayerStates.IDLE);
        });
    }
}
