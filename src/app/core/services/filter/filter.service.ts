import { Injectable } from "@angular/core";
import { NGXLogger } from "ngx-logger";
import { Filter } from "../../models/filter";

@Injectable({
  providedIn: "root",
})
@Injectable({
  providedIn: "root",
})
export class FilterService {
  private filter: Filter;

  constructor(private logger: NGXLogger) {
    this.loadFilter();
  }

  private loadFilter(): void {
    try {
      const storedFilters = localStorage.getItem("filters");
      if (storedFilters) {
        this.filter = { ...new Filter(), ...JSON.parse(storedFilters) };
      } else {
        this.filter = new Filter();
      }
    } catch (error) {
      this.logger.error("Erro ao carregar os filtros do localStorage:", error);
      this.filter = new Filter();
    }
  }

  getFilter(): Filter {
    return this.filter;
  }

  updateFilter(newFilter: Partial<Filter>): void {
    this.filter = { ...this.filter, ...newFilter };
    localStorage.setItem("filters", JSON.stringify(this.filter));
  }

  clear() {
    localStorage.removeItem("filters");
    this.filter = new Filter();
  }
}
