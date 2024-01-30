import { Component, ElementRef, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css']
})
export class NewComponent {


  // jsonData: any[] = [];

  // constructor() { }

  // ngOnInit(): void {
    
  // }

  // onFileSelected(event: any): void {
  //   const file = event.target.files[0];

  //   if (file) {
  //     this.readExcelData(file);
  //   }
  // }

  // readExcelData(file: File): void {
  //   const reader = new FileReader();

  //   reader.onload = (e: any) => {
  //     const binaryData = e.target.result;
  //     const workbook = XLSX.read(binaryData, { type: 'binary' });
  //     const sheetName = workbook.SheetNames[0];
  //     this.jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  //   };

  //   reader.readAsBinaryString(file);
  // }
  
//Excel Upload
selectedFile: File | null = null;
  excelData: string[][] = [];

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadExcel() {
    if (!this.selectedFile) {
      this.showSnackbar('Please select an Excel file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post('http://localhost:8082/api/excel/upload', formData, { responseType: 'json' }).subscribe(
      (data: any) => {
        if ('message' in data) {
          this.showSnackbar(data.message);
        } else {
          this.excelData = data as string[][];
        }
      },
      (error) => {
        console.error('Error uploading Excel:', error);
        this.showSnackbar('An error occurred while processing the Excel file.');
      }
    );
  }

  showSnackbar(message: string) {
    this.snackBar.open(message, 'OK', { duration: 5000 });
  }

}
