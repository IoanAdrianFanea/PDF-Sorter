import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';

// PDF text extraction service
@Injectable()
export class ExtractionService {
  /**
   * Extract text from a PDF file
   */
  async extractTextFromPdfPath(pdfPath: string): Promise<string> {
    // Read PDF file into buffer
    const dataBuffer = await fs.readFile(pdfPath);

    // Parse PDF and extract text
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(dataBuffer);

    // Normalize whitespace in extracted text
    const normalizedText = data.text.replace(/\s+/g, ' ').trim();

    return normalizedText;
  }
}
