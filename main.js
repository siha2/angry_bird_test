class PhysicsGame extends Phaser.Scene {
    constructor() {
      super("PhysicsGame");
    }
  
    preload() {
      this.load.image("background", "media/background.png");
      this.load.image("bird", "media/bird.png");
      this.load.image("sling", "media/sling.png");
      this.load.image("target", "media/target.png");
    }
  
    create() {
      // جعل الخلفية تغطي الشاشة بالكامل
      this.background = this.add.image(400, 300, "background").setDisplaySize(800, 600);
  
      // إضافة المقلاع والطائر
      this.sling = this.add.image(150, 400, "sling");
      this.bird = this.matter.add.image(150, 400, "bird");
      this.bird.setCircle();
      this.bird.setStatic(true);
  
      // إضافة الخط المطاطي
      this.rubberBand = this.add.graphics({ lineStyle: { width: 4, color: 0xff0000 } });
      
      // متغيرات للتحكم في السحب
      this.isDragging = false;
      this.startX = this.bird.x;
      this.startY = this.bird.y;
      
      this.input.on("pointerdown", (pointer) => {
        if (this.bird.getBounds().contains(pointer.x, pointer.y)) {
          this.isDragging = true;
          this.bird.setStatic(false);
        }
      });
  
      this.input.on("pointermove", (pointer) => {
        if (this.isDragging) {
          // منع الطائر من التحرك بعيدًا جدًا
          let maxDistance = 100;
          let dx = pointer.x - this.startX;
          let dy = pointer.y - this.startY;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > maxDistance) {
            let angle = Math.atan2(dy, dx);
            this.bird.setVelocity(
              (Math.cos(angle) * maxDistance - (this.bird.x - this.startX)) * 0.2,
              (Math.sin(angle) * maxDistance - (this.bird.y - this.startY)) * 0.2
            );
          } else {
            this.bird.setVelocity((pointer.x - this.bird.x) * 0.2, (pointer.y - this.bird.y) * 0.2);
          }
        }
      });
  
      this.input.on("pointerup", () => {
        if (this.isDragging) {
          this.isDragging = false;
          let forceX = (this.startX - this.bird.x) * 0.15; // زيادة قوة الدفع
          let forceY = (this.startY - this.bird.y) * 0.15; // زيادة قوة الدفع
          this.bird.setVelocity(forceX, forceY);
        }
      });
  
      // إضافة الهدف
      this.target = this.matter.add.image(600, 400, "target");
      this.target.setStatic(true);

      // اكتشاف التصادم بين الطائر والهدف
      this.matter.world.on("collisionstart", (event) => {
        event.pairs.forEach((pair) => {
          if ((pair.bodyA === this.bird.body && pair.bodyB === this.target.body) || 
              (pair.bodyA === this.target.body && pair.bodyB === this.bird.body)) {
            this.winGame();
          }
        });
      });
    }
  
    update() {
      // تحديث الخط المطاطي أثناء السحب
      this.rubberBand.clear();
      if (this.isDragging) {
        this.rubberBand.lineStyle(4, 0xff0000); // جعل الحبل أحمر
        this.rubberBand.lineBetween(this.startX, this.startY, this.bird.x, this.bird.y);
      }
    }

    winGame() {
      let winMessage = this.add.text(300, 250, "You Win!", { 
        fontSize: "50px", 
        fill: "#ffffff", 
        backgroundColor: "#000000", 
        padding: { x: 20, y: 10 }
      });
      winMessage.setDepth(1);
      this.bird.setStatic(true);
    }
  }
  
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
      default: "matter",
      matter: {
        gravity: { y: 0.5 },
      },
    },
    scene: PhysicsGame,
  };
  
  const game = new Phaser.Game(config);