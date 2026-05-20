/**
 * Player.js
 *
 * Entidade principal do jogador.
 * Time 1 → Mascote do IFMA (sprites PNG por estado)
 * Time 2 → Círculo colorido (oponentes)
 */

class Player {
    constructor(scene, config) {
        this.scene = scene;

        // ── Identificação ────────────────────────────────────
        this.team       = config.team;
        this.playerName = config.name  || 'Jogador';
        this.role       = config.role  || 'SHOOTER';
        this.index      = config.index || 0;

        // ── Posição & Movimento ──────────────────────────────
        this.x            = config.x;
        this.y            = config.y;
        this.basePosition = { x: config.x, y: config.y };
        this.isSprinting  = false;
        this.targetDirection = 0;

        // ── Stats (com modificadores de role) ────────────────
        const roleConfig = GameConfig.ROLES[this.role] || GameConfig.ROLES.SHOOTER;
        const m = roleConfig.statModifiers;
        this.stats = {
            speed:      (config.stats?.speed      || 150) * (m.speed      || 1),
            shootPower: (config.stats?.shootPower  || 100) * (m.shootPower || 1),
            stamina:    (config.stats?.stamina     || 100),
            dribble:    (config.stats?.dribble     || 100) * (m.dribble    || 1),
            defense:    80 * (m.defense || 1),
        };

        this.staminaCurrent = this.stats.stamina;
        this.maxSpeed       = this.stats.speed * 0.6;

        // ── FSM ─────────────────────────────────────────────
        this.state         = PlayerStates.IDLE;
        this.previousState = PlayerStates.IDLE;

        // ── Zone & AI ───────────────────────────────────────
        this.assignedZone  = null;
        this.currentTarget = null;

        // ── Cooldowns ────────────────────────────────────────
        this.kickCooldown   = 0;
        this.actionCooldown = 0;

        // ── Controle interno de sprite ───────────────────────
        this.currentTexture    = null;
        this.usesImageSprite   = false;

        this.createSprite();
    }

    // ─────────────────────────────────────────────────────────
    //  Mapa estado → textura do mascote
    // ─────────────────────────────────────────────────────────
    static get STATE_TEXTURES() {
        return {
            [PlayerStates.IDLE]:         'mascot_idle',
            [PlayerStates.RUNNING]:      'mascot_running',
            [PlayerStates.SHOOTING]:     'mascot_shooting',
            [PlayerStates.DRIBBLING]:    'mascot_dribbling',
            [PlayerStates.DEFENDING]:    'mascot_defending',
            [PlayerStates.INTERCEPTING]: 'mascot_running',
            [PlayerStates.RETURNING]:    'mascot_running',
        };
    }

    // ─────────────────────────────────────────────────────────
    //  Criação visual
    // ─────────────────────────────────────────────────────────
    createSprite() {
        const hasMascot = this.scene.textures.exists('mascot_idle');

        if (this.team === 1 && hasMascot) {
            // ── Mascote IFMA ─────────────────────────────────
            this.sprite = this.scene.physics.add.image(
                this.x, this.y, 'mascot_idle'
            );

            // Tamanho de exibição fixo (os PNGs variam de tamanho)
            this.sprite.setDisplaySize(58, 78);
            this.sprite.setDepth(5);

            // Hitbox menor que o sprite visual
            this.sprite.body.setSize(22, 36);
            this.sprite.body.setOffset(18, 22);

            this.currentTexture  = 'mascot_idle';
            this.usesImageSprite = true;

        } else {
            // ── Círculo colorido (time 2 / fallback) ─────────
            const color = this.team === 1
                ? GameConfig.TEAMS.TEAM1.COLOR
                : GameConfig.TEAMS.TEAM2.COLOR;

            this.sprite = this.scene.add.circle(
                this.x, this.y,
                GameConfig.VISUAL.PLAYER_SIZE / 2,
                color
            );
            this.scene.physics.add.existing(this.sprite);
            this.sprite.setDepth(5);
            this.usesImageSprite = false;
        }

        // Física comum a todos os jogadores
        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.body.setBounce(0.2);
        this.sprite.body.setDrag(300, 300);

        // Referência reversa para callbacks de colisão
        this.sprite.player = this;

        // Texto do nome acima do sprite
        const nameOffsetY = this.usesImageSprite ? -48 : -26;
        this.nameText = this.scene.add.text(
            this.x,
            this.y + nameOffsetY,
            this.playerName,
            {
                fontSize: '11px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
            }
        ).setOrigin(0.5).setDepth(10);
    }

