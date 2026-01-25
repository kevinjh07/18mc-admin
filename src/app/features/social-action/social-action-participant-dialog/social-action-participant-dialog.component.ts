import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Person } from "src/app/core/models/person";
import { EventService } from "src/app/core/services/event/event.service";

@Component({
    standalone: false,
  selector: "app-social-action-participant-dialog",
  templateUrl: "./social-action-participant-dialog.component.html",
  styleUrls: ["./social-action-participant-dialog.component.css"],
})
export class SocialActionParticipantDialogComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  displayedColumns: string[] = ["shortName"];
  dataSource = new MatTableDataSource<Person>([]);

  constructor(
    private socialActionService: EventService,
    public dialogRef: MatDialogRef<SocialActionParticipantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.getParticipants();
    }, 0);
  }

  getParticipants() {
    this.blockUI.start("Aguarde...");
    this.socialActionService.getParticipants(this.data.socialActionId).subscribe({
      next: (response: any) => {
        this.blockUI.stop();
        this.dataSource = response || [];
      },
      error: (e) => {
        this.blockUI.stop();
      },
    });
  }
}

