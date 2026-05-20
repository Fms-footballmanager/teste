/**
 * SettingsScene.js
 * 
 * Tela de configurações para ajustar FPS e outras opções.
 */

class SettingsScene extends Phaser.Scene {
    constructor() {
        super('SettingsScene');
    }

    create() {
        // Fundo
        this.add.rectangle(
            GameConfig.FIELD.WIDTH / 2, 
            GameConfig.FIELD.HEIGHT / 2, 
            GameConfig.FIELD.WIDTH, 
            GameConfig.FIELD.HEIGHT, 
            0x1a5f2e
        );
        
        // Título
        this.add.text(
            GameConfig.FIELD.WIDTH / 2, 
            200, 
            'Settings', 
            { 
                fontSize: '48px', 
                fill: '#fff',
                fontFamily: 'Arial Black'
            }
        ).setOrigin(0.5);
        
        // Opções de FPS
        const fpsOptions = [30, 60, 120];
        const currentFPS = this.game.loop.targetFps || 60;
        
        this.add.text(
            GameConfig.FIELD.WIDTH / 2, 
            280, 
            'Frame Rate:', 
            { 
                fontSize: '24px', 
                fill: '#fff'
            }
        ).setOrigin(0.5);
        
        fpsOptions.forEach((fps, i) => {
            const isSelected = fps === currentFPS;
            const btn = this.add.text(
                GameConfig.FIELD.WIDTH / 2, 
                340 + i * 60, 
                `${fps} FPS`, 
                { 
                    fontSize: '24px', 
                    fill: isSelected ? '#ffff00' : '#fff',
                    backgroundColor: '#00000088',
                    padding: { x: 20, y: 10 }
                }
            ).setOrigin(0.5).setInteractive();
            
            btn.on('pointerover', () => {
                btn.setStyle({ fill: '#ffff00' });
            });
            
            btn.on('pointerout', () => {
                btn.setStyle({ fill: isSelected ? '#ffff00' : '#fff' });
            });
            
            btn.on('pointerdown', () => {
                // Ajusta FPS
                this.game.loop.targetFps = fps;
                
                // Visual feedback
                this.cameras.main.flash(200, 255, 255, 255, false);
                
                // Retorna ao menu principal após breve delay
                this.time.delayedCall(300, () => {
                    this.scene.start('MainMenuScene');
                });
            });
        });
        
        // Botão de voltar
        const backBtn = this.add.text(
            GameConfig.FIELD.WIDTH / 2, 
            600, 
            'Back', 
            { 
                fontSize: '32px', 
                fill: '#fff',
                backgroundColor: '#00000088',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setInteractive();
        
        backBtn.on('pointerover', () => {
            backBtn.setStyle({ fill: '#ffff00' });
        });
        
        backBtn.on('pointerout', () => {
            backBtn.setStyle({ fill: '#fff' });
        });
        
        backBtn.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
    }
}
