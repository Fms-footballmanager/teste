/**
 * MainMenuScene.js
 * 
 * Tela inicial do jogo com opções para iniciar ou acessar configurações.
 */

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        // Fundo gradient
        this.add.rectangle(
            GameConfig.FIELD.WIDTH / 2, 
            GameConfig.FIELD.HEIGHT / 2, 
            GameConfig.FIELD.WIDTH, 
            GameConfig.FIELD.HEIGHT, 
            0x1a5f2e
        );
        
        // Título do jogo
        this.add.text(
            GameConfig.FIELD.WIDTH / 2, 
            200, 
            'Tactical Football Manager', 
            { 
                fontSize: '48px', 
                fill: '#fff',
                fontFamily: 'Arial Black'
            }
        ).setOrigin(0.5);
        
        // Botão Start Game
        const startBtn = this.add.text(
            GameConfig.FIELD.WIDTH / 2, 
            400, 
            'Start Game', 
            { 
                fontSize: '32px', 
                fill: '#fff',
                backgroundColor: '#00000088',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setInteractive();
        
        startBtn.on('pointerover', () => {
            startBtn.setStyle({ fill: '#ffff00' });
        });
        
        startBtn.on('pointerout', () => {
            startBtn.setStyle({ fill: '#fff' });
        });
        
        startBtn.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
        
        // Botão Settings
        const configBtn = this.add.text(
            GameConfig.FIELD.WIDTH / 2, 
            480, 
            'Settings', 
            { 
                fontSize: '32px', 
                fill: '#fff',
                backgroundColor: '#00000088',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setInteractive();
        
        configBtn.on('pointerover', () => {
            configBtn.setStyle({ fill: '#ffff00' });
        });
        
        configBtn.on('pointerout', () => {
            configBtn.setStyle({ fill: '#fff' });
        });
        
        configBtn.on('pointerdown', () => {
            this.scene.start('SettingsScene');
        });
        
        // Instruções
        this.add.text(
            GameConfig.FIELD.WIDTH / 2, 
            600, 
            'Use mouse para selecionar jogador\nSetas para mover, Espaço para chutar', 
            { 
                fontSize: '16px', 
                fill: '#ffffff88',
                align: 'center'
            }
        ).setOrigin(0.5);
    }
}
