import {
  DIDResolutionResult,
  DIDResolver,
  DIDDocument,
  DIDResolutionMetadata,
  DIDDocumentMetadata,
  ParsedDID,
} from "did-resolver"

export function getResolver(url: string): Record<string, DIDResolver> {
  async function resolve(
    did: string,
    parsed: ParsedDID,
  ): Promise<DIDResolutionResult> {
    let didUri = did
    let didDocument: DIDDocument | null = null
    let didDocumentMetadata: DIDDocumentMetadata = {}
    let didResolutionMetadata: DIDResolutionMetadata = {}

    if (parsed.query) {
      // verify query parameters
      // see https://www.w3.org/TR/did-core/#did-parameters
      const allowedQueryParams: string[] = [
        "service",
        "relativeRef",
        "versionId",
        "versionTime",
        "hl",
      ]
      const searchParams = new URLSearchParams(parsed.query)
      for (const key of searchParams.keys()) {
        if (!allowedQueryParams.includes(key)) {
          return getResolutionError(
            "invalidDidUrl",
            `Invalid DID URL query parameter: ${key}`,
          )
        }
      }

      didUri = `${did}?${parsed.query}`
    }

    try {
      const response = await fetch(`${url}/1.0/identifiers/${didUri}`)
      const result = (await response.json()) as DIDResolutionResult
      didDocument = result.didDocument
      didDocumentMetadata = result.didDocumentMetadata
      didResolutionMetadata = result.didResolutionMetadata

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
      didResolutionMetadata: { ...didResolutionMetadata, contentType },
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
