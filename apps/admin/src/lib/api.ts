import { hc } from "hono/client";
import { AppType } from "@sports/api";
import type {
  Participant,
  Section,
  Item,
  Category,
  Result,
  Registration,
  LeaderboardEntry,
} from "@sports/api/dist/src/types";

type ErrorType = {
  error: string
}
class ApiClient {
  private client: ReturnType<typeof hc<AppType>>;

  constructor() {
    const baseUrl = import.meta.env.VITE_API_URL;
    this.client = hc<AppType>(baseUrl, {
      headers: {
        "X-API-Key": import.meta.env.VITE_API_KEY,
      },
    });
  }

  // Participants
  async getParticipants() {
    const response = await this.client.api.participants.$get();
    return response.json();
  }

  async getParticipant(id: number) {
    const response = await this.client.api.participants[":id"].$get({
      param: { id: id.toString() },
    });
    return response.json();
  }

  async createParticipant(data: Omit<Participant, "id" | "chestNo" | "createdAt" | "updatedAt">) {
    const response = await this.client.api.participants.$post({
      json: data,
    });
    return response.json();
  }

  async updateParticipant(id: number, data: Omit<Participant, "id" | "chestNo" | "createdAt" | "updatedAt">) {
    const response = await this.client.api.participants[":id"].$put({
      param: { id: id.toString() },
      json: data,
    });
    return response.json();
  }

  async deleteParticipant(id: number): Promise<unknown | ErrorType> {
    const response = await this.client.api.participants[":id"].$delete({
      param: { id: id.toString() },
    });
    return response.json();
  }

  // Items
  async getItems(): Promise<Item[] | ErrorType> {
    const response = await this.client.api.items.$get();
    return response.json();
  }

  async getItem(id: number): Promise<Item | ErrorType> {
    const response = await this.client.api.items[":id"].$get({
      param: { id: id.toString() },
    });
    return response.json();
  }

  async createItem(data: Omit<Item, "id" | "createdAt" | "updatedAt">): Promise<Item | ErrorType> {
    const response = await this.client.api.items.$post({
      json: data,
    });
    return response.json();
  }

  async updateItem(id: number, data: Omit<Item, "id" | "createdAt" | "updatedAt">): Promise<Item | ErrorType> {
    const response = await this.client.api.items[":id"].$put({
      param: { id: id.toString() },
      json: data,
    });
    return response.json();
  }

  async deleteItem(id: number): Promise<unknown | ErrorType> {
    const response = await this.client.api.items[":id"].$delete({
      param: { id: id.toString() },
    });
    return response.json();
  }

  // Categories
  async getCategories(): Promise<Category[] | ErrorType> {
    const response = await this.client.api.categories.$get();
    return response.json();
  }

  async getCategory(id: number): Promise<Category | ErrorType> {
    const response = await this.client.api.categories[":id"].$get({
      param: { id: id.toString() },
    });
    return response.json();
  }

  async createCategory(data: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category | ErrorType> {
    const response = await this.client.api.categories.$post({
      json: data,
    });
    return response.json();
  }

  // Registrations
  async getRegistrations(): Promise<Registration[] | ErrorType> {
    const response = await this.client.api.registrations.$get();
    return response.json();
  }

  async getRegistration(id: number): Promise<Registration | ErrorType> {
    const response = await this.client.api.registrations[":id"].$get({
      param: { id: id.toString() },
    });
    return response.json();
  }

  async createRegistration(data: Omit<Registration, "id" | "createdAt" | "updatedAt">): Promise<Registration | ErrorType> {
    const response = await this.client.api.registrations.$post({
      json: data,
    });
    return response.json();
  }

  async updateRegistration(id: number, data: Omit<Registration, "id" | "createdAt" | "updatedAt">): Promise<Registration | ErrorType> {
    const response = await this.client.api.registrations[":id"].$put({
      param: { id: id.toString() },
      json: data,
    });
    return response.json();
  }

  async deleteRegistration(id: number): Promise<unknown | ErrorType> {
    const response = await this.client.api.registrations[":id"].$delete({
      param: { id: id.toString() },
    });
    return response.json();
  }

  // Results
  async getResults() {
    const response = await this.client.api.results.$get();
    return response.json();
  }

  async getResult(itemId: number) {
    const response = await this.client.api.results.item[":itemId"].$get({
      param: { itemId: itemId.toString() },
    });
    return response.json();
  }

  async createResult(data: Omit<Result, "id" | "createdAt" | "updatedAt">) {
    const response = await this.client.api.results.$post({
      json: data,
    });
    return response.json();
  }

  async updateResult(id: number, data: Omit<Result, "id" | "createdAt" | "updatedAt">) {
    const response = await this.client.api.results[":id"].$put({
      param: { id: id.toString() },
      json: data,
    });
    return response.json();
  }

  async deleteResult(id: number) {
    const response = await this.client.api.results[":id"].$delete({
      param: { id: id.toString() },
    });
    return response.json();
  }

  // Leaderboard
  async getLeaderboard() {
    const response = await this.client.api.results.leaderboard.$get();
    return response.json();
  }
}

export const api = new ApiClient();
