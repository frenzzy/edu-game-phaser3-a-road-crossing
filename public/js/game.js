"use strict";
class Game extends Phaser.Scene {
    player;
    goal;
    enemies;
    playerSpeed = 3;
    enemyMinSpeed = 1;
    enemyMaxSpeed = 4.5;
    enemyMinY = 80;
    enemyMaxY = 280;
    isTerminating = false;
    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('enemy', 'assets/dragon.png');
        this.load.image('goal', 'assets/treasure.png');
    }
    create() {
        this.isTerminating = false;
        const bg = this.add.sprite(0, 0, 'background');
        bg.setOrigin(0, 0);
        const player = this.add.sprite(40, 180, 'player');
        player.setScale(0.5);
        this.player = player;
        const group = this.add.group();
        group.createMultiple({
            key: 'enemy',
            repeat: 5,
            setXY: {
                x: 90,
                y: 100,
                stepX: 80,
                stepY: 20,
            },
        });
        Phaser.Actions.ScaleXY(group.getChildren(), -0.5, -0.5);
        Phaser.Actions.Call(group.getChildren(), (obj) => {
            const enemy = obj;
            enemy.flipX = true;
            const dir = Math.random() > 0.5 ? 1 : -1;
            const speed = this.enemyMinSpeed + Math.random() * (this.enemyMaxSpeed - this.enemyMinSpeed);
            enemy.speed = dir * speed;
        }, this);
        this.enemies = group;
        const goal = this.add.sprite(560, 180, 'goal');
        goal.setScale(0.5);
        this.goal = goal;
    }
    update() {
        if (this.isTerminating)
            return;
        if (this.input.activePointer.isDown) {
            this.player.x += this.playerSpeed;
        }
        const playerRect = this.player.getBounds();
        const goalRect = this.goal.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, goalRect)) {
            return this.scene.restart();
        }
        for (const obj of this.enemies.getChildren()) {
            const enemy = obj;
            enemy.y += enemy.speed;
            const conditionUp = enemy.speed < 0 && enemy.y <= this.enemyMinY;
            const conditionDown = enemy.speed > 0 && enemy.y >= this.enemyMaxY;
            if (conditionUp || conditionDown) {
                enemy.speed *= -1;
            }
            const enemyRect = enemy.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)) {
                return this.gameOver();
            }
        }
    }
    gameOver() {
        this.isTerminating = true;
        this.cameras.main.shake(500);
        this.cameras.main.on('camerashakecomplete', () => {
            this.cameras.main.fade(500);
        }, this);
        this.cameras.main.on('camerafadeoutcomplete', () => {
            this.scene.restart();
        }, this);
    }
}
const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    scene: Game,
});
