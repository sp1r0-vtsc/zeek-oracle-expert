# Zero-Knowledge Oracle System: Data Flow Diagram

```mermaid
sequenceDiagram
    participant Expert
    participant EI as Expert Interface
    participant ZKS as ZK Proof Service
    participant BC as Blockchain (Solana)
    participant TS as Trust Scoring Program
    participant OD as Oracle Data Program
    participant ZV as ZK Verification Program
    participant IP as Incentivization Program
    participant CV as Cross-Validators
    participant User

    Expert->>EI: Submit information with evidence
    EI->>ZKS: Generate ZK proof of validity
    ZKS-->>EI: Return generated proof
    
    EI->>BC: Submit data with ZK proof
    BC->>ZV: Verify ZK proof
    ZV-->>BC: Proof verification result
    
    alt Proof Valid
        BC->>OD: Store data with pending status
        BC->>TS: Record submission for trust scoring
        BC->>IP: Lock stake for submission
        
        BC->>CV: Request validation
        CV->>ZKS: Generate validation ZK proofs
        ZKS-->>CV: Return validation proofs
        
        CV->>BC: Submit validation results with proofs
        BC->>ZV: Verify validation proofs
        ZV-->>BC: Validation proof results
        
        BC->>OD: Update validation status
        BC->>TS: Update trust scores
        BC->>IP: Calculate and distribute rewards
        
        User->>BC: Request oracle data
        BC->>OD: Retrieve data with trust scores
        OD-->>User: Return verified data with proofs
    else Proof Invalid
        BC-->>EI: Reject submission
    end
```

This sequence diagram illustrates the data flow through the Zero-Knowledge Oracle System:

1. An expert submits information through the Expert Interface
2. The ZK Proof Service generates a proof of validity without revealing sensitive details
3. The data and proof are submitted to the Solana blockchain
4. The ZK Verification Program validates the proof
5. If valid, the Oracle Data Program stores the data with a pending status
6. Cross-validators are requested to validate the information
7. Validators generate their own ZK proofs of validation
8. The system updates trust scores and validation status based on results
9. Rewards are calculated and distributed according to the incentivization rules
10. Users can request and retrieve oracle data with associated trust scores and proofs
11. If the initial proof is invalid, the submission is rejected

This flow ensures that all information is verified and processed with privacy-preserving mechanisms at every step.
