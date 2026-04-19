import { ContentResult, ProductResult } from "./types";

export interface SearchResponse {
  results: ContentResult[];
}

export interface ProductResponse {
  products: ProductResult[];
}

export async function searchContent(
  query: string,
  mode: string,
  file?: File | Blob,
  platform?: string
): Promise<ContentResult[]> {
  const formData = new FormData();
  formData.append("mode", mode);
  formData.append("query", query);
  if (platform) formData.append("platform", platform);
  if (file) formData.append("file", file);

  const res = await fetch("/api/search", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`Search failed: ${res.status}`);

  const data: SearchResponse = await res.json();
  return data.results;
}

export async function investigateProducts(
  imageBlob: Blob,
  query?: string
): Promise<ProductResult[]> {
  const formData = new FormData();
  formData.append("file", imageBlob, "frame.jpg");
  if (query) formData.append("query", query);

  const res = await fetch("/api/products", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`Product search failed: ${res.status}`);

  const data: ProductResponse = await res.json();
  return data.products;
}
