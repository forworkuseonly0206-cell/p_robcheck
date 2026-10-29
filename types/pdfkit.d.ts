//types/pdfkit.d.ts
declare module "pdfkit" {
  import { Writable } from "stream"

  interface PDFDocumentOptions {
    margin?: number
  }

  export default class PDFDocument extends Writable {
    constructor(options?: PDFDocumentOptions)

    fontSize(size: number): this
    text(text: string, options?: any): this
    moveDown(lines?: number): this
    end(): void
    on(event: "data", listener: (chunk: Buffer) => void): this
    on(event: "end", listener: () => void): this
  }
}
