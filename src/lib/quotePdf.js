/**
 * PDF de cotización simple con membretada
 * Incluye: logo, items, precios, nombres y disclaimer
 */
import jsPDF from 'jspdf'
import { autoTable } from 'jspdf-autotable'

const MARGIN = 25.4
const PAGE_WIDTH = 215.9
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN

const NAVY = [33, 42, 58]
const DARK_GRAY = [73, 80, 87]
const ACCENT = [238, 114, 26]

export async function loadLogoAsBase64(logoUrl) {
  try {
    const url = logoUrl || (import.meta.env.BASE_URL || '/') + 'assets/img/rubens-white.svg'
    return await new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = 0.25
        const w = Math.max(img.width * scale, 150)
        const h = Math.max(img.height * scale, 150)
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => resolve(null)
      img.src = url
      if (img.complete) img.onload()
    })
  } catch {
    return null
  }
}

function addFooter(doc, pageNum, totalPages) {
  doc.setFontSize(8)
  doc.setTextColor(...DARK_GRAY)
  doc.text(
    `Page ${pageNum} of ${totalPages} | Ruben's Construction & Repair | Marine Construction Services`,
    PAGE_WIDTH / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  )
}

export function generateQuoteId() {
  const year = new Date().getFullYear()
  const rnd = Math.floor(1000 + Math.random() * 9000)
  return `QT-${year}-${rnd}`
}

export async function generateQuotePdf(options) {
  const {
    clientName,
    companyName,
    clientAddress,
    preparedBy,
    items,
    totalAmount,
    disclaimer,
    quoteId,
    quoteDate,
    validUntil,
    logoBase64: logoPassed
  } = options

  const logoBase64 = logoPassed || await loadLogoAsBase64()

  const doc = new jsPDF()
  const pageHeight = doc.internal.pageSize.getHeight()

  // --- HEADER (membretada) ---
  const headerH = 48
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, PAGE_WIDTH, headerH, 'F')

  let headerX = MARGIN
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', MARGIN, 6, 36, 36)
      headerX = MARGIN + 42
    } catch (_) {}
  }

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('times', 'bold')
  doc.text("Ruben's Construction & Repair", headerX, 18)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('PO BOX 41 | Ruskin, FL 33575', headerX, 26)
  doc.text('Phone: 813 545 6976 | Email: rubenbalderas@yahoo.com', headerX, 32)
  doc.text('Marine Construction Services', headerX, 39)

  doc.setFontSize(9)
  doc.setTextColor(238, 114, 26)
  doc.text(quoteId || generateQuoteId(), PAGE_WIDTH - MARGIN, 15, { align: 'right' })
  doc.setFontSize(8)
  doc.setTextColor(200, 200, 200)
  doc.text('Quote ID', PAGE_WIDTH - MARGIN, 22, { align: 'right' })

  doc.setDrawColor(...ACCENT)
  doc.setLineWidth(0.8)
  doc.line(MARGIN, headerH, PAGE_WIDTH - MARGIN, headerH)

  let y = headerH + 16

  // --- Título ---
  doc.setTextColor(...NAVY)
  doc.setFont('times', 'bold')
  doc.setFontSize(16)
  doc.text('QUOTE / COTIZACIÓN', PAGE_WIDTH / 2, y, { align: 'center' })
  y += 14

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...DARK_GRAY)
  doc.text(`Date: ${quoteDate || new Date().toISOString().split('T')[0]}`, MARGIN, y)
  if (validUntil) {
    doc.text(`Valid Until: ${validUntil}`, PAGE_WIDTH / 2, y)
  }
  y += 12

  // --- Cliente ---
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...NAVY)
  doc.text('Prepared for:', MARGIN, y)
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  if (companyName) {
    doc.text(`Company: ${companyName}`, MARGIN, y)
    y += 6
  }
  doc.text(`Client Name: ${clientName || '[Client Name]'}`, MARGIN, y)
  y += 6
  if (clientAddress) {
    doc.text(`Address: ${clientAddress}`, MARGIN, y)
    y += 6
  }
  if (preparedBy) {
    doc.text(`Prepared by: ${preparedBy}`, MARGIN, y)
    y += 6
  }
  y += 10

  // --- Tabla de items ---
  doc.setFont('times', 'bold')
  doc.setFontSize(11)
  doc.text('Items & Pricing', MARGIN, y)
  y += 10

  const tableBody = (items || [])
    .filter(i => i.description || i.price)
    .map(i => [
      i.description || '-',
      '$' + parseFloat(i.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })
    ])

  if (tableBody.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Description', 'Price (USD)']],
      body: tableBody,
      theme: 'plain',
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: CONTENT_WIDTH * 0.7 },
        1: { cellWidth: CONTENT_WIDTH * 0.3, halign: 'right' }
      },
      margin: { left: MARGIN },
      tableLineColor: DARK_GRAY,
      tableLineWidth: 0.3
    })
    y = doc.lastAutoTable.finalY + 10
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(
    `Total: $${(parseFloat(totalAmount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`,
    MARGIN,
    y
  )
  y += 14

  // --- Advance Payment Notice ---
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...NAVY)
  doc.text('Advance Payment:', MARGIN, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...ACCENT)
  const advanceNotice = 'A non-refundable advance payment of thirty percent (30%) of the total amount is required upon acceptance of this quote and prior to commencement of work. The remaining balance shall be paid according to the terms agreed upon in the formal contract.'
  const advanceLines = doc.splitTextToSize(advanceNotice, CONTENT_WIDTH)
  doc.text(advanceLines, MARGIN, y)
  y += advanceLines.length * 5 + 10

  // --- Disclaimer ---
  const defaultDisclaimer =
    "This quote is valid for 30 days from the date of issue unless otherwise specified. Prices may be subject to change based on material availability and project scope. This is an estimate and not a binding contract until both parties have signed a formal agreement."
  const disclaimerText = disclaimer || defaultDisclaimer

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...NAVY)
  doc.text('Disclaimer:', MARGIN, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...DARK_GRAY)
  const discLines = doc.splitTextToSize(disclaimerText, CONTENT_WIDTH)
  doc.text(discLines, MARGIN, y)
  y += discLines.length * 4 + 10

  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    addFooter(doc, p, totalPages)
  }

  return doc
}
