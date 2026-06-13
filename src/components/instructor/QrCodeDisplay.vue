<script setup>
import { ref, onMounted, watch } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  payload: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    default: 300,
  }
})

const canvasRef = ref(null)

async function generateQr() {
  if (!canvasRef.value || !props.payload) return
  
  try {
    await QRCode.toCanvas(canvasRef.value, props.payload, {
      width: props.size,
      margin: 2,
      color: {
        dark: '#181818',
        light: '#FFFFFF'
      }
    })
  } catch (err) {
    console.error('Failed to generate QR code', err)
  }
}

onMounted(() => {
  generateQr()
})

watch(() => props.payload, () => {
  generateQr()
})
</script>

<template>
  <div class="bg-white p-4 rounded-xl border border-outline-variant inline-block">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>
