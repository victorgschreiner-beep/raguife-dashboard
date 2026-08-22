// =============================================================================
// ExportService — geração de relatório em PDF
// =============================================================================
// Usa html2canvas + jsPDF para capturar o conteúdo do relatório renderizado
// em tela e paginá-lo em um PDF A4. Alternativa simples e sem dependência de
// backend; para relatórios corporativos mais ricos (capa, sumário navegável,
// marca d'água), considere gerar o PDF no servidor a partir dos mesmos dados.
// =============================================================================
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const ExportService = {
  async exportElementToPDF(elementId, filename = 'relatorio-ishikawa-ai.pdf') {
    const el = document.getElementById(elementId)
    if (!el) throw new Error(`Elemento #${elementId} não encontrado para exportação.`)

    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(filename)
  },

  printCurrentPage() {
    window.print()
  },
}
