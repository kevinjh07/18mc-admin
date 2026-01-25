import { Component, Inject, OnInit } from "@angular/core";
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog";
import { MatLegacyTableDataSource as MatTableDataSource } from "@angular/material/legacy-table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Person } from "src/app/core/models/person";
import { EventService } from "src/app/core/services/event/event.service";

@Component({
  selector: "app-poll-participant-dialog",
  templateUrl: "./poll-participant-dialog.component.html",
  styleUrls: ["./poll-participant-dialog.component.css"],
})
export class PollParticipantDialogComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  displayedColumns: string[] = ["shortName"];
  dataSource = new MatTableDataSource<Person>([]);

  constructor(
    private eventService: EventService,
    public dialogRef: MatDialogRef<PollParticipantDialogComponent>,
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
    this.eventService.getParticipants(this.data.pollId).subscribe({
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
