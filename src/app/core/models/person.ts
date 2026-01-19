import { Division } from "./division";

export class Person {
  id: number;
  fullName: string;
  shortName: string;
  divisionId: number;
  Division: Division;
  hierarchyLevel: string;
  isActive: boolean;

  constructor() {
    this.isActive = true;
  }
}
