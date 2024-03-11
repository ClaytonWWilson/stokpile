export function blobToBase64(blob: Blob) {
  return new Promise<string | ArrayBuffer>((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(btoa(reader.result as string));
    reader.readAsBinaryString(blob);
  });
}

export async function gzip(data: string) {
  const cs = new CompressionStream("gzip");
  const blob = new Blob([data]);
  const compressedStream = blob.stream().pipeThrough(cs);
  const gzipData = await new Response(compressedStream).blob();
  return (await blobToBase64(gzipData)) as string;
}

export async function ungzip(base64: string) {
  const b64decoded = atob(base64);

  const arrayBuffer = new ArrayBuffer(b64decoded.length);

  // Create a new Uint8Array from the ArrayBuffer
  const uint8Array = new Uint8Array(arrayBuffer);

  // Copy the binary string to the Uint8Array
  for (let i = 0; i < b64decoded.length; i++) {
    uint8Array[i] = b64decoded.charCodeAt(i);
  }

  const blobgzip = new Blob([uint8Array], {
    type: "application/octet-stream",
  });

  const ds = new DecompressionStream("gzip");
  const decompressedStream = blobgzip.stream().pipeThrough(ds);

  const originalText = await new Response(decompressedStream).text();
  return originalText;
}

export function stringifyInstance(instance: {}) {
  return JSON.stringify(objectifyInstance(instance));
}

export function objectifyInstance(instance: any) {
  let ret: Record<string, any> = {};
  if (typeof instance !== "object") {
    ret[`${typeof instance}`] = instance;
  }

  for (let key in instance) {
    if (typeof instance[key] === "object") {
      ret[key] = objectifyInstance(instance[key]);
    } else if (typeof instance[key] === "function") {
      ret[key] = "function";
    } else {
      ret[key] = instance[key];
    }
  }

  return ret;
}

export function randomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
