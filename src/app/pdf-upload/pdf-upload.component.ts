import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-pdf-upload',
  templateUrl: './pdf-upload.component.html',
  styleUrls: ['./pdf-upload.component.css']
})
export class PdfUploadComponent {

  selectedFile: File | null = null;
  pdfContent: string | null = null;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadPdf() {
    const formData = new FormData();
    formData.append('file', this.selectedFile!);

    this.http.post('http://localhost:8081/api/pdf/upload', formData, { responseType: 'text' }).subscribe(
      (data) => {
        this.pdfContent = data;
      },
      (error) => {
        console.error('Error uploading PDF:', error);
      }
    );
  }
}
