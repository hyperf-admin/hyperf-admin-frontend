<template>
  <div v-show="draggerShow" class="page">
    <div class="dragger">
      <div class="dragger-img">
        <canvas id="canvas-bg" :width="width" :height="height" />
        <canvas id="canvas-slice" :width="width" :height="height" />
        <div v-show="error" class="dragger-error">请正确完成拼图</div>
      </div>
      <div v-if="suc" class="dragger-suc">
        <i class="el-icon-success" />
        <div class="suc-txt">通过验证</div>
      </div>
      <div class="slider">
        <div class="track">拖动滑块完成拼图</div>
        <div
          class="btn dragger-btn"
          @mousedown.stop="onMouseDown"
        >
          <el-button v-show="!dragging" circle icon="el-icon-sort" @click.stop />
          <el-button v-show="dragging" circle icon="el-icon-minus" @click.stop />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'DragLocker',
  props: {
    draggerShow: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      slider: {
        mx: 0, // 滑块初始位置
        bx: 0, // 目标初始位置
        by: 0
      },
      startX: 0,
      dragging: false,
      width: 260,
      height: 160,
      diff: 0,
      error: false,
      suc: false
    }
  },
  watch: {
    draggerShow() {
      this.suc = false
      this.handleCanvasInit()
    }
  },
  // mounted() {
  //   console.log('53------')
  //   this.handleCanvasInit(1)
  // },
  methods: {
    onMouseDown(e) {
      this.startX = e.clientX
      this.onDragStart(e)
      window.addEventListener('mousemove', this.onDragging)
      window.addEventListener('touchmove', this.onDragging)
      window.addEventListener('mouseup', this.onDragEnd)
      window.addEventListener('touchend', this.onDragEnd)
      window.addEventListener('contextmenu', this.onDragEnd)
    },
    onDragStart(e) {
      this.dragging = true
    },
    onDragging(e) {
      if (this.dragging && this.startX) {
        // 判断是否是本组件在拖拽
        const x = e.clientX
        const diff = x - this.startX
        this.diff = diff
        if (diff > 0 && diff <= this.width - this.slider.bx - 40) {
          this.setPositon(diff)
        }
      }
    },
    setPositon() {
      const draggerBtn = document.getElementsByClassName('dragger-btn')
      const canvasSlice = document.getElementById('canvas-slice')
      draggerBtn[0].style.transform = `translate(${this.diff}px, -50%)`
      canvasSlice.style.transform = `translate(${this.diff}px, 0)`
    },
    onDragEnd(e) {
      this.dragging = false
      const offset = Math.abs(this.slider.mx - this.slider.bx - this.diff)
      this.diff = 0
      if (offset <= 1) {
        this.showSucc()
      } else {
        this.showError()
      }
      this.setPositon()
      window.removeEventListener('mousemove', this.onDragging)
      window.removeEventListener('touchmove', this.onDragging)
      window.removeEventListener('mouseup', this.onDragEnd)
      window.removeEventListener('touchend', this.onDragEnd)
      window.removeEventListener('contextmenu', this.onDragEnd)
    },
    showError() {
      this.error = true
      this.setPositon()
      this.handleCanvasInit()
      const timer = setTimeout(() => {
        this.error = false
        clearTimeout(timer)
      }, 1500)
    },
    showSucc() {
      this.suc = true
      const timer = setTimeout(() => {
        this.$emit('change', false)
        clearTimeout(timer)
      }, 1500)
    },
    handleDrag() {
      // 途中 滑块与目标元素间的距离
    },
    // 难点 滑块与目标的重合是怎么做的
    handleCanvasInit(x) {
      // 注释部分是一个 clip和restore的实力，你可以在每个圆的绘制结束移动 ctx.clip()
      // const canvas = document.getElementById('canvas-bg')
      // const ctx = canvas.getContext('2d')
      // const { width, height } = canvas
      // const cx = 70
      // const cy = 70
      // const radius = 50
      // ctx.save();
      // // 绘制第一个圆
      // ctx.beginPath()
      // ctx.fillStyle = 'tomato'
      // ctx.arc(cx, cy, radius, 0, Math.PI * 2, false)
      // ctx.fill()
      // // 绘制第二个圆
      // ctx.beginPath()
      // ctx.fillStyle = '#333'
      // ctx.arc(cx + 20, cy, radius, 0, Math.PI * 2, false)
      // ctx.fill()
      // // 绘制第三个圆
      // ctx.beginPath()
      // ctx.fillStyle = 'cornsilk'
      // ctx.arc(cx, cy + 20, radius, 0, Math.PI * 2, false)
      // ctx.fill()
      // ctx.clip()
      // ctx.restore(
      // 绘制第四个圆
      // ctx.beginPath()
      // ctx.strokeStyle = '#ccc'
      // ctx.lineWidth = 10
      // ctx.arc(cx, cy, radius, 0, Math.PI * 2, false)
      // ctx.stroke()
      const random = (min, max) => {
        return Math.floor(
          Math.random() * (max - min + 1) + min
        )
      }
      const mx = random(140, 180)
      const bx = random(20, 95)
      const y = random(40, 100)
      const r = 7
      const w = random(20, 40)
      this.slider.mx = mx
      this.slider.bx = bx
      this.slider.by = y
      console.log(36, r, w)
      const canvas = document.getElementById('canvas-bg')
      const canvasSlice = document.getElementById('canvas-slice')
      const ctx = canvas.getContext('2d')
      const ctx2 = canvasSlice.getContext('2d')
      const { width, height } = canvas
      /* clip的文档很简单
      *****save https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/save 文档中有可保存的东西
      *save restore是最关键的一步，clip裁剪之后，但钱花不的其他区域罩上了朦层不可以被操作，
      *只有通过保存clip之前的状态，再将其恢复，这个时候清楚画布可以完全的才删除，
      *如果不恢复到clip之前的状态，他将在画布清除之后/再重会之时依然存在，下次的clip可能看不到或者存在第一次clip的区域
      */
      ctx2.restore()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx2.clearRect(0, 0, canvasSlice.width, canvasSlice.height)
      const imgSrc = require('@/assets/img/back.jpg')
      const img = new Image()
      img.src = imgSrc
      img.onload = function() {
        console.log(width, height)
        ctx.drawImage(img, 0, 0, width, height)
        ctx2.drawImage(img, 0, 0, ctx2.width, ctx2.height)
      }
      const mainxy = { x: mx, y, r, w }
      const blockxy = { x: bx, y, r, w }
      this.drawBlock(ctx, mainxy, 'fill')
      this.drawBlock(ctx2, blockxy, 'clip')
    },
    drawBlock(ctx, xy, type) {
      const x = xy.x
      const y = xy.y
      const w = xy.w
      const r = xy.r
      const PI = Math.PI
      console.log(168168, y)
      // 绘制
      ctx.beginPath()
      // left
      ctx.moveTo(x, y)
      // top // 此步骤与上一步的x方向的偏差，就是一条直线
      ctx.arc(x + (w + 5) / 2, y, r, -PI, 0, true)
      ctx.lineTo(x + w + 5, y)
      // right
      ctx.arc(x + w + 5, y + w / 2, r, 1.5 * PI, 0.5 * PI, false)
      ctx.lineTo(x + w + 5, y + w)
      // bottom
      ctx.arc(x + (w + 5) / 2, y + w, r, 0, PI, false)
      ctx.lineTo(x, y + w)
      ctx.arc(x, y + w / 2, r, 0.5 * PI, 1.5 * PI, true)
      ctx.lineTo(x, y)
      // 修饰，没有颜色会看不出效果
      ctx.lineWidth = 1
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.closePath()
      ctx.stroke()
      ctx.save()
      ctx[type]()
      // 此步骤的api https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Compositing
      ctx.globalCompositeOperation = 'source-out'
    }
  }

}
</script>
<style lang="less" scoped>
.page{
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 100000;
  .dragger{
    position: absolute;
    top: 50%;
    left: 50%;
    width: 280px;
    height: 280px;
    transform: translate(-50%, -50%);
    background-color: #fff;
    padding: 10px;
    border-radius: 20px;
    .dragger-img{
      position: relative;
      #canvas-slice{
        position: absolute;
        left: 0;
        top: 0;
      }
      .dragger-error{
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 20px;
        text-align: center;
        background: red;
        color: #ffffff;
      }
    }
    .dragger-suc{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        font-size: 18px;
        font-weight: bold;
        z-index: 1111;
        background-color: #fff;
        color: green;
        text-align: center;
        vertical-align: middle;
        padding-top: 100px;
        border-radius: 30px;
        .suc-txt{
          margin-top: 5px;
        }
      }
  }
  .slider{
    position: relative;
    height: 30px;
    line-height: 30px;
    border-radius: 15px;
    background: #aaa;
    color: #d2d2d2;
    text-align: center;
    margin: 20px 0 0;
    .btn{
      position: absolute;
      left: 0;
      top: 50%;
      transform: translate(0, -50%)
    }
  }
}
</style>
