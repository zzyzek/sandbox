import ZZN.WinBCD

namespace ZZN.Win

/-- Certificates for the B entries, even class. -/
theorem cert_b_even : ∀ e ∈ BOUNDARY3_EVEN, ∀ A, A ≤ 1 → ∀ fsl ∈ [none, some 0, some 11],
    (fsB e 0 = 1 ∨ fsB e 0 = -1) → (fsl ≠ none → fsB e 0 = 1) →
      certify 6 6 (tmB e A) 0 (some (1 - A, fsB e 0, fsl)) = true := by
  native_decide

end ZZN.Win
