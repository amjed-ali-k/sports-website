import { hc } from "hono/client";
import type { AppType } from "@sports/api";
import {
  Participant,
  Item,
  Category,
  Result,
  Registration,
} from "@sports/api/dist/src/types";

export const bareApiClient = hc<AppType>(import.meta.env.VITE_API_URL, {
  headers: {
    "X-API-Key": import.meta.env.VITE_API_KEY!,
  },
});

class ApiClient {
  private client: ReturnType<typeof hc<AppType>>;

  constructor() {
    this.client = hc<AppType>(import.meta.env.VITE_API_URL, {
      headers: this.getAuthHeaders,
    });
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("sports_admin_token");
    return token
      ? ({
          Authorization: `Bearer ${token}`,
          "X-API-Key": import.meta.env.VITE_API_KEY!,
        } as const)
      : ({
          "X-API-Key": import.meta.env.VITE_API_KEY!,
        } as const);
  }
  // Participants
  async getParticipants() {
    const response = await this.client.api.participants.$get({});
    return response.json();
  }

  async getParticipant(id: number) {
    const response = await this.client.api.participants[":id"].$get({
      param: { id: id.toString() },
    });
    return response.json();
  }

  async createParticipant(
    data: Omit<Participant, "id" | "chestNo" | "createdAt" | "updatedAt">
  ) {
    const response = await this.client.api.participants.$post({
      json: data,
    });
    return response.json();
  }

  async updateParticipant(
    id: number,
    data: Omit<Participant, "id" | "chestNo" | "createdAt" | "updatedAt">
  ) {
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
    const response = await this.client.api.items.$get({});
    return response.json();
  }

  async getItem(id: number) {
    const response = await this.client.api.items[":id"].$get({
      param: { id: id.toString() },
    });
    return response.json();
  }

  async createItem(
    data: Omit<Item, "id" | "createdAt" | "updatedAt"> & {
      maxParticipants: number;
    }
  ) {
    const response = await this.client.api.items.$post({
      json: data,
    });
    return response.json();
  }

  async updateItem(
    id: number,
    data: Omit<Item, "id" | "createdAt" | "updatedAt">
  ) {
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

  // Categories
  async getCategories() {
    const response = await this.client.api.categories.$get({});
    return response.json();
  }

  async getCategory(id: number) {
    const response = await this.client.api.categories[":id"].$get({
      param: { id: id.toString() },
    });
    return response.json();
  }

  async createCategory(data: Omit<Category, "id" | "createdAt" | "updatedAt">) {
    const response = await this.client.api.categories.$post({
      json: data,
    });
    return response.json();
  }

  // Registrations
  async getRegistrations() {
    const response = await this.client.api.registrations.$get({});
    return response.json();
  }

  async getRegistration(id: number) {
    const response = await this.client.api.registrations[":id"].$get({
      param: { id: id.toString() },
    });
    return response.json();
  }

  async createRegistration(
    data: Omit<Registration, "id" | "createdAt" | "updatedAt">
  ) {
    const response = await this.client.api.registrations.$post({
      json: data,
    });
    return response.json();
  }

  async updateRegistration(
    id: number,
    data: Omit<Registration, "id" | "createdAt" | "updatedAt"> & {
      status: "registered" | "participated" | "not_participated";
    }
  ) {
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
    const response = await this.client.api.results.$get({});
    return response.json();
  }

  async getResult(itemId: number) {
    const response = await this.client.api.results.item[":itemId"].$get({
      param: { itemId: itemId.toString() },
    });
    return response.json();
  }

  async createResult(data: Omit<Result, "id" | "createdAt" | "updatedAt" | "points">) {
    const response = await this.client.api.results.$post({
      json: data,
    });
    return response.json();
  }

  async updateResult(
    id: number,
    data: Omit<Result, "id" | "createdAt" | "updatedAt">
  ) {
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
    const response = await this.client.api.results.leaderboard.$get({});
    return response.json();
  }

  // Settings
  async getSettings() {
    const response = await this.client.api.settings.$get({});
    return response.json();
  }

  async getSections() {
    const response = await this.client.api.sections.$get({});
    return response.json();
  }

  async addSection(data: { name: string }) {
    const response = await this.client.api.sections.$post({
      json: data,
    });
    return response.json();
  }

  async deleteSection(id: number) {
    const response = await this.client.api.sections[":id"].$delete({
      param: { id: id.toString() },
    });
    return response.json();
  }

  async updateSettings(data: {
    eventName: string;
    eventDate: string;
    registrationEndDate: string;
    maxRegistrationsPerParticipant: string;
    isRegistrationOpen: string;
    isResultsPublished: string;
  }) {
    const response = await this.client.api.settings.$put({
      json: data,
    });
    return response.json();
  }

  async getAdmins() {
    const response = await this.client.api.admins.$get({});
    return response.json();
  }

  async updateAdmin(id: number, data: { role: "rep" | "manager" | "controller" | "super_admin" }) {
    const response = await this.client.api.admins[":id"].$put({
      param: { id: id.toString() },
      json: data,
    });
    return response.json();
  }

  async createAdmin(data: {
    email: string;
    name: string;
    role: "rep" | "manager" | "controller" | "super_admin";
    password: string;
  }) {
    const response = await this.client.api.admins.$post({
      json: data,
    });
    return response.json();
  }

  async deleteAdmin(id: number) {
    const response = await this.client.api.admins[":id"].$delete({
      param: { id: id.toString() },
    });
    return response.json();
  }

  async updateProfile(data: { fullName: string; email: string }) {
    const response = await this.client.auth.profile.$put({
      json: data,
    });
    return response.json();
  }

  async updatePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    const response = await this.client.auth.password.$put({
      json: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
    });
    return response.json();
  }
}

export const apiClient = new ApiClient();
