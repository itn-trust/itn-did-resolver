# ITN DID Resolver

This library is intended to use ITN fully self-managed Decentralized Identifiers and wrap them in a DID Document

It supports the proposed [Decentralized Identifiers](https://w3c-ccg.github.io/did-spec/) spec
from the [W3C Credentials Community Group](https://w3c-ccg.github.io/).

It requires the [DID Resolver](https://github.com/decentralized-identity/did-resolver) library,
which is the primary interface for resolving DIDs.

## DID method

The `did:itn` method links the identifier cryptographically to the DID Document
and through also cryptographically linked provenance information in a Distributed Ledger
it ensures resolving to the latest valid version of the DID Document.

## DID Document

The DID resolver takes the DID and makes http query to ITN Resolver server.
The ITN Resolver server looks for requested DID in ITN CAS,
proves DID Document validity from ITN Distributed Ledger
and returns resolved DID Document to DID Resolver.

A minimal DID Document might contain the following information:

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1"
  ],
  "id": "did:itn:5bFQ34F7kLe2bVzWP7te1j",
  "assertionMethod": [
    "did:itn:5bFQ34F7kLe2bVzWP7te1j#c4e60db9161a36efeb0b866c3503ec3c5b429bd156dd7b30c64bea8efb54cf35"
  ],
  "authentication": [
    "did:itn:5bFQ34F7kLe2bVzWP7te1j#c4e60db9161a36efeb0b866c3503ec3c5b429bd156dd7b30c64bea8efb54cf35"
  ],
  "keyAgreement": [
    {
      "id": "did:itn:5bFQ34F7kLe2bVzWP7te1j#5e367434275dd5f4d6a0eeb2b5a22710b588288fa5ec165e2bdb9a8e7b6e176c",
      "type": "X25519KeyAgreementKey2019",
      "controller": "did:itn:5bFQ34F7kLe2bVzWP7te1j",
      "publicKeyBase58": "Hz1Vip4r2MNFFkW7TLQvLLKjK3AnfSNNBypmvUvvSbcc"
    }
  ],
  "verificationMethod": [
    {
      "id": "did:itn:5bFQ34F7kLe2bVzWP7te1j#c4e60db9161a36efeb0b866c3503ec3c5b429bd156dd7b30c64bea8efb54cf35",
      "type": "Ed25519VerificationKey2018",
      "controller": "did:itn:5bFQ34F7kLe2bVzWP7te1j",
      "publicKeyBase58": "BPJgF3sz49umG4JrAR2Um7juqVfAUDqTLGjRYmV3oDxe"
    }
  ]
}
```

## Resolving a DID document

The resolver presents a simple `resolver()` function that returns a ES6 Promise returning the DID document.

```typescript
import { Resolver } from 'did-resolver'
import { getResolver } from 'itn-did-resolver'

// getResolver() accepts a DID Resolver server url
const itnResolver = getResolver("https://resolver.itn.mobi")

const didResolver = new Resolver({
    ...itnResolver
    //...you can flatten multiple resolver methods into the Resolver
})

didResolver.resolve('did:itn:881ZoZaRvZ66N1GrSenVKc').then(doc => console.log(doc))

// You can also use ES7 async/await syntax
;(async () => {
    const doc = await didResolver.resolve('did:itn:881ZoZaRvZ66N1GrSenVKc')
    console.log(doc)
})();
```
