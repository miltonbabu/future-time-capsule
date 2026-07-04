import type { SharedNewspaper } from "../types";
import { saveCapsule, removeCapsule, loadCapsules } from "../storage";
import { makeId } from "../storage";

export interface SaveCapsuleInput {
  capsule: SharedNewspaper;
}

export interface SaveCapsuleOutput {
  capsules: SharedNewspaper[];
}

export interface RemoveCapsuleInput {
  id: string;
}

export interface RemoveCapsuleOutput {
  capsules: SharedNewspaper[];
}

export interface LoadCapsulesOutput {
  capsules: SharedNewspaper[];
}

export interface CreateCapsuleInput {
  input: Omit<SharedNewspaper["input"], "language"> & {
    language: SharedNewspaper["input"]["language"];
  };
  article: SharedNewspaper["article"];
  photoDataUrl?: string;
  imageUrl?: string;
}

export interface CreateCapsuleOutput {
  capsule: SharedNewspaper;
}

export function createCapsule(
  params: CreateCapsuleInput,
): CreateCapsuleOutput {
  const { input, article, photoDataUrl, imageUrl } = params;

  const capsule: SharedNewspaper = {
    id: makeId(),
    input,
    article,
    photoDataUrl,
    imageUrl,
    createdAt: new Date().toISOString(),
  };

  return { capsule };
}

export function persistCapsule(
  params: SaveCapsuleInput,
): SaveCapsuleOutput {
  const { capsule } = params;
  const capsules = saveCapsule(capsule);
  return { capsules };
}

export function deleteCapsule(
  params: RemoveCapsuleInput,
): RemoveCapsuleOutput {
  const { id } = params;
  const capsules = removeCapsule(id);
  return { capsules };
}

export function fetchCapsules(): LoadCapsulesOutput {
  const capsules = loadCapsules();
  return { capsules };
}