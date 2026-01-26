import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Title } from "@angular/platform-browser";
import { BlockUI, NgBlockUI } from "ng-block-ui";

import { NGXLogger } from "ngx-logger";
import { NotificationService } from "src/app/core/services/notification.service";
import { UserService } from "src/app/core/services/user/user.service";

@Component({
    standalone: false,
  selector: "app-user-list",
  templateUrl: "./user-list.component.html",
  styleUrls: ["./user-list.component.css"],
})
export class UserListComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  displayedColumns: string[] = ["email", "name", "active", "actions"];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatSort, { static: true }) sort: MatSort = new MatSort();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  isSmallScreen: boolean = false;

  constructor(
    private logger: NGXLogger,
    private notificationService: NotificationService,
    private titleService: Title,
    private userService: UserService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.observeScreenSize();
    this.titleService.setTitle("Usuários - 18 Admin");
    this.logger.log("Users loaded");
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.getUsers();
  }

  observeScreenSize(): void {
    this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.XSmall])
      .subscribe((result) => this.updateDisplayedColumns(result.matches));
  }

  updateDisplayedColumns(isSmallScreen: boolean): void {
    this.isSmallScreen = isSmallScreen;
    this.displayedColumns = isSmallScreen
      ? ["email", "active", "actions"]
      : ["email", "name", "active", "actions"];
  }

  getUsers() {
    this.blockUI.start("Aguarde...");
    this.userService.getAll(this.paginator.pageIndex + 1, this.paginator.pageSize).subscribe({
      next: (response: any) => {
        this.blockUI.stop();
        this.dataSource.data = response?.data || [];
        setTimeout(() => {
          this.paginator.length = response?.totalItems;
          this.paginator.pageIndex = response?.currentPage - 1;
        }, 100);
      },
      error: (e) => {
        this.blockUI.stop();
        this.logger.error(e);
        this.notificationService.openSnackBar("Erro ao carregar lista de usuários");
      },
    });
  }
}