    // ─────────────────────────────────────────────────────────
    //  Update por frame
    // ─────────────────────────────────────────────────────────
    update(delta) {
        // Sincroniza posição lógica com o corpo físico
        this.x = this.sprite.x;
        this.y = this.sprite.y;

        // Nome acompanha o sprite
        if (this.nameText) {
            const offsetY = this.usesImageSprite ? -48 : -26;
            this.nameText.setPosition(this.x, this.y + offsetY);
        }

        // Cooldowns
        if (this.kickCooldown   > 0) this.kickCooldown   -= delta;
        if (this.actionCooldown > 0) this.actionCooldown -= delta;

        // Stamina
        const dtSec = delta / 1000;
        if (this.isSprinting && this.staminaCurrent > 0) {
            this.staminaCurrent = Math.max(0,
                this.staminaCurrent - GameConfig.TIMING.STAMINA_DRAIN_RATE * dtSec);
        } else if (this.staminaCurrent < this.stats.stamina) {
            this.staminaCurrent = Math.min(this.stats.stamina,
                this.staminaCurrent + GameConfig.TIMING.STAMINA_RECOVERY_RATE * dtSec);
        }

        // Visual
        if (this.usesImageSprite) {
            this.updateSpriteTexture();
        } else {
            this.updateCircleAnimation();
        }
    }

    // ─────────────────────────────────────────────────────────
    //  Troca de textura conforme estado (mascote)
    // ─────────────────────────────────────────────────────────
    updateSpriteTexture() {
        const newTex = Player.STATE_TEXTURES[this.state] || 'mascot_idle';

        if (newTex !== this.currentTexture) {
            this.sprite.setTexture(newTex);
            // Garante tamanho consistente (cada PNG pode ter dimensão diferente)
            this.sprite.setDisplaySize(58, 78);
            this.currentTexture = newTex;
        }

        // Espelha horizontalmente conforme direção de movimento
        const vx = this.sprite.body.velocity.x;
        if (Math.abs(vx) > 15) {
            this.sprite.setFlipX(vx < 0);
        }
    }

    // ─────────────────────────────────────────────────────────
    //  Animação de inclinação (círculos do time 2)
    // ─────────────────────────────────────────────────────────
    updateCircleAnimation() {
        const speed = Math.hypot(
            this.sprite.body.velocity.x,
            this.sprite.body.velocity.y
        );
        const lean = speed > 10
            ? (speed / this.stats.speed) * GameConfig.VISUAL.RUN_LEAN_ANGLE
            : 0;
        this.sprite.setRotation(lean);
    }

    // ─────────────────────────────────────────────────────────
    //  Chute
    // ─────────────────────────────────────────────────────────
    kick(ball, targetX, targetY, chargeTime = 0) {
        if (this.kickCooldown > 0) return false;

        const maxChargeTime    = 1.5;
        const normalizedCharge = Math.min(chargeTime, maxChargeTime) / maxChargeTime;
        const power            = MathHelpers.lerp(200, 800, normalizedCharge);

        const baseAngle    = MathHelpers.angleBetween(this.x, this.y, targetX, targetY);
        const staminaFactor = 1 - (this.staminaCurrent / this.stats.stamina);
        const angle        = baseAngle + MathHelpers.randomGaussian(0, 0.15 * staminaFactor);

        ball.body.setVelocity(
            Math.cos(angle) * power,
            Math.sin(angle) * power
        );

        ball.lastTouchedBy = this;
        this.kickCooldown  = GameConfig.TIMING.KICK_COOLDOWN;

        // Recuo ao chutar
        this.sprite.body.velocity.x *= 0.6;
        this.sprite.body.velocity.y *= 0.6;

        return true;
    }

    // ─────────────────────────────────────────────────────────
    //  Movimento
    // ─────────────────────────────────────────────────────────
    moveTo(targetX, targetY, sprint = false) {
        const angle    = MathHelpers.angleBetween(this.x, this.y, targetX, targetY);
        const distance = MathHelpers.distance(this.x, this.y, targetX, targetY);

        let speed = this.maxSpeed;
        if (sprint && this.staminaCurrent > 0) {
            speed *= GameConfig.PHYSICS.PLAYER.SPRINT_MULTIPLIER;
            this.isSprinting = true;
        } else {
            this.isSprinting = false;
        }

        // Desacelera ao aproximar do alvo
        if (distance < 50) speed *= (distance / 50);

        this.sprite.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        this.targetDirection = angle;
        this.setState(PlayerStates.RUNNING);
    }

    stop() {
        this.sprite.body.setVelocity(0, 0);
        this.setState(PlayerStates.IDLE);
        this.isSprinting = false;
    }

    setState(newState) {
        if (this.state !== newState) {
            this.previousState = this.state;
            this.state = newState;
        }
    }

    destroy() {
        if (this.sprite)   this.sprite.destroy();
        if (this.nameText) this.nameText.destroy();
    }
}
