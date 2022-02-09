import { DIDResolutionResult, DIDResolver, DIDDocument } from "did-resolver"
globalThis.fetch = require("node-fetch")

export function getResolver(url: string): Record<string, DIDResolver> {
  async function resolve(did: string): Promise<DIDResolutionResult> {
    let didDocument: DIDDocument | null = null
    let didDocumentMetadata = {}

    try {
      const response = await fetch(`${url}/did/${did}`)
      const result = await response.json()
      didDocument = result.didDoc
      didDocumentMetadata = result.metadata
      if (!didDocument) {
        return getResolutionError(
          "notFound",
          `No matching DID document found for requested DID.`,
        )
      }
    } catch (error) {
      return getResolutionError(
        "notFound",
        `DID must resolve to a valid https URL containing a JSON document: ${error}`,
      )
    }

    const docIdMatchesDid = didDocument?.id === did
    if (!docIdMatchesDid) {
      return getResolutionError(
        "notFound",
        "DID document id does not match requested DID.",
      )
    }

    const contentType =
      typeof didDocument?.["@context"] !== "undefined"
        ? "application/did+ld+json"
        : "application/did+json"

    return {
      didDocument,
      didDocumentMetadata,
      didResolutionMetadata: { contentType },
    }
  }

  function getResolutionError(
    error: string,
    message: string,
  ): DIDResolutionResult {
    return {
      didResolutionMetadata: { error, message },
      didDocument: null,
      didDocumentMetadata: {},
    }
  }

  return { itn: resolve }
}
