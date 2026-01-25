import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Title } from "@angular/platform-browser";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { NGXLogger } from "ngx-logger";
import { ClassService } from "src/app/core/services/class/class.service";
import { NotificationService } from "src/app/core/services/notification.service";

@Component({
    standalone: false,
  selector: "app-class-list",
  templateUrl: "./class-list.component.html",
  styleUrls: ["./class-list.component.css"],
})
export class ClassListComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  displayedColumns: string[] = ["name", "actions"];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatSort, { static: true }) sort: MatSort = new MatSort();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private logger: NGXLogger,
    private notificationService: NotificationService,
    private titleService: Title,
    private classService: ClassService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle("Modalidades");
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.sort.active = "name";
    this.sort.direction = "asc";
    this.dataSource.sort = this.sort;
    this.getClasses();
  }

  getClasses() {
    this.blockUI.start("Aguarde...");
    this.classService
      .getAll(this.paginator.pageIndex, this.paginator.pageSize, this.sort.active, this.sort.direction.toUpperCase())
      .subscribe({
        next: (response: any) => {
          this.blockUI.stop();
          this.dataSource.data = response?.content || [];

          setTimeout(() => {
            this.paginator.length = response?.totalElements;
            this.paginator.pageIndex = response?.number;
            this.paginator.pageSize = response?.size;
          }, 100);
        },
        error: (e) => {
          this.blockUI.stop();
          this.logger.error(e);
          this.notificationService.openSnackBar("Erro ao carregar lista de modalidades");
        },
      });
  }
}

