import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { CountryReports } from 'countryReports';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { CovidService } from 'covid.service';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import * as pdfMake from 'pdfmake/build/pdfmake';
//import 'pdfmake/build/vfs_fonts';
//import * as pdfFonts from 'pdfmake/build/vfs_fonts';
//pdfMake.vfs = pdfFonts.pdfMake.vfs;
import 'pdfmake-unicode/dist/pdfmake-unicode.js';

import { CdkDragDrop, CdkDragStart, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSelect } from '@angular/material/select';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
// import * as Plotly from 'plotly.js-dist';




@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit,AfterViewInit{
  

  ELEMENT_DATA: CountryReports[] = [];
  selectedCell: { row: CountryReports, column: string } | null = null;//keyboard navigations
  displayedColumns: string[] = ['select', 'country', 'continent', 'cases', 'deaths', 'recovered', 'active', 'critical','casesPerOneMillion','deathsPerOneMillion', 'population','actions','overlay','freeze','detail'];
  dataSource = new MatTableDataSource<CountryReports>(this.ELEMENT_DATA);
  clickedRows = new Set<CountryReports>();
  selection = new SelectionModel<CountryReports>(true, []); 
  editingData: { [rowIndex: number]: { [field: string]: any } } = {};// Variable to store the editing data
  showSummary: boolean = false;//summary
  selectedDate: Date = new Date();//date picker
  minRange!: number;//range selection
  maxRange!: number;
  filteredData: CountryReports[] = [];
  showRange: boolean=false;
  isToolPanelOpen = false;//Tool Pannel
  selectedRow: CountryReports | null = null;//row detail view
  column:any;
  frozenRows: Set<CountryReports> = new Set<CountryReports>();// freezing rows
  filteredDate!: Date;//Date filter
 
 
  selectedCountry: CountryReports | null = null;
  filteredDataSource!: any[];
  plotlyService: any;


  

  selectCountry(country: CountryReports) {
    this.selectedCountry = country;
  }
 
  
 toggleRange() {
  this.showRange = !this.showRange;
}

  //Data Summaries
  summary: {
    totalCases: number;
    totalDeaths: number;
    totalRecovered: number;
    totalActive: number;
  } = {
      totalCases: 0,
      totalDeaths: 0,
      totalRecovered: 0,
      totalActive: 0
    };
 
  
  calculateSummary(): void {
    const data = this.dataSource.filteredData;
    this.summary.totalCases = data.reduce((total, row) => total + row.cases, 0);
    this.summary.totalDeaths = data.reduce((total, row) => total + row.deaths, 0);
    this.summary.totalRecovered = data.reduce((total, row) => total + row.recovered, 0);
    this.summary.totalActive = data.reduce((total, row) => total + row.active, 0);
  }
  toggleSummary() {
    this.showSummary = !this.showSummary;
  }


  // to add new record
  newRecord: any = {};

  @ViewChild(MatPaginator, { static: true })
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort: MatSort = new MatSort;
  @ViewChild('table', { static: true })
  table!: ElementRef<HTMLTableElement>;
  @ViewChild(MatDatepicker) datepicker!: MatDatepicker<Date>;
  @ViewChild('actionsMenu') actionsMenu!: MatMenu;
  @ViewChild('continentFilterMenu')
  continentFilterMenu!: TemplateRef<any>;
  @ViewChild('continentSelect', { static: true }) continentSelect!: MatSelect;
  @ViewChild('input', { static: false }) input!: ElementRef;

  @ViewChild('recordFormTemplate')
  recordFormTemplate!: TemplateRef<any>;
 

  constructor(private service: CovidService, private snackBar: MatSnackBar,private formBuilder: FormBuilder,private changeDetectorRef: ChangeDetectorRef,private renderer: Renderer2,public dialog: MatDialog) { 

  }
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.getAllReports();
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      this.recentSearches = JSON.parse(savedSearches);
    }
  }

  // to display all records
  public getAllReports() {
    let resp = this.service.covid19Reports();
    resp.subscribe(report => {
      this.dataSource.data = report as CountryReports[];
      this.selection.clear();
      this.calculateSummary(); // Recalculate summary
      
    });
  }

  // Quick Filter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.calculateSummary(); // Recalculate summary

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  selectedRowCount = 0;
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.dataSource.data);
    }
    this.selectedRowCount = this.selection.selected.length;
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: CountryReports): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row['position'] + 1}`;
  }

/** Toggle row selection on click */
toggleRow(row: CountryReports) {
  this.selection.toggle(row);

  if (this.selection.isSelected(row)) {
    this.clickedRows.add(row);
  } else {
    this.clickedRows.delete(row);
  }
  this.selectedRowCount = this.selection.selected.length;
}
// for keyboard functions
@HostListener('document:keydown', ['$event'])
handleKeyboardEvent(event: KeyboardEvent) {
  const selectedRowIndex = this.dataSource.data.indexOf(this.selection.selected[0]);
  const selectedColumnIndex = this.displayedColumns.indexOf(this.selectedCell?.column || '');

  if (event.key === 'ArrowUp') {
    if (selectedRowIndex > 0) {
      this.selection.clear();
      this.selection.select(this.dataSource.data[selectedRowIndex - 1]);
      this.selectedCell = { row: this.dataSource.data[selectedRowIndex - 1], column: this.selectedCell?.column || '' };
    }
  } else if (event.key === 'ArrowDown') {
    if (selectedRowIndex < this.dataSource.data.length - 1) {
      this.selection.clear();
      this.selection.select(this.dataSource.data[selectedRowIndex + 1]);
      this.selectedCell = { row: this.dataSource.data[selectedRowIndex + 1], column: this.selectedCell?.column || '' };
    }
  } else if (event.key === 'ArrowLeft') {
    if (selectedColumnIndex > 0) {
      this.selectedCell = { row: this.selectedCell?.row || this.selection.selected[0], column: this.displayedColumns[selectedColumnIndex - 1] };
    }
  } else if (event.key === 'ArrowRight') {
    if (selectedColumnIndex < this.displayedColumns.length - 1) {
      this.selectedCell = { row: this.selectedCell?.row || this.selection.selected[0], column: this.displayedColumns[selectedColumnIndex + 1] };
    }
  }
}

 // Add operation
 addRecord() {
  // Add the new record to the data source
  this.dataSource.data = [...this.dataSource.data, this.newRecord];
  this.dataSource._updateChangeSubscription(); // Notify the table of the change

  // Clear the form and newRecord object
  this.newRecord = {
    country: '',
    continent: '',
    cases: 0,
    deaths: 0,
    recovered: 0,
    active: 0,
    casesPerOneMillion: 0,
    deathsPerOneMillion: 0,
    tests: 0,
    testsPerOneMillion: 0,
    todayCases: 0,
    todayDeaths: '',
    critical: '',
    population:0,
  };
}

  // Delete operation
  deleteRecord(row: CountryReports) {
    if (this.frozenRows.has(row)) {
      return; // Do nothing if the row is frozen
    }
   
    // Find the index of the record to be deleted
    const index = this.dataSource.data.indexOf(row);

    if (index !== -1) {
      // Remove the record from the data source
      this.dataSource.data.splice(index, 1);
      this.dataSource._updateChangeSubscription(); // Notify the table of the change

      // Deselect the deleted row if it was selected
      if (this.selection.isSelected(row)) {
        this.selection.deselect(row);
      }
    }

  }



// Function to start editing a cell
startEditing(element: CountryReports, rowIndex: number, field: string) {
  if (this.frozenRows.has(element)) {
    return; // Do nothing if the row is frozen
  }

  this.editingData[rowIndex] = { ...element, field };
}



// Function to stop editing a cell
stopEditing(rowIndex: number, field: string) {

  if (this.isEditing(rowIndex, field)) {
    const editedValue = this.editingData[rowIndex][field];

    // Update the edited value in the dataSource
    const editedRow = this.dataSource.data[rowIndex];
    editedRow[field] = editedValue;

    // Trigger change detection to update the view
    this.dataSource.data = [...this.dataSource.data];

    delete this.editingData[rowIndex][field];
  }
}

// Function to check if a cell is in editing mode
isEditing(rowIndex: number, field: string): boolean {
  return this.editingData[rowIndex]?.[field] !== undefined;
}

exportToCSV() {
  const data = this.dataSource.data;
  const header = this.displayedColumns.map((column) => column.toUpperCase());
  const csvData = [
    header,
    ...data.map((row) => this.displayedColumns.map((column) => row[column])),
  ];

  const csvContent = this.arrayToCSV(csvData);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, 'data.csv');
}

exportToExcel() {
  const data = this.dataSource.data;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'data.xlsx');
}

// exportToPDF() {
//   const data = this.dataSource.data;
//   const header = this.displayedColumns.map((column) => column.toUpperCase());
//   const pdfData = [
//     header,
//     ...data.map((row) => this.displayedColumns.map((column) => row[column])),
//   ];

//   const docDefinition = {
//     content: [
//       {
//         table: {
//           headerRows: 1,
//           body: pdfData,
//         },
//         layout: 'lightHorizontalLines', // Set desired table layout
//       },
//     ],
//   };

//   // Generate the PDF document
//   const pdfDocGenerator = pdfMake.createPdf(docDefinition);
  
//   // Download the PDF file
//   pdfDocGenerator.download('data.pdf');
// }

arrayToCSV(array: any[][]): string {
  return array.map((row) => row.map((cell) => this.wrapInQuotes(cell)).join(',')).join('\n');
}

wrapInQuotes(value: any): string {
  if (typeof value === 'string') {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

onRowDrop(event: CdkDragDrop<CountryReports[]>) {
  if (event.previousIndex !== event.currentIndex) {
    const draggedItem = this.dataSource.data[event.previousIndex];
    this.dataSource.data.splice(event.previousIndex, 1);
    this.dataSource.data.splice(event.currentIndex, 0, draggedItem);
    this.dataSource.data = [...this.dataSource.data]; // Update the data source to trigger change detection
  }
}


//Summary
copySummaryToClipboard() {
  const formattedDate = this.selectedDate.toLocaleDateString();
  const summaryText = `Date: ${formattedDate}\nTotal Cases: ${this.summary.totalCases}\nTotal Deaths: ${this.summary.totalDeaths}\nTotal Recovered: ${this.summary.totalRecovered}\nTotal Active: ${this.summary.totalActive}`;

  this.copyTextToClipboard(summaryText);
  this.showSnackBar('Summary copied to clipboard');
}

copyTextToClipboard(text: string) {
  const textField = document.createElement('textarea');
  textField.innerText = text;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand('copy');
  textField.remove();
}

showSnackBar(message: string) {
  this.snackBar.open(message, 'Close', {
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom'
  });
}



filterByRange() {
  if (this.minRange !== null && this.maxRange !== null) {
    this.filteredData = this.dataSource.data.filter((element) =>
      element.cases >= this.minRange && element.cases <= this.maxRange
    );
  } else {
    this.filteredData = [];
  }
}

// Tool Panel
toggleToolPanel() {
  this.isToolPanelOpen = !this.isToolPanelOpen;
}

//pivot
  
  toggleColumnVisibility = false;
  showCountryColumn = true;
  showContinentColumn = true;
  showCasesColumn =true;
  showDeathsColumn =true;
  showRecoveredColumn=true;
  showActiveColumn=true
  showCriticalColumn=true;
  showPopulationColumn=true;

  applyColumnVisibility() {
    // Filter the displayed columns based on the checkbox values
    this.displayedColumns = ['select']; // Always include the 'select' column
    if (this.toggleColumnVisibility) {
    if (this.showCountryColumn) {
      this.displayedColumns.push('country');
    }
    if (this.showContinentColumn) {
      this.displayedColumns.push('continent');
    }
    if (this.showCasesColumn) {
      this.displayedColumns.push('cases');
    }
    if (this.showDeathsColumn) {
      this.displayedColumns.push('deaths');
    }
    if (this.showRecoveredColumn) {
      this.displayedColumns.push('recovered');
    }
    if (this.showActiveColumn) {
      this.displayedColumns.push('active');
    }
    if (this.showCriticalColumn) {
      this.displayedColumns.push('critical');
    }
    if (this.showPopulationColumn) {
      this.displayedColumns.push('population');
    }
    }
    // Update the table's displayed columns
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
//Row detail View

toggleRowDetail(row: CountryReports) {
  if (this.selectedRow === row) {
    this.selectedRow = null;
  } else {
    this.selectedRow = row;
  }
}

isRowDetailVisible(row: any): boolean {
  return this.selectedRow === row && row.summary !== null;
}

//overlay function
showOverlay(row: any) {
  row.showOverlay = true;
}

hideOverlay(row: any) {
  row.showOverlay = false;
}
//Column Filter
filterVisibility: { [key: string]: boolean } = {};
isFiltered: boolean = false;
filteredValue: any;

applyCFilter(event: Event, columnName: string) {
  const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
  this.dataSource.filterPredicate = (data: CountryReports, filter: string) => {
    const value = data[columnName].toString().toLowerCase();
    this.isFiltered = filterValue !== '';
    this.filteredValue = filterValue;
    return value.includes(filter);

  };
  this.dataSource.filter = filterValue;
}
toggleFilter(column: string): void {
  this.filterVisibility[column] = !this.filterVisibility[column];
}

isFilterVisible(column: string): boolean {
  return this.filterVisibility[column];
}

// Add comment to a cell
addComment(row: CountryReports, column: string) {
  const comment = prompt('Enter your comment:');
  if (comment !== null) {
    row.comment = comment;
  }
}

// Show comment when hovering over the cell
showComment(row: CountryReports) {
  row['showComment'] = true;
}

// Hide comment when moving away from the cell
hideComment(row: CountryReports) {
  row['showComment'] = false;
}
//cell style
addHoverClass(element: any) {
  element.classList.add('hovered-cell');
}

removeHoverClass(element: any) {
  element.classList.remove('hovered-cell');
}


//Freezing rows
toggleRowSelection(row: CountryReports) {
  if (!this.frozenRows.has(row)) {
    this.selection.toggle(row);

    if (this.selection.isSelected(row)) {
      this.clickedRows.add(row);
    } else {
      this.clickedRows.delete(row);
    }
  }
}


toggleFreezeRow(row: CountryReports) {
  if (this.frozenRows.has(row)) {
    this.frozenRows.delete(row);
  } else {
    this.frozenRows.add(row);
  }
}

 //Date Filter
 applyDateFilter() {
  if (this.filteredDate) {
    this.dataSource.filter = this.filteredDate.toISOString();
  } else {
    this.dataSource.filter = '';
  }
}
//Row Groupimg
togglePopulation(element: CountryReports) {
  element['showPopulation'] = !element['showPopulation'];
}
toggleContinent(element: CountryReports){
  element['showContinent'] = !element['showContinent'];
}

//Column Moving

drop(event: CdkDragDrop<string[]>) {
  moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
}

//Recent Searches
  recentSearches: string[] = [];
  highlightedSearch: string = '';
  saveRecentSearch() {
    const inputValue = this.input.nativeElement.value.trim();
    if (inputValue) {
      this.recentSearches = this.recentSearches.filter(search => search !== inputValue); // Remove duplicates
      this.recentSearches.unshift(inputValue); // Add the latest search at the beginning of the array
      if (this.recentSearches.length > 6) {
        this.recentSearches = this.recentSearches.slice(0, 6); // Keep only the latest 6 searches
      }
      localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
      this.input.nativeElement.value = ''; // Clear the input field after saving
    }
  }

  filterBySearch(search: string) {
    this.highlightedSearch = search;
    this.dataSource.filter = search.trim().toLowerCase();
    this.calculateSummary(); // Recalculate summary
  
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  deleteRecentSearch(search: string) {
    this.recentSearches = this.recentSearches.filter(s => s !== search);
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }
  showRecentSearches: boolean = false;
  toggleRecentSearches() {
    this.showRecentSearches = !this.showRecentSearches;
  }

  // predefinedButtons = ['Asia','Africa','Europe', 'North America', 'South America', 'Oceania','Australia-Oceania'];
  // filteredPredefinedButtons = this.predefinedButtons.slice(); // Initially, all predefined buttons are shown.
  // selectedButton: string | null = null;
  // filterSearch(search: string) {
  //   // If the same button is clicked again, deselect it.
  //   if (this.selectedButton === search) {
  //     this.selectedButton = null;
  //     this.dataSource.filter = '';
  //   } else {
  //     this.selectedButton = search; // Highlight the clicked button
  //     this.dataSource.filter = search.trim().toLowerCase();
  //   }
  
  //   this.calculateSummary(); // Recalculate summary
  
  //   if (this.dataSource.paginator) {
  //     this.dataSource.paginator.firstPage();
  //   }
  // }

  // predefinedButtonss = ['Afghanistan','Albania','Algeria', 'Andorra', 'Angola', 'Germany','India'];
  // filteredPredefinedButtonss = this.predefinedButtonss.slice(); // Initially, all predefined buttons are shown.
  // selectedButtons: string | null = null;
  // filterSSearch(search: string) {
  //   // If the same button is clicked again, deselect it.
  //   if (this.selectedButtons === search) {
  //     this.selectedButtons = null;
  //     this.dataSource.filter = '';
  //   } else {
  //     this.selectedButtons = search; // Highlight the clicked button
  //     this.dataSource.filter = search.trim().toLowerCase();
  //   }
  
  //   this.calculateSummary(); // Recalculate summary
  
  //   if (this.dataSource.paginator) {
  //     this.dataSource.paginator.firstPage();
  //   }
  // }

//Color picking

// Default colors
defaultColor: string = '#DA70D6';
defaultButtonColor: string = '#000000';
defaultColumnColor: string = '#FFA07A';
defaultGroupColor: string = '#9fb8b1';

// Selected colors
selectedColor: string = this.defaultColor;
selectedButtonColor: string = this.defaultButtonColor;
selectedColumnColor: string = this.defaultColumnColor;
selectedGroupColor: string = this.defaultGroupColor;

applyColors() {
  // Apply the selected colors to the respective variables
  this.defaultColor = this.selectedColor;
  this.defaultButtonColor = this.selectedButtonColor;
  this.defaultColumnColor = this.selectedColumnColor;
  this.defaultGroupColor = this.selectedGroupColor;
}

cancelChanges() {
  // Revert back to the default colors
  this.selectedColor = this.defaultColor;
  this.selectedButtonColor = this.defaultButtonColor;
  this.selectedColumnColor = this.defaultColumnColor;
  this.selectedGroupColor = this.defaultGroupColor;
}

applyColor(type: string) {
  switch (type) {
    case 'heading':
      this.selectedColor = this.defaultColor;
      break;
    case 'button':
      this.selectedButtonColor = this.defaultButtonColor;
      break;
    case 'column':
      this.selectedColumnColor = this.defaultColumnColor;
      break;
    case 'group':
      this.selectedGroupColor = this.defaultGroupColor;
      break;
    default:
      break;
  }
}

//Steeper and popup form
openRecordFormDialog(): void {
  const dialogRef = this.dialog.open(this.recordFormTemplate, {
    width: '800px', // Adjust the width as needed
  });

  dialogRef.afterClosed().subscribe(result => {
    // Handle any actions after the dialog is closed (if needed)
  });
}

}



