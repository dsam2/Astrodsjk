# E2E Test Infra: AstroDSJK

## Test Philosophy
- Opaque-box, requirement-driven testing.
- Methodology: Category-Partition + BVA (Boundary Value Analysis) + Pairwise Combinatorial + Real-World Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 (Feature) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) | Tier 4 (Real-World) |
|---|---|---|:---:|:---:|:---:|:---:|
| F1 | Offline Ephemeris Engine | R1 & Acceptance Criteria 1 | 5 | 5 | ✓ | ✓ |
| F2 | Shodasha Vargas (D1-D60) | R1 | 5 | 5 | ✓ | ✓ |
| F3 | Vector SVG Chart Renderer | R2 & Acceptance Criteria 2 | 5 | 5 | ✓ | ✓ |
| F4 | Panchang Computation Engine | R3 & Acceptance Criteria 3 | 5 | 5 | ✓ | ✓ |
| F5 | Vimshottari Dasha Engine | R3 & Acceptance Criteria 3 | 5 | 5 | ✓ | ✓ |
| F6 | Ashta Kuta Gun Milan | R4 & Acceptance Criteria 4 | 5 | 5 | ✓ | ✓ |
| F7 | Manglik Dosha Synastry | R4 | 5 | 5 | ✓ | ✓ |
| F8 | PDF Report & Print Export | Acceptance Criteria 5 | 5 | 5 | ✓ | ✓ |

## Minimum Coverage Thresholds
- **Tier 1 (Feature Coverage)**: 5 tests per feature = 40 test cases
- **Tier 2 (Boundary & Corner Cases)**: 5 tests per feature = 40 test cases
- **Tier 3 (Cross-Feature Combinations)**: 15 pairwise interaction test cases
- **Tier 4 (Real-World Application Scenarios)**: 8 multi-feature birth chart scenarios
- **Total Suite Minimum**: 103 test cases

## Real-World Application Scenarios (Tier 4)
1. **Historic Benchmark Chart 1**: J2000.0 epoch (2000-01-01 12:00 UTC New Delhi) vs standard ephemeris benchmarks.
2. **Historic Benchmark Chart 2**: Modern birth dataset (1985-05-15 08:30 IST Mumbai).
3. **Corner Case Chart 1**: Midnight transition (23:59:59 to 00:00:01).
4. **Corner Case Chart 2**: High latitude location (Anchorage, Alaska).
5. **Corner Case Chart 3**: Southern Hemisphere location (Sydney, Australia).
6. **Synastry Scenario 1**: High Gun Milan match score (>28 points) with no Manglik Dosha.
7. **Synastry Scenario 2**: Low Gun Milan match score (<18 points) with Nadi Dosha.
8. **Synastry Scenario 3**: Single Manglik Dosha with Manglik Cancellation (Bhanga).

## Test Runner Setup
- Automated Node test runner: `node tests/e2e_runner.js`
- Exit code 0 on 100% pass.
