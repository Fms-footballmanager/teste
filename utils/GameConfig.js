/**
 * GameConfig.js
 * 
 * Configurações globais do jogo
 */

const GameConfig = {
    // Dimensões do campo
    FIELD: {
        WIDTH: 1200,
        HEIGHT: 800,
        COLOR: 0x1a5f2e,
        LINE_COLOR: 0xffffff,
        LINE_WIDTH: 3
    },
    
    // Física
    PHYSICS: {
        PLAYER: {
            COLLISION_RADIUS: 15,
            MAX_SPEED: 200,
            ACCELERATION: 400,
            DECELERATION: 300,
            SPRINT_MULTIPLIER: 1.5
        },
        BALL: {
            RADIUS: 8,
            BOUNCE: 0.7,
            DRAG: 0.98,
            MAX_SPEED: 800
        }
    },
    
    // Timing
    TIMING: {
        MATCH_DURATION: 300, // 5 minutos em segundos
        KICK_COOLDOWN: 0.3, // 300ms
        STAMINA_RECOVERY_RATE: 5, // por segundo
        STAMINA_DRAIN_RATE: 10 // por segundo ao correr
    },
    
    // Visual
    VISUAL: {
        RUN_LEAN_ANGLE: 0.1,
        RUN_BOUNCE_FREQUENCY: 8,
        RUN_BOUNCE_AMPLITUDE: 2,
        PLAYER_SIZE: 30
    },
    
    // Roles
    ROLES: {
        SHOOTER: {
            statModifiers: {
                speed: 1.0,
                shootPower: 1.2,
                dribble: 1.1,
                defense: 0.8
            }
        },
        DEFENDER: {
            statModifiers: {
                speed: 0.9,
                shootPower: 0.7,
                dribble: 0.8,
                defense: 1.3
            }
        },
        MIDFIELDER: {
            statModifiers: {
                speed: 1.0,
                shootPower: 0.9,
                dribble: 1.0,
                defense: 1.0
            }
        }
    },
    
    // Teams
    TEAMS: {
        TEAM1: {
            COLOR: 0xff0000,
            NAME: 'Time Vermelho'
        },
        TEAM2: {
            COLOR: 0x0000ff,
            NAME: 'Time Azul'
        }
    }
};
