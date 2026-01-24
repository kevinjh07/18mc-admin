import { EventType } from "./event-type";

export class Event {
  id: number;
  eventType: EventType;
  title: string;
  date: any;
  description: string;
  regionalId: number;
  divisionId: number;
  personIds: number[];
  actionType: string;

  constructor() {
    this.description = "";
    this.personIds = [];
  }
}
