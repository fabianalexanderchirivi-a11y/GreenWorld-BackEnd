import { PDFDocument } from "pdfkit"

const fechaLegible = (value) => new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota"
}).format(new Date(value))

const generarPdfCertificado = (certificate) => new Promise((resolve, reject) => {
    const document = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 0,
        info: {
            Title: `Certificado Green World ${certificate.codigo_certificado}`,
            Author: "Green World",
            Subject: "Certificado de finalizacion de curso"
        }
    })
    const chunks = []
    document.on("data", (chunk) => chunks.push(chunk))
    document.on("error", reject)
    document.on("end", () => resolve(Buffer.concat(chunks)))

    const width = document.page.width
    const height = document.page.height
    const name = `${certificate.nombre} ${certificate.apellido}`.trim()

    document.rect(0, 0, width, height).fill("#f5fbf8")
    document.rect(24, 24, width - 48, height - 48).lineWidth(3).stroke("#087f65")
    document.rect(36, 36, width - 72, height - 72).lineWidth(1).stroke("#68c8a1")
    document.fillColor("#075b49").font("Helvetica-Bold")
        .fontSize(20).text("GREEN WORLD", 70, 66, { width: width - 140, align: "center" })
    document.fillColor("#12372f").fontSize(32)
        .text("CERTIFICADO DE FINALIZACION", 70, 130, { width: width - 140, align: "center" })
    document.fillColor("#48645c").font("Helvetica").fontSize(16)
        .text("Se certifica que", 70, 206, { width: width - 140, align: "center" })
    document.fillColor("#075b49").font("Helvetica-Bold").fontSize(name.length > 45 ? 23 : 29)
        .text(name, 70, 245, { width: width - 140, height: 48, align: "center", ellipsis: true })
    document.fillColor("#48645c").font("Helvetica").fontSize(16)
        .text("finalizo satisfactoriamente el curso", 70, 313, { width: width - 140, align: "center" })
    document.fillColor("#12372f").font("Helvetica-Bold").fontSize(certificate.curso.length > 50 ? 20 : 25)
        .text(certificate.curso, 70, 350, { width: width - 140, height: 70, align: "center", ellipsis: true })

    document.moveTo(95, 455).lineTo(width - 95, 455).lineWidth(1).stroke("#68c8a1")
    document.fillColor("#48645c").font("Helvetica").fontSize(11)
        .text(`Finalizado: ${fechaLegible(certificate.fecha_finalizacion)}`, 75, 476, { width: 310 })
        .text(`Emitido: ${fechaLegible(certificate.fecha_emision)}`, width - 385, 476, { width: 310, align: "right" })
    document.fillColor("#075b49").fontSize(10)
        .text(`Codigo de verificacion: ${certificate.codigo_certificado}`, 75, 515, {
            width: width - 150,
            align: "center"
        })
    document.end()
})

export { generarPdfCertificado }
