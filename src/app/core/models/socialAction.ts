export class SocialAction {
  id: number;
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
