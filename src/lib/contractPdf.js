/**
 * Professional Marine Construction Contract PDF Generator
 * Corporate letterhead design with navy/dark gray accents
 */
import jsPDF from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import QRCode from 'qrcode'

const MARGIN = 25.4 // 1 inch
const PAGE_WIDTH = 215.9 // A4 mm
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN

// Marine theme colors (RGB 0-255)
const NAVY = [33, 42, 58]       // #212a3a
const DARK_GRAY = [73, 80, 87] // #495057
const ACCENT = [238, 114, 26]  // #ee721a (orange from logo)
const LIGHT_GRAY = [248, 249, 250]

function generateContractId() {
  const year = new Date().getFullYear()
  const rnd = Math.floor(1000 + Math.random() * 9000) // 1000-9999
  return `MC-${year}-${rnd}`
}

export function generateContractIdForNew() {
  return generateContractId()
}

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

async function getQRDataUrl(contractId) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://rubensconstruction.com'
  const verifyUrl = `${baseUrl}/verify/${contractId}`
  return QRCode.toDataURL(verifyUrl, { width: 80, margin: 1 })
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

export async function generateContractPdf(options) {
  const {
    form,
    totalAmount,
    contractorSignature,
    clientSignature,
    contractId,
    logoBase64: logoPassed
  } = options
  const logoBase64 = logoPassed || await loadLogoAsBase64()

  const doc = new jsPDF()
  const pageHeight = doc.internal.pageSize.getHeight()

  // --- HEADER (Letterhead) ---
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

  // Contract ID top right
  doc.setFontSize(9)
  doc.setTextColor(238, 114, 26)
  doc.text(contractId, PAGE_WIDTH - MARGIN, 15, { align: 'right' })
  doc.setFontSize(8)
  doc.setTextColor(200, 200, 200)
  doc.text('Contract ID', PAGE_WIDTH - MARGIN, 22, { align: 'right' })

  // Divider
  doc.setDrawColor(...ACCENT)
  doc.setLineWidth(0.8)
  doc.line(MARGIN, headerH, PAGE_WIDTH - MARGIN, headerH)

  let y = headerH + 16

  // --- TITLE ---
  doc.setTextColor(...NAVY)
  doc.setFont('times', 'bold')
  doc.setFontSize(16)
  doc.text('MARINE CONSTRUCTION SERVICES AGREEMENT', PAGE_WIDTH / 2, y, { align: 'center' })
  y += 12

  // Issue & Effective dates
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...DARK_GRAY)
  doc.text(`Issue Date: ${form.issueDate || form.contractDate}    Effective Date: ${form.effectiveDate || form.contractDate}`, MARGIN, y)
  y += 10

  // --- INTRO ---
  doc.setFont('times', 'normal')
  doc.setFontSize(10)
  const intro = `This Marine Construction Services Agreement ("Agreement") is made and entered into as of ${form.effectiveDate || form.contractDate} ("Effective Date"), by and between:`
  const introLines = doc.splitTextToSize(intro, CONTENT_WIDTH)
  doc.text(introLines, MARGIN, y)
  y += introLines.length * 5 + 6

  doc.setFont('helvetica', 'bold')
  doc.text(`${form.contractorLegalName || "Ruben's Construction & Repair"},`, MARGIN, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.text('a duly organized and legally existing entity,', MARGIN, y)
  y += 5
  doc.text('(hereinafter referred to as the "Contractor"),', MARGIN, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.text('AND', MARGIN, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.text(`Company / Client Name: ${form.companyName || '[Company or Client Name]'}`, MARGIN, y)
  y += 6
  doc.text(`Legal Representative: ${form.legalName || '[Full Legal Name]'}`, MARGIN, y)
  y += 5
  doc.text(`Address: ${form.residence || '[Client Address]'}`, MARGIN, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.text('(hereinafter referred to as the "Client").', MARGIN, y)
  y += 8
  doc.text('The Contractor and the Client may collectively be referred to as the "Parties."', MARGIN, y)
  y += 14

  // --- SECTION 1 ---
  doc.setFont('times', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...NAVY)
  doc.text('1. SCOPE OF WORK', MARGIN, y)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...DARK_GRAY)
  const scope1 = 'The Contractor agrees to furnish all necessary labor, supervision, equipment, materials, tools, marine vessels (if applicable), and expertise required to perform the following marine construction services:'
  doc.text(doc.splitTextToSize(scope1, CONTENT_WIDTH), MARGIN, y)
  y += 12
  doc.setFont('helvetica', 'bold')
  doc.text('Project Description:', MARGIN, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  const projDesc = form.projectDescription || form.items?.[0]?.description || '[Dock construction, seawall installation, pile driving, marine foundation work, coastal reinforcement, etc.]'
  const projLines = doc.splitTextToSize(projDesc, CONTENT_WIDTH)
  doc.text(projLines, MARGIN + 2, y)
  y += projLines.length * 5 + 6
  doc.text('All work shall be performed in a professional and workmanlike manner, in accordance with recognized marine construction industry standards and applicable federal, state, and local regulations.', MARGIN, y)
  y += 14

  // --- SECTION 2 ---
  doc.setFont('times', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...NAVY)
  doc.text('2. CONTRACT TYPE', MARGIN, y)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const typeLabels = { construction: 'Construction', repair: 'Repair', remodeling: 'Remodeling', maintenance: 'Maintenance', inspection: 'Inspection' }
  const typeLabel = typeLabels[form.contractType] || 'Construction'
  doc.text(`This Agreement constitutes a Marine ${typeLabel} Contract and may include structural marine works, shoreline protection, underwater foundation systems, and related coastal infrastructure services.`, MARGIN, y)
  y += 16

  // --- SECTION 3: PRICING (styled table) ---
  doc.setFont('times', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...NAVY)
  doc.text('3. CONTRACT PRICE AND PAYMENT TERMS', MARGIN, y)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.text('The Client agrees to compensate the Contractor as follows:', MARGIN, y)
  y += 10

  const tableBody = (form.items || [])
    .filter(i => i.description || i.price)
    .map(i => [i.description || '-', '$' + parseFloat(i.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })])
  if (tableBody.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Description of Work', 'Price (USD)']],
      body: tableBody,
      theme: 'plain',
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      columnStyles: { 0: { cellWidth: CONTENT_WIDTH * 0.7 }, 1: { cellWidth: CONTENT_WIDTH * 0.3, halign: 'right' } },
      margin: { left: MARGIN },
      tableLineColor: DARK_GRAY,
      tableLineWidth: 0.3,
      styles: { lineColor: DARK_GRAY, lineWidth: 0.2 }
    })
    y = doc.lastAutoTable.finalY + 8
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(`Total Contract Amount: $${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`, MARGIN, y)
  y += 12

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...NAVY)
  doc.text('Payment Terms:', MARGIN, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const advanceNotice = 'ADVANCE PAYMENT: A non-refundable advance payment of thirty percent (30%) of the total contract amount is required upon signing this Agreement. Work shall not commence until the advance payment has been received in full.'
  const advanceLines = doc.splitTextToSize(advanceNotice, CONTENT_WIDTH)
  doc.setTextColor(...ACCENT)
  doc.text(advanceLines, MARGIN, y)
  y += advanceLines.length * 5 + 6
  doc.setTextColor(...DARK_GRAY)
  const payTerms = form.paymentTerms || 'Initial Deposit: As agreed | Progress Payments: As agreed upon milestones | Final Payment: Upon substantial completion. Late payments may be subject to interest at the maximum rate permitted by law.'
  const payLines = doc.splitTextToSize(payTerms, CONTENT_WIDTH)
  doc.text(payLines, MARGIN, y)
  y += payLines.length * 5 + 14

  // --- SECTIONS 4-10 (condensed) ---
  const shortSections = [
    ['4. PROJECT SCHEDULE', "Work shall commence upon receipt of required permits, approvals, and initial payment. The Client acknowledges that marine construction projects may be affected by weather, tidal changes, storm events, governmental inspections, and material supply delays. The Contractor shall not be held liable for delays caused by circumstances beyond reasonable control."],
    ['5. PERMITS AND REGULATORY COMPLIANCE', "The Client shall be responsible for securing required permits. The Contractor shall perform work in compliance with applicable environmental and maritime regulations and shall not be liable for delays resulting from permitting issues outside its control."],
    ['6. CHANGE ORDERS', "Any changes to the Scope of Work must be documented through a written Change Order signed by both Parties. Such changes may result in adjustments to contract price and extensions of project timeline."],
    ['7. WARRANTIES', "The Contractor warrants that work will be performed in accordance with industry standards, materials shall meet commercial marine-grade specifications, and manufacturer warranties, if applicable, shall be transferred to the Client."],
    ['8. LIMITATION OF LIABILITY', "The Contractor shall not be responsible for acts of God, pre-existing structural deficiencies, or soil/subsurface conditions not reasonably detectable. Liability shall be limited to the value of the contract unless otherwise required by law."],
    ['9. DISPUTE RESOLUTION', "Any disputes shall first be resolved through good faith negotiation. If unresolved, disputes shall be subject to mediation or arbitration in accordance with the laws of the State where the project is located."],
    ['10. ENTIRE AGREEMENT', "This Agreement constitutes the entire understanding between the Parties and supersedes all prior communications."]
  ]
  for (const [title, body] of shortSections) {
    if (y > pageHeight - 50) { doc.addPage(); y = MARGIN }
    doc.setFont('times', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...NAVY)
    doc.text(title, MARGIN, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...DARK_GRAY)
    const bodyLines = doc.splitTextToSize(body, CONTENT_WIDTH)
    doc.text(bodyLines, MARGIN, y)
    y += bodyLines.length * 5 + 10
  }

  // --- SECTION 11: SIGNATURES ---
  doc.setFont('times', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...NAVY)
  doc.text('11. SIGNATURES', MARGIN, y)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text("IN WITNESS WHEREOF, the Parties have executed this Marine Construction Services Agreement as of the Effective Date.", MARGIN, y)
  y += 14

  const sigW = 75
  const sigH = 35
  const col1 = MARGIN
  const col2 = PAGE_WIDTH / 2 + 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('CONTRACTOR', col1, y)
  doc.text('CLIENT', col2, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Name: ${form.contractorSignatureName || '___________________________'}`, col1, y)
  doc.text(`Name: ${form.clientSignatureName || '___________________________'}`, col2, y)
  y += 8

  if (!form.skipContractorSignature && contractorSignature) {
    try { doc.addImage(contractorSignature, 'PNG', col1, y, sigW, sigH * 0.5) } catch (_) {}
  } else {
    doc.setDrawColor(180, 180, 180)
    doc.rect(col1, y, sigW, sigH, 'S')
  }
  if (!form.skipClientSignature && clientSignature) {
    try { doc.addImage(clientSignature, 'PNG', col2, y, sigW, sigH * 0.5) } catch (_) {}
  } else {
    doc.setDrawColor(180, 180, 180)
    doc.rect(col2, y, sigW, sigH, 'S')
  }
  y += sigH + 6
  doc.setFontSize(8)
  doc.text('Signature', col1, y)
  doc.text('Signature', col2, y)
  y += 6
  doc.text(`Date: ${form.effectiveDate || form.contractDate || '__________'}`, col1, y)
  doc.text(`Date: ${form.effectiveDate || form.contractDate || '__________'}`, col2, y)

  // --- QR CODE ---
  try {
    const qrData = await getQRDataUrl(contractId)
    doc.addImage(qrData, 'PNG', PAGE_WIDTH - MARGIN - 30, pageHeight - 45, 28, 28)
    doc.setFontSize(8)
    doc.setTextColor(...DARK_GRAY)
    doc.text('Contract Verification', PAGE_WIDTH - MARGIN - 16, pageHeight - 12, { align: 'center' })
  } catch (_) {}

  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    addFooter(doc, p, totalPages)
  }

  return doc
}
