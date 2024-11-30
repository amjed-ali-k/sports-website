import { hc } from "hono/client";
import type { AppType } from "@sports/api";

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

  async createParticipant(data: unknown) {
    const response = await this.client.api.participants.$post({
      json: data,
    });
    return response.json();
  }

  async updateParticipant(id: number, data: unknown) {
    const response = await this.client.api.participants[":id"].$put({
      param: { id: id.toString() },
      json: data,
    });
    return response.json();
  }

  async deleteParticipant(id: number) {
    const response = await this.client.api.participants[":id"].$delete({
      param: { id: id.toString() },
    });
    return response.json();
  }

  // Items
  async getItems() {
    const response = await this.client.api.items.$get();
    return response.json();
  }

  async getItem(id: number) {
    const response = await this.client.api.items[":id"].$get({
      param: { id: id.toString() },
    });
    return response.json();
  }

  async createItem(data: unknown) {
    const response = await this.client.api.items.$post({
      json: data,
    });
    return response.json();
  }

  async updateItem(id: number, data: unknown) {
    const response = await this.client.api.items[":id"].$put({
      param: { id: id.toString() },
      json: data,
    });
    return response.json();
  }

  async deleteItem(id: number) {
    const response = await this.client.api.items[":id"].$delete({
      param: { id: id.toString() },
    });
    return response.json();
  }

  // Registrations
  async getRegistrations() {
    const response = await this.client.api.registrations.$get();
    return response.json();
  }

  async getRegistration(id: number) {
    const response = await this.client.api.registrations[":id"].$get({
      param: { id: id.toString() },
    });
    return response.json();
  }

  async createRegistration(data: unknown) {
    const response = await this.client.api.registrations.$post({
      json: data,
    });
    return response.json();
  }

  async updateRegistration(id: number, data: unknown) {
    const response = await this.client.api.registrations[":id"].$put({
      param: { id: id.toString() },
      json: data,
    });
    return response.json();
  }

  async deleteRegistration(id: number) {
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

  async getResult(id: number) {
    const response = await this.client.api.results[":id"].$get({
      param: { id: id.toString() },
    });
    return response.json();
  }

  async createResult(data: unknown) {
    const response = await this.client.api.results.$post({
      json: data,
    });
    return response.json();
  }

  async updateResult(id: number, data: unknown) {
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
