import { Button, VStack, Text } from "@chakra-ui/react"
import ReactQrCode from "react-qr-code"
import { useRef, type ReactNode } from "react"

interface DownloadInfoItem {
  label: string
  value: string
}

interface QrCodeProps {
  value: string
  size?: number | string
  downloadable?: boolean
  downloadName?: string
  downloadTitle?: string
  downloadInfo?: DownloadInfoItem[]
  children?: ReactNode
}

export function QrCode({
  value,
  size = 200,
  downloadable = false,
  downloadName = "qr-code-tracking.jpg",
  downloadTitle,
  downloadInfo,
  children,
}: QrCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  const pixelSize = typeof size === "number" ? size : Number.parseInt(size, 10) || 200

  const downloadJpeg = () => {
    const svg = qrRef.current?.querySelector("svg")
    if (!svg) return

    const svgMarkup = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" })
    const imageUrl = URL.createObjectURL(svgBlob)
    const image = new Image()

    image.onload = () => {
      const canvasWidth = Math.max(720, pixelSize + 96)
      const outerPadding = 48
      const cardPadding = 32
      const headerHeight = downloadTitle ? 112 : 72
      const qrAreaSize = pixelSize + cardPadding * 2
      const infoWidth = canvasWidth - outerPadding * 2 - cardPadding * 2
      const labelWidth = 150
      const valueWidth = infoWidth - labelWidth
      const lineHeight = 34
      const measureCanvas = document.createElement("canvas")
      const measureContext = measureCanvas.getContext("2d")
      if (!measureContext) {
        URL.revokeObjectURL(imageUrl)
        return
      }
      const wrapText = (text: string, maxWidth: number, font: string): string[] => {
        measureContext.font = font
        const words = (text || "-").split(" ")
        const lines: string[] = []
        let current = ""
        words.forEach((word) => {
          const candidate = current ? `${current} ${word}` : word
          if (measureContext.measureText(candidate).width > maxWidth && current) {
            lines.push(current)
            current = word
          } else {
            current = candidate
          }
        })
        if (current) lines.push(current)
        return lines.length > 0 ? lines : ["-"]
      }

      const infoRows = (downloadInfo || []).map((item) => ({
        item,
        lines: wrapText(item.value, valueWidth, "bold 24px Arial"),
      }))
      const infoHeight = infoRows.reduce((height, row) => height + Math.max(1, row.lines.length) * lineHeight + 20, 0)
      const canvasHeight = outerPadding * 2 + headerHeight + qrAreaSize + 32 + infoHeight + 24

      const canvas = document.createElement("canvas")
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      const context = canvas.getContext("2d")
      if (!context) {
        URL.revokeObjectURL(imageUrl)
        return
      }

      context.fillStyle = "#F3F6FA"
      context.fillRect(0, 0, canvas.width, canvas.height)

      const cardX = outerPadding
      const cardY = outerPadding
      const cardWidth = canvasWidth - outerPadding * 2
      const cardHeight = canvasHeight - outerPadding * 2
      context.fillStyle = "#FFFFFF"
      context.beginPath()
      context.roundRect(cardX, cardY, cardWidth, cardHeight, 24)
      context.fill()

      context.fillStyle = "#123B5D"
      context.beginPath()
      context.roundRect(cardX, cardY, cardWidth, headerHeight, 24)
      context.fill()
      context.fillRect(cardX, cardY + headerHeight - 24, cardWidth, 24)

      if (downloadTitle) {
        context.fillStyle = "#FFFFFF"
        context.font = "bold 30px Arial"
        context.textAlign = "center"
        context.fillText(downloadTitle, canvasWidth / 2, cardY + 50)
        context.fillStyle = "#C8D8E5"
        context.font = "20px Arial"
        context.fillText("KARTU TRACKING PENDAFTARAN", canvasWidth / 2, cardY + 84)
      } else {
        context.fillStyle = "#FFFFFF"
        context.font = "bold 26px Arial"
        context.textAlign = "center"
        context.fillText("QR TRACKING PENDAFTARAN", canvasWidth / 2, cardY + 46)
      }

      const qrX = canvasWidth / 2 - pixelSize / 2
      const qrY = cardY + headerHeight + cardPadding
      context.fillStyle = "#FFFFFF"
      context.shadowColor = "rgba(18, 59, 93, 0.14)"
      context.shadowBlur = 18
      context.beginPath()
      context.roundRect(qrX - 16, qrY - 16, pixelSize + 32, pixelSize + 32, 16)
      context.fill()
      context.shadowColor = "transparent"
      context.drawImage(image, qrX, qrY, pixelSize, pixelSize)

      let yPos = qrY + pixelSize + cardPadding + 24
      if (downloadInfo && downloadInfo.length > 0) {
        context.textAlign = "left"
        infoRows.forEach(({ item, lines }) => {
          context.fillStyle = "#718096"
          context.font = "20px Arial"
          context.fillText(item.label.toUpperCase(), cardX + cardPadding, yPos)

          context.fillStyle = "#172B4D"
          context.font = "bold 24px Arial"
          lines.forEach((line, lineIndex) => {
            context.fillText(line, cardX + cardPadding + labelWidth, yPos + lineIndex * lineHeight)
          })
          yPos += Math.max(1, lines.length) * lineHeight + 20
        })
      }

      context.fillStyle = "#A0AEC0"
      context.font = "18px Arial"
      context.textAlign = "center"
      context.fillText("Scan QR untuk melihat status pendaftaran", canvasWidth / 2, canvasHeight - outerPadding - 18)

      const link = document.createElement("a")
      link.href = canvas.toDataURL("image/jpeg", 0.95)
      link.download = downloadName
      link.click()
      URL.revokeObjectURL(imageUrl)
    }

    image.src = imageUrl
  }

  return (
    <VStack gap="3">
      <div ref={qrRef} style={{ width: pixelSize, height: pixelSize, background: "#ffffff" }}>
        <ReactQrCode
          value={value}
          size={pixelSize}
          bgColor="#ffffff"
          fgColor="#111827"
          style={{ display: "block", width: pixelSize, height: pixelSize }}
        />
      </div>
      {children}
      {downloadable && (
        <Button size="sm" variant="outline" colorPalette="blue" onClick={downloadJpeg}>
          <Text>Unduh QR Code JPEG</Text>
        </Button>
      )}
    </VStack>
  )
}
